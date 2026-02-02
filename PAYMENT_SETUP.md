# 支付平台配置指南

## 问题原因
支付平台返回 "未传入任何参数" 是因为：
1. ❌ 之前使用了 `application/json` 格式
2. ✅ 应该使用 `application/x-www-form-urlencoded` 格式
3. ❌ 之前使用了 MD5 签名
4. ✅ 应该使用 RSA (SHA256WithRSA) 签名

## 已修复内容
- ✅ 修改请求格式为 `application/x-www-form-urlencoded`
- ✅ 实现 RSA 签名算法 (SHA256WithRSA)
- ✅ 添加平台公钥配置（用于验证回调）
- ✅ 添加 APP_URL 环境变量支持
- ✅ 改进错误日志输出

## 配置步骤

### 1. 获取RSA密钥对
登录支付平台商户后台：
1. 进入 **个人资料** → **API信息**
2. 点击 **【生成商户RSA密钥对】**
3. 保存以下信息：
   - **商户私钥** (用于签名，保密)
   - **平台公钥** (用于验证回调)

### 2. 配置环境变量
编辑 `.env` 文件，添加：
```env
APP_URL=http://yourdomain.com
# 或本地测试
APP_URL=http://localhost:5000
```

### 3. 后台配置
登录系统后台: http://localhost:5173/admin

进入 **系统设置** → **支付配置**，填写：

**支付API地址:**
```
https://pay.abcdely.top
```

**商户ID:**
```
1007
```

**API密钥（商户私钥）:**
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
（完整的RSA私钥，包含BEGIN和END标记）
-----END PRIVATE KEY-----
```

**平台公钥:**
```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
（完整的RSA公钥，包含BEGIN和END标记）
-----END PUBLIC KEY-----
```

**回调地址:**
```
http://yourdomain.com/api/payments/notify
```

### 4. 测试配置
```bash
npm run test-payment
```

**成功的输出应该是:**
```
✓ 支付平台配置完整
正在创建测试订单...
待签名字符串: amount=0.01&body=支付网关测试&...
生成的签名: ABC123...
支付平台响应状态: 200
支付平台响应数据: { code: 0, data: { pay_url: "https://..." } }
✓ 支付订单创建成功！
支付链接: https://pay.abcdely.top/...
```

## 密钥格式说明

### 正确的私钥格式
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC8xYZ...
（多行base64编码的密钥内容）
...
-----END PRIVATE KEY-----
```

### 如果密钥没有BEGIN/END标记
系统会自动添加，但建议使用完整格式。

### 密钥来源
- 从支付平台商户后台生成
- 不要使用自己生成的密钥
- 商户私钥必须保密，不要泄露

## 常见问题

### Q1: 提示"未传入任何参数"
A: 已修复，现在使用正确的表单格式。

### Q2: 提示"签名错误"
A: 检查商户私钥是否正确，确保从支付平台后台复制完整的密钥。

### Q3: 提示"商户不存在"
A: 检查商户ID是否正确。

### Q4: 回调地址配置
A: 
- 本地测试可以使用内网穿透工具（如ngrok）
- 生产环境使用真实域名
- 确保服务器能接收POST请求

### Q5: RSA签名失败
A: 
- 检查私钥格式是否正确
- 确保私钥包含BEGIN和END标记
- 如果还是失败，系统会自动降级到MD5签名（兼容V1接口）

## 测试流程

### 1. 配置测试
```bash
npm run test-payment
```

### 2. 前端测试
1. 启动服务: `npm run dev`
2. 访问: http://localhost:5173/pay
3. 填写测试信息:
   - 地址: T开头的波场地址
   - 数量: 1
   - 邮箱: 可选
   - 支付方式: 支付宝或微信
4. 点击"立即发起代付"
5. 应该看到支付二维码弹窗

### 3. 查看日志
**服务器控制台应该显示:**
```
正在创建支付订单: { orderId: 'ORD...', amount: 10.5, ... }
待签名字符串: amount=10.5&body=...
生成的签名: XYZ789...
支付平台响应状态: 200
支付平台响应数据: { code: 0, data: { pay_url: "https://..." } }
支付链接: https://pay.abcdely.top/...
```

**浏览器控制台应该显示:**
```
订单创建成功: { payment: {...}, paymentUrl: "https://...", orderId: "ORD..." }
```

## 下一步

配置成功后：
1. ✅ 支付二维码正常显示
2. ✅ 扫码可以跳转到支付页面
3. ✅ 支付成功后自动执行代付
4. ✅ 发送邮件通知（如果配置了SMTP）

## 技术支持

如果遇到问题，请提供：
1. `npm run test-payment` 的完整输出
2. 服务器控制台日志
3. 浏览器控制台截图
4. 支付平台商户ID（不要提供私钥）
