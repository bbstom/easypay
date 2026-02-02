require('dotenv').config();
const mongoose = require('mongoose');
const Settings = require('../models/Settings');
const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');

// 调试支付接口返回
async function debugPayment() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ 已连接到数据库\n');

    const settings = await Settings.findOne();
    if (!settings) {
      console.log('✗ 未找到系统设置');
      process.exit(1);
    }

    console.log('当前配置:');
    console.log('商户ID:', settings.paymentMerchantId);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const testOrderId = 'DEBUG' + Date.now();

    const params = {
      pid: settings.paymentMerchantId,
      type: 'wxpay',
      out_trade_no: testOrderId,
      notify_url: 'http://localhost:5000/api/payments/notify',
      return_url: 'http://localhost:5000/pay',
      name: '调试订单',
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

    console.log('发送参数:', params);
    console.log('\n正在请求支付平台...\n');

    const formData = new URLSearchParams();
    Object.keys(params).forEach(key => {
      formData.append(key, params[key]);
    });

    const response = await axios.post(
      `${settings.paymentApiUrl}/submit.php`,
      formData.toString(),
      {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        maxRedirects: 0,
        validateStatus: () => true
      }
    );

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('响应状态:', response.status);
    console.log('响应头:', response.headers);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('响应数据类型:', typeof response.data);
    console.log('响应数据长度:', response.data.length);
    console.log('\n响应数据内容:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(response.data);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 保存HTML到文件
    if (typeof response.data === 'string' && response.data.includes('<html')) {
      const filename = `payment_response_${Date.now()}.html`;
      fs.writeFileSync(filename, response.data);
      console.log(`✓ HTML响应已保存到: ${filename}`);
      console.log('可以在浏览器中打开查看\n');
    }

    // 分析响应
    console.log('分析结果:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (typeof response.data === 'string') {
      if (response.data.includes('<!DOCTYPE') || response.data.includes('<html')) {
        console.log('✓ 返回类型: HTML页面');
        console.log('✓ 这是正常的支付跳转页面');
        console.log('\n建议方案:');
        console.log('1. 将整个HTML页面作为支付页面');
        console.log('2. 或者提取HTML中的支付链接');
        console.log('3. 或者直接使用submit.php的URL作为支付链接\n');
        
        // 尝试提取链接
        const locationMatch = response.data.match(/window\.location\.(replace|href)\s*\(\s*['"]([^'"]+)['"]\s*\)/);
        const urlMatch = response.data.match(/href=["']([^"']+)["']/);
        const actionMatch = response.data.match(/action=["']([^"']+)["']/);
        
        if (locationMatch) {
          let payUrl = locationMatch[2];
          console.log('✓ 找到JavaScript跳转:', payUrl);
          if (payUrl.startsWith('/')) {
            payUrl = settings.paymentApiUrl + payUrl;
          }
          console.log('✓ 完整支付链接:', payUrl);
        }
        if (urlMatch) {
          console.log('✓ 找到链接:', urlMatch[1]);
        }
        if (actionMatch) {
          console.log('✓ 找到表单action:', actionMatch[1]);
        }
      } else {
        console.log('✓ 返回类型: 文本');
        console.log('内容:', response.data);
      }
    } else if (typeof response.data === 'object') {
      console.log('✓ 返回类型: JSON对象');
      console.log('字段:', Object.keys(response.data));
      
      if (response.data.payurl) {
        console.log('✓ 找到支付链接:', response.data.payurl);
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('调试失败:', error.message);
    if (error.response) {
      console.error('响应数据:', error.response.data);
    }
    process.exit(1);
  }
}

debugPayment();
