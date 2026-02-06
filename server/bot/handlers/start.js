const User = require('../../models/User');
const Settings = require('../../models/Settings');
const { getMainKeyboard, getBackKeyboard } = require('../keyboards/main');
const contentService = require('../services/contentService');

// /start 命令处理
async function start(ctx) {
  const telegramId = ctx.from.id.toString();
  const username = ctx.from.username || `tg_${telegramId}`;
  const firstName = ctx.from.first_name || 'User';
  const lastName = ctx.from.last_name || '';
  const photoUrl = ctx.from.photo_url || '';

  // 检查是否是扫码登录
  const startPayload = ctx.message?.text?.split(' ')[1];
  if (startPayload && startPayload.startsWith('login_')) {
    return handleQRLogin(ctx, startPayload, telegramId, username, firstName, lastName, photoUrl);
  }

  try {
    // 确保 session 已初始化
    if (!ctx.session) {
      ctx.session = {};
    }

    // 获取系统设置
    const settings = await Settings.findOne();
    const siteName = settings?.siteName || 'FastPay';
    const websiteUrl = process.env.APP_URL || 'https://kk.vpno.eu.org';

    // 检查用户是否已存在
    let user = await User.findOne({ telegramId });

    if (user) {
      // 已有账户，欢迎回来
      ctx.session.user = user;
      
      // 尝试使用自定义内容
      const mainKeyboard = await getMainKeyboard();
      const sent = await contentService.sendContent(ctx, 'welcome_returning_user', {
        firstName,
        email: user.email,
        telegramId
      }, mainKeyboard);

      // 如果没有自定义内容，使用默认消息
      if (!sent) {
        await ctx.reply(
          `🎉 <b>欢迎回来！</b>\n\n` +
          `👤 <b>账户信息</b>\n` +
          `━━━━━━━━━━━━━━━\n` +
          `<code>用户名：</code>${firstName}\n` +
          `<code>邮  箱：</code>${user.email}\n` +
          `<code>TG ID：</code>${telegramId}\n` +
          `━━━━━━━━━━━━━━━\n\n` +
          `💡 请选择您需要的服务 👇`,
          { 
            parse_mode: 'HTML',
            ...(await getMainKeyboard())
          }
        );
      }
    } else {
      // 新用户，自动创建账户
      user = await User.create({
        username: username,
        email: `${telegramId}@telegram.user`,
        telegramId: telegramId,
        telegramUsername: username,
        telegramFirstName: firstName,
        telegramLastName: lastName,
        telegramBound: true,
        source: 'telegram',
        role: 'user'
      });

      ctx.session.user = user;

      // 尝试使用自定义内容
      const mainKeyboard = await getMainKeyboard();
      const sent = await contentService.sendContent(ctx, 'welcome_new_user', {
        siteName,
        username,
        telegramId,
        websiteUrl
      }, mainKeyboard);

      // 如果没有自定义内容，使用默认消息
      if (!sent) {
        await ctx.reply(
          `🎊 <b>欢迎使用 ${siteName}！</b>\n\n` +
          `✅ <b>账户已自动创建</b>\n` +
          `━━━━━━━━━━━━━━━\n` +
          `<code>用户名：</code>${username}\n` +
          `<code>TG ID：</code>${telegramId}\n` +
          `━━━━━━━━━━━━━━━\n\n` +
          `💡 <b>您可以直接开始使用所有功能！</b>\n\n` +
          `🌐 <b>网站同步使用</b>\n` +
          `<code>1️⃣</code> 访问 ${websiteUrl}\n` +
          `<code>2️⃣</code> 点击 "使用 Telegram 登录"\n` +
          `<code>3️⃣</code> 授权后即可同步使用\n\n` +
          `👇 请选择您需要的服务`,
          { 
            parse_mode: 'HTML',
            ...(await getMainKeyboard())
          }
        );
      }
    }
  } catch (error) {
    console.error('Start 命令错误:', error);
    await ctx.reply('❌ 发生错误，请稍后重试');
  }
}

