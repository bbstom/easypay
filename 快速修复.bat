@echo off
echo ========================================
echo 钱包显示问题 - 快速修复脚本
echo ========================================
echo.

echo [1/4] 停止前端服务...
echo 请手动按 Ctrl+C 停止前端服务，然后按任意键继续...
pause > nul

echo.
echo [2/4] 清理 Vite 缓存...
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo ✓ Vite 缓存已清理
) else (
    echo ✓ 没有找到 Vite 缓存
)

echo.
echo [3/4] 测试后端API...
node server/scripts/testWalletApi.js

echo.
echo [4/4] 重启前端服务...
echo 请在新的终端窗口运行: npm run dev
echo.

echo ========================================
echo 修复完成！
echo ========================================
echo.
echo 接下来请：
echo 1. 在新终端运行: npm run dev
echo 2. 在浏览器中按 Ctrl+F5 强制刷新
echo 3. 访问: http://localhost:3000/payment-system?tab=wallets
echo.
pause
