const axios = require('axios');
const QRCode = require('qrcode');
const { generatePaymentQRCode } = require('../utils/qrCodeGenerator');
const Settings = require('../../models/Settings');
const Payment = require('../../models/Payment');
const contentService = require('../services/contentService');
const { 
  getMainKeyboard, 
  getPaymentMethodKeyboard, 
  getConfirmKeyboard,
  getBackKeyboard 
} = require('../keyboards/main');

// 处理回调查询
async function handleCallback(ctx) {
  const action = ctx.callbackQuery.data;

  if (action === 'payment_usdt') {
    await handleUSDTPayment(ctx);
  } else if (action === 'payment_trx') {
    await handleTRXPayment(ctx);
  } else if (action === 'confirm_payment') {
    await confirmPayment(ctx);
  } else if (action === 'pay_wechat') {
    await generatePaymentQR(ctx, 'wechat');
  } else if (action === 'pay_alipay') {
    await generatePaymentQR(ctx, 'alipay');
  } else if (action.startsWith('check_order_')) {
    await checkOrderStatus(ctx);
  }

  // 只在真正的 callback query 上下文中回答
  if (ctx.callbackQuery && ctx.update?.callback_query) {
    await ctx.answerCbQuery();
  }
}

// 处理 USDT 代付
async function handleUSDTPayment(ctx) {
  ctx.session.paymentType = 'USDT';
  ctx.session.state = 'waiting_usdt_amount';

  try {
    // 获取限额
    const settings = await Settings.findOne();
    const maxAmount = getMaxAmount(settings.tieredFeeRulesUSDT);

    // 尝试使用自定义内容
    const sent = await contentService.sendContent(ctx, 'payment_usdt_input', {
      minAmount: 1,
      maxAmount: maxAmount
    }, getBackKeyboard());

    // 如果没有自定义内容，使用默认消息
    if (!sent) {
      const message = 
        `💰 <b>USDT 代付</b>\n\n` +
        `📝 <b>请输入 USDT 数量</b>\n` +
        `━━━━━━━━━━━━━━━\n` +
        `<code>最小：</code>1 USDT\n` +
        `<code>最大：</code>${maxAmount} USDT\n` +
        `━━━━━━━━━━━━━━━\n\n` +
        `💡 直接输入数字即可\n` +
        `例如：<code>100</code>`;

      const options = { 
        parse_mode: 'HTML',
        ...getBackKeyboard() 
      };

      // 根据上下文选择编辑或发送新消息
      if (ctx.callbackQuery && ctx.update?.callback_query) {
        try {
          await ctx.editMessageText(message, options);
        } catch (editError) {
          if (editError.message.includes('message to edit')) {
            await ctx.reply(message, options);
          } else {
            throw editError;
          }
        }
      } else {
        await ctx.reply(message, options);
      }
    }
  } catch (error) {
    console.error('USDT 代付错误:', error);
    await ctx.reply('❌ 获取配置失败，请稍后重试');
  }
}

// 处理 TRX 代付
async function handleTRXPayment(ctx) {
  ctx.session.paymentType = 'TRX';
  ctx.session.state = 'waiting_trx_amount';

  try {
    const settings = await Settings.findOne();
    const maxAmount = getMaxAmount(settings.tieredFeeRulesTRX);

    // 尝试使用自定义内容
    const sent = await contentService.sendContent(ctx, 'payment_trx_input', {
      minAmount: 1,
      maxAmount: maxAmount
    }, getBackKeyboard());

    // 如果没有自定义内容，使用默认消息
    if (!sent) {
      const message = 
        `💎 <b>TRX 代付</b>\n\n` +
        `📝 <b>请输入 TRX 数量</b>\n` +
        `━━━━━━━━━━━━━━━\n` +
        `<code>最小：</code>1 TRX\n` +
        `<code>最大：</code>${maxAmount} TRX\n` +
        `━━━━━━━━━━━━━━━\n\n` +
        `💡 直接输入数字即可\n` +
        `例如：<code>100</code>`;

      const options = { 
        parse_mode: 'HTML',
        ...getBackKeyboard() 
      };

      // 根据上下文选择编辑或发送新消息
      if (ctx.callbackQuery && ctx.update?.callback_query) {
        try {
          await ctx.editMessageText(message, options);
        } catch (editError) {
          if (editError.message.includes('message to edit')) {
            await ctx.reply(message, options);
          } else {
            throw editError;
          }
        }
      } else {
        await ctx.reply(message, options);
      }
    }
  } catch (error) {
    console.error('TRX 代付错误:', error);
    await ctx.reply('❌ 获取配置失败，请稍后重试');
  }
}

