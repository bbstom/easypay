const mongoose = require('mongoose');
require('dotenv').config();

async function testUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 数据库连接成功\n');

    const User = require('./server/models/User');
    const users = await User.find().select('username email telegramId role status createdAt');

    console.log('📊 用户统计:');
    console.log('  总用户数:', users.length);
    console.log('  管理员数:', users.filter(u => u.role === 'admin').length);
    console.log('  TG 用户数:', users.filter(u => u.telegramId).length);
    console.log('  活跃用户:', users.filter(u => u.status === 'active').length);

    if (users.length === 0) {
      console.log('\n⚠️  数据库中没有用户！');
      console.log('💡 建议：');
      console.log('  1. 运行 node server/scripts/createNewAdmin.js 创建管理员');
      console.log('  2. 在 Bot 中发送 /start 创建 TG 用户');
      await mongoose.disconnect();
      return;
    }

    console.log('\n📋 用户列表:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    users.forEach((u, i) => {
      const tgInfo = u.telegramId ? `TG:${u.telegramId}` : '无TG';
      const roleIcon = u.role === 'admin' ? '👑' : '👤';
      const statusIcon = u.status === 'active' ? '✅' : '❌';
      console.log(`${i+1}. ${roleIcon} ${u.username} - ${u.email}`);
      console.log(`   ${tgInfo} - ${statusIcon} ${u.status} - ${u.createdAt.toLocaleDateString()}`);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // 检查是否有管理员
    const admins = users.filter(u => u.role === 'admin');
    if (admins.length === 0) {
      console.log('\n⚠️  警告: 没有管理员账户！');
      console.log('💡 运行: node server/scripts/createNewAdmin.js');
    } else {
      console.log('\n✅ 管理员账户:');
      admins.forEach(admin => {
        console.log(`  - ${admin.username} (${admin.email})`);
      });
    }

    await mongoose.disconnect();
    console.log('\n✅ 测试完成\n');
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testUsers();
