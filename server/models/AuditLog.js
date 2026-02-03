const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  // 用户信息
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  username: {
    type: String,
    required: true
  },
  
  // 操作信息
  action: {
    type: String,
    required: true,
    enum: [
      'LOGIN',
      'LOGOUT',
      'CREATE_WALLET',
      'UPDATE_WALLET',
      'DELETE_WALLET',
      'ENABLE_WALLET',
      'DISABLE_WALLET',
      'VIEW_WALLET',
      'REFRESH_WALLET',
      'CREATE_PAYMENT',
      'UPDATE_PAYMENT',
      'DELETE_PAYMENT',
      'CREATE_USER',
      'UPDATE_USER',
      'DELETE_USER',
      'UPDATE_SETTINGS',
      'VIEW_SENSITIVE_DATA',
      'EXPORT_DATA',
      'OTHER'
    ]
  },
  
  // 资源信息
  resource: {
    type: String,
    required: true
  },
  
  resourceId: {
    type: String
  },
  
  // 操作详情
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // 请求信息
  ip: {
    type: String,
    required: true
  },
  
  userAgent: {
    type: String
  },
  
  // 结果
  success: {
    type: Boolean,
    default: true
  },
  
  errorMessage: {
    type: String
  },
  
  // 时间戳
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// 索引
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, timestamp: -1 });
auditLogSchema.index({ ip: 1, timestamp: -1 });

// 静态方法：记录操作
auditLogSchema.statics.log = async function(data) {
  try {
    await this.create(data);
  } catch (error) {
    console.error('审计日志记录失败:', error);
  }
};

// 静态方法：查询用户操作历史
auditLogSchema.statics.getUserHistory = function(userId, limit = 100) {
  return this.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit);
};

// 静态方法：查询敏感操作
auditLogSchema.statics.getSensitiveOperations = function(days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const sensitiveActions = [
    'CREATE_WALLET',
    'UPDATE_WALLET',
    'DELETE_WALLET',
    'VIEW_SENSITIVE_DATA',
    'EXPORT_DATA'
  ];
  
  return this.find({
    action: { $in: sensitiveActions },
    timestamp: { $gte: startDate }
  }).sort({ timestamp: -1 });
};

// 静态方法：查询失败操作
auditLogSchema.statics.getFailedOperations = function(days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.find({
    success: false,
    timestamp: { $gte: startDate }
  }).sort({ timestamp: -1 });
};

// 静态方法：查询异常 IP
auditLogSchema.statics.getAnomalousIPs = async function(days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  // 查找失败次数较多的 IP
  const result = await this.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate },
        success: false
      }
    },
    {
      $group: {
        _id: '$ip',
        failCount: { $sum: 1 },
        actions: { $addToSet: '$action' }
      }
    },
    {
      $match: {
        failCount: { $gte: 5 }
      }
    },
    {
      $sort: { failCount: -1 }
    }
  ]);
  
  return result;
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
