// 检查管理员账号脚本
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function checkAdmin() {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 检查管理员账号');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 连接数据库
    console.log('📡 连接数据库...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 数据库连接成功\n');

    // 查找所有管理员
    const admins = await User.find({ role: 'admin' });
    
    if (admins.length === 0) {
      console.log('❌ 未找到管理员账号！');
      console.log('\n请运行初始化脚本创建管理员：');
      console.log('   node server/scripts/initDatabase.js\n');
    } else {
      console.log(`✅ 找到 ${admins.length} 个管理员账号：\n`);
      
      admins.forEach((admin, index) => {
        console.log(`管理员 ${index + 1}:`);
        console.log('  ID:', admin._id);
        console.log('  用户名:', admin.username);
        console.log('  邮箱:', admin.email);
        console.log('  角色:', admin.role);
        console.log('  创建时间:', admin.createdAt || '未知');
        console.log('');
      });
    }

    // 查找所有用户
    const allUsers = await User.find();
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 数据库中共有 ${allUsers.length} 个用户\n`);
    
    if (allUsers.length > 0) {
      console.log('所有用户列表：');
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.username} (${user.role}) - ${user.email}`);
      });
      console.log('');
    }

  } catch (error) {
    console.error('\n❌ 检查失败:', error);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 数据库连接已关闭');
    process.exit(0);
  }
}

// 运行检查
checkAdmin();
