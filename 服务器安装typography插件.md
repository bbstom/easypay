# 服务器安装 Typography 插件

## 问题诊断

```bash
npm list @tailwindcss/typography
└── (empty)
```

说明服务器上没有安装 `@tailwindcss/typography` 插件。

## 原因

服务器上的 `package.json` 可能是旧版本，没有包含这个依赖。

---

## 解决方案

### 方案 1：直接在服务器上安装（最快）

```bash
# 1. 进入项目目录
cd /www/wwwroot/kk.vpno.eu.org/easypay

# 2. 安装 typography 插件
npm install @tailwindcss/typography --save

# 3. 验证安装
npm list @tailwindcss/typography

# 应该显示：
# └── @tailwindcss/typography@0.5.19

# 4. 清除缓存
rm -rf dist node_modules/.vite

# 5. 重新构建
npm run build

# 6. 重启服务
pm2 restart all
```

### 方案 2：推送本地代码到服务器（推荐）

**在本地执行**：

```bash
# 1. 确认本地 package.json 包含 typography
cat package.json | grep typography

# 2. 提交更改
git add package.json tailwind.config.js
git commit -m "添加 @tailwindcss/typography 插件"

# 3. 推送到远程仓库
git push origin main
```

**在服务器执行**：

```bash
# 1. 进入项目目录
cd /www/wwwroot/kk.vpno.eu.org/easypay

# 2. 拉取最新代码
git pull origin main

# 3. 安装依赖
npm install

# 4. 验证安装
npm list @tailwindcss/typography

# 5. 清除缓存并构建
rm -rf dist node_modules/.vite
npm run build

# 6. 重启服务
pm2 restart all
```

### 方案 3：手动上传 package.json

如果不使用 Git，可以手动上传：

1. 将本地的 `package.json` 上传到服务器
2. 将本地的 `tailwind.config.js` 上传到服务器
3. 在服务器执行：

```bash
cd /www/wwwroot/kk.vpno.eu.org/easypay
npm install
rm -rf dist node_modules/.vite
npm run build
pm2 restart all
```

---

## 快速执行（复制粘贴）

### 方案 1：直接安装（最快，推荐）

```bash
cd /www/wwwroot/kk.vpno.eu.org/easypay && \
npm install @tailwindcss/typography --save && \
npm list @tailwindcss/typography && \
rm -rf dist node_modules/.vite && \
npm run build && \
pm2 restart all && \
echo "✅ 完成！请在浏览器中硬刷新（Ctrl+Shift+R）"
```

### 方案 2：使用 Git（如果有仓库）

```bash
cd /www/wwwroot/kk.vpno.eu.org/easypay && \
git pull origin main && \
npm install && \
npm list @tailwindcss/typography && \
rm -rf dist node_modules/.vite && \
npm run build && \
pm2 restart all && \
echo "✅ 完成！请在浏览器中硬刷新（Ctrl+Shift+R）"
```

---

## 验证步骤

### 1. 检查安装

```bash
npm list @tailwindcss/typography
```

**应该显示**：
```
usdt-payment-platform@1.0.0 /www/wwwroot/kk.vpno.eu.org/easypay
└── @tailwindcss/typography@0.5.19
```

**不应该显示**：
```
└── (empty)
```

### 2. 检查 package.json

```bash
cat package.json | grep typography
```

**应该看到**：
```json
"@tailwindcss/typography": "^0.5.19",
```

### 3. 检查 tailwind.config.js

```bash
cat tailwind.config.js | grep typography
```

**应该看到**：
```javascript
require('@tailwindcss/typography'),
```

### 4. 检查构建产物

```bash
# 构建后检查 CSS 文件
grep -o "\.prose" dist/assets/*.css | head -5
```

**应该看到**：
```
.prose
.prose-lg
.prose-slate
.prose-h2\:text-3xl
.prose-h3\:text-2xl
```

---

## 常见问题

### Q1: npm install 后还是 (empty)

**原因**：package.json 中没有这个依赖

**解决**：
```bash
# 手动安装并保存到 package.json
npm install @tailwindcss/typography --save

# 检查 package.json
cat package.json | grep typography
```

### Q2: 安装成功但构建后没有样式

**原因**：tailwind.config.js 没有配置插件

**解决**：
```bash
# 检查配置
cat tailwind.config.js

# 确保包含：
# plugins: [
#   require('@tailwindcss/typography'),
# ],
```

### Q3: Git pull 后依赖没更新

**原因**：需要手动运行 npm install

**解决**：
```bash
git pull origin main
npm install  # 这一步不能省略
```

---

## 完整的服务器配置检查

```bash
# 1. 检查 Node.js 版本
node -v
# 应该 >= 16.x

# 2. 检查 npm 版本
npm -v
# 应该 >= 8.x

# 3. 检查项目目录
pwd
# 应该是 /www/wwwroot/kk.vpno.eu.org/easypay

# 4. 检查 package.json 是否存在
ls -lh package.json

# 5. 检查 tailwind.config.js 是否存在
ls -lh tailwind.config.js

# 6. 检查 node_modules 目录
ls -lh node_modules/ | head -10

# 7. 检查磁盘空间
df -h

# 8. 检查权限
ls -la | grep package.json
```

---

## 推荐的部署流程

以后部署时，按这个顺序执行：

```bash
#!/bin/bash

# 1. 进入项目目录
cd /www/wwwroot/kk.vpno.eu.org/easypay

# 2. 拉取最新代码（如果使用 Git）
git pull origin main

# 3. 安装/更新依赖
npm install

# 4. 验证关键依赖
echo "检查依赖..."
npm list @tailwindcss/typography
npm list react-markdown
npm list remark-gfm

# 5. 清除缓存
echo "清除缓存..."
rm -rf dist node_modules/.vite

# 6. 构建
echo "构建项目..."
npm run build

# 7. 验证构建
echo "验证构建..."
if grep -q "\.prose" dist/assets/*.css; then
  echo "✅ 构建成功，包含 prose 样式"
else
  echo "❌ 构建失败，CSS 中没有 prose 样式"
  exit 1
fi

# 8. 重启服务
echo "重启服务..."
pm2 restart all

# 9. 显示状态
pm2 list

echo "✅ 部署完成！"
```

保存为 `deploy.sh`，以后直接运行：
```bash
bash deploy.sh
```

---

## 立即执行

现在在服务器上执行这个命令：

```bash
cd /www/wwwroot/kk.vpno.eu.org/easypay && \
npm install @tailwindcss/typography --save && \
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" && \
echo "检查安装结果：" && \
npm list @tailwindcss/typography && \
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" && \
echo "清除缓存..." && \
rm -rf dist node_modules/.vite && \
echo "开始构建..." && \
npm run build && \
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" && \
echo "验证构建产物：" && \
grep -o "\.prose" dist/assets/*.css | head -5 && \
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" && \
echo "重启服务..." && \
pm2 restart all && \
echo "✅ 完成！"
```

执行后，你应该看到：
1. Typography 插件安装成功
2. 构建成功
3. CSS 文件中包含 `.prose` 样式
4. 服务重启成功

然后在浏览器中硬刷新（Ctrl + Shift + R）就能看到效果了！
