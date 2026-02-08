# Telegram 群发定时重复功能使用指南

## 功能概述

系统现在支持以下群发功能：
1. **立即发送**：创建后立即发送
2. **定时发送**：设置未来某个时间点发送
3. **重复发送**：按设定的时间间隔自动重复发送
4. **手动触发**：随时手动触发发送

## 数据库字段说明

### 基础字段
- `title`: 群发标题
- `content`: 消息内容
- `contentType`: 内容类型（text/photo/video/document）
- `targetType`: 目标类型（all/active/inactive/custom）
- `status`: 状态（draft/sending/completed/failed）

### 定时发送字段
- `scheduledAt`: 定时发送时间（可选）
  - 如果设置了未来时间，系统会在该时间自动发送
  - 如果不设置或设置为过去时间，则立即发送

### 重复发送字段
- `repeatEnabled`: 是否启用重复发送（boolean）
- `repeatInterval`: 重复间隔（小时）
  - 例如：24 表示每 24 小时发送一次
- `maxRepeatCount`: 最大重复次数
  - 0 表示无限重复
  - 大于 0 表示重复指定次数后停止
- `repeatCount`: 已重复次数（自动记录）
- `nextSendAt`: 下次发送时间（自动计算）
- `lastSentAt`: 最后一次发送时间（自动记录）
- `repeatHistory`: 发送历史记录（数组）

## 使用场景

### 场景 1：立即发送一次
```json
{
  "title": "新功能上线通知",
  "content": "我们上线了新功能...",
  "targetType": "all",
  "repeatEnabled": false
}
```

### 场景 2：定时发送一次
```json
{
  "title": "明天活动预告",
  "content": "明天将举办...",
  "targetType": "all",
  "scheduledAt": "2026-02-09T10:00:00.000Z",
  "repeatEnabled": false
}
```

### 场景 3：每天定时发送（无限重复）
```json
{
  "title": "每日签到提醒",
  "content": "记得每天签到哦...",
  "targetType": "active",
  "scheduledAt": "2026-02-09T02:00:00.000Z",
  "repeatEnabled": true,
  "repeatInterval": 24,
  "maxRepeatCount": 0
}
```

### 场景 4：每 12 小时发送，共发送 10 次
```json
{
  "title": "限时活动提醒",
  "content": "限时活动进行中...",
  "targetType": "all",
  "scheduledAt": "2026-02-09T10:00:00.000Z",
  "repeatEnabled": true,
  "repeatInterval": 12,
  "maxRepeatCount": 10
}
```

### 场景 5：每周发送一次
```json
{
  "title": "每周报告",
  "content": "本周数据统计...",
  "targetType": "all",
  "scheduledAt": "2026-02-12T09:00:00.000Z",
  "repeatEnabled": true,
  "repeatInterval": 168,
  "maxRepeatCount": 0
}
```

## API 接口

### 1. 创建群发
```http
POST /api/telegram/broadcasts
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "群发标题",
  "content": "消息内容",
  "contentType": "text",
  "targetType": "all",
  "scheduledAt": "2026-02-09T10:00:00.000Z",
  "repeatEnabled": true,
  "repeatInterval": 24,
  "maxRepeatCount": 0
}
```

### 2. 发送群发（立即或定时）
```http
POST /api/telegram/broadcasts/:id/send
Authorization: Bearer <token>
```

### 3. 停止重复发送
```http
POST /api/telegram/broadcasts/:id/stop-repeat
Authorization: Bearer <token>
```

### 4. 手动触发发送
```http
POST /api/telegram/broadcasts/:id/trigger
Authorization: Bearer <token>
```

### 5. 获取群发列表
```http
GET /api/telegram/broadcasts
Authorization: Bearer <token>
```

### 6. 获取群发统计
```http
GET /api/telegram/broadcasts/:id/stats
Authorization: Bearer <token>
```

## 定时任务说明

系统默认每 **5 分钟**检查一次待发送的群发任务，你可以在前端自定义这个间隔时间。

### 检查逻辑

1. **检查定时发送**
   - 查找 `status = 'draft'` 且 `scheduledAt <= 当前时间` 的任务
   - 自动执行发送

2. **检查重复发送**
   - 查找 `repeatEnabled = true` 且 `nextSendAt <= 当前时间` 的任务
   - 检查是否达到最大重复次数
   - 自动执行发送并计算下次发送时间

### 自定义检查间隔

#### API 方式

**获取当前配置**
```http
GET /api/telegram/broadcast-scheduler/config
Authorization: Bearer <token>

Response:
{
  "isRunning": true,
  "intervalMinutes": 5,
  "intervalSeconds": 300
}
```

**更新检查间隔**
```http
PUT /api/telegram/broadcast-scheduler/config
Authorization: Bearer <token>
Content-Type: application/json

{
  "intervalMinutes": 10
}

Response:
{
  "message": "定时器配置已更新",
  "config": {
    "isRunning": true,
    "intervalMinutes": 10,
    "intervalSeconds": 600
  }
}
```

