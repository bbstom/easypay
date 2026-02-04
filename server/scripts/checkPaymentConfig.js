require('dotenv').config();
const mongoose = require('mongoose');
const Settings = require('../models/Settings');

async function checkPaymentConfig() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/easypay';
    await mongoose.connect(mongoUri);
    console.log('✅ 数据库连接成功\n');

    const settings = await Settings.findOne();
    
    if (!settings) {
      console.log('❌ 未找到设置记录');
      process.exit(1);
    }

    console.log('=== 支付配置检查 ===\n');
    
    console.log('API版本:', settings.paymentApiVersion || 'v1');
    console.log('API地址:', settings.paymentApiUrl || '(未配置)');
    console.log('商户ID:', settings.paymentMerchantId || '(未配置)');
    console.log('MD5密钥:', settings.paymentApiKey ? '已配置 (长度: ' + settings.paymentApiKey.length + ')' : '(未配置)');
    console.log('回调地址:', settings.paymentNotifyUrl || '(未配置)');
    console.log('支付宝:', settings.paymentAlipayEnabled ? '✅ 已启用' : '❌ 已禁用');
    console.log('微信支付:', settings.paymentWechatEnabled ? '✅ 已启用' : '❌ 已禁用');

    console.log('\n=== 配置状态 ===\n');
    
    const issues = [];
    
    if (!settings.paymentApiUrl) {
      issues.push('❌ API地址未配置');
    }
    
    if (!settings.paymentMerchantId) {
      issues.push('❌ 商户ID未配置');
    }
    
    if (!settings.paymentApiKey) {
      issues.push('❌ MD5密钥未配置');
    }
    
    if (!settings.paymentAlipayEnabled && !settings.paymentWechatEnabled) {
      issues.push('⚠️  所有支付方式都已禁用');
    }

    if (issues.length > 0) {
      console.log('发现问题:');
      issues.forEach(issue => console.log('  ' + issue));
      console.log('\n请登录管理后台配置支付参数：');
      console.log('管理后台 → 设置 → 支付配置');
    } else {
      console.log('✅ 支付配置完整');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

checkPaymentConfig();
