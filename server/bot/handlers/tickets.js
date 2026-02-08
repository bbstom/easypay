const Ticket = require('../../models/Ticket');
const { getBackKeyboard } = require('../keyboards/main');

// 处理回调查询
async function handleCallback(ctx) {
  const action = ctx.callbackQuery.data;

  if (action === 'tickets_list') {
    await showTicketsList(ctx);
  } else if (action === 'tickets_create') {
    await startCreateTicket(ctx);
  } else if (action.startsWith('create_ticket_order_')) {
    // 从订单创建工单
    await createTicketFromOrder(ctx);
  } else if (action.startsWith('ticket_detail_')) {
    await showTicketDetail(ctx);
  } else if (action.startsWith('ticket_reply_')) {
    await startReplyTicket(ctx);
  }

  // 只在真正的 callback query 上下文中回答
  if (ctx.callbackQuery && ctx.update?.callback_query) {
    await ctx.answerCbQuery().catch(() => {});
  }
}

// 显示工单列表
async function showTicketsList(ctx) {
  const user = ctx.session.user;

  try {
    const tickets = await Ticket.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    if (tickets.length === 0) {
      try {
        await ctx.editMessageText(
          `💬 <b>工单系统</b>\n\n` +
          `暂无工单记录\n\n` +
          `💡 遇到问题？点击下方按钮创建工单`,
          {
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [{ text: '📝 创建工单', callback_data: 'tickets_create' }],
                [{ text: '« 返回主菜单', callback_data: 'back_to_main' }]
              ]
            }
          }
        );
      } catch (error) {
        await ctx.reply(
          `💬 <b>工单系统</b>\n\n` +
          `暂无工单记录\n\n` +
          `💡 遇到问题？点击下方按钮创建工单`,
          {
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [{ text: '📝 创建工单', callback_data: 'tickets_create' }],
                [{ text: '« 返回主菜单', callback_data: 'back_to_main' }]
              ]
            }
          }
        );
      }
      return;
    }

    let ticketText = `💬 <b>我的工单</b>\n\n` +
      `最近 <b>${tickets.length}</b> 个工单\n` +
      `━━━━━━━━━━━━━━━\n\n`;

    tickets.slice(0, 5).forEach((ticket, index) => {
      const status = getStatusEmoji(ticket.status);
      const statusText = getStatusText(ticket.status);
      const date = new Date(ticket.createdAt).toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });

      ticketText += `<b>${index + 1}.</b> ${status} #${ticket.ticketNumber}\n` +
        `<code>   ${ticket.subject}</code>\n` +
        `<code>   ${statusText} · ${date}</code>\n\n`;
    });

    ticketText += `👇 点击工单查看详情`;

    const buttons = tickets.slice(0, 5).map(ticket => [
      { 
        text: `#${ticket.ticketNumber} - ${getStatusEmoji(ticket.status)}`, 
        callback_data: `ticket_detail_${ticket._id}` 
      }
    ]);
    
    buttons.push([{ text: '📝 创建工单', callback_data: 'tickets_create' }]);
    buttons.push([{ text: '« 返回主菜单', callback_data: 'back_to_main' }]);

    try {
      await ctx.editMessageText(ticketText, {
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: buttons }
      });
    } catch (error) {
      await ctx.reply(ticketText, {
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: buttons }
      });
    }
  } catch (error) {
    console.error('获取工单列表失败:', error);
    await ctx.reply('❌ 获取工单列表失败，请稍后重试');
  }
}

// 开始创建工单
async function startCreateTicket(ctx) {
  ctx.session.state = 'waiting_ticket_subject';

  try {
    await ctx.editMessageText(
      `📝 <b>创建工单</b>\n\n` +
      `请输入工单标题：\n` +
      `<i>简要描述您的问题</i>`,
      {
        parse_mode: 'HTML',
        ...getBackKeyboard()
      }
    );
  } catch (error) {
    await ctx.reply(
      `📝 <b>创建工单</b>\n\n` +
      `请输入工单标题：\n` +
      `<i>简要描述您的问题</i>`,
      {
        parse_mode: 'HTML',
        ...getBackKeyboard()
      }
    );
  }
}

