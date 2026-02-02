# TRON API 查询优化方案

## 实施时间
2026-01-29

## 问题背景

TRON API 查询有时会出现以下问题：
- ❌ 请求超时
- ❌ 节点不响应
- ❌ 网络波动导致查询失败
- ❌ 偶发性连接错误

## 优化方案

### 1. 自动重试机制 ✅

**实现方式：**
```javascript
async retryApiCall(apiCall, maxRetries = 3, timeout = 10000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 设置超时
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API 请求超时')), timeout)
      );
      
      const result = await Promise.race([apiCall(), timeoutPromise]);
      return result;
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      // 递增等待时间后重试
      const waitTime = 1000 * attempt;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}
```

**特点：**
- 默认重试 3 次
- 默认超时 10 秒
- 递增等待时间（1秒、2秒、3秒）
- 自动记录重试日志

### 2. 备用节点切换 ✅

**备用节点列表：**
```javascript
this.backupNodes = [
  'https://api.trongrid.io',      // 官方主节点
  'https://api.tronstack.io',     // TronStack 节点
  'https://api.shasta.trongrid.io' // Shasta 测试网
];
```

**切换逻辑：**
- 主节点连接失败时自动切换
- 循环使用备用节点
- 切换后重新初始化 TronWeb
- 记录切换日志

### 3. 超时控制 ✅

**不同操作的超时设置：**
- 普通查询：10 秒
- 钱包状态查询：15 秒（更复杂，允许更长时间）
- 初始化连接：5 秒

### 4. 优化的方法

已优化的方法列表：
- ✅ `initialize()` - 初始化连接（带备用节点）
- ✅ `getTransaction()` - 查询交易状态
- ✅ `getAccountResources()` - 获取账户资源
- ✅ `getBalance()` - 获取 TRX 余额
- ✅ `getUSDTBalance()` - 获取 USDT 余额
- ✅ `checkWalletStatus()` - 检查钱包状态

## 使用示例

### 自动重试
```javascript
// 自动重试 3 次，每次超时 10 秒
const balance = await tronService.getBalance(address);

// 自定义重试次数和超时
const status = await tronService.checkWalletStatus(); // 15秒超时
```

### 备用节点
```javascript
// 初始化时自动尝试备用节点
await tronService.initialize();
// 如果主节点失败，会自动切换到备用节点
```

## 日志输出

### 正常情况
```
🔗 连接 TRON 节点: https://api.trongrid.io
✅ TronWeb 初始化成功
```

### 重试情况
```
❌ API 调用失败 (尝试 1/3): API 请求超时
⏳ 1 秒后重试...
✅ API 调用成功
```

### 切换节点
```
❌ TronWeb 初始化失败: API 请求超时
🔄 尝试使用备用节点...
🔄 切换到备用节点: https://api.tronstack.io
✅ 备用节点连接成功
✅ 使用备用节点初始化成功
```

## 性能优化

### 1. 超时时间优化
- 避免无限等待
- 快速失败，快速重试
- 不同操作使用不同超时时间

### 2. 重试策略
- 递增等待时间（避免立即重试）
- 最多重试 3 次（避免过度重试）
- 记录详细日志（便于排查问题）

### 3. 节点管理
- 多个备用节点
- 自动切换
- 循环使用（避免单点故障）

## 错误处理

### 1. 超时错误
```
❌ API 调用失败 (尝试 1/3): API 请求超时
⏳ 1 秒后重试...
```

### 2. 网络错误
```
❌ API 调用失败 (尝试 2/3): Network Error
⏳ 2 秒后重试...
```

### 3. 所有节点失败
```
❌ TronWeb 初始化失败: API 请求超时
🔄 尝试使用备用节点...
🔄 切换到备用节点: https://api.tronstack.io
❌ 备用节点连接失败: API 请求超时
❌ TRON 钱包初始化失败：所有节点均不可用
```

## 配置建议

### 1. 主节点选择
推荐使用官方节点：
- `https://api.trongrid.io` - 官方主网节点
- `https://api.shasta.trongrid.io` - 测试网节点

### 2. 备用节点
可以添加更多备用节点：
```javascript
this.backupNodes = [
  'https://api.trongrid.io',
  'https://api.tronstack.io',
  'https://api.nileex.io',
  'https://api.trongrid.io'
];
```

### 3. 超时时间调整
根据网络情况调整：
```javascript
// 网络较慢时增加超时时间
await this.retryApiCall(apiCall, 3, 20000); // 20秒超时
```

## 测试建议

### 1. 测试重试机制
```bash
# 模拟网络延迟
# 观察是否自动重试
node server/scripts/testWalletStatus.js
```

### 2. 测试备用节点
```bash
# 关闭主节点或修改为无效地址
# 观察是否自动切换到备用节点
```

### 3. 测试超时控制
```bash
# 设置较短的超时时间
# 观察是否正确超时并重试
```

## 优势总结

### 1. 可靠性提升
- ✅ 自动重试，减少偶发性失败
- ✅ 备用节点，避免单点故障
- ✅ 超时控制，避免无限等待

### 2. 用户体验改善
- ✅ 查询更稳定
- ✅ 响应更快速
- ✅ 错误更少

### 3. 运维友好
- ✅ 详细日志，便于排查
- ✅ 自动恢复，减少人工干预
- ✅ 灵活配置，适应不同环境

## 后续优化建议

### 1. 节点健康检查
定期检查节点健康状态，自动选择最快的节点

### 2. 智能路由
根据响应时间自动选择最优节点

### 3. 缓存机制
对不常变化的数据（如账户资源）进行短时缓存

### 4. 监控告警
节点故障时发送告警通知

## 总结

✅ 已实现完整的 TRON API 查询优化方案

✅ 包含自动重试、备用节点、超时控制三大核心功能

✅ 大幅提升查询稳定性和可靠性

✅ 所有关键查询方法均已优化

现在 TRON API 查询更加稳定可靠，即使在网络不稳定的情况下也能正常工作！

---

**实施者**: Kiro AI Assistant  
**完成时间**: 2026-01-29  
**状态**: ✅ 已完成并可测试
