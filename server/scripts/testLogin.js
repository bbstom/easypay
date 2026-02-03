#!/usr/bin/env node

/**
 * 测试登录功能
 * 用于验证后端 API 是否正常工作
 */

const axios = require('axios');

// 配置
const BASE_URL = process.env.TEST_URL || 'http://localhost:5000';
const TEST_EMAIL = 'kailsay@gmail.com';
const TEST_PASSWORD = 'specter1234';

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🧪 测试登录功能');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📡 测试地址: ${BASE_URL}`);
console.log(`👤 测试账号: ${TEST_EMAIL}`);
console.log('');

async function testLogin() {
  try {
    // 测试 1: 获取公开设置（不需要认证）
    console.log('测试 1: 获取公开设置...');
    const settingsResponse = await axios.get(`${BASE_URL}/api/settings/public`);
    console.log('✅ 公开设置 API 正常');
    console.log(`   网站名称: ${settingsResponse.data.siteName || '未设置'}`);
    console.log('');

    // 测试 2: 登录
    console.log('测试 2: 登录...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    if (loginResponse.data.token) {
      console.log('✅ 登录成功');
      console.log(`   Token: ${loginResponse.data.token.substring(0, 20)}...`);
      console.log(`   用户名: ${loginResponse.data.user.username}`);
      console.log(`   邮箱: ${loginResponse.data.user.email}`);
      console.log(`   角色: ${loginResponse.data.user.role}`);
      console.log('');

      // 测试 3: 使用 token 获取用户信息
      console.log('测试 3: 获取用户信息...');
      const meResponse = await axios.get(`${BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.token}`
        }
      });
      console.log('✅ 用户信息获取成功');
      console.log(`   用户名: ${meResponse.data.username}`);
      console.log(`   邮箱: ${meResponse.data.email}`);
      console.log(`   角色: ${meResponse.data.role}`);
      console.log('');

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ 所有测试通过！登录功能正常');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } else {
      console.log('❌ 登录失败：未返回 token');
    }

  } catch (error) {
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❌ 测试失败');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (error.response) {
      console.log(`状态码: ${error.response.status}`);
      console.log(`错误信息: ${JSON.stringify(error.response.data, null, 2)}`);
    } else if (error.request) {
      console.log('❌ 无法连接到服务器');
      console.log('请检查：');
      console.log('  1. 后端是否正在运行？(pm2 status)');
      console.log('  2. 端口是否正确？(默认 5000)');
      console.log('  3. 防火墙是否阻止了连接？');
    } else {
      console.log(`错误: ${error.message}`);
    }
    
    console.log('');
    console.log('💡 诊断建议：');
    console.log('  1. 检查后端日志: pm2 logs easypay-backend');
    console.log('  2. 检查数据库连接: 确认 MongoDB 正在运行');
    console.log('  3. 检查 .env 配置: JWT_SECRET, MONGODB_URI');
    console.log('  4. 测试本地连接: node server/scripts/testLogin.js');
    console.log('  5. 测试通过域名: TEST_URL=https://kk.vpno.eu.org node server/scripts/testLogin.js');
    
    process.exit(1);
  }
}

// 运行测试
testLogin();
