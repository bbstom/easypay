# Telegram Bot 富文本内容管理系统

## 完成时间
2026-02-05

## 功能概述

实现了一个强大的内容管理系统，管理员可以在后台自定义Bot的所有交互内容，支持：

### 🎨 富文本功能
- ✅ HTML格式化（加粗、斜体、代码、链接）
- ✅ 变量替换（{{username}}、{{amount}}等）
- ✅ 高亮文本
- ✅ 点击复制功能
- ✅ 内联链接
- ✅ Emoji支持

### 📷 多媒体支持
- ✅ 图片消息
- ✅ 视频消息
- ✅ 文档消息
- ✅ 媒体说明文字

### 🔘 交互功能
- ✅ 自定义按钮
- ✅ 回调按钮
- ✅ URL按钮
- ✅ 复制按钮

## 一、数据模型

### TelegramContent模型
```javascript
{
  key: String,              // 唯一标识
  name: String,             // 显示名称
  category: String,         // 分类
  
  content: {
    type: String,           // text/photo/video/document
    text: String,           // 文本内容
    mediaUrl: String,       // 媒体URL
    caption: String,        // 媒体说明
    parseMode: String       // HTML/Markdown/MarkdownV2
  },
  
  features: {
    copyable: Boolean,      // 支持复制
    copyText: String,       // 可复制文本
    highlight: [{           // 高亮配置
      text: String,
      style: String         // bold/italic/code/underline
    }],
    links: [{               // 链接配置
      text: String,
      url: String,
      type: String          // inline/button
    }],
    emojis: [String]        // 推荐emoji
  },
  
  buttons: [{               // 按钮配置
    text: String,
    type: String,           // callback/url/copy
    data: String,
    row: Number,
    col: Number
  }],
  
  variables: [{             // 变量说明
    key: String,
    description: String,
    example: String
  }],
  
  triggers: [{              // 触发条件
    type: String,           // command/callback/state/auto
    value: String
  }],
  
  enabled: Boolean
}
```

## 二、支持的内容类型

### 1. 纯文本消息
```javascript
{
  key: 'welcome_new_user',
  content: {
    type: 'text',
    text: '🎊 <b>欢迎使用 {{siteName}}！</b>\n\n...',
    parseMode: 'HTML'
  }
}
```

### 2. 图片消息
```javascript
{
  key: 'payment_guide',
  content: {
    type: 'photo',
    mediaUrl: 'https://example.com/guide.jpg',
    caption: '📱 扫码支付指南',
    parseMode: 'HTML'
  }
}
```

### 3. 视频消息
```javascript
{
  key: 'tutorial_video',
  content: {
    type: 'video',
    mediaUrl: 'https://example.com/tutorial.mp4',
    caption: '📹 使用教程',
    parseMode: 'HTML'
  }
}
```

### 4. 文档消息
```javascript
{
  key: 'user_manual',
  content: {
    type: 'document',
    mediaUrl: 'https://example.com/manual.pdf',
    caption: '📄 用户手册',
    parseMode: 'HTML'
  }
}
```

## 三、HTML格式化

### 支持的标签

#### 1. 加粗 `<b>`
```html
<b>重要文字</b>
```

#### 2. 斜体 `<i>`
```html
<i>提示信息</i>
```

#### 3. 代码 `<code>`
```html
<code>123456789</code>
```

#### 4. 链接 `<a>`
```html
<a href="https://example.com">点击访问</a>
```

#### 5. 下划线 `<u>`
```html
<u>下划线文字</u>
```

#### 6. 删除线 `<s>`
```html
<s>删除的文字</s>
```

### 组合使用
```html
<b>订单号：</b><code>ORD123456</code>
<i>请访问</i> <a href="https://example.com">官网</a>
```

## 四、变量系统

### 内置变量

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `{{siteName}}` | 网站名称 | FastPay |
| `{{username}}` | 用户名 | user123 |
| `{{telegramId}}` | Telegram ID | 123456789 |
| `{{firstName}}` | 名字 | John |
| `{{email}}` | 邮箱 | user@example.com |
| `{{websiteUrl}}` | 网站地址 | https://kk.vpno.eu.org |
| `{{orderId}}` | 订单号 | ORD123456 |
| `{{amount}}` | 金额 | 100 |
| `{{address}}` | 地址 | TXXXxxx |
| `{{maxAmount}}` | 最大金额 | 200 |

