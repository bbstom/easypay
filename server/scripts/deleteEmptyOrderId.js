const mongoose = require('mongoose');
require('dotenv').config();

const Payment = require('../models/Payment');

async function deleteEmptyOrderId() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('已连接到数据库');

    // 查找订单号为空的记录
    const emptyOrderPayments = await Payment.find({
      $or: [
        { platformOrderId: null },
        { platformOrderId: '' },
        { platformOrderId: { $exists: false } }
      ]
    });

    console.log(`找到 ${emptyOrderPayments.length} 条订单号为空的记录`);

    if (emptyOrderPayments.length > 0) {
      // 删除这些记录
      const result = await Payment.deleteMany({
        $or: [
          { platformOrderId: null },
          { platformOrderId: '' },
          { platformOrderId: { $exists: false } }
        ]
      });

      console.log(`已删除 ${result.deletedCount} 条记录`);
    } else {
      console.log('没有需要删除的记录');
    }

    // 显示剩余记录数
    const remainingCount = await Payment.countDocuments();
    console.log(`数据库中剩余 ${remainingCount} 条记录`);

    await mongoose.connection.close();
    console.log('数据库连接已关闭');
  } catch (error) {
    console.error('删除失败:', error);
    process.exit(1);
  }
}

deleteEmptyOrderId();
