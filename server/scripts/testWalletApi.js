const axios = require('axios');

// 测试钱包API返回的数据结构
async function testWalletApi() {
  try {
    console.log('🔍 测试钱包API...\n');

    // 需要先登录获取token
    console.log('1. 登录获取token...');
    const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginRes.data.token;
    console.log('✅ 登录成功\n');

    // 测试获取钱包列表
    console.log('2. 获取钱包列表...');
    const walletsRes = await axios.get('http://localhost:3000/api/wallets', {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ 钱包列表获取成功');
    console.log(`   总数: ${walletsRes.data.wallets.length}\n`);

    if (walletsRes.data.wallets.length > 0) {
      const wallet = walletsRes.data.wallets[0];
      console.log('📋 第一个钱包的数据结构:');
      console.log('   _id:', wallet._id ? '✅' : '❌');
      console.log('   name:', wallet.name ? '✅' : '❌');
      console.log('   address:', wallet.address ? '✅' : '❌');
      console.log('   enabled:', typeof wallet.enabled === 'boolean' ? '✅' : '❌');
      console.log('   priority:', typeof wallet.priority === 'number' ? '✅' : '❌');
      console.log('   balance:', wallet.balance ? '✅' : '❌');
      if (wallet.balance) {
        console.log('     - trx:', typeof wallet.balance.trx === 'number' ? '✅' : '❌');
        console.log('     - usdt:', typeof wallet.balance.usdt === 'number' ? '✅' : '❌');
      }
      console.log('   resources:', wallet.resources ? '✅' : '❌');
      if (wallet.resources) {
        console.log('     - energy:', wallet.resources.energy ? '✅' : '❌');
        console.log('     - bandwidth:', wallet.resources.bandwidth ? '✅' : '❌');
      }
      console.log('   stats:', wallet.stats ? '✅' : '❌');
      if (wallet.stats) {
        console.log('     - totalTransactions:', typeof wallet.stats.totalTransactions === 'number' ? '✅' : '❌');
      }
      console.log('   health:', wallet.health ? '✅' : '❌');
      if (wallet.health) {
        console.log('     - status:', wallet.health.status ? '✅' : '❌');
      }
      console.log('   status:', wallet.status ? '✅' : '❌');
      console.log('   usageCount:', typeof wallet.usageCount === 'number' ? '✅' : '❌');
      console.log('   alerts:', wallet.alerts ? '✅' : '❌');
      console.log('\n完整数据:');
      console.log(JSON.stringify(wallet, null, 2));

      // 测试获取钱包详情
      console.log('\n3. 获取钱包详情...');
      const detailRes = await axios.get(`http://localhost:3000/api/wallets/${wallet._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ 钱包详情获取成功');
      console.log('\n详情数据结构:');
      const detail = detailRes.data.wallet;
      console.log('   _id:', detail._id ? '✅' : '❌');
      console.log('   id:', detail.id ? '✅' : '❌');
      console.log('   balance:', detail.balance ? '✅' : '❌');
      console.log('   resources:', detail.resources ? '✅' : '❌');
      console.log('   stats:', detail.stats ? '✅' : '❌');
      console.log('   health:', detail.health ? '✅' : '❌');
      console.log('   status:', detail.status ? '✅' : '❌');
      console.log('   alerts:', detail.alerts ? '✅' : '❌');
    } else {
      console.log('⚠️  没有钱包数据');
    }

    console.log('\n✅ 所有测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testWalletApi();
