# API 节点简化完成报告

## 修改时间
2025-01-30

## 修改内容

根据用户要求，将 API 节点配置简化为只支持 **TronGrid** 和 **ZAN** 两个节点，删除所有 TronStack 相关代码。

## 修改原因

1. **TronScan 不兼容**: TronScan API 是区块链浏览器 API，不是 TronWeb 兼容的全节点
2. **简化配置**: 用户只需要 TronGrid（官方）和 ZAN（企业级）两个节点
3. **减少维护**: 减少不必要的第三方节点依赖

## 修改的文件

### 1. 数据库模型
**文件**: `server/models/Settings.js`

```javascript
// 修改前：3 个节点
tronApiNodes: JSON.stringify([
  { name: 'TronGrid', url: 'https://api.trongrid.io', apiKey: '', enabled: false },
  { name: 'ZAN', url: '', apiKey: '', enabled: false },
  { name: 'TronStack', url: 'https://api.tronstack.io', apiKey: '', enabled: false }
])

// 修改后：2 个节点
tronApiNodes: JSON.stringify([
  { name: 'TronGrid', url: 'https://api.trongrid.io', apiKey: '', enabled: false },
  { name: 'ZAN', url: '', apiKey: '', enabled: false }
])
```

### 2. 前端配置页面
**文件**: `src/pages/WalletConfigPage.jsx`

**修改内容**:
- 删除 TronStack 节点的初始化配置
- 删除 TronStack 的官网链接
- 简化 placeholder 逻辑（只判断 TronGrid 和 ZAN）

### 3. 重置脚本
**文件**: `server/scripts/resetApiNodes.js`

更新默认配置为 2 个节点。

### 4. 文档更新
**文件**: `链上监控API节点配置说明.md`

**修改内容**:
- 删除 TronStack 节点说明
- 更新配置示例（只保留 2 个节点）
- 更新日志输出示例
- 更新最佳实践建议
- 删除 TronStack 官网链接

### 5. 策略文档
**文件**: `多节点数据处理策略.md`

**修改内容**:
- 更新示例为 2 个节点
- 更新初始化流程代码示例

### 6. 删除文件
- ❌ `server/scripts/testTronStack.js` - 删除 TronStack 测试脚本

## 当前支持的节点

### 1. TronGrid（官方推荐）
- **URL**: `https://api.trongrid.io`
- **API Key**: 从 https://www.trongrid.io/ 获取
- **特点**: 官方节点，稳定可靠
- **免费额度**: 5 次/秒，注册后 100 次/秒

### 2. ZAN（企业级推荐）
- **URL**: `https://api.zan.top/node/v1/tron/mainnet/{your_api_key}`
- **API Key**: 从 https://zan.top/cn 获取
- **特点**: 企业级服务，高性能
- **重要**: API Key 直接放在 URL 中，不要保留花括号 `{}`

## 节点切换逻辑

```
初始化
  ↓
尝试连接 TronGrid
  ↓
成功 → 使用 TronGrid
  ↓
失败 → 尝试连接 ZAN
  ↓
成功 → 使用 ZAN
  ↓
失败 → 抛出错误
```

## 配置建议

### 生产环境（推荐）
```json
[
  {
    "name": "TronGrid",
    "url": "https://api.trongrid.io",
    "apiKey": "your_trongrid_api_key",
    "enabled": true
  },
  {
    "name": "ZAN",
    "url": "https://api.zan.top/node/v1/tron/mainnet/your_zan_api_key",
    "apiKey": "",
    "enabled": true
  }
]
```

### 测试环境（最简）
```json
[
  {
    "name": "TronGrid",
    "url": "https://api.trongrid.io",
    "apiKey": "your_trongrid_api_key",
    "enabled": true
  },
  {
    "name": "ZAN",
    "url": "",
    "apiKey": "",
    "enabled": false
  }
]
```

## 重要提示

### ZAN 节点配置注意事项

❌ **错误配置**（保留花括号）:
```
https://api.zan.top/node/v1/tron/mainnet/{e0510893dfeb4a849f732e9d9bb78039}
```

✅ **正确配置**（直接替换）:
```
https://api.zan.top/node/v1/tron/mainnet/e0510893dfeb4a849f732e9d9bb78039
```

### 数据库重置

运行以下命令重置节点配置：
```bash
node server/scripts/resetApiNodes.js
```

输出示例：
```
✅ 数据库连接成功

📋 当前节点配置:
   1. TronGrid: https://api.trongrid.io - ✗ 禁用
   2. ZAN: (未配置) - ✗ 禁用

🔄 重置为默认配置（所有节点禁用）...
✅ 节点配置已重置
```

## 用户需要做的

1. **重新配置节点**（如果之前配置了 TronStack）:
   - 进入管理后台 → 钱包配置 → 基础配置
   - 配置 TronGrid 或 ZAN 节点
   - 启用至少一个节点
   - 保存配置

2. **修复 ZAN URL**（如果有配置）:
   - 检查 ZAN 的 URL 是否包含花括号 `{}`
   - 如果有，去掉花括号，直接使用 API Key

3. **测试连接**:
   - 点击"测试连接"按钮
   - 确认节点可以正常工作

## 优势

✅ **简化配置**: 只需要配置 2 个节点
✅ **官方支持**: TronGrid 是官方节点
✅ **企业级备份**: ZAN 提供高性能备份
✅ **减少维护**: 不依赖第三方节点
✅ **清晰明确**: 配置选项更少，更容易理解

## 相关文件

### 代码文件
- `server/models/Settings.js` - 数据库模型
- `src/pages/WalletConfigPage.jsx` - 前端配置页面
- `server/scripts/resetApiNodes.js` - 重置脚本

### 文档文件
- `链上监控API节点配置说明.md` - 配置指南
- `多节点数据处理策略.md` - 策略说明
- `API节点简化完成.md` - 本文档

## 参考链接

- [TronGrid 官网](https://www.trongrid.io/)
- [ZAN 官网](https://zan.top/cn)
- [TRON 开发文档](https://developers.tron.network/)

## 总结

✅ **已完成**:
- 删除所有 TronStack 相关代码
- 更新数据库模型为 2 个节点
- 更新前端配置界面
- 更新所有相关文档
- 删除 TronStack 测试脚本

⚠️ **需要用户操作**:
- 重新配置 API 节点（如果之前配置了 TronStack）
- 修复 ZAN URL（去掉花括号）
- 测试节点连接

🎯 **改进效果**:
- 配置更简单
- 维护更容易
- 只使用官方和企业级节点
- 减少不必要的依赖
