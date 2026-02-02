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
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ad', adSchema);
