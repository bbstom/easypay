# SEO Meta 标签配置文档

## 已完成的页面

### 1. 服务总览页面 (/services)
- ✅ 已添加 SEOHead 组件
- ✅ 已添加结构化数据
- **Title**: 服务总览 - USDT/TRX 代付、能量租赁、闪兑服务
- **Description**: 提供全方位的加密货币支付解决方案，包括 USDT/TRX 代付、能量租赁、闪兑服务等。安全、快速、专业的服务。
- **Keywords**: USDT 代付, TRX 代付, 能量租赁, 闪兑服务, 加密货币支付

---

## 待添加的页面配置

### 2. USDT 代付详情 (/services/usdt-payment)

```javascript
<SEOHead
  title="USDT 代付服务 - 快速安全的 USDT-TRC20 自动化转账 | 批量支付解决方案"
  description="专业的 USDT-TRC20 代付服务，支持批量转账、API 接入，2-10 分钟快速到账。适用于跨境电商、自由职业者、游戏工作室等场景。手续费低至 0.5%。"
  keywords={[
    'USDT 代付',
    'USDT-TRC20',
    'USDT 转账',
    '批量转账',
    'USDT 支付',
    '自动化代付',
    '加密货币支付',
    'USDT API',
    '波场转账',
    'TRON 支付'
  ]}
  structuredData={{
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "USDT 代付服务",
    "description": "快速、安全的 USDT-TRC20 自动化转账服务",
    "provider": {
      "@type": "Organization",
      "name": "可可代付"
    },
    "areaServed": "CN",
    "offers": {
      "@type": "Offer",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "priceCurrency": "CNY",
        "price": "0.5-2%"
      }
    }
  }}
/>
```

### 3. TRX 代付详情 (/services/trx-payment)

```javascript
<SEOHead
  title="TRX 代付服务 - 波场 TRX 自动化转账 | 快速确认低手续费"
  description="波场 TRX 自动化转账服务，3 秒快速确认，手续费极低。为 DApp 开发者和平台提供稳定的 TRX 发放能力，7x24 小时服务。"
  keywords={[
    'TRX 代付',
    'TRX 转账',
    '波场转账',
    'TRON 支付',
    'TRX 支付',
    'DApp 支付',
    '波场代付',
    'TRX API'
  ]}
  structuredData={{
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "TRX 代付服务",
    "description": "波场 TRX 自动化转账服务"
  }}
/>
```

### 4. 能量租赁详情 (/services/energy-rental)

```javascript
<SEOHead
  title="TRON 能量租赁 - 降低 90% USDT 转账手续费 | 波场能量租赁服务"
  description="TRON 能量租赁服务，大幅降低 USDT-TRC20 转账手续费，节省高达 90% 的成本。即时到账，灵活租期，支持自动续租。"
  keywords={[
    'TRON 能量',
    '能量租赁',
    '波场能量',
    'USDT 手续费',
    '降低手续费',
    'TRON Energy',
    '能量租用',
    'TRC20 手续费',
    '波场资源'
  ]}
  structuredData={{
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "TRON 能量租赁",
    "description": "降低 USDT 转账手续费的能量租赁服务"
  }}
/>
```

### 5. 闪兑服务详情 (/services/swap)

```javascript
<SEOHead
  title="TRX/USDT 闪兑服务 - 实时汇率秒级到账 | 加密货币快速兑换"
  description="TRX 与 USDT 之间的快速兑换服务，实时汇率，秒级到账，支持大额交易。无需注册，输入地址即可兑换。"
  keywords={[
    'TRX USDT 兑换',
    '闪兑服务',
    '加密货币兑换',
    'TRX 兑换',
    'USDT 兑换',
    '快速兑换',
    '币币兑换',
    '波场兑换'
  ]}
  structuredData={{
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "TRX/USDT 闪兑服务",
    "description": "快速的加密货币兑换服务"
  }}
/>
```

### 6. 新手教程 (/guides/beginner)

```javascript
<SEOHead
  title="新手教程 - USDT/TRX 代付使用指南 | 从零开始学习加密货币支付"
  description="详细的 USDT/TRX 代付新手教程，包含加密货币基础知识、注册登录、充值余额等完整指南。帮助您快速上手使用代付服务。"
  keywords={[
    'USDT 教程',
    'TRX 教程',
    '加密货币新手',
    '代付教程',
    'USDT 使用指南',
    '波场教程',
    '新手指南',
    '加密货币入门'
  ]}
  structuredData={{
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "如何使用 USDT/TRX 代付服务",
    "description": "从零开始学习使用代付服务的完整教程"
  }}
/>
```

