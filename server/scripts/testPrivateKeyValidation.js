/**
 * 测试私钥验证
 * 用于测试不同格式的私钥是否能正确验证
 */

const TronWeb = require('tronweb');

function validatePrivateKey(privateKey) {
  console.log('\n=== 测试私钥验证 ===');
  console.log(`原始输入: "${privateKey}"`);
  console.log(`长度: ${privateKey.length}`);
  
  try {
    // 清理私钥
    let cleanPrivateKey = privateKey.trim();
    console.log(`清理空格后: "${cleanPrivateKey}"`);
    console.log(`长度: ${cleanPrivateKey.length}`);
    
    // 移除 0x 前缀
    if (cleanPrivateKey.startsWith('0x') || cleanPrivateKey.startsWith('0X')) {
      cleanPrivateKey = cleanPrivateKey.slice(2);
      console.log(`移除0x前缀后: "${cleanPrivateKey}"`);
      console.log(`长度: ${cleanPrivateKey.length}`);
    }
    
    // 验证长度
    if (cleanPrivateKey.length !== 64) {
      throw new Error(`私钥长度不正确，应该是64个字符，当前是${cleanPrivateKey.length}个字符`);
    }
    
    // 验证十六进制
    if (!/^[0-9a-fA-F]{64}$/.test(cleanPrivateKey)) {
      throw new Error('私钥格式无效，应该是64位十六进制字符串');
    }
    
    // 使用 TronWeb 验证
    const tronWeb = new TronWeb({ fullHost: 'https://api.trongrid.io' });
    const address = tronWeb.address.fromPrivateKey(cleanPrivateKey);
    
    console.log(`✅ 验证成功！`);
    console.log(`地址: ${address}`);
    console.log(`清理后的私钥: ${cleanPrivateKey}`);
    
    return {
      valid: true,
      address,
      cleanPrivateKey
    };
    
  } catch (error) {
    console.log(`❌ 验证失败: ${error.message}`);
    return {
      valid: false,
      error: error.message
    };
  }
}

// 测试用例
console.log('🚀 开始测试私钥验证...\n');

// 测试1: 标准64位私钥
console.log('\n【测试1】标准64位私钥');
validatePrivateKey('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');

// 测试2: 带0x前缀的私钥
console.log('\n【测试2】带0x前缀的私钥');
validatePrivateKey('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');

// 测试3: 带空格的私钥
console.log('\n【测试3】带空格的私钥');
validatePrivateKey('  1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef  ');

// 测试4: 长度不对的私钥
console.log('\n【测试4】长度不对的私钥（太短）');
validatePrivateKey('1234567890abcdef');

// 测试5: 包含非十六进制字符
console.log('\n【测试5】包含非十六进制字符');
validatePrivateKey('1234567890abcdefGHIJ567890abcdef1234567890abcdef1234567890abcdef');

console.log('\n\n=== 使用说明 ===');
console.log('私钥格式要求：');
console.log('1. 必须是64位十六进制字符串');
console.log('2. 可以带或不带 0x 前缀（系统会自动处理）');
console.log('3. 前后空格会被自动清理');
console.log('4. 只能包含 0-9 和 a-f（不区分大小写）');
console.log('\n正确示例：');
console.log('- 1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
console.log('- 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
console.log('\n如果你的私钥验证失败，请检查：');
console.log('1. 长度是否正确（64个字符，不包括0x）');
console.log('2. 是否包含非法字符（只能是0-9和a-f）');
console.log('3. 是否从钱包正确导出');

console.log('\n✅ 测试完成！');
