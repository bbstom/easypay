@echo off
chcp 65001 >nul
echo.
echo 🔧 开始修复生产环境样式问题...
echo.

REM 1. 检查当前目录
if not exist "package.json" (
  echo ❌ 错误：请在项目根目录运行此脚本
  pause
  exit /b 1
)

REM 2. 检查 Tailwind 配置
echo 📋 检查 Tailwind 配置...
findstr /C:"@tailwindcss/typography" tailwind.config.js >nul
if %errorlevel% equ 0 (
  echo ✅ Tailwind 配置正确
) else (
  echo ❌ Tailwind 配置缺少 typography 插件
  echo 请手动添加到 tailwind.config.js 的 plugins 数组中
  pause
  exit /b 1
)

REM 3. 检查依赖
echo.
echo 📦 检查依赖...
npm list @tailwindcss/typography >nul 2>&1
if %errorlevel% equ 0 (
  echo ✅ Typography 插件已安装
) else (
  echo ⚠️  Typography 插件未安装，正在安装...
  npm install @tailwindcss/typography
)

REM 4. 清除旧的构建产物
echo.
echo 🧹 清除旧的构建产物...
if exist "dist" rmdir /s /q dist
if exist "node_modules\.vite" rmdir /s /q node_modules\.vite
echo ✅ 清除完成

REM 5. 重新构建
echo.
echo 🔨 重新构建项目...
call npm run build

if %errorlevel% neq 0 (
  echo ❌ 构建失败，请检查错误信息
  pause
  exit /b 1
)

REM 6. 验证构建产物
echo.
echo 🔍 验证构建产物...

if not exist "dist" (
  echo ❌ dist 目录不存在
  pause
  exit /b 1
)

REM 检查 CSS 文件
dir /b /s dist\assets\*.css >nul 2>&1
if %errorlevel% neq 0 (
  echo ❌ 没有找到 CSS 文件
  pause
  exit /b 1
)

echo ✅ 构建产物验证通过

REM 7. 重启服务
echo.
echo 🔄 重启服务...

where pm2 >nul 2>&1
if %errorlevel% equ 0 (
  pm2 restart all
  echo ✅ PM2 服务已重启
  
  REM 等待服务启动
  timeout /t 2 /nobreak >nul
  
  REM 显示服务状态
  echo.
  echo 📊 服务状态：
  pm2 list
) else (
  echo ⚠️  未检测到 PM2，请手动重启服务
)

REM 8. 完成
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ✅ 修复完成！
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 📝 下一步操作：
echo 1. 在浏览器中清除缓存（Ctrl + Shift + Delete）
echo 2. 硬刷新页面（Ctrl + Shift + R）
echo 3. 访问博客文章页面验证样式
echo.
echo 🔗 测试链接：
echo https://kk.vpno.eu.org/blog/usdt-代付完全指南-从入门到精通
echo.
pause
