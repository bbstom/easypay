const mongoose = require('mongoose');
const Settings = require('../models/Settings');
require('dotenv').config();

async function fixZanUrl() {
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

    console.log('📋 当前 ZAN 节点配置:');
    const nodes = JSON.parse(settings.tronApiNodes);
    const zanNode = nodes.find(n => n.name === 'ZAN');
    
    if (!zanNode) {
      console.log('❌ 未找到 ZAN 节点');
      process.exit(1);
    }

    console.log(`   URL: ${zanNode.url}`);
    console.log(`   API Key: ${zanNode.apiKey || '(未配置)'}`);
    console.log(`   状态: ${zanNode.enabled ? '✓ 启用' : '✗ 禁用'}`);

    // 检查是否需要修复
    if (zanNode.url && zanNode.url.includes('{') && zanNode.url.includes('}')) {
      console.log('\n🔧 检测到 URL 中包含花括号，正在修复...');
      
      // 提取 API Key
      const match = zanNode.url.match(/\{([^}]+)\}/);
      if (match) {
        const apiKey = match[1];
        const fixedUrl = zanNode.url.replace(/\{[^}]+\}/, apiKey);
        
        console.log(`\n修复前: ${zanNode.url}`);
        console.log(`修复后: ${fixedUrl}`);
        
        // 更新配置
        zanNode.url = fixedUrl;
        settings.tronApiNodes = JSON.stringify(nodes);
        settings.updatedAt = new Date();
        await settings.save();
        
        console.log('\n✅ URL 已修复并保存到数据库');
      } else {
        console.log('\n❌ 无法提取 API Key');
      }
    } else {
      console.log('\n✅ URL 格式正确，无需修复');
    }

    console.log('\n📋 修复后的配置:');
    const updatedNodes = JSON.parse(settings.tronApiNodes);
    const updatedZan = updatedNodes.find(n => n.name === 'ZAN');
    console.log(`   URL: ${updatedZan.url}`);
    console.log(`   API Key: ${updatedZan.apiKey || '(未配置)'}`);
    console.log(`   状态: ${updatedZan.enabled ? '✓ 启用' : '✗ 禁用'}`);

    console.log('\n💡 提示: 请重启服务器或点击"测试连接"按钮使配置生效\n');

  } catch (error) {
    console.error('❌ 修复失败:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

fixZanUrl();
