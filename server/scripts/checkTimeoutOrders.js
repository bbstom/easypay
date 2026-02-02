const mongoose = require('mongoose');
const orderTimeoutService = require('../services/orderTimeoutService');
require('dotenv').config();

/**
 * 手动检查超时订单的测试脚本
 */

async function checkTimeout() {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 数据库连接成功\n');

    // 执行检查
    await orderTimeoutService.manualCheck();

    console.log('\n✅ 检查完成');
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

checkTimeout();
