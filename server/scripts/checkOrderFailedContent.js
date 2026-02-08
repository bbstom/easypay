require('dotenv').config();
const mongoose = require('mongoose');
const TelegramContent = require('../models/TelegramContent');

async function checkContent() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 已连接到数据库');

    // 查找 order_failed
    const content = await TelegramContent.findOne({ key: 'order_failed' });
    
    if (content) {
      console.log('\n📋 找到 order_failed 内容:');
      console.log(`  ID: ${content._id}`);
      console.log(`  Key: ${content.key}`);
      console.log(`  名称: ${content.name}`);
      console.log(`  类型: ${content.content?.type || 'N/A'}`);
      console.log(`  启用: ${content.enabled}`);
      console.log(`  创建时间: ${content.createdAt}`);
      console.log(`  更新时间: ${content.updatedAt}`);
      console.log(`\n  内容预览:`);
      console.log(`  ${content.content?.text?.substring(0, 100) || 'N/A'}...`);
      
      console.log('\n❓ 是否要删除这条记录？(y/n)');
      console.log('   删除后你可以在后台重新创建自定义模板');
      
      // 不自动删除，让用户决定
      console.log('\n💡 如果要删除，请运行:');
      console.log(`   node server/scripts/deleteContent.js order_failed`);
    } else {
      console.log('\n✅ 数据库中没有 order_failed 内容');
      console.log('   你可以在后台创建这个模板');
    }

    // 显示所有内容
    console.log('\n📊 所有内容:');
    const allContents = await TelegramContent.find({});
    allContents.forEach(c => {
      console.log(`  - ${c.key}: ${c.name} (${c.enabled ? '启用' : '禁用'})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

checkContent();
