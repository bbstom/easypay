require('dotenv').config();
const mongoose = require('mongoose');
const Payment = require('../models/Payment');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fastpay';

const deleteTestData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ 已连接到 MongoDB');
    
    // 查找所有地址后4位为9999的记录
    const testPayments = await Payment.find({
      address: { $regex: '9999$' }
    });
    
    console.log(`\n🔍 找到 ${testPayments.length} 条测试数据（地址后4位为9999）`);
    
    if (testPayments.length > 0) {
      console.log('\n前5条示例:');
      testPayments.slice(0, 5).forEach((p, i) => {
        console.log(`${i + 1}. ${p.platformOrderId || p._id.toString().slice(-8)} - ${p.address}`);
      });
      
      // 删除这些记录
      const result = await Payment.deleteMany({
        address: { $regex: '9999$' }
      });
      
      console.log(`\n✅ 成功删除 ${result.deletedCount} 条测试数据`);
    } else {
      console.log('\n✅ 没有找到需要删除的测试数据');
    }
    
    // 显示剩余数据统计
    const remaining = await Payment.countDocuments();
    console.log(`\n📊 数据库中剩余 ${remaining} 条记录`);
    
    await mongoose.disconnect();
    console.log('\n✅ 已断开 MongoDB 连接');
    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
};

deleteTestData();
