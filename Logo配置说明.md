# Logo 配置说明

## 关于 Logo 文件名和尺寸

### Logo 文件名

**不是必须叫 `logo.png`**，你可以使用任何文件名，例如：
- `logo.png`
- `brand-logo.png`
- `company-logo.png`
- `icon-512.png`
- 任何你喜欢的名字

**修改方法**：

如果你的 Logo 文件名不是 `logo.png`，需要修改 `index.html` 中的 URL：

```html
<!-- 修改前 -->
"url": "https://dd.vpno.eu.org/logo.png"

<!-- 修改后（例如使用 brand-logo.png） -->
"url": "https://dd.vpno.eu.org/brand-logo.png"
```

### Logo 尺寸

**不是必须 512x512px**，但有最低要求：

#### Google 要求

- **最小尺寸**：112x112px
- **推荐尺寸**：512x512px 或更大
- **宽高比**：1:1（正方形）
- **格式**：PNG、JPG、SVG、WebP
- **文件大小**：< 5MB

#### Bing 要求

- **最小尺寸**：160x160px
- **推荐尺寸**：512x512px
- **宽高比**：1:1（正方形）
- **格式**：PNG、JPG

#### 常用尺寸

| 尺寸 | 用途 | 推荐度 |
|------|------|--------|
| 192x192px | PWA 图标 | ⭐⭐⭐ |
| 256x256px | 中等尺寸 | ⭐⭐⭐ |
| 512x512px | 搜索引擎 Logo | ⭐⭐⭐⭐⭐ |
| 1024x1024px | 高清显示 | ⭐⭐⭐⭐ |

**建议**：使用 512x512px，这是最通用的尺寸。

---

## 关于域名硬编码

### 问题

当前 `index.html` 中的域名是硬编码的：
```html
"url": "https://dd.vpno.eu.org"
```

### 解决方案

域名会在构建时自动替换，通过 `scripts/update-domain.js` 脚本。

#### 工作流程

1. **设置环境变量**（`.env` 文件）：
   ```env
   SITE_URL=https://kk.vpno.eu.org
   ```

2. **构建时自动替换**：
   ```bash
   npm run build
   ```
   
   `package.json` 中的 `prebuild` 脚本会自动执行：
   ```json
   "prebuild": "npm run update-domain && npm run generate-sitemap"
   ```

3. **域名自动更新**：
   - `https://dd.vpno.eu.org` → `https://kk.vpno.eu.org`
   - 所有出现的地方都会被替换

#### 优先级

域名读取顺序：
1. `SITE_URL`（最高优先级）
2. `FRONTEND_URL`
3. `APP_URL`
4. `https://dd.vpno.eu.org`（默认值）

---

## 完整配置示例

### 1. 环境变量配置（`.env`）

```env
# 网站域名
SITE_URL=https://kk.vpno.eu.org

# Logo 文件名（可选，如果不是 logo.png）
LOGO_FILE=brand-logo.png

# Logo 尺寸（可选）
LOGO_WIDTH=512
LOGO_HEIGHT=512
```

### 2. Logo 文件准备

**选项 A：使用默认配置**
- 文件名：`logo.png`
- 尺寸：512x512px
- 位置：`public/logo.png`

**选项 B：自定义配置**
- 文件名：任意（如 `brand-logo.png`）
- 尺寸：最小 160x160px，推荐 512x512px
- 位置：`public/你的文件名.png`
- 修改 `index.html` 中的 URL

### 3. 结构化数据配置

#### 基础配置（推荐）

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "EasyPay",
  "url": "https://dd.vpno.eu.org",
  "logo": {
    "@type": "ImageObject",
    "url": "https://dd.vpno.eu.org/logo.png"
  }
}
```

**说明**：
- 不指定 `width` 和 `height`，搜索引擎会自动检测
- 域名会在构建时自动替换

#### 完整配置（可选）

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "EasyPay",
  "url": "https://dd.vpno.eu.org",
  "logo": {
    "@type": "ImageObject",
    "url": "https://dd.vpno.eu.org/logo.png",
    "width": 512,
    "height": 512,
    "caption": "EasyPay Logo"
  },
  "description": "专业的 USDT/TRX 代付服务平台"
}
```

**说明**：
- 指定 `width` 和 `height` 可以帮助搜索引擎更快处理
- 但不是必需的

---

## 灵活配置方案

### 方案 1：使用环境变量（推荐）

**优点**：
- 不同环境使用不同配置
- 不需要修改代码
- 自动化程度高

**实现**：

1. 修改 `scripts/update-domain.js`，支持 Logo 配置：

