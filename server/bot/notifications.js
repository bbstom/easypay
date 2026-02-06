const { getBotInstance } = require('./index');

class NotificationService {
  constructor() {
    this.bot = null;
  }

  // 初始化 Bot 实例
  init() {
    const botInstance = getBotInstance();
    if (botInstance && botInstance.bot) {
      this.bot = botInstance.bot.telegram;
    }
  }

  // 支付成功通知
  async notifyPaymentSuccess(telegramId, order) {
    if (!this.bot) this.init();
    if (!this.bot || !telegramId) return;

    try {
      await this.bot.sendMessage(
        telegramId,
        `🎉 <b>支付成功！</b>\n\n` +
        `━━━━━━━━━━━━━━━\n` +
        `<code>订单号：</code><code>${order.platformOrderId}</code>\n` +
        `<code>金  额：</code><b>${order.totalCNY} CNY</b>\n` +
        `━━━━━━━━━━━━━━━\n\n` +
        `⏳ 正在处理 <b>${order.payType} 代付</b>...\n` +
        `⏱ 预计 <b>2-10 分钟</b>完成\n\n` +
        `💬 完成后会自动通知您\n` +
        `⚠️ 请勿关闭此页面`,
        {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [[
              { text: '📋 查看订单', callback_data: `order_detail_${order._id}` }
            ]]
          }
        }
      );
      console.log(`✅ 支付成功通知已发送: TG ${telegramId}`);
    } catch (error) {
      console.error('发送支付成功通知失败:', error);
    }
  }

  // 代付完成通知
  async notifyTransferComplete(telegramId, order) {
    if (!this.bot) this.init();
    if (!this.bot || !telegramId) return;

    try {
      await this.bot.sendMessage(
        telegramId,
        `✅ <b>代付完成！</b>\n\n` +
        `━━━━━━━━━━━━━━━\n` +
        `<code>订单号：</code><code>${order.platformOrderId}</code>\n` +
        `<code>数  量：</code><b>${order.amount} ${order.payType}</b>\n` +
        `<code>地  址：</code><code>${this.formatAddress(order.address)}</code>\n` +
        `━━━━━━━━━━━━━━━\n\n` +
        `🔗 <b>交易哈希</b>\n` +
        `<code>${order.txHash}</code>\n\n` +
        `🔍 点击下方按钮查看交易详情`,
        {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ 
                text: '🔍 查看交易', 
                url: `https://tronscan.org/#/transaction/${order.txHash}` 
              }],
              [{ 
                text: '📋 查看订单详情', 
                callback_data: `order_detail_${order._id}` 
              }]
            ]
          }
        }
      );
      console.log(`✅ 代付完成通知已发送: TG ${telegramId}`);
    } catch (error) {
      console.error('发送代付完成通知失败:', error);
    }
  }

  // 代付失败通知
  async notifyTransferFailed(telegramId, order, reason) {
    if (!this.bot) this.init();
    if (!this.bot || !telegramId) return;

    try {
      await this.bot.sendMessage(
        telegramId,
        `❌ <b>代付失败</b>\n\n` +
        `━━━━━━━━━━━━━━━\n` +
        `<code>订单号：</code><code>${order.platformOrderId}</code>\n` +
        `<code>数  量：</code>${order.amount} ${order.payType}\n` +
        `━━━━━━━━━━━━━━━\n\n` +
        `<b>失败原因：</b>\n<i>${reason}</i>\n\n` +
        `💬 请联系客服处理`,
        {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [[
              { text: '📋 查看订单', callback_data: `order_detail_${order._id}` }
            ]]
          }
        }
      );
      console.log(`✅ 代付失败通知已发送: TG ${telegramId}`);
    } catch (error) {
      console.error('发送代付失败通知失败:', error);
    }
  }

  // 工单回复通知
  async notifyTicketReply(telegramId, ticket, reply) {
    if (!this.bot) this.init();
    if (!this.bot || !telegramId) return;

    try {
      await this.bot.sendMessage(
        telegramId,
        `💬 工单有新回复\n\n` +
        `工单号：#${ticket.ticketNumber}\n` +
        `标题：${ticket.subject}\n\n` +
        `客服回复：\n${reply.message}\n\n` +
        `回复时间：${new Date(reply.createdAt).toLocaleString('zh-CN')}`,
        {
          reply_markup: {
            inline_keyboard: [[
              { text: '📋 查看详情', callback_data: `ticket_detail_${ticket._id}` }
            ]]
          }
        }
      );
      console.log(`✅ 工单回复通知已发送: TG ${telegramId}`);
    } catch (error) {
      console.error('发送工单回复通知失败:', error);
    }
  }

  // 辅助函数
  formatAddress(address) {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  }
}

// 导出单例
module.exports = new NotificationService();
