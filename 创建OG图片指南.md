# 创建 OG 图片指南

## 什么是 OG 图片？

OG（Open Graph）图片是当你的网站链接在社交媒体（微信、Twitter、Facebook 等）上分享时显示的预览图。

## 需要创建的图片

### 1. og-image.jpg
- **尺寸**：1200 x 630 像素
- **用途**：Facebook、微信、LinkedIn 等
- **位置**：`public/og-image.jpg`

### 2. twitter-image.jpg（可选）
- **尺寸**：1200 x 600 像素
- **用途**：Twitter 专用
- **位置**：`public/twitter-image.jpg`

### 3. apple-touch-icon.png
- **尺寸**：180 x 180 像素
- **用途**：iOS 设备添加到主屏幕时的图标
- **位置**：`public/apple-touch-icon.png`

### 4. favicon.ico（可选）
- **尺寸**：32 x 32 像素
- **用途**：浏览器标签页图标
- **位置**：`public/favicon.ico`

## 设计建议

### OG 图片内容建议

```
┌─────────────────────────────────────────┐
│                                         │
│           [Logo/图标]                    │
│                                         │
│         EasyPay                         │
│    USDT/TRX 代付平台                     │
│                                         │
│  ✓ 自动化转账  ✓ 多钱包管理              │
│  ✓ 能量租赁    ✓ 安全可靠                │
│                                         │
│         dd.vpno.eu.org                  │
│                                         │
└─────────────────────────────────────────┘
```

### 设计要点

1. **简洁明了**：突出品牌名称和核心功能
2. **高对比度**：确保文字清晰可读
3. **品牌色**：使用你的品牌主色（如蓝色 #2563eb）
4. **留白**：四周留出安全边距（至少 40px）
5. **避免小字**：社交媒体会压缩图片，小字会看不清

## 在线工具推荐

### 1. Canva（推荐，免费）
- 网址：https://www.canva.com/
- 搜索模板："Open Graph" 或 "Social Media"
- 优点：模板丰富，操作简单

### 2. Figma（专业）
- 网址：https://www.figma.com/
- 优点：专业设计工具，完全免费

### 3. Photopea（在线 PS）
- 网址：https://www.photopea.com/
- 优点：类似 Photoshop，无需安装

### 4. 快速生成工具
- https://www.opengraph.xyz/
- https://ogimage.gallery/
- 输入文字即可生成

## 快速创建步骤（使用 Canva）

1. **访问 Canva**
   - 打开 https://www.canva.com/
   - 注册/登录（免费）

2. **创建设计**
   - 点击"创建设计"
   - 选择"自定义尺寸"
   - 输入：1200 x 630 像素

3. **设计内容**
   - 添加背景色（建议：渐变蓝色）
   - 添加文字：
     * 标题：EasyPay（大字，粗体）
     * 副标题：USDT/TRX 代付平台
     * 特点：自动化转账、多钱包管理等
     * 域名：dd.vpno.eu.org
   - 添加图标/Logo（如果有）

4. **导出图片**
   - 点击"分享" → "下载"
   - 格式：JPG（高质量）
   - 保存为 `og-image.jpg`

5. **上传到项目**
   ```bash
   # 将图片复制到项目的 public 目录
   cp og-image.jpg /path/to/easypay/public/
   ```

## 使用 AI 生成（快速方案）

如果你有 AI 工具（如 Midjourney、DALL-E），可以使用以下提示词：

```
Create a professional Open Graph image for a cryptocurrency payment platform called "EasyPay". 
Size: 1200x630px. 
Style: Modern, clean, tech-focused. 
Colors: Blue gradient background (#2563eb to #1e40af). 
Content: 
- Large "EasyPay" logo/text in center
- Subtitle: "USDT/TRX Payment Platform"
- Icons for: automation, wallet, security
- Domain: dd.vpno.eu.org at bottom
- Professional, trustworthy design
```

## 验证图片效果

### 1. Facebook 分享调试器
```
https://developers.facebook.com/tools/debug/
```
输入你的网址，查看预览效果

### 2. Twitter Card 验证器
```
https://cards-dev.twitter.com/validator
```

### 3. 微信分享预览
- 在微信中分享你的网址
- 查看预览卡片效果

## 临时方案（如果暂时没有设计）

如果你暂时没有时间设计，可以先使用纯色背景 + 文字：

### 使用 HTML Canvas 生成（Node.js）

```javascript
// generate-og-image.js
const { createCanvas } = require('canvas');
const fs = require('fs');

const width = 1200;
const height = 630;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// 背景渐变
const gradient = ctx.createLinearGradient(0, 0, width, height);
gradient.addColorStop(0, '#2563eb');
gradient.addColorStop(1, '#1e40af');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, width, height);

// 标题
ctx.fillStyle = '#ffffff';
ctx.font = 'bold 80px Arial';
ctx.textAlign = 'center';
ctx.fillText('EasyPay', width / 2, height / 2 - 50);

// 副标题
ctx.font = '40px Arial';
ctx.fillText('USDT/TRX 代付平台', width / 2, height / 2 + 30);

// 域名
ctx.font = '30px Arial';
ctx.fillText('dd.vpno.eu.org', width / 2, height / 2 + 100);

// 保存图片
const buffer = canvas.toBuffer('image/jpeg', { quality: 0.95 });
fs.writeFileSync('public/og-image.jpg', buffer);

console.log('✓ OG 图片生成完成：public/og-image.jpg');
```

运行：
```bash
npm install canvas
node generate-og-image.js
```

## 检查清单

- [ ] 创建 `public/og-image.jpg`（1200x630px）
- [ ] 创建 `public/apple-touch-icon.png`（180x180px）
- [ ] 可选：创建 `public/favicon.ico`（32x32px）
- [ ] 验证图片大小（建议 < 300KB）
- [ ] 使用 Facebook 调试器验证
- [ ] 重新构建项目：`npm run build`
- [ ] 部署到服务器

## 常见问题

### Q: 图片不显示怎么办？

A: 
1. 检查图片路径是否正确
2. 清除社交媒体缓存（使用调试工具）
3. 确保图片大小 < 8MB
4. 检查图片格式（推荐 JPG）

### Q: 微信分享不显示图片？

A: 微信对图片有特殊要求：
- 尺寸至少 300x300px
- 大小 < 300KB
- 必须是 JPG 或 PNG

### Q: 需要为每个页面创建不同的 OG 图片吗？

A: 
- 首页：使用通用的品牌图片
- 其他页面：可以动态生成（需要 SSR）
- 对于 SPA，通常只需要一张通用图片

