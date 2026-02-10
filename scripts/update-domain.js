/**
 * 域名更新脚本
 * 在构建前自动更新 index.html 中的域名
 * 
 * 使用方法：
 * node scripts/update-domain.js
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 获取域名配置
const DOMAIN = process.env.SITE_URL || process.env.FRONTEND_URL || process.env.APP_URL || 'https://dd.vpno.eu.org';
const INDEX_HTML_PATH = path.join(__dirname, '../index.html');

console.log('🔧 开始更新域名配置...');
console.log(`📍 目标域名: ${DOMAIN}`);

try {
  // 读取 index.html
  let content = fs.readFileSync(INDEX_HTML_PATH, 'utf8');
  
  // 替换所有硬编码的域名
  const oldDomain = 'https://dd.vpno.eu.org';
  const regex = new RegExp(oldDomain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  
  // 统计替换次数
  const matches = content.match(regex);
  const count = matches ? matches.length : 0;
  
  // 执行替换
  content = content.replace(regex, DOMAIN);
  
  // 写回文件
  fs.writeFileSync(INDEX_HTML_PATH, content, 'utf8');
  
  console.log(`✅ 域名更新成功！`);
  console.log(`📊 替换了 ${count} 处域名引用`);
  console.log(`📄 文件: ${INDEX_HTML_PATH}`);
} catch (error) {
  console.error('❌ 域名更新失败:', error);
  process.exit(1);
}
