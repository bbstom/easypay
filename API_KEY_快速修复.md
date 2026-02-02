# API Key 快速修复指南

## 问题：添加 API Key 后仍显示"未知"

### 快速解决方案

#### 方案 1：重新保存配置（推荐）

1. **打开钱包配置页面**
   - 访问：管理后台 → 钱包配置 → 基础配置

2. **确认 API Key**
   - 检查 TronGrid API Key 输入框
   - 确保没有前后空格
   - 格式：32-64 位字母数字

3. **保存并测试**
   - 点击"保存配置"按钮
   - 在弹出的确认框中点击"是"（测试连接）
   - 等待测试结果

4. **验证结果**
   - 切换到"状态监控"标签
   - 点击"刷新"按钮
   - 检查 API 节点状态

#### 方案 2：运行测试脚本

```bash
# 在项目根目录运行
node server/scripts/testApiKey.js
```

**预期输出：**
```
✅ 数据库连接成功

📋 当前配置:
API URL: https://api.trongrid.io
API Key: a1b2c3d4e5...
钱包地址: TXxx...

🔍 测试 1: 不带 API Key
✅ 成功 - 余额: 123.45 TRX

🔍 测试 2: 带 API Key
✅ 成功 - 余额: 123.45 TRX

🔍 测试 3: 连续 10 次请求（检查限流）
✅ 1 ✅ 2 ✅ 3 ✅ 4 ✅ 5 ✅ 6 ✅ 7 ✅ 8 ✅ 9 ✅ 10

📊 结果: 成功 10/10, 失败 0/10

✅ 测试完成
```

#### 方案 3：重启服务器

```bash
# 停止服务器（Ctrl+C）
# 重新启动
npm run dev
```

### 验证 API Key 是否生效

#### 检查后端日志

启动服务器后，查看日志中是否有：

```
✅ 使用 TronGrid API Key: a1b2c3d4e5...
```

如果看到：
```
⚠️  未配置 API Key，使用免费限额（可能触发 429 限流）
```

说明 API Key 未保存或未加载。

#### 检查前端显示

1. **API 节点状态**
   - 状态监控页面
   - 应显示：🟢 已连接
   - 不应显示：🔴 未连接 或 未知

2. **余额信息**
   - 应显示 TRX 和 USDT 余额
   - 应显示资源信息（带宽、能量）

### 常见错误及解决

#### 错误 1：API Key 格式错误

**症状：**
```
❌ API 调用失败: 401 Unauthorized
```

**解决：**
1. 重新复制 API Key
2. 确保完整复制（无截断）
3. 去除前后空格

#### 错误 2：API Key 未激活

**症状：**
```
❌ API 调用失败: 403 Forbidden
```

**解决：**
1. 登录 TronGrid 控制台
2. 检查 API Key 状态
3. 确保状态为 "Active"

#### 错误 3：仍然 429 限流

**症状：**
```
❌ API 调用失败: 429 Too Many Requests
```

**解决：**
1. 等待 1 分钟
2. 检查是否有多个进程
3. 确认 API Key 已生效

### 修改内容总结

#### 后端改进（server/services/tronService.js）

1. **保存 API Key**
   ```javascript
   this.apiKey = settings.tronGridApiKey || null;
   ```

2. **显示 API Key 状态**
   ```javascript
   console.log(`✅ 使用 TronGrid API Key: ${settings.tronGridApiKey.slice(0, 10)}...`);
   ```

3. **备用节点使用 API Key**
   ```javascript
   if (this.apiKey) {
     tronWebConfig.headers = {
       'TRON-PRO-API-KEY': this.apiKey
     };
   }
   ```

#### 路由改进（server/routes/wallet.js）

1. **清除旧实例**
   ```javascript
   tronService.initialized = false;
   tronService.tronWeb = null;
   tronService.apiKey = null;
   ```

2. **重新初始化**
   ```javascript
   await tronService.initialize();
   ```

#### 前端改进（src/pages/WalletConfigPage.jsx）

1. **保存后提示测试**
   ```javascript
   if (confirm('配置已保存。是否立即测试连接？')) {
     await handleTest();
   }
   ```

2. **自动刷新余额**
   ```javascript
   if (currentTab === 'status') {
     await fetchBalance();
   }
   ```

### 下一步操作

1. ✅ 运行测试脚本验证 API Key
2. ✅ 重新保存配置并测试连接
3. ✅ 切换到状态监控查看结果
4. ✅ 如果仍有问题，查看详细诊断指南

### 获取帮助

如果问题仍未解决，请提供：
1. 测试脚本输出（完整）
2. 后端日志（最近 50 行）
3. API Key 状态（隐藏完整 Key）
4. 前端截图（API 节点状态）
