# Telegram 群发系统修复说明

## 修复时间
2026-02-10

## 问题描述

### 问题 1：重复发送次数显示为 0
- **现象**：启用重复发送后，前端界面显示"已发送: 0次"，但实际消息在发送
- **原因**：数据库模型使用的字段是 `repeatCount`，但前端显示的是 `sentTimes`（不存在的字段）

### 问题 2：群发日志显示 "目标用户: undefined"
- **现象**：群组群发时，后端日志显示"开始发送群发，目标用户: undefined"
- **原因**：API 返回的响应中没有包含 `totalUsers` 字段

## 修复内容

### 1. 前端修复 (src/pages/TelegramManagePage.jsx)

#### 修复 1.1：重复发送次数显示
**位置**：第 1342 行
```javascript
// 修复前
<span className="text-slate-600">已发送: {broadcast.sentTimes || 0}次</span>

// 修复后
<span className="text-slate-600">已发送: {broadcast.repeatCount || 0}次</span>
```

#### 修复 1.2：群发统计卡片显示
**位置**：第 1496 行
```javascript
// 修复前
{broadcast.sentTimes || 0}
{broadcast.maxRepeatCount > 0 ? `/${broadcast.maxRepeatCount}` : '/∞'}

// 修复后
{broadcast.repeatCount || 0}
{broadcast.maxRepeatCount > 0 ? `/${broadcast.maxRepeatCount}` : '/∞'}
```

#### 修复 1.3：详情弹窗显示
**位置**：第 450 行
```javascript
// 修复前
message += `已发送: ${broadcast.sentTimes || 0} 次\n`;

// 修复后
message += `已发送: ${broadcast.repeatCount || 0} 次\n`;
```

### 2. 后端修复 (server/routes/telegram.js)

#### 修复 2.1：发送群发 API 返回值
**位置**：第 184-196 行
```javascript
// 修复前
res.json({ 
  message: '开始发送群发'
});

// 修复后
// 计算目标数量
let totalUsers = 0;
if (broadcast.targetType === 'group' && broadcast.targetGroups) {
  totalUsers = broadcast.targetGroups.length;
} else {
  // 获取目标用户数量
  const User = require('../models/User');
  let query = { telegramId: { $exists: true, $ne: null } };
  
  if (broadcast.targetType === 'active') {
    query.lastActiveAt = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
  } else if (broadcast.targetType === 'inactive') {
    query.lastActiveAt = { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
  } else if (broadcast.targetType === 'custom' && broadcast.targetUsers) {
    query.telegramId = { $in: broadcast.targetUsers };
  }
  
  totalUsers = await User.countDocuments(query);
}

res.json({ 
  message: '开始发送群发',
  totalUsers
});
```

## 数据库字段说明

### TelegramBroadcast 模型字段
- `repeatCount`: 已重复发送的次数（正确字段）
- `maxRepeatCount`: 最大重复次数（0 表示无限）
- `repeatInterval`: 重复间隔（小时）
- `repeatEnabled`: 是否启用重复发送
- `nextSendAt`: 下次发送时间
- `lastSentAt`: 最后一次发送时间

## 验证方法

### 1. 验证重复发送次数显示
1. 创建一个启用重复发送的群发消息
2. 设置重复间隔为 1 小时
3. 发送群发
4. 等待自动重复发送
5. 刷新页面，检查"已发送"次数是否正确递增

### 2. 验证群发目标数量显示
1. 创建一个群组群发消息
2. 选择目标群组
3. 点击发送
4. 检查弹窗提示是否显示正确的目标数量（如"目标用户: 3"）

## 注意事项

1. **字段命名统一**：数据库模型使用 `repeatCount`，前端也应该使用相同的字段名
2. **API 响应完整性**：所有需要在前端显示的数据，都应该在 API 响应中返回
3. **群组 vs 用户**：群组群发和用户群发的逻辑不同，需要分别处理
4. **时区处理**：所有时间显示都使用中国时区（Asia/Shanghai，UTC+8）

## 相关文件

- `src/pages/TelegramManagePage.jsx` - 前端群发管理页面
- `server/routes/telegram.js` - 后端 Telegram API 路由
- `server/services/broadcastScheduler.js` - 群发调度服务
- `server/models/TelegramBroadcast.js` - 群发数据模型

## 后续优化建议

1. **统一字段命名**：考虑将 `repeatCount` 重命名为更直观的 `sentTimes`，并同步更新数据库和代码
2. **实时更新**：考虑使用 WebSocket 实时推送群发进度，而不是需要手动刷新
3. **错误处理**：增强错误提示，区分不同类型的发送失败原因
4. **日志优化**：群组群发时，日志应该显示"目标群组数"而不是"目标用户数"
