const fs = require('fs').promises;
const path = require('path');
const Settings = require('../models/Settings');

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
   * 获取网站设置
   */
  async getSettings() {
    try {
      const settings = await Settings.findOne();
      return {
        siteName: settings?.siteName || 'EasyPay',
        seoTitle: settings?.seoTitle || '',
        siteDescription: settings?.siteDescription || 'EasyPay 提供专业的 USDT/TRX 代付服务，支持自动化转账、多钱包管理、能量租赁。安全、快速、可靠的加密货币支付解决方案。',
        seoDescription: settings?.seoDescription || '',
        footerCompanyName: settings?.footerCompanyName || 'EasyPay',
        footerDescription: settings?.footerDescription || '领先的自动化代付协议，为 TRON 生态提供安全、快速、便捷的 USDT 和 TRX 代付服务。'
      };
    } catch (error) {
      console.error('获取网站设置失败:', error);
      return {
        siteName: 'EasyPay',
        seoTitle: '',
        siteDescription: 'EasyPay 提供专业的 USDT/TRX 代付服务，支持自动化转账、多钱包管理、能量租赁。安全、快速、可靠的加密货币支付解决方案。',
        seoDescription: '',
        footerCompanyName: 'EasyPay',
        footerDescription: '领先的自动化代付协议，为 TRON 生态提供安全、快速、便捷的 USDT 和 TRX 代付服务。'
      };
    }
  }

  /**
   * 生成首页静态 HTML
   */
  async generateHomePage() {
    const settings = await this.getSettings();
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- SEO 标签 -->
  <title>${settings.seoTitle || settings.siteName + ' - USDT/TRX 代付平台'}</title>
  <meta name="description" content="${settings.seoDescription || settings.siteDescription}">
  <meta name="keywords" content="USDT代付,TRX代付,加密货币支付,TRON转账,自动化代付,区块链支付,数字货币,USDT转账,TRX转账">
  <meta name="author" content="${settings.footerCompanyName}">
  <meta name="robots" content="index, follow">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${this.domain}/">
  <meta property="og:title" content="${settings.seoTitle || settings.siteName + ' - USDT/TRX 代付平台'}">
  <meta property="og:description" content="${settings.seoDescription || settings.siteDescription}">
  <meta property="og:image" content="${this.domain}/og-image.jpg">
  <meta property="og:locale" content="zh_CN">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${this.domain}/">
  <meta name="twitter:title" content="${settings.seoTitle || settings.siteName + ' - USDT/TRX 代付平台'}">
  <meta name="twitter:description" content="${settings.seoDescription || settings.siteDescription}">
  <meta name="twitter:image" content="${this.domain}/og-image.jpg">
  
  <!-- 规范链接 -->
  <link rel="canonical" href="${this.domain}/">
  
  <!-- 结构化数据 -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "${settings.siteName}",
    "description": "${settings.seoDescription || settings.siteDescription}",
    "url": "${this.domain}",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "category": "加密货币支付服务"
    },
    "provider": {
      "@type": "Organization",
      "name": "${settings.footerCompanyName}",
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
      <h1>${settings.siteName}</h1>
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
      <h2>关于 ${settings.siteName}</h2>
      <p>${settings.footerDescription}</p>
      <p>平台支持自动化转账、多钱包管理、能量租赁、闪兑服务等功能，帮助您轻松完成各类加密货币支付需求。无论是个人用户还是企业客户，都能在 ${settings.siteName} 找到适合的解决方案。</p>
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
      <p>&copy; 2024 ${settings.footerCompanyName}. All rights reserved.</p>
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
   * 生成能量租赁页面静态 HTML
   */
  async generateEnergyPage() {
    const settings = await this.getSettings();
    
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${settings.siteName} - 能量租赁 | TRON 能量租赁服务</title>
  <meta name="description" content="提供专业的 TRON 能量租赁服务，大幅降低 USDT 转账手续费，节省成本高达 90%。快速、安全、便捷。">
  <meta name="keywords" content="TRON能量,能量租赁,USDT手续费,TRX能量,波场能量">
  <link rel="canonical" href="${this.domain}/energy">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      color: white;
      padding: 40px 20px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { font-size: 48px; margin-bottom: 20px; text-align: center; }
    .subtitle { font-size: 20px; text-align: center; margin-bottom: 40px; opacity: 0.9; }
    .content { background: rgba(255, 255, 255, 0.1); padding: 40px; border-radius: 15px; backdrop-filter: blur(10px); line-height: 1.8; }
    .content h2 { font-size: 28px; margin: 30px 0 15px; }
    .content p { margin-bottom: 15px; }
    .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0; }
    .feature { background: rgba(255, 255, 255, 0.15); padding: 25px; border-radius: 10px; }
    .feature h3 { font-size: 20px; margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>⚡ 能量租赁</h1>
    <p class="subtitle">降低 USDT 转账手续费，节省高达 90% 的成本</p>
    
    <div class="content">
      <h2>什么是 TRON 能量？</h2>
      <p>TRON 能量是 TRON 网络中用于执行智能合约的资源。在进行 USDT（TRC20）转账时，需要消耗能量。如果账户没有足够的能量，系统会自动燃烧 TRX 来支付手续费，成本较高。</p>
      
      <h2>为什么要租赁能量？</h2>
      <div class="features">
        <div class="feature">
          <h3>💰 大幅降低成本</h3>
          <p>租赁能量的成本远低于直接燃烧 TRX，可节省 90% 以上的手续费。</p>
        </div>
        <div class="feature">
          <h3>⚡ 快速到账</h3>
          <p>能量租赁即时生效，无需等待，立即可用于转账。</p>
        </div>
        <div class="feature">
          <h3>🔒 安全可靠</h3>
          <p>通过官方质押机制，安全有保障，无需担心资金安全。</p>
        </div>
        <div class="feature">
          <h3>📊 灵活租赁</h3>
          <p>支持按需租赁，根据实际需求选择租赁时长和数量。</p>
        </div>
      </div>
      
      <h2>租赁流程</h2>
      <p>1. 选择租赁数量和时长</p>
      <p>2. 支付租赁费用</p>
      <p>3. 能量即时到账</p>
      <p>4. 开始使用能量进行 USDT 转账</p>
      
      <h2>适用场景</h2>
      <p>• 频繁进行 USDT 转账的用户</p>
      <p>• 需要批量转账的商户</p>
      <p>• 希望降低转账成本的个人用户</p>
      <p>• 代付平台和交易所</p>
    </div>
  </div>
</body>
</html>`;

    const filePath = path.join(this.distPath, 'energy.html');
    await fs.writeFile(filePath, html, 'utf8');
    return { success: true, path: filePath };
  }

  /**
   * 生成闪兑页面静态 HTML
   */
  async generateSwapPage() {
    const settings = await this.getSettings();
    
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${settings.siteName} - 闪兑中心 | TRX/USDT 快速兑换</title>
  <meta name="description" content="提供 TRX 和 USDT 快速兑换服务，实时汇率，秒级到账，支持大额交易。">
  <meta name="keywords" content="TRX兑换,USDT兑换,加密货币兑换,闪兑,快速兑换">
  <link rel="canonical" href="${this.domain}/swap">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      color: white;
      padding: 40px 20px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { font-size: 48px; margin-bottom: 20px; text-align: center; }
    .subtitle { font-size: 20px; text-align: center; margin-bottom: 40px; opacity: 0.9; }
    .content { background: rgba(255, 255, 255, 0.1); padding: 40px; border-radius: 15px; backdrop-filter: blur(10px); line-height: 1.8; }
    .content h2 { font-size: 28px; margin: 30px 0 15px; }
    .content p { margin-bottom: 15px; }
    .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0; }
    .feature { background: rgba(255, 255, 255, 0.15); padding: 25px; border-radius: 10px; }
    .feature h3 { font-size: 20px; margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔄 闪兑中心</h1>
    <p class="subtitle">TRX/USDT 快速兑换，实时汇率，秒级到账</p>
    
    <div class="content">
      <h2>什么是闪兑？</h2>
      <p>闪兑是一种快速的加密货币兑换服务，支持 TRX 和 USDT 之间的即时兑换。无需等待，实时到账，方便快捷。</p>
      
      <h2>闪兑优势</h2>
      <div class="features">
        <div class="feature">
          <h3>⚡ 秒级到账</h3>
          <p>兑换完成后，资金即时到账，无需等待确认。</p>
        </div>
        <div class="feature">
          <h3>💱 实时汇率</h3>
          <p>采用实时市场汇率，公平透明，无隐藏费用。</p>
        </div>
        <div class="feature">
          <h3>💰 支持大额</h3>
          <p>支持大额交易，满足各类用户需求。</p>
        </div>
        <div class="feature">
          <h3>🔒 安全可靠</h3>
          <p>采用多重安全机制，确保资金安全。</p>
        </div>
      </div>
      
      <h2>兑换流程</h2>
      <p>1. 选择兑换方向（TRX → USDT 或 USDT → TRX）</p>
      <p>2. 输入兑换数量</p>
      <p>3. 确认汇率和到账金额</p>
      <p>4. 提交兑换订单</p>
      <p>5. 资金即时到账</p>
      
      <h2>适用场景</h2>
      <p>• 需要快速兑换 TRX 和 USDT 的用户</p>
      <p>• 希望获得实时汇率的交易者</p>
      <p>• 需要大额兑换的商户</p>
      <p>• 追求便捷体验的个人用户</p>
    </div>
  </div>
</body>
</html>`;

    const filePath = path.join(this.distPath, 'swap.html');
    await fs.writeFile(filePath, html, 'utf8');
    return { success: true, path: filePath };
  }

  /**
   * 生成 FAQ 页面静态 HTML
   */
  async generateFAQPage() {
    const settings = await this.getSettings();
    
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${settings.siteName} - 常见问题 | FAQ</title>
  <meta name="description" content="查看 ${settings.siteName} 的常见问题解答，了解代付、能量租赁、闪兑等服务的详细信息。">
  <meta name="keywords" content="常见问题,FAQ,帮助中心,使用指南">
  <link rel="canonical" href="${this.domain}/faq">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      color: white;
      padding: 40px 20px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { font-size: 48px; margin-bottom: 20px; text-align: center; }
    .subtitle { font-size: 20px; text-align: center; margin-bottom: 40px; opacity: 0.9; }
    .content { background: rgba(255, 255, 255, 0.1); padding: 40px; border-radius: 15px; backdrop-filter: blur(10px); line-height: 1.8; }
    .faq-item { background: rgba(255, 255, 255, 0.15); padding: 25px; border-radius: 10px; margin-bottom: 20px; }
    .faq-item h3 { font-size: 20px; margin-bottom: 10px; }
    .faq-item p { opacity: 0.9; }
  </style>
</head>
<body>
  <div class="container">
    <h1>❓ 常见问题</h1>
    <p class="subtitle">查找您需要的答案</p>
    
    <div class="content">
      <div class="faq-item">
        <h3>什么是代付服务？</h3>
        <p>代付服务是指我们帮助您完成 USDT 或 TRX 的转账操作。您只需提供收款地址和金额，我们会自动完成转账，并提供转账凭证。</p>
      </div>
      
      <div class="faq-item">
        <h3>代付需要多长时间？</h3>
        <p>通常情况下，代付会在 1-3 分钟内完成。具体时间取决于区块链网络的拥堵情况。</p>
      </div>
      
      <div class="faq-item">
        <h3>代付手续费是多少？</h3>
        <p>手续费根据转账类型和金额而定。USDT 转账手续费约为 1-5 TRX，TRX 转账手续费约为 1-2 TRX。具体费用请在下单时查看。</p>
      </div>
      
      <div class="faq-item">
        <h3>什么是能量租赁？</h3>
        <p>能量租赁是指租用 TRON 网络的能量资源，用于降低 USDT 转账的手续费。租赁能量的成本远低于直接燃烧 TRX。</p>
      </div>
      
      <div class="faq-item">
        <h3>如何使用闪兑服务？</h3>
        <p>在闪兑页面选择兑换方向（TRX ↔ USDT），输入兑换数量，确认汇率后提交订单即可。资金会即时到账。</p>
      </div>
      
      <div class="faq-item">
        <h3>资金安全吗？</h3>
        <p>我们采用多重安全机制保护您的资金安全，包括私钥加密存储、交易全程监控、多钱包分散管理等。所有转账都在区块链上可追溯。</p>
      </div>
      
      <div class="faq-item">
        <h3>如何联系客服？</h3>
        <p>您可以通过 Telegram 联系我们的客服团队，我们会在第一时间为您解答问题。</p>
      </div>
    </div>
  </div>
</body>
</html>`;

    const filePath = path.join(this.distPath, 'faq.html');
    await fs.writeFile(filePath, html, 'utf8');
    return { success: true, path: filePath };
  }

  /**
   * 生成 sitemap.xml
   * 包含所有 SEO 优化的内容页面（与脚本生成保持一致）
   */
  async generateSitemap() {
    const now = new Date().toISOString().split('T')[0];
    
    // 页面配置（与 scripts/generate-sitemap.js 保持一致）
    const pages = [
      // 首页
      { loc: '/', priority: '1.0', changefreq: 'daily' },
      
      // 博客列表
      { loc: '/blog', priority: '0.9', changefreq: 'daily' },
      
      // 服务总览
      { loc: '/services', priority: '0.9', changefreq: 'weekly' },
      
      // 服务详情页面
      { loc: '/services/usdt-payment', priority: '0.8', changefreq: 'weekly' },
      { loc: '/services/trx-payment', priority: '0.8', changefreq: 'weekly' },
      { loc: '/services/energy-rental', priority: '0.8', changefreq: 'weekly' },
      { loc: '/services/swap', priority: '0.8', changefreq: 'weekly' },
      
      // 使用指南页面
      { loc: '/guides/beginner', priority: '0.7', changefreq: 'monthly' },
      { loc: '/guides/api', priority: '0.7', changefreq: 'monthly' },
      { loc: '/guides/faq', priority: '0.7', changefreq: 'weekly' },
      
      // 关于我们页面
      { loc: '/about/company', priority: '0.6', changefreq: 'monthly' },
      { loc: '/about/security', priority: '0.6', changefreq: 'monthly' },
      { loc: '/about/contact', priority: '0.6', changefreq: 'monthly' },
      
      // 功能页面
      { loc: '/pay', priority: '0.9', changefreq: 'daily' },
      { loc: '/pay-trx', priority: '0.9', changefreq: 'daily' },
      { loc: '/energy-rental', priority: '0.9', changefreq: 'daily' },
      { loc: '/swap', priority: '0.9', changefreq: 'daily' },
      
      // 用户中心
      { loc: '/login', priority: '0.5', changefreq: 'monthly' }
    ];
    
    try {
      // 获取已发布的博客文章
      const Blog = require('../models/Blog');
      const blogs = await Blog.find({ status: 'published' })
        .select('slug updatedAt')
        .lean();
      
      console.log(`📝 找到 ${blogs.length} 篇已发布的博客文章`);
      
      // 添加博客文章到页面列表
      blogs.forEach(blog => {
        const lastmod = blog.updatedAt 
          ? blog.updatedAt.toISOString().split('T')[0] 
          : now;
        pages.push({
          loc: `/blog/${blog.slug}`,
          priority: '0.7',
          changefreq: 'weekly',
          lastmod
        });
      });
    } catch (error) {
      console.error('获取博客文章失败:', error);
      // 继续生成 sitemap，只是不包含博客文章
    }
    
    // 生成 URL 条目
    const urls = pages.map(page => {
      const lastmod = page.lastmod || now;
      return `  <url>
    <loc>${this.domain}${page.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    }).join('\n\n');
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

${urls}

</urlset>`;

    const filePath = path.join(this.distPath, 'sitemap.xml');
    await fs.writeFile(filePath, sitemap, 'utf8');
    
    console.log(`✅ Sitemap 生成成功！包含 ${pages.length} 个页面`);
    
    return { 
      success: true, 
      path: filePath,
      pageCount: pages.length
    };
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
        energy: await this.generateEnergyPage(),
        swap: await this.generateSwapPage(),
        faq: await this.generateFAQPage(),
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
      const files = ['landing.html', 'energy.html', 'swap.html', 'faq.html', 'sitemap.xml', 'robots.txt'];
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
