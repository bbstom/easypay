# Telegram Bot 回调问题排查指南

## 问题描述
- 后端日志：`📱 TG: callback_query - 486ms`
- 前端提示：`未知操作`

## 排查步骤

### 1. 检查日志输出

重启服务后，查看日志中是否有以下输出：
```
能量租赁回调 action: energy_rental
```
或
```
闪兑服务回调 action: swap_service
```

如果看到 `未知的能量租赁操作:` 或 `未知的闪兑操作:`，说明 action 不匹配。

### 2. 检查数据库菜单配置

连接数据库，查询主菜单配置：

```javascript
// MongoDB 查询
db.telegrammenus.findOne({ name: 'main_menu' })
```

检查按钮配置中的 `action` 字段：
```json
{
  "buttons": [
    {
      "text": "⚡ 能量租赁",
      "type": "system",
      "action": "energy_rental",  // 必须是这个值
      "enabled": true
    },
    {
      "text": "🔄 闪兑服务",
      "type": "system",
      "action": "swap_service",  // 必须是这个值
      "enabled": true
    }
  ]
}
```

### 3. 检查回调注册

查看 `server/bot/index.js` 中的回调注册：

```javascript
// 应该有这两行
this.bot.action(/^energy_/, energyHandler.handleCallback);
this.bot.action('energy_rental', energyHandler.handleCallback);

this.bot.action(/^swap_/, swapHandler.handleCallback);
this.bot.action('swap_service', swapHandler.handleCallback);
```

### 4. 测试回调处理

在 Bot 中发送 `/start` 命令，然后点击按钮，查看日志输出。

## 常见问题和解决方案

### 问题 1: action 不匹配

**症状：** 日志显示 `未知的能量租赁操作: xxx`

**原因：** 数据库中的 action 字段值不正确

**解决方案：**
1. 登录管理后台
2. 进入 Telegram Bot 管理 → 主菜单设置
3. 编辑按钮，确保：
   - 能量租赁按钮的 action 是 `energy_rental`
   - 闪兑服务按钮的 action 是 `swap_service`
4. 保存菜单

### 问题 2: 回调未注册

**症状：** 没有任何日志输出

**原因：** 回调处理器未正确注册

**解决方案：**
检查 `server/bot/index.js` 中是否有：
```javascript
this.bot.action('energy_rental', energyHandler.handleCallback);
this.bot.action('swap_service', swapHandler.handleCallback);
```

### 问题 3: 处理器导入错误

**症状：** 启动时报错或回调无响应

**原因：** 处理器未正确导入

**解决方案：**
检查 `server/bot/index.js` 顶部是否有：
```javascript
const energyHandler = require('./handlers/energy');
const swapHandler = require('./handlers/swap');
```

### 问题 4: Settings 未配置

**症状：** 显示 "服务暂未配置"

**原因：** 数据库中没有配置收款地址

**解决方案：**
1. 登录管理后台 → 系统设置
2. 配置能量租赁地址：`energyRentalAddress`
3. 配置闪兑钱包：`swapWallets`

## 手动测试脚本

创建测试脚本 `test-menu-config.js`：

```javascript
const mongoose = require('mongoose');
require('dotenv').config();

async function testMenuConfig() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 数据库连接成功');

    const TelegramMenu = require('./server/models/TelegramMenu');
    const menu = await TelegramMenu.findOne({ name: 'main_menu' });

    if (!menu) {
      console.log('❌ 未找到主菜单配置');
      return;
    }

    console.log('\n📋 主菜单配置:');
    console.log('启用状态:', menu.enabled);
    console.log('按钮数量:', menu.buttons.length);
    console.log('\n按钮列表:');
    
    menu.buttons.forEach((btn, index) => {
      console.log(`\n按钮 ${index + 1}:`);
      console.log('  文字:', btn.text);
      console.log('  类型:', btn.type);
      console.log('  动作:', btn.action);
      console.log('  启用:', btn.enabled);
      console.log('  位置:', `行${btn.row} 列${btn.col}`);
    });

    // 检查能量租赁和闪兑按钮
    const energyBtn = menu.buttons.find(b => b.action === 'energy_rental');
    const swapBtn = menu.buttons.find(b => b.action === 'swap_service');

    console.log('\n🔍 关键按钮检查:');
    console.log('能量租赁按钮:', energyBtn ? '✅ 已配置' : '❌ 未配置');
    if (energyBtn) {
      console.log('  - 文字:', energyBtn.text);
      console.log('  - 启用:', energyBtn.enabled);
    }

    console.log('闪兑服务按钮:', swapBtn ? '✅ 已配置' : '❌ 未配置');
    if (swapBtn) {
      console.log('  - 文字:', swapBtn.text);
      console.log('  - 启用:', swapBtn.enabled);
    }

    await mongoose.disconnect();
    console.log('\n✅ 测试完成');
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testMenuConfig();
```

