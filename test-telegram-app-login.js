/**
 * Telegram 应用登录测试脚本
 * 
 * 用途：测试 Telegram 应用登录和扫码登录功能
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000';
const BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME || 'YourBotUsername';

// 测试配置
const testConfig = {
  apiUrl: API_URL,
  botUsername: BOT_USERNAME
};

console.log('🧪 Telegram 登录功能测试\n');
console.log('配置信息：');
console.log(`  API URL: ${testConfig.apiUrl}`);
console.log(`  Bot Username: ${testConfig.botUsername}`);
console.log('');

// 测试 1: 生成登录令牌
function testGenerateToken() {
  console.log('📝 测试 1: 生成登录令牌');
  
  const token = `login_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  console.log(`  ✅ 生成的令牌: ${token}`);
  
  return token;
}

// 测试 2: 生成深度链接
function testGenerateDeepLink(token) {
  console.log('\n📝 测试 2: 生成深度链接');
  
  const tgUrl = `tg://resolve?domain=${testConfig.botUsername}&start=${token}`;
  const webUrl = `https://t.me/${testConfig.botUsername}?start=${token}`;
  
  console.log(`  ✅ 应用链接: ${tgUrl}`);
  console.log(`  ✅ 网页链接: ${webUrl}`);
  
  return { tgUrl, webUrl };
}

// 测试 3: 检查登录状态 API
async function testCheckLoginStatus(token) {
  console.log('\n📝 测试 3: 检查登录状态 API');
  
  try {
    const response = await axios.get(`${testConfig.apiUrl}/api/auth/check-qr-login?token=${token}`);
    console.log(`  ✅ API 响应: ${JSON.stringify(response.data)}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.log(`  ⚠️  API 返回错误: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else if (error.code === 'ECONNREFUSED') {
      console.log(`  ❌ 无法连接到服务器: ${testConfig.apiUrl}`);
      console.log(`  💡 请确保后端服务已启动`);
    } else {
      console.log(`  ❌ 请求失败: ${error.message}`);
    }
    return null;
  }
}

// 测试 4: 模拟确认登录 API
async function testConfirmLogin(token) {
  console.log('\n📝 测试 4: 确认登录 API');
  
  const testData = {
    token: token,
    telegramId: '123456789',
    username: 'test_user',
    firstName: 'Test',
    lastName: 'User',
    photoUrl: ''
  };
  
  try {
    const response = await axios.post(`${testConfig.apiUrl}/api/auth/confirm-qr-login`, testData);
    console.log(`  ✅ API 响应: ${JSON.stringify(response.data)}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.log(`  ⚠️  API 返回错误: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else if (error.code === 'ECONNREFUSED') {
      console.log(`  ❌ 无法连接到服务器: ${testConfig.apiUrl}`);
      console.log(`  💡 请确保后端服务已启动`);
    } else {
      console.log(`  ❌ 请求失败: ${error.message}`);
    }
    return null;
  }
}

// 测试 5: 验证登录状态更新
async function testLoginStatusUpdate(token) {
  console.log('\n📝 测试 5: 验证登录状态更新');
  
  try {
    const response = await axios.get(`${testConfig.apiUrl}/api/auth/check-qr-login?token=${token}`);
    
    if (response.data.success && response.data.userData) {
      console.log(`  ✅ 登录状态已更新`);
      console.log(`  ✅ 用户数据: ${JSON.stringify(response.data.userData)}`);
      return true;
    } else {
      console.log(`  ⚠️  登录状态未更新`);
      return false;
    }
  } catch (error) {
    console.log(`  ❌ 检查失败: ${error.message}`);
    return false;
  }
}

// 运行所有测试
async function runAllTests() {
  console.log('═══════════════════════════════════════════════════════\n');
  
  // 测试 1: 生成令牌
  const token = testGenerateToken();
  
  // 测试 2: 生成深度链接
  const links = testGenerateDeepLink(token);
  
  // 测试 3: 检查登录状态（应该返回 success: false）
  await testCheckLoginStatus(token);
  
  // 测试 4: 模拟确认登录
  const confirmResult = await testConfirmLogin(token);
  
  if (confirmResult && confirmResult.success) {
    // 测试 5: 验证登录状态更新
    await testLoginStatusUpdate(token);
  }
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('\n✅ 测试完成！\n');
  
  console.log('📋 手动测试步骤：');
  console.log('');
  console.log('1️⃣  打开应用登录测试：');
  console.log('   - 访问登录页面');
  console.log('   - 点击"打开 Telegram 应用登录"按钮');
  console.log('   - 检查是否打开 Telegram 应用');
  console.log('   - 在 Telegram 中点击"确认登录"');
  console.log('   - 检查是否自动登录成功');
  console.log('');
  console.log('2️⃣  扫码登录测试：');
  console.log('   - 访问登录页面');
  console.log('   - 点击"或扫描二维码登录"按钮');
  console.log('   - 用 Telegram 扫描二维码');
  console.log('   - 在 Telegram 中点击"确认登录"');
  console.log('   - 检查是否自动登录成功');
  console.log('');
  console.log('3️⃣  二维码过期测试：');
  console.log('   - 生成二维码后等待 2 分钟');
  console.log('   - 检查是否显示过期提示');
  console.log('   - 点击刷新二维码');
  console.log('   - 检查是否生成新的二维码');
  console.log('');
  console.log('4️⃣  取消登录测试：');
  console.log('   - 扫码或打开应用后');
  console.log('   - 在 Telegram 中点击"❌ 取消"');
  console.log('   - 检查是否显示取消提示');
  console.log('');
  console.log('5️⃣  移动端测试：');
  console.log('   - 在手机浏览器中测试');
  console.log('   - 检查按钮布局是否正常');
  console.log('   - 检查二维码大小是否合适');
  console.log('');
}

// 执行测试
runAllTests().catch(error => {
  console.error('\n❌ 测试执行失败:', error);
  process.exit(1);
});
