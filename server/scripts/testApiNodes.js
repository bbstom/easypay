const mongoose = require('mongoose');
const Settings = require('../models/Settings');
const TronWeb = require('tronweb');
const { decryptPrivateKey, getMasterKey } = require('../utils/encryption');
require('dotenv').config();

async function testNode(node, privateKey) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`测试节点: ${node.name}`);
  console.log(`URL: ${node.url}`);
  console.log(`API Key: ${node.apiKey ? node.apiKey.slice(0, 10) + '...' : '(未配置)'}`);
  console.log(`状态: ${node.enabled ? '✓ 启用' : '✗ 禁用'}`);
  console.log('='.repeat(60));

  if (!node.enabled) {
    console.log('⚠️  节点未启用，跳过测试\n');
    return { success: false, reason: '未启用' };
  }

  if (!node.url) {
    console.log('⚠️  节点 URL 未配置，跳过测试\n');
    return { success: false, reason: 'URL 未配置' };
  }

  try {
    // 创建 TronWeb 实例
    const tronWebConfig = {
      fullHost: node.url,
      privateKey: privateKey
    };

    if (node.apiKey) {
      tronWebConfig.headers = {
        'TRON-PRO-API-KEY': node.apiKey
      };
    }

    console.log('🔗 创建 TronWeb 实例...');
    const tronWeb = new TronWeb.TronWeb(tronWebConfig);
    const address = tronWeb.defaultAddress.base58;
    console.log(`✅ 钱包地址: ${address}`);

    // 测试 1: 获取余额
    console.log('\n📊 测试 1: 获取 TRX 余额');
    const startTime1 = Date.now();
    const balance = await tronWeb.trx.getBalance(address);
    const time1 = Date.now() - startTime1;
    console.log(`✅ 成功 - 余额: ${(balance / 1000000).toFixed(6)} TRX (${time1}ms)`);

    // 测试 2: 获取账户资源
    console.log('\n📊 测试 2: 获取账户资源');
    const startTime2 = Date.now();
    const resources = await tronWeb.trx.getAccountResources(address);
    const time2 = Date.now() - startTime2;
    const energyLimit = resources.EnergyLimit || 0;
    const energyUsed = resources.EnergyUsed || 0;
    console.log(`✅ 成功 - 能量: ${energyLimit - energyUsed}/${energyLimit} (${time2}ms)`);

    // 测试 3: 获取 USDT 余额
    console.log('\n📊 测试 3: 获取 USDT 余额');
    const startTime3 = Date.now();
    const usdtContract = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
    const contract = await tronWeb.contract().at(usdtContract);
    const usdtBalance = await contract.balanceOf(address).call();
    const time3 = Date.now() - startTime3;
    
    let usdtValue;
    if (typeof usdtBalance === 'object' && usdtBalance.toNumber) {
      usdtValue = usdtBalance.toNumber();
    } else if (typeof usdtBalance === 'object' && usdtBalance.toString) {
      usdtValue = parseInt(usdtBalance.toString());
    } else {
      usdtValue = parseInt(usdtBalance);
    }
    
    console.log(`✅ 成功 - 余额: ${(usdtValue / 1000000).toFixed(6)} USDT (${time3}ms)`);

    // 测试 4: 获取最新区块
    console.log('\n📊 测试 4: 获取最新区块');
    const startTime4 = Date.now();
    const block = await tronWeb.trx.getCurrentBlock();
    const time4 = Date.now() - startTime4;
    console.log(`✅ 成功 - 区块高度: ${block.block_header.raw_data.number} (${time4}ms)`);

    // 总结
    const avgTime = Math.round((time1 + time2 + time3 + time4) / 4);
    console.log('\n' + '='.repeat(60));
    console.log(`✅ 节点测试通过`);
    console.log(`   平均响应时间: ${avgTime}ms`);
    console.log(`   所有功能正常`);
    console.log('='.repeat(60) + '\n');

    return { 
      success: true, 
      avgTime,
      balance: balance / 1000000,
      usdtBalance: usdtValue / 1000000,
      energy: energyLimit - energyUsed,
      blockHeight: block.block_header.raw_data.number
    };

  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.log(`❌ 节点测试失败`);
    console.log(`   错误: ${error.message}`);
    if (error.response) {
      console.log(`   状态码: ${error.response.status}`);
      console.log(`   响应: ${JSON.stringify(error.response.data)}`);
    }
    console.log('='.repeat(60) + '\n');

    return { success: false, reason: error.message };
  }
}

async function testAllNodes() {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/easypay');
    console.log('✅ 数据库连接成功\n');

    // 获取配置
    const settings = await Settings.findOne();
    if (!settings) {
      console.log('❌ 未找到配置');
      process.exit(1);
    }

    if (!settings.tronPrivateKeyEncrypted) {
      console.log('❌ 未配置钱包私钥');
      process.exit(1);
    }

    // 解密私钥
    const masterKey = getMasterKey();
    const privateKey = decryptPrivateKey(settings.tronPrivateKeyEncrypted, masterKey);

    // 解析节点配置
    let nodes;
    try {
      nodes = JSON.parse(settings.tronApiNodes);
    } catch (e) {
      console.log('❌ 解析节点配置失败');
      process.exit(1);
    }

    console.log('📋 开始测试所有节点...\n');

    // 测试每个节点
    const results = [];
    for (const node of nodes) {
      const result = await testNode(node, privateKey);
      results.push({ node: node.name, ...result });
    }

    // 总结报告
    console.log('\n' + '='.repeat(60));
    console.log('📊 测试总结');
    console.log('='.repeat(60));

    const successNodes = results.filter(r => r.success);
    const failedNodes = results.filter(r => !r.success);

    console.log(`\n✅ 成功: ${successNodes.length}/${results.length} 个节点`);
    successNodes.forEach(r => {
      console.log(`   • ${r.node}: ${r.avgTime}ms`);
    });

    if (failedNodes.length > 0) {
      console.log(`\n❌ 失败: ${failedNodes.length}/${results.length} 个节点`);
      failedNodes.forEach(r => {
        console.log(`   • ${r.node}: ${r.reason}`);
      });
    }

    // 推荐
    if (successNodes.length > 0) {
      const fastest = successNodes.sort((a, b) => a.avgTime - b.avgTime)[0];
      console.log(`\n💡 推荐使用: ${fastest.node} (响应时间: ${fastest.avgTime}ms)`);
    } else {
      console.log(`\n⚠️  所有节点都不可用，请检查配置`);
    }

    console.log('\n' + '='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testAllNodes();
