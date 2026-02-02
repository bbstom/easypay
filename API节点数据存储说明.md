# API 节点数据存储说明

## 存储位置

API 节点配置数据存储在 **MongoDB 数据库**中。

### 数据库信息

- **数据库名**: `easypay`（或 `.env` 中配置的数据库）
- **集合名**: `settings`
- **字段名**: `tronApiNodes`
- **数据类型**: `String`（JSON 字符串格式）

### 数据结构

```javascript
{
  "_id": ObjectId("..."),
  "tronApiNodes": "[{\"name\":\"TronGrid\",\"url\":\"https://api.trongrid.io\",\"apiKey\":\"xxx\",\"enabled\":true}...]",
  "tronWalletAddress": "...",
  "tronPrivateKeyEncrypted": "...",
  "updatedAt": ISODate("2025-01-30T...")
}
```

### JSON 格式

`tronApiNodes` 字段存储的是 JSON 字符串，解析后的结构：

```json
[
  {
    "name": "TronGrid",
    "url": "https://api.trongrid.io",
    "apiKey": "your_api_key_here",
    "enabled": true
  },
  {
    "name": "ZAN",
    "url": "https://api.zan.top/node/v1/tron/mainnet/xxx",
    "apiKey": "",
    "enabled": true
  },
  {
    "name": "TronStack",
    "url": "https://api.tronstack.io",
    "apiKey": "",
    "enabled": false
  }
]
```

## 数据流程

### 1. 保存配置

```
用户在前端配置
    ↓
POST /api/wallet/config
    ↓
server/routes/wallet.js
    ↓
JSON.stringify(tronApiNodes)  // 转换为字符串
    ↓
settings.tronApiNodes = "..."  // 保存到数据库
    ↓
await settings.save()
    ↓
TronService 重新初始化
```

**代码示例**：
```javascript
// server/routes/wallet.js
router.put('/config', async (req, res) => {
  const { tronApiNodes } = req.body;
  
  // 转换为 JSON 字符串存储
  settings.tronApiNodes = JSON.stringify(tronApiNodes);
  await settings.save();
  
  // 重新初始化 TronService
  await tronService.initialize();
});
```

### 2. 读取配置

```
系统启动 / API 请求
    ↓
TronService.initialize()
    ↓
Settings.findOne()  // 从数据库读取
    ↓
JSON.parse(settings.tronApiNodes)  // 解析字符串
    ↓
this.apiNodes = [...]  // 加载到内存
    ↓
过滤启用的节点
    ↓
按顺序尝试连接
```

**代码示例**：
```javascript
// server/services/tronService.js
async initialize() {
  // 从数据库读取
  const settings = await Settings.findOne();
  
  // 解析 JSON 字符串
  const nodes = JSON.parse(settings.tronApiNodes);
  
  // 过滤启用的节点
  this.apiNodes = nodes.filter(node => node.enabled && node.url);
  
  // 尝试连接
  await this.connectToNode(0, privateKey);
}
```

### 3. 运行时使用

```
API 调用
    ↓
使用 this.tronWeb (已连接的节点)
    ↓
如果失败，切换到下一个节点
    ↓
重新连接并使用新节点
```

## 查看数据库配置

### 方法 1: 使用脚本

```bash
# 查看当前配置
node server/scripts/viewApiNodes.js

# 重置为默认配置
node server/scripts/resetApiNodes.js

# 测试所有节点
node server/scripts/testApiNodes.js
```

### 方法 2: MongoDB 命令

```bash
# 连接数据库
mongo

# 切换到数据库
use easypay

# 查看配置
db.settings.findOne({}, { tronApiNodes: 1 })

# 格式化显示
db.settings.findOne({}, { tronApiNodes: 1 }).tronApiNodes
```

### 方法 3: 管理后台

```
登录管理后台
    ↓
钱包配置
    ↓
基础配置
    ↓
链上监控 API 节点配置
```

## 配置修改

### 通过管理后台（推荐）

1. 登录管理后台
2. 进入"钱包配置" → "基础配置"
3. 修改节点配置
4. 点击"保存配置"

### 通过脚本

```javascript
// 自定义脚本示例
const mongoose = require('mongoose');
const Settings = require('./server/models/Settings');

async function updateNodes() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const settings = await Settings.findOne();
  
  // 修改配置
  settings.tronApiNodes = JSON.stringify([
    { name: 'TronGrid', url: 'https://api.trongrid.io', apiKey: 'xxx', enabled: true },
    { name: 'ZAN', url: '', apiKey: '', enabled: false },
    { name: 'TronStack', url: 'https://api.tronstack.io', apiKey: '', enabled: false }
  ]);
  
  await settings.save();
  console.log('✅ 配置已更新');
  
  await mongoose.disconnect();
}
```

### 通过 API

```bash
# 使用 curl 或 Postman
curl -X PUT http://localhost:3000/api/wallet/config \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "tronApiNodes": [
      {"name":"TronGrid","url":"https://api.trongrid.io","apiKey":"xxx","enabled":true}
    ]
  }'
```

## 数据安全

### 1. API Key 存储

- API Key 以**明文**形式存储在数据库中
- 建议：
  - 使用数据库访问控制
  - 限制数据库访问权限
  - 定期更换 API Key

### 2. 私钥存储

- 私钥使用 **AES-256-GCM 加密**后存储
- 字段：`tronPrivateKeyEncrypted`
- 只有服务器可以解密

### 3. 数据库安全

```javascript
// .env 配置
MONGODB_URI=mongodb://username:password@localhost:27017/easypay
MASTER_KEY=your_encryption_master_key
```

## 默认配置

系统首次启动时的默认配置：

```json
[
  {
    "name": "TronGrid",
    "url": "https://api.trongrid.io",
    "apiKey": "",
    "enabled": false
  },
  {
    "name": "ZAN",
    "url": "",
    "apiKey": "",
    "enabled": false
  },
  {
    "name": "TronStack",
    "url": "https://api.tronstack.io",
    "apiKey": "",
    "enabled": false
  }
]
```

**注意**：所有节点默认为**禁用**状态，需要手动配置并启用。

## 常见问题

### Q1: 为什么使用 JSON 字符串而不是对象？

**A**: MongoDB 的 Mongoose 模型中，复杂对象需要定义 Schema。使用 JSON 字符串更灵活：
- 易于修改结构
- 不需要迁移数据库
- 兼容性更好

### Q2: 配置保存后何时生效？

**A**: 立即生效。保存配置后会调用 `tronService.initialize()` 重新初始化。

### Q3: 如何备份配置？

**A**: 
```bash
# 导出配置
mongoexport --db easypay --collection settings --out settings_backup.json

# 导入配置
mongoimport --db easypay --collection settings --file settings_backup.json
```

### Q4: 配置丢失怎么办？

**A**: 运行重置脚本恢复默认配置：
```bash
node server/scripts/resetApiNodes.js
```

## 相关文件

- `server/models/Settings.js` - 数据库模型定义
- `server/services/tronService.js` - 节点管理服务
- `server/routes/wallet.js` - 配置 API 路由
- `server/scripts/viewApiNodes.js` - 查看配置脚本
- `server/scripts/resetApiNodes.js` - 重置配置脚本
- `server/scripts/testApiNodes.js` - 测试节点脚本

## 总结

- ✅ 配置存储在 MongoDB 数据库
- ✅ 使用 JSON 字符串格式
- ✅ 支持动态修改和重新加载
- ✅ 提供多种查看和修改方式
- ✅ 默认所有节点禁用，需手动配置
