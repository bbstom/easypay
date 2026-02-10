const mongoose = require('mongoose');

const blogTagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  }
}, {
  timestamps: true
});

// 索引
blogTagSchema.index({ slug: 1 });

module.exports = mongoose.model('BlogTag', blogTagSchema);
