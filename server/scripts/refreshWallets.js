require('dotenv').config();
const mongoose = require('mongoose');
const walletService = require('../services/walletService');

async function refreshWallets() {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/easypay');
    console.log('✅ 数据库连接成功\n');

    console.log('🔄 开始刷新所有钱包状态...\n');

    const results = await walletService.refreshAllWallets();

    console.log('\n📊 刷新结果:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    for (const result of results) {
      if (result.success) {
        console.log(`✅ ${result.id}: 成功`);
      } else {
        console.log(`❌ ${result.id}: 失败 - ${result.error}`);
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n📈 统计: 成功 ${successCount} 个，失败 ${failCount} 个\n`);

  } catch (error) {
    console.error('❌ 刷新失败:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

refreshWallets();
