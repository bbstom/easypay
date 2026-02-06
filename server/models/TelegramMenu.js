const mongoose = require('mongoose');

// Telegram 主菜单配置
const telegramMenuSchema = new mongoose.Schema({
  name: { type: String, required: true, default: 'main_menu' }, // 菜单名称
  
  // 菜单按钮配置
  buttons: [{
    text: String, // 按钮文字（支持emoji）
    type: { 
      type: String, 
      enum: ['callback', 'url', 'system'], 
      default: 'callback' 
    },
    action: String, // callback_data 或 url 或 系统功能名
    row: { type: Number, default: 0 }, // 按钮所在行
    col: { type: Number, default: 0 }, // 按钮所在列
    enabled: { type: Boolean, default: true }, // 是否启用
    order: { type: Number, default: 0 } // 排序
  }],
  
  // 系统功能映射
  systemActions: {
    payment_usdt: { type: Boolean, default: true },
    payment_trx: { type: Boolean, default: true },
    orders_list: { type: Boolean, default: true },
    tickets_list: { type: Boolean, default: true },
    account_info: { type: Boolean, default: true },
    help_center: { type: Boolean, default: true }
  },
  
  // 菜单样式
  layout: {
    type: String,
    enum: ['2x3', '3x2', '2x2', '1x6', 'custom'],
    default: 'custom'
  },
  
  enabled: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TelegramMenu', telegramMenuSchema);
