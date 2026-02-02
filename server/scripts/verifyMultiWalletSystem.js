// 验证系统是否正确使用多钱包系统
const mongoose = require('mongoose');
require('dotenv').config();

const Wallet = require('../models/Wallet');
const Settings = require('../models/Settings');
const Payment = require('../models/Payment');

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 数据库连接成功\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 多钱包系统验证');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 1. 检查 Wallet 模型中的钱包
    console.log('1️⃣  检查多钱包系统配置\n');
    const wallets = await Wallet.find();
    
    if (wallets.length === 0) {
      console.log('❌ 没有配置任何钱包！');
      console.log('   请在管理后台添加钱包：代付系统 → 代付钱包\n');
    } else {
      console.log(`✅ 找到 ${wallets.length} 个钱包：\n`);
      wallets.forEach((wallet, index) => {
        console.log(`   ${index + 1}. ${wallet.name}`);
        console.log(`      地址: ${wallet.address}`);
        console.log(`      状态: ${wallet.enabled ? '✅ 启用' : '❌ 禁用'}`);
        console.log(`      优先级: ${wallet.priority}`);
        console.log(`      TRX: ${wallet.balance.trx.toFixed(2)}`);
        console.log(`      USDT: ${wallet.balance.usdt.toFixed(2)}`);
        console.log('');
      });
    }

    // 2. 检查 Settings 中的旧配置
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('2️⃣  检查旧的单钱包配置\n');
    
    const settings = await Settings.findOne();
    if (settings && settings.tronPrivateKeyEncrypted) {
      console.log('⚠️  Settings 中仍有旧的私钥配置');
      console.log('   但代付系统已不再使用此配置');
      console.log('   可以安全地删除（或保留作为备份）\n');
      
      // 尝试解密并显示旧钱包地址
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
          console.log('   ✅ 此地址已在多钱包列表中');
        } else {
          console.log('   ⚠️  此地址不在多钱包列表中');
          console.log('   建议：将此钱包添加到多钱包系统');
        }
        console.log('');
      } catch (error) {
        console.log('   无法解密旧私钥\n');
      }
    } else {
      console.log('✅ Settings 中没有旧的私钥配置\n');
    }

    // 3. 检查最近的订单使用的钱包
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('3️⃣  检查最近订单使用的钱包\n');
    
    const recentPayments = await Payment.find({ status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(10);
    
    if (recentPayments.length === 0) {
      console.log('   没有已完成的订单\n');
    } else {
      console.log(`   最近 ${recentPayments.length} 个已完成订单：\n`);
      
      const walletUsage = {};
      recentPayments.forEach(payment => {
        const walletName = payment.walletName || '未记录';
        walletUsage[walletName] = (walletUsage[walletName] || 0) + 1;
      });
      
      Object.entries(walletUsage).forEach(([name, count]) => {
        console.log(`   ${name}: ${count} 笔订单`);
      });
      
      console.log('\n   最近一笔订单详情:');
      const latest = recentPayments[0];
      console.log(`   订单号: ${latest.platformOrderId}`);
      console.log(`   使用钱包: ${latest.walletName || '未记录'}`);
      console.log(`   金额: ${latest.amount} ${latest.payType}`);
      console.log(`   交易哈希: ${latest.txHash || '无'}`);
      console.log(`   完成时间: ${latest.transferTime?.toLocaleString('zh-CN') || '未知'}`);
      console.log('');
    }

    // 4. 验证代付逻辑
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('4️⃣  验证代付逻辑\n');
    
    // 检查 payments.js 中的代码
    const fs = require('fs');
    const paymentsCode = fs.readFileSync('server/routes/payments.js', 'utf8');
    
    const usesWalletSelector = paymentsCode.includes('walletSelector.selectBestWallet');
    const usesSendUSDTWithWallet = paymentsCode.includes('sendUSDTWithWallet');
    const usesOldSendUSDT = paymentsCode.includes('tronService.sendUSDT(payment.address');
    
    console.log(`   使用钱包选择器: ${usesWalletSelector ? '✅' : '❌'}`);
    console.log(`   使用多钱包转账方法: ${usesSendUSDTWithWallet ? '✅' : '❌'}`);
    console.log(`   使用旧的转账方法: ${usesOldSendUSDT ? '❌ 警告！' : '✅'}`);
    console.log('');

    // 5. 总结
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 验证总结\n');
    
    const enabledWallets = wallets.filter(w => w.enabled);
    const hasOldConfig = settings && settings.tronPrivateKeyEncrypted;
    
    if (enabledWallets.length > 0 && usesWalletSelector && usesSendUSDTWithWallet && !usesOldSendUSDT) {
      console.log('✅ 系统已正确配置为使用多钱包系统');
      console.log('✅ 代付逻辑使用钱包选择器');
      console.log('✅ 不会使用旧的单钱包配置');
      
      if (hasOldConfig) {
        console.log('\n💡 建议：');
        console.log('   Settings 中的旧私钥配置可以删除');
        console.log('   或保留作为备份（不会被使用）');
      }
      
      console.log('\n🎉 系统状态：正常');
    } else {
      console.log('⚠️  系统配置可能有问题：');
      if (enabledWallets.length === 0) {
        console.log('   - 没有启用的钱包');
      }
      if (!usesWalletSelector) {
        console.log('   - 代付逻辑未使用钱包选择器');
      }
      if (!usesSendUSDTWithWallet) {
        console.log('   - 代付逻辑未使用多钱包转账方法');
      }
      if (usesOldSendUSDT) {
        console.log('   - 代付逻辑仍在使用旧的转账方法');
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

main();
