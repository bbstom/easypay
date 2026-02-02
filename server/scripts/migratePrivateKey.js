require('dotenv').config();
const mongoose = require('mongoose');
const Settings = require('../models/Settings');
const { encryptPrivateKey, getMasterKey } = require('../utils/encryption');
const TronWeb = require('tronweb');

async function migratePrivateKey() {
  try {
    console.log('🔗 连接数据库...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 数据库连接成功\n');

    const settings = await Settings.findOne();
    
    if (!settings) {
      console.log('⚠️  未找到设置记录');
      process.exit(0);
    }

    // 检查是否已经迁移
    if (settings.tronPrivateKeyEncrypted) {
      console.log('✅ 私钥已经加密，无需迁移');
      process.exit(0);
    }

    // 检查是否有旧的未加密私钥
    if (!settings.tronPrivateKey) {
      console.log('⚠️  未找到私钥，无需迁移');
      process.exit(0);
    }

    console.log('🔄 开始迁移私钥...');
    console.log('原始私钥长度:', settings.tronPrivateKey.length);

    // 获取钱包地址
    const tronWeb = new TronWeb.TronWeb({
      fullHost: settings.tronApiUrl || 'https://api.trongrid.io',
      privateKey: settings.tronPrivateKey
    });
    const walletAddress = tronWeb.defaultAddress.base58;
    console.log('钱包地址:', walletAddress);

    // 加密私钥
    const masterKey = getMasterKey();
    const encryptedPrivateKey = encryptPrivateKey(settings.tronPrivateKey, masterKey);
    console.log('✅ 私钥已加密');

    // 更新数据库
    settings.tronPrivateKeyEncrypted = encryptedPrivateKey;
    settings.tronWalletAddress = walletAddress;
    settings.tronPrivateKey = undefined; // 删除旧字段
    await settings.save();

    console.log('✅ 数据库已更新');
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 迁移完成！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('钱包地址:', walletAddress);
    console.log('私钥已加密存储');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ 迁移失败:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

migratePrivateKey();
