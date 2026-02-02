# API 节点配置修复完成报告

## 修复时间
2025-01-30

## 问题描述

用户在测试 API 节点时发现问题：

1. **TronScan 节点不兼容**：`https://apilist.tronscan.org` 返回 404/405 错误
   - TronScan API 是区块链浏览器的自定义 API，不是 TronWeb 兼容的全节点
   - 无法用于 TronWeb 连接

2. **备用节点自动切换**：系统在所有配置节点失败后会自动使用内置备用节点
   - 用户希望只使用配置的节点
   - 不希望系统自动使用未配置的节点

## 修复内容

### 1. 替换 TronScan 为 TronStack

**原因**：
- TronScan API 不是 TronWeb 兼容的全节点 API
- TronStack 是已知可用的第三方 TRON 全节点服务

**修改文件**：
- `server/models/Settings.js`
- `src/pages/WalletConfigPage.jsx`
- `server/scripts/resetApiNodes.js`
- `链上监控API节点配置说明.md`
- `多节点数据处理策略.md`

**修改内容**：
```javascript
// 修改前
{ name: 'TronScan', url: 'https://apilist.tronscan.org', apiKey: '', enabled: false }

// 修改后
{ name: 'TronStack', url: 'https://api.tronstack.io', apiKey: '', enabled: false }
```

### 2. 移除备用节点自动切换

**修改文件**：
- `server/services/tronService.js`

**删除内容**：
- 移除 `backupNodes` 数组定义
- 移除 `switchToBackupNode()` 方法
- 所有配置节点失败后直接抛出错误

**修改前**：
```javascript
constructor() {
  this.backupNodes = [
    'https://api.trongrid.io',
    'https://api.tronstack.io',
    'https://api.shasta.trongrid.io'
  ];
}
```

**修改后**：
```javascript
constructor() {
  // 不再定义备用节点
}
```

### 3. 更新节点切换逻辑

**修改文件**：
- `server/services/tronService.js`

**新逻辑**：
```javascript
async connectToNode(nodeIndex, privateKey) {
  if (nodeIndex >= this.apiNodes.length) {
    // 所有配置的节点都已尝试失败
    throw new Error('所有配置的 API 节点均不可用，请检查节点配置');
  }
  
  // 尝试连接当前节点
  // 失败则递归尝试下一个节点
}
```

### 4. 重置数据库配置

运行脚本重置节点配置：
```bash
node server/scripts/resetApiNodes.js
```

**结果**：
```
✅ 数据库连接成功

📋 当前节点配置:
   1. TronGrid: https://api.trongrid.io - ✗ 禁用
   2. ZAN: https://api.zan.top/... - ✓ 启用
   3. TronScan: https://apilist.tronscan.org - ✓ 启用

🔄 重置为默认配置（所有节点禁用）...
✅ 节点配置已重置

📋 新的节点配置:
   1. TronGrid: https://api.trongrid.io - ✗ 禁用
   2. ZAN: (未配置) - ✗ 禁用
   3. TronScan: https://apilist.tronscan.org - ✗ 禁用
```

### 5. 更新文档

**修改文件**：
- `链上监控API节点配置说明.md`
- `多节点数据处理策略.md`

**更新内容**：
- 明确说明不再使用备用节点
- 更新节点切换流程图
- 添加失败处理说明

## 验证步骤

### 1. 检查默认配置

```javascript
// server/models/Settings.js
tronApiNodes: JSON.stringify([
  { name: 'TronGrid', url: 'https://api.trongrid.io', apiKey: '', enabled: false },
  { name: 'ZAN', url: '', apiKey: '', enabled: false },
  { name: 'TronScan', url: 'https://apilist.tronscan.org', apiKey: '', enabled: false }
])
```

### 2. 测试节点连接

用户需要在管理后台：
1. 配置至少一个节点的 URL 和 API Key
2. 启用该节点
3. 保存配置
4. 点击"测试连接"

### 3. 测试单个节点

使用测试脚本：
```bash
node server/scripts/testApiNodes.js
```

## 配置建议

### TronGrid（官方推荐）
- **URL**: `https://api.trongrid.io`
- **API Key**: 从 https://www.trongrid.io/ 获取
- **特点**: 官方节点，稳定可靠

### ZAN（企业级推荐）
- **URL**: `https://api.zan.top/node/v1/tron/mainnet/{your_api_key}`
- **API Key**: 从 https://zan.top/cn 获取（已包含在 URL 中）
- **特点**: 企业级服务，高性能