// 处理扫码登录
async function handleQRLogin(ctx, token, telegramId, username, firstName, lastName, photoUrl) {
  try {
    const axios = require('axios');
    const apiUrl = process.env.API_URL || 'http://localhost:5000';

    await ctx.reply(
      `🔐 <b>网站登录确认</b>\n\n` +
      `📱 检测到您正在扫码登录网站\n\n` +
      `👤 <b>账户信息</b>\n` +
      `━━━━━━━━━━━━━━━\n` +
      `<code>用户名：</code>${firstName}\n` +
      `<code>TG ID：</code>${telegramId}\n` +
      `━━━━━━━━━━━━━━━\n\n` +
      `⚠️ <b>请确认是否为您本人操作</b>\n` +
      `点击下方按钮确认登录`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[
            { text: '✅ 确认登录', callback_data: `confirm_login_${token}` },
            { text: '❌ 取消', callback_data: 'cancel_login' }
          ]]
        }
      }
    );
  } catch (error) {
    console.error('处理扫码登录错误:', error);
    await ctx.reply('❌ 登录确认失败，请重试');
  }
}

// 处理登录确认回调
async function handleLoginConfirm(ctx) {
  const callbackData = ctx.callbackQuery.data;
  
  if (callbackData === 'cancel_login') {
    await ctx.editMessageText(
      `❌ <b>登录已取消</b>\n\n` +
      `如果不是您本人操作，请注意账户安全。`,
      { parse_mode: 'HTML' }
    );
    await ctx.answerCbQuery('已取消登录');
    return;
  }

  if (callbackData.startsWith('confirm_login_')) {
    const token = callbackData.replace('confirm_login_', '');
    const telegramId = ctx.from.id.toString();
    const username = ctx.from.username || `tg_${telegramId}`;
    const firstName = ctx.from.first_name || 'User';
    const lastName = ctx.from.last_name || '';
    
    try {
      const axios = require('axios');
      const apiUrl = process.env.API_URL || 'http://localhost:5000';
      
      // 调用后端 API 确认登录
      await axios.post(`${apiUrl}/api/auth/confirm-qr-login`, {
        token,
        telegramId,
        username,
        firstName,
        lastName
      });

      await ctx.editMessageText(
        `✅ <b>登录成功！</b>\n\n` +
        `🎉 您已成功登录网站\n` +
        `请返回浏览器查看`,
        { parse_mode: 'HTML' }
      );
      await ctx.answerCbQuery('登录成功！');
    } catch (error) {
      console.error('确认登录错误:', error);
      await ctx.editMessageText(
        `❌ <b>登录失败</b>\n\n` +
        `请重新扫码或稍后重试`,
        { parse_mode: 'HTML' }
      );
      await ctx.answerCbQuery('登录失败，请重试');
    }
  }
}

// /menu 命令处理
async function menu(ctx) {
  const user = ctx.session?.user;
  if (!user) {
    return ctx.reply('请先使用 /start 命令');
  }

  await ctx.reply(
    `📋 <b>主菜单</b>\n\n` +
    `👇 请选择您需要的服务`,
    { 
      parse_mode: 'HTML',
      ...(await getMainKeyboard())
    }
  );
}

