# 解决 Git 冲突 - 立即执行

## 问题

```
error: Your local changes to the following files would be overwritten by merge:
        package-lock.json
        package.json
Please commit your changes or stash them before you merge.
```

## 原因

服务器上的 `package.json` 和 `package-lock.json` 有本地修改（可能是之前手动安装包导致的）。

---

## 解决方案（3 选 1）

### 方案 1：保留远程版本（推荐）

强制使用 GitHub 上的最新版本：

```bash
cd /www/wwwroot/kk.vpno.eu.org/easypay

# 放弃本地修改，使用远程版本
git checkout -- package.json package-lock.json

# 拉取最新代码
git pull origin main

# 重新安装依赖
npm install

# 验证
npm list @tailwindcss/typography
```

### 方案 2：保留本地修改

如果服务器上的修改是你想要的：

```bash
cd /www/wwwroot/kk.vpno.eu.org/easypay

# 暂存本地修改
git stash

# 拉取最新代码
git pull origin main

# 恢复本地修改（可能有冲突）
git stash pop

# 如果有冲突，手动解决后：
git add package.json package-lock.json
git commit -m "合并本地修改"
```

### 方案 3：强制覆盖（最简单）

完全使用远程版本，忽略本地所有修改：

```bash
cd /www/wwwroot/kk.vpno.eu.org/easypay

# 强制重置到远程版本
git fetch origin
git reset --hard origin/main

# 重新安装依赖
npm install

# 验证
npm list @tailwindcss/typography
```

---

## 推荐执行（一键完成）

### 最简单的方式（推荐）

```bash
cd /www/wwwroot/kk.vpno.eu.org/easypay && \
git fetch origin && \
git reset --hard origin/main && \
npm install && \
echo "" && \
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" && \
echo "验证安装：" && \
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" && \
npm list @tailwindcss/typography && \
npm list remark-gfm && \
npm list rehype-raw && \
npm list rehype-sanitize && \
echo "" && \
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" && \
echo "清除缓存并构建：" && \
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" && \
rm -rf dist node_modules/.vite && \
npm run build && \
echo "" && \
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" && \
echo "验证构建产物：" && \
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" && \
grep -o "\.prose" dist/assets/*.css | head -5 && \
echo "" && \
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" && \
echo "重启服务：" && \
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" && \
pm2 restart all && \
echo "" && \
echo "✅ 完成！请在浏览器中按 Ctrl+Shift+R 硬刷新"
```

---

## 执行后的预期结果

### 1. Git 状态

```bash
git status
```

应该显示：
```
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

### 2. 依赖安装

```bash
npm list @tailwindcss/typography
```

应该显示：
```
usdt-payment-platform@1.0.0 /www/wwwroot/kk.vpno.eu.org/easypay
└── @tailwindcss/typography@0.5.19
```

**不应该显示**：
```
└── (empty)  ❌
```

### 3. 构建产物

```bash
grep -o "\.prose" dist/assets/*.css | head -5
```

应该显示：
```
.prose
.prose-lg
.prose-slate
.prose-h2\:text-3xl
.prose-h3\:text-2xl
```

### 4. 服务状态

```bash
pm2 list
```

应该显示服务正在运行。

---

## 如果还是不行

### 检查 package.json 内容

```bash
cat package.json | grep -A 5 "dependencies"
```

应该看到：
```json
"dependencies": {
  "@tailwindcss/typography": "^0.5.19",
  "axios": "^1.6.2",
  ...
}
```

### 检查 tailwind.config.js

```bash
cat tailwind.config.js | grep -A 3 "plugins"
```

应该看到：
```javascript
plugins: [
  require('@tailwindcss/typography'),
],
```

### 手动验证构建

```bash
# 查看 CSS 文件大小
ls -lh dist/assets/*.css

# 查看 CSS 文件内容（前 100 行）
head -100 dist/assets/*.css | grep prose
```

---

## 完整的验证清单

执行完成后，检查以下内容：

- [ ] `git status` 显示 working tree clean
- [ ] `npm list @tailwindcss/typography` 显示版本号
- [ ] `npm list remark-gfm` 显示版本号
- [ ] `npm list rehype-raw` 显示版本号
- [ ] `npm list rehype-sanitize` 显示版本号
- [ ] `dist` 目录存在
- [ ] `dist/assets/*.css` 文件包含 `.prose` 样式
- [ ] `pm2 list` 显示服务运行中
- [ ] 浏览器访问博客文章，样式正常

---

## 浏览器验证

1. **清除缓存**：
   - 按 `Ctrl + Shift + Delete`
   - 选择"缓存的图片和文件"
   - 点击"清除数据"

2. **硬刷新**：
   - 按 `Ctrl + Shift + R`（Windows/Linux）
   - 或 `Cmd + Shift + R`（Mac）

3. **访问博客**：
   ```
   https://kk.vpno.eu.org/blog/usdt-代付完全指南-从入门到精通
   ```

4. **检查样式**：
   - H2 标题应该有底部边框
   - H2、H3、H4 大小应该递减
   - 段落之间应该有间距
   - 列表应该有缩进和符号
   - 表格应该有边框和背景色
   - 代码块应该有深色背景

5. **使用开发者工具验证**（F12）：
   ```javascript
   // 在 Console 中执行
   const h2 = document.querySelector('.prose h2');
   console.log(window.getComputedStyle(h2).fontSize); // 应该是 "30px"
   console.log(window.getComputedStyle(h2).borderBottom); // 应该有边框
   ```

---

## 总结

问题的根源是：
1. 服务器上的 `package.json` 有本地修改
2. Git 无法拉取远程更新
3. 导致依赖没有更新

解决方法：
1. 使用 `git reset --hard origin/main` 强制使用远程版本
2. 重新安装依赖
3. 重新构建
4. 重启服务

现在执行上面的一键命令，问题就解决了！
