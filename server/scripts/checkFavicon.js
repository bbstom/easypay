const mongoose = require('mongoose');
const Settings = require('../models/Settings');

async function checkFavicon() {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/easypay');
    console.log('✅ 数据库连接成功\n');

    // 获取设置
    const settings = await Settings.findOne();
    
    if (!settings) {
      console.log('❌ 未找到设置记录');
      process.exit(1);
    }

    console.log('=== 当前 Favicon 配置 ===');
    console.log('siteFavicon:', settings.siteFavicon || '(未配置)');
    console.log('siteLogo:', settings.siteLogo || '(未配置)');
    console.log('siteName:', settings.siteName || '(未配置)');
    console.log('\n=== 完整设置对象 ===');
    console.log(JSON.stringify({
      siteName: settings.siteName,
      siteLogo: settings.siteLogo,
      siteFavicon: settings.siteFavicon
    }, null, 2));

    // 如果未配置，提供设置命令
    if (!settings.siteFavicon) {
      console.log('\n⚠️  siteFavicon 未配置！');
      console.log('\n请执行以下操作之一：');
      console.log('1. 登录管理后台 → 设置 → 网站信息 → 填写 Favicon');
      console.log('2. 或运行以下命令直接设置：');
      console.log('   node server/scripts/setFavicon.js');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

checkFavicon();
