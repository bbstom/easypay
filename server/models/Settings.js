const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // 网站基本信息
  siteName: { type: String, default: 'FastPay' },
  siteLogo: { type: String, default: '' },
  siteFavicon: { type: String, default: '' }, // 网站图标（favicon）
  siteDescription: { type: String, default: '安全快捷的数字货币代付平台' },
  siteKeywords: { type: String, default: 'USDT,TRX,代付,数字货币' },
  
  // SEO信息
  seoTitle: { type: String, default: 'FastPay - 数字货币代付平台' },
  seoDescription: { type: String, default: '专业的USDT/TRX代付服务，安全快捷，7x24小时在线' },
  seoImage: { type: String, default: '' },
  
  // 社交信息
  socialTwitter: { type: String, default: '' },
  socialFacebook: { type: String, default: '' },
  socialTelegram: { type: String, default: '' },
  socialWeChat: { type: String, default: '' },
  socialEmail: { type: String, default: '' },
  telegramCustomerService: { type: String, default: '' }, // TG客服地址
  energyRentalAddress: { type: String, default: '' }, // 能量租赁收款地址
  energyPriceTrx: { type: Number, default: 1 }, // 能量价格 - TRX数量
  energyPriceEnergy: { type: Number, default: 65000 }, // 能量价格 - 能量数量
  energyMinAmount: { type: Number, default: 10 }, // 最小金额
  energyValidityHours: { type: Number, default: 24 }, // 能量有效期（小时）
  energyNotice: { type: String, default: '仅支持 TRX 转账\n最小金额：10 TRX\n能量有效期：24小时' }, // 重要提示
  swapNotice: { type: String, default: '必须使用 TRC20 网络\n最小金额：10 USDT\n汇率实时变动' }, // 闪兑重要提示
  systemStartTime: { type: Date, default: () => new Date('2024-01-01T00:00:00') }, // 系统运行起始时间
  homeHeroImage: { type: String, default: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop' }, // 主页右侧展示图片
  
  // Footer 自定义内容
  footerCompanyName: { type: String, default: 'FASTPAY' },
  footerDescription: { type: String, default: '领先的自动化代付协议，为 TRON 生态提供安全、快速、便捷的 USDT 和 TRX 代付服务。' },
  footerCopyright: { type: String, default: '© 2024 FastPay. All rights reserved.' },
  footerLinks: { type: String, default: JSON.stringify([
    { title: '产品服务', links: [
      { name: 'USDT 代付', url: '#' },
      { name: 'TRX 代付', url: '#' }
    ]},
    { title: '帮助支持', links: [
      { name: '使用文档', url: '#' },
      { name: '联系客服', url: '#' }
    ]}
  ]) },
  footerBottomLinks: { type: String, default: JSON.stringify([
    { name: '隐私政策', url: '#' },
    { name: '服务协议', url: '#' }
  ]) },
  
  // 服务费设置
  feeType: { type: String, enum: ['fixed', 'percentage'], default: 'fixed' },
  feeUSDT: { type: Number, default: 5 },
  feeTRX: { type: Number, default: 2 },
  feePercentage: { type: Number, default: 1 }, // 百分比费率
  
  // 汇率设置
  exchangeRateMode: { type: String, enum: ['realtime', 'manual'], default: 'manual' }, // 实时或手动
  exchangeRateUSDT: { type: Number, default: 7.35 }, // USDT汇率（手动模式使用）
  exchangeRateTRX: { type: Number, default: 1.08 }, // TRX汇率（手动模式使用）
  exchangeRateMarkup: { type: Number, default: 0 }, // 汇率加成百分比（如5表示在实时汇率基础上+5%）
  
  // 支付平台配置
  paymentApiUrl: { type: String, default: 'https://pay.abcdely.top' },
  paymentApiVersion: { type: String, enum: ['v1', 'v2'], default: 'v1' }, // API版本
  paymentMerchantId: { type: String, default: '' },
  paymentApiKey: { type: String, default: '' }, // V1使用MD5密钥，V2使用商户私钥
  paymentPublicKey: { type: String, default: '' }, // V2平台公钥
  paymentNotifyUrl: { type: String, default: '' },
  paymentAlipayEnabled: { type: Boolean, default: false }, // 支付宝是否可用
  paymentWechatEnabled: { type: Boolean, default: true }, // 微信支付是否可用
  
  // TRON API 节点配置（多节点支持）
  // 注意：代付钱包配置已迁移到 Wallet 模型，使用多钱包系统
  tronApiNodes: { 
    type: String, 
    default: JSON.stringify([
      { name: 'TronGrid', url: 'https://api.trongrid.io', apiKey: '', enabled: false },
      { name: 'ZAN', url: '', apiKey: '', enabled: false }
    ])
  }, // JSON 格式存储多个节点配置
  
  // 钱包安全配置
  walletAutoTransferEnabled: { type: Boolean, default: true }, // 是否启用自动转账
  walletMaxRetryCount: { type: Number, default: 3 }, // 最大重试次数
  walletMinTRXBalance: { type: Number, default: 50 }, // TRX 最低余额预警
  walletMinUSDTBalance: { type: Number, default: 100 }, // USDT 最低余额预警
  
  // 能量租赁配置
  energyRentalEnabled: { type: Boolean, default: false }, // 是否启用能量租赁
  energyRentalMode: { type: String, enum: ['transfer', 'catfee'], default: 'transfer' }, // 租赁模式：transfer=转账租赁, catfee=API购买
  energyRentalAddress: { type: String, default: '' }, // 能量租赁服务商地址（transfer模式使用）
  energyRentalAmountFirst: { type: Number, default: 20 }, // 首次转账（目标地址无U）租赁金额
  energyRentalAmountNormal: { type: Number, default: 10 }, // 正常转账（目标地址有U）租赁金额
  energyRentalWaitTime: { type: Number, default: 30 }, // 等待能量到账的时间（秒）
  catfeeApiUrl: { type: String, default: 'https://api.catfee.io' }, // CatFee API URL
  catfeeApiKey: { type: String, default: '' }, // CatFee API Key（catfee模式使用）
  catfeeEnergyFirst: { type: Number, default: 131000 }, // 首次转账需要的能量
  catfeeEnergyNormal: { type: Number, default: 65000 }, // 正常转账需要的能量
  catfeePeriod: { type: Number, default: 1 }, // 租赁时长（小时）：1 或 3
  
  // SMTP邮件配置
  smtpHost: { type: String, default: '' },
  smtpPort: { type: Number, default: 465 },
  smtpSecure: { type: Boolean, default: true },
  smtpUser: { type: String, default: '' },
  smtpPass: { type: String, default: '' },
  smtpFromName: { type: String, default: 'FastPay' },
  smtpFromEmail: { type: String, default: '' },
  
  // 闪兑配置
  swapEnabled: { type: Boolean, default: true }, // 是否启用闪兑功能
  swapRateMode: { type: String, enum: ['realtime', 'manual'], default: 'realtime' }, // 闪兑汇率模式（推荐实时）
  swapRateUSDTtoTRX: { type: Number, default: 3.4 }, // 闪兑汇率：1 USDT = X TRX（手动模式使用，基于2026年2月市场价格）
  swapRateMarkup: { type: Number, default: 2 }, // 闪兑汇率加成（%），用户换到的TRX会减少这个百分比
  swapMinAmount: { type: Number, default: 10 }, // 最小兑换金额（USDT）
  swapMaxAmount: { type: Number, default: 10000 }, // 最大兑换金额（USDT）
  swapOrderTimeout: { type: Number, default: 30 }, // 订单超时时间（分钟）
  
  // 闪兑专用钱包配置（JSON数组格式）
  swapWallets: { 
    type: String, 
    default: JSON.stringify([]) 
  }, // 闪兑专用钱包列表：[{ id, name, address, privateKeyEncrypted, enabled, priority }]
  
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Settings', settingsSchema);
