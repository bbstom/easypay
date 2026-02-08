const Payment = require('../../models/Payment');
const User = require('../../models/User');
const Settings = require('../../models/Settings');
const { getMainKeyboard } = require('../keyboards/main');
const { generateEnergyQRCode } = require('../utils/qrCodeGenerator');
const axios = require('axios');

// 能量租赁处理器
const energyHandler = {
  // 显示能量租赁信息
  async start(ctx) {
    const user = ctx.session?.user;
    if (!user) {
      return ctx.reply('请先使用 /start 命令');
    }

    // 先回答回调查询，避免超时
    if (ctx.callbackQuery) {
      await ctx.answerCbQuery().catch(() => {});
    }

    try {
      // 获取能量租赁配置
      const settings = await Settings.findOne();
      
      const walletAddress = settings?.energyRentalAddress || '';
      const priceTrx = settings?.energyPriceTrx || 1;
      const priceEnergy = settings?.energyPriceEnergy || 65000;
      const minAmount = settings?.energyMinAmount || 10;
      const validityHours = settings?.energyValidityHours || 24;
      const notice = settings?.energyNotice || '';

      if (!walletAddress) {
        return ctx.reply('❌ 能量租赁服务暂未配置，请联系管理员');
      }

      // 生成美化二维码
      const qrBuffer = await generateEnergyQRCode(walletAddress);

      const message = `⚡ <b>能量租赁</b>\n\n` +
        `━━━━━━━━━━━━━━━\n` +
        `<code>当前价格：</code>${priceTrx} TRX = ${priceEnergy.toLocaleString()} 能量\n` +
        `<code>最小金额：</code>${minAmount} TRX\n` +
        `<code>有效期：</code>${validityHours} 小时\n` +
        `━━━━━━━━━━━━━━━\n\n` +
        `📍 <b>收款地址：</b>\n<code>${walletAddress}</code>\n\n` +
        (notice ? `💡 <b>重要提示：</b>\n${notice}\n\n` : '') +
        `⚡ <b>使用说明：</b>\n` +
        `1️⃣ 转入 TRX 到上方地址\n` +
        `2️⃣ 系统自动检测到账\n` +
        `3️⃣ 自动租赁能量到转账地址\n` +
        `4️⃣ 能量有效期 ${validityHours} 小时`;

      await ctx.replyWithPhoto(
        { source: qrBuffer },
        {
          caption: message,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '🔙 返回主菜单', callback_data: 'back_to_main' }
              ]
            ]
          }
        }
      );
    } catch (error) {
      console.error('能量租赁显示失败:', error);
      await ctx.reply('❌ 系统错误，请稍后重试');
    }
  },

  // 处理回调
  async handleCallback(ctx) {
    const action = ctx.callbackQuery?.data || ctx.match?.[0];
    
    console.log('能量租赁回调 action:', action);

    if (action === 'energy_rental' || action?.includes('energy_rental')) {
      return energyHandler.start(ctx);
    }

    console.log('未知的能量租赁操作:', action);
    if (ctx.callbackQuery) {
      await ctx.answerCbQuery('未知操作');
    }
  }
};

module.exports = energyHandler;