// 处理用户输入的 USDT 数量
async function handleUSDTAmount(ctx) {
  const amount = parseFloat(ctx.message.text);

  if (isNaN(amount) || amount <= 0) {
    return ctx.reply('❌ 请输入有效的数字');
  }

  try {
    const settings = await Settings.findOne();
    const maxAmount = getMaxAmount(settings.tieredFeeRulesUSDT);

    if (amount > maxAmount) {
      return ctx.reply(`❌ 超出限额！最大支持 ${maxAmount} USDT`);
    }

    // 计算费用
    const feeInfo = calculateFee(amount, 'USDT', settings);

    ctx.session.paymentData = {
      type: 'USDT',
      amount: amount,
      ...feeInfo
    };

    ctx.session.state = 'waiting_usdt_address';

    // 尝试使用自定义内容
    const sent = await contentService.sendContent(ctx, 'payment_usdt_order_detail', {
      amount: amount,
      rate: feeInfo.rate.toFixed(2),
      cnyAmount: feeInfo.cnyAmount.toFixed(2),
      serviceFee: feeInfo.serviceFee.toFixed(2),
      feeLabel: feeInfo.feeLabel,
      totalCNY: feeInfo.totalCNY.toFixed(2)
    }, getBackKeyboard());

    // 如果没有自定义内容，使用默认消息
    if (!sent) {
      await ctx.reply(
        `📊 <b>订单详情</b>\n` +
        `━━━━━━━━━━━━━━━\n` +
        `<code>💵 数量：</code>${amount} USDT\n` +
        `<code>💱 汇率：</code>${feeInfo.rate.toFixed(2)} CNY/USDT\n` +
        `<code>💰 金额：</code>${feeInfo.cnyAmount.toFixed(2)} CNY\n` +
        `<code>🔧 服务费：</code>${feeInfo.serviceFee.toFixed(2)} CNY ${feeInfo.feeLabel}\n` +
        `━━━━━━━━━━━━━━━\n` +
        `<code>💳 总计：</code><b>${feeInfo.totalCNY.toFixed(2)} CNY</b>\n\n` +
        `📍 <b>请输入收款地址</b>\n` +
        `<i>(TRON 地址，以 T 开头)</i>`,
        { 
          parse_mode: 'HTML',
          ...getBackKeyboard() 
        }
      );
    }
  } catch (error) {
    console.error('处理 USDT 数量错误:', error);
    await ctx.reply('❌ 处理失败，请重试');
  }
}

