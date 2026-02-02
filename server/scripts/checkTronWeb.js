// 检查 TronWeb 的导出方式
const TronWeb = require('tronweb');

console.log('🔍 检查 TronWeb 导出方式\n');
console.log('typeof TronWeb:', typeof TronWeb);
console.log('TronWeb.constructor.name:', TronWeb.constructor.name);
console.log('');

console.log('TronWeb 的属性:');
console.log('- TronWeb.default:', typeof TronWeb.default);
console.log('- TronWeb.TronWeb:', typeof TronWeb.TronWeb);
console.log('');

console.log('TronWeb 对象的键:');
console.log(Object.keys(TronWeb).slice(0, 20));
console.log('');

// 尝试不同的方式
console.log('尝试不同的导入方式:\n');

// 方式 1: 直接使用
try {
  const test1 = new TronWeb({
    fullHost: 'https://api.trongrid.io',
    privateKey: '24ce1bf78867c94e7213a33c158c96268528373c90bb09d60895da4e53ae4431'
  });
  console.log('✅ 方式 1 成功: new TronWeb()');
  console.log('   地址:', test1.defaultAddress.base58);
} catch (e) {
  console.log('❌ 方式 1 失败:', e.message);
}

// 方式 2: 使用 .default
try {
  const test2 = new TronWeb.default({
    fullHost: 'https://api.trongrid.io',
    privateKey: '24ce1bf78867c94e7213a33c158c96268528373c90bb09d60895da4e53ae4431'
  });
  console.log('✅ 方式 2 成功: new TronWeb.default()');
  console.log('   地址:', test2.defaultAddress.base58);
} catch (e) {
  console.log('❌ 方式 2 失败:', e.message);
}

// 方式 3: 使用 .TronWeb
try {
  const test3 = new TronWeb.TronWeb({
    fullHost: 'https://api.trongrid.io',
    privateKey: '24ce1bf78867c94e7213a33c158c96268528373c90bb09d60895da4e53ae4431'
  });
  console.log('✅ 方式 3 成功: new TronWeb.TronWeb()');
  console.log('   地址:', test3.defaultAddress.base58);
} catch (e) {
  console.log('❌ 方式 3 失败:', e.message);
}

// 方式 4: 兼容方式
try {
  const TronWebConstructor = TronWeb.default || TronWeb.TronWeb || TronWeb;
  const test4 = new TronWebConstructor({
    fullHost: 'https://api.trongrid.io',
    privateKey: '24ce1bf78867c94e7213a33c158c96268528373c90bb09d60895da4e53ae4431'
  });
  console.log('✅ 方式 4 成功: 兼容方式');
  console.log('   地址:', test4.defaultAddress.base58);
} catch (e) {
  console.log('❌ 方式 4 失败:', e.message);
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('检查完成');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
