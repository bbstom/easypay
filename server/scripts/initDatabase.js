// 数据库初始化脚本
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const User = require('../models/User');
const Settings = require('../models/Settings');
const Wallet = require('../models/Wallet');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function initDatabase() {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 数据库初始化脚本');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 连接数据库
    console.log('📡 连接数据库...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 数据库连接成功\n');

    // 1. 检查是否已初始化
    const existingSettings = await Settings.findOne();
    const existingAdmin = await User.findOne({ role: 'admin' });

    if (existingSettings && existingAdmin) {
      console.log('⚠️  数据库已经初始化过了！');
      console.log('\n现有配置：');
      console.log('  管理员账号:', existingAdmin.username);
      console.log('  系统配置:', existingSettings.siteName);
      console.log('  钱包数量:', await Wallet.countDocuments());
      
      const confirm = await question('\n是否要重新初始化？这将清空所有数据！(yes/no): ');
      if (confirm.toLowerCase() !== 'yes') {
        console.log('\n❌ 已取消初始化');
        rl.close();
        await mongoose.disconnect();
        process.exit(0);
      }
      
      // 清空数据
      console.log('\n🗑️  清空现有数据...');
      await User.deleteMany({});
      await Settings.deleteMany({});
      await Wallet.deleteMany({});
      console.log('✅ 数据已清空\n');
    }

    // 2. 创建管理员账号
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 创建管理员账号');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const username = await question('管理员用户名 (默认: admin): ') || 'admin';
    const email = await question('管理员邮箱 (默认: admin@example.com): ') || 'admin@example.com';
    let password = await question('管理员密码 (默认: admin123): ') || 'admin123';

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'admin'
    });

    console.log('\n✅ 管理员账号创建成功');
    console.log('   用户名:', username);
    console.log('   邮箱:', email);
    console.log('   密码:', password);
    console.log('   ⚠️  请妥善保管管理员密码！\n');

    // 3. 创建系统配置
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚙️  创建系统配置');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const siteName = await question('网站名称 (默认: 可可代付): ') || '可可代付';

    const settings = await Settings.create({
      siteName: siteName,
      siteLogo: '',
      siteDescription: '安全快捷的数字货币代付平台',
      
      // 服务费配置
      feeType: 'fixed',
      feeUSDT: 5,
      feeTRX: 2,
      feePercentage: 1,
      
      // 汇率配置
      exchangeRateMode: 'manual',
      exchangeRateUSDT: 7.35,
      exchangeRateTRX: 1.08,
      exchangeRateMarkup: 0,
      
      // 支付平台配置（需要后续在管理后台配置）
      paymentApiUrl: 'https://pay.abcdely.top',
      paymentApiVersion: 'v1',
      paymentMerchantId: '',
      paymentApiKey: '',
      paymentNotifyUrl: '',
      paymentAlipayEnabled: false,
      paymentWechatEnabled: true,
      
      // TRON API 节点配置
      tronApiNodes: JSON.stringify([
        { name: 'TronGrid', url: 'https://api.trongrid.io', apiKey: '', enabled: true }
      ]),
      
      // 能量租赁配置（默认禁用）
      energyRentalEnabled: false,
      energyRentalMode: 'transfer',
      energyRentalAddress: '',
      energyRentalAmountFirst: 6,
      energyRentalAmountNormal: 3,
      energyRentalWaitTime: 30,
      
      // CatFee 配置
      catfeeApiUrl: 'https://api.catfee.io',
      catfeeApiKey: '',
      catfeeEnergyFirst: 131000,
      catfeeEnergyNormal: 65000,
      catfeePeriod: 1,
      
      // 邮件配置（需要后续在管理后台配置）
      smtpHost: '',
      smtpPort: 465,
      smtpSecure: true,
      smtpUser: '',
      smtpPass: '',
      smtpFromName: siteName,
      smtpFromEmail: '',
      
      // 闪兑配置
      swapEnabled: true,
      swapRateMode: 'realtime',
      swapRateUSDTtoTRX: 3.4,
      swapRateMarkup: 2,
      swapMinAmount: 10,
      swapMaxAmount: 10000,
      swapOrderTimeout: 30,
      swapWallets: JSON.stringify([]),
      
      // 系统运行时间
      systemStartTime: new Date()
    });

    console.log('✅ 系统配置创建成功');
    console.log('   网站名称:', siteName);
    console.log('   USDT 汇率:', settings.exchangeRateUSDT, 'CNY');
    console.log('   TRX 汇率:', settings.exchangeRateTRX, 'CNY');
    console.log('   服务费 (USDT):', settings.feeUSDT, 'CNY');
    console.log('   服务费 (TRX):', settings.feeTRX, 'CNY\n');

    // 4. 提示后续配置
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 后续配置步骤');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✅ 数据库初始化完成！\n');
    console.log('请登录管理后台完成以下配置：\n');
    console.log('1. 支付平台配置');
    console.log('   - 商户ID');
    console.log('   - API密钥');
    console.log('   - 回调地址\n');
    
    console.log('2. 钱包配置（代付系统）');
    console.log('   - 添加代付钱包');
    console.log('   - 配置钱包私钥');
    console.log('   - 设置钱包优先级\n');
    
    console.log('3. 能量租赁配置（可选）');
    console.log('   - 启用能量租赁');
    console.log('   - 配置 CatFee API Key');
    console.log('   - 或配置转账租赁地址\n');
    
    console.log('4. 邮件配置（可选）');
    console.log('   - SMTP 服务器');
    console.log('   - 邮箱账号密码\n');
    
    console.log('5. 闪兑钱包配置（可选）');
    console.log('   - 添加闪兑专用钱包\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 初始化完成！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('管理后台地址: http://your-domain.com/login');
    console.log('管理员账号:', username);
    console.log('管理员密码:', password);
    console.log('\n⚠️  请立即登录并修改默认密码！\n');

  } catch (error) {
    console.error('\n❌ 初始化失败:', error);
    console.error(error);
  } finally {
    rl.close();
    await mongoose.disconnect();
    console.log('👋 数据库连接已关闭');
    process.exit(0);
  }
}

// 运行初始化
initDatabase();
