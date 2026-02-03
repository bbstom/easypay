# CatFee API 配置更新说明

## 🔄 更新内容

### 问题
之前的后台界面只有一个输入框，用户不清楚需要输入 API Key 和 API Secret 两个值。

### 解决方案
将一个输入框拆分为两个独立的输入框：
- **API Key** 输入框
- **API Secret** 输入框

系统会自动将两个值用冒号（`:`）连接保存到数据库。

## 📝 新的配置界面

### 位置
- **支付系统** → 能量租赁 → CatFee API 购买
- **钱包配置** → 能量租赁配置 → CatFee API 购买

### 界面说明

```
┌─────────────────────────────────────────────┐
│ 🔑 获取 API 凭证：                          │
│ 1. 登录 CatFee 后台                         │
│ 2. 进入【个人中心】→【API】→【API 配置】   │
│ 3. 复制 API Key 和 API Secret 两个值       │
│ 4. 分别粘贴到下方输入框                    │
└─────────────────────────────────────────────┘

API Key *
┌─────────────────────────────────────────────┐
│ 40e7c486-c18e-40d4-9502-35423dcdb70e        │
└─────────────────────────────────────────────┘
在 CatFee 后台【API 配置】页面复制 API Key

API Secret *
┌─────────────────────────────────────────────┐
│ a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6        │
└─────────────────────────────────────────────┘
在 CatFee 后台【API 配置】页面复制 API Secret

✅ API 凭证已配置完整
```

## 🎯 如何配置

### 步骤 1：登录 CatFee 后台

**测试环境：**
- 网址：https://nile.catfee.io
- 用途：开发测试，使用测试币

**生产环境：**
- 网址：https://catfee.io
- 用途：正式使用，使用真实 TRX

### 步骤 2：获取 API 凭证

1. 登录后，点击右上角头像
2. 选择【个人中心】
3. 左侧菜单选择【API】
4. 点击【API 配置】
5. 你会看到两个值：
   - **API Key**: 类似 `40e7c486-c18e-40d4-9502-35423dcdb70e`
   - **API Secret**: 类似 `a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6`

### 步骤 3：在系统后台配置

1. 登录系统管理后台
2. 进入【支付系统】→【能量租赁】
3. 选择【CatFee API（推荐）】模式
4. 选择对应的环境（生产/测试）
5. 分别复制粘贴 **API Key** 和 **API Secret**
6. 点击保存

### 步骤 4：测试配置

运行测试脚本验证配置：

```bash
cd /www/wwwroot/kk.vpno.eu.org/easypay
node server/scripts/testCatfeeApi.js
```

## ✅ 配置验证

### 查看当前配置

```bash
node server/scripts/showCatfeeConfig.js
```

**成功输出示例：**
```
=== CatFee API 配置信息 ===

API URL: https://nile.catfee.io
API Key: 40e7c486-c18e-40d4-9502-35423dcdb70e:a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6

--- API Key 分析 ---
长度: 73
包含冒号: 是

✅ 格式正确！
API Key: 40e7c486...b70e
API Secret: a1b2c3d4...o5p6
```

## 🔧 数据存储格式

虽然界面上分为两个输入框，但数据库中仍然以一个字段存储，格式为：

```
api_key:api_secret
```

例如：
```
40e7c486-c18e-40d4-9502-35423dcdb70e:a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6
```

## 📊 状态提示

### 配置完整
```
✅ API 凭证已配置完整
```
表示 API Key 和 API Secret 都已配置。

### 配置不完整
```
⚠️ 请同时配置 API Key 和 API Secret
```
表示只配置了其中一个，需要补充另一个。

## 🚨 常见问题

### Q1: 我只看到一个 API Key，没有 API Secret？

**A:** 在 CatFee 后台的【API 配置】页面，应该有两个值：
- **API Key**（第一个值）
- **API Secret**（第二个值）

如果只看到一个，可能是：
1. 页面没有完全加载，刷新试试
2. 需要先创建 API Key（点击"创建"或"生成"按钮）
3. 联系 CatFee 客服确认

### Q2: 配置后测试失败？

**A:** 运行诊断脚本：
```bash
node server/scripts/showCatfeeConfig.js
```

检查：
- [ ] API Key 和 API Secret 是否都已配置
- [ ] 格式是否正确（包含冒号）
- [ ] 环境是否匹配（测试环境的 Key 不能用于生产环境）
- [ ] 网络是否可以访问 CatFee API

### Q3: 如何切换环境？

**A:** 
1. 在后台点击对应的环境按钮（生产/测试）
2. 重新配置对应环境的 API Key 和 Secret
3. 保存配置

**注意：** 生产环境和测试环境的 API Key 不互通！

## 📚 相关文档

- [CatFee API 文档](https://docs.catfee.io/getting-started/buy-energy-via-api-on-catfee/api-overview)
- [CatFee_API测试指南.md](./CatFee_API测试指南.md)
- [API节点和能量租赁配置说明.md](./API节点和能量租赁配置说明.md)

---

**更新日期：** 2026-02-03