// /help 命令处理
async function help(ctx) {
  const settings = await Settings.findOne();
  const siteName = settings?.siteName || 'FastPay';
  const telegramCustomerService = settings?.telegramCustomerService || '';

  let helpText = `❓ <b>帮助中心</b>\n\n` +
    `📖 <b>使用说明</b>\n` +
    `━━━━━━━━━━━━━━━\n\n` +
    `💰 <b>代付服务</b>\n` +
    `<code>•</code> 支持 USDT 和 TRX 代付\n` +
    `<code>•</code> 输入数量和地址即可\n` +
    `<code>•</code> 支持微信和支付宝支付\n` +
    `<code>•</code> 2-10分钟内完成\n\n` +
    `📋 <b>订单查询</b>\n` +
    `<code>•</code> 查看所有历史订单\n` +
    `<code>•</code> 实时查看订单状态\n` +
    `<code>•</code> 查看交易哈希\n\n` +
    `🔔 <b>通知功能</b>\n` +
    `<code>•</code> 支付成功自动通知\n` +
    `<code>•</code> 代付完成自动通知\n` +
    `<code>•</code> 无需手动刷新\n\n`;

  if (telegramCustomerService) {
    helpText += `💬 <b>需要帮助？</b>\n` +
      `联系客服：${telegramCustomerService}\n\n`;
  }

  helpText += `🌐 <b>网站地址</b>\n${process.env.APP_URL || 'https://kk.vpno.eu.org'}`;

  await ctx.reply(helpText, { 
    parse_mode: 'HTML',
    ...getBackKeyboard() 
  });
}

// /cancel 命令处理
async function cancel(ctx) {
  // 清除会话状态
  if (ctx.session) {
    delete ctx.session.state;
    delete ctx.session.paymentData;
  }

  await ctx.reply(
    '❌ 操作已取消\n\n' +
    '请选择其他功能：',
    getMainKeyboard()
  );
}

// 个人中心
async function accountInfo(ctx) {
  const user = ctx.session?.user;
  if (!user) {
    return ctx.reply('请先使用 /start 命令');
  }

  // 获取用户统计
  const Payment = require('../../models/Payment');
  const totalOrders = await Payment.countDocuments({ 
    $or: [
      { userId: user._id },
      { telegramId: user.telegramId }
    ]
  });
  
  const completedOrders = await Payment.countDocuments({ 
    $or: [
      { userId: user._id },
      { telegramId: user.telegramId }
    ],
    status: 'completed'
  });

  await ctx.editMessageText(
    `👤 <b>个人中心</b>\n\n` +
    `📊 <b>账户信息</b>\n` +
    `━━━━━━━━━━━━━━━\n` +
    `<code>用户名：</code>${user.username}\n` +
    `<code>邮  箱：</code>${user.email}\n` +
    `<code>TG ID：</code>${user.telegramId}\n` +
    `<code>注册于：</code>${new Date(user.createdAt).toLocaleDateString('zh-CN')}\n` +
    `━━━━━━━━━━━━━━━\n\n` +
    `📈 <b>订单统计</b>\n` +
    `<code>📦 总订单：</code>${totalOrders}\n` +
    `<code>✅ 已完成：</code>${completedOrders}\n` +
    `<code>🔄 处理中：</code>${totalOrders - completedOrders}`,
    { 
      parse_mode: 'HTML',
      ...getBackKeyboard() 
    }
  );

  await ctx.answerCbQuery();
}

// 处理返回按钮
async function handleBack(ctx) {
  const action = ctx.callbackQuery.data;

  // 清除状态
  if (ctx.session) {
    delete ctx.session.state;
    delete ctx.session.paymentData;
  }

  if (action === 'back_to_main' || action === 'back_main') {
    try {
      // 尝试编辑消息（如果是文本消息）
      await ctx.editMessageText(
        `📋 <b>主菜单</b>\n\n` +
        `👇 请选择您需要的服务`,
        { 
          parse_mode: 'HTML',
          ...(await getMainKeyboard())
        }
      );
    } catch (error) {
      // 如果编辑失败（比如是图片消息），发送新消息
      await ctx.reply(
        `📋 <b>主菜单</b>\n\n` +
        `👇 请选择您需要的服务`,
        { 
          parse_mode: 'HTML',
          ...(await getMainKeyboard())
        }
      );
    }
  }

  await ctx.answerCbQuery();
}

module.exports = {
  start,
  menu,
  help,
  cancel,
  handleBack,
  handleLoginConfirm,
  accountInfo,
  getMainKeyboard
};
