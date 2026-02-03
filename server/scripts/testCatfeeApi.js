#!/usr/bin/env node

/**
 * CatFee API 测试脚本
 * 用于测试 CatFee API 的连接和功能
 */

require('dotenv').config();
const mongoose = require('mongoose');
const catfeeService = require('../services/catfeeService');
const Settings = require('../models/Settings');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logSection(title) {
  console.log('');
  log('='.repeat(60), 'blue');
  log(`  ${title}`, 'bright');
  log('='.repeat(60), 'blue');
  console.log('');
}

async function testCatfeeApi() {
  try {
    // 连接数据库
    logSection('连接数据库');
    await mongoose.connect(process.env.MONGODB_URI);
    logSuccess('数据库连接成功');

    // 获取配置
    logSection('读取配置');
    const settings = await Settings.findOne();
    
    if (!settings) {
      logError('未找到系统配置');
      process.exit(1);
    }

    const apiUrl = settings.catfeeApiUrl || 'https://api.catfee.io';
    const apiKey = settings.catfeeApiKey;

    logInfo(`API URL: ${apiUrl}`);
    
    if (!apiKey) {
      logError('未配置 CatFee API Key');
      logWarning('请在后台配置 CatFee API Key');
      logInfo('提示：如果只有一个 Key，请在后台输入格式为 "key:secret" 或单独配置');
      process.exit(1);
    }

    // 检查 API Key 格式（兼容两种格式）
    let key, secret;
    if (apiKey.includes(':')) {
      // 格式: key:secret
      [key, secret] = apiKey.split(':');
      logSuccess(`API Key: ${key.substring(0, 8)}...`);
      logSuccess(`API Secret: ${secret.substring(0, 8)}...`);
    } else {
      // 只有一个值，可能是 Key 或者配置错误
      logWarning('API Key 格式提示：');
      logInfo('当前值看起来只有一个 Key，没有 Secret');
      logInfo('CatFee 需要 API Key 和 API Secret 两个值');
      logInfo('请在 CatFee 后台获取完整的 API Key 和 Secret');
      logInfo('');
      logInfo('配置方法：');
      logInfo('1. 在后台输入格式: api_key:api_secret');
      logInfo('2. 或者修改数据库，分别保存 Key 和 Secret');
      logInfo('');
      logError('无法继续测试，请检查配置');
      process.exit(1);
    }

    // 设置 CatFee 服务
    catfeeService.setApiUrl(apiUrl);
    catfeeService.setApiKey(apiKey);

    // 测试 1: 获取账户余额
    logSection('测试 1: 获取账户余额');
    try {
      const balanceResult = await catfeeService.getBalance();
      if (balanceResult.success) {
        logSuccess('账户余额查询成功');
        logInfo(`余额: ${balanceResult.balance} ${balanceResult.currency}`);
        console.log('完整响应:', JSON.stringify(balanceResult.rawData, null, 2));
      } else {
        logWarning('账户余额查询失败（可能测试环境不支持此接口）');
        logInfo(`错误: ${balanceResult.error}`);
      }
    } catch (error) {
      logWarning('账户余额查询失败（可能测试环境不支持此接口）');
      logInfo(`错误: ${error.message}`);
    }

    // 测试 2: 获取能量价格
    logSection('测试 2: 获取能量价格');
    const testEnergyAmount = 65000;
    const testDuration = '1h';
    
    try {
      const priceResult = await catfeeService.getPrice(testEnergyAmount, testDuration);
      if (priceResult.success) {
        logSuccess('能量价格查询成功');
        logInfo(`能量数量: ${priceResult.energyAmount}`);
        logInfo(`租赁时长: ${priceResult.duration}`);
        logInfo(`价格: ${priceResult.price} TRX`);
        console.log('完整响应:', JSON.stringify(priceResult.rawData, null, 2));
      } else {
        logWarning('能量价格查询失败（可能测试环境不支持此接口）');
        logInfo(`错误: ${priceResult.error}`);
      }
    } catch (error) {
      logWarning('能量价格查询失败（可能测试环境不支持此接口）');
      logInfo(`错误: ${error.message}`);
    }

    // 测试 3: 购买能量（可选，需要用户确认）
    logSection('测试 3: 购买能量（需要确认）');
    logWarning('此操作会实际购买能量并消耗余额');
    
    // 从命令行参数获取测试地址
    const testAddress = process.argv[2];
    
    if (testAddress) {
      logInfo(`测试地址: ${testAddress}`);
      logInfo(`能量数量: ${testEnergyAmount}`);
      logInfo(`租赁时长: ${testDuration}`);
      
      // 询问用户是否继续
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      readline.question('\n是否继续购买能量？(yes/no): ', async (answer) => {
        if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
          try {
            const buyResult = await catfeeService.buyEnergy(testAddress, testEnergyAmount, testDuration);
            logSuccess('能量购买成功！');
            logInfo(`订单号: ${buyResult.orderNo}`);
            logInfo(`能量数量: ${buyResult.energyAmount}`);
            logInfo(`接收地址: ${buyResult.receiverAddress}`);
            logInfo(`消耗金额: ${(buyResult.payAmount / 1000000).toFixed(3)} TRX`);
            logInfo(`账户余额: ${(buyResult.balance / 1000000).toFixed(3)} TRX`);
            console.log('完整响应:', JSON.stringify(buyResult.rawData, null, 2));

            // 查询订单状态
            if (buyResult.orderNo) {
              logSection('查询订单状态');
              await new Promise(resolve => setTimeout(resolve, 2000)); // 等待2秒
              
              try {
                const orderResult = await catfeeService.queryOrder(buyResult.orderNo);
                logSuccess('订单状态查询成功');
                logInfo(`订单状态: ${orderResult.status}`);
                console.log('完整响应:', JSON.stringify(orderResult.rawData, null, 2));
              } catch (error) {
                logError(`订单状态查询失败: ${error.message}`);
              }
            }
          } catch (error) {
            logError(`能量购买失败: ${error.message}`);
            if (error.response) {
              console.log('错误详情:', JSON.stringify(error.response.data, null, 2));
            }
          }
        } else {
          logInfo('已取消购买能量测试');
        }
        
        readline.close();
        await mongoose.connection.close();
        logSuccess('\n测试完成');
      });
    } else {
      logInfo('跳过购买能量测试（未提供测试地址）');
      logInfo('如需测试购买，请运行: node server/scripts/testCatfeeApi.js <TRON地址>');
      await mongoose.connection.close();
      logSuccess('\n测试完成');
    }

  } catch (error) {
    logError(`测试失败: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// 显示使用说明
function showUsage() {
  logSection('CatFee API 测试脚本');
  console.log('用法:');
  console.log('  node server/scripts/testCatfeeApi.js              # 测试余额和价格查询');
  console.log('  node server/scripts/testCatfeeApi.js <地址>       # 测试购买能量（需确认）');
  console.log('');
  console.log('示例:');
  console.log('  node server/scripts/testCatfeeApi.js');
  console.log('  node server/scripts/testCatfeeApi.js TYour...Address');
  console.log('');
}

// 主函数
if (require.main === module) {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    showUsage();
    process.exit(0);
  }
  
  testCatfeeApi().catch(error => {
    logError(`未捕获的错误: ${error.message}`);
    console.error(error);
    process.exit(1);
  });
}

module.exports = testCatfeeApi;