### 7. API 文档 (/guides/api)

```javascript
<SEOHead
  title="API 文档 - USDT/TRX 代付 API 接入指南 | RESTful API 开发文档"
  description="完整的 USDT/TRX 代付 API 接入文档，支持多种编程语言。包含认证方式、接口列表、代码示例等，快速集成到您的系统。"
  keywords={[
    'API 文档',
    'API 接入',
    'RESTful API',
    '代付 API',
    'USDT API',
    'TRX API',
    '开发文档',
    'API 集成',
    '自动化接入'
  ]}
  structuredData={{
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "name": "API 文档",
    "description": "USDT/TRX 代付 API 接入文档"
  }}
/>
```

### 8. 公司介绍 (/about/company)

```javascript
<SEOHead
  title="关于我们 - 专业的加密货币支付服务提供商 | 公司介绍"
  description="专业的加密货币支付服务提供商，致力于为全球用户提供安全、快速、便捷的支付解决方案。已为 12,000+ 用户提供服务。"
  keywords={[
    '加密货币支付平台',
    'USDT 代付服务商',
    '区块链支付',
    '数字货币支付',
    '加密货币服务',
    '波场支付平台'
  ]}
  structuredData={{
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "可可代付",
    "description": "专业的加密货币支付服务提供商",
    "url": window.location.origin
  }}
/>
```

### 9. 安全保障 (/about/security)

```javascript
<SEOHead
  title="安全保障 - 多重安全措施保护您的资金 | 加密货币安全"
  description="采用银行级安全措施，包括冷钱包存储、多签名技术、实时监控等，确保您的资金和数据安全。"
  keywords={[
    '资金安全',
    '加密货币安全',
    '冷钱包',
    '多签名钱包',
    '隐私保护',
    '数据加密',
    '安全措施'
  ]}
/>
```

### 10. 联系我们 (/about/contact)

```javascript
<SEOHead
  title="联系我们 - 7x24 小时在线客服 | 技术支持"
  description="我们随时为您提供帮助，7x24 小时在线客服。通过 Telegram 联系我们，获取专业的技术支持和服务。"
  keywords={[
    '联系我们',
    '客服支持',
    '技术支持',
    'Telegram 客服',
    '在线客服'
  ]}
/>
```

---

## 实施步骤

### 步骤 1：确保 SEOHead 组件已创建
- ✅ 文件位置：`src/components/SEOHead.jsx`
- ✅ 已安装：`react-helmet-async`
- ✅ 已在 `main.jsx` 中添加 `HelmetProvider`

### 步骤 2：为每个页面添加 SEO

在每个页面组件中：

1. 导入 SEOHead 组件
```javascript
import SEOHead from '../components/SEOHead';
```

2. 在 return 语句的第一个 div 内添加 SEOHead
```javascript
return (
  <div className="...">
    <SEOHead
      title="..."
      description="..."
      keywords={[...]}
      structuredData={{...}}
    />
    {/* 其他内容 */}
  </div>
);
```

### 步骤 3：验证

1. 启动开发服务器
2. 访问每个页面
3. 查看页面源代码（右键 -> 查看网页源代码）
4. 确认 Meta 标签和结构化数据已正确添加

---

## SEO 最佳实践

### Title 标签
- 长度：50-60 个字符
- 格式：主标题 - 副标题 | 品牌名
- 包含核心关键词
- 每个页面唯一

### Description 标签
- 长度：150-160 个字符
- 包含核心关键词
- 描述页面主要内容
- 吸引用户点击

### Keywords 标签
- 5-10 个关键词
- 相关性强
- 包含长尾关键词
- 避免关键词堆砌

### 结构化数据
- 使用 Schema.org 标准
- 根据页面类型选择合适的类型
- 提供完整的信息
- 帮助搜索引擎理解内容

---

## 预期效果

### 短期（1-2 周）
- 搜索引擎开始抓取新的 Meta 标签
- 搜索结果中显示优化后的标题和描述
- 点击率提升 10-20%

### 中期（1-3 个月）
- 关键词排名提升
- 自然流量增长 30-50%
- 结构化数据开始生效

### 长期（3-6 个月）
- 核心关键词进入前 3 页
- 自然流量增长 100-150%
- 搜索结果中显示富媒体片段

---

## 下一步

1. ✅ 服务总览页面已添加 SEO
2. ⏳ 为其他 10 个页面添加 SEO
3. ⏳ 测试和验证
4. ⏳ 提交到 Google Search Console
5. ⏳ 监控效果并优化