### 使用示例
```html
🎊 欢迎 <b>{{username}}</b>！

您的 Telegram ID 是：<code>{{telegramId}}</code>

订单号：<code>{{orderId}}</code>
金额：<b>{{amount}} USDT</b>
```

### 自定义变量
管理员可以添加自定义变量：
```javascript
variables: [
  {
    key: 'customVar',
    description: '自定义变量',
    example: '示例值'
  }
]
```

## 五、复制功能

### 1. 全局复制
```javascript
features: {
  copyable: true,
  copyText: '{{telegramId}}'
}
```

用户点击复制按钮后，会收到一条包含可复制文本的消息。

### 2. 按钮复制
```javascript
buttons: [{
  text: '📋 复制ID',
  type: 'copy',
  data: '{{telegramId}}'
}]
```

点击按钮后显示可复制的文本。

### 实现原理
Telegram Bot API不支持直接复制到剪贴板，我们通过以下方式实现：
1. 用户点击复制按钮
2. Bot发送一条包含`<code>`标签的消息
3. 用户长按文本即可复制

## 六、按钮类型

### 1. 回调按钮（callback）
```javascript
{
  text: '💰 USDT 代付',
  type: 'callback',
  data: 'payment_usdt'
}
```
点击后触发Bot内部处理。

### 2. URL按钮（url）
```javascript
{
  text: '🌐 访问网站',
  type: 'url',
  data: 'https://kk.vpno.eu.org'
}
```
点击后在浏览器中打开链接。

### 3. 复制按钮（copy）
```javascript
{
  text: '📋 复制地址',
  type: 'copy',
  data: 'TXXXxxxYYYyyy'
}
```
点击后显示可复制的文本。

## 七、使用场景

### 场景1：欢迎新用户
```javascript
{
  key: 'welcome_new_user',
  name: '新用户欢迎消息',
  category: 'welcome',
  content: {
    type: 'text',
    text: `🎊 <b>欢迎使用 {{siteName}}！</b>\n\n` +
          `✅ 账户已自动创建\n` +
          `<code>用户名：</code>{{username}}\n` +
          `<code>TG ID：</code><code>{{telegramId}}</code>`,
    parseMode: 'HTML'
  },
  features: {
    copyable: true,
    copyText: '{{telegramId}}'
  },
  buttons: [
    { text: '📋 复制ID', type: 'copy', data: '{{telegramId}}', row: 0, col: 0 },
    { text: '🌐 访问网站', type: 'url', data: '{{websiteUrl}}', row: 0, col: 1 }
  ]
}
```

### 场景2：代付流程
```javascript
{
  key: 'payment_usdt_start',
  name: 'USDT代付开始',
  category: 'payment',
  content: {
    type: 'text',
    text: `💰 <b>USDT 代付</b>\n\n` +
          `请输入数量（1-{{maxAmount}} USDT）\n` +
          `例如：<code>100</code>`,
    parseMode: 'HTML'
  },
  buttons: [
    { text: '« 返回', type: 'callback', data: 'back_to_main', row: 0, col: 0 }
  ]
}
```

### 场景3：带图片的说明
```javascript
{
  key: 'payment_guide',
  name: '支付指南',
  category: 'help',
  content: {
    type: 'photo',
    mediaUrl: 'https://example.com/payment-guide.jpg',
    caption: `📱 <b>支付指南</b>\n\n` +
             `1️⃣ 扫描二维码\n` +
             `2️⃣ 输入金额\n` +
             `3️⃣ 确认支付`,
    parseMode: 'HTML'
  }
}
```

## 八、API接口

### 1. 获取所有内容
```http
GET /api/telegram/contents
Authorization: Bearer {token}
```

### 2. 获取单个内容
```http
GET /api/telegram/contents/:key
Authorization: Bearer {token}
```

### 3. 创建内容
```http
POST /api/telegram/contents
Authorization: Bearer {token}
Content-Type: application/json

{
  "key": "welcome_new_user",
  "name": "新用户欢迎消息",
  ...
}
```

### 4. 更新内容
```http
PUT /api/telegram/contents/:key
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": { ... },
  "buttons": [ ... ]
}
```

### 5. 删除内容
```http
DELETE /api/telegram/contents/:key
Authorization: Bearer {token}
```

