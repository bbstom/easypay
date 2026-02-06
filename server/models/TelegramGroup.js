const mongoose = require('mongoose');

// Telegram 群组/频道
const telegramGroupSchema = new mongoose.Schema({
  chatId: { type: String, required: true, unique: true }, // 群组/频道 ID
  title: { type: String, required: true }, // 群组/频道名称
  type: { 
    type: String, 
    enum: ['group', 'supergroup', 'channel'],
    required: true 
  }, // 类型
  username: String, // 公开群组/频道的用户名
  
  // 成员信息
  memberCount: Number, // 成员数量（如果可获取）
  
  // Bot 状态
  botStatus: {
    type: String,
    enum: ['member', 'admin', 'left'],
    default: 'member'
  },
  botPermissions: {
    canSendMessages: { type: Boolean, default: false },
    canDeleteMessages: { type: Boolean, default: false },
    canPinMessages: { type: Boolean, default: false },
    canInviteUsers: { type: Boolean, default: false }
  },
  
  // 活动信息
  lastMessageAt: Date, // 最后一条消息时间
  messageCount: { type: Number, default: 0 }, // 消息计数
  
  // 状态
  active: { type: Boolean, default: true }, // 是否活跃
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 更新时间戳
telegramGroupSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('TelegramGroup', telegramGroupSchema);
