require('dotenv').config();
const mongoose = require('mongoose');
const Payment = require('../models/Payment');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fastpay';

// 生成随机地址
const generateAddress = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
  let address = 'T';
  for (let i = 0; i < 33; i++) {
    address += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return address;
};

// 生成随机交易哈希
const generateTxHash = () => {
  const chars = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < 64; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
};

// 生成随机订单号
const generateOrderId = () => {
  return 'ORD' + Date.now() + Math.random().toString(36).substring(2, 9).toUpperCase();
};

// 生成模拟数据
const generateMockPayments = (count) => {
  const payments = [];
  const payTypes = ['USDT', 'TRX'];
  const paymentMethods = ['alipay', 'wechat'];
  const statuses = ['pending', 'paid', 'completed', 'failed'];
  
  for (let i = 0; i < count; i++) {
    const payType = payTypes[Math.floor(Math.random() * payTypes.length)];
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const amount = (Math.random() * 199 + 1).toFixed(2); // 1-200
    const totalCNY = payType === 'USDT' 
      ? (amount * 7.35).toFixed(2) 
      : (amount * 1.08).toFixed(2);
    
    // 创建时间：最近30天内随机
    const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    
    const payment = {
      payType,
      amount: parseFloat(amount),
      address: generateAddress(),
      email: Math.random() > 0.5 ? `user${i}@example.com` : null,
      paymentMethod,
      totalCNY: parseFloat(totalCNY),
      serviceFee: (totalCNY * 0.02).toFixed(2), // 2% 服务费
      platformOrderId: generateOrderId(),
      paymentStatus: status === 'pending' ? 'pending' : 'paid',
      paymentTime: status !== 'pending' ? new Date(createdAt.getTime() + Math.random() * 60000) : null,
      txHash: status === 'completed' ? generateTxHash() : null,
      transferStatus: status === 'completed' ? 'completed' : status === 'failed' ? 'failed' : 'pending',
      transferTime: status === 'completed' ? new Date(createdAt.getTime() + Math.random() * 600000) : null,
      emailSent: status === 'completed',
      status,
      createdAt
    };
    
    payments.push(payment);
  }
  
  return payments;
};

const addMockData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ 已连接到 MongoDB');
    
    // 生成200条模拟数据
    const mockPayments = generateMockPayments(200);
    
    // 插入数据
    const result = await Payment.insertMany(mockPayments);
    console.log(`✅ 成功添加 ${result.length} 条模拟数据`);
    
    // 统计信息
    const stats = {
      total: result.length,
      usdt: result.filter(p => p.payType === 'USDT').length,
      trx: result.filter(p => p.payType === 'TRX').length,
      completed: result.filter(p => p.status === 'completed').length,
      pending: result.filter(p => p.status === 'pending').length,
      paid: result.filter(p => p.status === 'paid').length,
      failed: result.filter(p => p.status === 'failed').length,
      alipay: result.filter(p => p.paymentMethod === 'alipay').length,
      wechat: result.filter(p => p.paymentMethod === 'wechat').length
    };
    
    console.log('\n📊 数据统计:');
    console.log(`   总计: ${stats.total} 条`);
    console.log(`   USDT: ${stats.usdt} 条 | TRX: ${stats.trx} 条`);
    console.log(`   已完成: ${stats.completed} 条 | 待支付: ${stats.pending} 条`);
    console.log(`   已支付: ${stats.paid} 条 | 失败: ${stats.failed} 条`);
    console.log(`   支付宝: ${stats.alipay} 条 | 微信: ${stats.wechat} 条`);
    
    await mongoose.disconnect();
    console.log('\n✅ 已断开 MongoDB 连接');
    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
};

addMockData();