运行测试：
```bash
node test-menu-config.js
```

## 快速修复步骤

### 方法 1: 通过管理后台修复

1. 登录管理后台
2. 进入 "Telegram Bot 管理"
3. 点击 "🎛️ 主菜单设置"
4. 点击 "+ 添加按钮" 或编辑现有按钮
5. 配置能量租赁按钮：
   - 按钮文字：`⚡ 能量租赁`
   - 类型：`系统功能`
   - 功能：选择 `energy_rental - 能量租赁 ⚡`
   - 启用：勾选
6. 配置闪兑服务按钮：
   - 按钮文字：`🔄 闪兑服务`
   - 类型：`系统功能`
   - 功能：选择 `swap_service - 闪兑服务 🔄`
   - 启用：勾选
7. 点击 "保存菜单"
8. 在 Bot 中发送 `/menu` 测试

### 方法 2: 通过数据库直接修复

连接 MongoDB，执行以下命令：

```javascript
// 查找主菜单
db.telegrammenus.findOne({ name: 'main_menu' })

// 如果不存在，创建默认菜单
db.telegrammenus.insertOne({
  name: 'main_menu',
  enabled: true,
  buttons: [
    {
      text: '💰 USDT 代付',
      type: 'system',
      action: 'payment_usdt',
      row: 0,
      col: 0,
      order: 0,
      enabled: true
    },
    {
      text: '💰 TRX 代付',
      type: 'system',
      action: 'payment_trx',
      row: 0,
      col: 1,
      order: 1,
      enabled: true
    },
    {
      text: '⚡ 能量租赁',
      type: 'system',
      action: 'energy_rental',
      row: 1,
      col: 0,
      order: 2,
      enabled: true
    },
    {
      text: '🔄 闪兑服务',
      type: 'system',
      action: 'swap_service',
      row: 1,
      col: 1,
      order: 3,
      enabled: true
    },
    {
      text: '📋 我的订单',
      type: 'system',
      action: 'orders_list',
      row: 2,
      col: 0,
      order: 4,
      enabled: true
    },
    {
      text: '💬 工单系统',
      type: 'system',
      action: 'tickets_list',
      row: 2,
      col: 1,
      order: 5,
      enabled: true
    },
    {
      text: '👤 个人中心',
      type: 'system',
      action: 'account_info',
      row: 3,
      col: 0,
      order: 6,
      enabled: true
    },
    {
      text: '❓ 帮助中心',
      type: 'system',
      action: 'help_center',
      row: 3,
      col: 1,
      order: 7,
      enabled: true
    }
  ],
  layout: 'custom',
  createdAt: new Date(),
  updatedAt: new Date()
})

// 如果已存在，更新按钮
db.telegrammenus.updateOne(
  { name: 'main_menu' },
  {
    $push: {
      buttons: {
        $each: [
          {
            text: '⚡ 能量租赁',
            type: 'system',
            action: 'energy_rental',
            row: 1,
            col: 0,
            order: 2,
            enabled: true
          },
          {
            text: '🔄 闪兑服务',
            type: 'system',
            action: 'swap_service',
            row: 1,
            col: 1,
            order: 3,
            enabled: true
          }
        ]
      }
    }
  }
)
```

## 验证修复

1. 重启 Bot 服务：
   ```bash
   pm2 restart easypay
   ```

2. 在 Telegram 中发送 `/start` 或 `/menu`

3. 点击 "⚡ 能量租赁" 或 "🔄 闪兑服务" 按钮

4. 查看日志输出：
   ```bash
   pm2 logs easypay --lines 50
   ```

5. 应该看到：
   ```
   能量租赁回调 action: energy_rental
   ```
   或
   ```
   闪兑服务回调 action: swap_service
   ```

6. Bot 应该显示二维码和收款地址

## 总结

问题的根本原因通常是：
1. ❌ 数据库中按钮的 `action` 字段值不正确
2. ❌ 按钮未启用（`enabled: false`）
3. ❌ 回调处理器未正确注册
4. ❌ Settings 配置缺失

确保：
1. ✅ 按钮 action 是 `energy_rental` 或 `swap_service`
2. ✅ 按钮已启用
3. ✅ 回调处理器已注册
4. ✅ Settings 已配置收款地址

---

**最后更新：** 2026-02-05  
**状态：** 已修复并添加调试日志
