#!/usr/bin/env node

/**
 * 创建新的管理员账号
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query, defaultValue = '') {
  return new Promise(resolve => {
    const prompt = defaultValue ? `${query} (默认: ${defaultValue}): ` : `${query}: `;
    rl.question(prompt, answer => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('👤 创建新的管理员账号');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

async function createAdmin() {
  try {
    // 连接数据库
    console.log('📡 连接数据库...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fastpay');
    console.log('✅ 数据库连接成功\n');

    // 显示现有用户
    const existingUsers = await User.find({}).select('username email role');
    
    if (existingUsers.length > 0) {
      console.log('现有用户列表：');
      existingUsers.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.email} (${user.username}) - ${user.role}`);
      });
      console.log('');
    }

    // 输入新管理员信息
    const username = await question('管理员用户名', 'admin');
    const email = await question('管理员邮箱', 'admin@example.com');
    const password = await question('管理员密码', 'admin123');

    // 检查邮箱是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('\n❌ 该邮箱已被使用');
      console.log('提示：使用 resetPassword.js 重置现有用户的密码');
      rl.close();
      await mongoose.connection.close();
      process.exit(1);
    }

    // 创建管理员
    const admin = new User({
      username,
      email,
      password,
      role: 'admin'
    });

    await admin.save();

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 管理员账号创建成功！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`用户名: ${username}`);
    console.log(`邮箱: ${email}`);
    console.log(`密码: ${password}`);
    console.log(`角色: admin`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  请妥善保管管理员密码！\n');

    rl.close();
    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    rl.close();
    process.exit(1);
  }
}

createAdmin();