// 处理用户输入的 TRX 数量
async function handleTRXAmount(ctx) {
  const amount = parseFloat(ctx.message.text);

  if (isNaN(amount) || amount <= 0) {
    return ctx.reply('❌ 请输入有效的数字');
  }

  try {
    const settings = await Settings.findOne();
    const maxAmount = getMaxAmount(settings.tieredFeeRulesTRX);

    if (amount > maxAmount) {
      return ctx.reply(`❌ 超出限额！最大支持 ${maxAmount} TRX`);
    }

    const feeInfo = calculateFee(amount, 'TRX', settings);

    ctx.session.paymentData = {
      type: 'TRX',
      amount: amount,
      ...feeInfo
    };

    ctx.session.state = 'waiting_trx_address';

    // 尝试使用自定义内容
    const sent = await contentService.sendContent(ctx, 'payment_trx_order_detail', {
      amount: amount,
      rate: feeInfo.rate.toFixed(2),
      cnyAmount: feeInfo.cnyAmount.toFixed(2),
      serviceFee: feeInfo.serviceFee.toFixed(2),
      feeLabel: feeInfo.feeLabel,
      totalCNY: feeInfo.totalCNY.toFixed(2)
    }, getBackKeyboard());

    // 如果没有自定义内容，使用默认消息
    if (!sent) {
      await ctx.reply(
        `📊 <b>订单详情</b>\n` +
        `━━━━━━━━━━━━━━━\n` +
        `<code>💵 数量：</code>${amount} TRX\n` +
        `<code>💱 汇率：</code>${feeInfo.rate.toFixed(2)} CNY/TRX\n` +
        `<code>💰 金额：</code>${feeInfo.cnyAmount.toFixed(2)} CNY\n` +
        `<code>🔧 服务费：</code>${feeInfo.serviceFee.toFixed(2)} CNY ${feeInfo.feeLabel}\n` +
        `━━━━━━━━━━━━━━━\n` +
        `<code>💳 总计：</code><b>${feeInfo.totalCNY.toFixed(2)} CNY</b>\n\n` +
        `📍 <b>请输入收款地址</b>\n` +
        `<i>(TRON 地址，以 T 开头)</i>`,
        { 
          parse_mode: 'HTML',
          ...getBackKeyboard() 
        }
      );
    }
  } catch (error) {
    console.error('处理 TRX 数量错误:', error);
    await ctx.reply('❌ 处理失败，请重试');
  }
}

// 处理用户输入的 USDT 地址
// 处理用户输入的 USDT 地址
async function handleUSDTAddress(ctx) {
  const address = ctx.message.text.trim();

  if (!isValidTronAddress(address)) {
    return ctx.reply(
      `❌ <b>无效的 TRON 地址</b>\n\n` +
      `请重新输入正确的地址\n` +
      `<i>地址应以 T 开头，共 34 位字符</i>`,
      { parse_mode: 'HTML' }
    );
  }

  ctx.session.paymentData.address = address;
  ctx.session.state = 'confirm_payment';

  const data = ctx.session.paymentData;

  // 尝试使用自定义内容
  const sent = await contentService.sendContent(ctx, 'payment_order_confirm', {
    amount: data.amount,
    type: data.type,
    address: address,
    totalCNY: data.totalCNY.toFixed(2)
  }, getConfirmKeyboard('payment'));

  // 如果没有自定义内容，使用默认消息
  if (!sent) {
    await ctx.reply(
      `✅ <b>订单确认</b>\n` +
      `━━━━━━━━━━━━━━━\n` +
      `<code>💵 数量：</code>${data.amount} ${data.type}\n` +
      `<code>📍 地址：</code>\n<code>${address}</code>\n` +
      `<code>💳 总计：</code><b>${data.totalCNY.toFixed(2)} CNY</b>\n` +
      `━━━━━━━━━━━━━━━\n\n` +
      `👇 请确认订单信息`,
      { 
        parse_mode: 'HTML',
        ...getConfirmKeyboard('payment') 
      }
    );
  }
}

// 处理用户输入的 TRX 地址
async function handleTRXAddress(ctx) {
  const address = ctx.message.text.trim();

  if (!isValidTronAddress(address)) {
    return ctx.reply(
      `❌ <b>无效的 TRON 地址</b>\n\n` +
      `请重新输入正确的地址\n` +
      `<i>地址应以 T 开头，共 34 位字符</i>`,
      { parse_mode: 'HTML' }
    );
  }

  ctx.session.paymentData.address = address;
  ctx.session.state = 'confirm_payment';

  const data = ctx.session.paymentData;

  // 尝试使用自定义内容
  const sent = await contentService.sendContent(ctx, 'payment_order_confirm', {
    amount: data.amount,
    type: data.type,
    address: address,
    totalCNY: data.totalCNY.toFixed(2)
  }, getConfirmKeyboard('payment'));

  // 如果没有自定义内容，使用默认消息
  if (!sent) {
    await ctx.reply(
      `✅ <b>订单确认</b>\n` +
      `━━━━━━━━━━━━━━━\n` +
      `<code>💵 数量：</code>${data.amount} ${data.type}\n` +
      `<code>📍 地址：</code>\n<code>${address}</code>\n` +
      `<code>💳 总计：</code><b>${data.totalCNY.toFixed(2)} CNY</b>\n` +
      `━━━━━━━━━━━━━━━\n\n` +
      `👇 请确认订单信息`,
      { 
        parse_mode: 'HTML',
        ...getConfirmKeyboard('payment') 
      }
    );
  }
}

