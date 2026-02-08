const express = require('express');
const { auth } = require('../middleware/auth');
const TelegramTemplate = require('../models/TelegramTemplate');
const TelegramBroadcast = require('../models/TelegramBroadcast');
const TelegramGroup = require('../models/TelegramGroup');
const TelegramMenu = require('../models/TelegramMenu');
const TelegramContent = require('../models/TelegramContent');
const User = require('../models/User');
const { getBotInstance } = require('../bot/index');

const router = express.Router();

// ==================== 模板管理 ====================

// 获取所有模板
router.get('/templates', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const templates = await TelegramTemplate.find().sort({ createdAt: -1 });
    res.json(templates);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 创建模板
router.post('/templates', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const template = await TelegramTemplate.create(req.body);
    res.status(201).json(template);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 更新模板
router.put('/templates/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const template = await TelegramTemplate.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    if (!template) {
      return res.status(404).json({ error: '模板不存在' });
    }

    res.json(template);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 删除模板
router.delete('/templates/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const template = await TelegramTemplate.findByIdAndDelete(req.params.id);

    if (!template) {
      return res.status(404).json({ error: '模板不存在' });
    }

    res.json({ message: '模板已删除' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 预览模板
router.post('/templates/:id/preview', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const template = await TelegramTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: '模板不存在' });
    }

    // 替换变量
    let content = template.content;
    const variables = req.body.variables || {};
    
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, variables[key]);
    });

    // 构建按钮
    const buttons = buildButtons(template.buttons);

    res.json({
      content,
      parseMode: template.parseMode,
      buttons
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== 群发管理 ====================

// 获取所有群发
router.get('/broadcasts', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const broadcasts = await TelegramBroadcast.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'username');
    
    res.json(broadcasts);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 创建群发
router.post('/broadcasts', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const broadcast = await TelegramBroadcast.create({
      ...req.body,
      createdBy: req.user.userId
    });

    res.status(201).json(broadcast);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 发送群发
router.post('/broadcasts/:id/send', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const broadcast = await TelegramBroadcast.findById(req.params.id);
    if (!broadcast) {
      return res.status(404).json({ error: '群发不存在' });
    }

    if (broadcast.status !== 'draft') {
      return res.status(400).json({ error: '该群发已发送或正在发送' });
    }

    // 如果设置了定时发送，只更新状态，由定时任务执行
    if (broadcast.scheduledAt && new Date(broadcast.scheduledAt) > new Date()) {
      broadcast.status = 'draft'; // 保持草稿状态，等待定时任务
      await broadcast.save();
      
      return res.json({ 
        message: '已设置定时发送',
        scheduledAt: broadcast.scheduledAt
      });
    }

    // 立即发送：使用 broadcastScheduler
    const broadcastScheduler = require('../services/broadcastScheduler');
    
    // 异步执行
    broadcastScheduler.triggerBroadcast(broadcast._id).catch(err => {
      console.error('群发失败:', err);
    });

    res.json({ 
      message: '开始发送群发'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 停止重复发送
router.post('/broadcasts/:id/stop-repeat', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const broadcast = await TelegramBroadcast.findById(req.params.id);
    if (!broadcast) {
      return res.status(404).json({ error: '群发不存在' });
    }

    broadcast.repeatEnabled = false;
    broadcast.nextSendAt = null;
    await broadcast.save();

    res.json({ message: '已停止重复发送', broadcast });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 手动触发重复发送（立即发送一次）
router.post('/broadcasts/:id/trigger', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const broadcast = await TelegramBroadcast.findById(req.params.id);
    if (!broadcast) {
      return res.status(404).json({ error: '群发不存在' });
    }

    const broadcastScheduler = require('../services/broadcastScheduler');
    
    // 异步执行
    broadcastScheduler.triggerBroadcast(broadcast._id).catch(err => {
      console.error('手动触发失败:', err);
    });

    res.json({ message: '已触发发送' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 获取群发定时器配置
router.get('/broadcast-scheduler/config', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const broadcastScheduler = require('../services/broadcastScheduler');
    const config = broadcastScheduler.getConfig();

    res.json(config);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 更新群发定时器配置
router.put('/broadcast-scheduler/config', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const { intervalMinutes } = req.body;

    if (!intervalMinutes || intervalMinutes < 1 || intervalMinutes > 1440) {
      return res.status(400).json({ 
        error: '检查间隔必须在 1-1440 分钟之间（1 分钟到 24 小时）' 
      });
    }

    const broadcastScheduler = require('../services/broadcastScheduler');
    broadcastScheduler.restart(intervalMinutes);

    res.json({ 
      message: '定时器配置已更新',
      config: broadcastScheduler.getConfig()
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 手动触发定时检查（立即检查一次）
router.post('/broadcast-scheduler/check', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const broadcastScheduler = require('../services/broadcastScheduler');
    
    // 异步执行
    broadcastScheduler.checkScheduledBroadcasts().catch(err => {
      console.error('手动检查失败:', err);
    });

    res.json({ message: '已触发检查' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 获取群发统计
router.get('/broadcasts/:id/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const broadcast = await TelegramBroadcast.findById(req.params.id);
    if (!broadcast) {
      return res.status(404).json({ error: '群发不存在' });
    }

    res.json({
      totalUsers: broadcast.totalUsers,
      sentCount: broadcast.sentCount,
      failedCount: broadcast.failedCount,
      successRate: broadcast.totalUsers > 0 
        ? ((broadcast.sentCount / broadcast.totalUsers) * 100).toFixed(1)
        : 0
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 更新群发（仅草稿状态可编辑）
router.put('/broadcasts/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const broadcast = await TelegramBroadcast.findById(req.params.id);
    if (!broadcast) {
      return res.status(404).json({ error: '群发不存在' });
    }

    // 如果正在发送中，不允许编辑
    if (broadcast.status === 'sending') {
      return res.status(400).json({ error: '正在发送的群发无法编辑' });
    }

    // 更新字段
    Object.assign(broadcast, req.body);
    await broadcast.save();

    res.json(broadcast);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 删除群发（仅草稿和失败状态可删除）
router.delete('/broadcasts/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const broadcast = await TelegramBroadcast.findById(req.params.id);
    if (!broadcast) {
      return res.status(404).json({ error: '群发不存在' });
    }

    if (broadcast.status === 'sending') {
      return res.status(400).json({ error: '正在发送的群发无法删除' });
    }

    await TelegramBroadcast.findByIdAndDelete(req.params.id);

    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== 用户管理 ====================

// 获取群组/频道列表
router.get('/groups', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const groups = await TelegramGroup.find({ active: true })
      .sort({ lastMessageAt: -1 });
    
    res.json(groups);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 刷新群组信息
router.post('/groups/:chatId/refresh', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const botInstance = getBotInstance();
    if (!botInstance || !botInstance.bot) {
      return res.status(500).json({ error: 'Bot 未初始化' });
    }

    const chat = await botInstance.bot.telegram.getChat(req.params.chatId);
    const memberCount = await botInstance.bot.telegram.getChatMemberCount(req.params.chatId);

    const group = await TelegramGroup.findOneAndUpdate(
      { chatId: req.params.chatId },
      {
        title: chat.title,
        username: chat.username,
        memberCount: memberCount,
        updatedAt: new Date()
      },
      { new: true }
    );

    res.json(group);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== 用户管理 ====================

// 获取TG用户列表
router.get('/users', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const users = await User.find({ 
      telegramId: { $exists: true, $ne: null }
    })
      .select('username email telegramId telegramUsername telegramFirstName createdAt')
      .sort({ createdAt: -1 })
      .limit(1000);

    res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 获取TG统计
router.get('/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const totalUsers = await User.countDocuments({ 
      telegramId: { $exists: true, $ne: null }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayUsers = await User.countDocuments({ 
      telegramId: { $exists: true, $ne: null },
      createdAt: { $gte: today }
    });

    const activeUsers = await User.countDocuments({ 
      telegramId: { $exists: true, $ne: null },
      updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      totalUsers,
      todayUsers,
      activeUsers
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== 菜单管理 ====================

// 获取主菜单配置
router.get('/menu', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    let menu = await TelegramMenu.findOne({ name: 'main_menu' });
    
    // 如果不存在，创建默认菜单
    if (!menu) {
      menu = await TelegramMenu.create({
        name: 'main_menu',
        buttons: [
          { text: '💰 USDT 代付', type: 'system', action: 'payment_usdt', row: 0, col: 0, order: 0 },
          { text: '💰 TRX 代付', type: 'system', action: 'payment_trx', row: 0, col: 1, order: 1 },
          { text: '📋 我的订单', type: 'system', action: 'orders_list', row: 1, col: 0, order: 2 },
          { text: '💬 工单系统', type: 'system', action: 'tickets_list', row: 1, col: 1, order: 3 },
          { text: '👤 个人中心', type: 'system', action: 'account_info', row: 2, col: 0, order: 4 },
          { text: '❓ 帮助中心', type: 'system', action: 'help_center', row: 2, col: 1, order: 5 }
        ],
        layout: 'custom'
      });
    }

    res.json(menu);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 更新主菜单配置
router.put('/menu', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    let menu = await TelegramMenu.findOne({ name: 'main_menu' });
    
    if (!menu) {
      menu = new TelegramMenu({ name: 'main_menu' });
    }

    menu.buttons = req.body.buttons || menu.buttons;
    menu.layout = req.body.layout || menu.layout;
    menu.systemActions = req.body.systemActions || menu.systemActions;
    menu.enabled = req.body.enabled !== undefined ? req.body.enabled : menu.enabled;
    menu.updatedAt = new Date();

    await menu.save();

    res.json(menu);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 重置为默认菜单
router.post('/menu/reset', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    await TelegramMenu.deleteOne({ name: 'main_menu' });

    const menu = await TelegramMenu.create({
      name: 'main_menu',
      buttons: [
        { text: '💰 USDT 代付', type: 'system', action: 'payment_usdt', row: 0, col: 0, order: 0 },
        { text: '💰 TRX 代付', type: 'system', action: 'payment_trx', row: 0, col: 1, order: 1 },
        { text: '📋 我的订单', type: 'system', action: 'orders_list', row: 1, col: 0, order: 2 },
        { text: '💬 工单系统', type: 'system', action: 'tickets_list', row: 1, col: 1, order: 3 },
        { text: '👤 个人中心', type: 'system', action: 'account_info', row: 2, col: 0, order: 4 },
        { text: '❓ 帮助中心', type: 'system', action: 'help_center', row: 2, col: 1, order: 5 }
      ],
      layout: 'custom'
    });

    res.json(menu);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 获取可用的系统功能列表
router.get('/menu/system-actions', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const systemActions = [
      { value: 'payment_usdt', label: 'USDT 代付', icon: '💰', category: '代付' },
      { value: 'payment_trx', label: 'TRX 代付', icon: '💎', category: '代付' },
      { value: 'energy_rental', label: '能量租赁', icon: '⚡', category: '服务' },
      { value: 'swap_service', label: '闪兑服务', icon: '🔄', category: '服务' },
      { value: 'orders_list', label: '我的订单', icon: '📋', category: '订单' },
      { value: 'tickets_list', label: '工单系统', icon: '💬', category: '客服' },
      { value: 'account_info', label: '个人中心', icon: '👤', category: '账户' },
      { value: 'help_center', label: '帮助中心', icon: '❓', category: '帮助' }
    ];

    res.json(systemActions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== 内容管理 ====================

// 获取所有内容配置
router.get('/contents', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const contents = await TelegramContent.find().sort({ category: 1, name: 1 });
    res.json(contents);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 获取单个内容配置
router.get('/contents/:key', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const content = await TelegramContent.findOne({ key: req.params.key });
    if (!content) {
      return res.status(404).json({ error: '内容不存在' });
    }

    res.json(content);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 创建内容配置（如果已存在则更新）
router.post('/contents', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const { key } = req.body;
    
    // 检查是否已存在
    const existing = await TelegramContent.findOne({ key });
    
    if (existing) {
      // 已存在，更新
      console.log(`📝 内容 "${key}" 已存在，更新为新配置`);
      const updated = await TelegramContent.findOneAndUpdate(
        { key },
        req.body,
        { new: true, runValidators: true }
      );
      return res.status(200).json({ 
        message: '内容已更新',
        content: updated,
        isUpdate: true
      });
    } else {
      // 不存在，创建
      console.log(`✨ 创建新内容 "${key}"`);
      const content = await TelegramContent.create(req.body);
      return res.status(201).json({ 
        message: '内容已创建',
        content,
        isUpdate: false
      });
    }
  } catch (error) {
    console.error('创建/更新内容失败:', error);
    res.status(400).json({ error: error.message });
  }
});

// 更新内容配置
router.put('/contents/:key', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const content = await TelegramContent.findOneAndUpdate(
      { key: req.params.key },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    if (!content) {
      return res.status(404).json({ error: '内容不存在' });
    }

    res.json(content);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 删除内容配置
router.delete('/contents/:key', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const content = await TelegramContent.findOneAndDelete({ key: req.params.key });

    if (!content) {
      return res.status(404).json({ error: '内容不存在' });
    }

    res.json({ message: '内容已删除' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 预览内容
router.post('/contents/:key/preview', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const content = await TelegramContent.findOne({ key: req.params.key });
    if (!content) {
      return res.status(404).json({ error: '内容不存在' });
    }

    // 替换变量
    let text = content.content.text || '';
    const variables = req.body.variables || {};
    
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      text = text.replace(regex, variables[key]);
    });

    // 构建按钮
    const buttons = buildButtons(content.buttons);

    res.json({
      type: content.content.type,
      text,
      mediaUrl: content.content.mediaUrl,
      caption: content.content.caption,
      parseMode: content.content.parseMode,
      buttons,
      features: content.features
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 初始化默认内容
router.post('/contents/init-defaults', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const defaults = [
      {
        key: 'welcome_new_user',
        name: '新用户欢迎消息',
        category: 'welcome',
        content: {
          type: 'text',
          text: `🎊 <b>欢迎使用 {{siteName}}！</b>\n\n` +
                `✅ <b>账户已自动创建</b>\n` +
                `━━━━━━━━━━━━━━━\n` +
                `<code>用户名：</code>{{username}}\n` +
                `<code>TG ID：</code><code>{{telegramId}}</code>\n` +
                `━━━━━━━━━━━━━━━\n\n` +
                `💡 <b>您可以直接开始使用所有功能！</b>\n\n` +
                `🌐 <b>网站同步使用</b>\n` +
                `<code>1️⃣</code> 访问 {{websiteUrl}}\n` +
                `<code>2️⃣</code> 点击 "使用 Telegram 登录"\n` +
                `<code>3️⃣</code> 授权后即可同步使用\n\n` +
                `👇 请选择您需要的服务`,
          parseMode: 'HTML'
        },
        features: {
          copyable: true,
          copyText: '{{telegramId}}',
          highlight: [
            { text: '账户已自动创建', style: 'bold' }
          ]
        },
        variables: [
          { key: 'siteName', description: '网站名称', example: 'FastPay' },
          { key: 'username', description: '用户名', example: 'user123' },
          { key: 'telegramId', description: 'Telegram ID', example: '123456789' },
          { key: 'websiteUrl', description: '网站地址', example: 'https://kk.vpno.eu.org' }
        ],
        triggers: [
          { type: 'command', value: '/start' }
        ]
      },
      {
        key: 'payment_usdt_start',
        name: 'USDT代付开始',
        category: 'payment',
        content: {
          type: 'text',
          text: `💰 <b>USDT 代付</b>\n\n` +
                `📝 <b>请输入 USDT 数量</b>\n` +
                `━━━━━━━━━━━━━━━\n` +
                `<code>最小：</code>1 USDT\n` +
                `<code>最大：</code>{{maxAmount}} USDT\n` +
                `━━━━━━━━━━━━━━━\n\n` +
                `💡 直接输入数字即可\n` +
                `例如：<code>100</code>`,
          parseMode: 'HTML'
        },
        features: {
          highlight: [
            { text: '100', style: 'code' }
          ]
        },
        variables: [
          { key: 'maxAmount', description: '最大金额', example: '200' }
        ],
        triggers: [
          { type: 'callback', value: 'payment_usdt' }
        ]
      }
    ];

    for (const def of defaults) {
      await TelegramContent.findOneAndUpdate(
        { key: def.key },
        def,
        { upsert: true, new: true }
      );
    }

    res.json({ message: '默认内容已初始化', count: defaults.length });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== 辅助函数 ====================

// 构建按钮
function buildButtons(buttons) {
  if (!buttons || buttons.length === 0) return [];

  // 按行分组
  const rows = {};
  buttons.forEach(btn => {
    if (!rows[btn.row]) rows[btn.row] = [];
    rows[btn.row].push(btn);
  });

  // 转换为Telegram格式
  return Object.keys(rows).sort().map(row => {
    return rows[row].map(btn => {
      if (btn.type === 'url') {
        // 验证 URL 格式
        let url = btn.data;
        
        // 如果是 Telegram 用户名格式（@username），转换为 t.me 链接
        if (url.startsWith('@')) {
          url = `https://t.me/${url.substring(1)}`;
        }
        // 如果不是以 http:// 或 https:// 开头，添加 https://
        else if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = `https://${url}`;
        }
        
        return { text: btn.text, url: url };
      } else {
        return { text: btn.text, callback_data: btn.data };
      }
    });
  });
}

// 发送群发
async function sendBroadcast(broadcastId, targets, targetType = 'all') {
  const broadcast = await TelegramBroadcast.findById(broadcastId);
  if (!broadcast) return;

  const botInstance = getBotInstance();
  if (!botInstance || !botInstance.bot) {
    console.error('Bot 实例未初始化');
    broadcast.status = 'failed';
    await broadcast.save();
    return;
  }

  const bot = botInstance.bot.telegram;
  let sentCount = 0;
  let failedCount = 0;
  let blockedCount = 0; // 被用户屏蔽的数量

  // 构建消息选项
  const options = {
    parse_mode: broadcast.parseMode
  };

  if (broadcast.buttons && broadcast.buttons.length > 0) {
    options.reply_markup = {
      inline_keyboard: buildButtons(broadcast.buttons)
    };
  }

  // 限流控制
  const DELAY_MS = 50; // 每条消息间隔 50ms（每秒20条）
  const BATCH_SIZE = 20; // 每批20条
  const BATCH_DELAY_MS = 1000; // 每批之间延迟1秒

  // 分批发送
  for (let i = 0; i < targets.length; i++) {
    const targetId = targets[i];
    
    try {
      // 根据内容类型发送不同格式的消息
      if (broadcast.contentType === 'photo' && broadcast.mediaUrl) {
        await bot.sendPhoto(targetId, broadcast.mediaUrl, {
          caption: broadcast.content,
          ...options
        });
      } else if (broadcast.contentType === 'video' && broadcast.mediaUrl) {
        await bot.sendVideo(targetId, broadcast.mediaUrl, {
          caption: broadcast.content,
          ...options
        });
      } else if (broadcast.contentType === 'document' && broadcast.mediaUrl) {
        await bot.sendDocument(targetId, broadcast.mediaUrl, {
          caption: broadcast.content,
          ...options
        });
      } else {
        await bot.sendMessage(targetId, broadcast.content, options);
      }
      
      sentCount++;
      
      // 每条消息后延迟
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
      
      // 每批之后额外延迟
      if ((i + 1) % BATCH_SIZE === 0) {
        console.log(`已发送 ${sentCount}/${targets.length}，暂停 ${BATCH_DELAY_MS}ms...`);
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
      }
      
      // 更新进度（每10条）
      if (sentCount % 10 === 0) {
        broadcast.sentCount = sentCount;
        broadcast.failedCount = failedCount;
        await broadcast.save();
      }
    } catch (error) {
      failedCount++;
      
      // 处理不同类型的错误
      if (error.response?.error_code === 429) {
        // 触发限流，等待更长时间
        const retryAfter = error.response.parameters?.retry_after || 30;
        console.warn(`触发限流，等待 ${retryAfter} 秒...`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        
        // 重试当前目标
        i--;
        continue;
      } else if (error.response?.error_code === 403) {
        // 用户屏蔽了 Bot 或 Bot 无权限
        blockedCount++;
        console.log(`目标已屏蔽 Bot 或无权限: ${targetId}`);
      } else if (error.response?.error_code === 400) {
        // 无效的 ID 或其他错误
        console.error(`发送失败 (${targetId}): ${error.response?.description}`);
      } else {
        console.error(`发送失败 (${targetId}):`, error.message);
      }
    }
  }

  // 更新最终状态
  broadcast.status = 'completed';
  broadcast.sentCount = sentCount;
  broadcast.failedCount = failedCount;
  await broadcast.save();

  const targetTypeLabel = targetType === 'group' ? '群组' : '用户';
  console.log(`群发完成 (${targetTypeLabel}): 成功 ${sentCount}, 失败 ${failedCount}, 被屏蔽/无权限 ${blockedCount}`);
}

module.exports = router;
