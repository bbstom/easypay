const express = require('express');
const User = require('../models/User');
const Payment = require('../models/Payment');
const { auth } = require('../middleware/auth');

const router = express.Router();

// 获取所有用户（管理员）
router.get('/', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(1000);

    // 为每个用户添加订单统计
    const usersWithStats = await Promise.all(users.map(async (user) => {
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

      const totalAmount = await Payment.aggregate([
        {
          $match: {
            $or: [
              { userId: user._id },
              { telegramId: user.telegramId }
            ],
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalCNY' }
          }
        }
      ]);

      return {
        ...user.toObject(),
        stats: {
          totalOrders,
          completedOrders,
          totalAmount: totalAmount[0]?.total || 0
        }
      };
    }));

    res.json(usersWithStats);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 获取用户详情（管理员）
router.get('/:userId', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 获取用户订单
    const orders = await Payment.find({
      $or: [
        { userId: user._id },
        { telegramId: user.telegramId }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(50);

    // 统计数据
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const totalAmount = orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.totalCNY, 0);

    res.json({
      user,
      orders,
      stats: {
        totalOrders,
        completedOrders,
        totalAmount
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 更新用户状态（管理员）
router.patch('/:userId/status', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const { status } = req.body;
    if (!['active', 'disabled'].includes(status)) {
      return res.status(400).json({ error: '无效的状态' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { status },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 更新用户角色（管理员）
router.patch('/:userId/role', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: '无效的角色' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 删除用户（管理员）
router.delete('/:userId', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({ message: '用户已删除' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 获取用户统计（管理员）
router.get('/stats/overview', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const telegramUsers = await User.countDocuments({ telegramBound: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });

    // 今日新增用户
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayUsers = await User.countDocuments({ createdAt: { $gte: today } });

    // 本周新增用户
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekUsers = await User.countDocuments({ createdAt: { $gte: weekAgo } });

    res.json({
      totalUsers,
      activeUsers,
      telegramUsers,
      adminUsers,
      todayUsers,
      weekUsers
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
