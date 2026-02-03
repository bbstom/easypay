#!/usr/bin/env node

/**
 * 显示 CatFee API 配置信息
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Settings = require('../models/Settings');

async function showConfig() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const settings = await Settings.findOne();
    
    console.log('\n=== CatFee API 配置信息 ===\n');
    
    console.log('API URL:', settings.catfeeApiUrl || '未配置');
    console.log('API Key:', settings.catfeeApiKey || '未配置');
    
    if (settings.catfeeApiKey) {
      console.log('\n--- API Key 分析 ---');
      console.log('长度:', settings.catfeeApiKey.length);
      console.log('包含冒号:', settings.catfeeApiKey.includes(':') ? '是' : '否');
      
      if (settings.catfeeApiKey.includes(':')) {
        const [key, secret] = settings.catfeeApiKey.split(':');
        console.log('\n✅ 格式正确！');
        console.log('API Key:', key.substring(0, 8) + '...' + key.substring(key.length - 4));
        console.log('API Secret:', secret.substring(0, 8) + '...' + secret.substring(secret.length - 4));
      } else {
        console.log('\n❌ 格式错误！');
        console.log('当前值:', settings.catfeeApiKey.substring(0, 20) + '...');
        console.log('\n正确格式应该是: api_key:api_secret');
        console.log('示例: 40e7c486-c18e-40d4-9502-35423dcdb70e:a1b2c3d4e5f6g7h8i9j0');
      }
    } else {
      console.log('\n❌ 未配置 API Key');
    }
    
    console.log('\n--- 配置方法 ---');
    console.log('1. 登录 CatFee 后台');
    console.log('   生产环境: https://catfee.io');
    console.log('   测试环境: https://nile.catfee.io');
    console.log('');
    console.log('2. 进入【个人中心】→【API】→【API 配置】');
    console.log('');
    console.log('3. 复制 API Key 和 API Secret');
    console.log('');
    console.log('4. 在系统后台配置，格式为:');
    console.log('   api_key:api_secret');
    console.log('');
    console.log('示例:');
    console.log('   40e7c486-c18e-40d4-9502-35423dcdb70e:a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6');
    console.log('');
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('错误:', error.message);
    process.exit(1);
  }
}

showConfig();
