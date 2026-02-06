const Payment = require('../../models/Payment');
const { getOrdersKeyboard, getOrderDetailKeyboard, getStatusEmoji } = require('../keyboards/main');

// 处理回调查询
async function handleCallback(ctx) {
  const action = ctx.callbackQuery.data;

  if (action === 'orders_list') {
    await showOrdersList(ctx);
  } else if (action.startsWith('order_detail_')) {
    await showOrderDetail(ctx);
  } else if (action.startsWith('order_refresh_')) {
    await refreshOrderStatus(ctx);
  }

  await ctx.answerCbQuery();
}

// 显示订单列表
async function showOrdersList(ctx) {
  const user = ctx.session.user;

  try {
    // 获取用户的订单（同时查询 userId 和 telegramId）
    const orders = await Payment.find({ 
      $or: [
        { userId: user._id },
        { telegramId: user.telegramId }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(10);

    console.log(`查询到 ${orders.length} 条订单，用户 TG ID: ${user.telegramId}`);

    if (orders.length === 0) {
      try {
        await ctx.editMessageText(
          `📋 <b>我的订单</b>\n\n` +
          `暂无订单记录\n\n` +
          `💡 您可以开始创建第一个订单`,
          {
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [[
                { text: '💰 USDT 代付', callback_data: 'payment_usdt' },
                { text: '💎 TRX 代付', callback_data: 'payment_trx' }
              ], [
                { text: '« 返回主菜单', callback_data: 'back_to_main' }
              ]]
            }
          }
        );
      } catch (error) {
        // 如果编辑失败，发送新消息
        await ctx.reply(
          `📋 <b>我的订单</b>\n\n` +
          `暂无订单记录\n\n` +
          `💡 您可以开始创建第一个订单`,
          {
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [[
                { text: '💰 USDT 代付', callback_data: 'payment_usdt' },
                { text: '💎 TRX 代付', callback_data: 'payment_trx' }
              ], [
                { text: '« 返回主菜单', callback_data: 'back_to_main' }
              ]]
            }
          }
        );
      }
      return;
    }

    // 构建订单列表文本
    let orderText = `📋 <b>我的订单</b>\n\n` +
      `最近 <b>${orders.length}</b> 条订单\n` +
      `━━━━━━━━━━━━━━━\n\n`;

    orders.slice(0, 5).forEach((order, index) => {
      const status = getStatusEmoji(order.status);
      const statusText = getStatusText(order.status);
      const date = new Date(order.createdAt).toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });

      orderText += `<b>${index + 1}.</b> ${status} ${order.payType} <b>${order.amount}</b>\n` +
        `<code>   ${statusText}</code>\n` +
        `<code>   ${date}</code>\n\n`;
    });

    orderText += `👇 点击订单查看详情`;

    try {
      await ctx.editMessageText(orderText, {
        parse_mode: 'HTML',
        ...getOrdersKeyboard(orders)
      });
    } catch (error) {
      // 如果编辑失败，发送新消息
      await ctx.reply(orderText, {
        parse_mode: 'HTML',
        ...getOrdersKeyboard(orders)
      });
    }
  } catch (error) {
    console.error('获取订单列表失败:', error);
    await ctx.reply('❌ 获取订单列表失败，请稍后重试');
  }
}

// 显示订单详情
async function showOrderDetail(ctx) {
  const orderId = ctx.callbackQuery.data.replace('order_detail_', '');

  try {
    const order = await Payment.findById(orderId);

    if (!order) {
      await ctx.answerCbQuery('❌ 订单不存在');
      return;
    }

    const status = getStatusText(order.status);
    const date = new Date(order.createdAt).toLocaleString('zh-CN');

    let detailText = `📋 <b>订单详情</b>\n\n` +
      `━━━━━━━━━━━━━━━\n` +
      `<code>订单号：</code><code>${order.platformOrderId}</code>\n` +
      `<code>类  型：</code>${order.payType} 代付\n` +
      `<code>数  量：</code><b>${order.amount} ${order.payType}</b>\n` +
      `<code>地  址：</code><code>${formatAddress(order.address)}</code>\n` +
      `━━━━━━━━━━━━━━━\n` +
      `<code>支付金额：</code>${order.totalCNY} CNY\n` +
      `<code>服务费：</code>${order.serviceFee} CNY\n` +
      `━━━━━━━━━━━━━━━\n` +
      `<code>状  态：</code>${status}\n` +
      `<code>创建时间：</code>${date}\n`;

    if (order.paymentTime) {
      detailText += `<code>支付时间：</code>${new Date(order.paymentTime).toLocaleString('zh-CN')}\n`;
    }

    if (order.transferTime) {
      detailText += `<code>完成时间：</code>${new Date(order.transferTime).toLocaleString('zh-CN')}\n`;
    }

    if (order.txHash) {
      detailText += `\n🔗 <b>交易哈希</b>\n<code>${order.txHash}</code>\n`;
    }

    try {
      await ctx.editMessageText(detailText, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            order.txHash ? [{ 
              text: '🔍 查看交易', 
              url: `https://tronscan.org/#/transaction/${order.txHash}` 
            }] : [],
            [{ text: '🔄 刷新状态', callback_data: `order_refresh_${order._id}` }],
            [{ text: '« 返回订单列表', callback_data: 'orders_list' }]
          ].filter(row => row.length > 0)
        }
      });
    } catch (error) {
      // 如果编辑失败，发送新消息
      await ctx.reply(detailText, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            order.txHash ? [{ 
              text: '🔍 查看交易', 
              url: `https://tronscan.org/#/transaction/${order.txHash}` 
            }] : [],
            [{ text: '🔄 刷新状态', callback_data: `order_refresh_${order._id}` }],
            [{ text: '« 返回订单列表', callback_data: 'orders_list' }]
          ].filter(row => row.length > 0)
        }
      });
    }
  } catch (error) {
    console.error('获取订单详情失败:', error);
    await ctx.answerCbQuery('❌ 获取订单详情失败');
  }
}

// 刷新订单状态
async function refreshOrderStatus(ctx) {
  const orderId = ctx.callbackQuery.data.replace('order_refresh_', '');

  try {
    const order = await Payment.findById(orderId);

    if (!order) {
      await ctx.answerCbQuery('❌ 订单不存在');
      return;
    }

    const status = getStatusText(order.status);
    await ctx.answerCbQuery(`当前状态：${status}`);

    // 重新显示订单详情
    await showOrderDetail(ctx);
  } catch (error) {
    console.error('刷新订单状态失败:', error);
    await ctx.answerCbQuery('❌ 刷新失败');
  }
}

// 辅助函数
function formatAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
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
  showOrdersList,
  showOrderDetail
};
