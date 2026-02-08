const Wallet = require('../models/Wallet');
const tronService = require('./tronService');

class WalletUpdateService {
  constructor() {
    this.updateInterval = null;
    this.isRunning = false;
  }

  /**
   * 启动定时更新服务
   * @param {number} intervalMinutes - 更新间隔（分钟），默认60分钟
   */
  start(intervalMinutes = 60) {
    if (this.isRunning) {
      console.log('⚠️  钱包更新服务已在运行');
      return;
    }

    console.log(`🚀 启动钱包余额自动更新服务（每 ${intervalMinutes} 分钟）`);
    
    // 立即执行一次
    this.updateAllWallets().catch(err => {
      console.error('初始更新失败:', err);
    });

    // 设置定时任务
    this.updateInterval = setInterval(() => {
      this.updateAllWallets().catch(err => {
        console.error('定时更新失败:', err);
      });
    }, intervalMinutes * 60 * 1000);

    this.isRunning = true;
  }

  /**
   * 停止定时更新服务
   */
  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      this.isRunning = false;
      console.log('🛑 钱包余额自动更新服务已停止');
    }
  }

  /**
   * 更新所有钱包余额
   */
  async updateAllWallets() {
    try {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔄 开始自动更新所有钱包余额');
      console.log(`⏰ 时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      // 获取所有启用的钱包
      const wallets = await Wallet.find({ status: 'active' });
      
      if (wallets.length === 0) {
        console.log('⚠️  没有找到启用的钱包');
        return;
      }

      console.log(`📊 找到 ${wallets.length} 个启用的钱包\n`);

      // 初始化 TronWeb
      await tronService.initialize();

      let successCount = 0;
      let failCount = 0;

      // 使用 Promise.all 并行更新所有钱包，但等待全部完成
      const updatePromises = wallets.map(async (wallet) => {
        try {
          await this.updateSingleWallet(wallet);
          successCount++;
        } catch (error) {
          console.error(`❌ 更新钱包 ${wallet.name} 失败:`, error.message);
          failCount++;
        }
      });

      // 等待所有更新完成
      await Promise.all(updatePromises);

      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ 钱包余额更新完成');
      console.log(`   成功: ${successCount} 个`);
      console.log(`   失败: ${failCount} 个`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error) {
      console.error('❌ 更新所有钱包失败:', error);
    }
  }

  /**
   * 更新单个钱包余额
   * @param {Object} wallet - 钱包对象
   */
  async updateSingleWallet(wallet) {
    console.log(`🔄 更新钱包: ${wallet.name} (${wallet.type})`);
    console.log(`   地址: ${wallet.address}`);

    if (!wallet.address) {
      console.log(`   ⚠️  跳过: 地址为空\n`);
      return;
    }

    // 查询余额
    console.log(`   📊 查询 TRX 余额...`);
    const trxBalance = await tronService.getBalance(wallet.address);
    console.log(`   📊 查询 USDT 余额...`);
    const usdtBalance = await tronService.getUSDTBalance(wallet.address);

    // 更新数据库
    wallet.balance.trx = trxBalance;
    wallet.balance.usdt = usdtBalance;
    wallet.balance.lastUpdated = new Date();
    await wallet.save();

    console.log(`   ✅ 更新完成 - TRX: ${trxBalance.toFixed(2)} | USDT: ${usdtBalance.toFixed(2)}\n`);
  }

  /**
   * 手动触发更新（用于 API 调用）
   */
  async manualUpdate() {
    console.log('🔄 手动触发钱包余额更新');
    await this.updateAllWallets();
  }
}

// 导出单例
module.exports = new WalletUpdateService();
