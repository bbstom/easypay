require('dotenv').config();
const mongoose = require('mongoose');
const TelegramContent = require('../models/TelegramContent');

async function rebuildIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 已连接到数据库');

    // 获取集合
    const collection = mongoose.connection.collection('telegramcontents');

    // 查看当前索引
    console.log('\n📋 当前索引:');
    const indexes = await collection.indexes();
    indexes.forEach(index => {
      console.log(`  - ${JSON.stringify(index.key)}: ${index.name}`);
    });

    // 删除所有索引（除了 _id）
    console.log('\n🗑️  删除旧索引...');
    try {
      await collection.dropIndex('key_1');
      console.log('  ✅ 已删除 key_1 索引');
    } catch (error) {
      console.log('  ⚠️  key_1 索引不存在或已删除');
    }

    // 重建索引
    console.log('\n🔨 重建索引...');
    await TelegramContent.syncIndexes();
    console.log('  ✅ 索引已重建');

    // 查看新索引
    console.log('\n📋 新索引:');
    const newIndexes = await collection.indexes();
    newIndexes.forEach(index => {
      console.log(`  - ${JSON.stringify(index.key)}: ${index.name}`);
    });

    // 验证数据
    console.log('\n📊 验证数据:');
    const contents = await TelegramContent.find({});
    console.log(`  总共 ${contents.length} 条内容`);
    
    const keys = contents.map(c => c.key);
    const uniqueKeys = [...new Set(keys)];
    console.log(`  唯一 key: ${uniqueKeys.length}`);
    
    if (keys.length !== uniqueKeys.length) {
      console.log('  ⚠️  发现重复的 key:');
      const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);
      console.log(`    ${[...new Set(duplicates)].join(', ')}`);
    } else {
      console.log('  ✅ 没有重复的 key');
    }

    console.log('\n✅ 完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

rebuildIndexes();
