# Favicon 配置说明

## 问题原因

Vite 编译时，`src/assets/` 下的文件会被：
1. 打包到 `dist/assets/` 目录
2. 文件名会被哈希化（如 `usdt-a1b2c3d4.svg`）
3. 路径会变化，导致后台配置的固定路径失效

## 解决方案：使用 public 目录

### 1. 目录结构

```
项目根目录/
├── public/              ← 新建目录
│   └── icons/          ← 存放 favicon 和 logo
│       └── usdt.svg    ← 你的 favicon 文件
├── src/
└── dist/               ← 编译后
    ├── icons/          ← public/icons 会被直接复制到这里
    │   └── usdt.svg    ← 文件名不变
    └── assets/         ← src/assets 编译后的文件（哈希化）
```

### 2. 工作原理

Vite 会将 `public` 目录下的文件**直接复制**到 `dist` 根目录：
- `public/icons/usdt.svg` → `dist/icons/usdt.svg`
- 文件名不变，路径不变
- 适合需要固定路径的静态资源（favicon、logo、robots.txt 等）

### 3. 配置步骤

#### 步骤 1: 准备文件

已完成！文件已复制到：
```
public/icons/usdt.svg
```

#### 步骤 2: 后台配置

登录管理后台，进入设置页面：

**网站图标 (Favicon) 配置：**
```
/icons/usdt.svg
```

**网站 Logo 配置（如果需要）：**
```
/icons/usdt.svg
```

#### 步骤 3: 编译部署

```bash
# 本地编译
npm run build

# 编译后的文件结构
dist/
├── icons/
│   └── usdt.svg    ← 文件会被复制到这里
├── assets/
│   └── index-xxx.js
└── index.html
```

#### 步骤 4: 上传到服务器

将 `dist` 目录的内容上传到服务器：
```
/www/wwwroot/kk.vpno.eu.org/easypay/
├── icons/
│   └── usdt.svg
├── assets/
└── index.html
```

#### 步骤 5: 验证

访问：`https://kk.vpno.eu.org/icons/usdt.svg`

应该能看到 SVG 图标。

### 4. 浏览器缓存问题

如果修改后不生效，清除浏览器缓存：
- Chrome: `Ctrl + Shift + Delete`
- 或者强制刷新：`Ctrl + F5`

---

## 方案 2：使用图床（备选）

如果不想修改项目结构，可以将图标上传到图床：

### 推荐图床服务

1. **ImgBB** (免费)
   - 网址：https://imgbb.com
   - 上传后获得直链

2. **SM.MS** (免费)
   - 网址：https://sm.ms
   - 支持 API

3. **自己的 CDN**
   - 阿里云 OSS
   - 腾讯云 COS

### 使用步骤

1. 上传 `usdt.svg` 到图床
2. 获得直链，如：`https://i.ibb.co/xxx/usdt.svg`
3. 在后台配置中填写这个直链

---

## 其他静态资源

如果你还需要配置其他静态资源，也放到 `public` 目录：

```
public/
├── icons/
│   ├── usdt.svg      ← Favicon
│   ├── logo.png      ← Logo
│   └── trx.svg       ← 其他图标
├── favicon.ico       ← 传统 favicon
└── robots.txt        ← SEO 文件
```

访问路径：
- `/icons/usdt.svg`
- `/icons/logo.png`
- `/favicon.ico`
- `/robots.txt`

---

## 常见问题

### Q1: 为什么不能直接用 src/assets/icons/usdt.svg？

**A:** 因为 Vite 编译时会：
```
src/assets/icons/usdt.svg
    ↓ 编译
dist/assets/usdt-a1b2c3d4.svg  ← 文件名被哈希化
```

后台配置的固定路径 `/icons/usdt.svg` 找不到文件。

### Q2: public 目录的文件会被压缩吗？

**A:** 不会。`public` 目录的文件会被**原样复制**到 `dist`，不会被：
- 压缩
- 哈希化
- 优化

如果需要压缩，建议使用图床或 CDN。

### Q3: 可以在 public 目录放大文件吗？

**A:** 可以，但不推荐：
- `public` 的文件会被完整复制到 `dist`
- 大文件会增加部署包大小
- 建议大文件使用 CDN

### Q4: 修改 public 文件后需要重新编译吗？

**A:** 是的：
```bash
npm run build
```

然后重新部署 `dist` 目录。

### Q5: SVG 文件在浏览器中显示不正常？

**A:** 检查 SVG 文件格式：
1. 确保是有效的 SVG 文件
2. 检查 MIME 类型（Nginx 配置）：
```nginx
location ~* \.svg$ {
    add_header Content-Type image/svg+xml;
}
```

---

## 推荐配置

### 开发环境

使用 `public` 目录：
```
public/icons/usdt.svg
```

后台配置：
```
/icons/usdt.svg
```

### 生产环境

**选项 1: 使用 public（简单）**
- 优点：配置简单，路径固定
- 缺点：文件在项目中，增加部署包大小

**选项 2: 使用 CDN（推荐）**
- 优点：加载快，不占用服务器带宽
- 缺点：需要额外配置 CDN

---

## 总结

✅ **已完成：**
1. 创建 `public/icons/` 目录
2. 复制 `usdt.svg` 到 `public/icons/usdt.svg`

📝 **下一步：**
1. 编译项目：`npm run build`
2. 部署 `dist` 目录到服务器
3. 在后台设置中填写：`/icons/usdt.svg`
4. 刷新页面查看效果

🎯 **访问路径：**
- 本地开发：`http://localhost:3000/icons/usdt.svg`
- 生产环境：`https://kk.vpno.eu.org/icons/usdt.svg`
