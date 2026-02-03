#!/bin/bash

# 生产环境快速部署脚本
# 使用方法: bash deploy.sh

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 开始部署到生产环境"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

# 1. 安装依赖
echo "📦 安装生产依赖..."
npm install --production
echo "✅ 依赖安装完成"
echo ""

# 2. 构建前端
echo "🔨 构建前端..."
npm run build
echo "✅ 前端构建完成"
echo ""

# 3. 检查 .env 文件
if [ ! -f ".env" ]; then
    echo "⚠️  未找到 .env 文件"
    echo "📝 从 .env.example 创建 .env..."
    cp .env.example .env
    echo "✅ .env 文件已创建"
    echo ""
    echo "⚠️  请编辑 .env 文件，配置以下内容："
    echo "   - MONGODB_URI"
    echo "   - JWT_SECRET"
    echo "   - MASTER_KEY"
    echo "   - FRONTEND_URL"
    echo ""
    read -p "按 Enter 继续..."
fi

# 4. 检查数据库连接
echo "🔍 检查数据库连接..."
node -e "
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ 数据库连接成功');
    mongoose.disconnect();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ 数据库连接失败:', err.message);
    process.exit(1);
  });
" || {
    echo ""
    echo "❌ 数据库连接失败，请检查 MONGODB_URI 配置"
    exit 1
}
echo ""

# 5. 询问是否初始化数据库
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 数据库初始化"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "是否需要初始化数据库？(y/n): " init_db

if [ "$init_db" = "y" ] || [ "$init_db" = "Y" ]; then
    echo ""
    echo "🔄 运行数据库初始化脚本..."
    npm run init-db
    echo ""
fi

# 6. 检查 PM2
if ! command -v pm2 &> /dev/null; then
    echo "⚠️  未安装 PM2"
    read -p "是否安装 PM2？(y/n): " install_pm2
    if [ "$install_pm2" = "y" ] || [ "$install_pm2" = "Y" ]; then
        echo "📦 安装 PM2..."
        sudo npm install -g pm2
        echo "✅ PM2 安装完成"
    else
        echo "⚠️  跳过 PM2 安装，请手动启动后端服务"
        echo "   命令: node server/index.js"
        exit 0
    fi
fi
echo ""

# 7. 启动/重启后端服务
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 启动后端服务"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if pm2 list | grep -q "easypay-backend"; then
    echo "🔄 重启现有服务..."
    pm2 restart easypay-backend
else
    echo "🆕 启动新服务..."
    pm2 start server/index.js --name easypay-backend
    pm2 save
fi

echo ""
echo "✅ 后端服务已启动"
echo ""

# 8. 显示服务状态
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 服务状态"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
pm2 status
echo ""

# 9. 显示日志
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 最近日志"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
pm2 logs easypay-backend --lines 20 --nostream
echo ""

# 10. 完成
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 部署完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 后续步骤："
echo ""
echo "1. 配置 Nginx（如果还没有）"
echo "   参考: 生产环境部署指南.md"
echo ""
echo "2. 配置 SSL 证书"
echo "   sudo certbot --nginx -d your-domain.com"
echo ""
echo "3. 登录管理后台完成配置"
echo "   https://your-domain.com/login"
echo ""
echo "4. 查看日志"
echo "   pm2 logs easypay-backend"
echo ""
echo "5. 监控服务"
echo "   pm2 monit"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
