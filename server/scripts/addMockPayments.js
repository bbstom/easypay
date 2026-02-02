const mongoose = require('mongoose');
require('dotenv').config();

const Payment = require('../models/Payment');

const mockPayments = [
  { address: 'TAbcDefGhIjKlMnOpQrStUvWxYz123456', amount: 100, payType: 'USDT', status: 'completed', txHash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890', paymentMethod: 'alipay', totalCNY: 740, createdAt: new Date('2026-01-28T11:55:00') },
  { address: 'TXyzAbcDefGhIjKlMnOpQrStUvWxYz789', amount: 50, payType: 'TRX', status: 'completed', txHash: '0x9876543210fedcba0987654321fedcba0987654321fedcba0987654321fedcba', paymentMethod: 'alipay', totalCNY: 56, createdAt: new Date('2026-01-28T11:45:00') },
  { address: 'TMnoPqrStUvWxYzAbcDefGhIjKlMnOp012', amount: 150, payType: 'USDT', status: 'completed', txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890', paymentMethod: 'alipay', totalCNY: 1107.5, createdAt: new Date('2026-01-28T11:30:00') },
  { address: 'TGhiJklMnoPqrStUvWxYzAbcDefGhIjK345', amount: 75, payType: 'TRX', status: 'completed', txHash: '0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234', paymentMethod: 'alipay', totalCNY: 83, createdAt: new Date('2026-01-28T11:15:00') },
  { address: 'TStUvWxYzAbcDefGhIjKlMnoPqrStUvW678', amount: 200, payType: 'USDT', status: 'completed', txHash: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321', paymentMethod: 'alipay', totalCNY: 1475, createdAt: new Date('2026-01-28T11:00:00') },
  { address: 'TDefGhIjKlMnoPqrStUvWxYzAbcDefGh901', amount: 120, payType: 'USDT', status: 'completed', txHash: '0x234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12', paymentMethod: 'alipay', totalCNY: 887, createdAt: new Date('2026-01-28T10:30:00') },
  { address: 'TIjKlMnoPqrStUvWxYzAbcDefGhIjKlM234', amount: 80, payType: 'TRX', status: 'completed', txHash: '0x890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678', paymentMethod: 'alipay', totalCNY: 88.4, createdAt: new Date('2026-01-28T10:00:00') },
  { address: 'TQrStUvWxYzAbcDefGhIjKlMnoPqrStU567', amount: 95, payType: 'USDT', status: 'completed', txHash: '0xcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab', paymentMethod: 'alipay', totalCNY: 703.25, createdAt: new Date('2026-01-28T09:30:00') },
  { address: 'TWxYzAbcDefGhIjKlMnoPqrStUvWxYz890', amount: 110, payType: 'TRX', status: 'completed', txHash: '0x4567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123', paymentMethod: 'alipay', totalCNY: 120.8, createdAt: new Date('2026-01-28T09:00:00') },
  { address: 'TAbcDefGhIjKlMnOpQrStUvWxYzAbc123', amount: 65, payType: 'USDT', status: 'completed', txHash: '0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456', paymentMethod: 'alipay', totalCNY: 482.75, createdAt: new Date('2026-01-28T08:30:00') },
  { address: 'TKlMnoPqrStUvWxYzAbcDefGhIjKlMn456', amount: 180, payType: 'USDT', status: 'completed', txHash: '0xbcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890a', paymentMethod: 'alipay', totalCNY: 1328, createdAt: new Date('2026-01-28T08:00:00') },
  { address: 'TPqrStUvWxYzAbcDefGhIjKlMnoPqrS789', amount: 90, payType: 'TRX', status: 'completed', txHash: '0xef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd', paymentMethod: 'alipay', totalCNY: 99.2, createdAt: new Date('2026-01-28T07:30:00') },
  { address: 'TUvWxYzAbcDefGhIjKlMnoPqrStUvWx012', amount: 130, payType: 'USDT', status: 'completed', txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', paymentMethod: 'alipay', totalCNY: 960.5, createdAt: new Date('2026-01-28T07:00:00') },
  { address: 'TYzAbcDefGhIjKlMnoPqrStUvWxYzAb345', amount: 55, payType: 'TRX', status: 'completed', txHash: '0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234', paymentMethod: 'alipay', totalCNY: 61.4, createdAt: new Date('2026-01-28T06:30:00') },
  { address: 'TDefGhIjKlMnoPqrStUvWxYzAbcDefG678', amount: 170, payType: 'USDT', status: 'completed', txHash: '0x90abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678', paymentMethod: 'alipay', totalCNY: 1254.5, createdAt: new Date('2026-01-28T06:00:00') },
  { address: 'THiJklMnoPqrStUvWxYzAbcDefGhIjK901', amount: 85, payType: 'TRX', status: 'completed', txHash: '0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc', paymentMethod: 'alipay', totalCNY: 93.8, createdAt: new Date('2026-01-28T05:30:00') },
  { address: 'TMnoPqrStUvWxYzAbcDefGhIjKlMnOp234', amount: 140, payType: 'USDT', status: 'completed', txHash: '0x234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1', paymentMethod: 'alipay', totalCNY: 1034, createdAt: new Date('2026-01-28T05:00:00') },
  { address: 'TRstUvWxYzAbcDefGhIjKlMnoPqrStU567', amount: 70, payType: 'TRX', status: 'completed', txHash: '0x67890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345', paymentMethod: 'alipay', totalCNY: 77.6, createdAt: new Date('2026-01-28T04:30:00') },
  { address: 'TWxYzAbcDefGhIjKlMnoPqrStUvWxYz890', amount: 160, payType: 'USDT', status: 'completed', txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef123456789', paymentMethod: 'alipay', totalCNY: 1181, createdAt: new Date('2026-01-28T04:00:00') },
  { address: 'TAbcDefGhIjKlMnoPqrStUvWxYzAbcD123', amount: 105, payType: 'TRX', status: 'completed', txHash: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba098765432', paymentMethod: 'alipay', totalCNY: 115.4, createdAt: new Date('2026-01-28T03:30:00') },
];

async function addMockPayments() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 连接成功');

    // 删除所有现有的已完成订单
    await Payment.deleteMany({ status: 'completed' });
    console.log('🗑️  已清除现有的已完成订单');

    // 插入假数据
    await Payment.insertMany(mockPayments);
    console.log(`✅ 成功添加 ${mockPayments.length} 条假数据`);

    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

addMockPayments();
