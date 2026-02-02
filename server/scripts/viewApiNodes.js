const mongoose = require('mongoose');
const Settings = require('../models/Settings');
require('dotenv').config();

async function viewApiNodes() {
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

    console.log('📋 数据库中的 API 节点配置:\n');
    console.log('原始数据 (JSON 字符串):');
    console.log(settings.tronApiNodes);
    console.log('\n');

    // 解析并显示
    try {
      const nodes = JSON.parse(settings.tronApiNodes);
      console.log('解析后的配置:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      nodes.forEach((node, index) => {
        console.log(`\n节点 ${index + 1}: ${node.name}`);
        console.log(`   URL: ${node.url || '(未配置)'}`);
        console.log(`   API Key: ${node.apiKey ? node.apiKey.slice(0, 10) + '...' : '(未配置)'}`);
        console.log(`   状态: ${node.enabled ? '✓ 启用' : '✗ 禁用'}`);
      });
      
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // 统计
      const enabledCount = nodes.filter(n => n.enabled).length;
      const configuredCount = nodes.filter(n => n.url).length;
      
      console.log(`\n📊 统计信息:`);
      console.log(`   总节点数: ${nodes.length}`);
      console.log(`   已配置: ${configuredCount}`);
      console.log(`   已启用: ${enabledCount}`);
      
      if (enabledCount === 0) {
        console.log('\n⚠️  警告: 没有启用的节点，系统无法正常工作！');
      }
      
    } catch (e) {
      console.log('❌ 解析 JSON 失败:', e.message);
    }

    console.log('\n');

  } catch (error) {
    console.error('❌ 查询失败:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

viewApiNodes();
