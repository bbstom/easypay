# EasyPay - USDT/TRX 代付系统

> 基于 TRON 区块链的自动化加密货币代付系统，集成 Telegram Bot 和完整的管理后台

[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## ✨ 核心功能

### 💰 代付服务
- **USDT 代付**：自动化 USDT (TRC20) 转账
- **TRX 代付**：自动化 TRX 转账
- **多钱包管理**：支持多个钱包自动轮换和负载均衡
- **能量租赁**：自动租赁 TRON 能量降低手续费

### 🤖 Telegram Bot
- **完整交互界面**：用户通过 Telegram 完成所有操作
- **自定义菜单**：可视化配置 Bot 菜单和按钮
- **消息模板**：支持变量替换和 HTML 格式化
- **群发系统**：支持定时、重复发送的消息群发
- **工单系统**：用户支持和客服管理

### 💳 支付集成
- **多支付方式**：支持支付宝、微信支付等
- **自动回调**：支付成功自动处理订单
- **订单管理**：完整的订单查询和管理

### 🔧 管理后台
- **用户管理**：用户列表、权限管理
- **钱包管理**：多钱包配置、余额监控
- **订单管理**：订单查询、状态管理
- **系统设置**：全局配置、支付配置
- **数据统计**：用户统计、交易统计

### 🚀 高级功能
- **闪兑服务**：USDT ↔ TRX 兑换（可选）
- **多 Bot 支持**：支持配置多个 Telegram Bot
- **群发统计**：详细的群发数据分析
- **安全审计**：定期安全检查和审计

---

## 📦 快速开始

### 环境要求

```bash
Node.js >= 16.x
MongoDB >= 4.4
PM2 (生产环境)
```

### 安装步骤

1. **克隆项目**
```bash
git clone <your-repo-url>
cd easypay
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
copy .env.example .env
# 编辑 .env 文件，填入必要配置
```

4. **初始化数据库**
```bash
node server/scripts/initDatabase.js
```

5. **创建管理员**
```bash
node server/scripts/createAdmin.js
```

6. **启动服务**

开发环境：
```bash
npm run dev        # 启动后端
npm run client     # 启动前端（新终端）
```

生产环境：
```bash
npm run build      # 构建前端
pm2 start ecosystem.config.js
```

7. **访问系统**
- 前端：http://localhost:5173 (开发) 或 http://localhost:3000 (生产)
- 管理后台：登录后访问 /admin

---

## 📚 完整文档

### 🎯 新手必读

- **[系统安装使用教程](./系统安装使用教程.md)** ⭐ 完整的安装、配置和使用指南
- [快速故障排查卡](./快速故障排查卡.md) - 常见问题快速解决
- [部署检查清单](./DEPLOYMENT_CHECKLIST.md) - 生产环境部署检查

### 🔧 配置指南

- [环境变量配置说明](./环境变量配置说明.md)
- [密钥配置快速参考](./密钥配置_快速参考.md)
- [私钥格式说明](./私钥格式说明.md)
- [支付方法配置](./PAYMENT_METHODS.md)

### 💼 部署指南

- [宝塔部署完整指南](./宝塔部署完整指南.md) - 推荐新手使用
- [生产环境部署指南](./生产环境部署指南.md)
- [Nginx 配置示例](./nginx配置示例.conf)

### 🤖 Telegram Bot

- [Telegram Bot 快速启动指南](./Telegram_Bot_快速启动指南.md)
- [Telegram Bot 部署清单](./Telegram_Bot_部署清单.md)
- [Telegram Bot CMS 使用指南](./Telegram_Bot_CMS使用指南.md)
- [Telegram 群发系统使用指南](./Telegram_Bot_群发系统使用指南.md)
- [Telegram 群发定时重复功能](./Telegram群发定时重复功能使用指南.md)
- [多 Bot 配置说明](./多Bot配置说明.md)

### 💰 钱包和支付

- [多钱包系统快速参考](./多钱包系统_快速参考.md)
- [TRON 资源管理指南](./TRON资源管理指南.md)
- [加密货币转账指南](./CRYPTO_TRANSFER_GUIDE.md)
- [闪兑系统快速配置指南](./闪兑系统_快速配置指南.md)

### 🔔 通知系统

- [通知模板配置说明](./通知模板配置说明.md)
- [支付通知系统使用指南](./支付通知系统_使用指南.md)

### 🛠️ 开发参考

- [API 版本指南](./API_VERSION_GUIDE.md)
- [Telegram Bot 设计方案](./Telegram_Bot_设计方案.md)

---

## 🎮 常用命令

### 开发

```bash
npm run dev          # 启动后端开发服务器
npm run client       # 启动前端开发服务器
npm run build        # 构建生产版本
```

### 生产环境

```bash
pm2 start ecosystem.config.js    # 启动所有服务
pm2 list                          # 查看服务状态
pm2 logs                          # 查看日志
pm2 restart all                   # 重启所有服务
pm2 stop all                      # 停止所有服务
```

### 管理脚本

```bash
# 用户管理
node server/scripts/createAdmin.js          # 创建管理员
node server/scripts/createNewAdmin.js       # 创建新管理员
node server/scripts/listAllUsers.js         # 查看所有用户
node server/scripts/resetPassword.js        # 重置密码

# 钱包管理
node server/scripts/listWallets.js          # 查看钱包列表
node server/scripts/refreshWallets.js       # 刷新钱包余额
node server/scripts/checkWalletStatus.js    # 检查钱包状态

# 系统维护
node server/scripts/securityAudit.js        # 安全审计
node server/scripts/generateStrongKey.js    # 生成强密钥
node server/scripts/initDatabase.js         # 初始化数据库
```

---

## 🏗️ 技术架构

### 前端
- **框架**：React 18
- **构建工具**：Vite
- **样式**：TailwindCSS
- **路由**：React Router
- **状态管理**：Context API

### 后端
- **运行时**：Node.js
- **框架**：Express
- **数据库**：MongoDB + Mongoose
- **认证**：JWT
- **进程管理**：PM2

### 区块链
- **网络**：TRON
- **库**：TronWeb
- **API**：TronGrid

### Telegram
- **框架**：Telegraf
- **功能**：Bot API、Inline Keyboard、Callback Query

---

## 📊 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                      用户端                              │
├─────────────────────────────────────────────────────────┤
│  Web 前端 (React)  │  Telegram Bot (Telegraf)          │
└──────────┬──────────┴────────────┬─────────────────────┘
           │                       │
           ▼                       ▼
┌─────────────────────────────────────────────────────────┐
│                   后端 API (Express)                     │
├─────────────────────────────────────────────────────────┤
│  认证  │  订单  │  支付  │  钱包  │  通知  │  群发      │
└──────┬──────────┬────────┬───────┬────────┬────────────┘
       │          │        │       │        │
       ▼          ▼        ▼       ▼        ▼
┌──────────┐ ┌────────┐ ┌──────┐ ┌──────┐ ┌──────────┐
│ MongoDB  │ │ 支付网关│ │ TRON │ │能量租赁│ │ Telegram │
└──────────┘ └────────┘ └──────┘ └──────┘ └──────────┘
```

---

## 🔒 安全特性

- ✅ JWT 认证和授权
- ✅ 密码加密存储（bcrypt）
- ✅ 私钥加密存储
- ✅ API 请求限流
- ✅ CORS 跨域保护
- ✅ XSS 防护
- ✅ SQL 注入防护
- ✅ 审计日志记录

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

本项目仅供学习和研究使用。

---

## 📞 技术支持

遇到问题？

1. 查看 [系统安装使用教程](./系统安装使用教程.md)
2. 查看 [快速故障排查卡](./快速故障排查卡.md)
3. 检查日志文件：`pm2 logs`
4. 运行诊断脚本：`node server/scripts/checkWalletStatus.js`

---

**最后更新：** 2026-02-08  
**版本：** v1.0.0  
**维护者：** EasyPay Team
