const mongoose = require('mongoose');

// Telegram 群发消息
const telegramBroadcastSchema = new mongoose.Schema({
  title: { type: String, required: true }, // 群发标题
  
  // 内容配置（支持富文本）
  contentType: { 
    type: String, 
    enum: ['text', 'photo', 'video', 'document'],
    default: 'text'
  },
  content: { type: String, required: true }, // 消息内容或说明文字
  mediaUrl: { type: String }, // 媒体URL（图片、视频、文档）
  parseMode: { type: String, enum: ['HTML', 'Markdown', 'MarkdownV2'], default: 'HTML' },
  
  // 按钮配置
  buttons: [{
    text: String,
    type: { type: String, enum: ['callback', 'url', 'copy'], default: 'callback' },
    data: String,
    row: { type: Number, default: 0 },
    col: { type: Number, default: 0 }
  }],
  
  // 发送目标
  targetType: { 
    type: String, 
    enum: ['all', 'active', 'inactive', 'custom', 'group'],
    default: 'all'
  },
  targetUsers: [String], // 自定义用户列表（telegramId）
  targetGroups: [String], // 目标群组列表（chatId）
  
  // 发送状态
  status: { 
    type: String, 
    enum: ['draft', 'sending', 'completed', 'failed'],
    default: 'draft'
  },
  
  // 统计
  totalUsers: { type: Number, default: 0 },
  sentCount: { type: Number, default: 0 },
  failedCount: { type: Number, default: 0 },
  
  // 发送时间
  scheduledAt: Date, // 定时发送
  sentAt: Date, // 实际发送时间
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TelegramBroadcast', telegramBroadcastSchema);
