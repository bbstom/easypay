const mongoose = require('mongoose');
const Settings = require('../models/Settings');
require('dotenv').config();

async function resetApiNodes() {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/easypay');
    console.log('✅ 数据库连接成功\n');

    // 获取当前配置
    const settings = await Settings.findOne();
    if (!settings) {
      console.log('❌ 未找到配置');
      process.exit(1);
    }

    console.log('📋 当前节点配置:');
    try {
      const currentNodes = JSON.parse(settings.tronApiNodes);
      currentNodes.forEach((node, index) => {
        console.log(`   ${index + 1}. ${node.name}: ${node.url || '(未配置)'} - ${node.enabled ? '✓ 启用' : '✗ 禁用'}`);
      });
    } catch (e) {
      console.log('   解析失败');
    }

    console.log('\n🔄 重置为默认配置（所有节点禁用）...');

    // 重置节点配置
    settings.tronApiNodes = JSON.stringify([
      { name: 'TronGrid', url: 'https://api.trongrid.io', apiKey: '', enabled: false },
      { name: 'ZAN', url: '', apiKey: '', enabled: false }
    ]);

    settings.updatedAt = new Date();
    await settings.save();

    console.log('✅ 节点配置已重置\n');

    console.log('📋 新的节点配置:');
    const newNodes = JSON.parse(settings.tronApiNodes);
    newNodes.forEach((node, index) => {
      console.log(`   ${index + 1}. ${node.name}: ${node.url || '(未配置)'} - ${node.enabled ? '✓ 启用' : '✗ 禁用'}`);
    });

    console.log('\n💡 提示:');
    console.log('   1. 请在管理后台重新配置 API 节点');
    console.log('   2. 至少启用一个节点');
    console.log('   3. 建议配置 API Key 以提升请求限制\n');

  } catch (error) {
    console.error('❌ 重置失败:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

resetApiNodes();
