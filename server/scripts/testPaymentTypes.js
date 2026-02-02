require('dotenv').config();
const mongoose = require('mongoose');
const Settings = require('../models/Settings');
const axios = require('axios');
const crypto = require('crypto');

// 测试不同的支付方式
async function testPaymentTypes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ 已连接到数据库\n');

    const settings = await Settings.findOne();
    if (!settings) {
      console.log('✗ 未找到系统设置');
      process.exit(1);
    }

    console.log('当前配置:');
    console.log('API版本:', settings.paymentApiVersion || 'v1');
    console.log('商户ID:', settings.paymentMerchantId);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 要测试的支付方式列表
    const paymentTypes = [
      'alipay',
      'wxpay',
      'wechat',
      'qqpay',
      'bank',
      'tenpay',
      'jdpay',
      'unionpay'
    ];

    console.log('开始测试不同的支付方式...\n');

    for (const type of paymentTypes) {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`测试支付方式: ${type}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

      const testOrderId = 'TEST' + Date.now() + Math.random().toString(36).substring(2, 5).toUpperCase();

      const params = {
        pid: settings.paymentMerchantId,
        type: type,
        out_trade_no: testOrderId,
        notify_url: 'http://localhost:5000/api/payments/notify',
        return_url: 'http://localhost:5000/pay',
        name: '测试订单',
        money: '0.01',
        sitename: '测试'
      };

      // 生成MD5签名
      const sortedKeys = Object.keys(params).sort();
      const signStr = sortedKeys
        .filter(key => key !== 'sign' && key !== 'sign_type')
        .map(key => `${key}=${params[key]}`)
        .join('&') + settings.paymentApiKey;
      
      params.sign = crypto.createHash('md5').update(signStr).digest('hex');
      params.sign_type = 'MD5';

      try {
        const formData = new URLSearchParams();
        Object.keys(params).forEach(key => {
          formData.append(key, params[key]);
        });

        const response = await axios.post(
          `${settings.paymentApiUrl}/submit.php`,
          formData.toString(),
          {
            timeout: 5000,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            validateStatus: () => true // 接受所有状态码
          }
        );

        // 检查响应
        if (response.data && typeof response.data === 'string') {
          if (response.data.includes('支付方式') && response.data.includes('不存在')) {
            console.log(`❌ ${type}: 不支持`);
          } else if (response.data.includes('payurl') || response.data.includes('code_url') || response.data.includes('qrcode')) {
            console.log(`✅ ${type}: 支持！`);
            console.log('返回数据:', response.data.substring(0, 200));
          } else if (response.data.includes('error') || response.data.includes('错误')) {
            console.log(`⚠️  ${type}: 返回错误`);
            console.log('错误信息:', response.data.substring(0, 200));
          } else {
            console.log(`❓ ${type}: 未知响应`);
            console.log('响应:', response.data.substring(0, 200));
          }
        } else if (response.data && typeof response.data === 'object') {
          if (response.data.code === 1 || response.data.code === 0) {
            console.log(`✅ ${type}: 支持！`);
            console.log('返回数据:', JSON.stringify(response.data));
          } else {
            console.log(`❌ ${type}: ${response.data.msg || '失败'}`);
          }
        }
      } catch (error) {
        console.log(`❌ ${type}: 请求失败 - ${error.message}`);
      }

      console.log(''); // 空行
      
      // 延迟1秒，避免请求过快
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('测试完成！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('建议:');
    console.log('1. 使用标记为 ✅ 的支付方式');
    console.log('2. 在商户后台确认已开通对应的支付方式');
    console.log('3. 联系支付平台技术支持获取完整的支付方式列表\n');

    process.exit(0);
  } catch (error) {
    console.error('测试失败:', error.message);
    process.exit(1);
  }
}

testPaymentTypes();
