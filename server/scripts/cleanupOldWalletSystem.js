// 清理旧的单钱包系统配置
const mongoose = require('mongoose');
require('dotenv').config();

const Settings = require('../models/Settings');
const Wallet = require('../models/Wallet');

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 数据库连接成功\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧹 清理旧的单钱包系统');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 1. 检查当前状态
    console.log('1️⃣  检查当前状态\n');
    
    const settings = await Settings.findOne();
    const wallets = await Wallet.find({ enabled: true });

    console.log(`多钱包系统: ${wallets.length} 个启用的钱包`);
    wallets.forEach(w => {
      console.log(`   - ${w.name} (${w.address})`);
    });

    if (settings && settings.tronPrivateKeyEncrypted) {
      console.log(`\n旧单钱包配置: 存在`);
      
      // 尝试显示旧钱包地址
      try {
        const { decryptPrivateKey, getMasterKey } = require('../utils/encryption');
        const TronWeb = require('tronweb').TronWeb;
        
        const masterKey = getMasterKey();
        const oldPrivateKey = decryptPrivateKey(settings.tronPrivateKeyEncrypted, masterKey);
        
        const tempTronWeb = new TronWeb({
          fullHost: 'https://api.trongrid.io',
          privateKey: oldPrivateKey
        });
        
        const oldAddress = tempTronWeb.defaultAddress.base58;
        console.log(`   旧钱包地址: ${oldAddress}`);
        
        // 检查是否在多钱包列表中
        const isInWalletList = wallets.some(w => w.address === oldAddress);
        if (isInWalletList) {
          console.log(`   ✅ 此地址已在多钱包列表中`);
        } else {
          console.log(`   ⚠️  此地址不在多钱包列表中`);
          console.log(`   建议: 先将此钱包添加到多钱包系统，再执行清理`);
        }
      } catch (error) {
        console.log(`   无法解密旧私钥: ${error.message}`);
      }
    } else {
      console.log(`\n旧单钱包配置: 不存在`);
    }

    // 2. 确认清理
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('2️⃣  清理操作\n');

    if (!settings) {
      console.log('❌ 未找到 Settings 配置');
      await mongoose.disconnect();
      return;
    }

    if (wallets.length === 0) {
      console.log('⚠️  警告: 没有启用的多钱包！');
      console.log('   请先在管理后台添加钱包，再执行清理\n');
      await mongoose.disconnect();
      return;
    }

    // 检查是否有旧配置需要清理
    const hasOldConfig = settings.tronPrivateKeyEncrypted || 
                        settings.tronWalletAddress ||
                        settings.tronApiUrl ||
                        settings.tronGridApiKey;

    if (!hasOldConfig) {
      console.log('✅ 没有旧配置需要清理\n');
      await mongoose.disconnect();
      return;
    }

    console.log('将要删除以下字段:');
    if (settings.tronPrivateKeyEncrypted) console.log('   - tronPrivateKeyEncrypted');
    if (settings.tronWalletAddress) console.log('   - tronWalletAddress');
    if (settings.tronApiUrl) console.log('   - tronApiUrl');
    if (settings.tronGridApiKey) console.log('   - tronGridApiKey');

    // 从命令行参数获取确认
    const confirmed = process.argv.includes('--confirm');

    if (!confirmed) {
      console.log('\n⚠️  这是一个危险操作！');
      console.log('   删除后无法恢复（除非从备份恢复）');
      console.log('\n💡 如果确认要执行，请运行:');
      console.log('   node server/scripts/cleanupOldWalletSystem.js --confirm\n');
      await mongoose.disconnect();
      return;
    }

    // 3. 执行清理
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('3️⃣  执行清理\n');

    console.log('🗑️  删除旧配置字段...');

    const updateResult = await Settings.updateOne(
      {},
      {
        $unset: {
          tronPrivateKeyEncrypted: "",
          tronWalletAddress: "",
          tronApiUrl: "",
          tronGridApiKey: ""
        }
      }
    );

    if (updateResult.modifiedCount > 0) {
      console.log('✅ 旧配置已删除\n');
    } else {
      console.log('⚠️  没有字段被删除（可能已经清理过）\n');
    }

    // 4. 验证清理结果
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('4️⃣  验证清理结果\n');

    const updatedSettings = await Settings.findOne();
    
    const stillHasOldConfig = updatedSettings.tronPrivateKeyEncrypted || 
                             updatedSettings.tronWalletAddress ||
                             updatedSettings.tronApiUrl ||
                             updatedSettings.tronGridApiKey;

    if (stillHasOldConfig) {
      console.log('❌ 清理失败，仍有旧配置存在');
    } else {
      console.log('✅ 清理成功！');
      console.log('\n保留的配置:');
      console.log(`   - tronApiNodes: ${updatedSettings.tronApiNodes ? '已配置' : '未配置'}`);
      console.log(`   - energyRentalAddress: ${updatedSettings.energyRentalAddress || '未配置'}`);
      console.log(`   - energyRentalEnabled: ${updatedSettings.energyRentalEnabled ? '已启用' : '未启用'}`);
    }

    // 5. 后续步骤
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 后续步骤\n');
    console.log('1. 验证多钱包系统:');
    console.log('   node server/scripts/verifyMultiWalletSystem.js\n');
    console.log('2. 测试完整流程:');
    console.log('   node server/scripts/testCompletePaymentFlow.js <地址> 1\n');
    console.log('3. 重启服务:');
    console.log('   npm run server\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

main();
