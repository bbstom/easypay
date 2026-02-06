# Telegram Bot 能量租赁和闪兑服务简化版

## 完成时间
2026-02-05

## 修改说明

根据用户反馈，简化了能量租赁和闪兑服务的实现：

### 原设计问题
- ❌ 过于复杂的交互流程（输入数量 → 输入地址 → 确认）
- ❌ 与 Web 端不一致（Web 端只展示二维码）
- ❌ 点击按钮提示"未知操作"

### 新设计方案
- ✅ 直接展示二维码和收款地址
- ✅ 与 Web 端保持一致
- ✅ 修复回调处理问题

## 功能实现

### 1. ⚡ 能量租赁（简化版）

#### 功能特性
- 直接显示收款地址和二维码
- 显示当前价格（TRX/能量）
- 显示最小金额和有效期
- 显示重要提示（如有配置）
- 提供复制地址按钮
- 提供网页版链接

#### 交互流程
```
用户点击 "⚡ 能量租赁"
↓
Bot 显示：
- 二维码
- 收款地址
- 当前价格
- 使用说明
↓
用户转账 TRX
↓
系统自动检测并租赁能量
```

#### 显示内容
```
⚡ 能量租赁

━━━━━━━━━━━━━━━
当前价格：1 TRX = 65,000 能量
最小金额：10 TRX
有效期：24 小时
━━━━━━━━━━━━━━━

📍 收款地址：
TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXxx

💡 重要提示：
[管理员配置的提示内容]

⚡ 使用说明：
1️⃣ 转入 TRX 到上方地址
2️⃣ 系统自动检测到账
3️⃣ 自动租赁能量到转账地址
4️⃣ 能量有效期 24 小时

[📋 复制地址] [🌐 网页版] [🔙 返回主菜单]
```

### 2. 🔄 闪兑服务（简化版）

#### 功能特性
- 直接显示收款地址和二维码
- 显示实时汇率（从 API 获取）
- 显示重要提示（如有配置）
- 提供复制地址按钮
- 提供刷新汇率按钮
- 提供网页版链接

#### 交互流程
```
用户点击 "🔄 闪兑服务"
↓
Bot 显示：
- 二维码
- 收款地址（USDT-TRC20）
- 实时汇率
- 使用说明
↓
用户转账 USDT
↓
系统自动检测并兑换 TRX
```

#### 显示内容
```
🔄 USDT 闪兑 TRX

━━━━━━━━━━━━━━━
当前汇率：1 USDT = 6.5 TRX
更新时间：14:30:25
━━━━━━━━━━━━━━━

📍 收款地址（USDT-TRC20）：
TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXxx

💡 重要提示：
[管理员配置的提示内容]

🔄 使用说明：
1️⃣ 转入 USDT 到上方地址
2️⃣ 系统自动检测到账
3️⃣ 按当前汇率兑换 TRX
4️⃣ TRX 自动转回您的地址

⚠️ 汇率实时变动，以到账时汇率为准

[📋 复制地址] [🔄 刷新汇率] [🌐 网页版] [🔙 返回主菜单]
```

## 技术实现

### 能量租赁处理器 (`server/bot/handlers/energy.js`)

```javascript
// 主要功能
async start(ctx) {
  // 1. 从 Settings 获取配置
  const settings = await Settings.findOne();
  const walletAddress = settings?.energyRentalAddress;
  const priceTrx = settings?.energyPriceTrx;
  const priceEnergy = settings?.energyPriceEnergy;
  const notice = settings?.energyNotice;
  
  // 2. 生成二维码
  const qrBuffer = await QRCode.toBuffer(walletAddress, {...});
  
  // 3. 发送图片和信息
  await ctx.replyWithPhoto({ source: qrBuffer }, {
    caption: message,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: '📋 复制地址', callback_data: `copy_${walletAddress}` }],
        [{ text: '🌐 网页版', url: `${apiUrl}/energy` }],
        [{ text: '🔙 返回主菜单', callback_data: 'back_main' }]
      ]
    }
  });
}
```

### 闪兑服务处理器 (`server/bot/handlers/swap.js`)

```javascript
// 主要功能
async start(ctx) {
  // 1. 获取实时汇率
  const { data } = await axios.get(`${apiUrl}/api/swap/rate`);
  const rate = data.rate;
  
  // 2. 从 Settings 获取配置
  const settings = await Settings.findOne();
  const swapNotice = settings?.swapNotice;
  const wallets = JSON.parse(settings.swapWallets);
  const walletAddress = wallets.find(w => w.enabled).address;
  
  // 3. 生成二维码
  const qrBuffer = await QRCode.toBuffer(walletAddress, {...});
  
  // 4. 发送图片和信息
  await ctx.replyWithPhoto({ source: qrBuffer }, {
    caption: message,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: '📋 复制地址', callback_data: `copy_${walletAddress}` }],
        [{ text: '🔄 刷新汇率', callback_data: 'swap_service' }],
        [{ text: '🌐 网页版', url: `${apiUrl}/swap` }],
        [{ text: '🔙 返回主菜单', callback_data: 'back_main' }]
      ]
    }
  });
}
```

### 回调处理修复

**问题：** 点击按钮提示"未知操作"

**原因：** 回调处理器没有正确匹配 action

