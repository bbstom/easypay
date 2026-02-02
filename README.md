# FastPay - USDT/TRX 代付平台

一个现代化的加密货币代付平台，支持 USDT 和 TRX 代付服务，集成支付宝/微信支付网关，自动执行区块链转账。

## 功能特性

### 核心功能
- 🔐 用户认证系统（注册/登录）
- 👤 用户角色管理（普通用户/管理员）
- 💰 USDT/TRX 代付功能
- 💳 支付宝/微信支付集成
- 🤖 **自动区块链转账**（支付完成后自动执行）
- 🔄 **智能重试机制**（失败自动重试3次）
- 📊 实时汇率系统（支持手动/自动模式）
- 💼 钱包余额监控和预警
- 📧 邮件通知系统
- 📊 代付历史记录
- 📢 广告位管理系统
- 🎨 现代化 UI 设计（基于 Tailwind CSS）

### 管理功能
- 📈 财务统计（总收入、今日收入、订单数、成功率）
- 💼 钱包状态监控（TRX/USDT余额实时显示）
- 🔄 失败订单手动重试
- ⚙️ 系统设置（支付网关、TRON配置、邮件配置等）
- 📝 订单管理（支付状态、转账状态分离显示）

## 技术栈

### 前端
- React 18
- React Router
- Tailwind CSS
- Lucide React (图标)
- Axios
- HTML5-QRCode (二维码扫描)

### 后端
- Node.js
- Express
- MongoDB + Mongoose
- JWT 认证
- bcryptjs 密码加密
- TronWeb (TRON 区块链交互)
- Nodemailer (邮件发送)
- Axios (HTTP 请求)

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并配置：

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fastpay
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development

# TRON 配置（重要！）
TRON_PRIVATE_KEY=你的TRON钱包私钥
TRON_API_URL=https://api.trongrid.io

# 支付网关配置
PAYMENT_API_URL=https://pay.example.com
PAYMENT_MERCHANT_ID=your_merchant_id
PAYMENT_API_KEY=your_api_key
```

### 3. 启动 MongoDB

确保 MongoDB 服务正在运行。

### 4. 创建管理员账户

```bash
npm run create-admin
```

默认管理员账户：
- 邮箱: admin@fastpay.com
- 密码: admin123456

### 5. 测试钱包连接

```bash
npm run test-wallet
```

这将显示您的钱包地址和余额。

### 6. 启动项目

```bash
npm run dev
```

这将同时启动：
- 前端开发服务器（端口 3000）
- 后端 API 服务器（端口 5000）

## 🚀 加密货币自动转账

### 快速配置（5分钟）

1. **准备 TRON 钱包**
   - 创建或使用现有钱包
   - 充值 TRX（建议100+）和 USDT

2. **配置私钥**
   ```bash
   # 编辑 .env 文件
   TRON_PRIVATE_KEY=你的64位私钥
   ```

3. **测试连接**
   ```bash
   npm run test-wallet
   ```

4. **测试转账（可选）**
   ```bash
   npm run test-transfer
   ```

详细配置请查看 [快速开始指南](./QUICK_START_CRYPTO.md)

### 工作流程

```
用户支付 → 支付网关回调 → 验证签名 → 自动执行区块链转账 → 发送邮件通知
```

### 核心特性

- ✅ **全自动**: 支付完成后自动转账，无需人工干预
- ✅ **可靠性**: 失败自动重试3次，可手动重试
- ✅ **监控**: 实时显示钱包余额，余额不足自动预警
- ✅ **安全**: 私钥加密存储，管理员权限控制

详细文档：
- [完整实施指南](./CRYPTO_TRANSFER_GUIDE.md)
- [技术实现文档](./CRYPTO_TRANSFER_IMPLEMENTATION.md)
- [功能总结](./CRYPTO_TRANSFER_SUMMARY.md)

## 项目结构

```
├── src/                    # 前端源码
│   ├── components/         # React 组件
│   ├── context/           # Context API
│   ├── pages/             # 页面组件
│   │   ├── PayPage.jsx    # USDT 代付页面
│   │   ├── PayPageTRX.jsx # TRX 代付页面
│   │   ├── FinancePage.jsx # 财务管理（含钱包监控）
│   │   └── SettingsPage.jsx # 系统设置
│   ├── App.jsx            # 主应用组件
│   └── main.jsx           # 入口文件
├── server/                # 后端源码
│   ├── models/            # 数据模型
│   ├── routes/            # API 路由
│   ├── middleware/        # 中间件
│   ├── services/          # 业务服务
│   │   ├── tronService.js # TRON 区块链服务
│   │   ├── paymentService.js # 支付网关服务
│   │   ├── exchangeRateService.js # 汇率服务
│   │   └── emailService.js # 邮件服务
│   ├── scripts/           # 工具脚本
│   │   ├── testWallet.js  # 测试钱包
│   │   └── testTransfer.js # 测试转账
│   └── index.js           # 服务器入口
└── package.json
```

## API 接口

### 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 代付
- `POST /api/payments` - 创建代付订单
- `POST /api/payments/notify` - 支付回调（支付网关调用）
- `GET /api/payments/history` - 获取代付历史
- `GET /api/payments/all` - 获取所有订单（管理员）
- `GET /api/payments/stats` - 获取统计数据（管理员）
- `POST /api/payments/retry/:paymentId` - 手动重试转账（管理员）
- `GET /api/payments/wallet/status` - 获取钱包状态（管理员）

### 广告管理
- `GET /api/ads` - 获取所有启用的广告
- `GET /api/ads/all` - 获取所有广告（管理员）
- `POST /api/ads` - 创建广告（管理员）
- `PUT /api/ads/:id` - 更新广告（管理员）
- `DELETE /api/ads/:id` - 删除广告（管理员）

### 系统设置
- `GET /api/settings` - 获取系统设置
- `GET /api/settings/public` - 获取公开设置
- `PUT /api/settings` - 更新系统设置（管理员）

## 可用脚本

```bash
# 开发
npm run dev              # 启动开发服务器（前端+后端）
npm run server           # 仅启动后端
npm run client           # 仅启动前端

