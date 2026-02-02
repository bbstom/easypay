require('dotenv').config();
const mongoose = require('mongoose');
const tronService = require('../services/tronService');

async function testWallet() {
  try {
    console.log('🔗 连接数据库...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 数据库连接成功\n');

    console.log('🔄 初始化 TronWeb...');
    await tronService.initialize();
    console.log('✅ TronWeb 初始化成功\n');

    console.log('📊 检查钱包状态...');
    const status = await tronService.checkWalletStatus();
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📍 钱包地址:', status.address);
    console.log('💰 TRX 余额:', status.trxBalance.toFixed(6), 'TRX');
    console.log('💵 USDT 余额:', status.usdtBalance.toFixed(6), 'USDT');
    console.log('✅ 状态:', status.ready ? '就绪' : '未就绪（TRX不足）');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 余额预警
    if (status.trxBalance < 20) {
      console.log('⚠️  警告: TRX 余额不足 20，可能影响转账！');
    } else if (status.trxBalance < 50) {
      console.log('⚠️  提示: TRX 余额低于 50，建议及时充值');
    } else {
      console.log('✅ TRX 余额充足');
    }

    if (status.usdtBalance < 100) {
      console.log('⚠️  提示: USDT 余额较低，建议及时充值');
    } else {
      console.log('✅ USDT 余额充足');
    }

    console.log('\n💡 提示:');
    console.log('   - TRX 用于支付 gas 费用，每笔 USDT 转账约需 5-15 TRX');
    console.log('   - TRX 转账约需 0.1 TRX');
    console.log('   - 建议保持 TRX 余额在 100 以上');
    console.log('   - 可以在 https://tronscan.org 查看钱包详情\n');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 测试完成');
    process.exit(0);
  }
}

testWallet();
