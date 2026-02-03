# Favicon 修复完成

## 问题原因

`useFavicon` Hook 已经定义，但在 `App` 组件中**没有被调用**。

## 修复内容

在 `src/App.jsx` 的 `App` 组件中添加了调用：

```javascript
const App = () => {
  // ... 其他状态定义
  
  // 加载动态 favicon
  useFavicon();  // ← 添加这一行
  
  // ... 其他代码
}
```

## 现在的工作流程

1. **页面加载时**
   - `useFavicon()` Hook 自动执行
   - 从 `/api/settings/public` 获取 `siteFavicon` 配置
   - 如果配置了 favicon，动态添加到 `<head>` 中

2. **动态添加的代码**
```html
<head>
  <link rel="icon" href="/icons/usdt.svg">
  <link rel="apple-touch-icon" href="/icons/usdt.svg">
</head>
```

## 使用步骤

### 1. 准备文件

已完成：
```
public/icons/usdt.svg  ← 文件已准备好
```

### 2. 编译项目

```bash
npm run build
```

### 3. 部署到服务器

上传 `dist` 目录到服务器：
```
/www/wwwroot/kk.vpno.eu.org/easypay/
├── icons/
│   └── usdt.svg
├── assets/
└── index.html
```

### 4. 后台配置

登录管理后台 → 设置 → 网站信息 → 网站图标 (Favicon)

填写：
```
/icons/usdt.svg
```

点击"保存设置"。

### 5. 验证

1. **检查文件是否存在**
   访问：`https://kk.vpno.eu.org/icons/usdt.svg`
   应该能看到 USDT 图标

2. **检查 API 返回**
   打开浏览器控制台，访问：
   ```
   https://kk.vpno.eu.org/api/settings/public
   ```
   应该看到：
   ```json
   {
     "siteFavicon": "/icons/usdt.svg",
     ...
   }
   ```

3. **检查 HTML head**
   打开 F12 → Elements → 查看 `<head>` 标签
   应该看到：
   ```html
   <link rel="icon" href="/icons/usdt.svg">
   <link rel="apple-touch-icon" href="/icons/usdt.svg">
   ```

4. **清除缓存**
   强制刷新：`Ctrl + F5`

## 测试清单

- [ ] 编译项目：`npm run build`
- [ ] 上传 `dist` 到服务器
- [ ] 确认 `/icons/usdt.svg` 文件存在
- [ ] 后台配置 Favicon 为 `/icons/usdt.svg`
- [ ] 保存设置
- [ ] 刷新页面
- [ ] F12 检查 `<head>` 中是否有 `<link rel="icon">`
- [ ] 浏览器标签页显示 USDT 图标

## 常见问题

### Q1: 保存后还是不显示？

**A:** 检查步骤：
1. 打开 F12 → Network 标签
2. 刷新页面
3. 查找 `/api/settings/public` 请求
4. 检查返回的 `siteFavicon` 字段是否正确
5. 查找 `/icons/usdt.svg` 请求
6. 如果是 404，说明文件不存在或路径错误

### Q2: head 中没有 link 标签？

**A:** 可能原因：
1. `siteFavicon` 配置为空
2. API 请求失败
3. 打开浏览器控制台查看错误信息

### Q3: 显示的是旧图标？

**A:** 浏览器缓存问题：
1. 强制刷新：`Ctrl + F5`
2. 清除浏览器缓存
3. 或者使用隐私模式测试

### Q4: 可以使用外部链接吗？

**A:** 可以！直接填写完整 URL：
```
https://example.com/favicon.ico
```

## 支持的格式

- `.ico` - 传统 favicon 格式
- `.png` - 推荐，支持透明背景
- `.svg` - 矢量图，任意缩放不失真
- `.jpg` - 不推荐（不支持透明背景）

## 推荐尺寸

- **Favicon**: 32x32 或 64x64
- **Apple Touch Icon**: 180x180
- **SVG**: 任意尺寸（矢量图）

## 完成状态

✅ 代码已修复
✅ `useFavicon()` 已调用
✅ `public/icons/usdt.svg` 已准备
✅ 无语法错误

📝 **下一步：**
1. 编译：`npm run build`
2. 部署到服务器
3. 后台配置：`/icons/usdt.svg`
4. 刷新页面查看效果
