import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCAL_DATA_DIR = path.join(__dirname, '../data/collections');
const TMP_DATA_DIR = path.join(os.tmpdir(), 'devstore_collections');

const isVercel = Boolean(process.env.VERCEL);
const DATA_DIR = isVercel ? TMP_DATA_DIR : LOCAL_DATA_DIR;

// In-memory fallback cache
const memoryStore = new Map();

// Ensure collection directory exists
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('Notice: Read-only filesystem detected for jsonDb, relying on memory cache fallback.');
}

class JsonCollection {
  constructor(collectionName) {
    this.filePath = path.join(DATA_DIR, `${collectionName.toLowerCase()}.json`);
    this.name = collectionName;
  }

  _read() {
    // In Vercel environment, seed /tmp file from repository default collection if available
    if (isVercel && !fs.existsSync(this.filePath)) {
      const seedPath = path.join(LOCAL_DATA_DIR, `${this.name.toLowerCase()}.json`);
      if (fs.existsSync(seedPath)) {
        try {
          const initialContent = fs.readFileSync(seedPath, 'utf-8');
          fs.writeFileSync(this.filePath, initialContent, 'utf-8');
        } catch (e) {
          console.warn(`Vercel /tmp seed notice for ${this.name}:`, e.message);
        }
      }
    }

    if (!fs.existsSync(this.filePath)) {
      return memoryStore.get(this.name) || [];
    }
    try {
      const content = fs.readFileSync(this.filePath, 'utf-8');
      const parsed = JSON.parse(content || '[]');
      memoryStore.set(this.name, parsed);
      return parsed;
    } catch (err) {
      console.error(`Error reading database file: ${this.filePath}`, err);
      return memoryStore.get(this.name) || [];
    }
  }

