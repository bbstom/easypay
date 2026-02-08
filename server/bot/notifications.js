const { getBotInstance } = require('./MultiBotManager');
const contentService = require('./services/contentService');
const { Markup } = require('telegraf');

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
      // 尝试使用自定义模板
      const TelegramContent = require('../models/TelegramContent');
      const template = await TelegramContent.findOne({ 
        key: 'payment_success', 
        enabled: true 
      });

      let message = null;
      let buttons = Markup.inlineKeyboard([[
        Markup.button.callback('📋 查看订单', `order_detail_${order._id}`)
      ]]);

      if (template && template.content && template.content.text) {
        // 使用自定义模板
        const variables = {
          _id: order._id.toString(),  // MongoDB _id，用于按钮回调
          orderId: order.platformOrderId,  // 平台订单号，用于显示
          totalCNY: Number(order.totalCNY).toFixed(2),
          payType: order.payType
        };
        
        message = template.content.text
          .replace(/{{orderId}}/g, variables.orderId)
          .replace(/{{totalCNY}}/g, variables.totalCNY)
          .replace(/{{payType}}/g, variables.payType);
        
        // 如果有自定义按钮，使用自定义按钮（传入变量）
        if (template.buttons && template.buttons.length > 0) {
          buttons = contentService.buildButtons(template, variables);
        }
      } else {
        // 使用默认消息
        message = `🎉 <b>支付成功！</b>\n\n` +
          `━━━━━━━━━━━━━━━\n` +
          `<code>订单号：</code><code>${order.platformOrderId}</code>\n` +
          `<code>金  额：</code><b>${Number(order.totalCNY).toFixed(2)} CNY</b>\n` +
          `━━━━━━━━━━━━━━━\n\n` +
          `⏳ 正在处理 <b>${order.payType} 代付</b>...\n` +
          `⏱️ 预计 <b>2-10 分钟</b>完成\n\n` +
          `💬 完成后会自动通知您\n` +
          `⚠️ 请勿关闭此页面`;
      }

      await this.bot.sendMessage(
        telegramId,
        message,
        {
          parse_mode: 'HTML',
          ...buttons
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
      // 尝试使用自定义模板
      const TelegramContent = require('../models/TelegramContent');
      const template = await TelegramContent.findOne({ 
        key: 'transfer_complete', 
        enabled: true 
      });

      let message = null;
      let buttons = Markup.inlineKeyboard([
        [Markup.button.url('🔍 查看交易', `https://tronscan.org/#/transaction/${order.txHash}`)],
        [Markup.button.callback('📋 查看订单详情', `order_detail_${order._id}`)]
      ]);

      if (template && template.content && template.content.text) {
        // 使用自定义模板
        const variables = {
          _id: order._id.toString(),  // MongoDB _id，用于按钮回调
          orderId: order.platformOrderId,  // 平台订单号，用于显示
          amount: order.amount,
          payType: order.payType,
          address: this.formatAddress(order.address),
          txHash: order.txHash
        };
        
        message = template.content.text
          .replace(/{{orderId}}/g, variables.orderId)
          .replace(/{{amount}}/g, variables.amount)
          .replace(/{{payType}}/g, variables.payType)
          .replace(/{{address}}/g, variables.address)
          .replace(/{{txHash}}/g, variables.txHash);
        
        if (template.buttons && template.buttons.length > 0) {
          buttons = contentService.buildButtons(template, variables);
        }
      } else {
        // 使用默认消息
        message = `✅ <b>代付完成！</b>\n\n` +
          `━━━━━━━━━━━━━━━\n` +
          `<code>订单号：</code><code>${order.platformOrderId}</code>\n` +
          `<code>数  量：</code><b>${order.amount} ${order.payType}</b>\n` +
          `<code>地  址：</code><code>${this.formatAddress(order.address)}</code>\n` +
          `━━━━━━━━━━━━━━━\n\n` +
          `🔗 <b>交易哈希</b>\n` +
          `<code>${order.txHash}</code>\n\n` +
          `🔍 点击下方按钮查看交易详情`;
      }

      await this.bot.sendMessage(
        telegramId,
        message,
        {
          parse_mode: 'HTML',
          ...buttons
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
      // 尝试使用自定义模板
      const TelegramContent = require('../models/TelegramContent');
      const template = await TelegramContent.findOne({ 
        key: 'transfer_failed', 
        enabled: true 
      });

      let message = null;
      let buttons = Markup.inlineKeyboard([
        [
          Markup.button.callback('📋 查看订单', `order_detail_${order._id}`)
        ],
        [
          Markup.button.callback('💬 联系客服', `create_ticket_order_${order._id}`)
        ]
      ]);

      if (template && template.content && template.content.text) {
        // 使用自定义模板
        const variables = {
          _id: order._id.toString(),  // MongoDB _id，用于按钮回调
          orderId: order.platformOrderId,  // 平台订单号，用于显示
          platformOrderId: order.platformOrderId,
          amount: order.amount,
          payType: order.payType,
          reason: reason
        };
        
        message = template.content.text
          .replace(/{{orderId}}/g, variables.orderId)
          .replace(/{{platformOrderId}}/g, variables.platformOrderId)
          .replace(/{{amount}}/g, variables.amount)
          .replace(/{{payType}}/g, variables.payType)
          .replace(/{{reason}}/g, variables.reason);
        
        if (template.buttons && template.buttons.length > 0) {
          buttons = contentService.buildButtons(template, variables);
        }
      } else {
        // 使用默认消息
        message = `❌ <b>代付失败</b>\n\n` +
          `━━━━━━━━━━━━━━━\n` +
          `<code>订单号：</code><code>${order.platformOrderId}</code>\n` +
          `<code>数  量：</code>${order.amount} ${order.payType}\n` +
          `━━━━━━━━━━━━━━━\n\n` +
          `<b>失败原因：</b>\n<i>${reason}</i>\n\n` +
          `💡 <b>处理说明：</b>\n` +
          `• 您的支付已成功收到\n` +
          `• 系统会自动重试代付\n` +
          `• 如长时间未到账，请联系客服\n` +
          `• 我们会尽快为您处理`;
      }

      await this.bot.sendMessage(
        telegramId,
        message,
        {
          parse_mode: 'HTML',
          ...buttons
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
        `回复时间：${new Date(reply.createdAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`,
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
