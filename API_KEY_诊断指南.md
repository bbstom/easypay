# TronGrid API Key 诊断指南

## 问题现象
添加 API Key 后，前端仍显示"API 节点 未知"，后端日志显示 429 错误。

## 诊断步骤

### 1. 验证 API Key 是否正确保存

运行测试脚本：
```bash
node server/scripts/testApiKey.js
```

检查输出：
- ✅ 应该显示 API Key 的前 10 位字符
- ✅ 测试 2 应该成功（带 API Key）
- ✅ 测试 3 应该全部成功（10/10）

### 2. 检查 API Key 格式

TronGrid API Key 格式：
- 长度：32-64 个字符
- 格式：字母数字组合
- 示例：`a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6`

### 3. 验证 API Key 权限

访问 TronGrid 控制台：
1. 登录 https://www.trongrid.io/
2. 进入 Dashboard
3. 检查 API Key 状态：
   - ✅ 状态：Active
   - ✅ 限额：100 requests/second
   - ✅ 网络：Mainnet

### 4. 测试 API Key 有效性

使用 curl 测试：
```bash
curl -X POST https://api.trongrid.io/wallet/getbalance \
  -H "TRON-PRO-API-KEY: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"address":"YOUR_WALLET_ADDRESS","visible":true}'
```

预期结果：
- ✅ 返回余额信息
- ❌ 如果返回 401：API Key 无效
- ❌ 如果返回 429：API Key 未生效

## 常见问题

### Q1: API Key 保存后未生效
**原因**：TronService 未重新初始化

**解决方案**：
1. 保存配置后，点击"测试连接"按钮
2. 或重启服务器：`npm run dev`

### Q2: 仍然触发 429 错误
**原因**：请求过于频繁

**解决方案**：
1. 检查是否有多个进程同时运行
2. 减少查询频率（已优化为按需查询）
3. 等待 1 分钟后重试

### Q3: API Key 格式错误
**原因**：复制时包含空格或换行

**解决方案**：
1. 重新复制 API Key
2. 确保没有前后空格
3. 使用纯文本编辑器粘贴

## 优化建议

### 1. 使用 API Key（推荐）
- 免费申请：https://www.trongrid.io/
- 限额提升：5 req/s → 100 req/s
- 稳定性更好

### 2. 自建节点（高级）
- 完全控制
- 无限额限制
- 需要技术能力

### 3. 按需查询（已实施）
- 只在必要时查询
- 减少 70-80% 请求
- 避免触发限流

## 修改内容

### 1. TronService 改进
- ✅ 保存 API Key 到实例变量
- ✅ 备用节点也使用 API Key
- ✅ 显示 API Key 前 10 位（调试用）
- ✅ 未配置时显示警告

### 2. 重新初始化逻辑
- ✅ 清除旧实例
- ✅ 清除旧 API Key
- ✅ 重新加载配置
- ✅ 错误不阻止保存

### 3. 测试脚本
- ✅ 测试不带 API Key
- ✅ 测试带 API Key
- ✅ 测试连续请求（检查限流）

## 下一步

1. **运行测试脚本**
   ```bash
   node server/scripts/testApiKey.js
   ```

2. **查看后端日志**
   - 应该看到：`✅ 使用 TronGrid API Key: a1b2c3d4e5...`
   - 不应该看到：`⚠️  未配置 API Key`

3. **测试前端**
   - 保存配置
   - 点击"测试连接"
   - 切换到"状态监控"标签
   - 点击"刷新"按钮

4. **验证结果**
   - ✅ API 节点显示"已连接"
   - ✅ 显示正确的 URL
   - ✅ 显示余额信息
   - ✅ 无 429 错误

## 联系支持

如果问题仍然存在：
1. 提供后端日志（最近 50 行）
2. 提供测试脚本输出
3. 提供 API Key 状态截图（隐藏完整 Key）
