# 加密货币自动转账实现指南

## 当前实现状态 ✅

您的系统已经实现了完整的自动转账功能！

### 已实现功能

1. **自动转账流程**
   - 用户支付完成后，系统自动触发区块链转账
   - 支持 USDT (TRC20) 和 TRX 转账
   - 自动更新订单状态
   - 发送邮件通知

2. **安全机制**
   - 签名验证
   - 余额检查
   - 地址验证
   - 交易状态跟踪

3. **错误处理**
   - 转账失败自动标记订单状态
   - 详细的日志记录

## 配置要求

### 1. TRON 钱包配置

在管理后台 **系统设置 → TRON配置** 中设置：

- **TRON API URL**: `https://api.trongrid.io`
- **TRON Private Key**: 您的钱包私钥（必须配置）

### 2. 钱包余额要求

确保钱包有足够余额：
- **TRX**: 建议保持 100+ TRX（用于支付 gas 费用）
- **USDT**: 根据业务量准备充足的 USDT

### 3. 安全建议

⚠️ **重要安全提示**：
- 私钥存储在 `.env` 文件中，不要提交到 Git
- 定期备份私钥
- 使用专用钱包，不要与个人资产混用
- 定期检查钱包余额

## 工作流程

```
┌─────────────┐
│ 用户下单    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 选择支付方式│ (支付宝/微信)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 跳转支付网关│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 用户完成支付│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 支付网关回调│ → 验证签名
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 更新订单状态│ → paymentStatus: 'paid'
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 触发自动转账│ → processTransfer()
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 检查余额    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 执行区块链  │ → tronService.sendUSDT/sendTRX
│ 转账        │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 获取交易哈希│ → txHash
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 更新订单状态│ → transferStatus: 'completed'
│             │ → status: 'completed'
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 发送邮件通知│
└─────────────┘
```

## 代码位置

### 核心文件

1. **server/services/tronService.js**
   - TRON 区块链交互
   - USDT/TRX 转账功能
   - 余额查询
   - 交易验证

2. **server/routes/payments.js**
   - 支付回调处理
   - `processTransfer()` 函数：自动转账逻辑
   - 订单状态管理

3. **server/models/Payment.js**
   - 订单数据模型
   - 包含支付状态和转账状态字段

## 建议的改进

### 1. 重试机制

为失败的转账添加自动重试：

```javascript
async function processTransferWithRetry(paymentId, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await processTransfer(paymentId);
      return;
    } catch (error) {
      console.error(`转账失败 (尝试 ${i + 1}/${maxRetries}):`, error);
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 5000 * (i + 1)));
    }
  }
}
```

### 2. 手动重试按钮

在管理后台添加手动重试功能，用于处理失败的订单。

### 3. 余额监控

添加钱包余额监控和预警：

```javascript
async function checkWalletBalance() {
  const status = await tronService.checkWalletStatus();
  if (status.trxBalance < 50) {
    // 发送预警邮件
    console.warn('⚠️ TRX 余额不足 50，请及时充值！');
  }
  if (status.usdtBalance < 1000) {
    console.warn('⚠️ USDT 余额不足 1000，请及时充值！');
  }
}
```

### 4. 转账队列

对于高并发场景，使用队列处理转账：

```javascript
const Queue = require('bull');
const transferQueue = new Queue('crypto-transfers');

transferQueue.process(async (job) => {
  await processTransfer(job.data.paymentId);
});
```

### 5. 详细日志

添加更详细的转账日志记录，便于追踪和审计。

## 测试建议

### 1. 测试网测试

在主网部署前，先在 TRON 测试网（Nile/Shasta）测试：

```javascript
// 测试网配置
tronApiUrl: 'https://nile.trongrid.io' // Nile 测试网
// 或
tronApiUrl: 'https://api.shasta.trongrid.io' // Shasta 测试网
```

### 2. 小额测试

主网部署后，先用小额订单测试完整流程。

### 3. 监控日志

密切关注服务器日志，确保转账正常执行。

## 常见问题

### Q: 转账失败怎么办？

A: 检查以下几点：
1. 钱包余额是否充足
2. 私钥是否正确配置
3. 接收地址是否有效
4. 网络连接是否正常
5. 查看服务器日志获取详细错误信息

### Q: 如何查看转账记录？

A: 
1. 管理后台 → 财务管理 → 查看订单详情
2. 使用 txHash 在 TRONSCAN 查询：`https://tronscan.org/#/transaction/{txHash}`

### Q: 转账需要多长时间？

A: 
- TRON 网络确认时间：约 3 秒
- 系统处理时间：几秒内
- 总计：通常在 10 秒内完成

### Q: 手续费是多少？

A: 
- TRX 转账：约 0.1 TRX
- USDT (TRC20) 转账：约 5-15 TRX（取决于网络拥堵情况）

## 监控和维护

### 日常检查

1. **每日检查钱包余额**
2. **查看失败订单**（transferStatus: 'failed'）
3. **监控转账成功率**
4. **检查邮件发送状态**

### 数据库查询

```javascript
// 查询待处理的转账
db.payments.find({ 
  paymentStatus: 'paid', 
  transferStatus: 'pending' 
})

// 查询失败的转账
db.payments.find({ 
  transferStatus: 'failed' 
})

// 查询今日完成的订单
db.payments.find({ 
  status: 'completed',
  createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) }
})
```

## 总结

您的系统已经具备完整的自动转账功能，只需要：

1. ✅ 配置 TRON 私钥
2. ✅ 确保钱包有足够余额
3. ✅ 测试完整支付流程
4. ✅ 监控系统运行状态

如需实现上述建议的改进功能，请告诉我！
