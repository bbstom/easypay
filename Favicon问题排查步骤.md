# Favicon 问题排查步骤

## 当前状态

✅ 代码已修复（`useFavicon()` 已调用）
❌ 生产环境 `<head>` 中没有 favicon 标签

## 排查步骤

### 步骤 1: 确认是否重新编译和部署

**问题：** 修改代码后必须重新编译，否则生产环境还是旧代码。

**操作：**
```bash
# 1. 重新编译
npm run build

# 2. 检查编译后的文件时间
# Windows:
dir dist\assets\index-*.js

# 应该看到最新的时间戳
```

**验证：**
- 编译后的 `dist/assets/index-*.js` 文件应该是最新时间
- 如果时间是旧的，说明没有重新编译

### 步骤 2: 上传到服务器

**操作：**
```bash
# 上传整个 dist 目录到服务器
# 路径：/www/wwwroot/kk.vpno.eu.org/easypay/

# 确保上传了：
# - dist/assets/index-*.js  (新编译的 JS 文件)
# - dist/icons/usdt.svg     (favicon 文件)
```

**验证：**
- SSH 登录服务器
- 检查文件时间：`ls -lh /www/wwwroot/kk.vpno.eu.org/easypay/assets/index-*.js`
- 应该是最新时间

### 步骤 3: 清除浏览器缓存

**问题：** 浏览器可能缓存了旧的 JS 文件。

**操作：**
1. 打开 F12 → Network 标签
2. 勾选 "Disable cache"
3. 刷新页面（Ctrl + F5）
4. 查看 `index-*.js` 文件的请求
5. 确认返回的是 200（不是 304 缓存）

### 步骤 4: 检查 API 返回

**操作：**
1. 打开浏览器控制台（F12）
2. 输入并执行：
```javascript
fetch('/api/settings/public')
  .then(res => res.json())
  .then(data => console.log('siteFavicon:', data.siteFavicon))
```

**预期结果：**
```
siteFavicon: /icons/usdt.svg
```

**如果返回空或 undefined：**
- 说明后台没有保存配置
- 重新登录管理后台
- 设置 → 网站信息 → Favicon 输入框填写：`/icons/usdt.svg`
- 点击"保存设置"
- 再次检查 API 返回

### 步骤 5: 检查控制台错误

**操作：**
1. 打开 F12 → Console 标签
2. 刷新页面
3. 查看是否有错误信息

**常见错误：**

**错误 1: "加载 favicon 失败"**
```
加载 favicon 失败: Error: Request failed with status code 500
```
→ 后端 API 错误，检查服务器日志

**错误 2: 404 Not Found**
```
GET https://kk.vpno.eu.org/icons/usdt.svg 404
```
→ 文件不存在，检查 `dist/icons/usdt.svg` 是否上传

**错误 3: CORS 错误**
```
Access to fetch at '/api/settings/public' has been blocked by CORS
```
→ Nginx 配置问题

### 步骤 6: 手动测试 useFavicon

**操作：**
1. 打开浏览器控制台（F12）
2. 输入并执行以下代码：

```javascript
// 手动执行 useFavicon 的逻辑
(async () => {
  try {
    const response = await fetch('/api/settings/public');
    const data = await response.json();
    
    console.log('API 返回:', data);
    console.log('siteFavicon:', data.siteFavicon);
    
    if (data.siteFavicon) {
      // 移除现有的 favicon
      const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
      console.log('移除现有 favicon:', existingFavicons.length);
      existingFavicons.forEach(link => link.remove());
      
      // 添加新的 favicon
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = data.siteFavicon;
      document.head.appendChild(link);
      console.log('✅ 已添加 favicon:', data.siteFavicon);
      
      // 添加 apple-touch-icon
      const appleLink = document.createElement('link');
      appleLink.rel = 'apple-touch-icon';
      appleLink.href = data.siteFavicon;
      document.head.appendChild(appleLink);
      console.log('✅ 已添加 apple-touch-icon');
      
      // 检查是否添加成功
      const newFavicons = document.querySelectorAll('link[rel*="icon"]');
      console.log('当前 favicon 数量:', newFavicons.length);
      newFavicons.forEach(link => {
        console.log('  -', link.rel, ':', link.href);
      });
    } else {
      console.log('❌ siteFavicon 未配置');
    }
  } catch (error) {
    console.error('❌ 错误:', error);
  }
})();
```

