const express = require('express');
const Wallet = require('../models/Wallet');
const walletService = require('../services/walletService');
const walletSelector = require('../services/walletSelector');
const { auth } = require('../middleware/auth');

const router = express.Router();

// ==================== 钱包管理 API ====================

/**
 * GET /api/wallets
 * 获取钱包列表
 */
router.get('/', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const { enabled, status } = req.query;
    
    const filter = {};
    if (enabled !== undefined) {
      filter.enabled = enabled === 'true';
    }
    if (status) {
      filter['health.status'] = status;
    }

    const wallets = await Wallet.find(filter).sort({ priority: -1, createdAt: -1 });

    // 不返回加密的私钥
    const walletsData = wallets.map(wallet => ({
      _id: wallet._id,
      name: wallet.name,
      address: wallet.address,
      enabled: wallet.enabled,
      priority: wallet.priority,
      balance: wallet.balance,
      resources: wallet.resources,
      stats: wallet.stats,
      health: wallet.health,
      status: wallet.health?.status || 'unknown',
      alerts: wallet.alerts,
      usageCount: wallet.stats?.totalTransactions || 0,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt
    }));

    res.json({
      success: true,
      wallets: walletsData,
      total: walletsData.length
    });
  } catch (error) {
    console.error('获取钱包列表失败:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/wallets
 * 添加钱包
 */
router.post('/', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const { name, privateKey, priority, alerts } = req.body;

    if (!name || !privateKey) {
      return res.status(400).json({ error: '钱包名称和私钥不能为空' });
    }

    const wallet = await walletService.createWallet({
      name,
      privateKey,
      priority: priority || 50,
      alerts
    });

    res.json({
      success: true,
      message: '钱包添加成功',
      wallet: {
        id: wallet._id,
        name: wallet.name,
        address: wallet.address,
        enabled: wallet.enabled,
        priority: wallet.priority
      }
    });
  } catch (error) {
    console.error('添加钱包失败:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/wallets/refresh-all
 * 刷新所有钱包状态
 */
router.post('/refresh-all', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const result = await walletService.refreshAllWallets();

    res.json({
      success: true,
      message: `刷新完成: ${result.success}/${result.total} 成功`,
      result
    });
  } catch (error) {
    console.error('刷新所有钱包失败:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/wallets/:id
 * 获取钱包详情
 */
router.get('/:id', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const wallet = await Wallet.findById(req.params.id);
    
    if (!wallet) {
      return res.status(404).json({ error: '钱包不存在' });
    }

    res.json({
      success: true,
      wallet: {
        _id: wallet._id,
        id: wallet._id,
        name: wallet.name,
        address: wallet.address,
        enabled: wallet.enabled,
        priority: wallet.priority,
        balance: wallet.balance,
        resources: wallet.resources,
        stats: wallet.stats,
        health: wallet.health,
        status: wallet.health?.status || 'unknown',
        alerts: wallet.alerts,
        usageCount: wallet.stats?.totalTransactions || 0,
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt
      }
    });
  } catch (error) {
    console.error('获取钱包详情失败:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/wallets/:id
 * 更新钱包
 */
router.put('/:id', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const { name, priority, alerts, enabled } = req.body;

    const wallet = await walletService.updateWallet(req.params.id, {
      name,
      priority,
      alerts,
      enabled
    });

    res.json({
      success: true,
      message: '钱包更新成功',
      wallet: {
        id: wallet._id,
        name: wallet.name,
        address: wallet.address,
        enabled: wallet.enabled,
        priority: wallet.priority
      }
    });
  } catch (error) {
    console.error('更新钱包失败:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * DELETE /api/wallets/:id
 * 删除钱包
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    await walletService.deleteWallet(req.params.id);

    res.json({
      success: true,
      message: '钱包删除成功'
    });
  } catch (error) {
    console.error('删除钱包失败:', error);
    res.status(400).json({ error: error.message });
  }
});

// ==================== 钱包操作 API ====================

/**
 * POST /api/wallets/:id/enable
 * 启用钱包
 */
router.post('/:id/enable', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const wallet = await walletService.updateWallet(req.params.id, { enabled: true });

    res.json({
      success: true,
      message: '钱包已启用',
      wallet: {
        id: wallet._id,
        name: wallet.name,
        enabled: wallet.enabled
      }
    });
  } catch (error) {
    console.error('启用钱包失败:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/wallets/:id/disable
 * 禁用钱包
 */
router.post('/:id/disable', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const wallet = await walletService.updateWallet(req.params.id, { enabled: false });

    res.json({
      success: true,
      message: '钱包已禁用',
      wallet: {
        id: wallet._id,
        name: wallet.name,
        enabled: wallet.enabled
      }
    });
  } catch (error) {
    console.error('禁用钱包失败:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * PUT /api/wallets/:id/status
 * 切换钱包启用/禁用状态
 */
router.put('/:id/status', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const { isActive } = req.body;

    const wallet = await walletService.updateWallet(req.params.id, { enabled: isActive });

    res.json({
      success: true,
      message: isActive ? '钱包已启用' : '钱包已禁用',
      wallet: {
        id: wallet._id,
        name: wallet.name,
        enabled: wallet.enabled
      }
    });
  } catch (error) {
    console.error('更新钱包状态失败:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/wallets/:id/refresh
 * 刷新钱包状态
 */
router.post('/:id/refresh', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const wallet = await walletService.refreshWalletStatus(req.params.id);

    res.json({
      success: true,
      message: '钱包状态已刷新',
      wallet: {
        id: wallet._id,
        name: wallet.name,
        balance: wallet.balance,
        resources: wallet.resources,
        health: wallet.health
      }
    });
  } catch (error) {
    console.error('刷新钱包状态失败:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/wallets/:id/stats
 * 获取钱包统计
 */
router.get('/:id/stats', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const wallet = await Wallet.findById(req.params.id);
    
    if (!wallet) {
      return res.status(404).json({ error: '钱包不存在' });
    }

    const successRate = wallet.stats.totalTransactions > 0
      ? (wallet.stats.successfulTransactions / wallet.stats.totalTransactions * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      stats: {
        totalTransactions: wallet.stats.totalTransactions,
        successfulTransactions: wallet.stats.successfulTransactions,
        failedTransactions: wallet.stats.failedTransactions,
        successRate: `${successRate}%`,
        lastUsed: wallet.stats.lastUsed,
        balance: wallet.balance,
        health: wallet.health.status
      }
    });
  } catch (error) {
    console.error('获取钱包统计失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== 钱包选择 API ====================

/**
 * POST /api/wallets/select
 * 选择最优钱包（用于调试和预览）
 */
router.post('/select', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const { amount, type, estimatedFee } = req.body;

    const wallet = await walletSelector.selectBestWallet({
      amount: amount || 0,
      type: type || 'USDT',
      estimatedFee: estimatedFee || 5 // 默认 5 TRX 预估手续费
    });

    res.json({
      success: true,
      wallet: {
        id: wallet._id,
        name: wallet.name,
        address: wallet.address,
        priority: wallet.priority,
        balance: wallet.balance,
        health: wallet.health.status
      }
    });
  } catch (error) {
    console.error('选择钱包失败:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/wallets/recommendations
 * 获取钱包推荐列表（用于调试）
 */
router.post('/recommendations', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const { amount, type, estimatedFee } = req.body;

    const recommendations = await walletSelector.getWalletRecommendations({
      amount: amount || 0,
      type: type || 'USDT',
      estimatedFee: estimatedFee || 5 // 默认 5 TRX 预估手续费
    });

    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('获取推荐列表失败:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/wallets/health
 * 健康检查
 */
router.get('/health', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const wallets = await Wallet.find();
    
    const total = wallets.length;
    const enabled = wallets.filter(w => w.enabled).length;
    const healthy = wallets.filter(w => w.health.status === 'healthy').length;
    const warning = wallets.filter(w => w.health.status === 'warning').length;
    const error = wallets.filter(w => w.health.status === 'error').length;

    const totalBalance = {
      trx: wallets.reduce((sum, w) => sum + w.balance.trx, 0),
      usdt: wallets.reduce((sum, w) => sum + w.balance.usdt, 0)
    };

    const totalTransactions = wallets.reduce((sum, w) => sum + w.stats.totalTransactions, 0);
    const successfulTransactions = wallets.reduce((sum, w) => sum + w.stats.successfulTransactions, 0);

    res.json({
      success: true,
      health: {
        total,
        enabled,
        disabled: total - enabled,
        healthy,
        warning,
        error,
        totalBalance,
        totalTransactions,
        successfulTransactions,
        successRate: totalTransactions > 0 
          ? `${(successfulTransactions / totalTransactions * 100).toFixed(2)}%`
          : '0%'
      }
    });
  } catch (error) {
    console.error('健康检查失败:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/wallets/validate
 * 验证私钥
 */
router.post('/validate', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const { privateKey } = req.body;

    if (!privateKey) {
      return res.status(400).json({ error: '私钥不能为空' });
    }

    const validation = await walletService.validatePrivateKey(privateKey);

    res.json(validation);
  } catch (error) {
    console.error('验证私钥失败:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
