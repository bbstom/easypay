const express = require('express');
const Settings = require('../models/Settings');
const { auth, adminAuth } = require('../middleware/auth');
const exchangeRateService = require('../services/exchangeRateService');

const router = express.Router();

// 获取公开设置（不需要认证）
router.get('/public', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    
    // 只返回公开信息
    res.json({
      siteName: settings.siteName,
      siteLogo: settings.siteLogo,
      siteDescription: settings.siteDescription,
      seoTitle: settings.seoTitle,
      seoDescription: settings.seoDescription,
      seoImage: settings.seoImage,
      socialTwitter: settings.socialTwitter,
      socialFacebook: settings.socialFacebook,
      socialTelegram: settings.socialTelegram,
      socialWeChat: settings.socialWeChat,
      socialEmail: settings.socialEmail,
      telegramCustomerService: settings.telegramCustomerService, // TG客服地址
      energyRentalAddress: settings.energyRentalAddress, // 能量租赁收款地址
      energyPriceTrx: settings.energyPriceTrx, // 能量价格 - TRX数量
      energyPriceEnergy: settings.energyPriceEnergy, // 能量价格 - 能量数量
      energyMinAmount: settings.energyMinAmount, // 最小金额
      energyValidityHours: settings.energyValidityHours, // 能量有效期
      energyNotice: settings.energyNotice, // 重要提示
      swapNotice: settings.swapNotice, // 闪兑重要提示
      systemStartTime: settings.systemStartTime, // 系统运行起始时间
      homeHeroImage: settings.homeHeroImage, // 主页右侧展示图片
      footerCompanyName: settings.footerCompanyName,
      footerDescription: settings.footerDescription,
      footerCopyright: settings.footerCopyright,
      footerLinks: settings.footerLinks,
      footerBottomLinks: settings.footerBottomLinks,
      feeType: settings.feeType,
      feeUSDT: settings.feeUSDT,
      feeTRX: settings.feeTRX,
      feePercentage: settings.feePercentage,
      exchangeRateMode: settings.exchangeRateMode,
      exchangeRateUSDT: settings.exchangeRateUSDT,
      exchangeRateTRX: settings.exchangeRateTRX,
      exchangeRateMarkup: settings.exchangeRateMarkup,
      paymentAlipayEnabled: settings.paymentAlipayEnabled,
      paymentWechatEnabled: settings.paymentWechatEnabled,
      swapWallets: settings.swapWallets // 添加闪兑钱包配置
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 获取所有设置（管理员）
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 更新设置（管理员）
router.put('/', auth, adminAuth, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    
    Object.assign(settings, req.body);
    settings.updatedAt = Date.now();
    await settings.save();
    
    res.json(settings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 手动刷新汇率（管理员）
router.post('/refresh-rates', auth, adminAuth, async (req, res) => {
  try {
    await exchangeRateService.forceUpdate();
    const cacheInfo = exchangeRateService.getCacheInfo();
    res.json({
      success: true,
      message: '汇率已更新',
      rates: cacheInfo.finalRates || { USDT: 0, TRX: 0 },
      lastUpdate: cacheInfo.lastUpdate
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 获取汇率缓存信息（管理员）
router.get('/rate-info', auth, adminAuth, async (req, res) => {
  try {
    const cacheInfo = exchangeRateService.getCacheInfo();
    res.json(cacheInfo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
