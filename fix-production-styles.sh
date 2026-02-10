#!/bin/bash

# 生产环境样式修复脚本
# 使用方法: bash fix-production-styles.sh

echo "🔧 开始修复生产环境样式问题..."
echo ""

# 1. 检查当前目录
if [ ! -f "package.json" ]; then
  echo "❌ 错误：请在项目根目录运行此脚本"
  exit 1
fi

# 2. 检查 tailwind.config.js
echo "📋 检查 Tailwind 配置..."
if grep -q "@tailwindcss/typography" tailwind.config.js; then
  echo "✅ Tailwind 配置正确"
else
  echo "❌ Tailwind 配置缺少 typography 插件"
  echo "请手动添加到 tailwind.config.js 的 plugins 数组中"
  exit 1
fi

# 3. 检查依赖
echo ""
echo "📦 检查依赖..."
if npm list @tailwindcss/typography > /dev/null 2>&1; then
  echo "✅ Typography 插件已安装"
else
  echo "⚠️  Typography 插件未安装，正在安装..."
  npm install @tailwindcss/typography
fi

# 4. 清除旧的构建产物
echo ""
echo "🧹 清除旧的构建产物..."
rm -rf dist
rm -rf node_modules/.vite
echo "✅ 清除完成"

# 5. 重新构建
echo ""
echo "🔨 重新构建项目..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ 构建失败，请检查错误信息"
  exit 1
fi

# 6. 验证构建产物
echo ""
echo "🔍 验证构建产物..."

if [ ! -d "dist" ]; then
  echo "❌ dist 目录不存在"
  exit 1
fi

# 检查 CSS 文件
CSS_FILES=$(find dist/assets -name "*.css" 2>/dev/null)
if [ -z "$CSS_FILES" ]; then
  echo "❌ 没有找到 CSS 文件"
  exit 1
fi

# 检查 CSS 文件中是否包含 prose 样式
if grep -q "\.prose" $CSS_FILES; then
  echo "✅ CSS 文件包含 prose 样式"
  
  # 显示文件信息
  for file in $CSS_FILES; do
    size=$(du -h "$file" | cut -f1)
    echo "   📄 $(basename $file) - $size"
  done
else
  echo "❌ CSS 文件中没有 prose 样式"
  echo "请检查 Tailwind 配置"
  exit 1
fi

# 7. 重启服务
echo ""
echo "🔄 重启服务..."

if command -v pm2 > /dev/null 2>&1; then
  pm2 restart all
  echo "✅ PM2 服务已重启"
  
  # 等待服务启动
  sleep 2
  
  # 显示服务状态
  echo ""
  echo "📊 服务状态："
  pm2 list
else
  echo "⚠️  未检测到 PM2，请手动重启服务"
fi

# 8. 完成
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 修复完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 下一步操作："
echo "1. 在浏览器中清除缓存（Ctrl + Shift + Delete）"
echo "2. 硬刷新页面（Ctrl + Shift + R）"
echo "3. 访问博客文章页面验证样式"
echo ""
echo "🔗 测试链接："
echo "https://kk.vpno.eu.org/blog/usdt-代付完全指南-从入门到精通"
echo ""
