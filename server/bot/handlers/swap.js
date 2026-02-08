const SwapOrder = require('../../models/SwapOrder');
const User = require('../../models/User');
const Settings = require('../../models/Settings');
const { getMainKeyboard } = require('../keyboards/main');
const { generateSwapQRCode } = require('../utils/qrCodeGenerator');

// 闪兑服务处理器
const swapHandler = {
  // 显示闪兑信息
  async start(ctx) {
    const user = ctx.session?.user;
    if (!user) {
      return ctx.reply('请先使用 /start 命令');
    }

    // 先回答回调查询，避免超时
    if (ctx.callbackQuery) {
      await ctx.answerCbQuery('正在刷新汇率...').catch(() => {});
    }

    try {
      // 获取闪兑配置
      const settings = await Settings.findOne();
      
      // 从数据库获取缓存的汇率（优先使用缓存）
      let rate = null;
      let lastUpdate = null;
      
      if (settings?.swapRate) {
        // 使用后台配置的固定汇率
        rate = settings.swapRate;
        lastUpdate = '手动设置';
      } else {
        // 使用实时汇率服务（从数据库缓存获取）
        const usdtRate = settings?.exchangeRateUSDT || 7.25;
        const trxRate = settings?.exchangeRateTRX || 1.08;
        
        // 计算 1 USDT = ? TRX
        rate = parseFloat((usdtRate / trxRate).toFixed(4));
        
        // 获取最后更新时间
        if (settings?.updatedAt) {
          const updateTime = new Date(settings.updatedAt);
          lastUpdate = updateTime.toLocaleString('zh-CN', { 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit' 
          });
        } else {
          lastUpdate = '未知';
        }
      }
      
      const swapNotice = settings?.swapNotice || '';
      
      // 获取闪兑钱包地址
      let walletAddress = '';
      if (settings?.swapWallets) {
        try {
          const wallets = JSON.parse(settings.swapWallets);
          const enabledWallet = wallets.find(w => w.enabled);
          if (enabledWallet) {
            walletAddress = enabledWallet.address;
          }
        } catch (e) {
          console.error('解析闪兑钱包失败:', e);
        }
      }

      if (!walletAddress) {
        return ctx.reply('❌ 闪兑服务暂未配置，请联系管理员');
      }

      // 生成美化二维码
      const qrBuffer = await generateSwapQRCode(walletAddress);

      const message = `🔄 <b>USDT 闪兑 TRX</b>\n\n` +
        `━━━━━━━━━━━━━━━\n` +
        `<code>当前汇率：</code><b>1 USDT = ${rate} TRX</b>\n` +
        `<code>更新时间：</code>${lastUpdate}\n` +
        `━━━━━━━━━━━━━━━\n\n` +
        `📍 <b>收款地址（USDT-TRC20）：</b>\n<code>${walletAddress}</code>\n\n` +
        (swapNotice ? `💡 <b>重要提示：</b>\n${swapNotice}\n\n` : '') +
        `🔄 <b>使用说明：</b>\n` +
        `1️⃣ 转入 USDT 到上方地址\n` +
        `2️⃣ 系统自动检测到账\n` +
        `3️⃣ 按当前汇率兑换 TRX\n` +
        `4️⃣ TRX 自动转回您的地址\n\n` +
        `⚠️ 汇率实时变动，以到账时汇率为准`;

      await ctx.replyWithPhoto(
        { source: qrBuffer },
        {
          caption: message,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '🔄 刷新汇率', callback_data: 'swap_service' }
              ],
              [
                { text: '🔙 返回主菜单', callback_data: 'back_to_main' }
              ]
            ]
          }
        }
      );
    } catch (error) {
      console.error('闪兑服务显示失败:', error);
      await ctx.reply('❌ 系统错误，请稍后重试');
    }
  },

  // 处理回调
  async handleCallback(ctx) {
    const action = ctx.callbackQuery?.data || ctx.match?.[0];
    
    console.log('闪兑服务回调 action:', action);

    if (action === 'swap_service' || action?.includes('swap_service')) {
      return swapHandler.start(ctx);
    }

    console.log('未知的闪兑操作:', action);
    if (ctx.callbackQuery) {
      await ctx.answerCbQuery('未知操作');
    }
  }
};

module.exports = swapHandler;
