const express = require('express');
const TronWebModule = require('tronweb');
const TronWeb = TronWebModule.TronWeb || TronWebModule;
const SwapOrder = require('../models/SwapOrder');
const Wallet = require('../models/Wallet');
const swapService = require('../services/swapService');
const { auth } = require('../middleware/auth');

const router = express.Router();

// 生成订单编号
const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `SWAP-${timestamp}-${random}`;
};

/**
 * GET /api/swap/rate
 * 获取当前闪兑汇率
 */
router.get('/rate', async (req, res) => {
  try {
    const rateInfo = await swapService.getSwapRate();
    
    res.json({
      success: true,
      rate: rateInfo.rate,
      baseRate: rateInfo.baseRate,
      markup: rateInfo.markup,
      mode: rateInfo.mode
    });
  } catch (error) {
    console.error('获取闪兑汇率失败:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/swap/create
 * 创建闪兑订单
 */
router.post('/create', async (req, res) => {
  try {
    const { userAddress, usdtAmount, email } = req.body;

    // 验证参数
    if (!userAddress || !usdtAmount) {
      return res.status(400).json({ error: '参数不完整' });
    }

    if (usdtAmount < 10) {
      return res.status(400).json({ error: '最小兑换金额为 10 USDT' });
    }

    // 验证地址格式
    if (!userAddress.startsWith('T') || userAddress.length !== 34) {
      return res.status(400).json({ error: '无效的TRON地址' });
    }

    // 获取汇率
    const rateInfo = await swapService.getSwapRate();
    const trxAmount = parseFloat((usdtAmount * rateInfo.rate).toFixed(6));

    // 选择一个可用的闪兑专用钱包
    const wallet = await swapService.selectSwapWallet();

    if (!wallet) {
      return res.status(500).json({ error: '暂无可用的闪兑钱包，请稍后再试' });
    }

    // 创建订单
    const order = new SwapOrder({
      orderNumber: generateOrderNumber(),
      userId: req.user?.userId, // 如果用户已登录
      userAddress,
      email,
      fromCurrency: 'USDT',
      toCurrency: 'TRX',
      fromAmount: usdtAmount,
      toAmount: trxAmount,
      exchangeRate: rateInfo.rate,
      systemWalletAddress: wallet.address,
      systemWalletId: wallet.id,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30分钟后过期
    });

    await order.save();

    console.log(`✅ 创建闪兑订单: ${order.orderNumber}`);
    console.log(`   ${usdtAmount} USDT → ${trxAmount} TRX`);
    console.log(`   汇率: ${rateInfo.rate} (模式: ${rateInfo.mode})`);
    console.log(`   收款钱包: ${wallet.address}`);

    res.json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        userAddress: order.userAddress,
        fromAmount: order.fromAmount,
        toAmount: order.toAmount,
        exchangeRate: order.exchangeRate,
        systemWalletAddress: order.systemWalletAddress,
        expiresAt: order.expiresAt,
        status: order.status
      }
    });

  } catch (error) {
    console.error('创建闪兑订单失败:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/swap/order/:orderNumber
 * 查询订单状态
 */
router.get('/order/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;

    const order = await SwapOrder.findOne({ orderNumber });

    if (!order) {
      return res.status(404).json({ error: '订单不存在' });
    }

    res.json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        userAddress: order.userAddress,
        fromAmount: order.fromAmount,
        toAmount: order.toAmount,
        exchangeRate: order.exchangeRate,
        systemWalletAddress: order.systemWalletAddress,
        receiveStatus: order.receiveStatus,
        receiveTxHash: order.receiveTxHash,
        receiveTime: order.receiveTime,
        receiveAmount: order.receiveAmount,
        sendStatus: order.sendStatus,
        sendTxHash: order.sendTxHash,
        sendTime: order.sendTime,
        sendAmount: order.sendAmount,
        status: order.status,
        errorMessage: order.errorMessage,
        expiresAt: order.expiresAt,
        createdAt: order.createdAt
      }
    });

  } catch (error) {
    console.error('查询订单失败:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/swap/my-orders
 * 获取我的闪兑订单（需要登录）
 */
router.get('/my-orders', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = { userId: req.user.userId };
    if (status && status !== 'all') {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const orders = await SwapOrder.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SwapOrder.countDocuments(filter);

    res.json({
      success: true,
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('获取订单列表失败:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/swap/admin/orders
 * 获取所有闪兑订单（管理员）
 */
router.get('/admin/orders', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const { status, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const orders = await SwapOrder.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'username email');

    const total = await SwapOrder.countDocuments(filter);

    // 统计数据
    const stats = {
      total: await SwapOrder.countDocuments(),
      pending: await SwapOrder.countDocuments({ status: 'pending' }),
      processing: await SwapOrder.countDocuments({ status: 'processing' }),
      completed: await SwapOrder.countDocuments({ status: 'completed' }),
      failed: await SwapOrder.countDocuments({ status: 'failed' }),
      timeout: await SwapOrder.countDocuments({ status: 'timeout' })
    };

    res.json({
      success: true,
      orders,
      stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('获取订单列表失败:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/swap/admin/retry/:orderNumber
 * 重试失败的订单（管理员）
 */
router.post('/admin/retry/:orderNumber', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const { orderNumber } = req.params;

    const order = await SwapOrder.findOne({ orderNumber });

    if (!order) {
      return res.status(404).json({ error: '订单不存在' });
    }

    if (order.status !== 'failed') {
      return res.status(400).json({ error: '只能重试失败的订单' });
    }

    if (order.receiveStatus !== 'received') {
      return res.status(400).json({ error: '订单尚未收到USDT' });
    }

    // 重置发送状态
    order.sendStatus = 'pending';
    order.status = 'processing';
    order.errorMessage = '';
    order.updatedAt = new Date();
    await order.save();

    // 立即处理
    await swapService.processSendTRX(order);

    res.json({
      success: true,
      message: '订单已重新处理'
    });

  } catch (error) {
    console.error('重试订单失败:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/swap/admin/add-wallet
 * 添加闪兑钱包（管理员）
 */
router.post('/admin/add-wallet', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const { name, privateKey, priority } = req.body;

    if (!name || !privateKey) {
      return res.status(400).json({ error: '钱包名称和私钥不能为空' });
    }

    // 使用 walletService 验证私钥（与代付系统相同的方式）
    const walletService = require('../services/walletService');
    const validation = await walletService.validatePrivateKey(privateKey);
    
    if (!validation.valid) {
      return res.status(400).json({ error: validation.message });
    }

    const address = validation.address;
    console.log(`✅ 私钥验证成功，地址: ${address}`);

    // 加密私钥（与代付系统相同的方式）
    const { encryptPrivateKey, getMasterKey } = require('../utils/encryption');
    const masterKey = getMasterKey();
    const privateKeyEncrypted = encryptPrivateKey(privateKey, masterKey);

    // 获取当前设置
    const Settings = require('../models/Settings');
    const settings = await Settings.findOne();
    if (!settings) {
      return res.status(500).json({ error: '系统设置未找到' });
    }

    // 解析现有钱包
    let swapWallets = [];
    try {
      swapWallets = JSON.parse(settings.swapWallets || '[]');
    } catch (e) {
      swapWallets = [];
    }

    // 检查地址是否已存在
    if (swapWallets.some(w => w.address === address)) {
      return res.status(400).json({ error: '该钱包地址已存在' });
    }

    // 添加新钱包
    const newWallet = {
      id: Date.now().toString(),
      name,
      address,
      privateKeyEncrypted,
      enabled: true,
      priority: priority || 50,
      createdAt: new Date().toISOString()
    };

    swapWallets.push(newWallet);

    // 保存
    settings.swapWallets = JSON.stringify(swapWallets);
    settings.updatedAt = new Date();
    await settings.save();

    res.json({
      success: true,
      message: '闪兑钱包添加成功',
      wallet: {
        id: newWallet.id,
        name: newWallet.name,
        address: newWallet.address,
        enabled: newWallet.enabled,
        priority: newWallet.priority
      }
    });

  } catch (error) {
    console.error('添加闪兑钱包失败:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/swap/admin/toggle-wallet
 * 切换闪兑钱包启用状态（管理员）
 */
router.post('/admin/toggle-wallet', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const { walletId } = req.body;

    const Settings = require('../models/Settings');
    const settings = await Settings.findOne();
    if (!settings) {
      return res.status(500).json({ error: '系统设置未找到' });
    }

    let swapWallets = [];
    try {
      swapWallets = JSON.parse(settings.swapWallets || '[]');
    } catch (e) {
      return res.status(400).json({ error: '钱包配置解析失败' });
    }

    const wallet = swapWallets.find(w => w.id === walletId);
    if (!wallet) {
      return res.status(404).json({ error: '钱包不存在' });
    }

    wallet.enabled = !wallet.enabled;

    settings.swapWallets = JSON.stringify(swapWallets);
    settings.updatedAt = new Date();
    await settings.save();

    res.json({
      success: true,
      message: wallet.enabled ? '钱包已启用' : '钱包已禁用'
    });

  } catch (error) {
    console.error('切换钱包状态失败:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/swap/admin/delete-wallet
 * 删除闪兑钱包（管理员）
 */
router.post('/admin/delete-wallet', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const { walletId } = req.body;

    const Settings = require('../models/Settings');
    const settings = await Settings.findOne();
    if (!settings) {
      return res.status(500).json({ error: '系统设置未找到' });
    }

    let swapWallets = [];
    try {
      swapWallets = JSON.parse(settings.swapWallets || '[]');
    } catch (e) {
      return res.status(400).json({ error: '钱包配置解析失败' });
    }

    const filteredWallets = swapWallets.filter(w => w.id !== walletId);

    if (filteredWallets.length === swapWallets.length) {
      return res.status(404).json({ error: '钱包不存在' });
    }

    settings.swapWallets = JSON.stringify(filteredWallets);
    settings.updatedAt = new Date();
    await settings.save();

    res.json({
      success: true,
      message: '钱包删除成功'
    });

  } catch (error) {
    console.error('删除钱包失败:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
