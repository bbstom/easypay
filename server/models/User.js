const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // 改为可选，TG 用户可以没有密码
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: { type: String, enum: ['active', 'disabled'], default: 'active' }, // 账户状态
  
  // Telegram 相关字段
  telegramId: { type: String, unique: true, sparse: true }, // TG 用户 ID
  telegramUsername: String, // TG 用户名
  telegramFirstName: String, // TG 名字
  telegramLastName: String, // TG 姓氏
  telegramPhotoUrl: String, // TG 头像
  telegramBound: { type: Boolean, default: false }, // 是否已绑定 TG
  
  // 账户来源
  source: { 
    type: String, 
    enum: ['web', 'telegram'], 
    default: 'web' 
  },
  
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  // 只有当密码存在且被修改时才加密
  if (!this.password || !this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  if (!this.password) return false; // TG 用户没有密码
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
