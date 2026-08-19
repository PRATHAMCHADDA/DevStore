import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

// 1. Payment Model
export const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'USD'
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
    defaultValue: 'pending'
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false
  },
  gateway: {
    type: DataTypes.STRING, // stripe, paypal, razorpay, cod
    allowNull: false
  },
  rawResponse: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

// 2. Transaction Model
export const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  paymentId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  refNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING, // credit, debit
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

// 3. Analytics Model
export const Analytics = sequelize.define('Analytics', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  eventType: {
    type: DataTypes.STRING, // view_item, add_to_cart, purchase, search
    allowNull: false
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  productId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  meta: {
    type: DataTypes.TEXT, // json metadata string
    allowNull: true
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

// 4. Revenue Model
export const Revenue = sequelize.define('Revenue', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    unique: true
  },
  ordersCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  grossRevenue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  netRevenue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  discountsApplied: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  }
});

// 5. Report Model
export const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING, // sales, inventory, orders, customer
    allowNull: false
  },
  path: {
     type: DataTypes.STRING,
     allowNull: false
  },
  stats: {
    type: DataTypes.TEXT, // serialized stats JSON
    allowNull: true
  }
});

// 6. Log Model
export const Log = sequelize.define('Log', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  level: {
    type: DataTypes.STRING, // info, warn, error
    defaultValue: 'info'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  meta: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

// 7. Invoice Model
export const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  pdfPath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
});

export const syncSQLModels = async () => {
  await sequelize.sync({ alter: true });
};
