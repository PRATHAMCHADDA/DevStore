import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Persistent global memory store for Vercel Serverless environment
if (!global.__devstore_db__) {
  global.__devstore_db__ = {};
}

// Helper to pre-load default JSON files into global.__devstore_db__ if empty
const loadInitialSeedData = (colName) => {
  const colLower = colName.toLowerCase();
  const colCap = colLower.charAt(0).toUpperCase() + colLower.slice(1);
  if (global.__devstore_db__[colLower] && global.__devstore_db__[colLower].length > 0) {
    return global.__devstore_db__[colLower];
  }

  const seedCandidates = [
    path.join(process.cwd(), 'server/data/collections', `${colLower}.json`),
    path.join(process.cwd(), 'server/data/collections', `${colCap}.json`),
    path.join(process.cwd(), 'data/collections', `${colLower}.json`),
    path.join(process.cwd(), 'data/collections', `${colCap}.json`),
    path.join(__dirname, '../data/collections', `${colLower}.json`),
    path.join(__dirname, '../data/collections', `${colCap}.json`)
  ];

  for (const seedPath of seedCandidates) {
    if (fs.existsSync(seedPath)) {
      try {
        const content = fs.readFileSync(seedPath, 'utf-8');
        const parsed = JSON.parse(content || '[]');
        if (Array.isArray(parsed) && parsed.length > 0) {
          global.__devstore_db__[colLower] = parsed;
          return parsed;
        }
      } catch (e) {
        console.warn(`Error loading seed dataset for ${colLower}:`, e.message);
      }
    }
  }

  if (!global.__devstore_db__[colLower]) {
    global.__devstore_db__[colLower] = [];
  }
  return global.__devstore_db__[colLower];
};

// Dynamic storage directory resolver for local development
const getStorageDir = () => {
  const localCandidates = [
    path.join(process.cwd(), 'server/data/collections'),
    path.join(process.cwd(), 'data/collections'),
    path.join(__dirname, '../data/collections')
  ];
  for (const dir of localCandidates) {
    if (fs.existsSync(dir)) return dir;
  }
  return localCandidates[0];
};

const isVercel = Boolean(process.env.VERCEL);

// In-memory fallback cache for local execution
const memoryStore = new Map();

class JsonCollection {
  constructor(collectionName) {
    this.name = collectionName;
  }

  getFilePath() {
    const dir = getStorageDir();
    return path.join(dir, `${this.name.toLowerCase()}.json`);
  }

  _read() {
    const colLower = this.name.toLowerCase();

    // On Vercel: Pure In-Memory DB Mode with zero disk reads/writes
    if (isVercel) {
      if (!global.__devstore_db__[colLower] || global.__devstore_db__[colLower].length === 0) {
        loadInitialSeedData(colLower);
      }
      return global.__devstore_db__[colLower] || [];
    }

    // Local execution: Read from disk
    const filePath = this.getFilePath();
    if (!fs.existsSync(filePath)) {
      return memoryStore.get(colLower) || [];
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content || '[]');
      memoryStore.set(colLower, parsed);
      return parsed;
    } catch (err) {
      console.error(`Error reading database file: ${filePath}`, err);
      return memoryStore.get(colLower) || [];
    }
  }

  _write(data) {
    const colLower = this.name.toLowerCase();

    // On Vercel: Mutate global memory DB directly in memory
    if (isVercel) {
      global.__devstore_db__[colLower] = data;
      memoryStore.set(colLower, data);
      return;
    }

    // Local execution: Write to disk as usual
    memoryStore.set(colLower, data);
    const dir = getStorageDir();
    const filePath = path.join(dir, `${colLower}.json`);
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.warn(`Filesystem write notice for ${this.name}:`, err.message);
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
