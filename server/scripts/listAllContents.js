require('dotenv').config();
const mongoose = require('mongoose');
const TelegramContent = require('../models/TelegramContent');

async function listContents() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 已连接到数据库\n');

    const contents = await TelegramContent.find({}).sort({ key: 1 });
    
    if (contents.length === 0) {
      console.log('📋 数据库中没有内容');
      process.exit(0);
    }

    console.log(`📊 总共 ${contents.length} 条内容:\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('序号 | Key                          | 名称                | 类型   | 状态');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    contents.forEach((content, index) => {
      const num = String(index + 1).padEnd(4);
      const key = content.key.padEnd(28);
      const name = (content.name || 'N/A').padEnd(18);
      const type = (content.content?.type || 'text').padEnd(6);
      const status = content.enabled ? '✅ 启用' : '❌ 禁用';
      
      console.log(`${num} | ${key} | ${name} | ${type} | ${status}`);
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 按类别分组
    const categories = {
      welcome: [],
      main_menu: [],
      payment: [],
      orders: [],
      tickets: [],
      energy: [],
      swap: [],
      other: []
    };

    contents.forEach(content => {
      if (content.key.startsWith('welcome_')) {
        categories.welcome.push(content.key);
      } else if (content.key.startsWith('main_menu')) {
        categories.main_menu.push(content.key);
      } else if (content.key.startsWith('payment_')) {
        categories.payment.push(content.key);
      } else if (content.key.startsWith('order')) {
        categories.orders.push(content.key);
      } else if (content.key.startsWith('ticket')) {
        categories.tickets.push(content.key);
      } else if (content.key.startsWith('energy_')) {
        categories.energy.push(content.key);
      } else if (content.key.startsWith('swap_')) {
        categories.swap.push(content.key);
      } else {
        categories.other.push(content.key);
      }
    });

    console.log('📂 按类别分组:\n');
    
    if (categories.welcome.length > 0) {
      console.log('🎉 欢迎消息:');
      categories.welcome.forEach(key => console.log(`   - ${key}`));
      console.log();
    }
    
    if (categories.main_menu.length > 0) {
      console.log('📋 主菜单:');
      categories.main_menu.forEach(key => console.log(`   - ${key}`));
      console.log();
    }
    
    if (categories.payment.length > 0) {
      console.log('💰 支付流程:');
      categories.payment.forEach(key => console.log(`   - ${key}`));
      console.log();
    }
    
    if (categories.orders.length > 0) {
      console.log('📦 订单管理:');
      categories.orders.forEach(key => console.log(`   - ${key}`));
      console.log();
    }
    
    if (categories.tickets.length > 0) {
      console.log('🎫 工单系统:');
      categories.tickets.forEach(key => console.log(`   - ${key}`));
      console.log();
    }
    
    if (categories.energy.length > 0) {
      console.log('⚡ 能量租赁:');
      categories.energy.forEach(key => console.log(`   - ${key}`));
      console.log();
    }
    
    if (categories.swap.length > 0) {
      console.log('🔄 闪兑服务:');
      categories.swap.forEach(key => console.log(`   - ${key}`));
      console.log();
    }
    
    if (categories.other.length > 0) {
      console.log('📌 其他:');
      categories.other.forEach(key => console.log(`   - ${key}`));
      console.log();
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('💡 提示:');
    console.log('   - 如果要删除某个内容: node server/scripts/deleteContent.js <key>');
    console.log('   - 如果要查看详情: node server/scripts/checkOrderFailedContent.js');
    console.log('   - 在后台创建新内容时，请使用未被占用的 key\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

listContents();
