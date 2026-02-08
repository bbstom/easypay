require('dotenv').config();
const mongoose = require('mongoose');
const TelegramContent = require('../models/TelegramContent');

async function deleteContent() {
  const key = process.argv[2];
  
  if (!key) {
    console.log('❌ 请提供要删除的 key');
    console.log('用法: node server/scripts/deleteContent.js <key>');
    console.log('示例: node server/scripts/deleteContent.js order_failed');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 已连接到数据库');

    // 查找内容
    const content = await TelegramContent.findOne({ key });
    
    if (!content) {
      console.log(`\n❌ 找不到 key 为 "${key}" 的内容`);
      process.exit(1);
    }

    console.log(`\n📋 找到内容:`);
    console.log(`  ID: ${content._id}`);
    console.log(`  Key: ${content.key}`);
    console.log(`  名称: ${content.name}`);
    console.log(`  类型: ${content.content?.type || 'N/A'}`);
    console.log(`  启用: ${content.enabled}`);

    // 删除
    await TelegramContent.deleteOne({ _id: content._id });
    console.log(`\n✅ 已删除 "${key}" 内容`);
    console.log(`\n💡 现在你可以在后台重新创建这个模板了`);

    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

deleteContent();
