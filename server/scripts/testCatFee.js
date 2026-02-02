const mongoose = require('mongoose');
const catfeeService = require('../services/catfeeService');
const Settings = require('../models/Settings');
require('dotenv').config();

async function testCatFee() {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/easypay');
    console.log('✅ 数据库连接成功\n');

    // 获取配置
    const settings = await Settings.findOne();
    if (!settings || !settings.catfeeApiKey) {
      console.log('❌ 未配置 CatFee API Key');
      console.log('请在钱包配置中设置 CatFee API Key');
      process.exit(1);
    }

    console.log('📋 当前配置:');
    console.log(`API URL: ${settings.catfeeApiUrl || 'https://api.catfee.io'}`);
    console.log(`API Key: ${settings.catfeeApiKey.includes(':') ? settings.catfeeApiKey.split(':')[0].slice(0, 10) + '...' : settings.catfeeApiKey.slice(0, 10) + '...'}`);
    console.log(`首次转账能量: ${settings.catfeeEnergyFirst}`);
    console.log(`正常转账能量: ${settings.catfeeEnergyNormal}`);
    console.log(`租赁时长: ${settings.catfeePeriod} 小时\n`);

    // 设置 API URL 和 Key
    if (settings.catfeeApiUrl) {
      catfeeService.setApiUrl(settings.catfeeApiUrl);
    }
    catfeeService.setApiKey(settings.catfeeApiKey);

    // 测试 1: 获取账户余额
    console.log('🔍 测试 1: 获取账户余额');
    try {
      const balance = await catfeeService.getBalance();
      console.log(`✅ 余额: ${balance.balance} ${balance.currency}\n`);
    } catch (error) {
      console.log(`❌ 失败: ${error.message}\n`);
    }

    // 测试 2: 获取能量价格
    console.log('🔍 测试 2: 获取能量价格');
    try {
      const duration = `${settings.catfeePeriod}h`;
      const price = await catfeeService.getPrice(settings.catfeeEnergyFirst, duration);
      console.log(`✅ ${price.energyAmount} 能量 (${price.duration}) 价格: ${price.price} TRX\n`);
    } catch (error) {
      console.log(`❌ 失败: ${error.message}\n`);
    }

    // 测试 3: 购买能量（可选，需要确认）
    const testAddress = process.argv[2];
    if (testAddress) {
      console.log('🔍 测试 3: 购买能量');
      console.log(`目标地址: ${testAddress}`);
      
      const confirm = process.argv[3] === '--confirm';
      if (!confirm) {
        console.log('⚠️  这是真实购买操作，会消耗余额！');
        console.log('如需执行，请添加 --confirm 参数\n');
      } else {
        try {
          const duration = `${settings.catfeePeriod}h`;
          const result = await catfeeService.buyEnergy(
            testAddress,
            settings.catfeeEnergyFirst,
            duration
          );
          console.log(`✅ 购买成功!`);
          console.log(`   订单号: ${result.orderNo}`);
          console.log(`   能量: ${result.energyAmount}`);
          console.log(`   接收地址: ${result.receiverAddress}`);
          console.log(`   有效期: ${result.duration}\n`);

          // 等待 5 秒后查询订单状态
          console.log('⏳ 5 秒后查询订单状态...');
          await new Promise(resolve => setTimeout(resolve, 5000));

          const orderStatus = await catfeeService.queryOrder(result.orderNo);
          console.log(`📊 订单状态: ${orderStatus.status}`);
          console.log(`   能量: ${orderStatus.energyAmount}\n`);
        } catch (error) {
          console.log(`❌ 失败: ${error.message}\n`);
        }
      }
    }

    console.log('✅ 测试完成');
    console.log('\n使用方法:');
    console.log('  查看余额和价格: node server/scripts/testCatFee.js');
    console.log('  购买能量: node server/scripts/testCatFee.js <地址> --confirm');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testCatFee();
