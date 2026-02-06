# Telegram Bot 图片显示说明

## 问题说明

Telegram Bot API **不支持**在文本消息中使用 HTML `<img>` 标签或 Markdown 图片语法来显示图片。

## 错误示例 ❌

```html
<!-- 这样不会显示图片 -->
<img src="https://example.com/image.jpg" />

<!-- Markdown 也不支持 -->
![图片](https://example.com/image.jpg)
```

## 正确方法 ✅

### 方法一：使用图片类型内容

1. **在内容管理中创建/编辑内容**
2. **将"内容类型"改为"图片"**
3. **在"媒体URL"字段填入图片链接**
4. **在"消息内容"中填写图片说明文字（可选）**

示例配置：
```json
{
  "key": "welcome_with_image",
  "name": "带图片的欢迎消息",
  "content": {
    "type": "photo",
    "mediaUrl": "https://img.131213.xyz/your-image.jpg",
    "text": "🎉 欢迎使用我们的服务！\n\n这是图片说明文字",
    "parseMode": "HTML"
  }
}
```

### 方法二：使用 Telegram 文件 ID

如果图片已经上传到 Telegram，可以使用文件 ID：

```json
{
  "content": {
    "type": "photo",
    "mediaUrl": "AgACAgIAAxkBAAIBY2...",  // Telegram 文件 ID
    "text": "图片说明"
  }
}
```

## 支持的图片格式

Telegram 支持以下图片格式：
- **JPG / JPEG**
- **PNG**
- **GIF** (静态或动态)
- **WebP**

限制：
- 最大文件大小：**10 MB**
- 推荐尺寸：不超过 **1280x1280** 像素

## 图片 URL 要求

1. **必须是公开可访问的 URL**
2. **必须使用 HTTPS 协议**
3. **URL 必须直接指向图片文件**（不能是网页）
4. **服务器必须允许 Telegram 的爬虫访问**

### 有效的 URL 示例
```
✅ https://example.com/images/photo.jpg
✅ https://cdn.example.com/photo.png
✅ https://img.131213.xyz/tfile/BQACAgUAAx0...
```

### 无效的 URL 示例
```
❌ http://example.com/photo.jpg  (不是 HTTPS)
❌ https://example.com/page.html  (不是图片文件)
❌ https://private.com/photo.jpg  (需要登录)
```

## 完整示例

### 示例 1：带图片的欢迎消息

**配置：**
- 内容标识：`welcome_with_logo`
- 内容类型：`photo`
- 媒体URL：`https://your-cdn.com/logo.png`
- 消息内容：
```html
🎊 <b>欢迎使用 {{siteName}}！</b>

✅ <b>账户已创建</b>
━━━━━━━━━━━━━━━
<code>用户名：</code>{{username}}
<code>TG ID：</code>{{telegramId}}
━━━━━━━━━━━━━━━

💡 请选择您需要的服务 👇
```

### 示例 2：订单完成通知（带二维码）

**配置：**
- 内容标识：`order_completed_qr`
- 内容类型：`photo`
- 媒体URL：`{{qrCodeUrl}}` (动态变量)
- 消息内容：
```html
🎉 <b>订单已完成！</b>

━━━━━━━━━━━━━━━
<code>订单号：</code>{{orderId}}
<code>数  量：</code>{{amount}} {{currency}}
━━━━━━━━━━━━━━━

✅ 扫描上方二维码查看详情
```

## 获取 Telegram 文件 ID

如果你想使用已上传到 Telegram 的图片：

1. **上传图片到 Bot**
   - 直接发送图片给你的 Bot
   
2. **获取文件 ID**
   - 在 Bot 代码中打印 `message.photo` 信息
   - 复制 `file_id` 字段的值

3. **使用文件 ID**
   - 将文件 ID 填入"媒体URL"字段
   - 这样图片会从 Telegram 服务器加载，速度更快

## 常见问题

### Q1: 为什么图片不显示？

**可能原因：**
1. URL 不是 HTTPS
2. URL 无法公开访问
3. 图片文件过大（超过 10MB）
4. 图片格式不支持
5. 服务器阻止了 Telegram 的访问

**解决方法：**
- 检查 URL 是否可以在浏览器中直接打开
- 确保使用 HTTPS
- 压缩图片到 10MB 以下
- 使用支持的格式（JPG, PNG, GIF, WebP）

### Q2: 可以同时发送多张图片吗？

可以，但需要使用 `sendMediaGroup` API，目前系统不支持。

**替代方案：**
- 创建多个内容，分别发送
- 使用图片拼接工具合并为一张图片

### Q3: 图片可以添加按钮吗？

可以！在内容配置中添加按钮即可：

```json
{
  "content": {
    "type": "photo",
    "mediaUrl": "https://example.com/image.jpg",
    "text": "图片说明"
  },
  "buttons": [
    {
      "text": "查看详情",
      "type": "url",
      "data": "https://example.com",
      "row": 0,
      "col": 0
    }
  ]
}
```

### Q4: 如何在代码中动态生成图片？

可以使用二维码生成器等工具：

```javascript
// 生成二维码
const QRCode = require('qrcode');
const qrBuffer = await QRCode.toBuffer(data);

// 发送图片
await ctx.replyWithPhoto(
  { source: qrBuffer },
  {
    caption: '扫描二维码',
    parse_mode: 'HTML'
  }
);
```

## 最佳实践

1. **使用 CDN**
   - 将图片上传到 CDN 服务
   - 提高加载速度和稳定性

2. **优化图片大小**
   - 压缩图片到合适的大小
   - 推荐 100-500 KB

3. **使用缓存**
   - 使用 Telegram 文件 ID 缓存已上传的图片
   - 避免重复上传

4. **提供降级方案**
   - 如果图片加载失败，显示纯文本消息
   - 在代码中添加错误处理

## 相关文档

- [Telegram Bot API - sendPhoto](https://core.telegram.org/bots/api#sendphoto)
- [Telegram Bot API - 支持的文件类型](https://core.telegram.org/bots/api#sending-files)
- [内容管理系统使用指南](./Telegram_Bot_CMS使用指南.md)
