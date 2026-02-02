require('dotenv').config();
const mongoose = require('mongoose');
const Ad = require('../models/Ad');

const testAds = [
  // 工作台顶部 - 一句话广告
  {
    title: '欢迎使用',
    type: 'text',
    content: '🎉 欢迎使用 USDT/TRX 代付平台 | 新用户首单免手续费 | 7x24小时在线服务',
    height: 50,
    position: 'workspace-top',
    order: 1,
    isActive: true
  },
  // 工作台中部 - 3x3
  {
    title: '安全保障',
    type: 'text',
    content: '🔒 采用多重加密技术，保障您的资金安全',
    height: 120,
    position: 'workspace-middle',
    order: 1,
    isActive: true
  },
  {
    title: '实时汇率',
    type: 'text',
    content: '📊 实时更新汇率，透明公开，无隐藏费用',
    height: 120,
    position: 'workspace-middle',
    order: 2,
    isActive: true
  },
  {
    title: '客服支持',
    type: 'text',
    content: '💬 专业客服团队，随时为您解答疑问',
    height: 120,
    position: 'workspace-middle',
    order: 3,
    isActive: true
  },
  {
    title: '快速到账',
    type: 'text',
    content: '⚡ 平均5分钟到账，最快2分钟完成转账',
    height: 120,
    position: 'workspace-middle',
    order: 4,
    isActive: true
  },
  {
    title: '多币种支持',
    type: 'text',
    content: '🪙 支持 USDT、TRX 等多种主流数字货币',
    height: 120,
    position: 'workspace-middle',
    order: 5,
    isActive: true
  },
  {
    title: '推荐有礼',
    type: 'text',
    content: '🎁 推荐好友使用，双方均可获得手续费优惠',
    height: 120,
    position: 'workspace-middle',
    order: 6,
    isActive: true
  },
  // 工作台底部 - 3x3
  {
    title: '优惠活动',
    type: 'text',
    content: '💰 新用户首单免手续费，立即体验零成本转账服务',
    height: 120,
    position: 'workspace-bottom',
    order: 1,
    isActive: true
  },
  {
    title: '7x24服务',
    type: 'text',
    content: '⏰ 全天候在线服务，2-10分钟快速到账，安全可靠',
    height: 120,
    position: 'workspace-bottom',
    order: 2,
    isActive: true
  },
  {
    title: '链上验证',
    type: 'text',
    content: '✅ 所有交易可在区块链浏览器查询，公开透明',
    height: 120,
    position: 'workspace-bottom',
    order: 3,
    isActive: true
  },
  // 主页底部 - 3x3
  {
    title: '合作伙伴1',
    type: 'text',
    content: '🤝 与多家知名企业建立战略合作关系',
    height: 150,
    position: 'home-bottom',
    order: 1,
    isActive: true
  },
  {
    title: '合作伙伴2',
    type: 'text',
    content: '🌐 服务覆盖全球100+国家和地区',
    height: 150,
    position: 'home-bottom',
    order: 2,
    isActive: true
  },
  {
    title: '合作伙伴3',
    type: 'text',
    content: '🏆 荣获2024年度最佳数字货币服务平台',
    height: 150,
    position: 'home-bottom',
    order: 3,
    isActive: true
  }
];

async function addTestAds() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('数据库连接成功');

    // 清除所有现有广告
    await Ad.deleteMany({});
    console.log('已清除现有广告');

    // 添加测试广告
    const ads = await Ad.insertMany(testAds);
    console.log(`成功添加 ${ads.length} 条广告`);

    mongoose.connection.close();
  } catch (error) {
    console.error('错误:', error);
    process.exit(1);
  }
}

addTestAds();
