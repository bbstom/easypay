require('dotenv').config();
const mongoose = require('mongoose');
const Payment = require('../models/Payment');

const addTestData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 连接成功');

    // 生成随机哈希值
    const generateHash = () => {
      return '0x' + Array.from({length: 64}, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
    };

    // 生成随机地址
    const generateAddress = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let addr = 'T';
      for (let i = 0; i < 33; i++) {
        addr += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return addr;
    };

    // 创建20条测试数据
    const testPayments = [];
    for (let i = 0; i < 20; i++) {
      const payType = Math.random() > 0.5 ? 'USDT' : 'TRX';
      const amount = Math.floor(Math.random() * 150) + 10;
      
      testPayments.push({
        payType,
        amount,
        address: generateAddress(),
        paymentMethod: Math.random() > 0.5 ? 'alipay' : 'wechat',
        totalCNY: amount * (payType === 'USDT' ? 7.35 : 1.08) + (payType === 'USDT' ? 5 : 2),
        status: 'completed',
        txHash: generateHash(),
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000))
      });
    }

    await Payment.insertMany(testPayments);
    console.log(`✅ 成功添加 ${testPayments.length} 条测试数据`);

    process.exit(0);
  } catch (error) {
    console.error('❌ 添加测试数据失败:', error.message);
    process.exit(1);
  }
};

addTestData();