// 确认支付（显示订单预览和支付方式选择）
async function confirmPayment(ctx) {
  const data = ctx.session.paymentData;

  // 不在这里创建订单，只显示预览和支付方式选择
  ctx.session.state = 'select_payment_method';

  // 尝试使用自定义内容
  const sent = await contentService.sendContent(ctx, 'payment_select_method', {
    amount: data.amount,
    type: data.type,
    address: data.address,
    cnyAmount: data.cnyAmount.toFixed(2),
    serviceFee: data.serviceFee.toFixed(2),
    totalCNY: data.totalCNY.toFixed(2)
  }, getPaymentMethodKeyboard());

  // 如果没有自定义内容，使用默认消息
  if (!sent) {
    const message = 
      `✅ <b>订单确认</b>\n\n` +
      `━━━━━━━━━━━━━━━\n` +
      `<code>💵 数量：</code>${data.amount} ${data.type}\n` +
      `<code>📍 地址：</code>\n<code>${data.address}</code>\n` +
      `<code>💰 金额：</code>${data.cnyAmount.toFixed(2)} CNY\n` +
      `<code>🔧 服务费：</code>${data.serviceFee.toFixed(2)} CNY\n` +
      `━━━━━━━━━━━━━━━\n` +
      `<code>💳 总计：</code><b>${data.totalCNY.toFixed(2)} CNY</b>\n\n` +
      `💳 <b>请选择支付方式</b> 👇`;

    const options = { 
      parse_mode: 'HTML',
      ...getPaymentMethodKeyboard() 
    };

    // 根据上下文选择编辑或发送新消息
    if (ctx.callbackQuery && ctx.update?.callback_query) {
      try {
        await ctx.editMessageText(message, options);
      } catch (editError) {
        if (editError.message.includes('message to edit')) {
          await ctx.reply(message, options);
        } else {
          throw editError;
        }
      }
    } else {
      await ctx.reply(message, options);
    }
  }
}

// 生成支付二维码（在这里创建订单）
async function generatePaymentQR(ctx, paymentMethod) {
  const data = ctx.session.paymentData;
  const user = ctx.session.user;

  try {
    // 在用户选择支付方式后，才创建订单
    const apiUrl = process.env.API_URL || 'http://localhost:5000';
    const response = await axios.post(`${apiUrl}/api/payments`, {
      payType: data.type,
      amount: data.amount,
      address: data.address,
      paymentMethod: paymentMethod, // 使用用户选择的支付方式
      totalCNY: data.totalCNY,
      serviceFee: data.serviceFee,
      email: user.email,
      telegramId: user.telegramId
    });

    // 保存完整的订单信息，包括 paymentUrl
    const order = {
      ...response.data.payment,
      paymentUrl: response.data.paymentUrl
    };

    console.log('订单创建成功:', {
      orderId: order.platformOrderId,
      paymentMethod: paymentMethod,
      paymentUrl: order.paymentUrl
    });

    ctx.session.currentOrder = order;

    const paymentUrl = order.paymentUrl;

    // 验证支付链接
    if (!paymentUrl || typeof paymentUrl !== 'string') {
      console.error('支付链接无效:', paymentUrl);
      await ctx.reply('❌ 支付链接无效，请重新创建订单');
      return;
    }

    console.log('支付链接:', paymentUrl);

    // 生成美化二维码
    const qrBuffer = await generatePaymentQRCode(paymentUrl);

    const paymentName = paymentMethod === 'wechat' ? '微信' : '支付宝';

    await ctx.replyWithPhoto(
      { source: qrBuffer },
      {
        caption:
          `📱 <b>请使用${paymentName}扫码支付</b>\n\n` +
          `━━━━━━━━━━━━━━━\n` +
          `<code>订单号：</code><code>${order.platformOrderId}</code>\n` +
          `<code>数  量：</code>${data.amount} ${data.type}\n` +
          `<code>地  址：</code>\n<code>${data.address}</code>\n` +
          `<code>金  额：</code><b>${Number(order.totalCNY).toFixed(2)} CNY</b>\n` +
          `━━━━━━━━━━━━━━━\n\n` +
          `⏰ 支付后请等待 <b>2-10 分钟</b>\n` +
          `💬 完成后会自动通知您`,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔄 刷新状态', callback_data: `check_order_${order._id}` }],
            [{ text: '« 返回主菜单', callback_data: 'back_to_main' }]
          ]
        }
      }
    );

    // 清除状态
    delete ctx.session.state;
    delete ctx.session.paymentData;
  } catch (error) {
    console.error('创建订单失败:', error);
    await ctx.reply(`❌ 创建订单失败：${error.response?.data?.error || error.message}`);
  }
}