// 处理工单标题
async function handleTicketSubject(ctx) {
  const subject = ctx.message.text.trim();

  if (subject.length < 5) {
    return ctx.reply('❌ 标题太短，请至少输入5个字符');
  }

  ctx.session.ticketData = { subject };
  ctx.session.state = 'waiting_ticket_description';

  await ctx.reply(
    `📝 <b>创建工单</b>\n\n` +
    `<code>标题：</code>${subject}\n\n` +
    `请详细描述您的问题：`,
    {
      parse_mode: 'HTML',
      ...getBackKeyboard()
    }
  );
}

// 处理工单描述
async function handleTicketDescription(ctx) {
  const description = ctx.message.text.trim();

  if (description.length < 10) {
    return ctx.reply('❌ 描述太短，请至少输入10个字符');
  }

  const user = ctx.session.user;
  const ticketData = ctx.session.ticketData;

  try {
    // 生成工单号
    const ticketNumber = Date.now().toString().slice(-8);

    const ticket = await Ticket.create({
      userId: user._id,
      ticketNumber,
      subject: ticketData.subject,
      description,
      status: 'open',
      priority: 'normal',
      messages: [{
        sender: 'user',
        message: description,
        createdAt: new Date()
      }]
    });

    // 清除状态
    delete ctx.session.state;
    delete ctx.session.ticketData;

    await ctx.reply(
      `✅ <b>工单已创建</b>\n\n` +
      `━━━━━━━━━━━━━━━\n` +
      `<code>工单号：</code>#${ticket.ticketNumber}\n` +
      `<code>标  题：</code>${ticket.subject}\n` +
      `<code>状  态：</code>待处理\n` +
      `━━━━━━━━━━━━━━━\n\n` +
      `💬 我们会尽快回复您！`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '📋 查看工单', callback_data: `ticket_detail_${ticket._id}` }],
            [{ text: '« 返回主菜单', callback_data: 'back_to_main' }]
          ]
        }
      }
    );
  } catch (error) {
    console.error('创建工单失败:', error);
    await ctx.reply('❌ 创建工单失败，请稍后重试');
  }
}

// 显示工单详情
async function showTicketDetail(ctx) {
  const ticketId = ctx.callbackQuery.data.replace('ticket_detail_', '');

  try {
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      await ctx.answerCbQuery('❌ 工单不存在');
      return;
    }

    const status = getStatusText(ticket.status);
    const date = new Date(ticket.createdAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });

    let detailText = `💬 <b>工单详情</b>\n\n` +
      `━━━━━━━━━━━━━━━\n` +
      `<code>工单号：</code>#${ticket.ticketNumber}\n` +
      `<code>标  题：</code>${ticket.subject}\n` +
      `<code>状  态：</code>${status}\n` +
      `<code>创建时间：</code>${date}\n` +
      `━━━━━━━━━━━━━━━\n\n` +
      `<b>问题描述：</b>\n${ticket.description}\n`;

    // 显示最近3条消息
    if (ticket.messages && ticket.messages.length > 1) {
      detailText += `\n<b>最近回复：</b>\n`;
      ticket.messages.slice(-3).forEach(msg => {
        const sender = msg.sender === 'admin' ? '👨‍💼 客服' : '👤 您';
        const time = new Date(msg.createdAt).toLocaleString('zh-CN', {
          timeZone: 'Asia/Shanghai',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
        detailText += `\n${sender} <i>(${time})</i>\n${msg.message}\n`;
      });
    }

    const buttons = [];
    if (ticket.status !== 'closed') {
      buttons.push([{ text: '💬 回复', callback_data: `ticket_reply_${ticket._id}` }]);
    }
    buttons.push([{ text: '« 返回工单列表', callback_data: 'tickets_list' }]);

    try {
      await ctx.editMessageText(detailText, {
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: buttons }
      });
    } catch (error) {
      await ctx.reply(detailText, {
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: buttons }
      });
    }
  } catch (error) {
    console.error('获取工单详情失败:', error);
    await ctx.answerCbQuery('❌ 获取工单详情失败');
  }
}

// 开始回复工单
async function startReplyTicket(ctx) {
  const ticketId = ctx.callbackQuery.data.replace('ticket_reply_', '');
  
  ctx.session.state = 'waiting_ticket_reply';
  ctx.session.replyTicketId = ticketId;

  try {
    await ctx.editMessageText(
      `💬 <b>回复工单</b>\n\n` +
      `请输入您的回复内容：`,
      {
        parse_mode: 'HTML',
        ...getBackKeyboard()
      }
    );
  } catch (error) {
    await ctx.reply(
      `💬 <b>回复工单</b>\n\n` +
      `请输入您的回复内容：`,
      {
        parse_mode: 'HTML',
        ...getBackKeyboard()
      }
    );
  }
}

