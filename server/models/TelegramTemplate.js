const mongoose = require('mongoose');

// Telegram 消息模板
const telegramTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // 模板名称
  type: { 
    type: String, 
    enum: ['welcome', 'payment_success', 'transfer_complete', 'transfer_failed', 'custom'],
    required: true 
  },
  
  // 消息内容
  content: { type: String, required: true }, // 支持 HTML 和变量 {{variable}}
  parseMode: { type: String, enum: ['HTML', 'Markdown'], default: 'HTML' },
  
  // 按钮配置
  buttons: [{
    text: String, // 按钮文字
    type: { type: String, enum: ['callback', 'url'], default: 'callback' },
    data: String, // callback_data 或 url
    row: { type: Number, default: 0 } // 按钮所在行
  }],
  
  // 变量说明
  variables: [String], // 可用变量列表，如 ['orderId', 'amount', 'address']
  
  // 状态
  enabled: { type: Boolean, default: true },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TelegramTemplate', telegramTemplateSchema);
