# API 节点和能量租赁配置说明

## 更新内容

### 1. 链上监控 API 节点配置 - 支持自定义添加

**位置：**
- 管理后台 → 钱包配置 → 监控API配置
- 管理后台 → 支付系统 → 链上监控 API 节点配置

**新功能：**
- ✅ 支持自定义添加多个 API 节点
- ✅ 节点名称可编辑
- ✅ 支持删除节点（至少保留1个）
- ✅ 点击"添加新节点"按钮即可添加

**使用方法：**
1. 点击"添加新节点"按钮
2. 编辑节点名称（点击名称即可修改）
3. 输入 API URL 和 API Key（可选）
4. 启用节点开关
5. 保存配置

**常用节点：**
- **TronGrid**: https://api.trongrid.io
- **ZAN**: https://api.zan.top/node/v1/tron/mainnet/your_api_key
- **自定义节点**: 支持任何兼容的 TRON API 节点

---

### 2. 能量租赁 API 配置 - 支持测试和生产环境

**位置：**
- 管理后台 → 钱包配置 → 能量租赁配置

**新功能：**
- ✅ 支持手动输入 API 地址
- ✅ 快速切换生产/测试环境
- ✅ 环境说明和测试币领取指引
- ✅ 根据环境显示不同提示

**环境说明：**

#### 生产环境（正式使用）
- **网站**: https://catfee.io
- **API**: https://api.catfee.io
- **说明**: 使用真实 TRX 购买能量
- **注册**: 在 catfee.io 注册账号
- **获取 API Key**: 个人中心 → API → API 配置

#### 测试环境（开发调试）
- **网站**: https://nile.catfee.io
- **API**: https://nile.catfee.io
- **说明**: 使用测试币，适合开发调试
- **注册**: 在 nile.catfee.io 注册账号（与生产环境账号不互通）
- **领取测试币**: https://nileex.io/join/getJoinPage（每天最多 2000 TRX）
- **获取 API Key**: 个人中心 → API → API 配置

**使用方法：**
1. 选择环境：点击"生产环境"或"测试环境"按钮快速切换
2. 或手动输入自定义 API 地址
3. 输入 API Key（格式: `api_key:api_secret`）
4. 配置能量数量和租赁时长
5. 保存配置

**API Key 格式：**
```
api_key:api_secret
```
例如：
```
abc123def456:xyz789uvw012
```

---

## 配置示例

### 示例 1：生产环境配置

```
CatFee API 环境: 🌐 生产环境
CatFee API URL: https://api.catfee.io
CatFee API Key: your_production_key:your_production_secret
首次转账能量: 131000
正常转账能量: 65000
租赁时长: 1 小时
```

### 示例 2：测试环境配置

```
CatFee API 环境: 🧪 测试环境 (Nile)
CatFee API URL: https://nile.catfee.io
CatFee API Key: your_test_key:your_test_secret
首次转账能量: 131000
正常转账能量: 65000
租赁时长: 1 小时
```

---

## 注意事项

### API 节点配置
1. **至少启用一个节点**：系统需要至少一个启用的节点才能正常工作
2. **多节点策略**：系统按顺序尝试连接，失败时自动切换到下一个
3. **建议配置**：至少启用 2 个节点以提高可用性
4. **节点删除**：至少保留 1 个节点，无法删除最后一个

### 能量租赁配置
1. **环境隔离**：生产和测试环境的账号、API Key 不互通
2. **测试币领取**：测试环境需要先领取测试币才能使用
3. **API Key 格式**：必须是 `api_key:api_secret` 格式，用冒号分隔
4. **开发建议**：开发时使用测试环境，上线前切换到生产环境

---

## 相关文档

- [CatFee API 文档](https://docs.catfee.io/getting-started/buy-energy-via-api-on-catfee/api-overview)
- [CatFee 生产环境](https://catfee.io)
- [CatFee 测试环境](https://nile.catfee.io)
- [Nile 测试币领取](https://nileex.io/join/getJoinPage)
- [TronGrid API](https://www.trongrid.io/)
- [ZAN API](https://zan.top/cn)

---

## 更新日期

2026-02-03
