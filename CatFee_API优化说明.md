# CatFee API 优化说明

## 📋 优化内容

### 问题分析

测试时发现余额查询和价格查询接口返回 404，经过分析：

1. **CatFee API 设计特点**
   - 余额和价格信息已经包含在购买订单的响应中
   - 单独的查询接口可能在测试环境不可用
   - 或者这些接口根本不存在（API 设计简化）

2. **实际响应数据**
   ```json
   {
     "code": 0,
     "data": {
       "id": "订单号",
       "pay_amount_sun": 4615000,  // 消耗金额
       "balance": 1994185000,      // 剩余余额
       "quantity": 65000,          // 能量数量
       ...
     }
   }
   ```

### 优化方案

#### 1. 购买能量函数增强

**新增返回字段：**
- `payAmount`: 支付金额（sun 单位）
- `balance`: 剩余余额（sun 单位）

**控制台输出优化：**
```
✅ CatFee: 能量购买成功
   订单号: e16ee194-987e-48ba-b83a-0556b5f01f43
   能量: 65000
   消耗: 4.615 TRX
   余额: 1994.185 TRX
```

#### 2. 余额查询函数优化

**尝试多个可能的 API 路径：**
- `/v1/account`
- `/v1/account/balance`
- `/v1/user/balance`

**失败时的友好提示：**
```
⚠️  CatFee: 余额查询接口不可用（可能测试环境不支持）
💡 提示：余额信息会在购买订单的响应中返回
```

**返回结构：**
```javascript
{
  success: false,
  error: '余额查询接口不可用',
  balance: 0,
  currency: 'TRX',
  note: '余额信息会在购买订单的响应中返回'
}
```

#### 3. 价格查询函数优化

**尝试多个可能的 API 路径：**
- `/v1/price`
- `/v1/energy/price`
- `/v1/order/price`

**失败时的友好提示：**
```
⚠️  CatFee: 价格查询接口不可用（可能测试环境不支持）
💡 提示：价格信息会在购买订单的响应中返回
```

**返回结构：**
```javascript
{
  success: false,
  error: '价格查询接口不可用',
  price: 0,
  energyAmount: 65000,
  duration: '1h',
  note: '价格信息会在购买订单的响应中返回'
}
```

---

## 🎯 使用建议

### 获取余额信息

**推荐方式：** 从购买订单的响应中获取

```javascript
const result = await catfeeService.buyEnergy(address, 65000, '1h');

// 获取余额（sun 单位）
const balanceSun = result.balance;

// 转换为 TRX
const balanceTRX = balanceSun / 1000000;

console.log(`账户余额: ${balanceTRX} TRX`);
```

**备用方式：** 尝试调用余额查询接口

```javascript
const balanceResult = await catfeeService.getBalance();

if (balanceResult.success) {
  console.log(`余额: ${balanceResult.balance} ${balanceResult.currency}`);
} else {
  console.log('余额查询不可用，请从购买订单响应中获取');
}
```

### 获取价格信息

**推荐方式：** 从购买订单的响应中计算

```javascript
const result = await catfeeService.buyEnergy(address, 65000, '1h');

// 获取支付金额（sun 单位）
const payAmountSun = result.payAmount;

// 转换为 TRX
const payAmountTRX = payAmountSun / 1000000;

// 计算单价
const pricePerEnergy = payAmountTRX / result.energyAmount;

console.log(`消耗: ${payAmountTRX} TRX`);
console.log(`单价: ${pricePerEnergy} TRX/能量`);
```

**备用方式：** 尝试调用价格查询接口

```javascript
const priceResult = await catfeeService.getPrice(65000, '1h');

if (priceResult.success) {
  console.log(`价格: ${priceResult.price} TRX`);
} else {
  console.log('价格查询不可用，请从购买订单响应中获取');
}
```

---

## 📊 数据单位说明

### Sun 单位

