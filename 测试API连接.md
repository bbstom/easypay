# 测试API连接

## 你看到的错误是正常的！

`Cannot GET /api/payments/notify` 这个错误是**正常的**，因为：
- 这个接口只接受 **POST** 请求（支付回调用）
- 你用浏览器访问是 **GET** 请求
- 所以返回 "Cannot GET"

## 如何验证配置是否正确

### 1. 测试其他API接口（GET请求）

在浏览器中访问以下地址，应该返回JSON数据：

```
https://dd.vpno.eu.org/api/settings/public
```

**预期结果**: 返回一个JSON对象，包含网站配置信息

### 2. 测试支付回调接口（POST请求）

使用 curl 命令测试（需要在服务器上执行）：

```bash
curl -X POST https://dd.vpno.eu.org/api/payments/notify \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "test=1"
```

**预期结果**: 返回 "FAIL"（因为签名验证失败，但说明接口可访问）

### 3. 检查后端服务状态

```bash
# 检查后端是否运行
netstat -tlnp | grep 5000

# 或使用 ss
ss -tlnp | grep 5000

# 查看进程
ps aux | grep node
```

### 4. 测试本地API

在服务器上测试后端是否正常：

```bash
# 测试后端直接访问
curl http://127.0.0.1:5000/api/settings/public

# 测试回调接口
curl -X POST http://127.0.0.1:5000/api/payments/notify \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "test=1"
```

## 验证反向代理配置

### 检查 Nginx 配置

在宝塔面板中：
1. 网站 → 设置 → 配置文件
2. 查找 `location ^~ /api` 部分
3. 确认 `proxy_pass http://127.0.0.1:5000;`

### 检查 Nginx 日志

```bash
# 访问日志
tail -f /www/wwwlogs/dd.vpno.eu.org.log

# 错误日志
tail -f /www/wwwlogs/dd.vpno.eu.org.error.log
```

## 完整的测试流程

### 步骤1: 测试后端直接访问
```bash
curl http://127.0.0.1:5000/api/settings/public
```
✅ 如果返回JSON，说明后端正常

### 步骤2: 测试通过域名访问
```bash
curl https://dd.vpno.eu.org/api/settings/public
```
✅ 如果返回JSON，说明反向代理正常

### 步骤3: 测试POST接口
```bash
curl -X POST https://dd.vpno.eu.org/api/payments/notify \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "test=1"
```
✅ 如果返回 "FAIL"，说明接口可访问（签名验证失败是正常的）

### 步骤4: 创建测试订单
1. 访问 https://dd.vpno.eu.org
2. 进入代付工作台
3. 填写信息并提交
4. 使用微信支付
5. 支付成功后，查看订单状态

## 常见问题排查

### 问题1: 访问 /api/settings/public 也返回错误

**可能原因**:
- 后端服务未启动
- 反向代理配置错误
- 端口被占用

**解决方法**:
```bash
# 检查后端进程
pm2 list

# 重启后端
pm2 restart all

# 查看后端日志
pm2 logs
```

### 问题2: 本地可以访问，域名无法访问

**可能原因**:
- Nginx 反向代理未配置
- Nginx 未重启
- 防火墙阻止

**解决方法**:
```bash
# 重启 Nginx
systemctl restart nginx

# 检查 Nginx 状态
systemctl status nginx

# 查看 Nginx 错误日志
tail -f /www/wwwlogs/dd.vpno.eu.org.error.log
```

### 问题3: 支付后没有回调

**可能原因**:
- 回调URL配置错误
- 支付平台无法访问你的服务器
- 签名验证失败

**解决方法**:
1. 确认回调URL: `https://dd.vpno.eu.org/api/payments/notify`
2. 在后台管理 → 系统设置 → 支付配置中填写
3. 查看后端日志，看是否收到回调

## 验证配置正确的标志

✅ **前端访问正常**
- 访问 https://dd.vpno.eu.org 能看到页面

✅ **API访问正常**
- 访问 https://dd.vpno.eu.org/api/settings/public 返回JSON

✅ **回调接口可访问**
- POST 请求 https://dd.vpno.eu.org/api/payments/notify 返回响应

✅ **支付流程正常**
- 创建订单成功
- 支付成功后订单状态更新
- 自动执行代付

## 后端日志示例

支付成功后，应该能在后端日志中看到：

```
收到支付回调: { out_trade_no: 'ORD...', trade_status: 'TRADE_SUCCESS', ... }
使用API版本: v1
订单号: ORD... 状态: TRADE_SUCCESS
✅ 支付成功，订单: ...
📧 支付成功邮件已发送: user@example.com
🔄 开始执行 USDT 代付: ...
✅ USDT 代付成功: ORD..., txHash: ...
📧 USDT 代付完成邮件已发送: user@example.com
```

## 总结

看到 "Cannot GET /api/payments/notify" 是**正常的**！

这说明：
1. ✅ 反向代理配置正确（请求到达了后端）
2. ✅ 后端服务正常运行
3. ✅ 路由配置正确

只是这个接口不接受 GET 请求而已。

**下一步**: 测试实际的支付流程，看支付成功后是否能正常回调和代付。

---

**最后更新**: 2026年2月1日
