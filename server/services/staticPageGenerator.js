const fs = require('fs').promises;
const path = require('path');

/**
 * 静态页面生成服务
 * 用于生成 SEO 友好的静态 HTML、sitemap.xml 和 robots.txt
 */
class StaticPageGenerator {
  constructor() {
    this.distPath = path.join(__dirname, '../../dist');
    this.publicPath = path.join(__dirname, '../../public');
    this.domain = process.env.APP_URL || 'https://dd.vpno.eu.org';
  }

  /**
   * 生成首页静态 HTML
   */
  async generateHomePage() {
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- SEO 标签 -->
  <title>EasyPay - USDT/TRX 代付平台 | 自动化加密货币转账服务</title>
  <meta name="description" content="EasyPay 提供专业的 USDT/TRX 代付服务，支持自动化转账、多钱包管理、能量租赁。安全、快速、可靠的加密货币支付解决方案。">
  <meta name="keywords" content="USDT代付,TRX代付,加密货币支付,TRON转账,自动化代付,区块链支付,数字货币,USDT转账,TRX转账">
  <meta name="author" content="EasyPay Team">
  <meta name="robots" content="index, follow">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${this.domain}/">
  <meta property="og:title" content="EasyPay - USDT/TRX 代付平台">
  <meta property="og:description" content="专业的 USDT/TRX 代付服务，支持自动化转账、多钱包管理、能量租赁。">
  <meta property="og:image" content="${this.domain}/og-image.jpg">
  <meta property="og:locale" content="zh_CN">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${this.domain}/">
  <meta name="twitter:title" content="EasyPay - USDT/TRX 代付平台">
  <meta name="twitter:description" content="专业的 USDT/TRX 代付服务，支持自动化转账、多钱包管理、能量租赁。">
  <meta name="twitter:image" content="${this.domain}/og-image.jpg">
  
  <!-- 规范链接 -->
  <link rel="canonical" href="${this.domain}/">
  
  <!-- 结构化数据 -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "EasyPay",
    "description": "专业的 USDT/TRX 代付服务平台",
    "url": "${this.domain}",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "category": "加密货币支付服务"
    },
    "provider": {
      "@type": "Organization",
      "name": "EasyPay",
      "url": "${this.domain}"
    }
  }
  </script>
  
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      color: white;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    header {
      text-align: center;
      padding: 60px 0;
    }
    h1 {
      font-size: 56px;
      margin-bottom: 20px;
      font-weight: 700;
    }
    .subtitle {
      font-size: 24px;
      margin-bottom: 40px;
      opacity: 0.95;
    }
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 30px;
      margin: 60px 0;
    }
    .feature {
      background: rgba(255, 255, 255, 0.15);
      padding: 30px;
      border-radius: 15px;
      backdrop-filter: blur(10px);
      transition: transform 0.3s, box-shadow 0.3s;
    }
    .feature:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }
    .feature-icon {
      font-size: 48px;
      margin-bottom: 15px;
    }
    .feature h3 {
      font-size: 22px;
      margin-bottom: 15px;
    }
    .feature p {
      font-size: 16px;
      line-height: 1.6;
      opacity: 0.9;
    }
    .cta-section {
      text-align: center;
      margin: 60px 0;
    }
    .cta-button {
      display: inline-block;
      background: white;
      color: #667eea;
      padding: 18px 50px;
      border-radius: 50px;
      text-decoration: none;
      font-weight: bold;
      font-size: 20px;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
    }
    .cta-button:hover {
      transform: scale(1.05);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
    }
    .content-section {
      background: rgba(255, 255, 255, 0.1);
      padding: 40px;
      border-radius: 15px;
      backdrop-filter: blur(10px);
      margin: 40px 0;
      line-height: 1.8;
    }
    .content-section h2 {
      font-size: 32px;
      margin-bottom: 20px;
    }
    .content-section p {
      font-size: 18px;
      margin-bottom: 15px;
      opacity: 0.95;
    }
    footer {
      text-align: center;
      padding: 40px 0;
      opacity: 0.8;
      font-size: 14px;
    }
    @media (max-width: 768px) {
      h1 { font-size: 36px; }
      .subtitle { font-size: 18px; }
      .features { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>EasyPay</h1>
      <p class="subtitle">专业的 USDT/TRX 代付平台</p>
    </header>
    
    <div class="features">
      <div class="feature">
        <div class="feature-icon">🚀</div>
        <h3>自动化转账</h3>
        <p>快速、安全的自动化代付服务，支持 USDT 和 TRX 转账，实时到账，无需人工干预。</p>
      </div>
      <div class="feature">
        <div class="feature-icon">💼</div>
        <h3>多钱包管理</h3>
        <p>智能分配转账任务，多钱包并发处理，提高转账成功率，降低单点故障风险。</p>
      </div>
      <div class="feature">
        <div class="feature-icon">⚡</div>
        <h3>能量租赁</h3>
        <p>提供 TRON 能量租赁服务，大幅降低 USDT 转账手续费，节省成本高达 90%。</p>
      </div>
      <div class="feature">
        <div class="feature-icon">🔄</div>
        <h3>闪兑服务</h3>
        <p>TRX/USDT 快速兑换，实时汇率，秒级到账，支持大额交易。</p>
      </div>
      <div class="feature">
        <div class="feature-icon">🔒</div>
        <h3>安全可靠</h3>
        <p>多重安全防护，私钥加密存储，交易全程监控，资金安全有保障。</p>
      </div>
      <div class="feature">
        <div class="feature-icon">📊</div>
        <h3>实时监控</h3>
        <p>完整的订单管理系统，实时查看交易状态，支持订单查询和导出。</p>
      </div>
    </div>
    
    <div class="cta-section">
      <a href="/app" class="cta-button">立即使用</a>
    </div>
    
    <div class="content-section">
      <h2>关于 EasyPay</h2>
      <p>EasyPay 是一个专业的 USDT 和 TRX 代付平台，为用户提供安全、快速、可靠的加密货币支付解决方案。我们致力于简化加密货币转账流程，降低转账成本，提高转账效率。</p>
      <p>平台支持自动化转账、多钱包管理、能量租赁、闪兑服务等功能，帮助您轻松完成各类加密货币支付需求。无论是个人用户还是企业客户，都能在 EasyPay 找到适合的解决方案。</p>
      <p>我们采用先进的区块链技术，确保每笔交易的安全性和可追溯性。所有私钥均采用加密存储，交易全程监控，让您的资金安全无忧。</p>
    </div>
    
    <div class="content-section">
      <h2>核心优势</h2>
      <p><strong>自动化处理：</strong>无需人工干预，系统自动处理转账请求，实时到账，提高效率。</p>
      <p><strong>智能调度：</strong>多钱包智能分配，自动选择最优钱包，提高转账成功率。</p>
      <p><strong>成本优化：</strong>通过能量租赁服务，大幅降低 USDT 转账手续费，节省高达 90% 的成本。</p>
      <p><strong>安全保障：</strong>多重安全防护机制，私钥加密存储，交易全程监控，确保资金安全。</p>
      <p><strong>实时监控：</strong>完整的订单管理系统，实时查看交易状态，支持订单查询和导出。</p>
    </div>
    
    <footer>
      <p>&copy; 2024 EasyPay. All rights reserved.</p>
      <p>联系我们：${this.domain}</p>
    </footer>
  </div>
  
  <!-- 自动跳转到 React 应用（用户点击任何链接时） -->
  <script>
    // 如果用户点击"立即使用"按钮，跳转到 React 应用
    document.addEventListener('DOMContentLoaded', function() {
      const ctaButton = document.querySelector('.cta-button');
      if (ctaButton) {
        ctaButton.addEventListener('click', function(e) {
          e.preventDefault();
          window.location.href = '/';
        });
      }
    });
  </script>
</body>
</html>`;

    const filePath = path.join(this.distPath, 'landing.html');
    await fs.writeFile(filePath, html, 'utf8');
    return { success: true, path: filePath };
  }

  /**
   * 生成 sitemap.xml
   */
  async generateSitemap() {
    const now = new Date().toISOString().split('T')[0];
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- 首页 -->
  <url>
    <loc>${this.domain}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- 能量租赁页面 -->
  <url>
    <loc>${this.domain}/energy</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- 闪兑页面 -->
  <url>
    <loc>${this.domain}/swap</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- 帮助中心 -->
  <url>
    <loc>${this.domain}/faq</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <!-- 用户中心 -->
  <url>
    <loc>${this.domain}/user</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;

    const filePath = path.join(this.distPath, 'sitemap.xml');
    await fs.writeFile(filePath, sitemap, 'utf8');
    return { success: true, path: filePath };
  }

  /**
   * 生成 robots.txt
   */
  async generateRobotsTxt() {
    const robotsTxt = `# robots.txt - 搜索引擎爬虫规则

User-agent: *
Allow: /

# 不允许爬取的路径
Disallow: /admin
Disallow: /api/
Disallow: /login

# 站点地图
Sitemap: ${this.domain}/sitemap.xml

# 爬取延迟（可选，避免服务器压力）
Crawl-delay: 1`;

    const filePath = path.join(this.distPath, 'robots.txt');
    await fs.writeFile(filePath, robotsTxt, 'utf8');
    return { success: true, path: filePath };
  }

  /**
   * 生成所有静态文件
   */
  async generateAll() {
    try {
      // 确保 dist 目录存在
      await fs.mkdir(this.distPath, { recursive: true });

      const results = {
        homepage: await this.generateHomePage(),
        sitemap: await this.generateSitemap(),
        robots: await this.generateRobotsTxt()
      };

      return {
        success: true,
        message: '所有静态文件生成成功',
        results
      };
    } catch (error) {
      console.error('生成静态文件失败:', error);
      return {
        success: false,
        message: '生成静态文件失败',
        error: error.message
      };
    }
  }

  /**
   * 获取生成状态
   */
  async getStatus() {
    try {
      const files = ['landing.html', 'sitemap.xml', 'robots.txt'];
      const status = {};

      for (const file of files) {
        const filePath = path.join(this.distPath, file);
        try {
          const stats = await fs.stat(filePath);
          status[file] = {
            exists: true,
            size: stats.size,
            modified: stats.mtime
          };
        } catch (error) {
          status[file] = {
            exists: false
          };
        }
      }

      return {
        success: true,
        domain: this.domain,
        distPath: this.distPath,
        files: status
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new StaticPageGenerator();
