const express = require('express');
const Payment = require('../models/Payment');
const Settings = require('../models/Settings');
const { auth } = require('../middleware/auth');
const paymentService = require('../services/paymentService');
const tronService = require('../services/tronService');
const emailService = require('../services/emailService');
const telegramNotifications = require('../bot/notifications'); // TG 通知

const router = express.Router();

// 创建代付订单
router.post('/', async (req, res) => {
  try {
    const { payType, amount, address, paymentMethod, email } = req.body;
    
    // 获取系统设置
    const settings = await Settings.findOne();
    if (!settings) {
      return res.status(400).json({ error: '系统配置未完成' });
    }

    // 计算服务费 - 支持阶梯费率
    let serviceFee = 0;
    
    // 根据代付类型选择对应的阶梯费率配置
    const tieredFeeEnabled = payType === 'USDT' ? settings.tieredFeeEnabledUSDT : settings.tieredFeeEnabledTRX;
    const tieredFeeRules = payType === 'USDT' ? settings.tieredFeeRulesUSDT : settings.tieredFeeRulesTRX;
    
    if (tieredFeeEnabled) {
      // 使用阶梯费率
      const rules = JSON.parse(tieredFeeRules || '[]');
      const amt = parseFloat(amount) || 0;
      
      // 检查是否超出最大限额
      const maxAmounts = rules
        .map(rule => rule.maxAmount)
        .filter(max => max < 999999);
      
      if (maxAmounts.length > 0) {
        const maxLimit = Math.max(...maxAmounts);
        if (amt > maxLimit) {
          return res.status(400).json({ 
            error: `代付金额超出限额！最大支持 ${maxLimit} ${payType}` 
          });
        }
      }
      
      // 查找匹配的费率规则（修改为 <= 包含边界值）
      const matchedRule = rules.find(rule => 
        amt >= rule.minAmount && amt <= rule.maxAmount
      );
      
      if (matchedRule) {
        if (matchedRule.feeType === 'fixed') {
          // 固定费用
          serviceFee = matchedRule.feeValue;
        } else {
          // 百分比费率 - 基于 CNY 金额计算
          const cnyAmount = amt * getExchangeRate(payType, settings);
          serviceFee = parseFloat((cnyAmount * (matchedRule.feeValue / 100)).toFixed(2));
        }
        
        console.log(`使用 ${payType} 阶梯费率: ${amt} ${payType} 匹配规则 [${matchedRule.minAmount}-${matchedRule.maxAmount}], 费率类型: ${matchedRule.feeType}, 费用: ${serviceFee} CNY`);
      } else {
        // 没有匹配的规则，使用默认费率
        console.log(`未找到匹配的 ${payType} 阶梯费率规则，使用默认费率`);
        serviceFee = calculateDefaultFee(amount, payType, settings);
      }
    } else {
      // 使用传统费率
      serviceFee = calculateDefaultFee(amount, payType, settings);
    }

    // 生成订单号
    const orderId = 'ORD' + Date.now() + Math.random().toString(36).substring(2, 9).toUpperCase();

    // 获取用户ID（如果已登录）
    let userId = null;
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        userId = decoded.userId;
      } catch (error) {
        // Token 无效或过期，继续创建订单但不关联用户
        console.log('Token 验证失败，创建匿名订单');
      }
    }

    // 创建订单
    const payment = new Payment({
      userId: userId,
      payType,
      amount,
      address,
      paymentMethod,
      totalCNY: req.body.totalCNY,
      serviceFee,
      platformOrderId: orderId,
      email: email || null
    });
    await payment.save();

    // ========== 临时测试模式 ==========
    // 如果是开发环境且支付配置不完整，使用模拟数据
    const useMockPayment = process.env.NODE_ENV === 'development' && 
                          (!settings.paymentMerchantId || !settings.paymentApiKey);
    
    if (useMockPayment) {
      console.log('⚠️  使用模拟支付模式（开发环境）');
      return res.status(201).json({
        payment,
        paymentUrl: `https://pay.abcdely.top/mock?order=${orderId}&amount=${req.body.totalCNY}`,
        orderId: orderId,
        mock: true
      });
    }
    // ========== 临时测试模式结束 ==========

    // 创建支付平台订单
    try {
      console.log('正在创建支付订单:', {
        orderId,
        amount: req.body.totalCNY,
        payType,
        paymentMethod
      });

      // 生成12位随机数字作为商品名称
      const randomProductName = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');

      const paymentOrder = await paymentService.createPaymentOrder({
        orderId: orderId,
        amount: req.body.totalCNY,
        payType,
        paymentMethod,
        subject: randomProductName,
        body: randomProductName
      });

      console.log('支付平台返回数据:', paymentOrder);

      // 根据API版本提取支付链接
      let paymentUrl;
      
      if (settings.paymentApiVersion === 'v2') {
        // V2接口可能的字段名
        paymentUrl = paymentOrder.pay_url 
          || paymentOrder.payUrl 
          || paymentOrder.data?.pay_url 
          || paymentOrder.data?.payUrl
          || paymentOrder.url
          || paymentOrder.payment_url
          || paymentOrder.data?.url
          || paymentOrder.data?.qrcode_url;
      } else {
        // V1接口可能的字段名
        paymentUrl = paymentOrder.payurl 
          || paymentOrder.pay_url
          || paymentOrder.qrcode
          || paymentOrder.code_url;
        
        // V1接口特殊处理：如果返回HTML类型
        if (paymentOrder.type === 'html' && !paymentUrl) {
          console.log('V1接口返回HTML跳转页面');
          // 使用构造的URL
          paymentUrl = paymentOrder.payurl || `${settings.paymentApiUrl}/submit.php`;
        }
      }

      if (!paymentUrl) {
        console.error('支付平台未返回支付链接，完整响应:', JSON.stringify(paymentOrder));
        
        // 如果是HTML类型，尝试使用备用方案
        if (paymentOrder.type === 'html') {
          console.log('使用HTML页面作为支付链接');
          paymentUrl = paymentOrder.payurl;
        }
        
        if (!paymentUrl) {
          return res.status(400).json({ 
            error: '支付平台未返回支付链接，请检查配置',
            debug: paymentOrder 
          });
        }
      }

      console.log('支付链接:', paymentUrl);

      // 返回支付链接
      res.status(201).json({
        payment,
        paymentUrl: paymentUrl,
        orderId: orderId
      });
    } catch (error) {
      console.error('创建支付订单失败:', error);
      console.error('错误详情:', error.response?.data || error.message);
      res.status(400).json({ 
        error: '创建支付订单失败: ' + (error.response?.data?.msg || error.response?.data?.message || error.message)
      });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 辅助函数：获取汇率
function getExchangeRate(coinType, settings) {
  return coinType === 'USDT' ? settings.exchangeRateUSDT : settings.exchangeRateTRX;
}

// 辅助函数：计算默认费率
function calculateDefaultFee(amount, payType, settings) {
  const amt = parseFloat(amount) || 0;
  if (settings.feeType === 'fixed') {
    return payType === 'USDT' ? settings.feeUSDT : settings.feeTRX;
  } else {
    // 百分比费率 - 基于 CNY 金额计算
    const cnyAmount = amt * getExchangeRate(payType, settings);
    return parseFloat((cnyAmount * (settings.feePercentage / 100)).toFixed(2));
  }
}

// 支付回调接口（GET - 这个支付平台使用GET请求）
router.get('/notify', async (req, res) => {
  try {
    const settings = await Settings.findOne();
    
    console.log('收到支付回调（GET）:', req.query);
    console.log('使用API版本:', settings.paymentApiVersion);
    
    // 验证签名
    if (!paymentService.verifySign(req.query, settings)) {
      console.error('签名验证失败');
      console.error('回调参数:', req.query);
      return res.send('fail'); // 返回小写的fail
    }

    // 获取订单号和状态
    const out_trade_no = req.query.out_trade_no;
    const trade_status = req.query.trade_status;
    
    console.log('订单号:', out_trade_no, '状态:', trade_status);
    
    // 查找订单
    const payment = await Payment.findOne({ platformOrderId: out_trade_no });
    if (!payment) {
      console.error('订单不存在:', out_trade_no);
      return res.send('fail');
    }

    // 检查订单是否已经处理过
    if (payment.paymentStatus === 'paid') {
      console.log('订单已处理过，直接返回成功');
      return res.send('success');
    }

    // 更新支付状态
    if (trade_status === 'TRADE_SUCCESS') {
      payment.paymentStatus = 'paid';
      payment.paymentTime = new Date();
      payment.status = 'paid';
      await payment.save();

      console.log('✅ 支付成功，订单:', payment._id);

      // 🔔 发送支付成功邮件（第一封）
      if (payment.email) {
        try {
          await emailService.sendPaymentSuccessEmail(payment, settings);
          console.log(`📧 支付成功邮件已发送: ${payment.email}`);
        } catch (emailError) {
          console.error('❌ 发送支付成功邮件失败:', emailError);
        }
      }

      // 🔔 发送 Telegram 支付成功通知
      if (payment.telegramId) {
        try {
          await telegramNotifications.notifyPaymentSuccess(payment.telegramId, payment);
        } catch (tgError) {
          console.error('❌ 发送 TG 支付成功通知失败:', tgError);
        }
      }

      console.log('🔄 开始执行 ' + payment.payType + ' 代付:', payment._id);

      // 异步执行代付
      processTransfer(payment._id).catch(err => {
        console.error('代付失败:', err);
      });

      // 必须返回 success（小写）
      res.send('success');
    } else {
      console.log('支付状态不是成功:', trade_status);
      res.send('fail');
    }
  } catch (error) {
    console.error('支付回调处理失败:', error);
    res.send('fail');
  }
});

// 支付回调接口（POST - 保留兼容性）
router.post('/notify', async (req, res) => {
  try {
    const settings = await Settings.findOne();
    
    console.log('收到支付回调（POST）:', req.body);
    console.log('使用API版本:', settings.paymentApiVersion);
    
    // 验证签名
    if (!paymentService.verifySign(req.body, settings)) {
      console.error('签名验证失败');
      return res.send('fail');
    }

    // 根据API版本获取订单号和状态
    let out_trade_no, trade_status;
    
    if (settings.paymentApiVersion === 'v2') {
      // V2接口
      out_trade_no = req.body.out_trade_no;
      trade_status = req.body.trade_status || req.body.status;
    } else {
      // V1接口
      out_trade_no = req.body.out_trade_no;
      trade_status = req.body.trade_status;
    }
    
    console.log('订单号:', out_trade_no, '状态:', trade_status);
    
    // 查找订单
    const payment = await Payment.findOne({ platformOrderId: out_trade_no });
    if (!payment) {
      console.error('订单不存在:', out_trade_no);
      return res.send('fail');
    }

    // 检查订单是否已经处理过
    if (payment.paymentStatus === 'paid') {
      console.log('订单已处理过，直接返回成功');
      return res.send('success');
    }

    // 更新支付状态
    if (trade_status === 'TRADE_SUCCESS' || trade_status === 'success' || trade_status === '1') {
      payment.paymentStatus = 'paid';
      payment.paymentTime = new Date();
      payment.status = 'paid';
      await payment.save();

      console.log('✅ 支付成功，订单:', payment._id);

      // 🔔 发送支付成功邮件（第一封）
      if (payment.email) {
        try {
          await emailService.sendPaymentSuccessEmail(payment, settings);
          console.log(`📧 支付成功邮件已发送: ${payment.email}`);
        } catch (emailError) {
          console.error('❌ 发送支付成功邮件失败:', emailError);
        }
      }

      // 🔔 发送 Telegram 支付成功通知
      if (payment.telegramId) {
        try {
          await telegramNotifications.notifyPaymentSuccess(payment.telegramId, payment);
        } catch (tgError) {
          console.error('❌ 发送 TG 支付成功通知失败:', tgError);
        }
      }

      console.log('🔄 开始执行 ' + payment.payType + ' 代付:', payment._id);

      // 异步执行代付
      processTransfer(payment._id).catch(err => {
        console.error('代付失败:', err);
      });

      res.send('success');
    } else {
      console.log('支付状态不是成功:', trade_status);
      res.send('fail');
    }
  } catch (error) {
    console.error('支付回调处理失败:', error);
    res.send('fail');
  }
});

// 执行代付（带重试机制，使用多钱包系统）
async function processTransfer(paymentId, retryCount = 0) {
  const maxRetries = 3;
  const walletSelector = require('../services/walletSelector');
  const Wallet = require('../models/Wallet');
  
  try {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      console.error('订单不存在:', paymentId);
      return;
    }

    // 只处理待处理或失败的订单
    if (payment.transferStatus !== 'pending' && payment.transferStatus !== 'failed') {
      console.log(`订单 ${paymentId} 状态为 ${payment.transferStatus}，跳过处理`);
      return;
    }

    // 更新状态为处理中
    payment.transferStatus = 'processing';
    await payment.save();

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🔄 开始处理转账 (尝试 ${retryCount + 1}/${maxRetries + 1})`);
    console.log(`   订单号: ${payment.platformOrderId}`);
    console.log(`   类型: ${payment.payType}`);
    console.log(`   金额: ${payment.amount}`);
    console.log(`   地址: ${payment.address}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    // 1. 选择最优钱包
    console.log('📊 正在选择最优钱包...');
    const selectedWallet = await walletSelector.selectBestWallet({
      amount: payment.amount,
      type: payment.payType,
      estimatedFee: 15 // 预估手续费
    });

    // 2. 使用选中的钱包执行转账
    let txResult;
    if (payment.payType === 'USDT') {
      console.log(`💸 使用钱包 "${selectedWallet.name}" 发送 ${payment.amount} USDT...`);
      txResult = await tronService.sendUSDTWithWallet(selectedWallet, payment.address, payment.amount);
    } else {
      console.log(`💸 使用钱包 "${selectedWallet.name}" 发送 ${payment.amount} TRX...`);
      txResult = await tronService.sendTRXWithWallet(selectedWallet, payment.address, payment.amount);
    }

    // 3. 更新订单状态
    payment.txHash = txResult.txid;
    payment.transferStatus = 'completed';
    payment.transferTime = new Date();
    payment.status = 'completed';
    payment.walletId = selectedWallet._id; // 记录使用的钱包
    payment.walletName = selectedWallet.name; // 记录钱包名称
    await payment.save();

    console.log(`\n✅ ${payment.payType} 代付成功!`);
    console.log(`   订单号: ${payment.platformOrderId}`);
    console.log(`   使用钱包: ${selectedWallet.name}`);
    console.log(`   交易哈希: ${payment.txHash}`);
    console.log(`   查看交易: https://tronscan.org/#/transaction/${payment.txHash}\n`);

    // 4. 更新钱包余额（异步，不阻塞）
    updateWalletBalance(selectedWallet._id).catch(err => {
      console.error('更新钱包余额失败:', err.message);
    });

    // 5. 发送代付完成邮件（第二封）
    if (payment.email) {
      try {
        const settings = await Settings.findOne();
        await emailService.sendTransferCompletedEmail(payment, settings);
        payment.emailSent = true;
        await payment.save();
        console.log(`📧 ${payment.payType} 代付完成邮件已发送: ${payment.email}`);
      } catch (emailError) {
        console.error('❌ 发送代付完成邮件失败:', emailError);
      }
    }

    // 6. 发送 Telegram 代付完成通知
    if (payment.telegramId) {
      try {
        await telegramNotifications.notifyTransferComplete(payment.telegramId, payment);
      } catch (tgError) {
        console.error('❌ 发送 TG 代付完成通知失败:', tgError);
      }
    }
  } catch (error) {
    console.error(`\n❌ 代付失败 (尝试 ${retryCount + 1}/${maxRetries + 1}):`, error.message);
    
    const payment = await Payment.findById(paymentId);
    if (payment) {
      // 如果还有重试次数，等待后重试
      if (retryCount < maxRetries) {
        const waitTime = 5000 * (retryCount + 1); // 5秒、10秒、15秒
        console.log(`⏳ ${waitTime/1000}秒后重试...\n`);
        
        payment.transferStatus = 'pending';
        await payment.save();
        
        setTimeout(() => {
          processTransfer(paymentId, retryCount + 1).catch(err => {
            console.error('重试失败:', err);
          });
        }, waitTime);
      } else {
        // 重试次数用完，标记为失败
        payment.transferStatus = 'failed';
        payment.status = 'failed';
        await payment.save();
        console.error(`❌ 转账最终失败: ${payment.platformOrderId}\n`);
        
        // 发送 Telegram 代付失败通知
        if (payment.telegramId) {
          try {
            await telegramNotifications.notifyTransferFailed(payment.telegramId, payment, error.message);
          } catch (tgError) {
            console.error('❌ 发送 TG 代付失败通知失败:', tgError);
          }
        }
      }
    }
  }
}

// 异步更新钱包余额
async function updateWalletBalance(walletId) {
  try {
    const Wallet = require('../models/Wallet');
    const wallet = await Wallet.findById(walletId);
    if (!wallet) {
      console.error('❌ 更新余额失败: 钱包不存在');
      return;
    }

    console.log(`\n🔄 开始更新钱包余额: ${wallet.name} (${wallet.address})`);

    // 验证地址
    if (!wallet.address) {
      console.error('❌ 更新余额失败: 钱包地址为空');
      return;
    }

    // 初始化 TronWeb
    await tronService.initialize();

    // 获取余额
    console.log('📊 正在查询 TRX 余额...');
    const trxBalance = await tronService.getBalance(wallet.address);
    console.log(`✅ TRX 余额: ${trxBalance.toFixed(2)}`);
    
    console.log('📊 正在查询 USDT 余额...');
    const usdtBalance = await tronService.getUSDTBalance(wallet.address);
    console.log(`✅ USDT 余额: ${usdtBalance.toFixed(2)}`);

    // 更新钱包余额
    wallet.balance.trx = trxBalance;
    wallet.balance.usdt = usdtBalance;
    wallet.balance.lastUpdated = new Date();
    await wallet.save();

    console.log(`✅ 钱包余额已更新: ${wallet.name}`);
    console.log(`   TRX: ${trxBalance.toFixed(2)}`);
    console.log(`   USDT: ${usdtBalance.toFixed(2)}\n`);
  } catch (error) {
    console.error('❌ 更新钱包余额失败:', error.message);
    console.error('错误详情:', error);
  }
}

// 获取所有订单（管理员）
router.get('/all', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }
    const payments = await Payment.find()
      .sort({ createdAt: -1 })
      .limit(1000);
    res.json(payments);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 获取统计数据（管理员）
router.get('/stats', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 总收入
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$serviceFee' } } }
    ]);

    // 今日收入
    const todayRevenue = await Payment.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$serviceFee' } } }
    ]);

    // 总订单数
    const totalOrders = await Payment.countDocuments();

    // 今日订单数
    const todayOrders = await Payment.countDocuments({ createdAt: { $gte: today } });

    // 成功率
    const completedOrders = await Payment.countDocuments({ status: 'completed' });
    const successRate = totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0;

    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      todayRevenue: todayRevenue[0]?.total || 0,
      totalOrders,
      todayOrders,
      successRate: parseFloat(successRate)
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 查询订单状态
router.get('/order/:orderId', async (req, res) => {
  try {
    const payment = await Payment.findOne({ platformOrderId: req.params.orderId });
    if (!payment) {
      return res.status(404).json({ error: '订单不存在' });
    }
    res.json(payment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 手动重试转账（管理员）
router.post('/retry/:paymentId', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) {
      return res.status(404).json({ error: '订单不存在' });
    }

    // 只能重试失败或待处理的订单
    if (payment.transferStatus !== 'failed' && payment.transferStatus !== 'pending') {
      return res.status(400).json({ error: '该订单状态不允许重试' });
    }

    // 重置状态
    payment.transferStatus = 'pending';
    payment.status = 'paid';
    await payment.save();

    // 异步执行转账
    processTransfer(payment._id).catch(err => {
      console.error('手动重试转账失败:', err);
    });

    res.json({ message: '已开始重试转账', payment });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 获取钱包状态（管理员）
router.get('/wallet/status', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const status = await tronService.checkWalletStatus();
    
    // 添加余额预警
    const warnings = [];
    if (status.trxBalance < 50) {
      warnings.push({ type: 'warning', message: 'TRX 余额不足 50，建议及时充值' });
    }
    if (status.trxBalance < 20) {
      warnings.push({ type: 'danger', message: 'TRX 余额严重不足，可能影响转账' });
    }
    if (status.usdtBalance < 100) {
      warnings.push({ type: 'warning', message: 'USDT 余额较低，建议及时充值' });
    }

    res.json({ ...status, warnings });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 获取用户自己的历史记录（需要登录）
router.get('/history', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(payments);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 获取所有用户的最近200条记录（公开接口）
router.get('/recent', async (req, res) => {
  try {
    const payments = await Payment.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .select('payType amount address status txHash createdAt platformOrderId paymentMethod _id');
    res.json(payments);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 获取当前用户的订单列表（用户中心）
router.get('/my-orders', auth, async (req, res) => {
  try {
    // 只查询属于当前用户的订单
    const query = { userId: req.user.userId };
    
    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json(payments);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 获取当前用户的统计数据（用户中心）
router.get('/my-stats', auth, async (req, res) => {
  try {
    // 只统计属于当前用户的订单
    const query = { userId: req.user.userId };

    // 总订单数
    const totalOrders = await Payment.countDocuments(query);

    // 已完成订单数
    const completedOrders = await Payment.countDocuments({
      ...query,
      status: 'completed'
    });

    // 处理中订单数
    const processingOrders = await Payment.countDocuments({
      ...query,
      status: { $in: ['pending', 'paid', 'processing'] }
    });

    // 总金额
    const totalAmountResult = await Payment.aggregate([
      { $match: { 
        userId: req.user.userId,
        status: 'completed'
      }},
      { $group: { _id: null, total: { $sum: '$totalCNY' } } }
    ]);

    const totalAmount = totalAmountResult[0]?.total || 0;

    res.json({
      totalOrders,
      completedOrders,
      processingOrders,
      totalAmount
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