### 6. 预览内容
```http
POST /api/telegram/contents/:key/preview
Authorization: Bearer {token}
Content-Type: application/json

{
  "variables": {
    "username": "测试用户",
    "amount": "100"
  }
}
```

### 7. 初始化默认内容
```http
POST /api/telegram/contents/init-defaults
Authorization: Bearer {token}
```

## 九、ContentService使用

### 在Bot中使用
```javascript
const contentService = require('./services/contentService');

// 发送内容
await contentService.sendContent(ctx, 'welcome_new_user', {
  siteName: 'FastPay',
  username: 'user123',
  telegramId: '123456789'
});

// 编辑内容
await contentService.editContent(ctx, 'payment_usdt_start', {
  maxAmount: 200
});
```

### 缓存机制
ContentService自动缓存内容配置（1分钟TTL），提高性能：
```javascript
// 清除缓存
contentService.clearCache('welcome_new_user'); // 清除单个
contentService.clearCache(); // 清除全部
```

## 十、管理界面

### 访问路径
```
管理后台 → Telegram Bot → 内容管理
URL: /telegram-manage (标签页: 内容管理)
```

### 功能区域

#### 1. 内容列表
- 按分类显示
- 快速搜索
- 启用/禁用

#### 2. 内容编辑器
- 基本信息配置
- 富文本编辑
- 变量管理
- 按钮配置
- 实时预览

#### 3. 工具栏
- HTML标签快捷插入
- 变量快速插入
- 格式化工具

### 编辑器功能

#### 快捷按钮
- `<b>` 加粗 - 选中文字后点击
- `<code>` 代码 - 选中文字后点击
- `<i>` 斜体 - 选中文字后点击
- `<a>` 链接 - 选中文字后点击

#### 变量插入
1. 在变量列表中点击"插入"
2. 变量自动插入到光标位置
3. 格式：`{{variableName}}`

#### 按钮配置
- 文字、类型、数据
- 行列位置
- 快速添加/删除

## 十一、最佳实践

### 1. 内容组织
```
welcome/
  - welcome_new_user
  - welcome_returning_user
  
payment/
  - payment_usdt_start
  - payment_trx_start
  - payment_confirm
  - payment_success
  
order/
  - order_list
  - order_detail
  - order_completed
```

### 2. 变量命名
- 使用驼峰命名：`userName`、`orderId`
- 见名知意：`maxAmount`、`websiteUrl`
- 避免特殊字符

### 3. 按钮布局
```
行0: [主要操作] [次要操作]
行1: [返回] [帮助]
```

### 4. 文本格式
- 标题使用 `<b>`
- 数据使用 `<code>`
- 提示使用 `<i>`
- 链接使用 `<a>`

## 十二、注意事项

### 1. Telegram限制
- 消息最长4096字符
- 按钮文字最长64字符
- 每行最多8个按钮
- 总按钮数最多100个

### 2. HTML标签
- 必须正确闭合
- 不支持嵌套过深
- 某些标签组合可能不兼容

### 3. 变量替换
- 变量不存在时显示原文
- 变量值为空时显示空字符串
- 注意变量名大小写

### 4. 媒体文件
- URL必须可公开访问
- 支持的格式有限
- 文件大小有限制

## 十三、故障排查

### Q1: 内容不显示？
**检查**：
- 内容是否启用
- key是否正确
- 触发条件是否匹配

### Q2: 变量没有替换？
**检查**：
- 变量名是否正确（大小写）
- 是否传递了变量值
- 变量格式是否正确（{{var}}）

### Q3: HTML标签显示为文本？
**检查**：
- parseMode是否设置为HTML
- 标签是否正确闭合
- 是否使用了不支持的标签

### Q4: 按钮不工作？
**检查**：
- 按钮类型是否正确
- callback_data是否有处理器
- URL是否有效

## 十四、未来扩展

### 可能的增强功能
1. **模板继承**
   - 基础模板
   - 子模板覆盖

2. **条件显示**
   - 根据用户角色
   - 根据时间
   - 根据状态

3. **A/B测试**
   - 多版本内容
   - 效果统计

4. **多语言支持**
   - 语言检测
   - 自动翻译

5. **可视化编辑器**
   - 所见即所得
   - 拖拽式布局

---

**功能状态：** ✅ 已完成
**版本：** v1.0
**更新时间：** 2026-02-05

