# Telegram Bot 主菜单自定义功能

## 完成时间
2026-02-05

## 功能概述

管理员可以在后台完全自定义Telegram Bot的主菜单按钮，包括：
- 按钮文字（支持emoji）
- 按钮类型（系统功能/自定义回调/外部链接）
- 按钮布局（行列位置）
- 按钮启用/禁用
- 按钮排序

## 一、数据模型

### TelegramMenu模型
```javascript
{
  name: 'main_menu',
  buttons: [{
    text: String,        // 按钮文字（支持emoji）
    type: String,        // 'system' | 'callback' | 'url'
    action: String,      // 功能名/callback_data/url
    row: Number,         // 行号（0开始）
    col: Number,         // 列号（0开始）
    enabled: Boolean,    // 是否启用
    order: Number        // 排序
  }],
  systemActions: {       // 系统功能开关
    payment_usdt: Boolean,
    payment_trx: Boolean,
    orders_list: Boolean,
    tickets_list: Boolean,
    account_info: Boolean,
    help_center: Boolean
  },
  layout: String,        // 布局方式
  enabled: Boolean       // 菜单是否启用
}
```

## 二、按钮类型

### 1. 系统功能（system）
预定义的功能，直接调用Bot内置功能：

| 功能值 | 名称 | 图标 | 说明 |
|--------|------|------|------|
| `payment_usdt` | USDT 代付 | 💰 | 启动USDT代付流程 |
| `payment_trx` | TRX 代付 | 💎 | 启动TRX代付流程 |
| `orders_list` | 我的订单 | 📋 | 查看订单列表 |
| `tickets_list` | 工单系统 | 💬 | 查看工单列表 |
| `account_info` | 个人中心 | 👤 | 查看账户信息 |
| `help_center` | 帮助中心 | ❓ | 显示帮助信息 |

### 2. 自定义回调（callback）
自定义的callback_data，需要在代码中添加处理逻辑：

```javascript
// 示例：添加自定义功能
this.bot.action('custom_action', async (ctx) => {
  await ctx.reply('这是自定义功能');
});
```

### 3. 外部链接（url）
点击后在浏览器中打开的链接：

```javascript
// 示例
{
  text: '🌐 访问网站',
  type: 'url',
  action: 'https://kk.vpno.eu.org'
}
```

## 三、管理界面

### 访问路径
```
管理后台 → Telegram Bot → 主菜单设置
URL: /telegram-manage (标签页: 主菜单设置)
```

### 功能按钮
1. **重置默认** - 恢复到默认菜单配置
2. **添加按钮** - 添加新的菜单按钮
3. **保存菜单** - 保存当前配置

### 按钮配置项

#### 1. 按钮文字
- 支持任意文本
- 支持emoji（推荐使用）
- 建议长度：2-15个字符

**示例**：
```
💰 USDT 代付
💎 TRX 代付
📋 我的订单
🌐 访问网站
```

#### 2. 按钮类型
- **系统功能**：从下拉列表选择预定义功能
- **自定义回调**：输入callback_data
- **外部链接**：输入完整URL

#### 3. 行列设置
- **行号**：决定按钮在第几行（0开始）
- **列号**：决定按钮在行内的位置（0开始）
- 同一行的按钮会并排显示

**布局示例**：
```
行0: [按钮1(0,0)] [按钮2(0,1)]
行1: [按钮3(1,0)] [按钮4(1,1)]
行2: [按钮5(2,0)]
```

#### 4. 启用/禁用
- 勾选：按钮显示在菜单中
- 不勾选：按钮隐藏

#### 5. 排序
- 使用 ↑↓ 按钮调整顺序
- 影响按钮在配置列表中的位置

## 四、预览功能

管理界面提供实时预览，显示菜单的实际效果：

```
┌─────────────────────┐
│   📋 主菜单         │
├─────────────────────┤
│ [💰 USDT 代付] [💎 TRX 代付] │
│ [📋 我的订单] [💬 工单系统]   │
│ [👤 个人中心] [❓ 帮助中心]   │
└─────────────────────┘
```

## 五、API接口

### 1. 获取菜单配置
```http
GET /api/telegram/menu
Authorization: Bearer {token}
```

**响应**：
```json
{
  "_id": "...",
  "name": "main_menu",
  "buttons": [...],
  "layout": "custom",
  "enabled": true
}
```

### 2. 更新菜单配置
```http
PUT /api/telegram/menu
Authorization: Bearer {token}
Content-Type: application/json

{
  "buttons": [...],
  "layout": "custom",
  "enabled": true
}
```

### 3. 重置为默认
```http
POST /api/telegram/menu/reset
Authorization: Bearer {token}
```

### 4. 获取系统功能列表
```http
GET /api/telegram/menu/system-actions
Authorization: Bearer {token}
```

**响应**：
```json
[
  {
    "value": "payment_usdt",
    "label": "USDT 代付",
    "icon": "💰",
    "category": "代付"
  },
  ...
]
```

## 六、使用场景

### 场景1：简化菜单
只保留核心功能：
```
[💰 代付] [📋 订单]
[💬 工单] [❓ 帮助]
```

