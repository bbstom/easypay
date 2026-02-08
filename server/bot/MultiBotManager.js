const { Telegraf, session } = require('telegraf');
const User = require('../models/User');
const Settings = require('../models/Settings');
const contentService = require('./services/contentService');
const { registerCustomCommands, handleCommand, initializeDefaultCommands } = require('./commandHandler');

// 导入处理器
const startHandler = require('./handlers/start');
const paymentHandler = require('./handlers/payment');
const ordersHandler = require('./handlers/orders');
const ticketsHandler = require('./handlers/tickets');
const energyHandler = require('./handlers/energy');
const swapHandler = require('./handlers/swap');

/**
 * 多 Bot 管理器
 * 支持同时运行多个 Telegram Bot 实例
 */
class MultiBotManager {
  constructor() {
    this.bots = [];
    this.initializeBots();
  }

  /**
   * 初始化所有 Bot 实例
   */
  initializeBots() {
    // 检查是否配置了多个 Bot
    const multiTokens = process.env.TELEGRAM_BOT_TOKENS;
    const multiUsernames = process.env.TELEGRAM_BOT_USERNAMES;

    if (multiTokens && multiUsernames) {
      // 多 Bot 模式
      const tokens = multiTokens.split(',').map(t => t.trim());
      const usernames = multiUsernames.split(',').map(u => u.trim());

      if (tokens.length !== usernames.length) {
        console.error('❌ TELEGRAM_BOT_TOKENS 和 TELEGRAM_BOT_USERNAMES 数量不匹配');
        return;
      }

      console.log(`🤖 检测到 ${tokens.length} 个 Bot 配置`);

      tokens.forEach((token, index) => {
        if (token) {
          const username = usernames[index];
          this.createBot(token, username, index + 1);
        }
      });
    } else if (process.env.TELEGRAM_BOT_TOKEN) {
      // 单 Bot 模式（向后兼容）
      const token = process.env.TELEGRAM_BOT_TOKEN;
      const username = process.env.TELEGRAM_BOT_USERNAME || 'bot';
      this.createBot(token, username, 1);
    } else {
      console.log('⚠️  未配置 TELEGRAM_BOT_TOKEN，跳过 Bot 启动');
    }
  }

  /**
   * 创建单个 Bot 实例
   */
  createBot(token, username, index) {
    try {
      const bot = new Telegraf(token);
      
      // 设置 Bot 信息
      bot.botUsername = username;
      bot.botIndex = index;

      // 设置中间件
      this.setupMiddleware(bot);
      
      // 设置处理器
      this.setupHandlers(bot);

      this.bots.push({
        bot,
        token,
        username,
        index
      });

      console.log(`✅ Bot #${index} 已初始化: @${username}`);
    } catch (error) {
      console.error(`❌ Bot #${index} 初始化失败:`, error);
    }
  }

