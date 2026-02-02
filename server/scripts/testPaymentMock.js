require('dotenv').config();
const mongoose = require('mongoose');
const Settings = require('../models/Settings');

// 测试支付网关 - 使用模拟数据
async function testPaymentMock() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ 已连接到数据库\n');

    const settings = await Settings.findOne();
    if (!settings) {
      console.log('✗ 未找到系统设置');
      process.exit(1);
    }

    console.log('当前配置:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('支付API地址:', settings.paymentApiUrl);
    console.log('商户ID:', settings.paymentMerchantId);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('建议的解决方案:\n');
    console.log('1. 联系支付平台技术支持');
    console.log('   - 确认V2接口的完整API地址');
    console.log('   - 确认参数格式和签名方式');
    console.log('   - 获取完整的API文档\n');

    console.log('2. 可能的API地址:');
    console.log('   - https://pay.abcdely.top/api/v2/pay/create');
    console.log('   - https://pay.abcdely.top/v2/api/pay/create');
    console.log('   - https://api.abcdely.top/pay/create\n');

    console.log('3. 临时测试方案:');
    console.log('   在 server/routes/payments.js 中添加模拟返回\n');
    console.log('   修改第47行后添加:');
    console.log('   ```javascript');
    console.log('   // 临时测试 - 模拟支付链接');
    console.log('   if (process.env.NODE_ENV === \'development\') {');
    console.log('     return res.status(201).json({');
    console.log('       payment,');
    console.log('       paymentUrl: `https://pay.abcdely.top/test?order=${orderId}`,');
    console.log('       orderId: orderId');
    console.log('     });');
    console.log('   }');
    console.log('   ```\n');

    console.log('4. 检查项目:');
    console.log('   ✓ 请求格式: application/x-www-form-urlencoded');
    console.log('   ✓ 签名算法: SHA256WithRSA');
    console.log('   ✓ 参数拼接: 按key排序');
    console.log('   ? API地址: 需要确认\n');

    console.log('5. 下一步:');
    console.log('   - 获取支付平台的完整API文档');
    console.log('   - 或使用临时测试方案先测试前端功能');
    console.log('   - 确认后再对接真实支付接口\n');

    process.exit(0);
  } catch (error) {
    console.error('错误:', error.message);
    process.exit(1);
  }
}

testPaymentMock();
