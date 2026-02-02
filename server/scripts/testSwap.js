const mongoose = require('mongoose');
const swapService = require('../services/swapService');
const Settings = require('../models/Settings');
require('dotenv').config();

async function testSwap() {
  try {
    console.log('🔄 连接数据库...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fastpay');
    console.log('✅ 数据库连接成功\n');

    // 测试1: 获取闪兑汇率
    console.log('📊 测试1: 获取闪兑汇率');
    console.log('='.repeat(50));
    const rateInfo = await swapService.getSwapRate();
    console.log('USDT汇率:', rateInfo.usdtCNY, 'CNY');
    console.log('TRX汇率:', rateInfo.trxCNY, 'CNY');
    console.log('闪兑汇率:', rateInfo.rate, 'TRX/USDT');
    console.log('加成:', rateInfo.markup, '%');
    console.log('');

    // 测试2: 计算兑换金额
    console.log('💰 测试2: 计算兑换金额');
    console.log('='.repeat(50));
    const testAmounts = [10, 50, 100, 500, 1000];
    for (const usdtAmount of testAmounts) {
      const trxAmount = (usdtAmount * rateInfo.rate).toFixed(6);
      console.log(`${usdtAmount} USDT → ${trxAmount} TRX`);
    }
    console.log('');

    // 测试3: 查看设置
    console.log('⚙️  测试3: 查看闪兑设置');
    console.log('='.repeat(50));
    const settings = await Settings.findOne();
    if (settings) {
      console.log('闪兑功能:', settings.swapEnabled ? '✅ 已启用' : '❌ 已禁用');
      console.log('汇率加成:', settings.swapRateMarkup, '%');
      console.log('最小金额:', settings.swapMinAmount, 'USDT');
      console.log('最大金额:', settings.swapMaxAmount, 'USDT');
      console.log('订单超时:', settings.swapOrderTimeout, '分钟');
    } else {
      console.log('⚠️  未找到设置');
    }
    console.log('');

    console.log('✅ 测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 数据库连接已关闭');
    process.exit(0);
  }
}

testSwap();
