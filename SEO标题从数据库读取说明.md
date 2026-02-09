# SEO 标题从数据库读取 - 修复说明

## ✅ 已修复

现在 SEO 标题和描述都从数据库的 `seoTitle` 和 `seoDescription` 字段读取，不再硬编码！

## 📊 修改内容

### 1. App.jsx - 动态标题

**修改前（硬编码）：**
```javascript
document.title = `${data.siteName} - USDT/TRX 代付平台 | 自动化加密货币转账服务`;
```

**修改后（从数据库读取）：**
```javascript
// 优先使用 seoTitle，如果没有则使用 siteName
if (data.seoTitle) {
  document.title = data.seoTitle;
} else if (data.siteName) {
  document.title = `${data.siteName} - USDT/TRX 代付平台`;
}
```

### 2. staticPageGenerator.js - 静态页面标题

**修改前（硬编码）：**
```javascript
<title>${settings.siteName} - USDT/TRX 代付平台 | 自动化加密货币转账服务</title>
<meta name="description" content="${settings.siteDescription}">
```

**修改后（从数据库读取）：**
```javascript
<title>${settings.seoTitle || settings.siteName + ' - USDT/TRX 代付平台'}</title>
<meta name="description" content="${settings.seoDescription || settings.siteDescription}">
```

## 🎯 数据库字段说明

### Settings 模型中的 SEO 字段

| 字段名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `seoTitle` | String | 'FastPay - 数字货币代付平台' | SEO 标题（显示在浏览器标签页和搜索结果） |
| `seoDescription` | String | '专业的USDT/TRX代付服务...' | SEO 描述（显示在搜索结果摘要） |
| `siteName` | String | 'FastPay' | 网站名称（用于页面显示） |
| `siteDescription` | String | '安全快捷的数字货币代付平台' | 网站描述（用于页面显示） |

### 优先级规则

1. **标题优先级：**
   - 第一优先：`seoTitle`（如果设置了）
   - 第二优先：`siteName + ' - USDT/TRX 代付平台'`（如果 seoTitle 为空）

2. **描述优先级：**
   - 第一优先：`seoDescription`（如果设置了）
   - 第二优先：`siteDescription`（如果 seoDescription 为空）

## 🔧 如何在后台设置 SEO 标题

### 方法 1：通过系统设置页面（推荐）

1. 登录管理后台
2. 进入 **系统设置** → **网站信息**
3. 找到 **SEO 标题** 和 **SEO 描述** 字段
4. 填写你想要的标题和描述
5. 保存设置

### 方法 2：直接修改数据库

```javascript
// 使用 MongoDB 命令
db.settings.updateOne(
  {},
  {
    $set: {
      seoTitle: '可可代付 - 专业的USDT/TRX代付平台 | 降低90%手续费',
      seoDescription: '提供安全、高效的波场 TRON 能量租赁、USDT 代付及 TRX 闪兑服务。通过我们的能量租赁，您的 USDT 转账费用可降低 90% 以上。'
    }
  }
);
```

## 📝 SEO 标题示例

### 当前设置（你的后台）

根据你的测试结果，你的后台设置的 SEO 标题是：
```
可可代付 - USDT/TRX 代付平台 | 自动化加密货币转账服务
```

### 其他示例

**示例 1：突出优势**
```
可可代付 - 降低90%手续费 | USDT/TRX代付平台
```

**示例 2：包含更多关键词**
```
可可代付 - USDT代付/TRX转账/能量租赁 | 自动化支付平台
```

**示例 3：强调服务**
```
可可代付 - 7x24小时自动化USDT/TRX代付服务
```

**示例 4：简洁版**
```
可可代付 - 专业的USDT/TRX代付平台
```

## 🔄 更新流程

### 1. 修改后台设置

在系统设置中修改 `seoTitle` 和 `seoDescription`

### 2. 重新生成静态文件

在 **SEO 管理** 页面点击 **"生成所有文件"**

### 3. 重新构建前端（如果需要）

```bash
npm run build
```

### 4. 验证效果

**验证普通用户看到的标题：**
- 打开网站，查看浏览器标签页

**验证搜索引擎看到的标题：**
```bash
curl -A "Mozilla/5.0 (compatible; Googlebot/2.1)" https://co.ksdn.cc/
```

## 📊 效果对比

### 修复前 ❌

- **后台设置：** "可可代付 - 专业的USDT/TRX代付平台"
- **实际显示：** "可可代付 - USDT/TRX 代付平台 | 自动化加密货币转账服务"（硬编码）
- **问题：** 后台设置无效

### 修复后 ✅

- **后台设置：** "可可代付 - 专业的USDT/TRX代付平台"
- **实际显示：** "可可代付 - 专业的USDT/TRX代付平台"（从数据库读取）
- **效果：** 后台设置生效

## 🎯 使用建议

### 1. 设置 SEO 标题的最佳实践

- **长度：** 50-60 个字符（中文约 25-30 个字）
- **格式：** 品牌名 - 核心服务 | 补充说明
- **关键词：** 包含 2-3 个核心关键词
- **独特性：** 每个页面的标题应该不同

### 2. 设置 SEO 描述的最佳实践

- **长度：** 120-160 个字符（中文约 60-80 个字）
- **内容：** 简洁描述网站提供的服务和优势
- **关键词：** 自然地包含核心关键词
- **吸引力：** 使用行动号召（如"立即体验"、"降低90%成本"）

### 3. 示例配置

```javascript
{
  // 网站基本信息
  siteName: "可可代付",
  siteDescription: "安全、高效的加密货币代付平台",
  
  // SEO 优化信息
  seoTitle: "可可代付 - 专业的USDT/TRX代付平台 | 降低90%手续费",
  seoDescription: "提供安全、高效的波场 TRON 能量租赁、USDT 代付及 TRX 闪兑服务。通过我们的能量租赁，您的 USDT 转账费用可降低 90% 以上。支持 API 接入，7x24 小时全自动处理。"
}
```

## ✅ 验证清单

- [ ] 后台设置了 `seoTitle` 和 `seoDescription`
- [ ] 重新生成了静态文件
- [ ] 重新构建了前端（`npm run build`）
- [ ] 浏览器标签页显示正确的标题
- [ ] 搜索引擎爬虫能看到正确的标题
- [ ] 标题长度适中（50-70 字符）
- [ ] 描述长度适中（120-160 字符）

## 🔍 常见问题

### Q1: 修改后标题没有变化？

**解决方法：**
1. 清除浏览器缓存（Ctrl + Shift + R）
2. 重新构建前端（`npm run build`）
3. 重新生成静态文件（SEO 管理页面）

### Q2: 搜索引擎还是看到旧标题？

**解决方法：**
1. 重新生成静态文件
2. 等待搜索引擎重新抓取（可能需要几天）
3. 在 Google Search Console 请求重新抓取

### Q3: 不同页面可以有不同标题吗？

**回答：** 可以！目前首页使用 `seoTitle`，其他页面（能量租赁、闪兑、FAQ）有各自的标题。如果需要自定义，可以在后台添加对应的字段。

---

现在 SEO 标题完全由后台控制，不再硬编码了！🎉
