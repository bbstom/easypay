require('dotenv').config();
const mongoose = require('mongoose');
const Wallet = require('../models/Wallet');

async function checkWalletStatus() {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 数据库连接成功\n');

    // 查询所有钱包
    const allWallets = await Wallet.find({});
    console.log(`📊 数据库中共有 ${allWallets.length} 个钱包\n`);

    if (allWallets.length === 0) {
      console.log('⚠️  没有找到任何钱包');
      process.exit(0);
    }

    // 显示每个钱包的详细信息
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    for (const wallet of allWallets) {
      console.log(`\n钱包名称: ${wallet.name}`);
      console.log(`地址: ${wallet.address}`);
      console.log(`启用状态: ${wallet.enabled ? '✅ 已启用' : '❌ 已禁用'}`);
      console.log(`优先级: ${wallet.priority}`);
      console.log(`健康状态: ${wallet.health.status}`);
      console.log(`TRX 余额: ${wallet.balance.trx.toFixed(2)}`);
      console.log(`USDT 余额: ${wallet.balance.usdt.toFixed(2)}`);
      console.log(`余额更新时间: ${wallet.balance.lastUpdated ? new Date(wallet.balance.lastUpdated).toLocaleString('zh-CN') : '从未更新'}`);
      console.log(`最后使用时间: ${wallet.stats.lastUsedAt ? new Date(wallet.stats.lastUsedAt).toLocaleString('zh-CN') : '从未使用'}`);
      console.log(`总交易次数: ${wallet.stats.totalTransactions}`);
      console.log(`成功次数: ${wallet.stats.successCount}`);
      console.log(`失败次数: ${wallet.stats.failCount}`);
      console.log(`连续失败次数: ${wallet.health.consecutiveFailures}`);
      if (wallet.health.errorMessage) {
        console.log(`错误信息: ${wallet.health.errorMessage}`);
      }
    }
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // 统计信息
    const enabledWallets = allWallets.filter(w => w.enabled);
    const healthyWallets = allWallets.filter(w => w.enabled && w.health.status === 'healthy');
    const errorWallets = allWallets.filter(w => w.health.status === 'error');

    console.log('\n📊 统计信息:');
    console.log(`   总钱包数: ${allWallets.length}`);
    console.log(`   已启用: ${enabledWallets.length}`);
    console.log(`   健康状态: ${healthyWallets.length}`);
    console.log(`   错误状态: ${errorWallets.length}`);

    if (enabledWallets.length === 0) {
      console.log('\n⚠️  警告: 没有启用的钱包！');
      console.log('   请在后台管理页面启用至少一个钱包');
    }

    if (healthyWallets.length === 0 && enabledWallets.length > 0) {
      console.log('\n⚠️  警告: 没有健康状态的钱包！');
      console.log('   所有启用的钱包都处于异常状态');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ 检查失败:', error);
    process.exit(1);
  }
}

checkWalletStatus();
