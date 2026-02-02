const express = require('express');
const Ticket = require('../models/Ticket');
const { auth } = require('../middleware/auth');

const router = express.Router();

// 生成工单编号
const generateTicketNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TK-${timestamp}-${random}`;
};

/**
 * POST /api/tickets
 * 创建工单（用户）
 */
router.post('/', auth, async (req, res) => {
  try {
    const { subject, message, category, priority } = req.body;
    
    if (!subject || !message) {
      return res.status(400).json({ error: '标题和内容不能为空' });
    }
    
    const ticketData = {
      ticketNumber: generateTicketNumber(),
      userId: req.user.userId,
      subject,
      message,
      category: category || 'other',
      priority: priority || 'medium',
      status: 'open'
    };
    
    const ticket = new Ticket(ticketData);
    await ticket.save();
    await ticket.populate('userId', 'username email');
    
    res.json({
      success: true,
      message: '工单创建成功',
      ticket
    });
  } catch (error) {
    console.error('创建工单失败:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/tickets/my/unread-count
 * 获取有新回复的工单数量（用户）
 */
router.get('/my/unread-count', auth, async (req, res) => {
  try {
    // 获取状态为 in_progress 或 waiting_user 的工单
    const tickets = await Ticket.find({
      userId: req.user.userId,
      status: { $in: ['in_progress', 'waiting_user'] }
    }).populate('replies.userId', 'username');
    
    // 筛选出有管理员回复的工单
    const ticketsWithAdminReply = tickets.filter(ticket => 
      ticket.replies && ticket.replies.some(reply => reply.isAdmin)
    );
    
    res.json({
      success: true,
      count: ticketsWithAdminReply.length
    });
  } catch (error) {
    console.error('获取未读工单数量失败:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/tickets/my
 * 获取我的工单列表（用户）
 */
router.get('/my', auth, async (req, res) => {
  try {
    const { status } = req.query;
    
    const filter = { userId: req.user.userId };
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    const tickets = await Ticket.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'username email')
      .populate('replies.userId', 'username email');
    
    res.json({
      success: true,
      tickets
    });
  } catch (error) {
    console.error('获取工单列表失败:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/tickets/admin
 * 获取所有工单（管理员）
 */
router.get('/admin', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }
    
    const { status, priority, category } = req.query;
    
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (priority && priority !== 'all') filter.priority = priority;
    if (category && category !== 'all') filter.category = category;
    
    const tickets = await Ticket.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'username email')
      .populate('replies.userId', 'username email');
    
    res.json({
      success: true,
      tickets
    });
  } catch (error) {
    console.error('获取工单列表失败:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/tickets/:id
 * 获取工单详情
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('userId', 'username email')
      .populate('replies.userId', 'username email');
    
    if (!ticket) {
      return res.status(404).json({ error: '工单不存在' });
    }
    
    // 检查权限：只有工单创建者或管理员可以查看
    if (ticket.userId._id.toString() !== req.user.userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限查看此工单' });
    }
    
    res.json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('获取工单详情失败:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/tickets/:id/reply
 * 回复工单
 */
router.post('/:id/reply', auth, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: '回复内容不能为空' });
    }
    
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ error: '工单不存在' });
    }
    
    // 检查权限
    if (ticket.userId.toString() !== req.user.userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限回复此工单' });
    }
    
    // 添加回复
    ticket.replies.push({
      userId: req.user.userId,
      message,
      isAdmin: req.user.role === 'admin'
    });
    
    ticket.lastReplyAt = Date.now();
    
    // 如果是管理员回复，状态改为 in_progress
    if (req.user.role === 'admin' && ticket.status === 'open') {
      ticket.status = 'in_progress';
    }
    
    // 如果是用户回复且状态是 waiting_user，改为 in_progress
    if (req.user.role !== 'admin' && ticket.status === 'waiting_user') {
      ticket.status = 'in_progress';
    }
    
    await ticket.save();
    await ticket.populate('userId', 'username email');
    await ticket.populate('replies.userId', 'username email');
    
    res.json({
      success: true,
      message: '回复成功',
      ticket
    });
  } catch (error) {
    console.error('回复工单失败:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/tickets/:id/status
 * 更新工单状态（管理员）
 */
router.put('/:id/status', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }
    
    const { status } = req.body;
    
    if (!['open', 'in_progress', 'waiting_user', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ error: '无效的状态' });
    }
    
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ error: '工单不存在' });
    }
    
    ticket.status = status;
    
    if (status === 'closed' || status === 'resolved') {
      ticket.closedAt = Date.now();
    }
    
    await ticket.save();
    await ticket.populate('userId', 'username email');
    
    res.json({
      success: true,
      message: '状态更新成功',
      ticket
    });
  } catch (error) {
    console.error('更新工单状态失败:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/tickets/:id/priority
 * 更新工单优先级（管理员）
 */
router.put('/:id/priority', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }
    
    const { priority } = req.body;
    
    if (!['low', 'medium', 'high', 'urgent'].includes(priority)) {
      return res.status(400).json({ error: '无效的优先级' });
    }
    
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ error: '工单不存在' });
    }
    
    ticket.priority = priority;
    await ticket.save();
    
    res.json({
      success: true,
      message: '优先级更新成功',
      ticket
    });
  } catch (error) {
    console.error('更新工单优先级失败:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/tickets/:id
 * 删除工单（管理员）
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }
    
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ error: '工单不存在' });
    }
    
    res.json({
      success: true,
      message: '工单删除成功'
    });
  } catch (error) {
    console.error('删除工单失败:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
