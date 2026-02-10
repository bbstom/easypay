# Telegram 登录问题修复

## 问题描述

用户通过网站扫描二维码登录时，点击 Telegram Bot 的"确认登录"按钮后，收到"未知操作"错误：

```
❌ [@TRXLP_bot] 未知操作: confirm_login_login_1770736622674_vy32jc2i8
```

## 问题原因

在 `server/bot/MultiBotManager.js` 中，登录确认的回调数据检查使用了错误的前缀：

**错误代码**：
```javascript
if (data.startsWith('login_confirm_')) {
  return startHandler.handleLoginConfirm(ctx);
}
```

**实际发送的回调数据**（在 `server/bot/handlers/start.js` 中）：
```javascript
{ text: '✅ 确认登录', callback_data: `confirm_login_${token}` }
```

前缀不匹配：`login_confirm_` vs `confirm_login_`

## 修复方案

修改 `server/bot/MultiBotManager.js` 中的回调数据检查：

```javascript
// 修复前
if (data.startsWith('login_confirm_')) {
  return startHandler.handleLoginConfirm(ctx);
}

// 修复后
if (data.startsWith('confirm_login_') || data === 'cancel_login') {
  return startHandler.handleLoginConfirm(ctx);
}
```

## 修复内容

1. ✅ 将前缀从 `login_confirm_` 改为 `confirm_login_`
2. ✅ 添加 `cancel_login` 的处理（取消登录按钮）

## 部署步骤

```bash
# 1. 提交代码
git add server/bot/MultiBotManager.js
git commit -m "修复 Telegram 登录回调前缀错误"
git push origin main

# 2. 服务器部署
cd /www/wwwroot/kk.vpno.eu.org/easypay
git pull origin main

# 3. 重启 Bot 服务
pm2 restart easypay-backend
```

## 验证步骤

1. 访问网站登录页面
2. 点击"Telegram 登录"
3. 扫描二维码
4. 在 Telegram 中点击"✅ 确认登录"
5. 应该成功登录，不再显示"未知操作"错误

## 相关文件

- `server/bot/MultiBotManager.js` - 多 Bot 管理器（已修复）
- `server/bot/handlers/start.js` - 登录处理器（无需修改）
- `server/bot/index.js` - Bot 初始化（无需修改）

## 技术细节

### 回调数据流程

1. **网站生成登录 Token**：
   ```javascript
   const token = `login_${Date.now()}_${randomString}`;
   ```

2. **Bot 发送确认消息**：
   ```javascript
   inline_keyboard: [[
     { text: '✅ 确认登录', callback_data: `confirm_login_${token}` },
     { text: '❌ 取消', callback_data: 'cancel_login' }
   ]]
   ```

3. **MultiBotManager 接收回调**：
   ```javascript
   bot.on('callback_query', async (ctx) => {
     const data = ctx.callbackQuery.data;
     
     if (data.startsWith('confirm_login_') || data === 'cancel_login') {
       return startHandler.handleLoginConfirm(ctx);
     }
   });
   ```

4. **handleLoginConfirm 处理登录**：
   ```javascript
   if (callbackData.startsWith('confirm_login_')) {
     const token = callbackData.replace('confirm_login_', '');
     // 调用后端 API 确认登录
     await axios.post('/api/auth/confirm-qr-login', { token, telegramId });
   }
   ```

### 为什么会出现这个问题？

在 `server/bot/index.js` 中，回调处理器是这样注册的：

```javascript
this.bot.action(/^confirm_login_/, startHandler.handleLoginConfirm);
this.bot.action('cancel_login', startHandler.handleLoginConfirm);
```

但是 `MultiBotManager.js` 使用了自己的回调处理逻辑，覆盖了 `index.js` 中的注册。因此需要在 `MultiBotManager.js` 中也添加正确的前缀检查。

## 注意事项

1. **多 Bot 模式**：如果使用多个 Bot，每个 Bot 都会经过 `MultiBotManager.js` 的回调处理
2. **回调前缀一致性**：确保所有回调数据的前缀在发送和接收时保持一致
3. **测试覆盖**：修复后需要测试所有登录场景（确认登录、取消登录）

## 相关问题

如果遇到类似的"未知操作"错误，检查以下内容：

1. **回调数据前缀**：确保发送和接收的前缀一致
2. **MultiBotManager 处理**：检查 `MultiBotManager.js` 中是否有对应的处理逻辑
3. **回调处理器注册**：确保在 `index.js` 中正确注册了回调处理器

## 修复完成

✅ Telegram 登录功能现在应该可以正常工作了！
