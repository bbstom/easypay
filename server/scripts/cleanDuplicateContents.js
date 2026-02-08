require('dotenv').config();
const mongoose = require('mongoose');
const TelegramContent = require('../models/TelegramContent');

async function cleanDuplicateContents() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 已连接到数据库');

    // 查找所有内容
    const allContents = await TelegramContent.find({});
    console.log(`📊 总共 ${allContents.length} 条内容`);

    // 按 key 分组
    const keyGroups = {};
    allContents.forEach(content => {
      if (!keyGroups[content.key]) {
        keyGroups[content.key] = [];
      }
      keyGroups[content.key].push(content);
    });

    // 查找重复的 key
    const duplicates = Object.entries(keyGroups).filter(([key, contents]) => contents.length > 1);

    if (duplicates.length === 0) {
      console.log('✅ 没有发现重复的内容');
      process.exit(0);
    }

    console.log(`\n⚠️  发现 ${duplicates.length} 个重复的 key:\n`);

    for (const [key, contents] of duplicates) {
      console.log(`\n🔍 Key: ${key} (${contents.length} 条记录)`);
      
      // 显示所有重复记录
      contents.forEach((content, index) => {
        console.log(`  ${index + 1}. ID: ${content._id}, 创建时间: ${content.createdAt}, 启用: ${content.enabled}`);
      });

      // 保留最新的一条，删除其他的
      const sorted = contents.sort((a, b) => b.createdAt - a.createdAt);
      const toKeep = sorted[0];
      const toDelete = sorted.slice(1);

      console.log(`  ✅ 保留: ${toKeep._id} (最新)`);
      
      for (const content of toDelete) {
        await TelegramContent.deleteOne({ _id: content._id });
        console.log(`  🗑️  删除: ${content._id}`);
      }
    }

    console.log('\n✅ 清理完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

cleanDuplicateContents();
