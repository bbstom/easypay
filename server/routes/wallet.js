const express = require('express');
const Settings = require('../models/Settings');
const { auth } = require('../middleware/auth');
const { encryptPrivateKey, decryptPrivateKey, isValidPrivateKey, getMasterKey } = require('../utils/encryption');
const tronService = require('../services/tronService');
const TronWeb = require('tronweb');

const router = express.Router();

// 获取钱包配置（管理员）
router.get('/config', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const settings = await Settings.findOne();
    if (!settings) {
      return res.json({
        tronWalletAddress: '',
        hasPrivateKey: false,
        tronApiNodes: JSON.stringify([
          { name: 'TronGrid', url: 'https://api.trongrid.io', apiKey: '', enabled: false },
          { name: 'ZAN', url: '', apiKey: '', enabled: false },
          { name: 'TronScan', url: '', apiKey: '', enabled: false }
        ]),
        walletAutoTransferEnabled: true,
        walletMaxRetryCount: 3,
        walletMinTRXBalance: 50,
        walletMinUSDTBalance: 100,
        energyRentalEnabled: false,
        energyRentalAddress: '',
        energyRentalAmountFirst: 20,
        energyRentalAmountNormal: 10,
        energyRentalWaitTime: 30,
        catfeeApiUrl: 'https://api.catfee.io'
      });
    }

    res.json({
      tronWalletAddress: settings.tronWalletAddress || '',
      hasPrivateKey: !!settings.tronPrivateKeyEncrypted,
      tronApiNodes: settings.tronApiNodes || JSON.stringify([
        { name: 'TronGrid', url: 'https://api.trongrid.io', apiKey: '', enabled: false },
        { name: 'ZAN', url: '', apiKey: '', enabled: false },
        { name: 'TronScan', url: '', apiKey: '', enabled: false }
      ]),
      walletAutoTransferEnabled: settings.walletAutoTransferEnabled,
      walletMaxRetryCount: settings.walletMaxRetryCount,
      walletMinTRXBalance: settings.walletMinTRXBalance,
      walletMinUSDTBalance: settings.walletMinUSDTBalance,
      energyRentalEnabled: settings.energyRentalEnabled,
      energyRentalMode: settings.energyRentalMode || 'transfer',
      energyRentalAddress: settings.energyRentalAddress || '',
      energyRentalAmountFirst: settings.energyRentalAmountFirst,
      energyRentalAmountNormal: settings.energyRentalAmountNormal,
      energyRentalWaitTime: settings.energyRentalWaitTime,
      catfeeApiUrl: settings.catfeeApiUrl || 'https://api.catfee.io',
      catfeeApiKey: settings.catfeeApiKey || '',
      catfeeEnergyFirst: settings.catfeeEnergyFirst || 131000,
      catfeeEnergyNormal: settings.catfeeEnergyNormal || 65000,
      catfeePeriod: settings.catfeePeriod || 1
    });
  } catch (error) {
    console.error('获取钱包配置失败:', error);
    res.status(400).json({ error: error.message });
  }
});

