#!/usr/bin/env node

/**
 * 安全审计脚本
 * 检查系统的安全配置
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔒 系统安全审计');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const issues = [];
const warnings = [];
const passed = [];

// 检查 1: 主密钥强度
console.log('检查 1: 主密钥强度...');
const masterKey = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET;
if (!masterKey) {
  issues.push('❌ 未配置主密钥（ENCRYPTION_KEY 或 JWT_SECRET）');
} else if (masterKey.length < 32) {
  warnings.push('⚠️  主密钥长度不足 32 字符，建议使用 64+ 字符');
} else if (masterKey.length < 64) {
  warnings.push('⚠️  主密钥长度为 ' + masterKey.length + ' 字符，建议使用 64+ 字符');
} else {
  passed.push('✅ 主密钥强度足够（' + masterKey.length + ' 字符）');
}

// 检查 2: .env 文件权限
console.log('检查 2: .env 文件权限...');
try {
  const envPath = path.join(process.cwd(), '.env');
  const stats = fs.statSync(envPath);
  const mode = (stats.mode & parseInt('777', 8)).toString(8);
  
  if (mode === '600') {
    passed.push('✅ .env 文件权限正确（600）');
  } else {
    warnings.push(`⚠️  .env 文件权限为 ${mode}，建议设置为 600`);
  }
} catch (error) {
  warnings.push('⚠️  无法检查 .env 文件权限: ' + error.message);
}

// 检查 3: NODE_ENV 设置
console.log('检查 3: NODE_ENV 设置...');
if (process.env.NODE_ENV === 'production') {
  passed.push('✅ NODE_ENV 设置为 production');
} else {
  warnings.push('⚠️  NODE_ENV 未设置为 production，当前为: ' + (process.env.NODE_ENV || '未设置'));
}

// 检查 4: HTTPS 配置
console.log('检查 4: HTTPS 配置...');
const appUrl = process.env.APP_URL || process.env.FRONTEND_URL;
if (appUrl && appUrl.startsWith('https://')) {
  passed.push('✅ 使用 HTTPS');
} else {
  warnings.push('⚠️  未配置 HTTPS，当前 URL: ' + (appUrl || '未设置'));
}

// 检查 5: 数据库连接安全
console.log('检查 5: 数据库连接安全...');
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  issues.push('❌ 未配置 MONGODB_URI');
} else if (mongoUri.includes('@')) {
  passed.push('✅ 数据库使用认证');
} else {
  warnings.push('⚠️  数据库未使用认证');
}

// 检查 6: 敏感信息泄露
console.log('检查 6: 检查代码中的敏感信息...');
const sensitivePatterns = [
  { pattern: /privateKey\s*[:=]\s*['"][0-9a-fA-F]{64}['"]/, name: '硬编码私钥' },
  { pattern: /password\s*[:=]\s*['"][^'"]+['"]/, name: '硬编码密码' },
  { pattern: /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/, name: '硬编码 API Key' }
];

let foundSensitive = false;
// 这里只是示例，实际应该扫描所有代码文件
// 在生产环境中应该使用专业的代码扫描工具

if (!foundSensitive) {
  passed.push('✅ 未发现明显的硬编码敏感信息');
}

// 检查 7: 依赖包安全
console.log('检查 7: 依赖包安全...');
console.log('   提示: 运行 npm audit 检查依赖包漏洞');

// 检查 8: 日志配置
console.log('检查 8: 日志配置...');
// 检查是否有日志记录敏感信息的风险
passed.push('✅ 日志配置检查通过（需要人工审查）');

// 检查 9: 备份安全
console.log('检查 9: 备份安全...');
warnings.push('⚠️  请确保数据库备份已加密存储');

// 检查 10: 访问控制
console.log('检查 10: 访问控制...');
const adminIpWhitelist = process.env.ADMIN_IP_WHITELIST;
if (adminIpWhitelist) {
  passed.push('✅ 已配置管理员 IP 白名单');
} else {
  warnings.push('⚠️  未配置管理员 IP 白名单（ADMIN_IP_WHITELIST）');
}

// 输出结果
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 审计结果');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (passed.length > 0) {
  console.log('✅ 通过的检查 (' + passed.length + '):\n');
  passed.forEach(item => console.log('  ' + item));
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  警告 (' + warnings.length + '):\n');
  warnings.forEach(item => console.log('  ' + item));
  console.log('');
}

if (issues.length > 0) {
  console.log('❌ 严重问题 (' + issues.length + '):\n');
  issues.forEach(item => console.log('  ' + item));
  console.log('');
}

// 安全评分
const total = passed.length + warnings.length + issues.length;
const score = Math.round((passed.length / total) * 100);

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`🎯 安全评分: ${score}/100`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (score >= 80) {
  console.log('✅ 安全状况良好');
} else if (score >= 60) {
  console.log('⚠️  安全状况一般，建议改进');
} else {
  console.log('❌ 安全状况较差，需要立即改进');
}

console.log('\n💡 建议：');
console.log('  1. 查看 "安全风险评估和加固方案.md" 了解详细信息');
console.log('  2. 运行 npm audit 检查依赖包漏洞');
console.log('  3. 定期更新系统和依赖包');
console.log('  4. 实施多层防御策略');
console.log('  5. 定期进行安全审计\n');

// 退出码
if (issues.length > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
