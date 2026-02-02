require('dotenv').config();
const mongoose = require('mongoose');
const tronService = require('../services/tronService');
const Wallet = require('../models/Wallet');
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

    // 获取所有启用的钱包
    const wallets = await Wallet.find({ enabled: true });
    
    if (wallets.length === 0) {
      console.error('❌ 没有可用的钱包，请先在管理后台添加钱包');
      rl.close();
      await mongoose.disconnect();
      process.exit(1);
    }

    // 显示钱包列表
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📍 可用钱包列表:\n');
    wallets.forEach((wallet, index) => {
      console.log(`${index + 1}. ${wallet.name}`);
      console.log(`   地址: ${wallet.address}`);
      console.log(`   TRX: ${wallet.balance.trx.toFixed(2)} | USDT: ${wallet.balance.usdt.toFixed(2)}`);
      console.log(`   状态: ${wallet.health.status}\n`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 选择钱包
    const walletChoice = await question(`请选择钱包 (1-${wallets.length}): `);
    const walletIndex = parseInt(walletChoice) - 1;
    
    if (walletIndex < 0 || walletIndex >= wallets.length) {
      console.error('❌ 无效的钱包选择');
      rl.close();
      await mongoose.disconnect();
      process.exit(1);
    }

    const selectedWallet = wallets[walletIndex];
    console.log(`\n✅ 已选择钱包: ${selectedWallet.name}\n`);

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
    const currentBalance = isUSDT ? selectedWallet.balance.usdt : selectedWallet.balance.trx;
    if (currentBalance < amountNum) {
      console.error(`❌ 余额不足。当前余额: ${currentBalance} ${coinType}`);
      rl.close();
      await mongoose.disconnect();
      process.exit(1);
    }

    // 确认转账
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 转账信息确认:');
    console.log('   钱包:', selectedWallet.name);
    console.log('   类型:', coinType);
    console.log('   金额:', amountNum, coinType);
    console.log('   接收地址:', toAddress);
    console.log('   预计手续费:', isUSDT ? '约 3-5 TRX (含能量租赁)' : '约 0.1 TRX');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const confirm = await question('⚠️  确认执行转账? (yes/no): ');
    
    if (confirm.toLowerCase() !== 'yes') {
      console.log('❌ 已取消转账');
      rl.close();
      await mongoose.disconnect();
      process.exit(0);
    }

    // 执行转账（使用多钱包方法）
    console.log('\n🔄 正在执行转账...');
    let result;
    
    if (isUSDT) {
      result = await tronService.sendUSDTWithWallet(selectedWallet, toAddress, amountNum);
    } else {
      result = await tronService.sendTRXWithWallet(selectedWallet, toAddress, amountNum);
    }

    console.log('\n✅ 转账成功!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 交易哈希:', result.txid);
    console.log('🔗 查看交易:', `https://tronscan.org/#/transaction/${result.txid}`);
    if (result.energyRental) {
      console.log('⚡ 能量租赁:', result.energyRental.success ? '✅ 成功' : '❌ 失败');
      if (result.energyRental.success) {
        console.log('   获得能量:', result.energyRental.energyReceived);
      }
    }
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

    // 刷新钱包余额
    console.log('\n🔄 刷新钱包余额...');
    const updatedWallet = await Wallet.findById(selectedWallet._id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💰 TRX 余额:', updatedWallet.balance.trx.toFixed(6), 'TRX');
    console.log('💵 USDT 余额:', updatedWallet.balance.usdt.toFixed(6), 'USDT');
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
