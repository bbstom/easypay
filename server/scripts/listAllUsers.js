// 列出所有用户脚本
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function listAllUsers() {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👥 列出所有用户');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 连接数据库
    console.log('📡 连接数据库...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 数据库连接成功\n');

    // 查找所有用户
    const users = await User.find().sort({ createdAt: -1 });
    
    console.log(`📊 数据库中共有 ${users.length} 个用户\n`);
    
    if (users.length === 0) {
      console.log('❌ 数据库中没有用户');
    } else {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('用户列表：\n');
      
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.role === 'admin' ? '👑' : '👤'} ${user.username}`);
        console.log(`   ID: ${user._id}`);
        console.log(`   邮箱: ${user.email}`);
        console.log(`   角色: ${user.role}`);
        console.log(`   创建时间: ${user.createdAt || '未知'}`);
        console.log('');
      });
      
      // 统计
      const adminCount = users.filter(u => u.role === 'admin').length;
      const userCount = users.filter(u => u.role === 'user').length;
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📊 统计信息\n');
      console.log(`  管理员: ${adminCount} 个`);
      console.log(`  普通用户: ${userCount} 个`);
      console.log(`  总计: ${users.length} 个`);
      console.log('');
    }

  } catch (error) {
    console.error('\n❌ 查询失败:', error);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 数据库连接已关闭');
    process.exit(0);
  }
}

// 运行查询
listAllUsers();
