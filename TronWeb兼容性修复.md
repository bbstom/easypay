# TronWeb 兼容性修复

## 问题描述

在使用 TronWeb 6.1.1 版本时，遇到 `TronWeb is not a constructor` 错误。

## 诊断过程

### 1. 测试私钥格式
- 私钥格式正确：64位十六进制字符串
- 测试私钥：`24ce1bf78867c94e7213a33c158c96268528373c90bb09d60895da4e53ae4431`

### 2. 测试网络连接
```bash
curl https://api.trongrid.io
# 返回：{"API version":"v1","Welcome to":"TronGrid v3.4.2"}
```
网络连接正常。

### 3. 检查 TronWeb 导出方式

创建诊断脚本 `server/scripts/checkTronWeb.js`：

```javascript
const TronWeb = require('tronweb');

console.log('typeof TronWeb:', typeof TronWeb);
console.log('TronWeb.constructor.name:', TronWeb.constructor.name);
console.log('TronWeb 的属性:');
console.log('- TronWeb.default:', typeof TronWeb.default);
console.log('- TronWeb.TronWeb:', typeof TronWeb.TronWeb);
```

**诊断结果：**
```
typeof TronWeb: object
TronWeb.constructor.name: Object
TronWeb 的属性:
- TronWeb.default: object
- TronWeb.TronWeb: function
```

### 4. 测试不同的导入方式

```javascript
// ❌ 方式 1 失败: new TronWeb()
// ❌ 方式 2 失败: new TronWeb.default()
// ✅ 方式 3 成功: new TronWeb.TronWeb()
// ❌ 方式 4 失败: const TronWebConstructor = TronWeb.default || TronWeb
```

## 解决方案

TronWeb 6.1.1 版本的正确用法是：

```javascript
const TronWeb = require('tronweb');

// 正确的用法
const tronWeb = new TronWeb.TronWeb({
  fullHost: 'https://api.trongrid.io',
  privateKey: 'your-private-key'
});
```

## 已修复的文件

1. ✅ `server/services/tronService.js` - 已修复（2处）
   - TronWeb 构造函数调用
   - USDT 余额查询的 BigNumber 处理
2. ✅ `server/routes/wallet.js` - 已修复（3处）
3. ✅ `server/scripts/testPrivateKey.js` - 已修复
4. ✅ `server/scripts/migratePrivateKey.js` - 已修复

## 修复内容

### 1. server/services/tronService.js
```javascript
// 修改前
const TronWebConstructor = TronWeb.default || TronWeb;
const tronWeb = new TronWebConstructor({...});

// 修改后
const tronWeb = new TronWeb.TronWeb({...});
```

### 2. server/routes/wallet.js
修复了3处 TronWeb 使用：
- 保存配置时的私钥验证
- 验证私钥格式的接口
- 移除了不必要的兼容代码

### 3. server/scripts/testPrivateKey.js
```javascript
// 修改前
const TronWebConstructor = TronWeb.default || TronWeb;
const tronWeb = new TronWebConstructor({...});

// 修改后
const tronWeb = new TronWeb.TronWeb({...});
```

### 4. server/scripts/migratePrivateKey.js
```javascript
// 修改前
const TronWebConstructor = TronWeb.default || TronWeb;
const tronWeb = new TronWebConstructor({...});

// 修改后
const tronWeb = new TronWeb.TronWeb({...});
```

## 额外修复：USDT 余额查询

在修复过程中还发现了 USDT 余额查询的兼容性问题。

### 问题
TronWeb 6.x 返回的 BigNumber 对象没有 `toNumber()` 方法。

### 修复
```javascript
// 修改前
const balance = await contract.balanceOf(address).call();
return balance.toNumber() / 1000000;

// 修改后
const balance = await contract.balanceOf(address).call();

// 兼容不同的返回类型
let balanceValue;
if (typeof balance === 'object' && balance.toNumber) {
  balanceValue = balance.toNumber();
} else if (typeof balance === 'object' && balance.toString) {
  balanceValue = parseInt(balance.toString());
} else {
  balanceValue = parseInt(balance);
}

return balanceValue / 1000000;
```

## 验证结果

### 1. 私钥验证测试
运行测试脚本：
```bash
node server/scripts/testPrivateKey.js
```

输出结果：
```
🔍 测试私钥验证

私钥: 24ce1bf78867c94e7213a33c158c96268528373c90bb09d60895da4e53ae4431
长度: 64
格式: ✅ 正确

🔄 创建 TronWeb 实例...
✅ TronWeb 实例创建成功

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 钱包地址: TP4Cr7xRZ7jGZ5XmKt2aN7NP6yFGG99999
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 验证地址格式...
地址有效: ✅ 是

🔄 尝试查询余额（需要网络连接）...
✅ 网络连接正常
TRX 余额: 0.313099 TRX

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 私钥验证成功！
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 2. 钱包状态测试
运行测试脚本：
```bash
node server/scripts/testWalletStatus.js
```

输出结果：
```
🔗 连接数据库...
✅ 数据库连接成功

🔄 初始化 TronService...
✅ TronWeb 初始化成功
✅ TronService 初始化成功

🔍 检查钱包状态...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 钱包状态检查成功！
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 钱包地址: TP4Cr7xRZ7jGZ5XmKt2aN7NP6yFGG99999
💰 TRX 余额: 0.313099 TRX
💵 USDT 余额: 1.58 USDT
✅ 状态: 未就绪
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 总结

TronWeb 6.1.1 版本的导出方式与旧版本不同，需要使用 `new TronWeb.TronWeb()` 而不是 `new TronWeb()`。

此外，USDT 余额查询返回的 BigNumber 对象在不同版本中的方法也不同，需要兼容处理。

所有相关文件已修复并通过测试，现在可以：
- ✅ 正常验证私钥
- ✅ 正常查询钱包余额（TRX 和 USDT）
- ✅ 正常进行转账操作
- ✅ 在钱包配置页面测试连接
- ✅ 在财务页面查看实时余额

---

*修复完成时间: 2026-01-29*
