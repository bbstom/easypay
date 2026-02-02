const TronWeb = require('tronweb');

// 测试私钥
const privateKey = '24ce1bf78867c94e7213a33c158c96268528373c90bb09d60895da4e53ae4431';

console.log('🔍 测试私钥验证\n');
console.log('私钥:', privateKey);
console.log('长度:', privateKey.length);
console.log('格式:', /^[0-9a-fA-F]{64}$/.test(privateKey) ? '✅ 正确' : '❌ 错误');
console.log('');

try {
  console.log('🔄 创建 TronWeb 实例...');
  
  const tronWeb = new TronWeb.TronWeb({
    fullHost: 'https://api.trongrid.io',
    privateKey: privateKey
  });

  console.log('✅ TronWeb 实例创建成功\n');

  // 获取钱包地址
  const walletAddress = tronWeb.defaultAddress.base58;
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📍 钱包地址:', walletAddress);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 测试地址验证
  console.log('🔍 验证地址格式...');
  const isValid = tronWeb.isAddress(walletAddress);
  console.log('地址有效:', isValid ? '✅ 是' : '❌ 否');
  console.log('');

  // 尝试查询余额（需要网络连接）
  console.log('🔄 尝试查询余额（需要网络连接）...');
  tronWeb.trx.getBalance(walletAddress)
    .then(balance => {
      console.log('✅ 网络连接正常');
      console.log('TRX 余额:', balance / 1000000, 'TRX');
      console.log('');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ 私钥验证成功！');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    })
    .catch(error => {
      console.log('⚠️  网络连接失败:', error.message);
      console.log('');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ 私钥格式正确，但无法连接到 TRON 网络');
      console.log('   这可能是网络问题，不影响私钥有效性');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });

} catch (error) {
  console.error('❌ 私钥验证失败:', error.message);
  console.error('');
  console.error('可能的原因:');
  console.error('1. 私钥格式错误');
  console.error('2. TronWeb 库未正确安装');
  console.error('3. 私钥不是有效的 TRON 私钥');
  console.error('');
  console.error('详细错误:', error);
}
