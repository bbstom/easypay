require('dotenv').config();
const mongoose = require('mongoose');
const tronService = require('../services/tronService');

async function testWalletStatus() {
  try {
    console.log('🔗 连接数据库...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 数据库连接成功\n');

    console.log('🔄 初始化 TronService...');
    await tronService.initialize();
    console.log('✅ TronService 初始化成功\n');

    console.log('🔍 检查钱包状态...');
    const status = await tronService.checkWalletStatus();
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 钱包状态检查成功！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📍 钱包地址:', status.address);
    console.log('💰 TRX 余额:', status.trxBalance, 'TRX');
    console.log('💵 USDT 余额:', status.usdtBalance, 'USDT');
    console.log('✅ 状态:', status.ready ? '就绪' : '未就绪');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error('\n详细错误:');
    console.error(error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testWalletStatus();