  /**
   * 设置中间件
   */
  setupMiddleware(bot) {
    // Session 中间件
    bot.use(session({
      defaultSession: () => ({})
    }));

    // 日志中间件
    bot.use(async (ctx, next) => {
      const start = Date.now();
      const updateType = ctx.updateType;
      const text = ctx.message?.text;
      const botUsername = bot.botUsername;
      console.log(`📥 [@${botUsername}] 收到更新: ${updateType}${text ? ` - "${text}"` : ''}`);
      await next();
      const ms = Date.now() - start;
      console.log(`📱 [@${botUsername}] TG: ${updateType} - ${ms}ms`);
    });

    // 用户认证中间件
    bot.use(async (ctx, next) => {
      if (!ctx.session) {
        ctx.session = {};
      }

      const isGroup = ctx.chat?.type === 'group' || ctx.chat?.type === 'supergroup';
      
      // 群组消息处理
      if (isGroup && !ctx.message?.text?.startsWith('/start')) {
        const telegramId = ctx.from?.id?.toString();
        const botUsername = bot.botUsername;
        
        if (ctx.message?.text?.startsWith('/') || ctx.callbackQuery) {
          const { Markup } = require('telegraf');
          
          let action = 'start';
          if (ctx.callbackQuery) {
            action = ctx.callbackQuery.data || 'start';
          } else if (ctx.message?.text) {
            const command = ctx.message.text.split(' ')[0].replace('/', '');
            action = command;
          }
          
          const message = `🔒 <b>隐私保护</b>\n\n` +
            `为了保护您的账户安全和隐私信息，所有操作需要在私聊中进行。\n\n` +
            `👇 点击下方按钮，我会在私聊中为您继续操作`;
          
          try {
            if (ctx.callbackQuery) {
              await ctx.answerCbQuery('请点击按钮跳转到私聊 🔒');
              await ctx.reply(message, {
                parse_mode: 'HTML',
                ...Markup.inlineKeyboard([
                  [Markup.button.url('💬 跳转到私聊', `https://t.me/${botUsername}?start=${action}`)]
                ])
              });
            } else {
              await ctx.reply(message, {
                parse_mode: 'HTML',
                ...Markup.inlineKeyboard([
                  [Markup.button.url('💬 跳转到私聊', `https://t.me/${botUsername}?start=${action}`)]
                ])
              });
            }
          } catch (error) {
            console.error('发送群组提示失败:', error);
          }
          
          return;
        }
        
        return;
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
          return ctx.reply(
            '❌ 请先使用 /start 命令开始使用',
            { reply_markup: { remove_keyboard: true } }
          );
        }
      }

      return next();
    });
  }

  /**
   * 设置处理器
   */
  setupHandlers(bot) {
    // 命令处理
    bot.command('start', startHandler.start);
    bot.command('menu', startHandler.menu);
    bot.command('help', startHandler.help);
    bot.command('cancel', startHandler.cancel);
    
    // 群组/频道消息监听
    bot.on('my_chat_member', this.handleChatMemberUpdate.bind(this));
    
    // 统一的文本消息处理器
    bot.on('text', async (ctx) => {
      const text = ctx.message.text;
      
      // 先更新群组消息统计
      await this.handleGroupMessage(ctx);
      
      // 检查是否是命令
      if (text && text.startsWith('/')) {
        const commandName = text.split(' ')[0].substring(1).split('@')[0];
        const handled = await handleCommand(ctx, commandName);
        if (handled) return;
      }
      
      // 处理用户输入
      await this.handleText(ctx);
    });

    // 回调查询处理
    bot.on('callback_query', async (ctx) => {
      try {
        const data = ctx.callbackQuery.data;
        console.log(`🔍 [@${bot.botUsername}] 收到回调: ${data}`);
        
        // 通用回调（必须在前面）
        if (data === 'back_to_main') {
          console.log(`✅ [@${bot.botUsername}] 处理返回主菜单`);
          return startHandler.handleBack(ctx);
        }
        
        // 功能回调
        if (data.startsWith('payment_') || data === 'confirm_payment' || data.startsWith('pay_')) {
          return paymentHandler.handleCallback(ctx);
        }
        
        if (data.startsWith('order') || data === 'my_orders') {
          return ordersHandler.handleCallback(ctx);
        }
        
        if (data.startsWith('ticket') || data === 'create_ticket') {
          return ticketsHandler.handleCallback(ctx);
        }
        
        if (data.startsWith('energy') || data === 'energy_rental') {
          return energyHandler.handleCallback(ctx);
        }
        
        if (data.startsWith('swap') || data === 'swap_service') {
          return swapHandler.handleCallback(ctx);
        }
        
        if (data === 'account_info' || data === 'change_email') {
          if (data === 'account_info') {
            return startHandler.accountInfo(ctx);
          } else if (data === 'change_email') {
            return startHandler.changeEmail(ctx);
          }
        }
        
        if (data.startsWith('login_confirm_')) {
          return startHandler.handleLoginConfirm(ctx);
        }
        
        console.log(`❌ [@${bot.botUsername}] 未知操作: ${data}`);
        await ctx.answerCbQuery('未知操作').catch(() => {});
      } catch (error) {
        // 忽略回调查询超时错误
        if (error.message && error.message.includes('query is too old')) {
          console.log(`⚠️  [@${bot.botUsername}] 回调查询已超时（可忽略）`);
        } else {
          console.error(`❌ [@${bot.botUsername}] 回调处理错误:`, error.message);
        }
      }
    });
  }

  /**
   * 处理文本消息
   */
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
      case 'waiting_new_email':
        return startHandler.handleNewEmail(ctx);
      default:
        return ctx.reply(
          '💡 请使用菜单选择功能，或发送 /menu 查看菜单',
          await startHandler.getMainKeyboard()
        );
    }
  }

  /**
   * 处理 Bot 被添加/移除群组
   */
  async handleChatMemberUpdate(ctx) {
    const TelegramGroup = require('../models/TelegramGroup');
    const chat = ctx.chat;
    const newStatus = ctx.myChatMember.new_chat_member.status;

    try {
      if (newStatus === 'member' || newStatus === 'administrator') {
        const groupData = {
          chatId: chat.id.toString(),
          title: chat.title || 'Unknown',
          type: chat.type,
          username: chat.username,
          botStatus: newStatus === 'administrator' ? 'admin' : 'member',
          active: true,
          joinedAt: new Date()
        };

        if (newStatus === 'administrator') {
          const member = ctx.myChatMember.new_chat_member;
          groupData.botPermissions = {
            canSendMessages: member.can_send_messages || false,
            canDeleteMessages: member.can_delete_messages || false,
            canPinMessages: member.can_pin_messages || false
          };
        }

        await TelegramGroup.findOneAndUpdate(
          { chatId: chat.id.toString() },
          groupData,
          { upsert: true, new: true }
        );

        console.log(`✅ Bot 已加入群组: ${chat.title}`);
      } else if (newStatus === 'left' || newStatus === 'kicked') {
        await TelegramGroup.findOneAndUpdate(
          { chatId: chat.id.toString() },
          { botStatus: 'left', active: false },
          { new: true }
        );

        console.log(`❌ Bot 已离开群组: ${chat.title}`);
      }
    } catch (error) {
      console.error('处理群组更新失败:', error);
    }
  }

  /**
   * 处理群组消息
   */
  async handleGroupMessage(ctx) {
    const chat = ctx.chat;
    
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

  /**
   * 启动所有 Bot
   */
  async start() {
    if (this.bots.length === 0) {
      console.log('⚠️  没有可用的 Bot 实例');
      return;
    }

    try {
      // 初始化默认命令
      await initializeDefaultCommands();
      
      // 并行启动所有 Bot
      const launchPromises = this.bots.map(async (botInstance) => {
        const { bot, username, index } = botInstance;
        
        try {
          console.log(`🔄 正在启动 Bot #${index}: @${username}...`);
          
          // 注册自定义命令
          await registerCustomCommands(bot);
          
          // 启动 Bot（不等待，让它在后台运行）
          bot.launch().then(() => {
            console.log(`🤖 Bot #${index} 已启动: @${username}`);
          }).catch((error) => {
            // 忽略启动时的旧回调超时错误
            if (error.message && error.message.includes('query is too old')) {
              console.log(`⚠️  Bot #${index} (@${username}) 启动时有旧回调超时（可忽略）`);
            } else {
              console.error(`❌ Bot #${index} (@${username}) 启动失败:`, error.message);
            }
          });
          
          // 等待一小段时间确保 Bot 开始启动
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`❌ Bot #${index} (@${username}) 初始化失败:`, error.message);
          console.error('详细错误:', error);
        }
      });

      await Promise.all(launchPromises);
      console.log(`✅ 所有 Bot 已启动 (共 ${this.bots.length} 个)`);

      // 优雅关闭
      process.once('SIGINT', () => this.stop('SIGINT'));
      process.once('SIGTERM', () => this.stop('SIGTERM'));
    } catch (error) {
      console.error('❌ Bot 启动失败:', error);
    }
  }

  /**
   * 停止所有 Bot
   */
  stop(signal) {
    console.log(`\n🛑 收到 ${signal} 信号，正在停止所有 Bot...`);
    this.bots.forEach(({ bot, username }) => {
      bot.stop(signal);
      console.log(`✅ Bot @${username} 已停止`);
    });
  }

  /**
   * 重新加载命令
   */
  async reloadCommands() {
    for (const { bot, username } of this.bots) {
      try {
        await registerCustomCommands(bot);
        console.log(`✅ Bot @${username} 命令已重新加载`);
      } catch (error) {
        console.error(`❌ Bot @${username} 重新加载命令失败:`, error);
      }
    }
  }

  /**
   * 发送通知（使用第一个 Bot）
   */
  async sendNotification(telegramId, message, options = {}) {
    if (this.bots.length === 0) return;
    
    const { bot } = this.bots[0];
    try {
      await bot.telegram.sendMessage(telegramId, message, options);
    } catch (error) {
      console.error('发送通知失败:', error);
    }
  }

  /**
   * 获取 Bot 实例（用于通知服务）
   */
  getBotInstance() {
    if (this.bots.length === 0) return null;
    return this.bots[0];
  }
}

// 导出单例
let instance = null;

function getBotInstance() {
  if (!instance) {
    instance = new MultiBotManager();
  }
  return instance.getBotInstance();
}

module.exports = { MultiBotManager, getBotInstance };
