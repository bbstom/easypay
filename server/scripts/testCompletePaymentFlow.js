// 测试完整的代付流程（包括能量租赁）
const mongoose = require('mongoose');
require('dotenv').config();

const Payment = require('../models/Payment');
const Wallet = require('../models/Wallet');
const Settings = require('../models/Settings');
const walletSelector = require('../services/walletSelector');
const tronService = require('../services/tronService');

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 数据库连接成功\n');

    // 测试参数
    const testAddress = process.argv[2] || 'TJd6DHc17v62vL45fcofcmFZPJdz8HpovD';
    const testAmount = parseFloat(process.argv[3]) || 1;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧪 完整代付流程测试');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`收款地址: ${testAddress}`);
    console.log(`转账金额: ${testAmount} USDT\n`);

    // 1. 选择最优钱包
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 步骤 1: 选择最优钱包');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const selectedWallet = await walletSelector.selectBestWallet({
      amount: testAmount,
      type: 'USDT',
      estimatedFee: 15
    });

    // 2. 检查能量租赁配置
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚙️  步骤 2: 检查能量租赁配置');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const settings = await Settings.findOne();
    console.log(`能量租赁: ${settings.energyRentalEnabled ? '✅ 已启用' : '❌ 未启用'}`);
    if (settings.energyRentalEnabled) {
      console.log(`租赁模式: ${settings.energyRentalMode || 'transfer'}`);
      if (settings.energyRentalMode === 'catfee') {
        console.log(`CatFee 配置: ${settings.catfeeApiKey ? '✅ 已配置' : '❌ 未配置'}`);
      } else {
        console.log(`租赁地址: ${settings.energyRentalAddress || '未配置'}`);
        console.log(`正常转账: ${settings.energyRentalAmountNormal || 3} TRX`);
      }
    }

    // 3. 执行转账
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💸 步骤 3: 执行 USDT 转账');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const txResult = await tronService.sendUSDTWithWallet(
      selectedWallet,
      testAddress,
      testAmount
    );

    // 4. 显示结果
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 步骤 4: 转账结果');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (txResult.success) {
      console.log('✅ 转账成功！\n');
      console.log(`使用钱包: ${txResult.walletName}`);
      console.log(`钱包地址: ${txResult.from}`);
      console.log(`收款地址: ${txResult.to}`);
      console.log(`转账金额: ${txResult.amount} USDT`);
      console.log(`交易哈希: ${txResult.txid}`);
      console.log(`\n查看交易: https://tronscan.org/#/transaction/${txResult.txid}`);

      if (txResult.energyRental) {
        console.log('\n🔋 能量租赁信息:');
        if (txResult.energyRental.success) {
          console.log(`   ✅ 租赁成功`);
          console.log(`   模式: ${txResult.energyRental.mode}`);
          console.log(`   获得能量: ${txResult.energyRental.energyReceived.toLocaleString()}`);
          if (txResult.energyRental.mode === 'transfer') {
            console.log(`   花费: ${txResult.energyRental.cost} TRX`);
          }
        } else {
          console.log(`   ⚠️  租赁失败，使用 TRX 支付 gas`);
        }
      }

      // 5. 更新钱包余额
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔄 步骤 5: 更新钱包余额');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      const wallet = await Wallet.findById(selectedWallet._id);
      const trxBalance = await tronService.getBalance(wallet.address);
      const usdtBalance = await tronService.getUSDTBalance(wallet.address);

      wallet.balance.trx = trxBalance;
      wallet.balance.usdt = usdtBalance;
      wallet.balance.lastUpdated = new Date();
      await wallet.save();

      console.log(`✅ 余额已更新`);
      console.log(`   TRX: ${trxBalance.toFixed(2)}`);
      console.log(`   USDT: ${usdtBalance.toFixed(2)}`);

    } else {
      console.log('❌ 转账失败');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 测试完成');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.disconnect();
  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    console.error(error);
    process.exit(1);
  }
}

console.log('\n💡 使用方法:');
console.log('   node server/scripts/testCompletePaymentFlow.js [收款地址] [金额]');
console.log('\n示例:');
console.log('   node server/scripts/testCompletePaymentFlow.js TJd6DHc17v62vL45fcofcmFZPJdz8HpovD 1\n');

main();
