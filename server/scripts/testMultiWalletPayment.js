// 测试多钱包系统代付功能
const mongoose = require('mongoose');
require('dotenv').config();

const Wallet = require('../models/Wallet');
const walletSelector = require('../services/walletSelector');
const tronService = require('../services/tronService');

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 数据库连接成功\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 第一步：查看所有钱包');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const allWallets = await Wallet.find().sort({ priority: -1 });
    
    if (allWallets.length === 0) {
      console.log('❌ 没有配置任何钱包！');
      console.log('\n请在管理后台添加钱包：');
      console.log('   代付系统 → 代付钱包 → 添加钱包\n');
      await mongoose.disconnect();
      return;
    }

    console.log(`找到 ${allWallets.length} 个钱包：\n`);
    
    for (const wallet of allWallets) {
      console.log(`📍 钱包: ${wallet.name}`);
      console.log(`   地址: ${wallet.address}`);
      console.log(`   状态: ${wallet.enabled ? '✅ 启用' : '❌ 禁用'}`);
      console.log(`   优先级: ${wallet.priority}`);
      console.log(`   健康状态: ${wallet.health.status}`);
      console.log(`   TRX 余额: ${wallet.balance.trx.toFixed(2)} TRX`);
      console.log(`   USDT 余额: ${wallet.balance.usdt.toFixed(2)} USDT`);
      console.log(`   最后更新: ${wallet.balance.lastUpdated.toLocaleString('zh-CN')}`);
      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔄 第二步：刷新钱包余额');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 初始化 TronWeb
    await tronService.initialize();

    for (const wallet of allWallets) {
      try {
        console.log(`🔄 刷新钱包: ${wallet.name}...`);
        
        const trxBalance = await tronService.getBalance(wallet.address);
        const usdtBalance = await tronService.getUSDTBalance(wallet.address);

        wallet.balance.trx = trxBalance;
        wallet.balance.usdt = usdtBalance;
        wallet.balance.lastUpdated = new Date();
        await wallet.save();

        console.log(`   ✅ TRX: ${trxBalance.toFixed(2)}`);
        console.log(`   ✅ USDT: ${usdtBalance.toFixed(2)}\n`);
      } catch (error) {
        console.error(`   ❌ 刷新失败: ${error.message}\n`);
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 第三步：测试钱包选择');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 测试场景1：USDT 转账
    console.log('场景 1: 转账 10 USDT\n');
    try {
      const recommendations = await walletSelector.getWalletRecommendations({
        amount: 10,
        type: 'USDT',
        estimatedFee: 15
      });

      console.log('钱包推荐列表：\n');
      recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec.name} (${rec.address.slice(0, 8)}...)`);
        console.log(`   优先级: ${rec.priority}`);
        console.log(`   TRX: ${rec.balance.trx.toFixed(2)} | USDT: ${rec.balance.usdt.toFixed(2)}`);
        console.log(`   健康: ${rec.health}`);
        console.log(`   符合条件: ${rec.eligible ? '✅' : '❌'}`);
        console.log(`   得分: ${rec.score}`);
        if (!rec.eligible) {
          console.log(`   原因: ${rec.reason}`);
        }
        console.log('');
      });

      const selected = await walletSelector.selectBestWallet({
        amount: 10,
        type: 'USDT',
        estimatedFee: 15
      });

      console.log(`✅ 最终选择: ${selected.name}\n`);
    } catch (error) {
      console.error(`❌ 选择失败: ${error.message}\n`);
    }

    // 测试场景2：TRX 转账
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('场景 2: 转账 50 TRX\n');
    try {
      const selected = await walletSelector.selectBestWallet({
        amount: 50,
        type: 'TRX',
        estimatedFee: 1
      });

      console.log(`✅ 最终选择: ${selected.name}\n`);
    } catch (error) {
      console.error(`❌ 选择失败: ${error.message}\n`);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 第四步：检查可用性');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const enabledWallets = allWallets.filter(w => w.enabled);
    const healthyWallets = allWallets.filter(w => w.enabled && w.health.status === 'healthy');
    const walletsWithBalance = allWallets.filter(w => 
      w.enabled && 
      w.balance.trx >= 20 && 
      w.balance.usdt >= 10
    );

    console.log(`✅ 启用的钱包: ${enabledWallets.length}/${allWallets.length}`);
    console.log(`✅ 健康的钱包: ${healthyWallets.length}/${allWallets.length}`);
    console.log(`✅ 余额充足的钱包: ${walletsWithBalance.length}/${allWallets.length}\n`);

    if (walletsWithBalance.length === 0) {
      console.log('⚠️  警告：没有余额充足的钱包！');
      console.log('\n建议：');
      console.log('1. 向钱包充值 TRX 和 USDT');
      console.log('2. 或添加新的钱包\n');
    } else {
      console.log('✅ 系统可以正常处理代付订单\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 测试完成');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

main();
