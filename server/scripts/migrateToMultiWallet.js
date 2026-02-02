const mongoose = require('mongoose');
const Settings = require('../models/Settings');
const Wallet = require('../models/Wallet');
require('dotenv').config();

async function migrateToMultiWallet() {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/easypay');
    console.log('✅ 数据库连接成功\n');

    // 检查是否已有钱包
    const walletCount = await Wallet.countDocuments();
    if (walletCount > 0) {
      console.log(`ℹ️  已存在 ${walletCount} 个钱包，跳过迁移`);
      console.log('   如需重新迁移，请先删除所有钱包\n');
      return;
    }

    // 获取旧的钱包配置
    const settings = await Settings.findOne();
    if (!settings) {
      console.log('❌ 未找到系统配置');
      return;
    }

    // 检查是否有旧的钱包配置
    if (!settings.tronPrivateKeyEncrypted || !settings.tronWalletAddress) {
      console.log('ℹ️  未找到旧的钱包配置，无需迁移\n');
      console.log('💡 提示: 请在管理后台添加新钱包\n');
      return;
    }

    console.log('📋 发现旧的钱包配置:');
    console.log(`   地址: ${settings.tronWalletAddress}`);
    console.log(`   私钥: ${settings.tronPrivateKeyEncrypted ? '已加密' : '未设置'}\n`);

    // 创建默认钱包
    console.log('🔄 正在迁移到多钱包系统...\n');

    const wallet = await Wallet.create({
      name: '默认钱包',
      address: settings.tronWalletAddress,
      privateKeyEncrypted: settings.tronPrivateKeyEncrypted,
      enabled: true,
      priority: 100,
      alerts: {
        minTrxBalance: settings.walletMinTRXBalance || 50,
        minUsdtBalance: settings.walletMinUSDTBalance || 100,
        minEnergy: 50000,
        enabled: true
      }
    });

    console.log('✅ 迁移成功！\n');
    console.log('📋 新钱包信息:');
    console.log(`   ID: ${wallet._id}`);
    console.log(`   名称: ${wallet.name}`);
    console.log(`   地址: ${wallet.address}`);
    console.log(`   优先级: ${wallet.priority}`);
    console.log(`   状态: ${wallet.enabled ? '✓ 启用' : '✗ 禁用'}\n`);

    console.log('💡 提示:');
    console.log('   1. 旧的钱包配置已保留在 Settings 中');
    console.log('   2. 系统将优先使用新的多钱包系统');
    console.log('   3. 可以在管理后台添加更多钱包');
    console.log('   4. 建议刷新钱包状态: node server/scripts/refreshWallets.js\n');

  } catch (error) {
    console.error('❌ 迁移失败:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

migrateToMultiWallet();
