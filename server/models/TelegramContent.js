const mongoose = require('mongoose');

// Telegram 内容配置（欢迎页、交互页面等）
const telegramContentSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // 内容标识
  name: { type: String, required: true }, // 显示名称
  category: { 
    type: String, 
    enum: ['welcome', 'payment', 'order', 'help', 'custom'],
    default: 'custom'
  },
  
  // 内容配置
  content: {
    type: { 
      type: String, 
      enum: ['text', 'photo', 'video', 'document'],
      default: 'text'
    },
    text: String, // 文本内容（支持HTML和变量）
    mediaUrl: String, // 图片/视频/文档URL
    caption: String, // 媒体说明文字
    parseMode: { type: String, enum: ['HTML', 'Markdown', 'MarkdownV2'], default: 'HTML' }
  },
  
  // 富文本功能
  features: {
    copyable: { type: Boolean, default: false }, // 支持复制
    copyText: String, // 可复制的文本
    highlight: [{ // 高亮文本
      text: String,
      style: { type: String, enum: ['bold', 'italic', 'code', 'underline'], default: 'bold' }
    }],
    links: [{ // 链接
      text: String,
      url: String,
      type: { type: String, enum: ['inline', 'button'], default: 'inline' }
    }],
    emojis: [String] // 推荐的emoji
  },
  
  // 按钮配置
  buttons: [{
    text: String,
    type: { type: String, enum: ['callback', 'url', 'copy'], default: 'callback' },
    data: String, // callback_data / url / 复制的文本
    row: { type: Number, default: 0 },
    col: { type: Number, default: 0 }
  }],
  
  // 变量说明
  variables: [{
    key: String, // 变量名，如 {{username}}
    description: String, // 说明
    example: String // 示例值
  }],
  
  // 使用场景
  triggers: [{
    type: { 
      type: String, 
      enum: ['command', 'callback', 'state', 'auto'],
      default: 'callback'
    },
    value: String // 命令/callback_data/状态名
  }],
  
  enabled: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TelegramContent', telegramContentSchema);
