// 检查订单状态并手动触发代付
const mongoose = require('mongoose');
require('dotenv').config();

const Payment = require('../models/Payment');
const tronService = require('../services/tronService');

async function checkOrder() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 数据库连接成功');

    // 从命令行参数获取订单号
    const orderId = process.argv[2] || 'ORD1770025130619CL6KPC2';
    
    console.log('\n查询订单:', orderId);
    
    const payment = await Payment.findOne({ platformOrderId: orderId });
    
    if (!payment) {
      console.error('❌ 订单不存在:', orderId);
      process.exit(1);
    }

    console.log('\n📋 订单详情:');
    console.log('订单ID:', payment._id);
    console.log('订单号:', payment.platformOrderId);
    console.log('支付类型:', payment.payType);
    console.log('金额:', payment.amount);
    console.log('收款地址:', payment.address);
    console.log('支付状态:', payment.paymentStatus);
    console.log('转账状态:', payment.transferStatus);
    console.log('订单状态:', payment.status);
    console.log('交易哈希:', payment.txHash || '无');
    console.log('创建时间:', payment.createdAt);
    console.log('支付时间:', payment.paymentTime || '未支付');
    console.log('转账时间:', payment.transferTime || '未转账');

    // 如果订单已支付但未转账，尝试执行转账
    if (payment.paymentStatus === 'paid' && payment.transferStatus === 'pending') {
      console.log('\n🔄 订单已支付但未转账，开始执行代付...');
      
      try {
        payment.transferStatus = 'processing';
        await payment.save();

        let txResult;
        if (payment.payType === 'USDT') {
          console.log('执行 USDT 转账...');
          txResult = await tronService.sendUSDT(payment.address, payment.amount);
        } else {
          console.log('执行 TRX 转账...');
          txResult = await tronService.sendTRX(payment.address, payment.amount);
        }

        payment.txHash = txResult.txid || txResult;
        payment.transferStatus = 'completed';
        payment.transferTime = new Date();
        payment.status = 'completed';
        await payment.save();

        console.log('✅ 代付成功!');
        console.log('交易哈希:', payment.txHash);
        console.log('查看交易:', `https://tronscan.org/#/transaction/${payment.txHash}`);
      } catch (error) {
        console.error('❌ 代付失败:', error.message);
        payment.transferStatus = 'failed';
        payment.status = 'failed';
        await payment.save();
      }
    } else if (payment.transferStatus === 'completed') {
      console.log('\n✅ 订单已完成');
      console.log('查看交易:', `https://tronscan.org/#/transaction/${payment.txHash}`);
    } else if (payment.paymentStatus !== 'paid') {
      console.log('\n⚠️  订单尚未支付');
    } else if (payment.transferStatus === 'processing') {
      console.log('\n⏳ 订单正在处理中...');
    } else if (payment.transferStatus === 'failed') {
      console.log('\n❌ 订单转账失败');
      console.log('是否重试? 运行: node server/scripts/checkOrderStatus.js', orderId, 'retry');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

checkOrder();
