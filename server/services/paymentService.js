const axios = require('axios');
const crypto = require('crypto');
const Settings = require('../models/Settings');

class PaymentService {
  // 创建支付订单（自动选择V1或V2）
  async createPaymentOrder(orderData) {
    const settings = await Settings.findOne();
    if (!settings || !settings.paymentMerchantId || !settings.paymentApiKey) {
      throw new Error('支付配置未完成');
    }

    // 根据配置选择API版本
    if (settings.paymentApiVersion === 'v2') {
      return this.createPaymentOrderV2(orderData, settings);
    } else {
      return this.createPaymentOrderV1(orderData, settings);
    }
  }

  // V1接口 - 使用MD5签名
  async createPaymentOrderV1(orderData, settings) {
    // V1接口支付方式映射
    // 常见的易支付V1接口支持的支付方式
    const payTypeMap = {
      'alipay': 'alipay',      // 支付宝
      'wechat': 'wxpay',       // 微信支付
      'qqpay': 'qqpay',        // QQ钱包
      'bank': 'bank',          // 网银支付
      'jdpay': 'jdpay',        // 京东支付
      'unionpay': 'unionpay'   // 银联支付
    };

    const payType = payTypeMap[orderData.paymentMethod] || 'alipay';
    
    console.log('V1接口 - 支付方式映射:', orderData.paymentMethod, '->', payType);

    const params = {
      pid: settings.paymentMerchantId,
      type: payType,
      out_trade_no: orderData.orderId,
      notify_url: settings.paymentNotifyUrl || `${process.env.APP_URL || 'http://localhost:5000'}/api/payments/notify`,
      return_url: `${process.env.APP_URL || 'http://localhost:5000'}/pay`,
      name: orderData.subject || '数字货币代付',
      money: orderData.amount,
      sitename: '代付平台'
    };

    // 生成MD5签名
    params.sign = this.generateMD5Sign(params, settings.paymentApiKey);
    params.sign_type = 'MD5';

    console.log('V1接口 - 发送参数:', { ...params, sign: '***' });

    try {
      const formData = new URLSearchParams();
      Object.keys(params).forEach(key => {
        formData.append(key, params[key]);
      });

      const formDataString = formData.toString();
      console.log('V1接口 - 表单数据:', formDataString);

      const response = await axios.post(`${settings.paymentApiUrl}/submit.php`, formDataString, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        maxRedirects: 0, // 不自动跟随重定向
        validateStatus: (status) => status < 400 // 接受所有成功状态码
      });
      
      console.log('V1接口 - 响应状态:', response.status);
      console.log('V1接口 - 响应类型:', typeof response.data);
      console.log('V1接口 - 响应数据:', response.data);
      
      // V1接口可能返回HTML页面（跳转页面）或JSON
      if (typeof response.data === 'string') {
        // 如果是HTML，提取支付链接
        if (response.data.includes('<!DOCTYPE') || response.data.includes('<html')) {
          console.log('V1接口返回HTML页面，提取跳转链接');
          
          // 提取JavaScript中的跳转链接
          // window.location.replace('/pay/qrcode/xxx/');
          const locationMatch = response.data.match(/window\.location\.(replace|href)\s*\(\s*['"]([^'"]+)['"]\s*\)/);
          
          if (locationMatch) {
            let payUrl = locationMatch[2];
            console.log('提取到的链接:', payUrl);
            
            // 如果是相对路径，拼接完整URL
            if (payUrl.startsWith('/')) {
              payUrl = settings.paymentApiUrl + payUrl;
            }
            
            console.log('完整支付链接:', payUrl);
            
            return {
              code: 1,
              payurl: payUrl,
              type: 'redirect'
            };
          }
          
          // 尝试提取href链接
          const hrefMatch = response.data.match(/href=["']([^"']+)["']/);
          if (hrefMatch) {
            let payUrl = hrefMatch[1];
            if (payUrl.startsWith('/')) {
              payUrl = settings.paymentApiUrl + payUrl;
            }
            return {
              code: 1,
              payurl: payUrl,
              type: 'link'
            };
          }
          
          console.error('无法从HTML中提取支付链接');
          throw new Error('无法从HTML中提取支付链接');
        }
        
        // 尝试解析JSON字符串
        try {
          const jsonData = JSON.parse(response.data);
          return jsonData;
        } catch (e) {
          console.log('无法解析为JSON，返回原始数据');
          return { code: 1, payurl: response.data };
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('V1接口调用失败:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error(error.response?.data?.msg || error.response?.data?.message || 'V1接口调用失败');
    }
  }

  // V2接口 - 使用RSA签名
  async createPaymentOrderV2(orderData, settings) {
    const params = {
      merchant_id: settings.paymentMerchantId,
      out_trade_no: orderData.orderId,
      amount: orderData.amount,
      pay_type: orderData.paymentMethod || 'alipay',
      notify_url: settings.paymentNotifyUrl || `${process.env.APP_URL || 'http://localhost:5000'}/api/payments/notify`,
      return_url: `${process.env.APP_URL || 'http://localhost:5000'}/pay`,
      subject: orderData.subject || '数字货币代付',
      body: orderData.body || `${orderData.payType} 代付服务`,
      timestamp: Date.now()
    };

    // 生成RSA签名
    params.sign = this.generateRSASign(params, settings.paymentApiKey);

    console.log('V2接口 - 发送参数:', { ...params, sign: '***' });

    try {
      const formData = new URLSearchParams();
      Object.keys(params).forEach(key => {
        formData.append(key, params[key]);
      });

      const formDataString = formData.toString();
      console.log('V2接口 - 表单数据:', formDataString);
      console.log('V2接口 - 请求URL:', `${settings.paymentApiUrl}/api/pay/create`);

      const response = await axios.post(`${settings.paymentApiUrl}/api/pay/create`, formDataString, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      console.log('V2接口 - 响应状态:', response.status);
      console.log('V2接口 - 响应数据:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('V2接口调用失败:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error(error.response?.data?.msg || error.response?.data?.message || 'V2接口调用失败');
    }
  }

  // 查询订单状态
  async queryOrder(orderId) {
    const settings = await Settings.findOne();
    if (!settings || !settings.paymentMerchantId || !settings.paymentApiKey) {
      throw new Error('支付配置未完成');
    }

    if (settings.paymentApiVersion === 'v2') {
      return this.queryOrderV2(orderId, settings);
    } else {
      return this.queryOrderV1(orderId, settings);
    }
  }

  // V1查询订单
  async queryOrderV1(orderId, settings) {
    const params = {
      pid: settings.paymentMerchantId,
      out_trade_no: orderId
    };

    params.sign = this.generateMD5Sign(params, settings.paymentApiKey);
    params.sign_type = 'MD5';

    try {
      const formData = new URLSearchParams();
      Object.keys(params).forEach(key => {
        formData.append(key, params[key]);
      });

      const response = await axios.post(`${settings.paymentApiUrl}/api.php`, formData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      return response.data;
    } catch (error) {
      console.error('V1查询订单失败:', error);
      throw new Error('查询订单失败');
    }
  }

  // V2查询订单
  async queryOrderV2(orderId, settings) {
    const params = {
      merchant_id: settings.paymentMerchantId,
      out_trade_no: orderId,
      timestamp: Date.now()
    };

    params.sign = this.generateRSASign(params, settings.paymentApiKey);

    try {
      const formData = new URLSearchParams();
      Object.keys(params).forEach(key => {
        formData.append(key, params[key]);
      });

      const response = await axios.post(`${settings.paymentApiUrl}/api/pay/query`, formData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      return response.data;
    } catch (error) {
      console.error('V2查询订单失败:', error);
      throw new Error('查询订单失败');
    }
  }

  // 生成MD5签名（V1使用）
  generateMD5Sign(params, apiKey) {
    const sortedKeys = Object.keys(params).sort();
    const signStr = sortedKeys
      .filter(key => key !== 'sign' && key !== 'sign_type' && params[key] !== '' && params[key] !== null && params[key] !== undefined)
      .map(key => `${key}=${params[key]}`)
      .join('&') + apiKey;
    
    console.log('MD5待签名字符串:', signStr);
    const sign = crypto.createHash('md5').update(signStr).digest('hex');
    console.log('MD5签名结果:', sign);
    
    return sign;
  }

  // 生成RSA签名（V2使用）
  generateRSASign(params, privateKey) {
    try {
      // 1. 按key排序并拼接字符串
      const sortedKeys = Object.keys(params).sort();
      const signStr = sortedKeys
        .filter(key => key !== 'sign' && params[key] !== '' && params[key] !== null && params[key] !== undefined)
        .map(key => `${key}=${params[key]}`)
        .join('&');
      
      console.log('RSA待签名字符串:', signStr);

      // 2. 使用商户私钥进行RSA签名
      const sign = crypto.createSign('SHA256');
      sign.update(signStr, 'utf8');
      sign.end();
      
      // 私钥格式化（如果需要）
      let formattedPrivateKey = privateKey;
      if (!privateKey.includes('BEGIN')) {
        formattedPrivateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
      }
      
      const signature = sign.sign(formattedPrivateKey, 'base64');
      console.log('RSA签名结果:', signature.substring(0, 20) + '...');
      
      return signature;
    } catch (error) {
      console.error('RSA签名失败:', error.message);
      throw error;
    }
  }

  // 验证回调签名
  verifySign(params, settings) {
    if (settings.paymentApiVersion === 'v2') {
      return this.verifyRSASign(params, settings.paymentPublicKey);
    } else {
      return this.verifyMD5Sign(params, settings.paymentApiKey);
    }
  }

  // 验证MD5签名（V1）
  verifyMD5Sign(params, apiKey) {
    const receivedSign = params.sign;
    if (!receivedSign) return false;

    const calculatedSign = this.generateMD5Sign(params, apiKey);
    return receivedSign === calculatedSign;
  }

  // 验证RSA签名（V2）
  verifyRSASign(params, publicKey) {
    try {
      const receivedSign = params.sign;
      if (!receivedSign) return false;

      // 构建待验证字符串
      const sortedKeys = Object.keys(params).sort();
      const signStr = sortedKeys
        .filter(key => key !== 'sign' && params[key] !== '')
        .map(key => `${key}=${params[key]}`)
        .join('&');

      // 格式化公钥
      let formattedPublicKey = publicKey;
      if (!publicKey.includes('BEGIN')) {
        formattedPublicKey = `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`;
      }

      // 验证签名
      const verify = crypto.createVerify('SHA256');
      verify.update(signStr, 'utf8');
      verify.end();
      
      return verify.verify(formattedPublicKey, receivedSign, 'base64');
    } catch (error) {
      console.error('验证RSA签名失败:', error);
      return false;
    }
  }
}

module.exports = new PaymentService();
