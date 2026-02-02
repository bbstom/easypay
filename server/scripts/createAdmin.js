require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 连接成功');

    const adminData = {
      username: 'admin',
      email: 'admin@fastpay.com',
      password: 'admin123456',
      role: 'admin'
    };

    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('⚠️  管理员账户已存在');
      console.log('邮箱:', adminData.email);
      process.exit(0);
    }

    const admin = new User(adminData);
    await admin.save();

    console.log('✅ 管理员账户创建成功！');
    console.log('==========================================');
    console.log('用户名:', adminData.username);
    console.log('邮箱:', adminData.email);
    console.log('密码:', adminData.password);
    console.log('==========================================');
    console.log('⚠️  请妥善保管管理员账户信息！');

    process.exit(0);
  } catch (error) {
    console.error('❌ 创建管理员失败:', error.message);
    process.exit(1);
  }
};

createAdmin();