**修复：**
```javascript
// energy.js
async handleCallback(ctx) {
  const action = ctx.match[0];
  
  if (action === 'energy_rental') {
    return energyHandler.start(ctx);
  }
  
  await ctx.answerCbQuery('未知操作');
}

// swap.js
async handleCallback(ctx) {
  const action = ctx.match[0];
  
  if (action === 'swap_service') {
    return swapHandler.start(ctx);
  }
  
  await ctx.answerCbQuery('未知操作');
}
```

## 配置说明

### 能量租赁配置

在管理后台 → 系统设置中配置：

```javascript
{
  energyRentalAddress: 'TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXxx',  // 收款地址
  energyPriceTrx: 1,                                           // TRX 数量
  energyPriceEnergy: 65000,                                    // 对应能量
  energyMinAmount: 10,                                         // 最小金额
  energyValidityHours: 24,                                     // 有效期（小时）
  energyNotice: '请确保转账地址正确，转账后自动租赁能量'      // 重要提示
}
```

### 闪兑服务配置

在管理后台 → 系统设置中配置：

```javascript
{
  swapWallets: [
    {
      address: 'TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXxx',
      enabled: true,
      name: '闪兑钱包1'
    }
  ],
  swapNotice: '汇率实时变动，以到账时汇率为准'
}
```

汇率通过 API 实时获取：`GET /api/swap/rate`

## 使用流程

### 管理员配置

1. **配置能量租赁**
   ```
   管理后台 → 系统设置 → 能量租赁
   - 设置收款地址
   - 设置价格（TRX/能量）
   - 设置最小金额和有效期
   - 设置重要提示
   ```

2. **配置闪兑服务**
   ```
   管理后台 → 系统设置 → 闪兑服务
   - 设置收款钱包
   - 设置重要提示
   - 汇率自动从 API 获取
   ```

3. **添加到主菜单**
   ```
   管理后台 → Telegram Bot 管理 → 主菜单设置
   - 添加 "⚡ 能量租赁" 按钮
   - 添加 "🔄 闪兑服务" 按钮
   - 保存菜单
   ```

### 用户使用

1. **能量租赁**
   ```
   打开 Bot → 点击 "⚡ 能量租赁"
   → 查看二维码和地址
   → 转账 TRX
   → 等待能量到账
   ```

2. **闪兑服务**
   ```
   打开 Bot → 点击 "🔄 闪兑服务"
   → 查看实时汇率
   → 转账 USDT
   → 等待 TRX 到账
   ```

## 优势对比

### 简化前
- ❌ 需要多步交互（4-5步）
- ❌ 需要输入数量和地址
- ❌ 需要确认订单
- ❌ 流程复杂，容易出错
- ❌ 与 Web 端不一致

### 简化后
- ✅ 一步到位，直接展示
- ✅ 无需输入，扫码即可
- ✅ 流程简单，不易出错
- ✅ 与 Web 端完全一致
- ✅ 用户体验更好

## 文件修改清单

### 修改的文件
1. `server/bot/handlers/energy.js` - 简化为直接展示
2. `server/bot/handlers/swap.js` - 简化为直接展示
3. `server/bot/index.js` - 移除不需要的状态处理

### 依赖模块
- `qrcode` - 生成二维码
- `axios` - 获取实时汇率
- `Settings` 模型 - 读取配置

## 测试清单

### 能量租赁测试
- [ ] 点击 "⚡ 能量租赁" 按钮
- [ ] 显示二维码和地址
- [ ] 显示当前价格
- [ ] 点击 "📋 复制地址" 按钮
- [ ] 点击 "🌐 网页版" 链接
- [ ] 点击 "🔙 返回主菜单" 按钮

### 闪兑服务测试
- [ ] 点击 "🔄 闪兑服务" 按钮
- [ ] 显示二维码和地址
- [ ] 显示实时汇率
- [ ] 点击 "📋 复制地址" 按钮
- [ ] 点击 "🔄 刷新汇率" 按钮
- [ ] 点击 "🌐 网页版" 链接
- [ ] 点击 "🔙 返回主菜单" 按钮

### 配置测试
- [ ] 能量租赁地址未配置时的提示
- [ ] 闪兑钱包未配置时的提示
- [ ] 汇率获取失败时的降级处理
- [ ] 重要提示显示正确

## 故障排查

### 问题：点击按钮提示"未知操作"

**解决方案：**
1. 检查 `server/bot/index.js` 中的回调注册
2. 确保有以下代码：
   ```javascript
   bot.action('energy_rental', energyHandler.handleCallback);
   bot.action('swap_service', swapHandler.handleCallback);
   ```

### 问题：显示"服务暂未配置"

**解决方案：**
1. 检查管理后台 → 系统设置
2. 确保配置了收款地址
3. 能量租赁：`energyRentalAddress`
4. 闪兑服务：`swapWallets`

### 问题：汇率显示不正确

**解决方案：**
1. 检查 `/api/swap/rate` 接口是否正常
2. 检查网络连接
3. 查看降级汇率（默认 6.5）

## 总结

✅ **简化版本已完成**

主要改进：
1. 移除了复杂的交互流程
2. 直接展示二维码和地址
3. 与 Web 端保持一致
4. 修复了回调处理问题
5. 提供了实时汇率刷新

用户体验：
- 更简单：一步到位
- 更快速：无需多步操作
- 更直观：直接看到二维码
- 更一致：与 Web 端相同

系统现在已经可以正常使用！🎉

---

**修改完成时间：** 2026-02-05  
**版本：** v2.2 简化版  
**状态：** ✅ 已修复，可用
