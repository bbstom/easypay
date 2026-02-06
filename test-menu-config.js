const mongoose = require('mongoose');
require('dotenv').config();

async function testMenuConfig() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 数据库连接成功\n');

    const TelegramMenu = require('./server/models/TelegramMenu');
    const menu = await TelegramMenu.findOne({ name: 'main_menu' });

    if (!menu) {
      console.log('❌ 未找到主菜单配置');
      console.log('💡 请在管理后台创建主菜单或运行初始化脚本\n');
      await mongoose.disconnect();
      return;
    }

    console.log('📋 主菜单配置:');
    console.log('  启用状态:', menu.enabled ? '✅ 已启用' : '❌ 已禁用');
    console.log('  按钮数量:', menu.buttons.length);
    console.log('  布局方式:', menu.layout);
    console.log('\n按钮列表:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    menu.buttons
      .sort((a, b) => a.order - b.order)
      .forEach((btn, index) => {
        const status = btn.enabled ? '✅' : '❌';
        console.log(`\n${status} 按钮 ${index + 1}: ${btn.text}`);
        console.log(`   类型: ${btn.type}`);
        console.log(`   动作: ${btn.action}`);
        console.log(`   位置: 行${btn.row} 列${btn.col}`);
        console.log(`   顺序: ${btn.order}`);
      });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // 检查能量租赁和闪兑按钮
    const energyBtn = menu.buttons.find(b => b.action === 'energy_rental');
    const swapBtn = menu.buttons.find(b => b.action === 'swap_service');

    console.log('\n🔍 关键按钮检查:');
    console.log('\n⚡ 能量租赁按钮:');
    if (energyBtn) {
      console.log('  状态: ✅ 已配置');
      console.log('  文字:', energyBtn.text);
      console.log('  动作:', energyBtn.action);
      console.log('  启用:', energyBtn.enabled ? '✅ 是' : '❌ 否');
      if (!energyBtn.enabled) {
        console.log('  ⚠️  警告: 按钮未启用，不会显示在菜单中');
      }
      if (energyBtn.action !== 'energy_rental') {
        console.log('  ⚠️  警告: action 值不正确，应该是 "energy_rental"');
      }
    } else {
      console.log('  状态: ❌ 未配置');
      console.log('  💡 请在管理后台添加能量租赁按钮');
    }

    console.log('\n🔄 闪兑服务按钮:');
    if (swapBtn) {
      console.log('  状态: ✅ 已配置');
      console.log('  文字:', swapBtn.text);
      console.log('  动作:', swapBtn.action);
      console.log('  启用:', swapBtn.enabled ? '✅ 是' : '❌ 否');
      if (!swapBtn.enabled) {
        console.log('  ⚠️  警告: 按钮未启用，不会显示在菜单中');
      }
      if (swapBtn.action !== 'swap_service') {
        console.log('  ⚠️  警告: action 值不正确，应该是 "swap_service"');
      }
    } else {
      console.log('  状态: ❌ 未配置');
      console.log('  💡 请在管理后台添加闪兑服务按钮');
    }

    // 检查 Settings 配置
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚙️  系统设置检查:');
    
    const Settings = require('./server/models/Settings');
    const settings = await Settings.findOne();

    if (settings) {
      console.log('\n⚡ 能量租赁配置:');
      console.log('  收款地址:', settings.energyRentalAddress || '❌ 未配置');
      console.log('  价格 (TRX):', settings.energyPriceTrx || '未配置');
      console.log('  能量数量:', settings.energyPriceEnergy || '未配置');
      console.log('  最小金额:', settings.energyMinAmount || '未配置');
      console.log('  有效期 (小时):', settings.energyValidityHours || '未配置');

      console.log('\n🔄 闪兑服务配置:');
      if (settings.swapWallets) {
        try {
          const wallets = JSON.parse(settings.swapWallets);
          const enabledWallet = wallets.find(w => w.enabled);
          if (enabledWallet) {
            console.log('  收款地址:', enabledWallet.address);
            console.log('  钱包名称:', enabledWallet.name || '未命名');
          } else {
            console.log('  收款地址: ❌ 没有启用的钱包');
          }
        } catch (e) {
          console.log('  收款地址: ❌ 配置格式错误');
        }
      } else {
        console.log('  收款地址: ❌ 未配置');
      }
    } else {
      console.log('  ❌ 未找到系统设置');
      console.log('  💡 请在管理后台配置系统设置');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📝 总结:');
    
    const issues = [];
    if (!energyBtn) issues.push('❌ 能量租赁按钮未配置');
    else if (!energyBtn.enabled) issues.push('⚠️  能量租赁按钮未启用');
    else if (energyBtn.action !== 'energy_rental') issues.push('⚠️  能量租赁按钮 action 不正确');
    
    if (!swapBtn) issues.push('❌ 闪兑服务按钮未配置');
    else if (!swapBtn.enabled) issues.push('⚠️  闪兑服务按钮未启用');
    else if (swapBtn.action !== 'swap_service') issues.push('⚠️  闪兑服务按钮 action 不正确');
    
    if (settings) {
      if (!settings.energyRentalAddress) issues.push('⚠️  能量租赁地址未配置');
      if (!settings.swapWallets) issues.push('⚠️  闪兑钱包未配置');
    } else {
      issues.push('❌ 系统设置未配置');
    }

    if (issues.length === 0) {
      console.log('✅ 所有配置正常！');
    } else {
      console.log('发现以下问题:');
      issues.forEach(issue => console.log('  ' + issue));
      console.log('\n💡 请按照上述提示修复问题');
    }

    await mongoose.disconnect();
    console.log('\n✅ 测试完成\n');
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testMenuConfig();
