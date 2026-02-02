require('dotenv').config();
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
let authToken = '';

// 测试用的管理员账号（需要先创建）
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

async function login() {
  try {
    console.log('🔐 登录管理员账号...\n');
    const { data } = await axios.post(`${API_BASE}/auth/login`, ADMIN_CREDENTIALS);
    authToken = data.token;
    console.log('✅ 登录成功\n');
    return true;
  } catch (error) {
    console.error('❌ 登录失败:', error.response?.data || error.message);
    return false;
  }
}

async function testGetWallets() {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 测试: GET /api/wallets - 获取钱包列表');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const { data } = await axios.get(`${API_BASE}/wallets`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log(`✅ 成功获取 ${data.total} 个钱包\n`);
    
    data.wallets.forEach((wallet, index) => {
      console.log(`${index + 1}. ${wallet.name} ${wallet.enabled ? '✓' : '✗'}`);
      console.log(`   ID: ${wallet.id}`);
      console.log(`   地址: ${wallet.address}`);
      console.log(`   优先级: ${wallet.priority}`);
      console.log(`   余额: TRX ${wallet.balance.trx.toFixed(2)} | USDT ${wallet.balance.usdt.toFixed(2)}`);
      console.log(`   健康: ${wallet.health.status}`);
      console.log('');
    });

    return data.wallets[0]?.id; // 返回第一个钱包ID用于后续测试
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
    return null;
  }
}

async function testGetWalletDetail(walletId) {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 测试: GET /api/wallets/:id - 获取钱包详情');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const { data } = await axios.get(`${API_BASE}/wallets/${walletId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('✅ 成功获取钱包详情\n');
    console.log(`名称: ${data.wallet.name}`);
    console.log(`地址: ${data.wallet.address}`);
    console.log(`优先级: ${data.wallet.priority}`);
    console.log(`状态: ${data.wallet.enabled ? '启用' : '禁用'}`);
    console.log(`健康: ${data.wallet.health.status}`);
    console.log(`余额: TRX ${data.wallet.balance.trx.toFixed(2)} | USDT ${data.wallet.balance.usdt.toFixed(2)}`);
    console.log(`交易: ${data.wallet.stats.totalTransactions} 笔\n`);
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

async function testGetWalletStats(walletId) {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 测试: GET /api/wallets/:id/stats - 获取钱包统计');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const { data } = await axios.get(`${API_BASE}/wallets/${walletId}/stats`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('✅ 成功获取统计信息\n');
    console.log(`总交易: ${data.stats.totalTransactions} 笔`);
    console.log(`成功: ${data.stats.successfulTransactions} 笔`);
    console.log(`失败: ${data.stats.failedTransactions} 笔`);
    console.log(`成功率: ${data.stats.successRate}`);
    console.log(`最后使用: ${data.stats.lastUsed ? new Date(data.stats.lastUsed).toLocaleString('zh-CN') : '从未使用'}\n`);
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

async function testRefreshWallet(walletId) {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔄 测试: POST /api/wallets/:id/refresh - 刷新钱包状态');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const { data } = await axios.post(`${API_BASE}/wallets/${walletId}/refresh`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('✅ 刷新成功\n');
    console.log(`余额: TRX ${data.wallet.balance.trx.toFixed(2)} | USDT ${data.wallet.balance.usdt.toFixed(2)}`);
    console.log(`健康: ${data.wallet.health.status}\n`);
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

async function testSelectWallet() {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 测试: POST /api/wallets/select - 选择最优钱包');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const { data } = await axios.post(`${API_BASE}/wallets/select`, {
      amount: 10,
      type: 'USDT',
      estimatedFee: 15
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('✅ 选择成功\n');
    console.log(`选中钱包: ${data.wallet.name}`);
    console.log(`地址: ${data.wallet.address}`);
    console.log(`优先级: ${data.wallet.priority}`);
    console.log(`余额: TRX ${data.wallet.balance.trx.toFixed(2)} | USDT ${data.wallet.balance.usdt.toFixed(2)}\n`);
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

async function testGetRecommendations() {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 测试: POST /api/wallets/recommendations - 获取推荐列表');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const { data } = await axios.post(`${API_BASE}/wallets/recommendations`, {
      amount: 10,
      type: 'USDT',
      estimatedFee: 15
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('✅ 获取成功\n');
    
    data.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec.name} - 得分: ${rec.score}`);
      console.log(`   ${rec.eligible ? '✅ 符合条件' : `❌ ${rec.reason}`}`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

async function testHealthCheck() {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏥 测试: GET /api/wallets/health - 健康检查');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const { data } = await axios.get(`${API_BASE}/wallets/health`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('✅ 健康检查完成\n');
    console.log(`总钱包数: ${data.health.total}`);
    console.log(`启用: ${data.health.enabled} | 禁用: ${data.health.disabled}`);
    console.log(`健康: ${data.health.healthy} | 警告: ${data.health.warning} | 错误: ${data.health.error}`);
    console.log(`总余额: TRX ${data.health.totalBalance.trx.toFixed(2)} | USDT ${data.health.totalBalance.usdt.toFixed(2)}`);
    console.log(`总交易: ${data.health.totalTransactions} 笔`);
    console.log(`成功率: ${data.health.successRate}\n`);
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

async function runTests() {
  console.log('\n🧪 开始测试多钱包管理 API\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 登录
  const loggedIn = await login();
  if (!loggedIn) {
    console.log('\n❌ 登录失败，无法继续测试');
    console.log('💡 请确保：');
    console.log('   1. 服务器正在运行（npm run dev）');
    console.log('   2. 已创建管理员账号（npm run create-admin）');
    return;
  }

  // 测试各个 API
  const walletId = await testGetWallets();
  
  if (walletId) {
    await testGetWalletDetail(walletId);
    await testGetWalletStats(walletId);
    await testRefreshWallet(walletId);
  }

  await testSelectWallet();
  await testGetRecommendations();
  await testHealthCheck();

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ 所有测试完成');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

runTests();
