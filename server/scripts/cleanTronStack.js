const mongoose = require('mongoose');
const Settings = require('../models/Settings');
require('dotenv').config();

async function cleanTronStack() {
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

    console.log('📋 当前节点配置:');
    const nodes = JSON.parse(settings.tronApiNodes);
    console.log(`   节点数量: ${nodes.length}`);
    nodes.forEach((node, index) => {
      console.log(`   ${index + 1}. ${node.name}: ${node.url || '(未配置)'} - ${node.enabled ? '✓ 启用' : '✗ 禁用'}`);
    });

    // 检查是否有 TronStack
    const hasTronStack = nodes.some(n => n.name === 'TronStack' || n.name === 'TronScan');
    
    if (hasTronStack) {
      console.log('\n⚠️  检测到 TronStack 或 TronScan 节点，正在清理...');
      
      // 只保留 TronGrid 和 ZAN
      const cleanedNodes = nodes.filter(n => n.name === 'TronGrid' || n.name === 'ZAN');
      
      // 如果没有这两个节点，添加默认配置
      if (!cleanedNodes.find(n => n.name === 'TronGrid')) {
        cleanedNodes.unshift({ name: 'TronGrid', url: 'https://api.trongrid.io', apiKey: '', enabled: false });
      }
      if (!cleanedNodes.find(n => n.name === 'ZAN')) {
        cleanedNodes.push({ name: 'ZAN', url: '', apiKey: '', enabled: false });
      }
      
      // 保存清理后的配置
      settings.tronApiNodes = JSON.stringify(cleanedNodes);
      settings.updatedAt = new Date();
      await settings.save();
      
      console.log('\n✅ 清理完成\n');
      
      console.log('📋 清理后的节点配置:');
      console.log(`   节点数量: ${cleanedNodes.length}`);
      cleanedNodes.forEach((node, index) => {
        console.log(`   ${index + 1}. ${node.name}: ${node.url || '(未配置)'} - ${node.enabled ? '✓ 启用' : '✗ 禁用'}`);
      });
    } else {
      console.log('\n✅ 配置正确，无需清理');
      console.log('   只包含 TronGrid 和 ZAN 节点');
    }

    console.log('\n💡 提示:');
    console.log('   1. 请刷新浏览器页面（Ctrl+F5 强制刷新）');
    console.log('   2. 重新配置并启用节点');
    console.log('   3. 测试连接\n');

  } catch (error) {
    console.error('❌ 清理失败:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

cleanTronStack();
