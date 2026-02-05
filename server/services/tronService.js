const TronWeb = require('tronweb');
const Settings = require('../models/Settings');
const { decryptPrivateKey, getMasterKey } = require('../utils/encryption');
const catfeeService = require('./catfeeService');

class TronService {
  constructor() {
    this.tronWeb = null;
    this.initialized = false;
    this.apiKey = null; // 存储 API Key
    this.currentApiUrl = null; // 存储当前使用的 API URL
    this.apiNodes = []; // 存储所有可用的 API 节点
    this.currentNodeIndex = 0; // 当前使用的节点索引
  }

  // 带重试的 API 调用包装器
  async retryApiCall(apiCall, maxRetries = 3, timeout = 30000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // 设置超时
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('API 请求超时')), timeout)
        );
        
        const result = await Promise.race([apiCall(), timeoutPromise]);
        return result;
      } catch (error) {
        console.error(`❌ API 调用失败 (尝试 ${attempt}/${maxRetries}):`, error.message);
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // 等待后重试，递增等待时间
        const waitTime = 1000 * attempt;
        console.log(`⏳ ${waitTime/1000} 秒后重试...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  /**
   * 初始化 TronWeb（仅用于 API 节点连接和地址验证）
   * 注意：多钱包系统不依赖此方法进行转账，每个钱包创建独立的 TronWeb 实例
   */
  async initialize() {
    if (this.initialized && this.tronWeb) return;
    
    const settings = await Settings.findOne();
    if (!settings) {
      throw new Error('系统配置未完成');
    }

    try {
      // 加载配置的 API 节点
      this.apiNodes = [];
      if (settings.tronApiNodes) {
        try {
          const nodes = JSON.parse(settings.tronApiNodes);
          // 只添加启用的节点
          this.apiNodes = nodes.filter(node => node.enabled && node.url).map(node => ({
            url: node.url,
            apiKey: node.apiKey || null,
            name: node.name
          }));
        } catch (e) {
          console.error('解析 API 节点配置失败:', e);
        }
      }

      // 如果没有配置节点，使用默认节点
      if (this.apiNodes.length === 0) {
        this.apiNodes.push({
          url: 'https://api.trongrid.io',
          apiKey: null,
          name: 'Default'
        });
      }

      console.log(`🔗 已加载 ${this.apiNodes.length} 个 API 节点`);
      this.apiNodes.forEach((node, index) => {
        console.log(`   ${index + 1}. ${node.name}: ${node.url}${node.apiKey ? ' (有 API Key)' : ''}`);
      });

      // 创建一个临时的 TronWeb 实例（不需要私钥，仅用于 API 调用）
      const connected = await this.connectToNodeWithoutPrivateKey(0);
      
      if (connected) {
        this.initialized = true;
        console.log('✅ TronWeb 初始化成功（API 节点模式）');
        console.log(`📍 当前节点: ${this.currentApiUrl}`);
      } else {
        throw new Error('所有 API 节点均不可用');
      }
    } catch (error) {
      console.error('❌ TronWeb 初始化失败:', error.message);
      throw new Error('TRON API 初始化失败：' + error.message);
    }
  }

  /**
   * 连接到指定节点（不需要私钥）
   * 用于 API 查询和地址验证
   */
  async connectToNodeWithoutPrivateKey(nodeIndex) {
    if (nodeIndex >= this.apiNodes.length) {
      console.log('❌ 所有配置的节点都已尝试失败');
      return false;
    }

    const node = this.apiNodes[nodeIndex];
    console.log(`🔗 尝试连接节点 ${nodeIndex + 1}/${this.apiNodes.length}: ${node.name} (${node.url})`);

    try {
      const tronWebConfig = {
        fullHost: node.url
      };

      // 如果有 API Key，添加到 headers
      if (node.apiKey) {
        tronWebConfig.headers = {
          'TRON-PRO-API-KEY': node.apiKey
        };
        console.log(`✅ 使用 API Key: ${node.apiKey.slice(0, 10)}...`);
      }

      this.tronWeb = new TronWeb.TronWeb(tronWebConfig);
      this.apiKey = node.apiKey;
      this.currentApiUrl = node.url;
      this.currentNodeIndex = nodeIndex;

      // 测试连接（使用一个已知的地址测试）
      await this.retryApiCall(async () => {
        await this.tronWeb.trx.getBalance('TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t');
      }, 2, 5000);

      console.log(`✅ 节点连接成功: ${node.name}`);
      return true;
    } catch (error) {
      console.error(`❌ 节点连接失败 (${node.name}):`, error.message);
      // 尝试下一个节点
      return await this.connectToNodeWithoutPrivateKey(nodeIndex + 1);
    }
  }

  /**
   * @deprecated 此方法已弃用，多钱包系统不再使用
   * 连接到指定节点（带私钥）
   * 保留用于向后兼容
   */
  async connectToNode(nodeIndex, privateKey) {
    console.warn('⚠️  connectToNode() 方法已弃用，建议使用 connectToNodeWithoutPrivateKey()');
    
    if (nodeIndex >= this.apiNodes.length) {
      console.log('❌ 所有配置的节点都已尝试失败');
      throw new Error('所有配置的 API 节点均不可用，请检查节点配置');
    }

    const node = this.apiNodes[nodeIndex];
    console.log(`🔗 尝试连接节点 ${nodeIndex + 1}/${this.apiNodes.length}: ${node.name} (${node.url})`);

    try {
      const tronWebConfig = {
        fullHost: node.url,
        privateKey: privateKey
      };

      // 如果有 API Key，添加到 headers
      if (node.apiKey) {
        tronWebConfig.headers = {
          'TRON-PRO-API-KEY': node.apiKey
        };
        console.log(`✅ 使用 API Key: ${node.apiKey.slice(0, 10)}...`);
      }

      this.tronWeb = new TronWeb.TronWeb(tronWebConfig);
      this.apiKey = node.apiKey;
      this.currentApiUrl = node.url;
      this.currentNodeIndex = nodeIndex;

      // 测试连接
      await this.retryApiCall(async () => {
        const address = this.tronWeb.defaultAddress.base58;
        await this.tronWeb.trx.getBalance(address);
      }, 2, 5000);

      console.log(`✅ 节点连接成功: ${node.name}`);
      return true;
    } catch (error) {
      console.error(`❌ 节点连接失败 (${node.name}):`, error.message);
      // 尝试下一个节点
      return await this.connectToNode(nodeIndex + 1, privateKey);
    }
  }

  // 验证地址格式
  isValidAddress(address) {
    try {
      return this.tronWeb && this.tronWeb.isAddress(address);
    } catch (error) {
      return false;
    }
  }

  // 租赁能量
  async rentEnergy(isFirstTransfer = false) {
    if (!this.tronWeb) await this.initialize();

    try {
      const settings = await Settings.findOne();
      
      if (!settings.energyRentalEnabled) {
        console.log('⚠️  能量租赁未启用');
        return { success: false, message: '能量租赁未启用' };
      }

      const address = this.getWalletAddress();
      
      // 检查当前能量
      const beforeEnergy = await this.getAccountResources(address);
      console.log(`📊 租赁前能量: ${beforeEnergy.energyRemaining}`);

      // 根据租赁模式选择不同的方法
      if (settings.energyRentalMode === 'catfee') {
        return await this.rentEnergyViaCatFee(isFirstTransfer, beforeEnergy, settings);
      } else {
        return await this.rentEnergyViaTransfer(isFirstTransfer, beforeEnergy, settings);
      }
    } catch (error) {
      console.error('❌ 租赁能量失败:', error);
      throw new Error('租赁能量失败: ' + error.message);
    }
  }

  // 通过转账方式租赁能量（原有方式）
  async rentEnergyViaTransfer(isFirstTransfer, beforeEnergy, settings, walletAddress = null) {
    if (!settings.energyRentalAddress) {
      throw new Error('未配置能量租赁地址');
    }

    // 使用传入的钱包地址，如果没有则使用默认钱包地址
    const address = walletAddress || this.getWalletAddress();

    // 根据是否首次转账选择租赁金额
    const rentalAmount = isFirstTransfer 
      ? settings.energyRentalAmountFirst 
      : settings.energyRentalAmountNormal;

    console.log(`💰 ${isFirstTransfer ? '首次转账' : '正常转账'}，向 ${settings.energyRentalAddress} 发送 ${rentalAmount} TRX 租赁能量...`);
    
    const rentalTx = await this.sendTRX(
      settings.energyRentalAddress,
      rentalAmount
    );

    if (!rentalTx.success) {
      throw new Error('租赁支付失败: ' + rentalTx.error);
    }

    console.log(`✅ 租赁支付成功，交易哈希: ${rentalTx.txid}`);
    console.log(`⏳ 等待 ${settings.energyRentalWaitTime} 秒，等待能量到账...`);

    // 等待能量到账
    await new Promise(resolve => setTimeout(resolve, settings.energyRentalWaitTime * 1000));

    // 检查能量是否到账
    const afterEnergy = await this.getAccountResources(address);
    const energyReceived = afterEnergy.energyRemaining - beforeEnergy.energyRemaining;

    console.log(`📊 租赁后能量: ${afterEnergy.energyRemaining}`);
    console.log(`✨ 获得能量: ${energyReceived}`);

    if (energyReceived > 0) {
      return {
        success: true,
        mode: 'transfer',
        energyBefore: beforeEnergy.energyRemaining,
        energyAfter: afterEnergy.energyRemaining,
        energyReceived: energyReceived,
        txid: rentalTx.txid,
        cost: rentalAmount
      };
    } else {
      console.log('⚠️  能量未到账，可能需要更长等待时间');
      return {
        success: false,
        message: '能量未到账',
        energyBefore: beforeEnergy.energyRemaining,
        energyAfter: afterEnergy.energyRemaining,
        txid: rentalTx.txid
      };
    }
  }

  // 通过 CatFee API 购买能量（新方式）
  async rentEnergyViaCatFee(isFirstTransfer, beforeEnergy, settings, walletAddress = null) {
    if (!settings.catfeeApiKey) {
      throw new Error('未配置 CatFee API Key');
    }

    // 使用传入的钱包地址，如果没有则使用默认钱包地址
    const address = walletAddress || this.getWalletAddress();

    // 设置 API URL（如果有自定义）
    if (settings.catfeeApiUrl) {
      catfeeService.setApiUrl(settings.catfeeApiUrl);
    }

    // 设置 API Key（格式: api_key:api_secret）
    catfeeService.setApiKey(settings.catfeeApiKey);

    // 智能计算需要租赁的能量数量
    const requiredEnergy = isFirstTransfer ? 131000 : 65000;
    const currentEnergy = beforeEnergy.energyRemaining || 0;
    const energyDeficit = requiredEnergy - currentEnergy;

    // 根据能量缺口选择租赁数量
    let energyAmount;
    if (energyDeficit <= 0) {
      // 能量充足，不应该调用此函数
      console.log('⚠️  能量充足，无需租赁');
      return { success: false, message: '能量充足' };
    } else if (energyDeficit <= settings.catfeeEnergyNormal) {
      // 缺口 <= 65000，租赁 65000
      energyAmount = settings.catfeeEnergyNormal;
      console.log(`💡 智能判断：缺口 ${energyDeficit}，租赁 ${energyAmount}`);
    } else {
      // 缺口 > 65000，租赁 131000
      energyAmount = settings.catfeeEnergyFirst;
      console.log(`💡 智能判断：缺口 ${energyDeficit}，租赁 ${energyAmount}`);
    }

    // 转换时长格式：1 -> "1h", 3 -> "3h"
    const duration = `${settings.catfeePeriod || 1}h`;

    console.log(`🔋 ${isFirstTransfer ? '首次转账' : '正常转账'}，通过 CatFee 购买 ${energyAmount} 能量（${duration}）...`);
    console.log(`   当前能量: ${currentEnergy}, 需要: ${requiredEnergy}, 缺口: ${energyDeficit}`);

    // 购买能量
    const result = await catfeeService.buyEnergy(address, energyAmount, duration);

    if (result.success) {
      console.log(`✅ CatFee 购买成功`);
      console.log(`   订单号: ${result.orderNo}`);
      console.log(`   能量: ${result.energyAmount}`);
      console.log(`⏳ 等待 10 秒，等待能量到账...`);

      // 等待能量到账（CatFee 通常很快）
      await new Promise(resolve => setTimeout(resolve, 10000));

      // 检查能量是否到账
      const afterEnergy = await this.getAccountResources(address);
      const energyReceived = afterEnergy.energyRemaining - beforeEnergy.energyRemaining;

      console.log(`📊 购买后能量: ${afterEnergy.energyRemaining}`);
      console.log(`✨ 获得能量: ${energyReceived}`);

      return {
        success: true,
        mode: 'catfee',
        energyBefore: beforeEnergy.energyRemaining,
        energyAfter: afterEnergy.energyRemaining,
        energyReceived: energyReceived,
        orderNo: result.orderNo,
        energyPurchased: result.energyAmount
      };
    } else {
      throw new Error('CatFee 购买失败');
    }
  }

  // 获取账户资源信息（带重试）
  async getAccountResources(address) {
    if (!this.tronWeb) await this.initialize();

    return this.retryApiCall(async () => {
      const resources = await this.tronWeb.trx.getAccountResources(address);
      
      const energyLimit = resources.EnergyLimit || 0;
      const energyUsed = resources.EnergyUsed || 0;
      const energyRemaining = energyLimit - energyUsed;

      return {
        energyLimit,
        energyUsed,
        energyRemaining
      };
    });
  }

  // 检查地址是否有 USDT 余额（判断是否为首次转账）
  async hasUSDTBalance(address) {
    if (!this.tronWeb) await this.initialize();

    try {
      const balance = await this.getUSDTBalance(address);
      return balance > 0;
    } catch (error) {
      console.error('检查USDT余额失败:', error);
      return false; // 出错时假设没有余额，按首次转账处理
    }
  }

  /**
   * @deprecated 此方法已弃用，请使用 sendUSDTWithWallet(wallet, toAddress, amount)
   * 发送USDT（带能量租赁）- 使用全局钱包配置
   * 保留用于向后兼容和能量租赁内部使用
   */
  async sendUSDT(toAddress, amount) {
    console.warn('⚠️  sendUSDT() 方法已弃用，建议使用 sendUSDTWithWallet()');
    
    if (!this.tronWeb) await this.initialize();

    try {
      console.log(`🔄 准备发送 ${amount} USDT 到 ${toAddress}`);
      
      // 验证地址
      if (!this.isValidAddress(toAddress)) {
        throw new Error('无效的接收地址');
      }

      const address = this.getWalletAddress();

      // 检查 USDT 余额
      const balance = await this.getUSDTBalance(address);
      console.log(`💰 当前USDT余额: ${balance}`);
      
      if (balance < amount) {
        throw new Error(`USDT余额不足。当前余额: ${balance}, 需要: ${amount}`);
      }

      // 检查能量
      const settings = await Settings.findOne();
      const resources = await this.getAccountResources(address);
      
      console.log(`⚡ 当前能量: ${resources.energyRemaining}`);

      // 检查目标地址是否有 USDT（判断是否为首次转账）
      const hasUSDT = await this.hasUSDTBalance(toAddress);
      const isFirstTransfer = !hasUSDT;
      const requiredEnergy = hasUSDT ? 65000 : 131000; // 无U的地址需要更多能量
      
      console.log(`📊 目标地址${hasUSDT ? '有' : '无'} USDT，需要约 ${requiredEnergy.toLocaleString()} 能量`);

      // 如果启用了能量租赁且能量不足
      if (settings.energyRentalEnabled && 
          resources.energyRemaining < requiredEnergy) {
        console.log(`⚠️  能量不足 ${requiredEnergy.toLocaleString()}，开始租赁能量...`);
        
        const rentalResult = await this.rentEnergy(isFirstTransfer);
        
        if (rentalResult.success) {
          console.log(`✅ 能量租赁成功，获得 ${rentalResult.energyReceived.toLocaleString()} 能量`);
        } else {
          console.log(`⚠️  能量租赁失败，将使用 TRX 支付手续费`);
        }
      } else if (resources.energyRemaining < requiredEnergy) {
        console.log(`⚠️  能量不足但未启用租赁，将消耗约 ${hasUSDT ? '13-15' : '26-30'} TRX 手续费`);
      }

      // USDT TRC20 合约地址
      const usdtContract = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
      const contract = await this.tronWeb.contract().at(usdtContract);
      
      // USDT有6位小数
      const amountInSun = Math.floor(amount * 1000000);
      
      console.log(`📤 发送 ${amountInSun} Sun (${amount} USDT)`);
      
      const tx = await contract.transfer(toAddress, amountInSun).send({
        feeLimit: 100000000, // 100 TRX
        callValue: 0
      });

      console.log(`✅ USDT发送成功! TxID: ${tx}`);
      
      return {
        success: true,
        txid: tx,
        amount: amount,
        to: toAddress
      };
    } catch (error) {
      console.error('❌ 发送USDT失败:', error);
      throw new Error('发送USDT失败: ' + error.message);
    }
  }

  /**
   * @deprecated 此方法已弃用，请使用 sendTRXWithWallet(wallet, toAddress, amount)
   * 发送TRX - 使用全局钱包配置
   * 保留用于向后兼容和能量租赁内部使用
   */
  async sendTRX(toAddress, amount) {
    console.warn('⚠️  sendTRX() 方法已弃用，建议使用 sendTRXWithWallet()');
    
    if (!this.tronWeb) await this.initialize();

    try {
      console.log(`🔄 准备发送 ${amount} TRX 到 ${toAddress}`);
      
      // 验证地址
      if (!this.isValidAddress(toAddress)) {
        throw new Error('无效的接收地址');
      }

      // 检查余额
      const balance = await this.getBalance(this.tronWeb.defaultAddress.base58);
      console.log(`💰 当前TRX余额: ${balance}`);
      
      // 需要预留一些TRX作为手续费
      const requiredBalance = amount + 10; // 预留10 TRX作为手续费
      if (balance < requiredBalance) {
        throw new Error(`TRX余额不足。当前余额: ${balance}, 需要: ${requiredBalance} (含手续费)`);
      }

      // TRX有6位小数
      const amountInSun = Math.floor(amount * 1000000);
      
      console.log(`📤 发送 ${amountInSun} Sun (${amount} TRX)`);
      
      const tx = await this.tronWeb.trx.sendTransaction(toAddress, amountInSun);
      
      console.log(`✅ TRX发送成功! TxID: ${tx.txid || tx.transaction?.txID}`);
      
      return {
        success: true,
        txid: tx.txid || tx.transaction?.txID,
        amount: amount,
        to: toAddress
      };
    } catch (error) {
      console.error('❌ 发送TRX失败:', error);
      throw new Error('发送TRX失败: ' + error.message);
    }
  }

  // 查询交易状态（带重试）
  async getTransaction(txHash) {
    if (!this.tronWeb) await this.initialize();

    return this.retryApiCall(async () => {
      const tx = await this.tronWeb.trx.getTransaction(txHash);
      
      if (!tx || !tx.txID) {
        return {
          found: false,
          confirmed: false
        };
      }
      
      // 检查交易是否已确认
      const txInfo = await this.tronWeb.trx.getTransactionInfo(txHash);
      
      return {
        found: true,
        confirmed: txInfo && txInfo.blockNumber > 0,
        blockNumber: txInfo?.blockNumber,
        result: txInfo?.result || 'UNKNOWN',
        fee: txInfo?.fee ? txInfo.fee / 1000000 : 0
      };
    });
  }

  // 获取账户余额（带重试）
  async getBalance(address) {
    if (!address) {
      throw new Error('地址参数不能为空');
    }

    if (!this.tronWeb) await this.initialize();

    console.log(`📊 查询 TRX 余额: ${address}`);
    
    return this.retryApiCall(async () => {
      const balance = await this.tronWeb.trx.getBalance(address);
      return balance / 1000000; // 转换为TRX
    });
  }

  // 获取USDT余额（带重试）
  async getUSDTBalance(address) {
    if (!address) {
      throw new Error('地址参数不能为空');
    }

    if (!this.tronWeb) await this.initialize();

    console.log(`📊 查询 USDT 余额: ${address}`);

    return this.retryApiCall(async () => {
      const usdtContract = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
      const contract = await this.tronWeb.contract().at(usdtContract);
      const balance = await contract.balanceOf(address).call();
      
      // TronWeb 6.x 返回的可能是 BigNumber 或普通数字
      let balanceValue;
      if (typeof balance === 'object' && balance.toNumber) {
        balanceValue = balance.toNumber();
      } else if (typeof balance === 'object' && balance.toString) {
        balanceValue = parseInt(balance.toString());
      } else {
        balanceValue = parseInt(balance);
      }
      
      return balanceValue / 1000000; // 转换为USDT
    });
  }

  /**
   * @deprecated 此方法已弃用，多钱包系统不再使用全局钱包地址
   * 获取钱包地址 - 返回全局 TronWeb 实例的地址
   * 保留用于向后兼容
   */
  getWalletAddress() {
    console.warn('⚠️  getWalletAddress() 方法已弃用，多钱包系统使用 Wallet 模型管理地址');
    
    if (!this.tronWeb) {
      throw new Error('TronWeb未初始化');
    }
    return this.tronWeb.defaultAddress.base58;
  }

  // 获取当前使用的 API 节点信息
  getCurrentNodeInfo() {
    if (!this.tronWeb) {
      return {
        url: null,
        connected: false,
        isBackupNode: false,
        nodeName: null
      };
    }

    // 检查是否是配置的节点
    let nodeName = 'Unknown';
    let isBackupNode = false;

    if (this.apiNodes && this.apiNodes.length > 0 && this.currentNodeIndex < this.apiNodes.length) {
      nodeName = this.apiNodes[this.currentNodeIndex].name;
      isBackupNode = false;
    } else if (this.backupNodes.includes(this.currentApiUrl)) {
      nodeName = 'Backup';
      isBackupNode = true;
    }

    return {
      url: this.currentApiUrl,
      connected: this.initialized,
      isBackupNode: isBackupNode,
      nodeName: nodeName
    };
  }

  // 检查钱包状态（优化版，减少嵌套调用）
  async checkWalletStatus() {
    if (!this.tronWeb) await this.initialize();

    try {
      const address = this.getWalletAddress();
      
      // 并行获取所有信息，提高速度
      const [trxBalance, usdtBalance, accountResources, account] = await Promise.all([
        // 直接调用 API，不使用 retryApiCall 避免嵌套超时
        this.tronWeb.trx.getBalance(address).then(b => b / 1000000),
        // USDT 余额
        (async () => {
          try {
            const usdtContract = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
            const contract = await this.tronWeb.contract().at(usdtContract);
            const balance = await contract.balanceOf(address).call();
            
            let balanceValue;
            if (typeof balance === 'object' && balance.toNumber) {
              balanceValue = balance.toNumber();
            } else if (typeof balance === 'object' && balance.toString) {
              balanceValue = parseInt(balance.toString());
            } else {
              balanceValue = parseInt(balance);
            }
            
            return balanceValue / 1000000;
          } catch (error) {
            console.error('获取 USDT 余额失败:', error.message);
            return 0;
          }
        })(),
        // 账户资源
        this.tronWeb.trx.getAccountResources(address),
        // 账户信息
        this.tronWeb.trx.getAccount(address)
      ]);

      // 获取当前节点信息
      const nodeInfo = this.getCurrentNodeInfo();
      
      // 带宽信息
      const freeNetLimit = accountResources.freeNetLimit || 0;
      const freeNetUsed = accountResources.freeNetUsed || 0;
      const freeNetRemaining = freeNetLimit - freeNetUsed;
      
      const netLimit = accountResources.NetLimit || 0;
      const netUsed = accountResources.NetUsed || 0;
      const netRemaining = netLimit - netUsed;
      
      const totalBandwidth = freeNetRemaining + netRemaining;
      
      // 能量信息
      const energyLimit = accountResources.EnergyLimit || 0;
      const energyUsed = accountResources.EnergyUsed || 0;
      const energyRemaining = energyLimit - energyUsed;

      // 质押的 TRX（用于获取资源）
      const frozenV2 = account.account_resource?.frozen_balance_for_energy?.frozen_balance || 0;
      const frozenForBandwidth = account.frozen?.[0]?.frozen_balance || 0;
      const totalFrozen = (frozenV2 + frozenForBandwidth) / 1000000;

      return {
        address,
        trxBalance,
        usdtBalance,
        nodeInfo,
        bandwidth: {
          free: freeNetRemaining,
          staked: netRemaining,
          total: totalBandwidth,
          used: freeNetUsed + netUsed,
          limit: freeNetLimit + netLimit
        },
        energy: {
          available: energyRemaining,
          used: energyUsed,
          limit: energyLimit
        },
        frozen: {
          total: totalFrozen,
          forEnergy: frozenV2 / 1000000,
          forBandwidth: frozenForBandwidth / 1000000
        },
        ready: trxBalance > 10
      };
    } catch (error) {
      console.error('❌ 获取钱包状态失败:', error.message);
      throw error;
    }
  }

  /**
   * 使用指定钱包发送 USDT
   * @param {Object} wallet - 钱包对象（来自 Wallet 模型）
   * @param {string} toAddress - 接收地址
   * @param {number} amount - 转账金额
   * @returns {Promise<Object>} 转账结果
   */
  async sendUSDTWithWallet(wallet, toAddress, amount) {
    const { decryptPrivateKey } = require('../utils/encryption');
    const TronWebModule = require('tronweb');
    const TronWeb = TronWebModule.TronWeb;

    try {
      console.log(`\n💼 使用钱包: ${wallet.name} (${wallet.address})`);
      console.log(`🔄 准备发送 ${amount} USDT 到 ${toAddress}`);

      // 确保 TronWeb 已初始化（用于地址验证和其他功能）
      if (!this.tronWeb) {
        await this.initialize();
      }

      // 验证地址
      if (!this.isValidAddress(toAddress)) {
        throw new Error('无效的接收地址');
      }

      // 解密私钥
      const masterKey = getMasterKey();
      const privateKey = decryptPrivateKey(wallet.privateKeyEncrypted, masterKey);

      // 创建临时 TronWeb 实例（使用当前的 API 节点）
      const tempTronWeb = new TronWeb({
        fullHost: this.currentApiUrl,
        privateKey: privateKey,
        headers: this.apiKey ? { 'TRON-PRO-API-KEY': this.apiKey } : {}
      });

      // 检查 USDT 余额
      const usdtContract = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
      const contract = await tempTronWeb.contract().at(usdtContract);
      const balance = await contract.balanceOf(wallet.address).call();
      
      let usdtBalance;
      if (typeof balance === 'object' && balance.toNumber) {
        usdtBalance = balance.toNumber() / 1000000;
      } else if (typeof balance === 'object' && balance.toString) {
        usdtBalance = parseInt(balance.toString()) / 1000000;
      } else {
        usdtBalance = parseInt(balance) / 1000000;
      }

      if (usdtBalance < amount) {
        throw new Error(`USDT 余额不足: ${usdtBalance} < ${amount}`);
      }

      // 检查是否需要租赁能量
      const settings = await Settings.findOne();
      let energyRentalResult = null;

      if (settings && settings.energyRentalEnabled) {
        // 检查当前能量
        const resources = await tempTronWeb.trx.getAccountResources(wallet.address);
        const energyRemaining = (resources.EnergyLimit || 0) - (resources.EnergyUsed || 0);

        // 检查目标地址是否有 USDT（判断是否首次转账）
        const isFirstTransfer = !(await this.hasUSDTBalance(toAddress));
        const requiredEnergy = isFirstTransfer ? 131000 : 65000;

        console.log(`⚡ 当前能量: ${energyRemaining}`);
        console.log(`📊 需要能量: ${requiredEnergy} (${isFirstTransfer ? '首次转账' : '正常转账'})`);

        if (energyRemaining < requiredEnergy) {
          console.log(`⚠️  能量不足，开始租赁...`);
          
          // 使用当前钱包的 TronWeb 实例进行能量租赁
          if (settings.energyRentalMode === 'catfee') {
            energyRentalResult = await this.rentEnergyViaCatFeeWithWallet(
              wallet.address, 
              isFirstTransfer, 
              { energyRemaining }, 
              settings
            );
          } else {
            energyRentalResult = await this.rentEnergyViaTransferWithWallet(
              tempTronWeb,
              wallet.address,
              isFirstTransfer, 
              { energyRemaining }, 
              settings
            );
          }

          if (!energyRentalResult.success) {
            console.log('⚠️  能量租赁失败，将使用 TRX 支付 gas 费用');
          }
        } else {
          console.log(`✅ 能量充足，无需租赁`);
        }
      }

      // 执行转账
      console.log(`💸 开始转账...`);
      const tx = await contract.transfer(toAddress, amount * 1000000).send({
        feeLimit: 150000000,
        callValue: 0,
        shouldPollResponse: false // 不等待确认，直接返回交易哈希
      });

      // 提取交易哈希
      let txHash;
      if (typeof tx === 'string') {
        txHash = tx;
      } else if (tx.txid) {
        txHash = tx.txid;
      } else if (tx.transaction && tx.transaction.txID) {
        txHash = tx.transaction.txID;
      } else {
        console.error('无法提取交易哈希:', tx);
        txHash = JSON.stringify(tx);
      }

      console.log(`✅ 转账成功！`);
      console.log(`   交易哈希: ${txHash}`);

      // 更新钱包统计
      await this.updateWalletStats(wallet._id, true);

      return {
        success: true,
        txid: txHash,
        from: wallet.address,
        to: toAddress,
        amount: amount,
        walletId: wallet._id,
        walletName: wallet.name,
        energyRental: energyRentalResult
      };

    } catch (error) {
      console.error(`❌ 转账失败:`, error.message);
      
      // 更新钱包统计（失败）
      await this.updateWalletStats(wallet._id, false);

      throw error;
    }
  }

  /**
   * 使用指定钱包发送 TRX
   * @param {Object} wallet - 钱包对象
   * @param {string} toAddress - 接收地址
   * @param {number} amount - 转账金额（TRX）
   * @returns {Promise<Object>} 转账结果
   */
  async sendTRXWithWallet(wallet, toAddress, amount) {
    const { decryptPrivateKey } = require('../utils/encryption');
    const TronWebModule = require('tronweb');
    const TronWeb = TronWebModule.TronWeb;

    try {
      console.log(`\n💼 使用钱包: ${wallet.name} (${wallet.address})`);
      console.log(`🔄 准备发送 ${amount} TRX 到 ${toAddress}`);

      // 确保 TronWeb 已初始化（用于地址验证）
      if (!this.tronWeb) {
        await this.initialize();
      }

      // 验证地址
      if (!this.isValidAddress(toAddress)) {
        throw new Error('无效的接收地址');
      }

      // 解密私钥
      const masterKey = getMasterKey();
      const privateKey = decryptPrivateKey(wallet.privateKeyEncrypted, masterKey);

      // 创建临时 TronWeb 实例
      const tempTronWeb = new TronWeb({
        fullHost: this.currentApiUrl,
        privateKey: privateKey,
        headers: this.apiKey ? { 'TRON-PRO-API-KEY': this.apiKey } : {}
      });

      // 检查 TRX 余额
      const balance = await tempTronWeb.trx.getBalance(wallet.address);
      const trxBalance = balance / 1000000;

      if (trxBalance < amount) {
        throw new Error(`TRX 余额不足: ${trxBalance} < ${amount}`);
      }

      // 执行转账
      console.log(`💸 开始转账...`);
      const tx = await tempTronWeb.trx.sendTransaction(toAddress, amount * 1000000);

      if (tx.result) {
        console.log(`✅ 转账成功！`);
        console.log(`   交易哈希: ${tx.txid}`);

        // 更新钱包统计
        await this.updateWalletStats(wallet._id, true);

        return {
          success: true,
          txid: tx.txid,
          from: wallet.address,
          to: toAddress,
          amount: amount,
          walletId: wallet._id,
          walletName: wallet.name
        };
      } else {
        throw new Error('转账失败');
      }

    } catch (error) {
      console.error(`❌ 转账失败:`, error.message);
      
      // 更新钱包统计（失败）
      await this.updateWalletStats(wallet._id, false);

      throw error;
    }
  }

  /**
   * 更新钱包统计信息
   * @param {string} walletId - 钱包ID
   * @param {boolean} success - 是否成功
   */
  async updateWalletStats(walletId, success) {
    try {
      const Wallet = require('../models/Wallet');
      const wallet = await Wallet.findById(walletId);
      
      if (wallet) {
        wallet.stats.totalTransactions += 1;
        if (success) {
          wallet.stats.successfulTransactions += 1;
        } else {
          wallet.stats.failedTransactions += 1;
        }
        wallet.stats.lastUsed = new Date();
        
        await wallet.save();
      }
    } catch (error) {
      console.error('更新钱包统计失败:', error);
    }
  }
  /**
   * 使用指定钱包通过转账方式租赁能量
   * @param {Object} tempTronWeb - 钱包的 TronWeb 实例
   * @param {string} walletAddress - 钱包地址
   * @param {boolean} isFirstTransfer - 是否首次转账
   * @param {Object} beforeEnergy - 租赁前的能量信息
   * @param {Object} settings - 系统设置
   */
  async rentEnergyViaTransferWithWallet(tempTronWeb, walletAddress, isFirstTransfer, beforeEnergy, settings) {
    if (!settings.energyRentalAddress) {
      throw new Error('未配置能量租赁地址');
    }

    try {
      // 根据是否首次转账选择租赁金额
      const rentalAmount = isFirstTransfer 
        ? settings.energyRentalAmountFirst 
        : settings.energyRentalAmountNormal;

      console.log(`💰 ${isFirstTransfer ? '首次转账' : '正常转账'}，向 ${settings.energyRentalAddress} 发送 ${rentalAmount} TRX 租赁能量...`);
      
      // 使用当前钱包的 TronWeb 实例发送 TRX
      const tx = await tempTronWeb.trx.sendTransaction(
        settings.energyRentalAddress, 
        rentalAmount * 1000000
      );

      if (!tx.result) {
        throw new Error('租赁支付失败');
      }

      const txHash = tx.txid || tx.transaction?.txID;
      console.log(`✅ 租赁支付成功，交易哈希: ${txHash}`);
      console.log(`⏳ 等待 ${settings.energyRentalWaitTime} 秒，等待能量到账...`);

      // 等待能量到账
      await new Promise(resolve => setTimeout(resolve, settings.energyRentalWaitTime * 1000));

      // 检查能量是否到账
      const afterResources = await tempTronWeb.trx.getAccountResources(walletAddress);
      const afterEnergy = (afterResources.EnergyLimit || 0) - (afterResources.EnergyUsed || 0);
      const energyReceived = afterEnergy - beforeEnergy.energyRemaining;

      console.log(`📊 租赁后能量: ${afterEnergy}`);
      console.log(`✨ 获得能量: ${energyReceived}`);

      if (energyReceived > 0) {
        return {
          success: true,
          mode: 'transfer',
          energyBefore: beforeEnergy.energyRemaining,
          energyAfter: afterEnergy,
          energyReceived: energyReceived,
          txid: txHash,
          cost: rentalAmount
        };
      } else {
        console.log('⚠️  能量未到账，可能需要更长等待时间');
        return {
          success: false,
          message: '能量未到账',
          energyBefore: beforeEnergy.energyRemaining,
          energyAfter: afterEnergy,
          txid: txHash
        };
      }
    } catch (error) {
      console.error('❌ 租赁能量失败:', error.message);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * 使用指定钱包通过 CatFee API 购买能量
   * @param {string} walletAddress - 钱包地址
   * @param {boolean} isFirstTransfer - 是否首次转账
   * @param {Object} beforeEnergy - 购买前的能量信息
   * @param {Object} settings - 系统设置
   */
  async rentEnergyViaCatFeeWithWallet(walletAddress, isFirstTransfer, beforeEnergy, settings) {
    if (!settings.catfeeApiKey) {
      throw new Error('未配置 CatFee API Key');
    }

    try {
      // 设置 API URL（如果有自定义）
      if (settings.catfeeApiUrl) {
        catfeeService.setApiUrl(settings.catfeeApiUrl);
      }

      // 设置 API Key
      catfeeService.setApiKey(settings.catfeeApiKey);

      // 智能计算需要租赁的能量数量
      const requiredEnergy = isFirstTransfer ? 131000 : 65000;
      const currentEnergy = beforeEnergy.energyRemaining || 0;
      const energyDeficit = requiredEnergy - currentEnergy;

      // 根据能量缺口选择租赁数量
      let energyAmount;
      if (energyDeficit <= 0) {
        // 能量充足，不应该调用此函数
        console.log('⚠️  能量充足，无需租赁');
        return { success: false, message: '能量充足' };
      } else if (energyDeficit <= settings.catfeeEnergyNormal) {
        // 缺口 <= 65000，租赁 65000
        energyAmount = settings.catfeeEnergyNormal;
        console.log(`💡 智能判断：缺口 ${energyDeficit}，租赁 ${energyAmount}`);
      } else {
        // 缺口 > 65000，租赁 131000
        energyAmount = settings.catfeeEnergyFirst;
        console.log(`💡 智能判断：缺口 ${energyDeficit}，租赁 ${energyAmount}`);
      }

      // 转换时长格式
      const duration = `${settings.catfeePeriod || 1}h`;

      console.log(`🔋 ${isFirstTransfer ? '首次转账' : '正常转账'}，通过 CatFee 购买 ${energyAmount} 能量（${duration}）...`);
      console.log(`   当前能量: ${currentEnergy}, 需要: ${requiredEnergy}, 缺口: ${energyDeficit}`);

      // 购买能量
      const result = await catfeeService.buyEnergy(walletAddress, energyAmount, duration);

      if (result.success) {
        console.log(`✅ CatFee 购买成功`);
        console.log(`   订单号: ${result.orderNo}`);
        console.log(`   能量: ${result.energyAmount}`);
        console.log(`⏳ 等待 10 秒，等待能量到账...`);

        // 等待能量到账
        await new Promise(resolve => setTimeout(resolve, 10000));

        // 检查能量是否到账（需要初始化 TronWeb）
        if (!this.tronWeb) {
          await this.initialize();
        }
        
        const afterResources = await this.getAccountResources(walletAddress);
        const energyReceived = afterResources.energyRemaining - beforeEnergy.energyRemaining;

        console.log(`📊 购买后能量: ${afterResources.energyRemaining}`);
        console.log(`✨ 获得能量: ${energyReceived}`);

        return {
          success: true,
          mode: 'catfee',
          energyBefore: beforeEnergy.energyRemaining,
          energyAfter: afterResources.energyRemaining,
          energyReceived: energyReceived,
          orderNo: result.orderNo,
          energyPurchased: result.energyAmount
        };
      } else {
        throw new Error('CatFee 购买失败');
      }
    } catch (error) {
      console.error('❌ 购买能量失败:', error.message);
      return {
        success: false,
        message: error.message
      };
    }
  }
}

module.exports = new TronService();