# 构建
npm run build            # 构建生产版本

# 管理
npm run create-admin     # 创建管理员账户

# 测试
npm run test-wallet      # 测试钱包连接
npm run test-transfer    # 测试转账功能
npm run test-payment     # 测试支付网关
npm run test-email       # 测试邮件发送
```

## 管理员功能

登录后，如果用户角色为管理员，导航栏右上角会显示"管理"按钮，点击可进入管理后台。

### 管理后台功能

**财务管理**:
- 📊 收入统计（总收入、今日收入）
- 📈 订单统计（总订单、今日订单、成功率）
- 💼 钱包状态监控（实时余额、余额预警）
- 📝 订单列表（支持筛选、搜索、导出）
- 🔄 失败订单重试

**系统设置**:
- 基本配置（网站信息、SEO、社交媒体）
- Footer 配置（公司信息、链接、版权）
- 服务费设置（固定费用/百分比）
- 汇率设置（手动/实时模式、加成比例）
- 支付网关配置（API版本、商户ID、密钥）
- TRON 配置（API地址、私钥）
- 邮件配置（SMTP设置）

**广告管理**:
- 创建/编辑/删除广告
- 设置广告尺寸
- 启用/禁用广告
- 管理广告内容和链接

## 安全建议

### 私钥管理
- ⚠️ 不要将 `.env` 文件提交到 Git
- ⚠️ 不要分享私钥给任何人
- ⚠️ 定期备份私钥
- ⚠️ 使用专用钱包，不要与个人资产混用

### 钱包管理
- 定期检查钱包余额
- TRX 低于 50 时及时充值
- USDT 根据业务量提前准备
- 关注财务管理页面的余额预警

## 开发说明

- 前端使用 Vite 作为构建工具
- 后端使用 Nodemon 实现热重载
- 使用 Concurrently 同时运行前后端服务
- 使用 TronWeb 与 TRON 区块链交互
- 支持易支付 V1 和 V2 接口

## 故障排查

### 转账失败

1. 检查钱包余额: `npm run test-wallet`
2. 查看服务器日志
3. 使用管理后台的重试功能

### 支付回调失败

1. 检查支付网关配置
2. 验证回调 URL 是否可访问
3. 查看服务器日志中的签名验证信息

详细故障排查请查看 [实施指南](./CRYPTO_TRANSFER_GUIDE.md)

## 许可证

MIT
#   e a s y p a y  
 