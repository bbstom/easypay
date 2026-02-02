const Wallet = require('../models/Wallet');

/**
 * 钱包智能选择器
 * 根据多个因素评分，选择最优钱包进行转账
 */
class WalletSelector {
  /**
   * 选择最优钱包
   * @param {Object} options - 选择选项
   * @param {number} options.amount - 转账金额
   * @param {string} options.type - 转账类型 ('TRX' 或 'USDT')
   * @param {number} options.estimatedFee - 预估手续费（TRX）
   * @returns {Promise<Object>} 选中的钱包
   */
  async selectBestWallet(options = {}) {
    const { amount = 0, type = 'USDT', estimatedFee = 15 } = options;

    // 1. 获取所有启用的钱包
    const wallets = await Wallet.find({ enabled: true }).sort({ priority: -1 });

    if (wallets.length === 0) {
      throw new Error('没有可用的钱包');
    }

    // 2. 过滤符合条件的钱包
    const eligibleWallets = wallets.filter(wallet => {
      // 健康状态检查
      if (wallet.health.status === 'error') {
        return false;
      }

      // TRX 余额检查（至少要能支付手续费）
      if (wallet.balance.trx < estimatedFee) {
        return false;
      }

      // USDT 余额检查
      if (type === 'USDT' && wallet.balance.usdt < amount) {
        return false;
      }

      // TRX 转账余额检查
      if (type === 'TRX' && wallet.balance.trx < (amount + estimatedFee)) {
        return false;
      }

      return true;
    });

    if (eligibleWallets.length === 0) {
      throw new Error('没有符合条件的钱包（余额不足或状态异常）');
    }

    // 3. 计算每个钱包的得分
    const scoredWallets = eligibleWallets.map(wallet => ({
      wallet,
      score: this.calculateScore(wallet, amount, type, estimatedFee)
    }));

    // 4. 按得分排序，选择最高分的钱包
    scoredWallets.sort((a, b) => b.score - a.score);

    const selected = scoredWallets[0];

    console.log(`\n🎯 钱包选择结果:`);
    console.log(`   选中钱包: ${selected.wallet.name} (${selected.wallet.address})`);
    console.log(`   综合得分: ${selected.score.toFixed(2)}`);
    console.log(`   优先级: ${selected.wallet.priority}`);
    console.log(`   TRX 余额: ${selected.wallet.balance.trx.toFixed(2)}`);
    console.log(`   USDT 余额: ${selected.wallet.balance.usdt.toFixed(2)}`);
    console.log(`   健康状态: ${selected.wallet.health.status}\n`);

    return selected.wallet;
  }

  /**
   * 计算钱包得分
   * @param {Object} wallet - 钱包对象
   * @param {number} amount - 转账金额
   * @param {string} type - 转账类型
   * @param {number} estimatedFee - 预估手续费
   * @returns {number} 得分（0-100）
   */
  calculateScore(wallet, amount, type, estimatedFee) {
    let score = 0;

    // 1. 优先级得分（40分）
    // 优先级范围 0-100，直接映射到 0-40 分
    const priorityScore = (wallet.priority / 100) * 40;
    score += priorityScore;

    // 2. 余额充足度得分（30分）
    const balance = type === 'USDT' ? wallet.balance.usdt : wallet.balance.trx;
    const required = type === 'USDT' ? amount : (amount + estimatedFee);
    
    // 余额是需求的 10 倍时得满分
    const sufficiency = balance / (required * 10);
    const balanceScore = Math.min(sufficiency, 1) * 30;
    score += balanceScore;

    // 3. 负载均衡得分（20分）
    // 根据最后使用时间计算，越久未用得分越高
    const now = Date.now();
    const lastUsed = wallet.stats.lastUsed ? new Date(wallet.stats.lastUsed).getTime() : 0;
    const hoursSinceLastUse = (now - lastUsed) / (1000 * 60 * 60);
    
    // 24 小时未用得满分，线性递减
    const loadScore = Math.min(hoursSinceLastUse / 24, 1) * 20;
    score += loadScore;

    // 4. 健康状态得分（10分）
    let healthScore = 0;
    if (wallet.health.status === 'healthy') {
      healthScore = 10;
    } else if (wallet.health.status === 'warning') {
      healthScore = 5;
    }
    score += healthScore;

    return score;
  }

  /**
   * 获取钱包选择建议（用于调试和展示）
   * @param {Object} options - 选择选项
   * @returns {Promise<Array>} 钱包列表及得分
   */
  async getWalletRecommendations(options = {}) {
    const { amount = 0, type = 'USDT', estimatedFee = 15 } = options;

    const wallets = await Wallet.find({ enabled: true }).sort({ priority: -1 });

    const recommendations = wallets.map(wallet => {
      const eligible = this.isEligible(wallet, amount, type, estimatedFee);
      const score = eligible ? this.calculateScore(wallet, amount, type, estimatedFee) : 0;

      return {
        id: wallet._id,
        name: wallet.name,
        address: wallet.address,
        priority: wallet.priority,
        balance: {
          trx: wallet.balance.trx,
          usdt: wallet.balance.usdt
        },
        health: wallet.health.status,
        lastUsed: wallet.stats.lastUsed,
        eligible,
        score: score.toFixed(2),
        reason: eligible ? '符合条件' : this.getIneligibleReason(wallet, amount, type, estimatedFee)
      };
    });

    return recommendations.sort((a, b) => b.score - a.score);
  }

  /**
   * 检查钱包是否符合条件
   */
  isEligible(wallet, amount, type, estimatedFee) {
    if (wallet.health.status === 'error') return false;
    if (wallet.balance.trx < estimatedFee) return false;
    if (type === 'USDT' && wallet.balance.usdt < amount) return false;
    if (type === 'TRX' && wallet.balance.trx < (amount + estimatedFee)) return false;
    return true;
  }

  /**
   * 获取不符合条件的原因
   */
  getIneligibleReason(wallet, amount, type, estimatedFee) {
    if (wallet.health.status === 'error') {
      return '健康状态异常';
    }
    if (wallet.balance.trx < estimatedFee) {
      return `TRX 余额不足（需要 ${estimatedFee} TRX 手续费）`;
    }
    if (type === 'USDT' && wallet.balance.usdt < amount) {
      return `USDT 余额不足（需要 ${amount} USDT）`;
    }
    if (type === 'TRX' && wallet.balance.trx < (amount + estimatedFee)) {
      return `TRX 余额不足（需要 ${amount + estimatedFee} TRX）`;
    }
    return '未知原因';
  }
}

module.exports = new WalletSelector();
