require('dotenv').config();
const mongoose = require('mongoose');
const exchangeRateService = require('../services/exchangeRateService');

async function testExchangeRate() {
  try {
    console.log('🔗 连接数据库...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fastpay');
    console.log('✅ 数据库连接成功\n');

    console.log('📊 测试汇率获取服务...\n');
    
    // 测试获取汇率
    console.log('1️⃣ 从CoinGecko获取汇率...');
    await exchangeRateService.forceUpdate();
    
    // 获取缓存信息
    console.log('\n2️⃣ 查看缓存信息...');
    const cacheInfo = exchangeRateService.getCacheInfo();
    console.log('缓存汇率:', cacheInfo.rates);
    console.log('最后更新:', cacheInfo.lastUpdate);
    console.log('下次更新:', cacheInfo.nextUpdate);
    
    console.log('\n✅ 测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 数据库连接已关闭');
    process.exit(0);
  }
}

testExchangeRate();
