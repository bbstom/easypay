const axios = require('axios');
const Settings = require('../models/Settings');

class ExchangeRateService {
  constructor() {
    this.cache = {
      originalRates: {
        USDT: null,
        TRX: null
      },
      finalRates: {
        USDT: null,
        TRX: null
      },
      lastUpdate: null
    };
    this.updateInterval = 60 * 60 * 1000; // 1小时更新一次
    this.isUpdating = false;
  }

  // 启动自动更新
  startAutoUpdate() {
    console.log('🔄 汇率自动更新服务已启动');
    
    // 立即执行一次
    this.updateRates();
    
    // 每小时更新一次
    setInterval(() => {
      this.updateRates();
    }, this.updateInterval);
  }

  // 从CoinGecko获取实时汇率
  async fetchRatesFromAPI() {
    try {
      // CoinGecko免费API，无需API key
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
          ids: 'tether,tron',  // USDT和TRX的ID
          vs_currencies: 'cny'  // 对人民币
        },
        timeout: 10000
      });

      const usdtRate = response.data.tether?.cny;
      const trxRate = response.data.tron?.cny;

      if (!usdtRate || !trxRate) {
        throw new Error('API返回数据不完整');
      }

      return {
        USDT: parseFloat(usdtRate.toFixed(4)),
        TRX: parseFloat(trxRate.toFixed(4))
      };
    } catch (error) {
      console.error('❌ 获取汇率失败:', error.message);
      
      // 如果API失败，使用备用API
      return this.fetchRatesFromBackupAPI();
    }
  }

  // 备用API：Binance
  async fetchRatesFromBackupAPI() {
    try {
      console.log('🔄 尝试使用备用API (Binance)...');
      
      // 获取USDT/CNY (通过USDT/USDT = 1)
      const usdtRate = 7.25; // USDT相对稳定，约等于1美元
      
      // 获取TRX/USDT
      const trxResponse = await axios.get('https://api.binance.com/api/v3/ticker/price', {
        params: { symbol: 'TRXUSDT' },
        timeout: 10000
      });
      
      const trxUsdtPrice = parseFloat(trxResponse.data.price);
      const trxRate = parseFloat((trxUsdtPrice * usdtRate).toFixed(4));

      return {
        USDT: usdtRate,
        TRX: trxRate
      };
    } catch (error) {
      console.error('❌ 备用API也失败:', error.message);
      
      // 如果所有API都失败，返回缓存或默认值
      if (this.cache.originalRates.USDT && this.cache.originalRates.TRX) {
        console.log('⚠️ 使用缓存汇率');
        return {
          USDT: this.cache.originalRates.USDT,
          TRX: this.cache.originalRates.TRX
        };
      }
      
      // 最后的默认值
      console.log('⚠️ 使用默认汇率');
      return {
        USDT: 7.25,
        TRX: 1.08
      };
    }
  }

  // 更新汇率到数据库
  async updateRates() {
    if (this.isUpdating) {
      console.log('⏳ 汇率更新中，跳过本次...');
      return;
    }

    this.isUpdating = true;

    try {
      // 获取设置
      let settings = await Settings.findOne();
      if (!settings) {
        settings = new Settings();
      }

      // 只在实时模式下更新
      if (settings.exchangeRateMode !== 'realtime') {
        console.log('📌 当前为手动模式，跳过汇率更新');
        this.isUpdating = false;
        return;
      }

      console.log('🔄 开始更新汇率...');
      
      // 获取最新汇率（原始汇率）
      const rates = await this.fetchRatesFromAPI();
      
      // 应用加成
      const markup = settings.exchangeRateMarkup || 0;
      const finalUSDT = parseFloat((rates.USDT * (1 + markup / 100)).toFixed(4));
      const finalTRX = parseFloat((rates.TRX * (1 + markup / 100)).toFixed(4));

      // 更新到数据库（存储加成后的汇率）
      settings.exchangeRateUSDT = finalUSDT;
      settings.exchangeRateTRX = finalTRX;
      settings.updatedAt = Date.now();
      await settings.save();

      // 更新缓存（分别存储原始汇率和加成后的汇率）
      this.cache.originalRates.USDT = rates.USDT;
      this.cache.originalRates.TRX = rates.TRX;
      this.cache.finalRates.USDT = finalUSDT;
      this.cache.finalRates.TRX = finalTRX;
      this.cache.lastUpdate = new Date();

      console.log(`✅ 汇率更新成功！`);
      console.log(`   USDT: ${rates.USDT} CNY (加成后: ${finalUSDT} CNY)`);
      console.log(`   TRX: ${rates.TRX} CNY (加成后: ${finalTRX} CNY)`);
      console.log(`   下次更新: ${new Date(Date.now() + this.updateInterval).toLocaleString('zh-CN')}`);
      
    } catch (error) {
      console.error('❌ 更新汇率到数据库失败:', error.message);
    } finally {
      this.isUpdating = false;
    }
  }

  // 手动触发更新（用于测试或管理员手动刷新）
  async forceUpdate() {
    console.log('🔄 手动触发汇率更新...');
    this.isUpdating = false; // 重置锁
    await this.updateRates();
  }

  // 获取缓存的汇率信息
  getCacheInfo() {
    return {
      originalRates: {
        USDT: this.cache.originalRates.USDT,
        TRX: this.cache.originalRates.TRX
      },
      finalRates: {
        USDT: this.cache.finalRates.USDT,
        TRX: this.cache.finalRates.TRX
      },
      lastUpdate: this.cache.lastUpdate,
      nextUpdate: this.cache.lastUpdate 
        ? new Date(this.cache.lastUpdate.getTime() + this.updateInterval)
        : null
    };
  }
}

// 创建单例
const exchangeRateService = new ExchangeRateService();

module.exports = exchangeRateService;
