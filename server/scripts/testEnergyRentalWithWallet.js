// 测试多钱包系统的能量租赁功能
const mongoose = require('mongoose');
require('dotenv').config();

const Wallet = require('../models/Wallet');
const Settings = require('../models/Settings');
const tronService = require('../services/tronService');

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 数据库连接成功\n');

    // 1. 获取第一个启用的钱包
    const wallet = await Wallet.findOne({ enabled: true });
    if (!wallet) {
      console.error('❌ 没有启用的钱包');
      process.exit(1);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📍 测试钱包信息');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`钱包名称: ${wallet.name}`);
    console.log(`钱包地址: ${wallet.address}`);
    console.log(`TRX 余额: ${wallet.balance.trx.toFixed(2)} TRX`);
    console.log(`USDT 余额: ${wallet.balance.usdt.toFixed(2)} USDT\n`);

    // 2. 获取系统设置
    const settings = await Settings.findOne();
    if (!settings) {
      console.error('❌ 系统设置未配置');
      process.exit(1);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚙️  能量租赁配置');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`启用状态: ${settings.energyRentalEnabled ? '✅ 已启用' : '❌ 未启用'}`);
    console.log(`租赁模式: ${settings.energyRentalMode || 'transfer'}`);
    
    if (settings.energyRentalMode === 'catfee') {
      console.log(`CatFee API: ${settings.catfeeApiKey ? '已配置' : '未配置'}`);
      console.log(`首次转账能量: ${settings.catfeeEnergyFirst || 131000}`);
      console.log(`正常转账能量: ${settings.catfeeEnergyNormal || 65000}`);
      console.log(`租赁时长: ${settings.catfeePeriod || 1} 小时`);
    } else {
      console.log(`租赁地址: ${settings.energyRentalAddress || '未配置'}`);
      console.log(`首次转账金额: ${settings.energyRentalAmountFirst || 6} TRX`);
      console.log(`正常转账金额: ${settings.energyRentalAmountNormal || 3} TRX`);
      console.log(`等待时间: ${settings.energyRentalWaitTime || 20} 秒`);
    }

    if (!settings.energyRentalEnabled) {
      console.log('\n⚠️  能量租赁未启用，无法测试');
      console.log('请在管理后台启用：代付系统 → 能量租赁\n');
      await mongoose.disconnect();
      return;
    }

    // 3. 初始化 TronWeb
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔄 初始化 TronWeb');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    await tronService.initialize();

    // 4. 检查当前能量
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 检查当前能量');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const beforeResources = await tronService.getAccountResources(wallet.address);
    console.log(`当前能量: ${beforeResources.energyRemaining.toLocaleString()}`);
    console.log(`能量上限: ${beforeResources.energyLimit.toLocaleString()}`);
    console.log(`已使用: ${beforeResources.energyUsed.toLocaleString()}\n`);

    // 5. 测试能量租赁
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔋 测试能量租赁（正常转账模式）');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 创建临时 TronWeb 实例
    const { decryptPrivateKey, getMasterKey } = require('../utils/encryption');
    const TronWebModule = require('tronweb');
    const TronWeb = TronWebModule.TronWeb;

    const masterKey = getMasterKey();
    const privateKey = decryptPrivateKey(wallet.privateKeyEncrypted, masterKey);

    const tempTronWeb = new TronWeb({
      fullHost: tronService.currentApiUrl,
      privateKey: privateKey,
      headers: tronService.apiKey ? { 'TRON-PRO-API-KEY': tronService.apiKey } : {}
    });

    let result;
    if (settings.energyRentalMode === 'catfee') {
      result = await tronService.rentEnergyViaCatFeeWithWallet(
        wallet.address,
        false, // 正常转账
        beforeResources,
        settings
      );
    } else {
      result = await tronService.rentEnergyViaTransferWithWallet(
        tempTronWeb,
        wallet.address,
        false, // 正常转账
        beforeResources,
        settings
      );
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 租赁结果');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (result.success) {
      console.log('✅ 能量租赁成功！');
      console.log(`   模式: ${result.mode}`);
      console.log(`   租赁前能量: ${result.energyBefore.toLocaleString()}`);
      console.log(`   租赁后能量: ${result.energyAfter.toLocaleString()}`);
      console.log(`   获得能量: ${result.energyReceived.toLocaleString()}`);
      
      if (result.mode === 'transfer') {
        console.log(`   交易哈希: ${result.txid}`);
        console.log(`   花费: ${result.cost} TRX`);
        console.log(`   查看交易: https://tronscan.org/#/transaction/${result.txid}`);
      } else {
        console.log(`   订单号: ${result.orderNo}`);
        console.log(`   购买能量: ${result.energyPurchased.toLocaleString()}`);
      }
    } else {
      console.log('❌ 能量租赁失败');
      console.log(`   原因: ${result.message}`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 测试完成');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

main();
