const axios = require('axios');
const crypto = require('crypto');

/**
 * 模拟支付平台回调测试脚本
 * 用于内网开发环境测试支付回调功能
 */

// 配置
const BASE_URL = 'http://localhost:3000';
const MERCHANT_ID = 'your_merchant_id'; // 从设置中获取
const API_KEY = 'your_api_key'; // 从设置中获取

// 测试订单信息
const testOrder = {
  orderId: 'TEST' + Date.now(),
  amount: 100, // 100 元
  payType: 'USDT' // 或 'TRX'
};

/**
 * 生成 V1 签名（MD5）
 */
function generateV1Signature(params, apiKey) {
  // 按字母顺序排序
  const sortedKeys = Object.keys(params).sort();
  const signStr = sortedKeys
    .map(key => `${key}=${params[key]}`)
    .join('&') + `&key=${apiKey}`;
  
  return crypto.createHash('md5').update(signStr).digest('hex').toUpperCase();
}

/**
 * 生成 V2 签名（RSA）
 */
function generateV2Signature(params, privateKey) {
  const sortedKeys = Object.keys(params).sort();
  const signStr = sortedKeys
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signStr);
  return sign.sign(privateKey, 'base64');
}

/**
 * 模拟支付成功回调
 */
async function simulatePaymentCallback(apiVersion = 'v1') {
  console.log('\n🧪 开始模拟支付回调测试');
  console.log('━'.repeat(50));
  
  // 1. 创建订单
  console.log('\n📝 步骤 1: 创建测试订单');
  const createResponse = await axios.post(`${BASE_URL}/api/payments/create`, {
    amount: testOrder.amount,
    payType: testOrder.payType,
    userAddress: 'TTestAddress123456789012345678901234', // 测试地址
    userEmail: 'test@example.com'
  });
  
  const orderId = createResponse.data.orderId;
  console.log(`✅ 订单创建成功: ${orderId}`);
  console.log(`   金额: ${testOrder.amount} 元`);
  console.log(`   类型: ${testOrder.payType}`);
  
  // 2. 模拟支付平台回调
  console.log('\n📞 步骤 2: 模拟支付平台回调');
  
  const callbackParams = {
    orderId: orderId,
    merchantId: MERCHANT_ID,
    amount: testOrder.amount,
    status: 'success',
    payTime: new Date().toISOString(),
    tradeNo: 'TRADE' + Date.now() // 支付平台交易号
  };
  
  // 生成签名
  if (apiVersion === 'v1') {
    callbackParams.sign = generateV1Signature(callbackParams, API_KEY);
    console.log('   使用 V1 签名 (MD5)');
  } else {
    // V2 需要商户私钥
    console.log('   使用 V2 签名 (RSA)');
    console.log('   ⚠️  需要配置商户私钥');
  }
  
  console.log('   回调参数:', JSON.stringify(callbackParams, null, 2));
  
  try {
    const callbackResponse = await axios.post(
      `${BASE_URL}/api/payments/notify`,
      callbackParams,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ 回调成功:', callbackResponse.data);
    
    // 3. 检查订单状态
    console.log('\n🔍 步骤 3: 检查订单状态');
    const statusResponse = await axios.get(`${BASE_URL}/api/payments/${orderId}`);
    console.log('   订单状态:', statusResponse.data.status);
    console.log('   支付状态:', statusResponse.data.paymentStatus);
    console.log('   转账状态:', statusResponse.data.transferStatus);
    
    if (statusResponse.data.transferTxHash) {
      console.log('   转账哈希:', statusResponse.data.transferTxHash);
    }
    
    console.log('\n✅ 测试完成！');
    
  } catch (error) {
    console.error('❌ 回调失败:', error.response?.data || error.message);
    
    if (error.response?.status === 400) {
      console.log('\n💡 提示:');
      console.log('   - 检查签名是否正确');
      console.log('   - 检查 MERCHANT_ID 和 API_KEY 配置');
      console.log('   - 查看后端日志获取详细错误');
    }
  }
  
  console.log('━'.repeat(50));
}

/**
 * 测试 USDT 代付（不需要回调）
 */
async function testUSDTTransfer() {
  console.log('\n🧪 测试 USDT 代付（无需回调）');
  console.log('━'.repeat(50));
  
  console.log('\n📝 创建测试订单');
  const createResponse = await axios.post(`${BASE_URL}/api/payments/create`, {
    amount: 10, // 10 USDT
    payType: 'USDT',
    userAddress: 'TTestAddress123456789012345678901234',
    userEmail: 'test@example.com'
  });
  
  const orderId = createResponse.data.orderId;
  console.log(`✅ 订单创建成功: ${orderId}`);
  
  console.log('\n💰 手动标记为已支付（模拟用户支付）');
  await axios.post(`${BASE_URL}/api/payments/${orderId}/mark-paid`, {
    // 管理员操作
  });
  
  console.log('✅ 订单已标记为已支付');
  console.log('⏳ 系统将自动执行 USDT 转账...');
  console.log('   查看后端日志了解转账进度');
  
  console.log('━'.repeat(50));
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || 'callback';
  
  console.log('🚀 支付回调测试工具');
  console.log(`📍 服务器: ${BASE_URL}`);
  console.log(`🔧 模式: ${mode}`);
  
  try {
    if (mode === 'callback') {
      await simulatePaymentCallback('v1');
    } else if (mode === 'transfer') {
      await testUSDTTransfer();
    } else {
      console.log('\n用法:');
      console.log('  node testPaymentCallback.js callback  # 测试支付回调');
      console.log('  node testPaymentCallback.js transfer  # 测试 USDT 代付');
    }
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    if (error.response) {
      console.error('   状态码:', error.response.status);
      console.error('   响应:', error.response.data);
    }
  }
}

main();
