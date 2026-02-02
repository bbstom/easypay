require('dotenv').config();
const mongoose = require('mongoose');
const Settings = require('../models/Settings');
const paymentService = require('../services/paymentService');

// 测试支付网关配置
async function testPaymentGateway() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ 已连接到数据库\n');

    // 获取设置
    const settings = await Settings.findOne();
    if (!settings) {
      console.log('✗ 未找到系统设置');
      process.exit(1);
    }

    console.log('当前支付平台配置:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('API版本:', settings.paymentApiVersion || 'v1');
    console.log('支付API地址:', settings.paymentApiUrl || '未配置');
    console.log('商户ID:', settings.paymentMerchantId || '未配置');
    
    if (settings.paymentApiVersion === 'v2') {
      console.log('商户私钥:', settings.paymentApiKey ? '已配置 (RSA ***' + settings.paymentApiKey.slice(-4) + ')' : '未配置');
      console.log('平台公钥:', settings.paymentPublicKey ? '已配置' : '未配置');
    } else {
      console.log('API密钥:', settings.paymentApiKey ? '已配置 (MD5 ***' + settings.paymentApiKey.slice(-4) + ')' : '未配置');
    }
    
    console.log('回调地址:', settings.paymentNotifyUrl || '未配置');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (!settings.paymentApiUrl || !settings.paymentMerchantId || !settings.paymentApiKey) {
      console.log('✗ 支付平台配置不完整！');
      console.log('\n请在后台设置页面完成配置\n');
      process.exit(1);
    }

    console.log('✓ 支付平台配置完整\n');

    // 创建测试订单
    console.log('正在创建测试订单...');
    const testOrderId = 'TEST' + Date.now();
    
    try {
      const result = await paymentService.createPaymentOrder({
        orderId: testOrderId,
        amount: 0.01, // 测试金额 0.01 元
        payType: 'USDT',
        paymentMethod: 'wechat', // 使用微信支付测试（会转换为wxpay）
        subject: '测试订单',
        body: '支付网关测试'
      });

      console.log('\n✓ 支付订单创建成功！');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('订单号:', testOrderId);
      console.log('返回数据:', JSON.stringify(result, null, 2));
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      // 提取支付链接
      let paymentUrl;
      if (settings.paymentApiVersion === 'v2') {
        paymentUrl = result.pay_url || result.payUrl || result.data?.pay_url || result.data?.payUrl;
      } else {
        paymentUrl = result.payurl || result.pay_url || result.qrcode || result.code_url;
      }

      if (paymentUrl) {
        console.log('✓ 支付链接:', paymentUrl);
      } else {
        console.log('⚠️  警告: 未找到支付链接字段！');
        console.log('请检查返回数据中的字段名称。\n');
      }

    } catch (error) {
      console.log('\n✗ 创建支付订单失败！');
      console.log('错误信息:', error.message);
      if (error.response?.data) {
        console.log('详细错误:', JSON.stringify(error.response.data, null, 2));
      }
      console.log('\n可能的原因:');
      console.log('1. 商户ID或API密钥错误');
      console.log('2. 支付API地址不正确');
      console.log('3. 签名算法不匹配');
      console.log('4. 网络连接问题');
      console.log('5. 支付平台服务异常\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('\n✗ 测试失败:', error.message);
    process.exit(1);
  }
}

testPaymentGateway();
