require('dotenv').config();
const mongoose = require('mongoose');
const TelegramContent = require('../models/TelegramContent');

async function checkPaymentQRCode() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 已连接到数据库\n');

    // 查找 payment_qrcode
    const content = await TelegramContent.findOne({ key: 'payment_qrcode' });
    
    if (!content) {
      console.log('❌ 找不到 payment_qrcode 模板');
      console.log('\n💡 请在后台创建 payment_qrcode 模板：');
      console.log('   1. 进入 Telegram 管理 → 内容管理');
      console.log('   2. 点击"创建内容"');
      console.log('   3. Key: payment_qrcode');
      console.log('   4. 类型: photo');
      console.log('   5. 媒体URL: 你的横幅图片链接');
      console.log('   6. 启用: 是');
      process.exit(0);
    }

    console.log('📋 找到 payment_qrcode 模板:\n');
    console.log(`  ID: ${content._id}`);
    console.log(`  Key: ${content.key}`);
    console.log(`  名称: ${content.name}`);
    console.log(`  启用: ${content.enabled ? '✅ 是' : '❌ 否'}`);
    console.log(`\n  内容类型: ${content.content?.type || 'N/A'}`);
    console.log(`  媒体URL: ${content.content?.mediaUrl || 'N/A'}`);
    console.log(`  文本: ${content.content?.text?.substring(0, 50) || 'N/A'}...`);
    
    if (content.buttons && content.buttons.length > 0) {
      console.log(`\n  按钮数量: ${content.buttons.length}`);
      content.buttons.forEach((btn, i) => {
        console.log(`    ${i + 1}. ${btn.text} (${btn.type})`);
      });
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (!content.enabled) {
      console.log('⚠️  模板已禁用！请在后台启用它。');
    } else if (!content.content?.mediaUrl) {
      console.log('⚠️  没有配置媒体URL！请在后台添加横幅图片链接。');
    } else {
      console.log('✅ 模板配置正确！');
      console.log('\n测试横幅URL是否可访问:');
      console.log(`   ${content.content.mediaUrl}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

checkPaymentQRCode();
