require('dotenv').config();
const mongoose = require('mongoose');
const walletSelector = require('../services/walletSelector');
const Wallet = require('../models/Wallet');

async function testWalletSelector() {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/easypay');
    console.log('✅ 数据库连接成功\n');

    // 测试场景 1: 小额 USDT 转账
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 测试场景 1: 小额 USDT 转账（10 USDT）');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
      const wallet1 = await walletSelector.selectBestWallet({
        amount: 10,
        type: 'USDT',
        estimatedFee: 15
      });
      console.log(`✅ 选中钱包: ${wallet1.name}\n`);
    } catch (error) {
      console.log(`❌ 选择失败: ${error.message}\n`);
    }

    // 测试场景 2: 大额 USDT 转账
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 测试场景 2: 大额 USDT 转账（1000 USDT）');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
      const wallet2 = await walletSelector.selectBestWallet({
        amount: 1000,
        type: 'USDT',
        estimatedFee: 15
      });
      console.log(`✅ 选中钱包: ${wallet2.name}\n`);
    } catch (error) {
      console.log(`❌ 选择失败: ${error.message}\n`);
    }

    // 测试场景 3: TRX 转账
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 测试场景 3: TRX 转账（50 TRX）');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
      const wallet3 = await walletSelector.selectBestWallet({
        amount: 50,
        type: 'TRX',
        estimatedFee: 1
      });
      console.log(`✅ 选中钱包: ${wallet3.name}\n`);
    } catch (error) {
      console.log(`❌ 选择失败: ${error.message}\n`);
    }

    // 获取所有钱包的推荐列表
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 钱包推荐列表（10 USDT 转账）');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const recommendations = await walletSelector.getWalletRecommendations({
      amount: 10,
      type: 'USDT',
      estimatedFee: 15
    });

    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec.name}`);
      console.log(`   地址: ${rec.address}`);
      console.log(`   优先级: ${rec.priority}`);
      console.log(`   余额: TRX ${rec.balance.trx.toFixed(2)} | USDT ${rec.balance.usdt.toFixed(2)}`);
      console.log(`   健康: ${rec.health}`);
      console.log(`   得分: ${rec.score}`);
      console.log(`   状态: ${rec.eligible ? '✅ 符合条件' : `❌ ${rec.reason}`}`);
      console.log('');
    });

    // 显示当前所有钱包状态
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 当前所有钱包状态');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const allWallets = await Wallet.find();
    console.log(`总钱包数: ${allWallets.length}`);
    console.log(`启用: ${allWallets.filter(w => w.enabled).length}`);
    console.log(`禁用: ${allWallets.filter(w => !w.enabled).length}\n`);

    allWallets.forEach((wallet, index) => {
      console.log(`${index + 1}. ${wallet.name} ${wallet.enabled ? '✓' : '✗'}`);
      console.log(`   地址: ${wallet.address}`);
      console.log(`   优先级: ${wallet.priority}`);
      console.log(`   余额: TRX ${wallet.balance.trx.toFixed(2)} | USDT ${wallet.balance.usdt.toFixed(2)}`);
      console.log(`   健康: ${wallet.health.status}`);
      console.log(`   交易: ${wallet.stats.totalTransactions} 笔 (成功 ${wallet.stats.successfulTransactions}, 失败 ${wallet.stats.failedTransactions})`);
      console.log(`   最后使用: ${wallet.stats.lastUsed ? new Date(wallet.stats.lastUsed).toLocaleString('zh-CN') : '从未使用'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testWalletSelector();
