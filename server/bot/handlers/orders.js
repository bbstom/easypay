const Payment = require('../../models/Payment');
const { Markup } = require('telegraf');
const { getOrdersKeyboard, getOrderDetailKeyboard, getStatusEmoji } = require('../keyboards/main');
const contentService = require('../services/contentService');

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

  // 只在真正的 callback query 上下文中回答
  if (ctx.callbackQuery && ctx.update?.callback_query) {
    await ctx.answerCbQuery();
  }
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
      // 尝试使用自定义内容
      const sent = await contentService.sendContent(ctx, 'orders_empty', {}, 
        Markup.inlineKeyboard([
          [
            Markup.button.callback('💰 USDT 代付', 'payment_usdt'),
            Markup.button.callback('💎 TRX 代付', 'payment_trx')
          ],
          [Markup.button.callback('« 返回主菜单', 'back_to_main')]
        ])
      );

      // 如果没有自定义内容，使用默认消息
      if (!sent) {
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
      }
      return;
    }

    // 构建订单列表
    let orderListText = '';
    orders.slice(0, 5).forEach((order, index) => {
      const statusText = getStatusText(order.status);
      const date = new Date(order.createdAt).toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });

      // 优化显示：序号 类型 代付订单 | 时间 状态
      orderListText += `<b>${index + 1}.</b> ${order.payType} 代付订单 <code>| ${date}</code> ${statusText}\n`;
    });

    // 构建订单按钮
    const orderButtons = orders.slice(0, 5).map(order => [
      Markup.button.callback(
        `${order.payType} ${order.amount} - ${getStatusEmoji(order.status)}`,
        `order_detail_${order._id}`
      )
    ]);
    orderButtons.push([Markup.button.callback('« 返回主菜单', 'back_to_main')]);

    // 尝试使用自定义内容
    const sent = await contentService.sendContent(ctx, 'orders_list', {
      orderCount: orders.length,
      orderList: orderListText.trim()
    }, Markup.inlineKeyboard(orderButtons));

    // 如果没有自定义内容，使用默认消息
    if (!sent) {
      const orderText = `📋 <b>我的订单</b>\n\n` +
        `最近 <b>${orders.length}</b> 条订单\n` +
        `━━━━━━━━━━━━━━━\n\n` +
        orderListText +
        `👇 点击订单查看详情`;

      try {
        await ctx.editMessageText(orderText, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: orderButtons.map(row => 
              row.map(btn => ({ text: btn.text, callback_data: btn.callback_data }))
            )
          }
        });
      } catch (error) {
        // 如果编辑失败，发送新消息
        await ctx.reply(orderText, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: orderButtons.map(row => 
              row.map(btn => ({ text: btn.text, callback_data: btn.callback_data }))
            )
          }
        });
      }
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

    // 构建可选字段
    const paymentTime = order.paymentTime 
      ? `<code>支付时间：</code>${new Date(order.paymentTime).toLocaleString('zh-CN')}\n`
      : '';
    
    const transferTime = order.transferTime
      ? `<code>完成时间：</code>${new Date(order.transferTime).toLocaleString('zh-CN')}\n`
      : '';
    
    const txHash = order.txHash
      ? `\n🔗 <b>交易哈希</b>\n<code>${order.txHash}</code>\n`
      : '';

    // 构建按钮
    const buttons = [];
    if (order.txHash) {
      buttons.push([Markup.button.url('🔍 查看交易', `https://tronscan.org/#/transaction/${order.txHash}`)]);
    }
    buttons.push([Markup.button.callback('🔄 刷新状态', `order_refresh_${order._id}`)]);
    buttons.push([Markup.button.callback('« 返回订单列表', 'orders_list')]);
    buttons.push([Markup.button.callback('« 返回主菜单', 'back_to_main')]);

    // 获取支付状态和代付状态
    const paymentStatus = getPaymentStatusText(order.paymentStatus);
    const transferStatus = getTransferStatusText(order.transferStatus);

    // 尝试使用自定义内容
    const sent = await contentService.sendContent(ctx, 'order_detail', {
      orderId: order.platformOrderId,
      payType: order.payType,
      amount: order.amount,
      address: order.address,  // ✅ 使用完整地址
      totalCNY: Number(order.totalCNY).toFixed(2),
      serviceFee: Number(order.serviceFee).toFixed(2),
      status: status,  // 保留旧的总状态（向后兼容）
      paymentStatus: paymentStatus,  // 新增：支付状态
      transferStatus: transferStatus,  // 新增：代付状态
      createdAt: date,
      paymentTime: paymentTime,
      transferTime: transferTime,
      txHash: txHash
    }, Markup.inlineKeyboard(buttons));

    // 如果没有自定义内容，使用默认消息
    if (!sent) {
      // 获取支付状态和代付状态
      const paymentStatus = getPaymentStatusText(order.paymentStatus);
      const transferStatus = getTransferStatusText(order.transferStatus);
      
      let detailText = `📋 <b>订单详情</b>\n\n` +
        `━━━━━━━━━━━━━━━\n` +
        `<code>订单号：</code><code>${order.platformOrderId}</code>\n` +
        `<code>类  型：</code>${order.payType} 代付\n` +
        `<code>数  量：</code><b>${order.amount} ${order.payType}</b>\n` +
        `<code>地  址：</code>\n<code>${order.address}</code>\n` +
        `━━━━━━━━━━━━━━━\n` +
        `<code>支付金额：</code>${Number(order.totalCNY).toFixed(2)} CNY\n` +
        `<code>服务费：</code>${Number(order.serviceFee).toFixed(2)} CNY\n` +
        `━━━━━━━━━━━━━━━\n` +
        `<code>💳 支付状态：</code>${paymentStatus}\n` +
        `<code>🔄 代付状态：</code>${transferStatus}\n` +
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
            inline_keyboard: buttons.map(row => 
              row.map(btn => btn.url ? 
                { text: btn.text, url: btn.url } : 
                { text: btn.text, callback_data: btn.callback_data }
              )
            )
          }
        });
      } catch (error) {
        // 如果编辑失败，发送新消息
        await ctx.reply(detailText, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: buttons.map(row => 
              row.map(btn => btn.url ? 
                { text: btn.text, url: btn.url } : 
                { text: btn.text, callback_data: btn.callback_data }
              )
            )
          }
        });
      }
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

    // 获取支付状态和代付状态
    const paymentStatus = getPaymentStatusText(order.paymentStatus);
    const transferStatus = getTransferStatusText(order.transferStatus);
    
    await ctx.answerCbQuery(`💳 ${paymentStatus} | 🔄 ${transferStatus}`);

    // 临时修改 callback data 以便 showOrderDetail 能正确提取 ID
    const originalData = ctx.callbackQuery.data;
    ctx.callbackQuery.data = `order_detail_${orderId}`;
    
    // 重新显示订单详情
    await showOrderDetail(ctx);
    
    // 恢复原始 data
    ctx.callbackQuery.data = originalData;
  } catch (error) {
    console.error('刷新订单状态失败:', error);
    await ctx.answerCbQuery('❌ 刷新失败');
  }
}
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

function getPaymentStatusText(status) {
  const statusMap = {
    'pending': '⏳ 待支付',
    'paid': '✅ 已支付',
    'failed': '❌ 失败',
    'expired': '⏰ 已过期'
  };
  return statusMap[status] || '❓ 未知';
}

function getTransferStatusText(status) {
  const statusMap = {
    'pending': '⏳ 待处理',
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
