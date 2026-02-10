#!/bin/bash

# 服务器诊断脚本
# 使用方法：bash 服务器诊断.sh

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 开始诊断服务器环境"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. 检查 package.json 内容
echo "1️⃣  检查 package.json 中的 typography："
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if grep -q "@tailwindcss/typography" package.json; then
  echo "✅ package.json 包含 typography"
  cat package.json | grep -A 1 -B 1 typography
else
  echo "❌ package.json 不包含 typography"
  echo ""
  echo "📝 dependencies 部分："
  cat package.json | grep -A 10 '"dependencies"'
fi

echo ""
echo ""

# 2. 检查文件时间
echo "2️⃣  package.json 文件信息："
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ls -lh package.json
echo ""
stat package.json | grep -E "Modify|Change"

echo ""
echo ""

# 3. 检查 Git 状态
echo "3️⃣  Git 状态："
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -d ".git" ]; then
  git status --short
  echo ""
  echo "最后一次提交："
  git log -1 --oneline
  echo ""
  echo "package.json 的 Git 历史："
  git log -1 --stat | grep package.json
else
  echo "⚠️  不是 Git 仓库"
fi

echo ""
echo ""

# 4. 检查 node_modules
echo "4️⃣  node_modules 状态："
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -d "node_modules" ]; then
  echo "✅ node_modules 存在"
  echo "大小：$(du -sh node_modules | cut -f1)"
  
  if [ -d "node_modules/@tailwindcss/typography" ]; then
    echo "✅ typography 目录存在"
    ls -lh node_modules/@tailwindcss/typography/package.json
  else
    echo "❌ typography 目录不存在"
  fi
else
  echo "❌ node_modules 不存在"
fi

echo ""
echo ""

# 5. 检查 package-lock.json
echo "5️⃣  package-lock.json 状态："
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f "package-lock.json" ]; then
  echo "✅ package-lock.json 存在"
  ls -lh package-lock.json
  echo ""
  if grep -q "@tailwindcss/typography" package-lock.json; then
    echo "✅ package-lock.json 包含 typography"
  else
    echo "❌ package-lock.json 不包含 typography"
  fi
else
  echo "❌ package-lock.json 不存在"
fi

echo ""
echo ""

# 6. 检查 npm 配置
echo "6️⃣  npm 配置："
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "npm 版本：$(npm -v)"
echo "node 版本：$(node -v)"
echo "npm 源：$(npm config get registry)"

echo ""
echo ""

# 7. 尝试查看已安装的包
echo "7️⃣  已安装的包："
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm list @tailwindcss/typography 2>&1

echo ""
echo ""

# 8. 总结
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 诊断总结"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

HAS_IN_PACKAGE=$(grep -q "@tailwindcss/typography" package.json && echo "是" || echo "否")
HAS_IN_MODULES=$([ -d "node_modules/@tailwindcss/typography" ] && echo "是" || echo "否")
HAS_IN_LOCK=$([ -f "package-lock.json" ] && grep -q "@tailwindcss/typography" package-lock.json && echo "是" || echo "否")

echo "package.json 包含 typography: $HAS_IN_PACKAGE"
echo "node_modules 包含 typography: $HAS_IN_MODULES"
echo "package-lock.json 包含 typography: $HAS_IN_LOCK"

echo ""

if [ "$HAS_IN_PACKAGE" = "是" ] && [ "$HAS_IN_MODULES" = "否" ]; then
  echo "🔧 建议操作："
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "package.json 有依赖但未安装，执行："
  echo ""
  echo "rm -rf package-lock.json node_modules"
  echo "npm install"
  echo ""
elif [ "$HAS_IN_PACKAGE" = "否" ]; then
  echo "🔧 建议操作："
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "package.json 缺少依赖，执行："
  echo ""
  echo "npm install @tailwindcss/typography --save"
  echo ""
else
  echo "✅ 依赖配置正常"
fi

echo ""
