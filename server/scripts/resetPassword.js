#!/usr/bin/env node

/**
 * 重置用户密码
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔐 重置用户密码');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

async function resetPassword() {
  try {
    // 连接数据库
    console.log('📡 连接数据库...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fastpay');
    console.log('✅ 数据库连接成功\n');

    // 显示所有用户
    const users = await User.find({}).select('username email role');
    
    console.log('现有用户列表：');
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.email} (${user.username}) - ${user.role}`);
    });
    console.log('');

    // 输入邮箱
    const email = await question('请输入要重置密码的用户邮箱: ');
    
    const user = await User.findOne({ email: email.trim() });
    
    if (!user) {
      console.log('❌ 用户不存在');
      rl.close();
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log(`\n找到用户: ${user.username} (${user.email})`);
    
    // 输入新密码
    const newPassword = await question('请输入新密码: ');
    
    if (newPassword.length < 6) {
      console.log('❌ 密码长度至少为 6 位');
      rl.close();
      await mongoose.connection.close();
      process.exit(1);
    }

    // 更新密码
    user.password = newPassword;
    await user.save();

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 密码重置成功！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`用户名: ${user.username}`);
    console.log(`邮箱: ${user.email}`);
    console.log(`新密码: ${newPassword}`);
    console.log(`角色: ${user.role}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    rl.close();
    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ 错误:', error.message);
    rl.close();
    process.exit(1);
  }
}

resetPassword();
