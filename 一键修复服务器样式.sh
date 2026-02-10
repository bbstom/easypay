#!/bin/bash

# 一键修复服务器样式问题
# 使用方法：bash 一键修复服务器样式.sh

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 开始修复服务器样式问题"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 检查是否在项目目录
if [ ! -f "package.json" ]; then
  echo "❌ 错误：请在项目根目录运行此脚本"
  echo "正确路径：/www/wwwroot/kk.vpno.eu.org/easypay"
  exit 1
fi

echo "📍 当前目录：$(pwd)"
echo ""

# 1. 安装 Typography 插件
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 步骤 1/6: 安装 @tailwindcss/typography"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm install @tailwindcss/typography --save

if [ $? -ne 0 ]; then
  echo "❌ 安装失败"
  exit 1
fi

echo ""
echo "✅ 安装成功"
echo ""

# 2. 验证安装
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 步骤 2/6: 验证安装"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm list @tailwindcss/typography

if npm list @tailwindcss/typography | grep -q "empty"; then
  echo "❌ 验证失败：插件未正确安装"
  exit 1
fi

echo ""
echo "✅ 验证通过"
echo ""

# 3. 安装其他 Markdown 依赖
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 步骤 3/6: 安装 Markdown 相关依赖"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm install remark-gfm rehype-raw rehype-sanitize --save

echo ""
echo "✅ 依赖安装完成"
echo ""

# 4. 清除缓存
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧹 步骤 4/6: 清除构建缓存"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
rm -rf dist
rm -rf node_modules/.vite

echo "✅ 缓存清除完成"
echo ""

# 5. 重新构建
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔨 步骤 5/6: 重新构建项目"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm run build

if [ $? -ne 0 ]; then
  echo "❌ 构建失败"
  exit 1
fi

echo ""

# 验证构建产物
echo "🔍 验证构建产物..."
if [ ! -d "dist" ]; then
  echo "❌ dist 目录不存在"
  exit 1
fi

CSS_FILES=$(find dist/assets -name "*.css" 2>/dev/null | head -1)
if [ -z "$CSS_FILES" ]; then
  echo "❌ 没有找到 CSS 文件"
  exit 1
fi

if grep -q "\.prose" "$CSS_FILES"; then
  echo "✅ CSS 文件包含 prose 样式"
  
  # 显示文件信息
  echo ""
  echo "📄 CSS 文件信息："
  ls -lh dist/assets/*.css | awk '{print "   " $9 " - " $5}'
  
  # 显示 prose 样式数量
  PROSE_COUNT=$(grep -o "\.prose" "$CSS_FILES" | wc -l)
  echo "   包含 $PROSE_COUNT 个 prose 相关样式"
else
  echo "❌ CSS 文件中没有 prose 样式"
  echo "请检查 tailwind.config.js 配置"
  exit 1
fi

echo ""
echo "✅ 构建成功"
echo ""

# 6. 重启服务
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 步骤 6/6: 重启服务"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v pm2 > /dev/null 2>&1; then
  pm2 restart all
  
  if [ $? -eq 0 ]; then
    echo "✅ PM2 服务重启成功"
    
    # 等待服务启动
    sleep 2
    
    # 显示服务状态
    echo ""
    echo "📊 服务状态："
    pm2 list
  else
    echo "❌ PM2 重启失败"
    exit 1
  fi
else
  echo "⚠️  未检测到 PM2"
  echo "请手动重启服务"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 修复完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 下一步操作："
echo ""
echo "1. 在浏览器中清除缓存"
echo "   - 按 Ctrl + Shift + Delete"
echo "   - 选择"缓存的图片和文件""
echo "   - 点击"清除数据""
echo ""
echo "2. 硬刷新页面"
echo "   - 按 Ctrl + Shift + R"
echo "   - 或按 F5 多次"
echo ""
echo "3. 访问博客文章验证样式"
echo "   🔗 https://kk.vpno.eu.org/blog/usdt-代付完全指南-从入门到精通"
echo ""
echo "4. 检查以下内容："
echo "   ✓ H2 标题是否有底部边框"
echo "   ✓ H2、H3、H4 大小是否递减"
echo "   ✓ 段落之间是否有间距"
echo "   ✓ 列表是否有缩进和符号"
echo "   ✓ 表格是否有边框和背景色"
echo "   ✓ 代码块是否有深色背景"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
