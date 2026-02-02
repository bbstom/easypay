require('dotenv').config();
const mongoose = require('mongoose');
const Payment = require('../models/Payment');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fastpay';

const checkPayments = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ 已连接到 MongoDB');
    
    // 获取最近200条记录
    const payments = await Payment.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .select('payType amount address status txHash createdAt platformOrderId paymentMethod _id');
    
    console.log(`\n📊 数据库中共有 ${payments.length} 条记录（最近200条）\n`);
    
    if (payments.length > 0) {
      console.log('最新的5条记录:');
      payments.slice(0, 5).forEach((p, i) => {
        console.log(`\n${i + 1}. 订单号: ${p.platformOrderId || p._id.toString().slice(-8)}`);
        console.log(`   类型: ${p.payType} | 数量: ${p.amount} | 支付方式: ${p.paymentMethod}`);
        console.log(`   状态: ${p.status} | 创建时间: ${p.createdAt.toLocaleString('zh-CN')}`);
        console.log(`   地址: ${p.address.slice(0, 6)}****${p.address.slice(-4)}`);
        if (p.txHash) {
          console.log(`   哈希: ${p.txHash.slice(0, 6)}****${p.txHash.slice(-4)}`);
        }
      });
    }
    
    // 统计信息
    const total = await Payment.countDocuments();
    const usdt = await Payment.countDocuments({ payType: 'USDT' });
    const trx = await Payment.countDocuments({ payType: 'TRX' });
    const completed = await Payment.countDocuments({ status: 'completed' });
    const pending = await Payment.countDocuments({ status: 'pending' });
    
    console.log('\n\n📈 总体统计:');
    console.log(`   总订单数: ${total}`);
    console.log(`   USDT: ${usdt} | TRX: ${trx}`);
    console.log(`   已完成: ${completed} | 待支付: ${pending}`);
    
    await mongoose.disconnect();
    console.log('\n✅ 已断开 MongoDB 连接');
    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
};

checkPayments();
