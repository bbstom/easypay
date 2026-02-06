const { Telegraf, session } = require('telegraf');
const User = require('../models/User');
const Settings = require('../models/Settings');
const contentService = require('./services/contentService');

// 导入处理器
const startHandler = require('./handlers/start');
const paymentHandler = require('./handlers/payment');
const ordersHandler = require('./handlers/orders');
const ticketsHandler = require('./handlers/tickets');
const energyHandler = require('./handlers/energy');
const swapHandler = require('./handlers/swap');

class TelegramBot {
  constructor() {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      console.log('⚠️  未配置 TELEGRAM_BOT_TOKEN，跳过 Bot 启动');
      return;
    }

    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
    this.setupMiddleware();
    this.setupHandlers();
  }

  setupMiddleware() {
    // Session 中间件 - 使用默认内存存储
    this.bot.use(session({
      defaultSession: () => ({})
    }));

    // 日志中间件
    this.bot.use(async (ctx, next) => {
      const start = Date.now();
      await next();
      const ms = Date.now() - start;
      console.log(`📱 TG: ${ctx.updateType} - ${ms}ms`);
    });

    // 用户认证中间件
    this.bot.use(async (ctx, next) => {
      // 确保 session 已初始化
      if (!ctx.session) {
        ctx.session = {};
      }

      // /start 命令不需要认证
      if (ctx.message?.text?.startsWith('/start')) {
        return next();
      }

      // 获取或创建用户
      if (!ctx.session.user) {
        const telegramId = ctx.from?.id?.toString();
        if (!telegramId) {
          return next();
        }

        const user = await User.findOne({ telegramId });
        
        if (user) {
          ctx.session.user = user;
        } else {
          // 未找到用户，提示使用 /start
          return ctx.reply(
            '❌ 请先使用 /start 命令开始使用',
            { reply_markup: { remove_keyboard: true } }
          );
        }
      }

      return next();
    });
  }

  setupHandlers() {
    // 命令处理
    this.bot.command('start', startHandler.start);
    this.bot.command('menu', startHandler.menu);
    this.bot.command('help', startHandler.help);
    this.bot.command('cancel', startHandler.cancel);

    // 群组/频道消息监听（自动记录）
    this.bot.on('my_chat_member', this.handleChatMemberUpdate.bind(this));
    this.bot.on('message', this.handleGroupMessage.bind(this));

    // 回调查询处理（按钮点击）
    this.bot.action(/^payment_/, paymentHandler.handleCallback);
    this.bot.action(/^confirm_/, paymentHandler.handleCallback);
    this.bot.action(/^pay_/, paymentHandler.handleCallback);
    this.bot.action(/^check_order_/, paymentHandler.handleCallback);
    this.bot.action(/^orders_/, ordersHandler.handleCallback);
    this.bot.action(/^order_/, ordersHandler.handleCallback);
    this.bot.action(/^tickets_/, ticketsHandler.handleCallback);
    this.bot.action(/^ticket_/, ticketsHandler.handleCallback);
    this.bot.action(/^energy_/, energyHandler.handleCallback);
    this.bot.action(/^swap_/, swapHandler.handleCallback);
    this.bot.action('energy_rental', energyHandler.handleCallback);
    this.bot.action('swap_service', swapHandler.handleCallback);
    this.bot.action(/^copy_/, async (ctx) => {
      const data = ctx.callbackQuery.data.replace('copy_', '');
      await contentService.handleCopyButton(ctx, data);
    });
    this.bot.action(/^confirm_login_/, startHandler.handleLoginConfirm);
    this.bot.action('cancel_login', startHandler.handleLoginConfirm);
    this.bot.action(/^back_/, startHandler.handleBack);
    this.bot.action('cancel', startHandler.cancel);
    this.bot.action('help_center', startHandler.help);
    this.bot.action('account_info', startHandler.accountInfo);

    // 文本消息处理
    this.bot.on('text', this.handleText.bind(this));

    // 错误处理
    this.bot.catch((err, ctx) => {
      console.error('❌ Bot 错误:', err);
      ctx.reply('❌ 发生错误，请稍后重试或联系客服');
    });
  }

  // 处理 Bot 被添加/移除群组
  async handleChatMemberUpdate(ctx) {
    const TelegramGroup = require('../models/TelegramGroup');
    const chat = ctx.chat;
    const newStatus = ctx.myChatMember.new_chat_member.status;

    try {
      if (newStatus === 'member' || newStatus === 'administrator') {
        // Bot 被添加到群组或成为管理员
        const groupData = {
          chatId: chat.id.toString(),
          title: chat.title || 'Unknown',
          type: chat.type,
          username: chat.username,
          botStatus: newStatus === 'administrator' ? 'admin' : 'member',
          active: true,
          lastMessageAt: new Date()
        };

        // 如果是管理员，获取权限
        if (newStatus === 'administrator') {
          const member = ctx.myChatMember.new_chat_member;
          groupData.botPermissions = {
            canSendMessages: member.can_send_messages || false,
            canDeleteMessages: member.can_delete_messages || false,
            canPinMessages: member.can_pin_messages || false,
            canInviteUsers: member.can_invite_users || false
          };
        }

        await TelegramGroup.findOneAndUpdate(
          { chatId: chat.id.toString() },
          groupData,
          { upsert: true, new: true }
        );

        console.log(`✅ Bot 加入群组: ${chat.title} (${chat.id})`);
      } else if (newStatus === 'left' || newStatus === 'kicked') {
        // Bot 被移除
        await TelegramGroup.findOneAndUpdate(
          { chatId: chat.id.toString() },
          { botStatus: 'left', active: false },
          { new: true }
        );

        console.log(`❌ Bot 离开群组: ${chat.title} (${chat.id})`);
      }
    } catch (error) {
      console.error('处理群组状态更新失败:', error);
    }
  }

  // 处理群组消息（更新活跃状态）
  async handleGroupMessage(ctx) {
    const chat = ctx.chat;
    
    // 只处理群组和频道消息
    if (chat.type === 'group' || chat.type === 'supergroup' || chat.type === 'channel') {
      const TelegramGroup = require('../models/TelegramGroup');
      
      try {
        await TelegramGroup.findOneAndUpdate(
          { chatId: chat.id.toString() },
          {
            $set: {
              title: chat.title,
              username: chat.username,
              lastMessageAt: new Date(),
              active: true
            },
            $inc: { messageCount: 1 }
          },
          { upsert: true, new: true }
        );
      } catch (error) {
        console.error('更新群组信息失败:', error);
      }
    }
  }

  async handleText(ctx) {
    const user = ctx.session?.user;
    if (!user) {
      return ctx.reply('请先使用 /start 命令');
    }

    const state = ctx.session?.state;
    
    switch (state) {
      case 'waiting_usdt_amount':
        return paymentHandler.handleUSDTAmount(ctx);
      case 'waiting_trx_amount':
        return paymentHandler.handleTRXAmount(ctx);
      case 'waiting_usdt_address':
        return paymentHandler.handleUSDTAddress(ctx);
      case 'waiting_trx_address':
        return paymentHandler.handleTRXAddress(ctx);
      case 'waiting_ticket_subject':
        return ticketsHandler.handleTicketSubject(ctx);
      case 'waiting_ticket_description':
        return ticketsHandler.handleTicketDescription(ctx);
      case 'waiting_ticket_reply':
        return ticketsHandler.handleTicketReply(ctx);
      default:
        return ctx.reply(
          '💡 请使用菜单选择功能，或发送 /menu 查看菜单',
          await startHandler.getMainKeyboard()
        );
    }
  }

  async start() {
    if (!this.bot) return;

    try {
      // 启动 Bot
      await this.bot.launch();
      console.log('🤖 Telegram Bot 已启动');

      // 优雅关闭
      process.once('SIGINT', () => this.bot.stop('SIGINT'));
      process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
    } catch (error) {
      console.error('❌ Bot 启动失败:', error);
    }
  }

  // 发送通知的方法
  async sendNotification(telegramId, message, options = {}) {
    if (!this.bot) return;
    
    try {
      await this.bot.telegram.sendMessage(telegramId, message, options);
    } catch (error) {
      console.error('发送通知失败:', error);
    }
  }

  // 发送图片通知
  async sendPhoto(telegramId, photo, options = {}) {
    if (!this.bot) return;
    
    try {
      await this.bot.telegram.sendPhoto(telegramId, photo, options);
    } catch (error) {
      console.error('发送图片失败:', error);
    }
  }
}

// 导出单例
let botInstance = null;

function getBotInstance() {
  if (!botInstance) {
    botInstance = new TelegramBot();
  }
  return botInstance;
}

module.exports = { TelegramBot, getBotInstance };
