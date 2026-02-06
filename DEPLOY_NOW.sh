#!/bin/bash

# Telegram 登录调试版本部署脚本

echo "🚀 开始部署..."

# 1. 构建前端
echo "📦 构建前端..."
npm run build

# 2. 检查构建结果
echo "✅ 构建完成，检查文件..."
ls -lht dist/assets/*.js | head -3

# 3. 重启后端（包含 Bot）
echo "🔄 重启后端服务..."
pm2 restart easypay-backend

# 4. 查看日志
echo "📋 查看最新日志..."
pm2 logs easypay-backend --lines 10 --nostream

echo ""
echo "✅ 部署完成！"
echo ""
echo "📝 测试步骤："
echo "1. 清除浏览器缓存（Ctrl + Shift + R）"
echo "2. 打开开发者工具（F12）"
echo "3. 切换到 Console 标签"
echo "4. 访问 https://kk.vpno.eu.org/login"
echo "5. 点击'打开 Telegram 应用登录'"
echo "6. 观察 Console 中的日志输出"
echo ""
echo "预期日志："
echo "  🔐 生成登录令牌: login_xxx"
echo "  📱 打开 Telegram 应用: tg://..."
echo "  🔄 开始轮询登录状态: login_xxx"
echo "  ⏳ 检查登录状态..."
echo "  📊 轮询响应: { success: true, token: 'xxx' }"
echo "  ✅ 检测到登录成功"
echo "  📡 调用 qr-login-complete API..."
echo "  ✅ 获取到 JWT token"
echo "  🚀 跳转到用户中心..."
echo ""
