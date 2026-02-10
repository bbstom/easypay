# 品牌名称修改：EasyPay → 可可代付

## 已完成的修改

### 1. index.html（主页面）

✅ **Meta 标签**：
- `<meta name="author">`: EasyPay Team → 可可代付团队
- `<meta property="og:title">`: EasyPay → 可可代付
- `<meta name="twitter:title">`: EasyPay → 可可代付
- `<meta name="apple-mobile-web-app-title">`: EasyPay → 可可代付

✅ **结构化数据**：
- Organization name: EasyPay → 可可代付
- WebApplication name: EasyPay → 可可代付
- Provider name: EasyPay → 可可代付

✅ **Noscript 内容**：
- 标题和描述中的 EasyPay → 可可代付

### 2. 博客页面

✅ **BlogListPage.jsx**：
- 页面标题：EasyPay 博客 → 可可代付博客
- SEO 标题：| EasyPay → | 可可代付

✅ **BlogDetailPage.jsx**：
- SEO 标题：EasyPay 博客 → 可可代付博客
- 作者默认名称：EasyPay → 可可代付

### 3. 后端服务

✅ **staticPageGenerator.js**：
- 默认网站名称：EasyPay → 可可代付
- 默认公司名称：EasyPay → 可可代付
- 默认网站描述：EasyPay 提供... → 可可代付提供...

### 4. 数据库模型（Settings.js）

✅ **默认值修改**：
- `siteName`: FastPay → 可可代付
- `seoTitle`: FastPay - 数字货币代付平台 → 可可代付 - 数字货币代付平台
- `footerCompanyName`: FASTPAY → 可可代付
- `footerCopyright`: © 2024 FastPay → © 2024 可可代付
- `smtpFromName`: FastPay → 可可代付

### 5. 邮件服务（emailService.js）

✅ **邮件模板**：
- 所有邮件发件人默认名称：FastPay → 可可代付
- 邮件主题：FastPay → 可可代付
- 邮件内容：FastPay → 可可代付
- 邮件页脚：FastPay → 可可代付

### 6. Telegram Bot（start.js）

✅ **Bot 消息**：
- 欢迎消息默认网站名称：FastPay → 可可代付
- 帮助信息默认网站名称：FastPay → 可可代付

### 7. 其他脚本

✅ **initDatabase.js**：
- 初始化数据库时的默认网站名称：FastPay → 可可代付

✅ **telegram.js**：
- 模板变量示例：FastPay → 可可代付

---

## 未修改的文件

以下文件包含 "EasyPay" 或 "FastPay" 但**不需要修改**（因为是文档、配置或路径）：

### 文档文件（.md）
- 域名配置说明.md
- 诊断package.json问题.md
- 解决Git冲突-立即执行.md
- 系统安装使用教程.md
- 生产环境样式问题排查.md
- 生产环境部署指南.md

**原因**：这些是技术文档，保留原始内容便于理解

### 配置文件
- ecosystem.config.js（PM2 配置）
  - `name: 'easypay-backend'`（进程名称）
  - `cwd: '/www/wwwroot/kk.vpno.eu.org/easypay'`（路径）

**原因**：这些是系统路径和进程名称，不是品牌名称

