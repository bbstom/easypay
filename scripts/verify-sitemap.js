/**
 * Sitemap 验证脚本
 * 验证生成的 sitemap.xml 是否包含所有页面
 * 
 * 使用方法：
 * node scripts/verify-sitemap.js
 */

const fs = require('fs');
const path = require('path');

// 预期的页面列表
const expectedPages = [
  '/',
  '/services',
  '/services/usdt-payment',
  '/services/trx-payment',
  '/services/energy-rental',
  '/services/swap',
  '/guides/beginner',
  '/guides/api',
  '/guides/faq',
  '/about/company',
  '/about/security',
  '/about/contact',
  '/pay',
  '/pay-trx',
  '/energy-rental',
  '/swap',
  '/login'
];

// 读取 sitemap.xml
const sitemapPath = path.join(__dirname, '../public/sitemap.xml');

console.log('🔍 开始验证 sitemap.xml...\n');

try {
  // 检查文件是否存在
  if (!fs.existsSync(sitemapPath)) {
    console.error('❌ 错误：sitemap.xml 文件不存在！');
    console.log('📍 预期位置:', sitemapPath);
    console.log('\n💡 请先运行: npm run generate-sitemap');
    process.exit(1);
  }

  // 读取文件内容
  const content = fs.readFileSync(sitemapPath, 'utf8');
  
  // 提取所有 URL
  const urlRegex = /<loc>https?:\/\/[^\/]+([^<]+)<\/loc>/g;
  const matches = content.matchAll(urlRegex);
  const foundPages = Array.from(matches, m => m[1]);
  
  console.log('📊 验证结果：\n');
  console.log(`✅ 找到 ${foundPages.length} 个页面`);
  console.log(`📋 预期 ${expectedPages.length} 个页面\n`);
  
  // 检查每个预期页面
  let missingPages = [];
  let foundCount = 0;
  
  console.log('📝 页面检查：\n');
  
  expectedPages.forEach((page, index) => {
    const found = foundPages.includes(page);
    if (found) {
      console.log(`  ${index + 1}. ✅ ${page}`);
      foundCount++;
    } else {
      console.log(`  ${index + 1}. ❌ ${page} (缺失)`);
      missingPages.push(page);
    }
  });
  
  // 检查是否有额外的页面
  const extraPages = foundPages.filter(page => !expectedPages.includes(page));
  
  if (extraPages.length > 0) {
    console.log('\n⚠️  发现额外的页面：\n');
    extraPages.forEach(page => {
      console.log(`  • ${page}`);
    });
  }
  
  // 总结
  console.log('\n' + '='.repeat(50));
  console.log('📊 验证总结：\n');
  
  if (missingPages.length === 0 && extraPages.length === 0) {
    console.log('✅ 完美！所有页面都已包含在 sitemap 中！');
    console.log(`✅ 共 ${foundCount} 个页面`);
    console.log('\n🎉 Sitemap 验证通过！');
  } else {
    if (missingPages.length > 0) {
      console.log(`❌ 缺失 ${missingPages.length} 个页面：`);
      missingPages.forEach(page => console.log(`   • ${page}`));
    }
    
    if (extraPages.length > 0) {
      console.log(`\n⚠️  包含 ${extraPages.length} 个额外页面：`);
      extraPages.forEach(page => console.log(`   • ${page}`));
    }
    
    console.log('\n💡 建议：检查 sitemap 生成逻辑');
  }
  
  // 检查 XML 格式
  console.log('\n' + '='.repeat(50));
  console.log('🔍 XML 格式检查：\n');
  
  const checks = [
    { name: 'XML 声明', regex: /<\?xml version="1\.0" encoding="UTF-8"\?>/, required: true },
    { name: 'urlset 标签', regex: /<urlset[^>]*>/, required: true },
    { name: 'xmlns 命名空间', regex: /xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/, required: true },
    { name: 'lastmod 标签', regex: /<lastmod>/, required: true },
    { name: 'changefreq 标签', regex: /<changefreq>/, required: true },
    { name: 'priority 标签', regex: /<priority>/, required: true }
  ];
  
  checks.forEach(check => {
    const found = check.regex.test(content);
    if (found) {
      console.log(`  ✅ ${check.name}`);
    } else {
      console.log(`  ${check.required ? '❌' : '⚠️ '} ${check.name} ${check.required ? '(必需)' : '(可选)'}`);
    }
  });
  
  // 文件信息
  console.log('\n' + '='.repeat(50));
  console.log('📄 文件信息：\n');
  
  const stats = fs.statSync(sitemapPath);
  console.log(`  📍 位置: ${sitemapPath}`);
  console.log(`  📏 大小: ${(stats.size / 1024).toFixed(2)} KB`);
  console.log(`  📅 修改时间: ${stats.mtime.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
  
  // 提供下一步建议
  console.log('\n' + '='.repeat(50));
  console.log('🚀 下一步：\n');
  
  if (missingPages.length === 0) {
    console.log('  1. ✅ Sitemap 已准备就绪');
    console.log('  2. 📤 提交到搜索引擎：');
    console.log('     • Google Search Console: https://search.google.com/search-console');
    console.log('     • 百度站长平台: https://ziyuan.baidu.com');
    console.log('     • Bing Webmaster: https://www.bing.com/webmasters');
    console.log('  3. 📊 监控收录效果');
  } else {
    console.log('  1. 🔧 修复缺失的页面');
    console.log('  2. 🔄 重新生成 sitemap: npm run generate-sitemap');
    console.log('  3. ✅ 再次验证: node scripts/verify-sitemap.js');
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 退出码
  process.exit(missingPages.length === 0 ? 0 : 1);
  
} catch (error) {
  console.error('❌ 验证失败:', error.message);
  process.exit(1);
}
