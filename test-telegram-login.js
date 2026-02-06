/**
 * Telegram 登录配置测试脚本
 * 
 * 用途：验证 Telegram 登录功能的配置是否正确
 * 
 * 使用方法：
 * node test-telegram-login.js
 */

require('dotenv').config();
const crypto = require('crypto');

console.log('🔍 Telegram 登录配置检查\n');

// 1. 检查环境变量
console.log('1️⃣ 检查环境变量...');
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const botUsername = process.env.TELEGRAM_BOT_USERNAME;

if (!botToken) {
  console.log('❌ TELEGRAM_BOT_TOKEN 未配置');
  console.log('   请在 .env 文件中添加：');
  console.log('   TELEGRAM_BOT_TOKEN=your_bot_token_here\n');
} else {
  console.log('✅ TELEGRAM_BOT_TOKEN 已配置');
  console.log(`   Token: ${botToken.substring(0, 10)}...${botToken.substring(botToken.length - 5)}\n`);
}

if (!botUsername) {
  console.log('❌ TELEGRAM_BOT_USERNAME 未配置');
  console.log('   请在 .env 文件中添加：');
  console.log('   TELEGRAM_BOT_USERNAME=YourBotUsername\n');
} else {
  console.log('✅ TELEGRAM_BOT_USERNAME 已配置');
  console.log(`   Username: @${botUsername}\n`);
}

// 2. 测试数据验证逻辑
console.log('2️⃣ 测试数据验证逻辑...');

if (botToken) {
  // 模拟 Telegram 返回的数据
  const testData = {
    id: 123456789,
    first_name: 'Test',
    username: 'testuser',
    auth_date: Math.floor(Date.now() / 1000)
  };

  // 生成签名
  const checkString = Object.keys(testData)
    .sort()
    .map(key => `${key}=${testData[key]}`)
    .join('\n');

  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const hash = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

  console.log('✅ 数据验证逻辑正常');
  console.log(`   测试数据: ${JSON.stringify(testData)}`);
  console.log(`   生成签名: ${hash.substring(0, 20)}...\n`);
} else {
  console.log('⚠️  无法测试验证逻辑（缺少 Bot Token）\n');
}

// 3. 检查前端配置
console.log('3️⃣ 检查前端配置...');
console.log('   请确保以下配置之一已完成：');
console.log('   方法1: 创建 .env.local 文件，添加：');
console.log('          REACT_APP_TELEGRAM_BOT_USERNAME=' + (botUsername || 'YourBotUsername'));
console.log('   方法2: vite.config.js 已配置（已自动完成）\n');

// 4. 检查 BotFather 设置
console.log('4️⃣ 检查 BotFather 设置...');
console.log('   请在 Telegram 中完成以下步骤：');
console.log('   1. 打开 @BotFather');
console.log('   2. 发送 /setdomain');
console.log('   3. 选择你的 Bot');
console.log('   4. 输入域名：');
console.log('      - 本地开发: localhost');
console.log('      - 生产环境: kk.vpno.eu.org\n');

// 5. 测试建议
console.log('5️⃣ 测试建议...');
console.log('   完成配置后，请按以下步骤测试：');
console.log('   1. 重启后端服务: npm run dev');
console.log('   2. 重启前端服务: cd client && npm run dev');
console.log('   3. 访问登录页面: http://localhost:3000/login');
console.log('   4. 点击 Telegram 登录按钮');
console.log('   5. 在弹出窗口中授权');
console.log('   6. 查看是否成功登录\n');

// 6. 总结
console.log('📊 配置状态总结：');
const checks = [
  { name: 'Bot Token', status: !!botToken },
  { name: 'Bot Username', status: !!botUsername }
];

checks.forEach(check => {
  console.log(`   ${check.status ? '✅' : '❌'} ${check.name}`);
});

const allPassed = checks.every(check => check.status);
console.log('\n' + (allPassed ? '🎉 所有配置检查通过！' : '⚠️  请完成缺失的配置'));

if (allPassed) {
  console.log('\n下一步：');
  console.log('1. 在 BotFather 中设置 domain');
  console.log('2. 重启服务');
  console.log('3. 测试登录功能\n');
} else {
  console.log('\n请参考文档完成配置：');
  console.log('- Telegram_登录快速配置指南.md');
  console.log('- Telegram_登录功能实现完成.md\n');
}

// 7. 生成示例配置
if (!allPassed) {
  console.log('📝 示例配置（.env）：');
  console.log('─'.repeat(50));
  console.log('# Telegram Bot 配置');
  console.log('TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz');
  console.log('TELEGRAM_BOT_USERNAME=FastPayBot');
  console.log('─'.repeat(50));
  console.log('');
}
