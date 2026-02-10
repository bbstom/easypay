/**
 * Sitemap 生成脚本
 * 自动生成 sitemap.xml 文件
 * 
 * 使用方法：
 * node scripts/generate-sitemap.js
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// 配置
// 优先使用 SITE_URL，其次 FRONTEND_URL，最后使用默认值
const DOMAIN = process.env.SITE_URL || process.env.FRONTEND_URL || process.env.APP_URL || 'https://dd.vpno.eu.org';
const OUTPUT_PATH = path.join(__dirname, '../public/sitemap.xml');

// 获取当前日期（YYYY-MM-DD 格式）
const getCurrentDate = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

// 页面配置
const pages = [
  // 首页
  {
    path: '/',
    changefreq: 'daily',
    priority: 1.0
  },
  
  // 博客列表
  {
    path: '/blog',
    changefreq: 'daily',
    priority: 0.9
  },
  
  // 服务总览
  {
    path: '/services',
    changefreq: 'weekly',
    priority: 0.9
  },
  
  // 服务详情页面
  {
    path: '/services/usdt-payment',
    changefreq: 'weekly',
    priority: 0.8
  },
  {
    path: '/services/trx-payment',
    changefreq: 'weekly',
    priority: 0.8
  },
  {
    path: '/services/energy-rental',
    changefreq: 'weekly',
    priority: 0.8
  },
  {
    path: '/services/swap',
    changefreq: 'weekly',
    priority: 0.8
  },
  
  // 使用指南页面
  {
    path: '/guides/beginner',
    changefreq: 'monthly',
    priority: 0.7
  },
  {
    path: '/guides/api',
    changefreq: 'monthly',
    priority: 0.7
  },
  {
    path: '/guides/faq',
    changefreq: 'weekly',
    priority: 0.7
  },
  
  // 关于我们页面
  {
    path: '/about/company',
    changefreq: 'monthly',
    priority: 0.6
  },
  {
    path: '/about/security',
    changefreq: 'monthly',
    priority: 0.6
  },
  {
    path: '/about/contact',
    changefreq: 'monthly',
    priority: 0.6
  },
  
  // 功能页面
  {
    path: '/pay',
    changefreq: 'daily',
    priority: 0.9
  },
  {
    path: '/pay-trx',
    changefreq: 'daily',
    priority: 0.9
  },
  {
    path: '/energy-rental',
    changefreq: 'daily',
    priority: 0.9
  },
  {
    path: '/swap',
    changefreq: 'daily',
    priority: 0.9
  },
  
  // 用户中心
  {
    path: '/login',
    changefreq: 'monthly',
    priority: 0.5
  }
];

// 生成 URL 条目
const generateUrlEntry = (page) => {
  const lastmod = page.lastmod || getCurrentDate();
  return `  <url>
    <loc>${DOMAIN}${page.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
};

// 生成 sitemap.xml
const generateSitemap = () => {
  const urlEntries = pages.map(generateUrlEntry).join('\n\n');
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

${urlEntries}

</urlset>`;

  return sitemap;
};

// 保存 sitemap.xml
const saveSitemap = async () => {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fastpay');
    console.log('✅ 数据库连接成功');
    
    // 获取已发布的博客文章
    const Blog = mongoose.model('Blog', new mongoose.Schema({
      slug: String,
      status: String,
      updatedAt: Date
    }));
    
    const blogs = await Blog.find({ status: 'published' }).select('slug updatedAt').lean();
    console.log(`📝 找到 ${blogs.length} 篇已发布的博客文章`);
    
    // 添加博客文章到页面列表
    blogs.forEach(blog => {
      pages.push({
        path: `/blog/${blog.slug}`,
        changefreq: 'weekly',
        priority: 0.7,
        lastmod: blog.updatedAt ? blog.updatedAt.toISOString().split('T')[0] : getCurrentDate()
      });
    });
    
    const sitemap = generateSitemap();
    fs.writeFileSync(OUTPUT_PATH, sitemap, 'utf8');
    
    console.log('✅ Sitemap 生成成功！');
    console.log(`📍 文件位置: ${OUTPUT_PATH}`);
    console.log(`📊 包含 ${pages.length} 个页面`);
    console.log(`   - 静态页面: ${pages.length - blogs.length} 个`);
    console.log(`   - 博客文章: ${blogs.length} 个`);
    console.log(`🔗 域名: ${DOMAIN}`);
    console.log(`📅 更新时间: ${getCurrentDate()}`);
    
    // 关闭数据库连接
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Sitemap 生成失败:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// 执行生成
saveSitemap();