### 场景2：添加外部链接
```
[💰 USDT 代付] [💎 TRX 代付]
[📋 我的订单] [💬 工单系统]
[🌐 访问网站] [📱 下载APP]
```

### 场景3：自定义布局
```
[💰 USDT 代付]
[💎 TRX 代付]
[📋 我的订单]
[💬 工单系统]
[👤 个人中心]
[❓ 帮助中心]
```

### 场景4：多语言支持
```
[💰 USDT Payment] [💎 TRX Payment]
[📋 My Orders] [💬 Support]
[👤 Account] [❓ Help]
```

## 七、技术实现

### 1. 动态加载菜单
```javascript
// server/bot/keyboards/main.js
async function getMainKeyboard() {
  const menu = await TelegramMenu.findOne({ 
    name: 'main_menu', 
    enabled: true 
  });
  
  if (!menu) {
    return getDefaultMainKeyboard();
  }
  
  // 按行分组
  const rows = {};
  menu.buttons
    .filter(btn => btn.enabled)
    .sort((a, b) => a.order - b.order)
    .forEach(btn => {
      if (!rows[btn.row]) rows[btn.row] = [];
      rows[btn.row].push(btn);
    });
  
  // 构建按钮
  const buttons = Object.keys(rows)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map(row => {
      return rows[row]
        .sort((a, b) => a.col - b.col)
        .map(btn => {
          if (btn.type === 'url') {
            return Markup.button.url(btn.text, btn.action);
          } else {
            return Markup.button.callback(btn.text, btn.action);
          }
        });
    });
  
  return Markup.inlineKeyboard(buttons);
}
```

### 2. 缓存优化
建议添加缓存以提高性能：

```javascript
let menuCache = null;
let cacheTime = 0;
const CACHE_TTL = 60000; // 1分钟

async function getMainKeyboard() {
  const now = Date.now();
  
  if (menuCache && (now - cacheTime) < CACHE_TTL) {
    return menuCache;
  }
  
  const menu = await TelegramMenu.findOne({ 
    name: 'main_menu', 
    enabled: true 
  });
  
  menuCache = buildKeyboard(menu);
  cacheTime = now;
  
  return menuCache;
}
```

## 八、注意事项

### 1. 按钮数量限制
- Telegram限制每行最多8个按钮
- 建议每行2-3个按钮
- 总按钮数建议不超过12个

### 2. 文字长度
- 按钮文字过长会被截断
- 建议使用emoji节省空间
- 中文建议4-6个字

### 3. 布局建议
- 常用功能放在前面
- 相关功能放在同一行
- 保持视觉平衡

### 4. 更新生效
- 保存后立即生效
- 用户下次打开菜单时看到新配置
- 无需重启Bot

## 九、默认菜单配置

```javascript
{
  name: 'main_menu',
  buttons: [
    { 
      text: '💰 USDT 代付', 
      type: 'system', 
      action: 'payment_usdt', 
      row: 0, col: 0, order: 0 
    },
    { 
      text: '💰 TRX 代付', 
      type: 'system', 
      action: 'payment_trx', 
      row: 0, col: 1, order: 1 
    },
    { 
      text: '📋 我的订单', 
      type: 'system', 
      action: 'orders_list', 
      row: 1, col: 0, order: 2 
    },
    { 
      text: '💬 工单系统', 
      type: 'system', 
      action: 'tickets_list', 
      row: 1, col: 1, order: 3 
    },
    { 
      text: '👤 个人中心', 
      type: 'system', 
      action: 'account_info', 
      row: 2, col: 0, order: 4 
    },
    { 
      text: '❓ 帮助中心', 
      type: 'system', 
      action: 'help_center', 
      row: 2, col: 1, order: 5 
    }
  ],
  layout: 'custom',
  enabled: true
}
```

## 十、常见问题

### Q1: 修改后用户看不到新菜单？
**A**: 用户需要重新打开菜单（发送/menu或点击返回主菜单）才能看到更新。

### Q2: 可以添加多少个按钮？
**A**: 理论上无限制，但建议不超过12个，保持界面简洁。

### Q3: 自定义回调如何处理？
**A**: 需要在`server/bot/index.js`中添加对应的action处理器：
```javascript
this.bot.action('your_custom_action', async (ctx) => {
  // 处理逻辑
});
```

### Q4: 可以动态显示不同菜单吗？
**A**: 当前版本只支持一个主菜单，但可以根据用户角色在代码中实现不同菜单。

### Q5: 如何恢复默认菜单？
**A**: 点击"重置默认"按钮即可恢复到初始配置。

## 十一、未来扩展

### 可能的增强功能
1. **多菜单支持**
   - 主菜单
   - 管理员菜单
   - VIP菜单

2. **条件显示**
   - 根据用户角色显示不同按钮
   - 根据时间显示/隐藏按钮

3. **A/B测试**
   - 测试不同菜单布局的效果
   - 统计按钮点击率

4. **模板系统**
   - 保存多个菜单配置
   - 快速切换

5. **可视化编辑器**
   - 拖拽式布局
   - 实时预览

---

**功能状态：** ✅ 已完成
**版本：** v1.0
**更新时间：** 2026-02-05