// 检查订单状态
async function checkOrderStatus(ctx) {
  const orderId = ctx.callbackQuery.data.replace('check_order_', '');

  try {
    const apiUrl = process.env.API_URL || 'http://localhost:5000';
    const response = await axios.get(`${apiUrl}/api/payments/order/${orderId}`);
    const order = response.data;

    const statusText = getStatusText(order.status);

    await ctx.answerCbQuery(`当前状态：${statusText}`);
  } catch (error) {
    await ctx.answerCbQuery('❌ 查询失败');
  }
}

// 辅助函数
function isValidTronAddress(address) {
  return /^T[A-Za-z1-9]{33}$/.test(address);
}

function formatAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

function getMaxAmount(rules) {
  try {
    const parsed = JSON.parse(rules || '[]');
    const maxAmounts = parsed.map(r => r.maxAmount).filter(m => m < 999999);
    return maxAmounts.length > 0 ? Math.max(...maxAmounts) : 200;
  } catch {
    return 200;
  }
}

function calculateFee(amount, type, settings) {
  const rate = type === 'USDT' ? settings.exchangeRateUSDT : settings.exchangeRateTRX;
  const cnyAmount = amount * rate;

  // 获取阶梯费率规则
  const tieredFeeEnabled = type === 'USDT' ? settings.tieredFeeEnabledUSDT : settings.tieredFeeEnabledTRX;
  const tieredFeeRules = type === 'USDT' ? settings.tieredFeeRulesUSDT : settings.tieredFeeRulesTRX;

  let serviceFee = 0;
  let feeLabel = '';

  if (tieredFeeEnabled) {
    const rules = JSON.parse(tieredFeeRules || '[]');
    const matchedRule = rules.find(rule => amount >= rule.minAmount && amount <= rule.maxAmount);

    if (matchedRule) {
      if (matchedRule.feeType === 'fixed') {
        serviceFee = matchedRule.feeValue;
        feeLabel = `[固定${serviceFee}]`;
      } else {
        serviceFee = parseFloat((cnyAmount * (matchedRule.feeValue / 100)).toFixed(2));
        feeLabel = `[${matchedRule.feeValue}%]`;
      }
    }
  } else {
    // 使用默认费率
    if (settings.feeType === 'fixed') {
      serviceFee = type === 'USDT' ? settings.feeUSDT : settings.feeTRX;
      feeLabel = `[固定${serviceFee}]`;
    } else {
      serviceFee = parseFloat((cnyAmount * (settings.feePercentage / 100)).toFixed(2));
      feeLabel = `[${settings.feePercentage}%]`;
    }
  }

  const totalCNY = cnyAmount + serviceFee;

  return {
    rate,
    cnyAmount,
    serviceFee,
    feeLabel,
    totalCNY
  };
}

function getStatusText(status) {
  const statusMap = {
    'pending': '⏳ 待支付',
    'paid': '💳 已支付',
    'processing': '🔄 处理中',
    'completed': '✅ 已完成',
    'failed': '❌ 失败'
  };
  return statusMap[status] || '❓ 未知';
}

module.exports = {
  handleCallback,
  handleUSDTAmount,
  handleTRXAmount,
  handleUSDTAddress,
  handleTRXAddress
};
