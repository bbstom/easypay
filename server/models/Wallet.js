const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  // 基本信息
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  
  address: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  
  privateKeyEncrypted: {
    type: String,
    required: true
  },
  
  enabled: {
    type: Boolean,
    default: true
  },
  
  priority: {
    type: Number,
    default: 50,
    min: 1,
    max: 100
  },
  
  // 余额信息
  balance: {
    trx: {
      type: Number,
      default: 0
    },
    usdt: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  // 资源信息
  resources: {
    energy: {
      available: {
        type: Number,
        default: 0
      },
      limit: {
        type: Number,
        default: 0
      },
      used: {
        type: Number,
        default: 0
      }
    },
    bandwidth: {
      available: {
        type: Number,
        default: 0
      },
      limit: {
        type: Number,
        default: 0
      },
      used: {
        type: Number,
        default: 0
      }
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  // 使用统计
  stats: {
    totalTransactions: {
      type: Number,
      default: 0
    },
    successCount: {
      type: Number,
      default: 0
    },
    failCount: {
      type: Number,
      default: 0
    },
    lastUsedAt: {
      type: Date,
      default: null
    },
    totalAmount: {
      trx: {
        type: Number,
        default: 0
      },
      usdt: {
        type: Number,
        default: 0
      }
    }
  },
  
  // 健康状态
  health: {
    status: {
      type: String,
      enum: ['healthy', 'warning', 'error', 'disabled'],
      default: 'healthy'
    },
    lastCheckAt: {
      type: Date,
      default: Date.now
    },
    errorMessage: {
      type: String,
      default: ''
    },
    consecutiveFailures: {
      type: Number,
      default: 0
    }
  },
  
  // 预警设置
  alerts: {
    minTrxBalance: {
      type: Number,
      default: 50
    },
    minUsdtBalance: {
      type: Number,
      default: 100
    },
    minEnergy: {
      type: Number,
      default: 50000
    },
    enabled: {
      type: Boolean,
      default: true
    }
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 索引
walletSchema.index({ enabled: 1, 'health.status': 1 });
walletSchema.index({ priority: -1 });
walletSchema.index({ 'stats.lastUsedAt': 1 });

// 更新时间中间件
walletSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// 虚拟字段：成功率
walletSchema.virtual('successRate').get(function() {
  if (this.stats.totalTransactions === 0) return 100;
  return (this.stats.successCount / this.stats.totalTransactions * 100).toFixed(2);
});

// 虚拟字段：是否需要预警
walletSchema.virtual('needsAlert').get(function() {
  if (!this.alerts.enabled) return false;
  
  return this.balance.trx < this.alerts.minTrxBalance ||
         this.balance.usdt < this.alerts.minUsdtBalance ||
         this.resources.energy.available < this.alerts.minEnergy;
});

// 实例方法：更新余额
walletSchema.methods.updateBalance = function(trx, usdt) {
  this.balance.trx = trx;
  this.balance.usdt = usdt;
  this.balance.lastUpdated = Date.now();
  return this.save();
};

// 实例方法：更新资源
walletSchema.methods.updateResources = function(energy, bandwidth) {
  this.resources.energy = energy;
  this.resources.bandwidth = bandwidth;
  this.resources.lastUpdated = Date.now();
  return this.save();
};

// 实例方法：记录交易
walletSchema.methods.recordTransaction = function(success, amount, type) {
  this.stats.totalTransactions += 1;
  if (success) {
    this.stats.successCount += 1;
    this.health.consecutiveFailures = 0;
  } else {
    this.stats.failCount += 1;
    this.health.consecutiveFailures += 1;
  }
  
  this.stats.lastUsedAt = Date.now();
  
  if (type === 'TRX') {
    this.stats.totalAmount.trx += amount;
  } else if (type === 'USDT') {
    this.stats.totalAmount.usdt += amount;
  }
  
  // 连续失败3次标记为error
  if (this.health.consecutiveFailures >= 3) {
    this.health.status = 'error';
  }
  
  return this.save();
};

// 实例方法：更新健康状态
walletSchema.methods.updateHealth = function(status, errorMessage = '') {
  this.health.status = status;
  this.health.lastCheckAt = Date.now();
  this.health.errorMessage = errorMessage;
  
  if (status === 'healthy') {
    this.health.consecutiveFailures = 0;
  }
  
  return this.save();
};

// 静态方法：获取可用钱包
walletSchema.statics.getAvailableWallets = function() {
  return this.find({
    enabled: true,
    'health.status': { $ne: 'error' }
  }).sort({ priority: -1 });
};

// 静态方法：获取健康钱包
walletSchema.statics.getHealthyWallets = function() {
  return this.find({
    enabled: true,
    'health.status': 'healthy'
  }).sort({ priority: -1 });
};

// 配置
walletSchema.set('toJSON', { virtuals: true });
walletSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Wallet', walletSchema);
