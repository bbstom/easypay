const TronWeb = require('tronweb');
const Settings = require('../models/Settings');
const mongoose = require('mongoose');
require('dotenv').config();

async function testApiKey() {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 数据库连接成功');

    // 获取配置
    const settings = await Settings.findOne();
    if (!settings) {
      console.error('❌ 未找到配置');
      process.exit(1);
    }

    console.log('\n📋 当前配置:');
    console.log('API URL:', settings.tronApiUrl);
    console.log('API Key:', settings.tronGridApiKey ? `${settings.tronGridApiKey.slice(0, 10)}...` : '未配置');
    console.log('钱包地址:', settings.tronWalletAddress);

    // 测试不带 API Key
    console.log('\n🔍 测试 1: 不带 API Key');
    try {
      const tronWeb1 = new TronWeb.TronWeb({
        fullHost: settings.tronApiUrl
      });
      const balance1 = await tronWeb1.trx.getBalance(settings.tronWalletAddress);
      console.log('✅ 成功 - 余额:', balance1 / 1000000, 'TRX');
    } catch (error) {
      console.error('❌ 失败:', error.message);
      if (error.response) {
        console.error('状态码:', error.response.status);
        console.error('响应:', error.response.data);
      }
    }

    // 测试带 API Key
    if (settings.tronGridApiKey) {
      console.log('\n🔍 测试 2: 带 API Key');
      try {
        const tronWeb2 = new TronWeb.TronWeb({
          fullHost: settings.tronApiUrl,
          headers: {
            'TRON-PRO-API-KEY': settings.tronGridApiKey
          }
        });
        const balance2 = await tronWeb2.trx.getBalance(settings.tronWalletAddress);
        console.log('✅ 成功 - 余额:', balance2 / 1000000, 'TRX');
      } catch (error) {
        console.error('❌ 失败:', error.message);
        if (error.response) {
          console.error('状态码:', error.response.status);
          console.error('响应:', error.response.data);
        }
      }

      // 测试多次请求（检查限流）
      console.log('\n🔍 测试 3: 连续 10 次请求（检查限流）');
      const tronWeb3 = new TronWeb.TronWeb({
        fullHost: settings.tronApiUrl,
        headers: {
          'TRON-PRO-API-KEY': settings.tronGridApiKey
        }
      });

      let successCount = 0;
      let failCount = 0;

      for (let i = 1; i <= 10; i++) {
        try {
          await tronWeb3.trx.getBalance(settings.tronWalletAddress);
          successCount++;
          process.stdout.write(`✅ ${i} `);
        } catch (error) {
          failCount++;
          process.stdout.write(`❌ ${i} `);
          if (error.message.includes('429')) {
            console.log('\n⚠️  触发 429 限流');
          }
        }
      }

      console.log(`\n\n📊 结果: 成功 ${successCount}/10, 失败 ${failCount}/10`);
    }

    await mongoose.disconnect();
    console.log('\n✅ 测试完成');
  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  }
}

testApiKey();
