require('dotenv').config();
const mongoose = require('mongoose');
const Wallet = require('../models/Wallet');
const walletService = require('../services/walletService');

async function listWallets() {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/easypay');
    console.log('✅ 数据库连接成功\n');

    const wallets = await walletService.listWallets();

    if (wallets.length === 0) {
      console.log('ℹ️  暂无钱包');
      console.log('💡 提示: 运行 node server/scripts/migrateToMultiWallet.js 迁移旧钱包\n');
      return;
    }

    console.log(`📋 钱包列表 (共 ${wallets.length} 个):\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    for (const wallet of wallets) {
      const statusIcon = wallet.enabled ? '✓' : '✗';
      const healthIcon = 
        wallet.health.status === 'healthy' ? '●' :
        wallet.health.status === 'warning' ? '⚠' :
        wallet.health.status === 'error' ? '✗' : '○';

      console.log(`${statusIcon} ${wallet.name}`);
      console.log(`   ID: ${wallet._id}`);
      console.log(`   地址: ${wallet.address}`);
      console.log(`   优先级: ${wallet.priority}`);
      console.log(`   状态: ${healthIcon} ${wallet.health.status}`);
      console.log(`   余额: TRX ${wallet.balance.trx.toFixed(2)} | USDT ${wallet.balance.usdt.toFixed(2)}`);
      console.log(`   能量: ${wallet.resources.energy.available.toLocaleString()} / ${wallet.resources.energy.limit.toLocaleString()}`);
      console.log(`   带宽: ${wallet.resources.bandwidth.available.toLocaleString()} / ${wallet.resources.bandwidth.limit.toLocaleString()}`);
      console.log(`   交易: ${wallet.stats.totalTransactions} 笔 (成功率: ${wallet.successRate}%)`);
      console.log(`   最后使用: ${wallet.stats.lastUsedAt ? new Date(wallet.stats.lastUsedAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) : '从未使用'}`);
      
      if (wallet.needsAlert) {
        console.log(`   ⚠️  预警: 余额或资源不足`);
      }
      
      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 显示汇总统计
    const stats = await walletService.getAllWalletsStats();
    console.log('📊 汇总统计:');
    console.log(`   总钱包数: ${stats.total}`);
    console.log(`   启用: ${stats.enabled} | 禁用: ${stats.disabled}`);
    console.log(`   健康: ${stats.healthy} | 警告: ${stats.warning} | 错误: ${stats.error}`);
    console.log(`   总余额: TRX ${stats.totalBalance.trx.toFixed(2)} | USDT ${stats.totalBalance.usdt.toFixed(2)}`);
    console.log(`   总交易: ${stats.totalTransactions} 笔 (成功: ${stats.totalSuccess}, 失败: ${stats.totalFail})`);
    console.log('');

  } catch (error) {
    console.error('❌ 查询失败:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

listWallets();
