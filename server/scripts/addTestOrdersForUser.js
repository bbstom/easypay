const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const User = require('../models/User');
require('dotenv').config();

/**
 * 为指定用户添加测试订单数据
 */

async function addTestOrders() {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 数据库连接成功');

    // 查找用户
    const username = 'kailsay'; // 可以修改为其他用户名
    const user = await User.findOne({ username });
    
    if (!user) {
      console.error(`❌ 用户 "${username}" 不存在`);
      console.log('💡 提示：请先注册该用户或修改脚本中的用户名');
      process.exit(1);
    }

    console.log(`\n📋 找到用户: ${user.username} (${user.email})`);
    console.log(`🆔 用户ID: ${user._id}`);

    // 生成测试订单数据
    const testOrders = [
      // 已完成的 USDT 订单
      {
        userId: user._id,
        payType: 'USDT',
        amount: 100,
        address: 'TTestAddress1234567890123456789012',
        paymentMethod: 'wechat',
        totalCNY: 735,
        serviceFee: 5,
        platformOrderId: 'ORD' + Date.now() + 'A001',
        email: user.email,
        status: 'completed',
        paymentStatus: 'paid',
        transferStatus: 'completed',
        txHash: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        paymentTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2天前
        transferTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        userId: user._id,
        payType: 'USDT',
        amount: 50,
        address: 'TTestAddress2345678901234567890123',
        paymentMethod: 'alipay',
        totalCNY: 367.5,
        serviceFee: 5,
        platformOrderId: 'ORD' + Date.now() + 'A002',
        email: user.email,
        status: 'completed',
        paymentStatus: 'paid',
        transferStatus: 'completed',
        txHash: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        paymentTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5天前
        transferTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      // 已完成的 TRX 订单
      {
        userId: user._id,
        payType: 'TRX',
        amount: 500,
        address: 'TTestAddress3456789012345678901234',
        paymentMethod: 'wechat',
        totalCNY: 540,
        serviceFee: 2,
        platformOrderId: 'ORD' + Date.now() + 'A003',
        email: user.email,
        status: 'completed',
        paymentStatus: 'paid',
        transferStatus: 'completed',
        txHash: 'fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
        paymentTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7天前
        transferTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      // 处理中的订单
      {
        userId: user._id,
        payType: 'USDT',
        amount: 200,
        address: 'TTestAddress4567890123456789012345',
        paymentMethod: 'wechat',
        totalCNY: 1470,
        serviceFee: 5,
        platformOrderId: 'ORD' + Date.now() + 'A004',
        email: user.email,
        status: 'processing',
        paymentStatus: 'paid',
        transferStatus: 'processing',
        paymentTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1小时前
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      },
      // 已支付待转账的订单
      {
        userId: user._id,
        payType: 'TRX',
        amount: 1000,
        address: 'TTestAddress5678901234567890123456',
        paymentMethod: 'alipay',
        totalCNY: 1080,
        serviceFee: 2,
        platformOrderId: 'ORD' + Date.now() + 'A005',
        email: user.email,
        status: 'paid',
        paymentStatus: 'paid',
        transferStatus: 'pending',
        paymentTime: new Date(Date.now() - 30 * 60 * 1000), // 30分钟前
        createdAt: new Date(Date.now() - 30 * 60 * 1000)
      },
      // 待支付的订单
      {
        userId: user._id,
        payType: 'USDT',
        amount: 150,
        address: 'TTestAddress6789012345678901234567',
        paymentMethod: 'wechat',
        totalCNY: 1102.5,
        serviceFee: 5,
        platformOrderId: 'ORD' + Date.now() + 'A006',
        email: user.email,
        status: 'pending',
        paymentStatus: 'pending',
        transferStatus: 'pending',
        createdAt: new Date(Date.now() - 10 * 60 * 1000) // 10分钟前
      },
      // 更多已完成的订单（用于测试分页和统计）
      {
        userId: user._id,
        payType: 'USDT',
        amount: 80,
        address: 'TTestAddress7890123456789012345678',
        paymentMethod: 'alipay',
        totalCNY: 588,
        serviceFee: 5,
        platformOrderId: 'ORD' + Date.now() + 'A007',
        email: user.email,
        status: 'completed',
        paymentStatus: 'paid',
        transferStatus: 'completed',
        txHash: '1111111111111111111111111111111111111111111111111111111111111111',
        paymentTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        transferTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      },
      {
        userId: user._id,
        payType: 'TRX',
        amount: 300,
        address: 'TTestAddress8901234567890123456789',
        paymentMethod: 'wechat',
        totalCNY: 324,
        serviceFee: 2,
        platformOrderId: 'ORD' + Date.now() + 'A008',
        email: user.email,
        status: 'completed',
        paymentStatus: 'paid',
        transferStatus: 'completed',
        txHash: '2222222222222222222222222222222222222222222222222222222222222222',
        paymentTime: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        transferTime: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
      },
      // 失败的订单
      {
        userId: user._id,
        payType: 'USDT',
        amount: 120,
        address: 'TTestAddress9012345678901234567890',
        paymentMethod: 'wechat',
        totalCNY: 882,
        serviceFee: 5,
        platformOrderId: 'ORD' + Date.now() + 'A009',
        email: user.email,
        status: 'failed',
        paymentStatus: 'paid',
        transferStatus: 'failed',
        paymentTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ];

    console.log(`\n📦 准备添加 ${testOrders.length} 条测试订单...\n`);

    // 插入订单
    let successCount = 0;
    for (const orderData of testOrders) {
      try {
        const order = new Payment(orderData);
        await order.save();
        successCount++;
        
        const statusEmoji = {
          completed: '✅',
          processing: '⏳',
          paid: '💰',
          pending: '⏸️',
          failed: '❌'
        };
        
        console.log(`${statusEmoji[orderData.status] || '📝'} ${orderData.platformOrderId}`);
        console.log(`   类型: ${orderData.payType} | 金额: ${orderData.amount} | 状态: ${orderData.status}`);
      } catch (error) {
        console.error(`❌ 创建订单失败:`, error.message);
      }
    }

    console.log(`\n✅ 成功添加 ${successCount}/${testOrders.length} 条订单`);

    // 统计信息
    const stats = {
      total: testOrders.length,
      completed: testOrders.filter(o => o.status === 'completed').length,
      processing: testOrders.filter(o => o.status === 'processing').length,
      paid: testOrders.filter(o => o.status === 'paid').length,
      pending: testOrders.filter(o => o.status === 'pending').length,
      failed: testOrders.filter(o => o.status === 'failed').length,
      totalAmount: testOrders.reduce((sum, o) => sum + (o.totalCNY || 0), 0)
    };

    console.log('\n📊 订单统计:');
    console.log(`   总订单数: ${stats.total}`);
    console.log(`   ✅ 已完成: ${stats.completed}`);
    console.log(`   ⏳ 处理中: ${stats.processing}`);
    console.log(`   💰 已支付: ${stats.paid}`);
    console.log(`   ⏸️  待支付: ${stats.pending}`);
    console.log(`   ❌ 失败: ${stats.failed}`);
    console.log(`   💵 总金额: ¥${stats.totalAmount.toFixed(2)}`);

    console.log('\n🎉 测试数据添加完成！');
    console.log(`\n💡 现在可以登录 ${username} 账户查看订单记录了`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

addTestOrders();