### 数据库脚本
- server/scripts/*.js
  - `mongodb://localhost:27017/easypay` 或 `mongodb://localhost:27017/fastpay`（数据库名称）
  - `admin@fastpay.com`（示例邮箱）

**原因**：数据库名称和示例数据不应该修改，会导致数据丢失或配置错误

### SEO 管理页面
- src/pages/SEOManagePage.jsx
  - `root /path/to/easypay/dist;`（示例路径）

**原因**：这是示例代码，不是实际使用的品牌名称

---

## 验证修改

### 1. 前端验证

**浏览器标题**：
- 首页：应该显示 "可可代付"
- 博客列表：应该显示 "博客 - ... | 可可代付"
- 博客详情：应该显示 "文章标题 - 可可代付博客"

**页面内容**：
- 博客列表页标题：应该显示 "可可代付博客"

### 2. SEO 验证

**查看源代码**（Ctrl+U）：
```html
<meta name="author" content="可可代付团队" />
<meta property="og:title" content="可可代付 - USDT/TRX 代付平台" />
<meta name="twitter:title" content="可可代付 - USDT/TRX 代付平台" />
```

**结构化数据**：
```json
{
  "@type": "Organization",
  "name": "可可代付",
  "alternateName": "可可代付"
}
```

### 3. 搜索引擎验证

**Google 富媒体测试**：
- 访问：https://search.google.com/test/rich-results
- 输入：https://kk.vpno.eu.org
- 检查：Organization name 应该显示 "可可代付"

---

## 部署步骤

### 1. 提交代码

```bash
git add .
git commit -m "品牌名称修改：EasyPay → 可可代付"
git push origin main
```

### 2. 服务器部署

```bash
cd /www/wwwroot/kk.vpno.eu.org/easypay
git checkout -- index.html
git pull origin main
npm run build
pm2 restart all
```

### 3. 验证部署

1. **访问网站**：https://kk.vpno.eu.org
2. **检查标题**：浏览器标签应该显示 "可可代付"
3. **查看源代码**：确认所有 EasyPay 已替换为 可可代付
4. **测试博客**：访问博客页面，检查标题

---

## 其他需要修改的地方

### 1. 数据库中的设置

登录后台管理系统，修改以下设置：

**系统设置**：
- 网站名称：可可代付
- 公司名称：可可代付
- 网站描述：可可代付提供...

**路径**：后台 → 系统设置 → 基本设置

**注意**：虽然代码中的默认值已经修改为"可可代付"，但如果数据库中已经存在旧的设置记录，需要手动更新。

### 2. Logo 和图标

如果有 Logo 文件包含 "EasyPay" 或 "FastPay" 文字，需要重新设计：
- logo.png
- favicon.ico
- apple-touch-icon.png
- og-image.jpg

### 3. 已完成的邮件模板

✅ 邮件模板已自动更新（通过 emailService.js）：
- 注册邮件
- 订单通知邮件
- 支付成功邮件
- 所有邮件的发件人名称、主题和内容

### 4. 已完成的 Telegram Bot 消息

✅ Bot 消息已自动更新（通过 start.js）：
- 欢迎消息
- 帮助信息
- 所有使用 `settings.siteName` 的地方

### 5. 客服回复模板

如果有预设的客服回复，检查是否包含 "EasyPay" 或 "FastPay"

---

## 搜索引擎更新

### Google

1. **提交新的 Sitemap**：
   - 访问 Google Search Console
   - 提交 sitemap.xml
   - 请求重新索引

2. **更新 Organization 信息**：
   - 搜索引擎会在 1-2 周内更新
   - 使用富媒体测试工具验证

### Bing

1. **提交 URL**：
   - 访问 Bing Webmaster Tools
   - 提交首页 URL
   - 请求重新抓取

---

## 注意事项

### 1. 数据库名称

❌ **不要修改**：
```javascript
mongodb://localhost:27017/easypay  // 保持不变
```

**原因**：
- 修改数据库名称会导致数据丢失
- 需要迁移所有数据
- 可能导致服务中断

### 2. 进程名称

❌ **不要修改**：
```javascript
name: 'easypay-backend'  // 保持不变
```

**原因**：
- PM2 进程名称
- 修改后需要重新配置
- 可能影响监控和日志

### 3. 文件路径

❌ **不要修改**：
```bash
/www/wwwroot/kk.vpno.eu.org/easypay  // 保持不变
```

**原因**：
- 服务器路径
- 修改需要重新部署
- 可能影响 Nginx 配置

### 4. Git 仓库名称

❌ **不要修改**：
```bash
git clone <repo>/easypay.git  // 保持不变
```

**原因**：
- 仓库名称
- 修改需要更新所有克隆
- 可能影响 CI/CD

---

## 品牌一致性检查清单

### 前端

- [ ] 浏览器标题显示 "可可代付"
- [ ] 页面标题显示 "可可代付"
- [ ] Meta 标签使用 "可可代付"
- [ ] 结构化数据使用 "可可代付"
- [ ] 博客页面使用 "可可代付"

### 后端

- [ ] 默认网站名称为 "可可代付"
- [ ] 默认公司名称为 "可可代付"
- [ ] 邮件模板使用 "可可代付"
- [ ] Bot 消息使用 "可可代付"

### SEO

- [ ] Google 富媒体测试通过
- [ ] Organization name 显示 "可可代付"
- [ ] Sitemap 已更新
- [ ] 搜索结果标题正确

### 设计

- [ ] Logo 不包含 "EasyPay"
- [ ] Favicon 正确
- [ ] OG 图片正确
- [ ] 所有图标一致

---

## 总结

### 已完成

✅ **核心文件**：
- index.html（所有 Meta 标签和结构化数据）
- BlogListPage.jsx（博客列表页）
- BlogDetailPage.jsx（博客详情页）
- staticPageGenerator.js（静态页面生成器）
- Settings.js（数据库模型默认值）
- emailService.js（邮件服务模板）
- start.js（Telegram Bot 消息）
- initDatabase.js（数据库初始化脚本）
- telegram.js（Telegram 路由）

✅ **修改内容**：
- 品牌名称：EasyPay/FastPay → 可可代付
- 团队名称：EasyPay Team → 可可代付团队
- 所有用户可见的文本
- 所有默认值和后备值

✅ **影响范围**：
- 前端页面标题和 SEO 标签
- 后端数据库默认值
- 邮件模板和发件人名称
- Telegram Bot 消息
- 静态页面生成器

### 待完成

📝 **后台设置**（如果数据库中已有旧数据）：
- 登录后台修改网站名称
- 修改公司名称
- 更新网站描述

📝 **设计资源**：
- 更新 Logo（如果包含文字）
- 更新 Favicon
- 更新 OG 图片

### 部署

```bash
# 1. 提交代码
git add .
git commit -m "品牌名称修改：EasyPay → 可可代付"
git push origin main

# 2. 服务器部署
cd /www/wwwroot/kk.vpno.eu.org/easypay
git checkout -- index.html
git pull origin main
npm run build
pm2 restart all

# 3. 验证
# 访问 https://kk.vpno.eu.org
# 检查浏览器标题和页面内容
```

现在品牌名称已经从 "EasyPay" 修改为 "可可代付"！
