const mongoose = require('mongoose');

const telegramCommandSchema = new mongoose.Schema({
  command: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        // 命令只能包含字母、数字和下划线，不能以数字开头
        return /^[a-z][a-z0-9_]*$/.test(v);
      },
      message: '命令格式无效，只能包含小写字母、数字和下划线，且不能以数字开头'
    }
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 256
  },
  action: {
    type: String,
    required: true,
    enum: ['callback', 'text', 'function'],
    default: 'callback'
  },
  // 如果 action 是 callback，存储 callback_data
  callbackData: {
    type: String,
    trim: true
  },
  // 如果 action 是 text，存储要发送的文本
  responseText: {
    type: String,
    trim: true
  },
  // 如果 action 是 function，存储要调用的函数名
  functionName: {
    type: String,
    trim: true
  },
  // 是否启用
  enabled: {
    type: Boolean,
    default: true
  },
  // 排序顺序
  order: {
    type: Number,
    default: 0
  },
  // 是否显示在菜单中
  showInMenu: {
    type: Boolean,
    default: true
  },
  // 图标（可选，用于前端显示）
  icon: {
    type: String,
    trim: true
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

// 更新时间戳
telegramCommandSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('TelegramCommand', telegramCommandSchema);