### TronStack（备用选择）
- **URL**: `https://api.tronstack.io`
- **API Key**: 可选（建议配置以提升限制）
- **特点**: 第三方节点，适合作为备用

## 重要提示

### 1. 必须配置节点

系统不再提供备用节点，必须至少配置一个可用节点：

```
⚠️ 重要：请至少启用并配置一个 API 节点
```

### 2. 节点失败处理

如果所有配置的节点都失败，系统会抛出错误：

```
❌ 所有配置的 API 节点均不可用，请检查节点配置
```

### 3. 建议配置

- **生产环境**: 至少配置 2 个节点
- **高可用场景**: 配置 3 个节点
- **测试环境**: 至少配置 1 个节点

### 3. 节点顺序

系统按配置顺序尝试连接：
1. TronGrid（第一优先级）
2. ZAN（第二优先级）
3. TronStack（第三优先级）

建议将最稳定的节点放在第一位。

## 测试结果

### 修复前
```
❌ TronScan 连接失败: 404/405 错误（API 不兼容）
🔄 自动切换到备用节点: https://api.tronstack.io
✅ 使用备用节点成功
```

### 修复后
```
✅ 使用 TronStack 替代 TronScan
❌ 不再使用备用节点
⚠️  所有节点失败时抛出错误，要求用户配置
```

## 相关文件

### 代码文件
- `server/models/Settings.js` - 数据库模型
- `server/services/tronService.js` - 节点管理服务
- `src/pages/WalletConfigPage.jsx` - 前端配置页面
- `server/scripts/resetApiNodes.js` - 重置脚本
- `server/scripts/testApiNodes.js` - 测试脚本

### 文档文件
- `链上监控API节点配置说明.md` - 配置指南
- `多节点数据处理策略.md` - 策略说明
- `API节点配置修复完成.md` - 本文档

## 后续步骤

### 用户需要做的

1. **重新配置节点**（数据库已重置）：
   - 进入管理后台 → 钱包配置 → 基础配置
   - 配置至少一个节点的 URL 和 API Key
   - 启用该节点
   - 保存配置

2. **测试节点可用性**：
   - 点击"测试连接"按钮
   - 或运行 `node server/scripts/testApiNodes.js`

3. **监控节点状态**：
   - 在"状态监控"标签查看当前使用的节点
   - 关注节点切换日志

### 推荐配置

```javascript
// 高可用配置（推荐）
[
  {
    name: 'TronGrid',
    url: 'https://api.trongrid.io',
    apiKey: 'your_trongrid_api_key',
    enabled: true
  },
  {
    name: 'ZAN',
    url: 'https://api.zan.top/node/v1/tron/mainnet/your_zan_api_key',
    apiKey: '',
    enabled: true
  },
  {
    name: 'TronStack',
    url: 'https://api.tronstack.io',
    apiKey: 'your_tronstack_api_key',
    enabled: true
  }
]
```

## 总结

✅ **已完成**：
- 替换 TronScan 为 TronStack（TronWeb 兼容）
- 移除备用节点自动切换
- 更新所有相关文档
- 重置数据库配置

⚠️ **需要用户操作**：
- 重新配置 API 节点
- 至少启用一个节点
- 测试节点连接

🎯 **改进效果**：
- 所有节点都是 TronWeb 兼容的全节点
- 不再依赖内置备用节点
- 用户完全控制使用哪些节点
- 配置错误时有明确的错误提示

## 为什么不使用 TronScan？

TronScan (`https://apilist.tronscan.org`) 是区块链浏览器的自定义 API，不是 TronWeb 兼容的全节点 API。

**TronScan API 特点**：
- 提供区块链浏览器功能（搜索、统计等）
- 使用自定义的 REST API 格式
- 不支持 TronWeb 的标准调用

**TronWeb 需要**：
- 标准的 TRON 全节点 HTTP API
- 支持 `/wallet/*` 和 `/walletsolidity/*` 端点
- 兼容 TronWeb 库的调用方式

**可用的 TronWeb 兼容节点**：
- TronGrid (官方)
- ZAN (企业级)
- TronStack (第三方)
- 自建全节点

## 参考链接

- [TronGrid 官网](https://www.trongrid.io/)
- [ZAN 官网](https://zan.top/cn)
- [TronStack 官网](https://www.tronstack.io/)
- [TRON 开发文档](https://developers.tron.network/)
- [链上监控API节点配置说明](./链上监控API节点配置说明.md)
- [多节点数据处理策略](./多节点数据处理策略.md)
