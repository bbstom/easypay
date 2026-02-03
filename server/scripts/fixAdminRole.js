// 修复管理员角色脚本
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function fixAdminRole() {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔧 修复管理员角色');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 连接数据库
    console.log('📡 连接数据库...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 数据库连接成功\n');

    // 查找用户名为 kailsay 的用户
    const user = await User.findOne({ username: 'kailsay' });
    
    if (!user) {
      console.log('❌ 未找到用户 kailsay');
      console.log('\n请检查用户名是否正确\n');
      process.exit(1);
    }

    console.log('找到用户：');
    console.log('  ID:', user._id);
    console.log('  用户名:', user.username);
    console.log('  邮箱:', user.email);
    console.log('  当前角色:', user.role);
    console.log('');

    if (user.role === 'admin') {
      console.log('✅ 用户已经是管理员，无需修复\n');
    } else {
      console.log('🔄 将用户角色修改为 admin...');
      user.role = 'admin';
      await user.save();
      console.log('✅ 角色修改成功\n');
    }

    // 验证
    const updatedUser = await User.findOne({ username: 'kailsay' });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 验证结果');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('  用户名:', updatedUser.username);
    console.log('  邮箱:', updatedUser.email);
    console.log('  角色:', updatedUser.role);
    console.log('');

    if (updatedUser.role === 'admin') {
      console.log('🎉 修复完成！');
      console.log('\n请重新登录以查看管理后台按钮：');
      console.log('  1. 退出登录');
      console.log('  2. 使用账号密码重新登录');
      console.log('  3. 登录后应该能看到"管理后台"按钮\n');
    } else {
      console.log('❌ 修复失败，角色仍然是:', updatedUser.role);
    }

  } catch (error) {
    console.error('\n❌ 修复失败:', error);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 数据库连接已关闭');
    process.exit(0);
  }
}

// 运行修复
fixAdminRole();