```javascript
const DOMAIN = process.env.SITE_URL || 'https://dd.vpno.eu.org';
const LOGO_FILE = process.env.LOGO_FILE || 'logo.png';
const LOGO_WIDTH = process.env.LOGO_WIDTH || '';
const LOGO_HEIGHT = process.env.LOGO_HEIGHT || '';

// 替换域名
content = content.replace(/https:\/\/dd\.vpno\.eu\.org/g, DOMAIN);

// 替换 Logo 文件名
if (LOGO_FILE !== 'logo.png') {
  content = content.replace(/\/logo\.png/g, `/${LOGO_FILE}`);
}

// 添加尺寸（如果指定）
if (LOGO_WIDTH && LOGO_HEIGHT) {
  content = content.replace(
    /"url": "([^"]+\/logo\.png)"/g,
    `"url": "$1",\n    "width": ${LOGO_WIDTH},\n    "height": ${LOGO_HEIGHT}`
  );
}
```

2. 在 `.env` 中配置：

```env
SITE_URL=https://kk.vpno.eu.org
LOGO_FILE=brand-logo.png
LOGO_WIDTH=512
LOGO_HEIGHT=512
```

### 方案 2：使用配置文件

创建 `config/site.json`：

```json
{
  "domain": "https://kk.vpno.eu.org",
  "logo": {
    "file": "logo.png",
    "width": 512,
    "height": 512
  },
  "organization": {
    "name": "EasyPay",
    "alternateName": "可可代付"
  }
}
```

### 方案 3：直接修改（最简单）

如果你的配置不经常变化，直接修改 `index.html`：

```html
<!-- 修改域名 -->
"url": "https://kk.vpno.eu.org"

<!-- 修改 Logo 文件名 -->
"url": "https://kk.vpno.eu.org/my-logo.png"

<!-- 添加或删除尺寸 -->
"logo": {
  "@type": "ImageObject",
  "url": "https://kk.vpno.eu.org/logo.png"
  <!-- 不指定 width 和 height -->
}
```

---

## 最佳实践

### 1. Logo 文件

**推荐配置**：
```
public/
├── logo.png          (512x512px, 主 Logo)
├── logo-192.png      (192x192px, PWA 图标)
├── favicon.ico       (32x32px, 浏览器图标)
└── apple-touch-icon.png (180x180px, iOS 图标)
```

### 2. 结构化数据

**推荐配置**（简洁版）：
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "EasyPay",
  "url": "https://dd.vpno.eu.org",
  "logo": "https://dd.vpno.eu.org/logo.png"
}
```

**说明**：
- Logo 可以直接使用字符串 URL
- 不需要指定 `@type: ImageObject`
- 不需要指定 `width` 和 `height`
- 搜索引擎会自动处理

### 3. 域名配置

**推荐方式**：
1. 在 `.env` 中设置 `SITE_URL`
2. 使用 `npm run build` 自动替换
3. 不要手动修改 `index.html` 中的域名

---

## 常见问题

### Q1: Logo 必须是正方形吗？

**答**：是的，搜索引擎要求宽高比 1:1。

**原因**：
- 搜索结果中的 Logo 显示区域是正方形
- 非正方形的 Logo 会被裁剪或变形

### Q2: 可以使用 SVG 格式吗？

**答**：可以，但推荐 PNG。

**对比**：
- **PNG**：兼容性最好，Google 和 Bing 都支持
- **SVG**：Google 支持，Bing 不支持
- **JPG**：支持，但不支持透明背景

### Q3: Logo 文件大小有限制吗？

**答**：是的，< 5MB。

**建议**：
- 512x512px PNG：通常 < 100KB
- 使用工具压缩：TinyPNG、ImageOptim
- 保持文件小于 500KB

### Q4: 必须指定 width 和 height 吗？

**答**：不是必须的。

**说明**：
- 指定尺寸：搜索引擎处理更快
- 不指定：搜索引擎会自动检测
- 推荐：不指定，让搜索引擎自动处理

### Q5: 域名会自动替换吗？

**答**：是的，在构建时自动替换。

**流程**：
1. 设置 `.env` 中的 `SITE_URL`
2. 运行 `npm run build`
3. `prebuild` 脚本自动执行 `update-domain.js`
4. 所有域名自动替换

---

## 总结

### Logo 配置

✅ **灵活配置**：
- 文件名：任意（推荐 `logo.png`）
- 尺寸：最小 160x160px（推荐 512x512px）
- 格式：PNG（推荐）、JPG、SVG
- 位置：`public/` 目录

✅ **结构化数据**：
- 可以不指定 `width` 和 `height`
- 搜索引擎会自动检测
- 简洁配置即可

### 域名配置

✅ **自动化**：
- 使用环境变量 `SITE_URL`
- 构建时自动替换
- 不需要手动修改

✅ **优先级**：
1. `SITE_URL`
2. `FRONTEND_URL`
3. `APP_URL`
4. 默认值

### 推荐配置

```env
# .env
SITE_URL=https://kk.vpno.eu.org
```

```
public/
└── logo.png (512x512px)
```

```json
{
  "@type": "Organization",
  "name": "EasyPay",
  "url": "https://dd.vpno.eu.org",
  "logo": "https://dd.vpno.eu.org/logo.png"
}
```

就这么简单！域名会自动替换，Logo 只需要是正方形即可。