**手动触发检查**
```http
POST /api/telegram/broadcast-scheduler/check
Authorization: Bearer <token>

Response:
{
  "message": "已触发检查"
}
```

#### 前端组件方式

在 Telegram 管理页面中集成 `BroadcastSchedulerConfig` 组件：

```jsx
import BroadcastSchedulerConfig from '../components/BroadcastSchedulerConfig';

// 在页面中添加一个新的 Tab
<Tab label="定时器配置">
  <BroadcastSchedulerConfig />
</Tab>
```

### 间隔时间建议

| 使用场景 | 建议间隔 | 时间精度 | 说明 |
|---------|---------|---------|------|
| 精确定时 | 1-2 分钟 | ±1 分钟 | 适合需要精确时间的场景 |
| 一般定时 | 5-10 分钟 | ±5 分钟 | 平衡精度和性能，推荐 |
| 低频定时 | 30-60 分钟 | ±30 分钟 | 适合每天或每周发送的场景 |
| 极低频 | 2-24 小时 | ±2 小时 | 适合每周或每月发送的场景 |

## 前端集成建议

### 创建群发表单
```jsx
<form>
  <input name="title" placeholder="群发标题" />
  <textarea name="content" placeholder="消息内容" />
  
  {/* 定时发送 */}
  <input 
    type="datetime-local" 
    name="scheduledAt" 
    placeholder="定时发送时间（可选）" 
  />
  
  {/* 重复发送 */}
  <label>
    <input type="checkbox" name="repeatEnabled" />
    启用重复发送
  </label>
  
  {repeatEnabled && (
    <>
      <input 
        type="number" 
        name="repeatInterval" 
        placeholder="间隔时间（小时）" 
        min="1"
      />
      <input 
        type="number" 
        name="maxRepeatCount" 
        placeholder="最大次数（0=无限）" 
        min="0"
      />
    </>
  )}
  
  <button type="submit">创建群发</button>
</form>
```

### 群发列表显示
```jsx
<div>
  <h3>{broadcast.title}</h3>
  <p>状态: {broadcast.status}</p>
  <p>已发送: {broadcast.sentCount} / {broadcast.totalUsers}</p>
  
  {/* 重复发送状态 */}
  {broadcast.repeatEnabled && (
    <div>
      <p>🔄 重复发送已启用</p>
      <p>间隔: {broadcast.repeatInterval}小时</p>
      <p>已发送: {broadcast.sentTimes || 0}次</p>
      {broadcast.maxRepeatCount > 0 && (
        <p>最大: {broadcast.maxRepeatCount}次</p>
      )}
      {broadcast.nextSendAt && (
        <p>下次: {new Date(broadcast.nextSendAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}</p>
      )}
    </div>
  )}
  
  {/* 定时发送状态 */}
  {broadcast.scheduledAt && broadcast.status === 'draft' && (
    <p>⏰ 定时发送: {new Date(broadcast.scheduledAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}</p>
  )}
  
  {/* 操作按钮 */}
  {broadcast.status === 'draft' && (
    <>
      <button onClick={() => editBroadcast(broadcast)}>编辑</button>
      <button onClick={() => sendBroadcast(broadcast._id)}>发送</button>
    </>
  )}
  
  {(broadcast.status === 'completed' || broadcast.status === 'failed') && (
    <>
      <button onClick={() => triggerBroadcast(broadcast._id)}>立即发送</button>
      {broadcast.repeatEnabled && (
        <button onClick={() => stopRepeat(broadcast._id)}>停止重复</button>
      )}
      <button onClick={() => viewStats(broadcast)}>查看统计</button>
      <button onClick={() => duplicateBroadcast(broadcast)}>复制</button>
    </>
  )}
  
  <button onClick={() => deleteBroadcast(broadcast._id)}>删除</button>
</div>
```

### 新增功能函数

