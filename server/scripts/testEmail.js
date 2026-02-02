require('dotenv').config();
const mongoose = require('mongoose');
const Settings = require('../models/Settings');
const emailService = require('../services/emailService');

// 测试邮件发送功能
async function testEmail() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ 已连接到数据库');

    // 获取设置
    const settings = await Settings.findOne();
    if (!settings) {
      console.log('✗ 未找到系统设置');
      process.exit(1);
    }

    console.log('\n当前SMTP配置:');
    console.log('- SMTP服务器:', settings.smtpHost || '未配置');
    console.log('- SMTP端口:', settings.smtpPort || '未配置');
    console.log('- SMTP用户:', settings.smtpUser || '未配置');
    console.log('- 发件人名称:', settings.smtpFromName || '未配置');
    console.log('- 发件人邮箱:', settings.smtpFromEmail || '未配置');

    if (!settings.smtpHost || !settings.smtpUser) {
      console.log('\n✗ SMTP配置不完整，请先在后台配置SMTP信息');
      process.exit(1);
    }

    // 创建测试订单数据
    const testPayment = {
      email: process.argv[2] || 'test@example.com',
      platformOrderId: 'TEST' + Date.now(),
      payType: 'USDT',
      amount: 100,
      address: 'TTestAddressForEmailTest123456789',
      txHash: '0x' + 'a'.repeat(64),
      transferTime: new Date()
    };

    console.log('\n发送测试邮件到:', testPayment.email);
    console.log('订单号:', testPayment.platformOrderId);

    const result = await emailService.sendOrderCompletedEmail(testPayment, settings);
    
    if (result.success) {
      console.log('\n✓ 邮件发送成功！');
      console.log('请检查收件箱:', testPayment.email);
    } else {
      console.log('\n✗ 邮件发送失败:', result.message);
    }

    process.exit(0);
  } catch (error) {
    console.error('\n✗ 测试失败:', error.message);
    process.exit(1);
  }
}

testEmail();
