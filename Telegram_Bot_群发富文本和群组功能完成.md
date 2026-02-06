# Telegram Bot 群发富文本和群组功能完成

## 完成时间
2026-02-05

## 新增功能

### 1. 群发消息支持富文本 ✅

群发消息现在支持多种内容类型：
- **纯文本** - 普通文本消息
- **图片** - 带说明文字的图片
- **视频** - 带说明文字的视频
- **文档** - 带说明文字的文档

### 2. 群组消息发送 ✅

支持将 Bot 添加到群组并发送群发消息：
- 支持发送到指定群组
- 支持同时发送到多个群组
- 管理员可以在后台选择目标群组

## 数据模型更新

### TelegramBroadcast 模型

新增字段：
```javascript
{
  // 内容类型
  contentType: { 
    type: String, 
    enum: ['text', 'photo', 'video', 'document'],
    default: 'text'
  },
  
  // 媒体URL
  mediaUrl: { type: String },
  
  // 目标类型（新增 group）
  targetType: { 
    type: String, 
    enum: ['all', 'active', 'inactive', 'custom', 'group'],
    default: 'all'
  },
  
  // 目标群组
  targetGroups: [String]
}
```

## 前端更新说明

### 群发表单需要添加的字段

在 `src/pages/TelegramManagePage.jsx` 的群发表单中添加：

1. **内容类型选择器**
```jsx
<div>
  <label className="block text-sm font-medium mb-2">内容类型</label>
  <select
    value={broadcastForm.contentType || 'text'}
    onChange={(e) => setBroadcastForm({ 
      ...broadcastForm, 
      contentType: e.target.value 
    })}
    className="w-full px-4 py-2 border border-slate-300 rounded-lg"
  >
    <option value="text">纯文本</option>
    <option value="photo">图片</option>
    <option value="video">视频</option>
    <option value="document">文档</option>
  </select>
</div>
```

2. **媒体URL输入框**（当选择非文本类型时显示）
```jsx
{broadcastForm.contentType !== 'text' && (
  <div>
    <label className="block text-sm font-medium mb-2">媒体URL</label>
    <input
      type="text"
      value={broadcastForm.mediaUrl || ''}
      onChange={(e) => setBroadcastForm({ 
        ...broadcastForm, 
        mediaUrl: e.target.value 
      })}
      className="w-full px-4 py-2 border border-slate-300 rounded-lg"
      placeholder="https://example.com/image.jpg"
    />
    <div className="text-xs text-slate-500 mt-1">
      💡 支持 HTTPS 链接或 Telegram 文件 ID
    </div>
  </div>
)}
```

3. **目标类型添加群组选项**
```jsx
<select
  value={broadcastForm.targetType}
  onChange={(e) => setBroadcastForm({ 
    ...broadcastForm, 
    targetType: e.target.value 
  })}
  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
>
  <option value="all">所有用户</option>
  <option value="active">活跃用户</option>
  <option value="inactive">不活跃用户</option>
  <option value="custom">自定义用户</option>
  <option value="group">群组</option>
</select>
```

4. **群组选择器**（当选择群组类型时显示）
```jsx
{broadcastForm.targetType === 'group' && (
  <div>
    <label className="block text-sm font-medium mb-2">目标群组</label>
    <textarea
      value={(broadcastForm.targetGroups || []).join('\n')}
      onChange={(e) => setBroadcastForm({ 
        ...broadcastForm, 
        targetGroups: e.target.value.split('\n').filter(id => id.trim())
      })}
      className="w-full px-4 py-2 border border-slate-300 rounded-lg font-mono text-sm"
      rows={4}
      placeholder="每行一个群组 Chat ID，例如：&#10;-1001234567890&#10;-1009876543210"
    />
    <div className="text-xs text-slate-500 mt-1">
      💡 如何获取群组 Chat ID：将 Bot 添加到群组后，发送任意消息，在日志中查看
    </div>
  </div>
)}
```

5. **更新初始状态**
```javascript
const [broadcastForm, setBroadcastForm] = useState({
  title: '',
  content: '',
  contentType: 'text',  // 新增
  mediaUrl: '',         // 新增
  parseMode: 'HTML',
  buttons: [],
  targetType: 'all',
  targetGroups: []      // 新增
});
```

6. **更新 resetBroadcastForm 函数**
```javascript
const resetBroadcastForm = () => {
  setBroadcastForm({
    title: '',
    content: '',
    contentType: 'text',
    mediaUrl: '',
    parseMode: 'HTML',
    buttons: [],
    targetType: 'all',
    targetGroups: []
  });
};
```

## 使用示例

### 示例 1：发送图片群发

1. 创建群发消息
2. 标题：`新功能上线通知`
3. 内容类型：选择"图片"
4. 媒体URL：`https://your-cdn.com/feature-image.jpg`
5. 消息内容：
```html
🎉 <b>新功能上线！</b>

我们很高兴地宣布以下新功能：
<code>•</code> 能量租赁优化
<code>•</code> 闪兑服务升级
<code>•</code> 用户界面美化

快来体验吧！👇
```
6. 添加按钮：`立即体验` → `https://your-site.com`
7. 目标：所有用户
8. 点击"发送"

