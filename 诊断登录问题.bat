@echo off
chcp 65001 >nul
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🔍 登录问题诊断工具
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

echo 步骤 1: 检查用户和密码
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
node server/scripts/checkUserPassword.js
echo.

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 💡 下一步操作
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 如果密码正确，请在浏览器中使用该账号密码登录
echo 如果密码不正确，请运行: node server/scripts/resetPassword.js
echo 如果要创建新管理员，请运行: node server/scripts/createNewAdmin.js
echo.

pause
