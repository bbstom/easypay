const mongoose = require('mongoose');

const blogCategorySchema = new mongoose.Schema({
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
  },
  description: {
    type: String,
    maxlength: 500
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// 索引
blogCategorySchema.index({ slug: 1 });
blogCategorySchema.index({ order: 1 });

module.exports = mongoose.model('BlogCategory', blogCategorySchema);
