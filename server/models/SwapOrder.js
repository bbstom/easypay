const mongoose = require('mongoose');

const swapOrderSchema = new mongoose.Schema({
  // 订单基本信息
  orderNumber: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  
  // 用户信息
  userAddress: { type: String, required: true }, // 用户的TRON地址
  email: { type: String },
  
  // 闪兑信息
  fromCurrency: { type: String, enum: ['USDT'], default: 'USDT' },
  toCurrency: { type: String, enum: ['TRX'], default: 'TRX' },
  fromAmount: { type: Number, required: true }, // 用户转入的USDT数量
  toAmount: { type: Number, required: true }, // 应该发送的TRX数量
  exchangeRate: { type: Number, required: true }, // 使用的汇率（TRX/USDT）
  
  // 系统钱包信息
  systemWalletAddress: { type: String, required: true }, // 用户转入的目标钱包地址
  systemWalletId: { type: String }, // 闪兑钱包ID（用于查找钱包配置）
  
  // 接收状态
  receiveStatus: { 
    type: String, 
    enum: ['waiting', 'received', 'timeout'], 
    default: 'waiting' 
  },
  receiveTxHash: { type: String }, // 用户转入的交易哈希
  receiveTime: { type: Date },
  receiveAmount: { type: Number }, // 实际收到的USDT数量
  
  // 发送状态
  sendStatus: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed'], 
    default: 'pending' 
  },
  sendTxHash: { type: String }, // 系统发送TRX的交易哈希
  sendTime: { type: Date },
  sendAmount: { type: Number }, // 实际发送的TRX数量
  
  // 订单状态
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed', 'timeout'], 
    default: 'pending' 
  },
  
  // 错误信息
  errorMessage: { type: String },
  
  // 邮件通知
  emailSent: { type: Boolean, default: false },
  
  // 超时设置
  expiresAt: { type: Date, required: true }, // 订单过期时间（30分钟）
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 创建索引
swapOrderSchema.index({ orderNumber: 1 });
swapOrderSchema.index({ userAddress: 1 });
swapOrderSchema.index({ systemWalletAddress: 1 });
swapOrderSchema.index({ status: 1 });
swapOrderSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('SwapOrder', swapOrderSchema);
