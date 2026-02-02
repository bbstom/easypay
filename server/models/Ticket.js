const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  // 工单编号
  ticketNumber: {
    type: String,
    required: true,
    unique: true
  },
  
  // 用户信息
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // 工单标题
  subject: {
    type: String,
    required: true,
    trim: true
  },
  
  // 工单内容
  message: {
    type: String,
    required: true
  },
  
  // 工单类型
  category: {
    type: String,
    enum: ['payment', 'technical', 'account', 'other'],
    default: 'other'
  },
  
  // 优先级
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // 状态
  status: {
    type: String,
    enum: ['open', 'in_progress', 'waiting_user', 'resolved', 'closed'],
    default: 'open'
  },
  
  // 回复列表
  replies: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // 附件（可选）
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // 最后回复时间
  lastReplyAt: {
    type: Date,
    default: Date.now
  },
  
  // 创建时间
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  // 更新时间
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // 关闭时间
  closedAt: {
    type: Date
  }
});

// 索引
ticketSchema.index({ userId: 1, status: 1 });
ticketSchema.index({ ticketNumber: 1 });
ticketSchema.index({ status: 1, createdAt: -1 });

// 更新时间中间件
ticketSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Ticket', ticketSchema);
