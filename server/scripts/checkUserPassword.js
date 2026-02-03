#!/usr/bin/env node

/**
 * 检查用户密码并测试登录
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔍 检查用户账号和密码');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

async function checkUser() {
  try {
    // 连接数据库
    console.log('📡 连接数据库...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fastpay');
    console.log('✅ 数据库连接成功\n');

    // 获取所有用户
    const users = await User.find({}).select('username email role createdAt');
    
    console.log(`📊 数据库中共有 ${users.length} 个用户：\n`);
    
    users.forEach((user, index) => {
      console.log(`用户 ${index + 1}:`);
      console.log(`  ID: ${user._id}`);
      console.log(`  用户名: ${user.username}`);
      console.log(`  邮箱: ${user.email}`);
      console.log(`  角色: ${user.role}`);
      console.log(`  创建时间: ${user.createdAt}`);
      console.log('');
    });

    // 测试密码
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 测试密码验证');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const testCredentials = [
      { email: 'kailsay@gmail.com', password: 'specter1234' },
      { email: 'admin@fastpay.com', password: 'admin123' },
      { email: 'kailsay@gmail.com', password: 'admin123' },
    ];

    for (const cred of testCredentials) {
      console.log(`测试: ${cred.email} / ${cred.password}`);
      
      const user = await User.findOne({ email: cred.email });
      
      if (!user) {
        console.log(`  ❌ 用户不存在\n`);
        continue;
      }

      const isMatch = await user.comparePassword(cred.password);
      
      if (isMatch) {
        console.log(`  ✅ 密码正确！`);
        console.log(`  用户名: ${user.username}`);
        console.log(`  角色: ${user.role}\n`);
      } else {
        console.log(`  ❌ 密码错误\n`);
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 建议');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('如果所有密码都不正确，可以重置密码：');
    console.log('  node server/scripts/resetPassword.js');
    console.log('');

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

checkUser();