**预期输出：**
```
API 返回: {siteName: "...", siteFavicon: "/icons/usdt.svg", ...}
siteFavicon: /icons/usdt.svg
移除现有 favicon: 0
✅ 已添加 favicon: /icons/usdt.svg
✅ 已添加 apple-touch-icon
当前 favicon 数量: 2
  - icon : https://kk.vpno.eu.org/icons/usdt.svg
  - apple-touch-icon : https://kk.vpno.eu.org/icons/usdt.svg
```

### 步骤 7: 使用调试页面

**操作：**
1. 将 `favicon-debug.html` 上传到 `dist` 目录
2. 访问：`https://kk.vpno.eu.org/favicon-debug.html`
3. 查看 API 返回结果
4. 点击"点击添加 Favicon"按钮
5. 打开 F12 查看 `<head>` 标签

## 快速诊断

### 场景 A: API 返回 siteFavicon 为空

**原因：** 后台没有保存配置

**解决：**
1. 登录管理后台
2. 设置 → 网站信息
3. Favicon 输入框填写：`/icons/usdt.svg`
4. 点击"保存设置"
5. 刷新前端页面

### 场景 B: API 返回正确，但 head 中没有标签

**原因：** 前端代码没有更新

**解决：**
1. 重新编译：`npm run build`
2. 上传 `dist` 目录到服务器
3. 清除浏览器缓存（Ctrl + Shift + Delete）
4. 强制刷新（Ctrl + F5）

### 场景 C: 手动执行代码可以添加，但页面加载时不添加

**原因：** `useFavicon()` 没有被调用或执行时机有问题

**解决：**
1. 检查 `src/App.jsx` 中是否有 `useFavicon();`
2. 确认代码位置正确（在 App 组件内部）
3. 重新编译和部署

### 场景 D: 文件 404

**原因：** `dist/icons/usdt.svg` 不存在

**解决：**
1. 检查本地 `dist/icons/usdt.svg` 是否存在
2. 如果不存在，检查 `public/icons/usdt.svg` 是否存在
3. 重新编译：`npm run build`
4. 上传到服务器

## 终极解决方案

如果以上步骤都不行，使用最简单的方法：

### 方法 1: 直接在 index.html 中添加

编辑 `index.html`：

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/icons/usdt.svg" />
    <link rel="apple-touch-icon" href="/icons/usdt.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FastPay</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

然后重新编译和部署。

### 方法 2: 使用外部链接

如果本地文件有问题，使用图床：

1. 上传 `usdt.svg` 到图床（如 ImgBB）
2. 获得直链：`https://i.ibb.co/xxx/usdt.svg`
3. 在后台配置中填写这个直链

## 检查清单

- [ ] 代码已修改（`useFavicon()` 已调用）
- [ ] 已重新编译（`npm run build`）
- [ ] 编译后的文件是最新时间
- [ ] `dist/icons/usdt.svg` 文件存在
- [ ] 已上传到服务器
- [ ] 服务器文件是最新时间
- [ ] 后台已配置 `/icons/usdt.svg`
- [ ] 后台已保存设置
- [ ] API 返回 `siteFavicon: "/icons/usdt.svg"`
- [ ] 已清除浏览器缓存
- [ ] 已强制刷新（Ctrl + F5）
- [ ] 控制台没有错误
- [ ] 手动执行代码可以添加 favicon

## 需要提供的信息

如果还是不行，请提供：

1. **API 返回结果**
   ```javascript
   fetch('/api/settings/public').then(r=>r.json()).then(console.log)
   ```

2. **控制台错误信息**
   F12 → Console 标签的截图

3. **Network 请求**
   F12 → Network 标签，查看：
   - `/api/settings/public` 的响应
   - `index-*.js` 的状态码（200 还是 304）
   - `/icons/usdt.svg` 的状态码

4. **文件是否存在**
   访问：`https://kk.vpno.eu.org/icons/usdt.svg`
   是否能看到图标？

5. **编译时间**
   本地 `dist/assets/index-*.js` 的修改时间
