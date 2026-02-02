/**
 * 测试闪兑汇率获取
 * 验证从 Binance 和 CoinGecko 获取的汇率是否正确
 */

const axios = require('axios');

async function testBinanceRate() {
  console.log('\n=== 测试 Binance API ===');
  try {
    const response = await axios.get('https://api.binance.com/api/v3/ticker/price', {
      params: { symbol: 'TRXUSDT' },
      timeout: 10000
    });

    const trxPriceInUsdt = parseFloat(response.data.price); // 1 TRX = X USDT
    const usdtToTrxRate = 1 / trxPriceInUsdt; // 1 USDT = X TRX

    console.log(`✅ Binance API 响应成功`);
    console.log(`   原始数据: ${JSON.stringify(response.data)}`);
    console.log(`   1 TRX = ${trxPriceInUsdt.toFixed(6)} USDT`);
    console.log(`   1 USDT = ${usdtToTrxRate.toFixed(4)} TRX`);
    
    // 验证汇率是否合理（2026年2月市场价格约为 1 USDT = 3.4 TRX）
    if (usdtToTrxRate >= 2.5 && usdtToTrxRate <= 5) {
      console.log(`   ✓ 汇率在合理范围内 (2.5-5 TRX/USDT)`);
    } else {
      console.log(`   ⚠️ 汇率可能异常，请检查`);
    }

    return usdtToTrxRate;

  } catch (error) {
    console.error(`❌ Binance API 失败:`, error.message);
    return null;
  }
}

async function testCoinGeckoRate() {
  console.log('\n=== 测试 CoinGecko API ===');
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids: 'tether,tron',
        vs_currencies: 'usd'
      },
      timeout: 10000
    });

    const usdtPrice = response.data.tether?.usd || 1; // USDT 通常约等于 1 USD
    const trxPriceInUsd = response.data.tron?.usd; // 1 TRX = X USD

    if (!trxPriceInUsd) {
      throw new Error('无法获取TRX价格');
    }

    const usdtToTrxRate = usdtPrice / trxPriceInUsd; // 1 USDT = X TRX

    console.log(`✅ CoinGecko API 响应成功`);
    console.log(`   原始数据: ${JSON.stringify(response.data)}`);
    console.log(`   USDT = ${usdtPrice} USD`);
    console.log(`   1 TRX = ${trxPriceInUsd.toFixed(6)} USD`);
    console.log(`   1 USDT = ${usdtToTrxRate.toFixed(4)} TRX`);

    // 验证汇率是否合理
    if (usdtToTrxRate >= 2.5 && usdtToTrxRate <= 5) {
      console.log(`   ✓ 汇率在合理范围内 (2.5-5 TRX/USDT)`);
    } else {
      console.log(`   ⚠️ 汇率可能异常，请检查`);
    }

    return usdtToTrxRate;

  } catch (error) {
    console.error(`❌ CoinGecko API 失败:`, error.message);
    return null;
  }
}

async function testSwapCalculation() {
  console.log('\n=== 测试闪兑计算 ===');
  
  const binanceRate = await testBinanceRate();
  const coinGeckoRate = await testCoinGeckoRate();

  if (binanceRate && coinGeckoRate) {
    const diff = Math.abs(binanceRate - coinGeckoRate);
    const diffPercent = (diff / binanceRate) * 100;

    console.log('\n=== 汇率对比 ===');
    console.log(`Binance:   1 USDT = ${binanceRate.toFixed(4)} TRX`);
    console.log(`CoinGecko: 1 USDT = ${coinGeckoRate.toFixed(4)} TRX`);
    console.log(`差异: ${diff.toFixed(4)} TRX (${diffPercent.toFixed(2)}%)`);

    if (diffPercent < 5) {
      console.log(`✓ 两个API的汇率差异在合理范围内 (<5%)`);
    } else {
      console.log(`⚠️ 两个API的汇率差异较大，请检查`);
    }
  }

  // 测试加成计算
  console.log('\n=== 测试加成计算 ===');
  const baseRate = binanceRate || 3.4;
  const markup = 2; // 2%
  const finalRate = baseRate * (1 - markup / 100);

  console.log(`基础汇率: 1 USDT = ${baseRate.toFixed(4)} TRX`);
  console.log(`加成: ${markup}%`);
  console.log(`最终汇率: 1 USDT = ${finalRate.toFixed(4)} TRX`);
  console.log(`用户兑换 10 USDT 将得到: ${(10 * finalRate).toFixed(2)} TRX`);
  console.log(`用户兑换 100 USDT 将得到: ${(100 * finalRate).toFixed(2)} TRX`);
}

// 运行测试
console.log('🚀 开始测试闪兑汇率获取...\n');
testSwapCalculation().then(() => {
  console.log('\n✅ 测试完成！');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ 测试失败:', error);
  process.exit(1);
});
