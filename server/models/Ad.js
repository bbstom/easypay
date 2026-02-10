const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['text', 'image'], required: true },
  content: { type: String, required: true },
  imageUrl: { type: String },
  link: { type: String },
  height: { type: Number, default: 120 },
  position: { 
    type: String, 
    enum: ['home-bottom', 'workspace-top', 'workspace-middle', 'workspace-bottom', 'swap-bottom', 'energy-bottom'], 
    required: true 
  },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  // 样式配置
  backgroundColor: { type: String, default: '#E0F2FE' }, // 背景色
  textColor: { type: String, default: '#00A3FF' }, // 文字颜色
  isBold: { type: Boolean, default: true }, // 是否加粗
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ad', adSchema);