#### 停止重复发送
```javascript
const stopRepeat = async (id) => {
  if (!confirm('确定要停止重复发送吗？')) return;
  
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/telegram/broadcasts/${id}/stop-repeat`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (res.ok) {
    alert('已停止重复发送');
    fetchData();
  }
};
```

#### 手动触发发送
```javascript
const triggerBroadcast = async (id) => {
  if (!confirm('确定要立即发送这条群发消息吗？')) return;
  
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/telegram/broadcasts/${id}/trigger`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (res.ok) {
    alert('已触发发送');
    fetchData();
  }
};
```

#### 查看统计
```javascript
const viewStats = async (broadcast) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/telegram/broadcasts/${broadcast._id}/stats`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (res.ok) {
    const stats = await res.json();
    const message = `📊 群发统计\n\n` +
      `标题: ${broadcast.title}\n` +
      `总用户数: ${stats.totalUsers}\n` +
      `成功发送: ${stats.sentCount}\n` +
      `发送失败: ${stats.failedCount}\n` +
      `成功率: ${stats.successRate}%\n\n` +
      (broadcast.repeatEnabled ? 
        `🔄 重复发送: 已启用\n` +
        `间隔: ${broadcast.repeatInterval} 小时\n` +
        `已发送次数: ${broadcast.sentTimes || 0}\n` +
        `最大次数: ${broadcast.maxRepeatCount || '无限制'}\n` +
        `下次发送: ${broadcast.nextSendAt ? new Date(broadcast.nextSendAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) : '未设置'}` 
        : '');
    alert(message);
  }
};
```

#### 复制为新草稿
```javascript
const duplicateBroadcast = (broadcast) => {
  // 转换 scheduledAt 为 datetime-local 格式（如果有）
  let scheduledAtValue = '';
  if (broadcast.scheduledAt) {
    const date = new Date(broadcast.scheduledAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    scheduledAtValue = `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  setBroadcastForm({
    title: `${broadcast.title} (副本)`,
    content: broadcast.content,
    contentType: broadcast.contentType || 'text',
    mediaUrl: broadcast.mediaUrl || '',
    parseMode: broadcast.parseMode || 'HTML',
    targetType: broadcast.targetType,
    targetUsers: broadcast.targetUsers || [],
    targetGroups: broadcast.targetGroups || [],
    buttons: broadcast.buttons || [],
    scheduledAt: scheduledAtValue,
    repeatEnabled: broadcast.repeatEnabled || false,
    repeatInterval: broadcast.repeatInterval || 24,
    maxRepeatCount: broadcast.maxRepeatCount || 0
  });
  setEditingBroadcast(null); // 不设置编辑状态，作为新建
  setShowBroadcastModal(true);
};
```

## 注意事项

1. **时区问题**
   - 所有时间使用 UTC 存储
   - 前端显示时需要转换为本地时区（Asia/Shanghai）

2. **发送限流**
   - 系统每发送 10 条消息会暂停 1 秒
   - 避免触发 Telegram 的限流机制

3. **重复发送逻辑**
   - 首次发送后，`repeatCount` 从 0 开始计数
   - 每次发送后 `repeatCount += 1`
   - 达到 `maxRepeatCount` 后自动停止（如果 `maxRepeatCount > 0`）

4. **定时任务精度**
   - 检查间隔可自定义（1-1440 分钟）
   - 实际发送时间可能有 0-N 分钟的延迟（N = 检查间隔）
   - 例如：间隔 5 分钟，延迟 0-5 分钟；间隔 1 分钟，延迟 0-1 分钟

5. **状态管理**
   - `draft`: 草稿，未发送
   - `sending`: 发送中
   - `completed`: 已完成（可能继续重复）
   - `failed`: 发送失败

6. **性能考虑**
   - 间隔越短，检查越频繁，服务器负载越高
   - 建议根据实际需求选择合适的间隔
   - 如果没有紧急的定时任务，可以设置较长的间隔（如 30-60 分钟）

7. **按钮 URL 格式**
   - URL 类型按钮必须使用有效的 HTTP/HTTPS URL
   - 如果输入 `@username` 格式，系统会自动转换为 `https://t.me/username`
   - 如果输入不带协议的 URL（如 `example.com`），系统会自动添加 `https://`
   - 示例：
     - `@kknns_bot` → `https://t.me/kknns_bot`
     - `example.com` → `https://example.com`
     - `https://example.com` → `https://example.com`（不变）

8. **编辑已完成的群发**
   - 已完成或失败的群发可以编辑
   - 编辑后状态会重置为草稿，需要重新发送
   - 统计数据（成功数、失败数）会被清零

## 常见问题

### Q: 如何修改已创建的重复发送任务？
A: 已完成或失败的群发可以编辑。点击"编辑"按钮修改内容后，状态会重置为草稿，需要重新发送。

### Q: 如何查看发送历史？
A: 查看 `repeatHistory` 字段，记录了每次发送的时间和统计。或者使用"群发统计"标签页查看所有群发的详细统计。

### Q: 重复发送会重复发给同一批用户吗？
A: 是的，每次发送都会重新查询目标用户列表，可能会有变化。

### Q: 如何实现"每天早上 9 点发送"？
A: 设置 `scheduledAt` 为明天早上 9 点，`repeatInterval` 为 24 小时。

### Q: 服务器重启后定时任务会丢失吗？
A: 不会，任务存储在数据库中，服务器重启后会自动恢复。

### Q: 按钮 URL 格式错误怎么办？
A: 确保 URL 类型按钮使用有效的 HTTP/HTTPS URL。系统会自动修复常见格式：
- `@username` 会转换为 `https://t.me/username`
- `example.com` 会转换为 `https://example.com`
- 如果仍然报错，请检查 URL 是否有效

### Q: 如何停止正在重复发送的任务？
A: 在群发列表中找到该任务，点击"停止重复"按钮即可。

### Q: 编辑已完成的群发会怎样？
A: 编辑后状态会重置为草稿，统计数据（成功数、失败数）会被清零，需要重新发送。
