#!/usr/bin/env node

/**
 * 生成强加密密钥
 */

const crypto = require('crypto');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔑 生成强加密密钥');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// 生成 64 字节（512 位）的随机密钥
const key64 = crypto.randomBytes(64).toString('hex');
const key32 = crypto.randomBytes(32).toString('hex');

console.log('推荐使用 64 字节密钥（更安全）：\n');
console.log('ENCRYPTION_KEY=' + key64);
console.log('\n或使用 32 字节密钥（最低要求）：\n');
console.log('ENCRYPTION_KEY=' + key32);

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📝 使用说明');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('1. 复制上面生成的密钥');
console.log('2. 添加到 .env 文件中');
console.log('3. 如果已有钱包，需要运行密钥轮换脚本');
console.log('4. 重启后端服务\n');

console.log('⚠️  重要提醒：');
console.log('  - 请妥善保管此密钥');
console.log('  - 不要将密钥提交到 Git');
console.log('  - 定期更换密钥（建议每 3-6 个月）');
console.log('  - 备份密钥到安全位置\n');