// 更新钱包配置（管理员）
router.put('/config', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const {
      tronPrivateKey,
      walletAutoTransferEnabled,
      walletMaxRetryCount,
      walletMinTRXBalance,
      walletMinUSDTBalance
    } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    // 更新 API 节点配置
    if (req.body.tronApiNodes) {
      settings.tronApiNodes = req.body.tronApiNodes;
    }

    // 更新私钥（如果提供）
    if (tronPrivateKey) {
      // 验证私钥格式
      if (!isValidPrivateKey(tronPrivateKey)) {
        return res.status(400).json({ 
          error: '私钥格式错误，必须是64位十六进制字符串' 
        });
      }

      try {
        // 验证私钥是否有效（尝试创建 TronWeb 实例）
        // 使用第一个启用的节点进行验证
        let testApiUrl = 'https://api.trongrid.io';
        if (settings.tronApiNodes) {
          try {
            const nodes = JSON.parse(settings.tronApiNodes);
            const enabledNode = nodes.find(n => n.enabled && n.url);
            if (enabledNode) {
              testApiUrl = enabledNode.url;
            }
          } catch (e) {
            // 使用默认 URL
          }
        }

        const testTronWeb = new TronWeb.TronWeb({
          fullHost: testApiUrl,
          privateKey: tronPrivateKey
        });

        // 获取钱包地址
        const walletAddress = testTronWeb.defaultAddress.base58;
        
        // 加密私钥
        const masterKey = getMasterKey();
        const encryptedPrivateKey = encryptPrivateKey(tronPrivateKey, masterKey);

        // 保存加密后的私钥和钱包地址
        settings.tronPrivateKeyEncrypted = encryptedPrivateKey;
        settings.tronWalletAddress = walletAddress;

        console.log('✅ 私钥已加密保存，钱包地址:', walletAddress);
      } catch (error) {
        console.error('私钥验证失败:', error);
        return res.status(400).json({ 
          error: '私钥无效或无法连接到 TRON 网络: ' + error.message
        });
      }
    }

    // 更新其他配置
    if (typeof walletAutoTransferEnabled !== 'undefined') {
      settings.walletAutoTransferEnabled = walletAutoTransferEnabled;
    }
    if (walletMaxRetryCount) {
      settings.walletMaxRetryCount = walletMaxRetryCount;
    }
    if (walletMinTRXBalance) {
      settings.walletMinTRXBalance = walletMinTRXBalance;
    }
    if (walletMinUSDTBalance) {
      settings.walletMinUSDTBalance = walletMinUSDTBalance;
    }

    // 更新能量租赁配置
    if (typeof req.body.energyRentalEnabled !== 'undefined') {
      settings.energyRentalEnabled = req.body.energyRentalEnabled;
    }
    if (req.body.energyRentalMode) {
      settings.energyRentalMode = req.body.energyRentalMode;
    }
    if (req.body.energyRentalAddress) {
      settings.energyRentalAddress = req.body.energyRentalAddress;
    }
    if (req.body.energyRentalAmountFirst) {
      settings.energyRentalAmountFirst = req.body.energyRentalAmountFirst;
    }
    if (req.body.energyRentalAmountNormal) {
      settings.energyRentalAmountNormal = req.body.energyRentalAmountNormal;
    }
    if (req.body.energyRentalWaitTime) {
      settings.energyRentalWaitTime = req.body.energyRentalWaitTime;
    }
    if (req.body.catfeeApiUrl) {
      settings.catfeeApiUrl = req.body.catfeeApiUrl;
    }
    if (typeof req.body.catfeeApiKey !== 'undefined') {
      settings.catfeeApiKey = req.body.catfeeApiKey;
    }
    if (req.body.catfeeEnergyFirst) {
      settings.catfeeEnergyFirst = req.body.catfeeEnergyFirst;
    }
    if (req.body.catfeeEnergyNormal) {
      settings.catfeeEnergyNormal = req.body.catfeeEnergyNormal;
    }
    if (req.body.catfeePeriod) {
      settings.catfeePeriod = req.body.catfeePeriod;
    }

    settings.updatedAt = new Date();
    await settings.save();

    // 重新初始化 TronService（重要：使新的节点配置生效）
    if (tronPrivateKey || req.body.tronApiNodes) {
      try {
        console.log('🔄 重新初始化 TronService...');
        tronService.initialized = false;
        tronService.tronWeb = null; // 清除旧实例
        tronService.apiKey = null; // 清除旧 API Key
        tronService.apiNodes = []; // 清除旧节点列表
        await tronService.initialize();
        console.log('✅ TronService 已重新初始化');
      } catch (error) {
        console.error('⚠️  重新初始化 TronService 失败:', error.message);
        // 不阻止配置保存，只是记录错误
      }
    }

    res.json({ 
      message: '钱包配置已更新',
      walletAddress: settings.tronWalletAddress
    });
  } catch (error) {
    console.error('更新钱包配置失败:', error);
    res.status(400).json({ error: error.message });
  }
});

// 测试钱包连接（管理员）
router.post('/test', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const settings = await Settings.findOne();
    if (!settings || !settings.tronPrivateKeyEncrypted) {
      return res.status(400).json({ error: '未配置钱包私钥' });
    }

    // 重新初始化
    tronService.initialized = false;
    await tronService.initialize();

    // 获取钱包状态
    const status = await tronService.checkWalletStatus();

    res.json({
      success: true,
      message: '钱包连接成功',
      ...status
    });
  } catch (error) {
    console.error('测试钱包连接失败:', error);
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
});

// 获取钱包余额（管理员）
router.get('/balance', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const status = await tronService.checkWalletStatus();
    
    const settings = await Settings.findOne();
    const warnings = [];
    
    if (status.trxBalance < (settings?.walletMinTRXBalance || 50)) {
      warnings.push({ 
        type: 'warning', 
        message: `TRX 余额不足 ${settings?.walletMinTRXBalance || 50}，建议及时充值` 
      });
    }
    if (status.trxBalance < 20) {
      warnings.push({ 
        type: 'danger', 
        message: 'TRX 余额严重不足，可能影响转账' 
      });
    }
    if (status.usdtBalance < (settings?.walletMinUSDTBalance || 100)) {
      warnings.push({ 
        type: 'warning', 
        message: `USDT 余额不足 ${settings?.walletMinUSDTBalance || 100}，建议及时充值` 
      });
    }

    res.json({ ...status, warnings });
  } catch (error) {
    console.error('获取钱包余额失败:', error);
    res.status(400).json({ error: error.message });
  }
});

// 验证私钥格式（管理员）
router.post('/validate-key', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }

    const { privateKey } = req.body;

    if (!privateKey) {
      return res.status(400).json({ error: '请提供私钥' });
    }

    // 验证格式
    if (!isValidPrivateKey(privateKey)) {
      return res.json({ 
        valid: false, 
        message: '私钥格式错误，必须是64位十六进制字符串' 
      });
    }

    // 尝试创建 TronWeb 实例
    try {
      const testTronWeb = new TronWeb.TronWeb({
        fullHost: 'https://api.trongrid.io',
        privateKey: privateKey
      });

      const walletAddress = testTronWeb.defaultAddress.base58;

      res.json({ 
        valid: true, 
        message: '私钥格式正确',
        walletAddress: walletAddress
      });
    } catch (error) {
      console.error('TronWeb 创建失败:', error);
      res.json({ 
        valid: false, 
        message: '私钥无效: ' + (error.message || '无法创建钱包实例')
      });
    }
  } catch (error) {
    console.error('验证私钥失败:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
