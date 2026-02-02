const Payment = require('../models/Payment');

/**
 * 订单超时检查服务
 * 自动将超过 30 分钟未支付的订单标记为失败
 */

class OrderTimeoutService {
  constructor() {
    this.checkInterval = null;
    this.timeoutMinutes = 30; // 超时时间（分钟）
  }

  /**
   * 启动定时检查
   */
  start() {
    if (this.checkInterval) {
      console.log('⚠️  订单超时检查服务已在运行');
      return;
    }

    console.log(`🕐 启动订单超时检查服务（超时时间: ${this.timeoutMinutes} 分钟）`);
    
    // 立即执行一次
    this.checkTimeoutOrders();
    
    // 每 5 分钟检查一次
    this.checkInterval = setInterval(() => {
      this.checkTimeoutOrders();
    }, 5 * 60 * 1000);
  }

  /**
   * 停止定时检查
   */
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('🛑 订单超时检查服务已停止');
    }
  }

  /**
   * 检查并标记超时订单
   */
  async checkTimeoutOrders() {
    try {
      const timeoutDate = new Date(Date.now() - this.timeoutMinutes * 60 * 1000);
      
      // 查找超时的待支付订单
      const timeoutOrders = await Payment.find({
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: { $lt: timeoutDate }
      });

      if (timeoutOrders.length === 0) {
        console.log('✅ 没有超时订单');
        return;
      }

      console.log(`⏰ 发现 ${timeoutOrders.length} 个超时订单，开始标记为失败...`);

      let successCount = 0;
      for (const order of timeoutOrders) {
        try {
          order.status = 'failed';
          order.paymentStatus = 'expired'; // 使用 expired 而不是 timeout
          order.transferStatus = 'failed'; // 使用 failed 而不是 cancelled
          await order.save();
          
          successCount++;
          console.log(`   ❌ ${order.platformOrderId} - 已标记为失败（超时 ${Math.floor((Date.now() - order.createdAt) / 60000)} 分钟）`);
        } catch (error) {
          console.error(`   ⚠️  标记订单失败: ${order.platformOrderId}`, error.message);
        }
      }

      console.log(`✅ 成功标记 ${successCount}/${timeoutOrders.length} 个订单为失败`);
    } catch (error) {
      console.error('❌ 检查超时订单失败:', error);
    }
  }

  /**
   * 手动检查（用于测试）
   */
  async manualCheck() {
    console.log('🔍 手动触发超时订单检查...');
    await this.checkTimeoutOrders();
  }
}

// 导出单例
module.exports = new OrderTimeoutService();
