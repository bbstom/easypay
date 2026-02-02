require('dotenv').config();
const mongoose = require('mongoose');
const tronService = require('../services/tronService');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function testTransfer() {
  try {
    console.log('🔗 连接数据库...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 数据库连接成功\n');

    console.log('🔄 初始化 TronWeb...');
    await tronService.initialize();
    console.log('✅ TronWeb 初始化成功\n');

    // 显示钱包状态
    const status = await tronService.checkWalletStatus();
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📍 钱包地址:', status.address);
    console.log('💰 TRX 余额:', status.trxBalance.toFixed(6), 'TRX');
    console.log('💵 USDT 余额:', status.usdtBalance.toFixed(6), 'USDT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 选择转账类型
    console.log('请选择转账类型:');
    console.log('1. USDT (TRC20)');
    console.log('2. TRX');
    const typeChoice = await question('请输入选项 (1 或 2): ');

    const isUSDT = typeChoice.trim() === '1';
    const coinType = isUSDT ? 'USDT' : 'TRX';

    // 输入接收地址
    const toAddress = await question(`\n请输入接收地址 (TRON地址): `);
    
    // 验证地址
    if (!tronService.isValidAddress(toAddress)) {
      console.error('❌ 无效的 TRON 地址');
      rl.close();
      await mongoose.disconnect();
      process.exit(1);
    }

    // 输入金额
    const amount = await question(`请输入转账金额 (${coinType}): `);
    const amountNum = parseFloat(amount);

    if (isNaN(amountNum) || amountNum <= 0) {
      console.error('❌ 无效的金额');
      rl.close();
      await mongoose.disconnect();
      process.exit(1);
    }

    // 检查余额
    const currentBalance = isUSDT ? status.usdtBalance : status.trxBalance;
    if (currentBalance < amountNum) {
      console.error(`❌ 余额不足。当前余额: ${currentBalance} ${coinType}`);
      rl.close();
      await mongoose.disconnect();
      process.exit(1);
    }

    // 确认转账
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 转账信息确认:');
    console.log('   类型:', coinType);
    console.log('   金额:', amountNum, coinType);
    console.log('   接收地址:', toAddress);
    console.log('   预计手续费:', isUSDT ? '约 5-15 TRX' : '约 0.1 TRX');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const confirm = await question('⚠️  确认执行转账? (yes/no): ');
    
    if (confirm.toLowerCase() !== 'yes') {
      console.log('❌ 已取消转账');
      rl.close();
      await mongoose.disconnect();
      process.exit(0);
    }

    // 执行转账
    console.log('\n🔄 正在执行转账...');
    let result;
    
    if (isUSDT) {
      result = await tronService.sendUSDT(toAddress, amountNum);
    } else {
      result = await tronService.sendTRX(toAddress, amountNum);
    }

    console.log('\n✅ 转账成功!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 交易哈希:', result.txid);
    console.log('🔗 查看交易:', `https://tronscan.org/#/transaction/${result.txid}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 等待确认
    console.log('⏳ 等待区块链确认...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    const txInfo = await tronService.getTransaction(result.txid);
    console.log('📊 交易状态:', txInfo.confirmed ? '✅ 已确认' : '⏳ 待确认');
    if (txInfo.blockNumber) {
      console.log('📦 区块高度:', txInfo.blockNumber);
    }
    if (txInfo.fee) {
      console.log('💸 实际手续费:', txInfo.fee, 'TRX');
    }

    // 显示更新后的余额
    console.log('\n🔄 更新钱包余额...');
    const newStatus = await tronService.checkWalletStatus();
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💰 TRX 余额:', newStatus.trxBalance.toFixed(6), 'TRX');
    console.log('💵 USDT 余额:', newStatus.usdtBalance.toFixed(6), 'USDT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ 转账失败:', error.message);
    console.error(error);
  } finally {
    rl.close();
    await mongoose.disconnect();
    console.log('\n👋 测试完成');
    process.exit(0);
  }
}

testTransfer();
