const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  
  answer: {
    type: String,
    required: true
  },
  
  category: {
    type: String,
    default: '常见问题',
    trim: true
  },
  
  order: {
    type: Number,
    default: 0
  },
  
  enabled: {
    type: Boolean,
    default: true
  },
  
  views: {
    type: Number,
    default: 0
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

// 索引
faqSchema.index({ enabled: 1, order: 1 });
faqSchema.index({ category: 1 });

// 更新时间中间件
faqSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('FAQ', faqSchema);