  _write(data) {
    memoryStore.set(this.name, data);
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.warn(`Filesystem write notice for ${this.name} (using memory state):`, err.message);
    }
  }

  _evaluateMathOperator(docVal, op, filterVal) {
    switch (op) {
      case '$gt': return docVal > filterVal;
      case '$gte': return docVal >= filterVal;
      case '$lt': return docVal < filterVal;
      case '$lte': return docVal <= filterVal;
      case '$ne': return docVal !== filterVal;
      case '$in': return Array.isArray(filterVal) && filterVal.includes(docVal);
      case '$nin': return Array.isArray(filterVal) && !filterVal.includes(docVal);
      case '$regex': {
        const regex = filterVal instanceof RegExp ? filterVal : new RegExp(filterVal, 'i');
        return regex.test(docVal);
      }
      default: return false;
    }
  }

  _matches(doc, filter) {
    if (!filter || Object.keys(filter).length === 0) return true;

    for (const key in filter) {
      const filterValue = filter[key];

      // Handle logic operators $or, $and
      if (key === '$or' && Array.isArray(filterValue)) {
        if (!filterValue.some(subFilter => this._matches(doc, subFilter))) return false;
        continue;
      }
      if (key === '$and' && Array.isArray(filterValue)) {
        if (!filterValue.every(subFilter => this._matches(doc, subFilter))) return false;
        continue;
      }

      // Standard fields mapping
      const docValue = doc[key];

      if (filterValue && typeof filterValue === 'object' && !(filterValue instanceof RegExp) && !Array.isArray(filterValue)) {
        // Query operators like $gt, $in, $regex
        for (const op in filterValue) {
          if (op.startsWith('$')) {
            if (!this._evaluateMathOperator(docValue, op, filterValue[op])) {
              return false;
            }
          } else {
            // Nested object comparison
            if (JSON.stringify(docValue[op]) !== JSON.stringify(filterValue[op])) {
              return false;
            }
          }
        }
      } else if (filterValue instanceof RegExp) {
        if (!filterValue.test(docValue)) return false;
      } else {
        // Direct match
        if (docValue !== filterValue) return false;
      }
    }
    return true;
  }

  async find(filter = {}) {
    const list = this._read();
    let results = list.filter(item => this._matches(item, filter));

    // Support sorting and chain mock
    const chain = {
      data: results,
      sort: (sortObj) => {
        if (!sortObj) return chain;
        const key = Object.keys(sortObj)[0];
        const dir = sortObj[key]; // 1 or -1, or 'asc'/'desc'
        chain.data.sort((a, b) => {
          const valA = a[key];
          const valB = b[key];
          if (valA < valB) return dir === 1 || dir === 'asc' ? -1 : 1;
          if (valA > valB) return dir === 1 || dir === 'asc' ? 1 : -1;
          return 0;
        });
        return chain;
      },
      limit: (num) => {
        if (num) chain.data = chain.data.slice(0, num);
        return chain;
      },
      skip: (num) => {
        if (num) chain.data = chain.data.slice(num);
        return chain;
      },
      exec: async () => chain.data,
      then: (resolve) => resolve(chain.data)
    };

    return chain;
  }

  async findOne(filter = {}) {
    const list = this._read();
    return list.find(item => this._matches(item, filter)) || null;
  }

  async findById(id) {
    if (!id) return null;
    const list = this._read();
    const idStr = id.toString();
    return list.find(item => item._id === idStr || item.id === idStr || item._id === id || item.id === id) || null;
  }

  async create(data) {
    const list = this._read();
    const newDoc = {
      _id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    };
    list.push(newDoc);
    this._write(list);
    return newDoc;
  }

  async insertMany(docs) {
    const list = this._read();
    const newDocs = docs.map(doc => ({
      _id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...doc
    }));
    list.push(...newDocs);
    this._write(list);
    return newDocs;
  }

  async findByIdAndUpdate(id, update, options = { new: true }) {
    if (!id) return null;
    const list = this._read();
    const idStr = id.toString();
    const idx = list.findIndex(item => item._id === idStr || item.id === idStr || item._id === id || item.id === id);
    if (idx === -1) return null;

    // Handle Mongoose-like atomic operators or plain object updates
    let updatedDoc = { ...list[idx] };
    
    if (update.$set) {
      updatedDoc = { ...updatedDoc, ...update.$set, updatedAt: new Date().toISOString() };
    } else if (update.$push) {
      for (const key in update.$push) {
        if (!Array.isArray(updatedDoc[key])) updatedDoc[key] = [];
        updatedDoc[key].push(update.$push[key]);
      }
      updatedDoc.updatedAt = new Date().toISOString();
    } else if (update.$pull) {
      for (const key in update.$pull) {
        if (Array.isArray(updatedDoc[key])) {
          const valToRemove = update.$pull[key];
          updatedDoc[key] = updatedDoc[key].filter(v => 
            typeof valToRemove === 'object' && valToRemove._id 
              ? v._id !== valToRemove._id 
              : v !== valToRemove
          );
        }
      }
      updatedDoc.updatedAt = new Date().toISOString();
    } else {
      updatedDoc = { ...updatedDoc, ...update, updatedAt: new Date().toISOString() };
    }

    list[idx] = updatedDoc;
    this._write(list);
    return updatedDoc;
  }

  async findOneAndUpdate(filter, update, options = { new: true }) {
    const list = this._read();
    const idx = list.findIndex(item => this._matches(item, filter));
    if (idx === -1) return null;
    return this.findByIdAndUpdate(list[idx]._id, update, options);
  }

  async deleteOne(filter = {}) {
    const list = this._read();
    const initialLen = list.length;
    const newList = list.filter(item => !this._matches(item, filter));
    this._write(newList);
    return { deletedCount: initialLen - newList.length };
  }

  async findByIdAndDelete(id) {
    const list = this._read();
    const idx = list.findIndex(item => item._id === id.toString());
    if (idx === -1) return null;
    const deleted = list[idx];
    list.splice(idx, 1);
    this._write(list);
    return deleted;
  }

  async countDocuments(filter = {}) {
    const list = this._read();
    return list.filter(item => this._matches(item, filter)).length;
  }
}

export const getCollection = (name) => {
  return new JsonCollection(name);
};