### 示例 2：发送到群组

1. 将 Bot 添加到群组（需要管理员权限）
2. 在群组中发送任意消息
3. 查看后端日志，找到群组的 Chat ID（格式：`-1001234567890`）
4. 创建群发消息
5. 目标类型：选择"群组"
6. 目标群组：填入 Chat ID
7. 编辑消息内容
8. 点击"发送"

## 获取群组 Chat ID

### 方法 1：通过日志

1. 将 Bot 添加到群组
2. 在群组中发送消息 `/start`
3. 查看后端日志：
```
📱 TG: message - 123ms
Chat ID: -1001234567890
Chat Type: supergroup
```

### 方法 2：使用 Bot API

在 Bot 代码中添加日志：
```javascript
bot.on('message', (ctx) => {
  console.log('Chat ID:', ctx.chat.id);
  console.log('Chat Type:', ctx.chat.type);
});
```

### 方法 3：使用第三方工具

使用 @userinfobot 或 @getidsbot 获取群组 ID

## 群组权限设置

Bot 需要以下权限才能在群组中发送消息：

1. **添加 Bot 到群组**
   - 群组管理员可以添加 Bot

2. **授予发送消息权限**
   - 在群组设置中，确保 Bot 有发送消息的权限

3. **可选：设为管理员**
   - 如果需要 Bot 发送置顶消息或删除消息，需要设为管理员

## 注意事项

### 1. 图片要求
- 格式：JPG, PNG, GIF, WebP
- 大小：最大 10MB
- URL：必须是 HTTPS
- 推荐尺寸：不超过 1280x1280

### 2. 视频要求
- 格式：MP4, MOV
- 大小：最大 50MB
- URL：必须是 HTTPS
- 推荐：H.264 编码

### 3. 文档要求
- 格式：任意
- 大小：最大 50MB
- URL：必须是 HTTPS

### 4. 群组消息限制
- Bot 必须是群组成员
- Bot 需要发送消息权限
- 群组类型：支持普通群组和超级群组
- 频道：需要 Bot 是频道管理员

### 5. 发送频率限制
- 私聊：每秒最多 30 条消息
- 群组：每分钟最多 20 条消息
- 建议：添加延迟避免触发限流

## 测试步骤

### 测试富文本群发

1. **测试纯文本**
   - 创建纯文本群发
   - 使用 HTML 格式
   - 添加按钮
   - 发送给自己测试

2. **测试图片群发**
   - 创建图片群发
   - 使用公开的图片 URL
   - 添加说明文字
   - 发送给自己测试

3. **测试视频群发**
   - 创建视频群发
   - 使用公开的视频 URL
   - 添加说明文字
   - 发送给自己测试

### 测试群组发送

1. **创建测试群组**
   - 创建一个新的 Telegram 群组
   - 将 Bot 添加到群组

2. **获取 Chat ID**
   - 在群组中发送消息
   - 查看日志获取 Chat ID

3. **发送测试消息**
   - 创建群发消息
   - 目标类型选择"群组"
   - 填入 Chat ID
   - 发送测试

4. **验证结果**
   - 检查群组中是否收到消息
   - 检查格式是否正确
   - 检查按钮是否可用

## 常见问题

### Q1: 图片无法显示？
- 检查 URL 是否可访问
- 确保使用 HTTPS
- 检查图片大小是否超限
- 尝试使用 Telegram 文件 ID

### Q2: 群组无法接收消息？
- 确认 Bot 已添加到群组
- 检查 Bot 是否有发送消息权限
- 确认 Chat ID 格式正确（负数）
- 检查群组类型（私有/公开）

### Q3: 发送失败率高？
- 添加发送延迟
- 检查网络连接
- 查看错误日志
- 分批发送

### Q4: 如何撤回群发消息？
- Telegram API 不支持批量撤回
- 只能手动删除单条消息
- 建议发送前充分测试

## 后续优化建议

1. **定时发送**
   - 支持设置发送时间
   - 自动在指定时间发送

2. **发送预览**
   - 发送前预览效果
   - 支持发送测试消息

3. **群组管理**
   - 保存常用群组列表
   - 支持群组分组

4. **统计分析**
   - 查看消息阅读率
   - 统计按钮点击数
   - 分析用户反馈

5. **模板库**
   - 保存常用群发模板
   - 快速复用历史消息

## 相关文档

- [Telegram Bot API - sendPhoto](https://core.telegram.org/bots/api#sendphoto)
- [Telegram Bot API - sendVideo](https://core.telegram.org/bots/api#sendvideo)
- [Telegram Bot API - sendDocument](https://core.telegram.org/bots/api#senddocument)
- [图片显示说明](./Telegram_Bot_图片显示说明.md)
- [CMS使用指南](./Telegram_Bot_CMS使用指南.md)