TRON 区块链使用 **sun** 作为最小单位：

```
1 TRX = 1,000,000 sun
```

### 转换示例

```javascript
// Sun 转 TRX
const trx = sun / 1000000;

// TRX 转 Sun
const sun = trx * 1000000;
```

### 实际数据

```
pay_amount_sun: 4615000
=> 4615000 / 1000000 = 4.615 TRX

balance: 1994185000
=> 1994185000 / 1000000 = 1994.185 TRX
```

---

## 🔧 代码示例

### 完整的购买流程

```javascript
const catfeeService = require('./services/catfeeService');

// 配置 API
catfeeService.setApiUrl('https://nile.catfee.io');
catfeeService.setApiKey('your_key:your_secret');

// 购买能量
const result = await catfeeService.buyEnergy(
  'TYourAddress...',  // 接收地址
  65000,              // 能量数量
  '1h'                // 租赁时长
);

// 获取信息
console.log('订单号:', result.orderNo);
console.log('能量:', result.energyAmount);
console.log('消耗:', (result.payAmount / 1000000).toFixed(3), 'TRX');
console.log('余额:', (result.balance / 1000000).toFixed(3), 'TRX');

// 计算单价
const unitPrice = (result.payAmount / 1000000) / result.energyAmount;
console.log('单价:', unitPrice.toFixed(6), 'TRX/能量');
```

### 监控余额

```javascript
// 方法1：从购买订单中获取（推荐）
async function getBalanceFromOrder() {
  const result = await catfeeService.buyEnergy(address, 1000, '1h');
  return result.balance / 1000000;  // 转换为 TRX
}

// 方法2：尝试查询接口（可能不可用）
async function getBalanceFromAPI() {
  const result = await catfeeService.getBalance();
  if (result.success) {
    return result.balance;
  }
  return null;  // 接口不可用
}

// 方法3：组合使用
async function getBalance() {
  // 先尝试查询接口
  const apiResult = await catfeeService.getBalance();
  if (apiResult.success) {
    return apiResult.balance;
  }
  
  // 如果接口不可用，从最近的订单中获取
  // 注意：这会创建一个小额订单
  const orderResult = await catfeeService.buyEnergy(address, 1000, '1h');
  return orderResult.balance / 1000000;
}
```

---

## ✅ 测试结果

### 优化前

```
❌ 账户余额查询失败: 404 NOT_FOUND
❌ 能量价格查询失败: 404 NOT_FOUND
✅ 能量购买成功
```

### 优化后

```
⚠️  余额查询接口不可用（可能测试环境不支持）
💡 提示：余额信息会在购买订单的响应中返回

⚠️  价格查询接口不可用（可能测试环境不支持）
💡 提示：价格信息会在购买订单的响应中返回

✅ 能量购买成功！
ℹ️  订单号: e16ee194-987e-48ba-b83a-0556b5f01f43
ℹ️  能量数量: 65000
ℹ️  消耗金额: 4.615 TRX
ℹ️  账户余额: 1994.185 TRX
```

---

## 📝 总结

### 核心改进

1. ✅ **购买订单响应增强** - 提取并显示余额和消耗信息
2. ✅ **查询接口容错** - 尝试多个路径，失败时友好提示
3. ✅ **单位转换** - 自动将 sun 转换为 TRX 显示
4. ✅ **信息完整** - 从购买订单中获取所有需要的信息

### 实用性

虽然余额和价格查询接口在测试环境不可用，但这不影响实际使用：
- ✅ 购买能量时会返回余额信息
- ✅ 购买能量时会返回消耗金额（可计算价格）
- ✅ 所有核心功能正常工作

### 建议

1. **生产环境** - 这些查询接口可能可用，但不是必需的
2. **监控余额** - 可以从每次购买订单的响应中获取
3. **价格计算** - 从实际消耗金额计算，更准确

---

**更新日期：** 2026-02-03  
**优化版本：** v2.0
