const axios = require('axios');

async function testCoinGeckoAPI() {
  try {
    console.log('🔄 测试CoinGecko API...');
    
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids: 'tether,tron',
        vs_currencies: 'cny'
      },
      timeout: 10000
    });

    console.log('✅ API响应:', JSON.stringify(response.data, null, 2));
    
    const usdtRate = response.data.tether?.cny;
    const trxRate = response.data.tron?.cny;

    console.log('\n当前汇率:');
    console.log(`USDT: ${usdtRate} CNY`);
    console.log(`TRX: ${trxRate} CNY`);
    
    // 测试加成
    const markup = 10;
    console.log(`\n加成 ${markup}% 后:`);
    console.log(`USDT: ${(usdtRate * (1 + markup / 100)).toFixed(4)} CNY`);
    console.log(`TRX: ${(trxRate * (1 + markup / 100)).toFixed(4)} CNY`);
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testCoinGeckoAPI();
