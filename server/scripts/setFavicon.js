const mongoose = require('mongoose');
const Settings = require('../models/Settings');

async function setFavicon() {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/easypay');
    console.log('✅ 数据库连接成功\n');

    // 获取或创建设置
    let settings = await Settings.findOne();
    
    if (!settings) {
      console.log('创建新的设置记录...');
      settings = new Settings();
    }

    // 设置 Favicon
    settings.siteFavicon = '/icons/usdt.svg';
    settings.updatedAt = new Date();
    
    await settings.save();

    console.log('✅ Favicon 设置成功！');
    console.log('\n当前配置：');
    console.log('siteFavicon:', settings.siteFavicon);
    console.log('siteLogo:', settings.siteLogo || '(未配置)');
    console.log('siteName:', settings.siteName || 'FASTPAY');
    
    console.log('\n请刷新网页查看效果（Ctrl + F5）');

    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

setFavicon();