// 处理工单回复
async function handleTicketReply(ctx) {
  const message = ctx.message.text.trim();
  const ticketId = ctx.session.replyTicketId;

  if (message.length < 5) {
    return ctx.reply('❌ 回复太短，请至少输入5个字符');
  }

  try {
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return ctx.reply('❌ 工单不存在');
    }

    // 添加回复
    ticket.messages.push({
      sender: 'user',
      message,
      createdAt: new Date()
    });
    ticket.status = 'replied';
    await ticket.save();

    // 清除状态
    delete ctx.session.state;
    delete ctx.session.replyTicketId;

    await ctx.reply(
      `✅ <b>回复已发送</b>\n\n` +
      `工单号：#${ticket.ticketNumber}\n\n` +
      `💬 客服会尽快回复您！`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '📋 查看工单', callback_data: `ticket_detail_${ticket._id}` }],
            [{ text: '« 返回主菜单', callback_data: 'back_to_main' }]
          ]
        }
      }
    );
  } catch (error) {
    console.error('回复工单失败:', error);
    await ctx.reply('❌ 回复失败，请稍后重试');
  }
}

// 从订单创建工单
async function createTicketFromOrder(ctx) {
  const action = ctx.callbackQuery.data;
  const orderId = action.replace('create_ticket_order_', '');
  
  try {
    const Payment = require('../../models/Payment');
    const order = await Payment.findById(orderId);
    
    if (!order) {
      await ctx.answerCbQuery('❌ 订单不存在').catch(() => {});
      return;
    }
    
    const user = ctx.session.user;
    
    // 自动创建工单
    const ticketNumber = Date.now().toString().slice(-8);
    const subject = `代付失败 - 订单 ${order.platformOrderId}`;
    const description = `订单号：${order.platformOrderId}\n` +
      `金额：${order.amount} ${order.payType}\n` +
      `收款地址：${order.recipientAddress}\n` +
      `状态：代付失败\n\n` +
      `请帮我处理这个订单，谢谢！`;
    
    const ticket = await Ticket.create({
      userId: user._id,
      ticketNumber,
      subject,
      description,
      status: 'open',
      priority: 'high', // 代付失败设为高优先级
      relatedOrderId: order._id, // 关联订单
      messages: [{
        sender: 'user',
        message: description,
        createdAt: new Date()
      }]
    });
    
    await ctx.answerCbQuery('✅ 工单已创建').catch(() => {});
    
    await ctx.reply(
      `✅ <b>工单已自动创建</b>\n\n` +
      `━━━━━━━━━━━━━━━\n` +
      `<code>工单号：</code>#${ticket.ticketNumber}\n` +
      `<code>标  题：</code>${ticket.subject}\n` +
      `<code>优先级：</code>高\n` +
      `<code>状  态：</code>待处理\n` +
      `━━━━━━━━━━━━━━━\n\n` +
      `💬 我们会优先处理代付失败的工单！\n` +
      `📱 请保持 Telegram 在线，客服会尽快联系您`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '📋 查看工单', callback_data: `ticket_detail_${ticket._id}` }],
            [{ text: '📦 查看订单', callback_data: `order_detail_${order._id}` }],
            [{ text: '« 返回主菜单', callback_data: 'back_to_main' }]
          ]
        }
      }
    );
  } catch (error) {
    console.error('从订单创建工单失败:', error);
    await ctx.answerCbQuery('❌ 创建工单失败').catch(() => {});
    await ctx.reply('❌ 创建工单失败，请稍后重试');
  }
}

// 辅助函数
function getStatusEmoji(status) {
  const statusMap = {
    'open': '🆕',
    'replied': '💬',
    'answered': '✅',
    'closed': '🔒'
  };
  return statusMap[status] || '❓';
}

function getStatusText(status) {
  const statusMap = {
    'open': '待处理',
    'replied': '已回复',
    'answered': '已解答',
    'closed': '已关闭'
  };
  return statusMap[status] || '未知';
}

module.exports = {
  handleCallback,
  startCreateTicket,
  handleTicketSubject,
  handleTicketDescription,
  handleTicketReply
};
