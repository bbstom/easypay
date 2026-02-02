const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  payType: { type: String, enum: ['USDT', 'TRX'], required: true },
  amount: { type: Number, required: true },
  address: { type: String, required: true },
  email: { type: String },
  paymentMethod: { type: String, enum: ['alipay', 'wechat'], required: true },
  totalCNY: { type: Number, required: true },
  serviceFee: { type: Number, default: 0 },
  
  // 支付平台相关
  platformOrderId: { type: String }, // 支付平台订单号
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'expired'], 
    default: 'pending' 
  },
  paymentTime: { type: Date },
  
  // 代付相关
  txHash: { type: String },
  transferStatus: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed'], 
    default: 'pending' 
  },
  transferTime: { type: Date },
  
  // 使用的钱包信息（多钱包系统）
  walletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet' },
  walletName: { type: String },
  
  // 邮件通知
  emailSent: { type: Boolean, default: false },
  
  status: { type: String, enum: ['pending', 'paid', 'completed', 'failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);
