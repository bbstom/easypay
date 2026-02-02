// 检查钱包余额并重试失败的订单（多钱包版本）
const mongoose = require('mongoose');
require('dotenv').config();

const Payment = require('../models/Payment');
const Wallet = require('../models/Wallet');
const tronService = require('../services/tronService');
const walletSelector = require('../services/walletSelector');

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 数据库连接成功\n');

    // 1. 检查所有钱包状态
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 第一步：检查钱包状态');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const wallets = await Wallet.find({ enabled: true });
    
    if (wallets.length === 0) {
      console.log('❌ 没有可用的钱包！');
      console.log('   请先在管理后台添加钱包\n');
      await mongoose.disconnect();
      return;
    }

    console.log(`找到 ${wallets.length} 个启用的钱包：\n`);
    
    let hasEnoughBalance = false;
    wallets.forEach((wallet, index) => {
      console.log(`${index + 1}. ${wallet.name}`);
      console.log(`   地址: ${wallet.address}`);
      console.log(`   TRX: ${wallet.balance.trx.toFixed(2)} | USDT: ${wallet.balance.usdt.toFixed(2)}`);
      console.log(`   状态: ${wallet.health.status}`);
      console.log(`   优先级: ${wallet.priority}\n`);
      
      if (wallet.balance.trx >= 20 || wallet.balance.usdt >= 10) {
        hasEnoughBalance = true;
      }
    });

    if (!hasEnoughBalance) {
      console.log('❌ 所有钱包余额都不足！');
      console.log('   建议: 至少一个钱包有 100 TRX 或 100 USDT\n');
      await mongoose.disconnect();
      return;
    }

    console.log('✅ 至少有一个钱包余额充足\n');

    // 2. 查找失败的订单
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 第二步：查找失败的订单');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const failedPayments = await Payment.find({
      paymentStatus: 'paid',
      transferStatus: 'failed'
    }).sort({ createdAt: -1 }).limit(10);

    if (failedPayments.length === 0) {
      console.log('✅ 没有失败的订单需要重试\n');
      await mongoose.disconnect();
      return;
    }

    console.log(`找到 ${failedPayments.length} 个失败的订单：\n`);
    
    failedPayments.forEach((payment, index) => {
      console.log(`${index + 1}. 订单号: ${payment.platformOrderId}`);
      console.log(`   类型: ${payment.payType}`);
      console.log(`   金额: ${payment.amount}`);
      console.log(`   地址: ${payment.address}`);
      console.log(`   创建时间: ${payment.createdAt.toLocaleString('zh-CN')}`);
      console.log('');
    });

    // 3. 询问是否重试
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔄 第三步：重试失败的订单');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 从命令行参数获取是否自动重试
    const autoRetry = process.argv.includes('--auto');

    if (!autoRetry) {
      console.log('💡 提示：');
      console.log('   运行 "node server/scripts/checkWalletAndRetry.js --auto" 自动重试所有失败订单');
      console.log('   或运行 "node server/scripts/checkOrderStatus.js <订单号>" 重试单个订单\n');
      await mongoose.disconnect();
      return;
    }

    // 自动重试所有失败订单
    console.log('🔄 开始自动重试所有失败订单（使用多钱包系统）...\n');

    for (const payment of failedPayments) {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`处理订单: ${payment.platformOrderId}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

      try {
        // 使用钱包选择器选择最优钱包
        console.log('🎯 选择最优钱包...');
        const selectedWallet = await walletSelector.selectBestWallet({
          amount: payment.amount,
          type: payment.payType,
          estimatedFee: 15
        });

        console.log(`✅ 选中钱包: ${selectedWallet.name}\n`);

        // 更新状态为处理中
        payment.transferStatus = 'processing';
        await payment.save();

        console.log(`🔄 开始执行 ${payment.payType} 转账...`);

        let txResult;
        if (payment.payType === 'USDT') {
          txResult = await tronService.sendUSDTWithWallet(selectedWallet, payment.address, payment.amount);
        } else {
          txResult = await tronService.sendTRXWithWallet(selectedWallet, payment.address, payment.amount);
        }

        // 更新订单状态
        payment.txHash = txResult.txid;
        payment.transferStatus = 'completed';
        payment.transferTime = new Date();
        payment.status = 'completed';
        payment.walletId = selectedWallet._id;
        payment.walletName = selectedWallet.name;
        await payment.save();

        console.log(`✅ 转账成功！`);
        console.log(`   使用钱包: ${selectedWallet.name}`);
        console.log(`   交易哈希: ${payment.txHash}`);
        console.log(`   查看交易: https://tronscan.org/#/transaction/${payment.txHash}\n`);

      } catch (error) {
        console.error(`❌ 转账失败:`, error.message);
        payment.transferStatus = 'failed';
        payment.status = 'failed';
        await payment.save();
        console.log('');
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 所有订单处理完成');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

main();
