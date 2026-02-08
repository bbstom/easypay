const express = require('express');
const router = express.Router();
const TelegramCommand = require('../models/TelegramCommand');
const { auth, adminAuth } = require('../middleware/auth');
const { getBotInstance } = require('../bot');

// 获取所有命令
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const commands = await TelegramCommand.find().sort({ order: 1 });
    res.json({ commands });
  } catch (error) {
    console.error('获取命令列表失败:', error);
    res.status(500).json({ error: '获取命令列表失败' });
  }
});

// 获取单个命令
router.get('/:id', auth, adminAuth, async (req, res) => {
  try {
    const command = await TelegramCommand.findById(req.params.id);
    if (!command) {
      return res.status(404).json({ error: '命令不存在' });
    }
    res.json({ command });
  } catch (error) {
    console.error('获取命令失败:', error);
    res.status(500).json({ error: '获取命令失败' });
  }
});

// 创建命令
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const {
      command,
      description,
      action,
      callbackData,
      responseText,
      functionName,
      enabled,
      order,
      showInMenu,
      icon
    } = req.body;

    // 验证必填字段
    if (!command || !description || !action) {
      return res.status(400).json({ error: '命令、描述和动作类型为必填项' });
    }

    // 验证命令格式
    if (!/^[a-z][a-z0-9_]*$/.test(command)) {
      return res.status(400).json({ 
        error: '命令格式无效，只能包含小写字母、数字和下划线，且不能以数字开头' 
      });
    }

    // 检查命令是否已存在
    const existing = await TelegramCommand.findOne({ command });
    if (existing) {
      return res.status(400).json({ error: '该命令已存在' });
    }

    // 根据 action 类型验证对应字段
    if (action === 'callback' && !callbackData) {
      return res.status(400).json({ error: 'Callback 动作需要提供 callbackData' });
    }
    if (action === 'text' && !responseText) {
      return res.status(400).json({ error: '文本动作需要提供 responseText' });
    }
    if (action === 'function' && !functionName) {
      return res.status(400).json({ error: '函数动作需要提供 functionName' });
    }

    const newCommand = new TelegramCommand({
      command,
      description,
      action,
      callbackData,
      responseText,
      functionName,
      enabled: enabled !== undefined ? enabled : true,
      order: order || 0,
      showInMenu: showInMenu !== undefined ? showInMenu : true,
      icon
    });

    await newCommand.save();

    // 重新加载 Bot 命令
    const bot = getBotInstance();
    if (bot && bot.reloadCommands) {
      await bot.reloadCommands();
    }

    res.status(201).json({ 
      message: '命令创建成功',
      command: newCommand 
    });
  } catch (error) {
    console.error('创建命令失败:', error);
    res.status(500).json({ error: error.message || '创建命令失败' });
  }
});

// 更新命令
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const {
      command,
      description,
      action,
      callbackData,
      responseText,
      functionName,
      enabled,
      order,
      showInMenu,
      icon
    } = req.body;

    const existingCommand = await TelegramCommand.findById(req.params.id);
    if (!existingCommand) {
      return res.status(404).json({ error: '命令不存在' });
    }

    // 如果修改了命令名，检查新命令名是否已存在
    if (command && command !== existingCommand.command) {
      const duplicate = await TelegramCommand.findOne({ command });
      if (duplicate) {
        return res.status(400).json({ error: '该命令名已被使用' });
      }

      // 验证命令格式
      if (!/^[a-z][a-z0-9_]*$/.test(command)) {
        return res.status(400).json({ 
          error: '命令格式无效，只能包含小写字母、数字和下划线，且不能以数字开头' 
        });
      }
    }

    // 更新字段
    if (command) existingCommand.command = command;
    if (description) existingCommand.description = description;
    if (action) existingCommand.action = action;
    if (callbackData !== undefined) existingCommand.callbackData = callbackData;
    if (responseText !== undefined) existingCommand.responseText = responseText;
    if (functionName !== undefined) existingCommand.functionName = functionName;
    if (enabled !== undefined) existingCommand.enabled = enabled;
    if (order !== undefined) existingCommand.order = order;
    if (showInMenu !== undefined) existingCommand.showInMenu = showInMenu;
    if (icon !== undefined) existingCommand.icon = icon;

    await existingCommand.save();

    // 重新加载 Bot 命令
    const bot = getBotInstance();
    if (bot && bot.reloadCommands) {
      await bot.reloadCommands();
    }

    res.json({ 
      message: '命令更新成功',
      command: existingCommand 
    });
  } catch (error) {
    console.error('更新命令失败:', error);
    res.status(500).json({ error: error.message || '更新命令失败' });
  }
});

// 删除命令
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const command = await TelegramCommand.findById(req.params.id);
    if (!command) {
      return res.status(404).json({ error: '命令不存在' });
    }

    await TelegramCommand.findByIdAndDelete(req.params.id);

    // 重新加载 Bot 命令
    const bot = getBotInstance();
    if (bot && bot.reloadCommands) {
      await bot.reloadCommands();
    }

    res.json({ message: '命令删除成功' });
  } catch (error) {
    console.error('删除命令失败:', error);
    res.status(500).json({ error: '删除命令失败' });
  }
});

// 批量更新排序
router.post('/reorder', auth, adminAuth, async (req, res) => {
  try {
    const { commands } = req.body; // [{ id, order }, ...]

    if (!Array.isArray(commands)) {
      return res.status(400).json({ error: '无效的数据格式' });
    }

    // 批量更新
    const updates = commands.map(({ id, order }) => 
      TelegramCommand.findByIdAndUpdate(id, { order })
    );

    await Promise.all(updates);

    // 重新加载 Bot 命令
    const bot = getBotInstance();
    if (bot && bot.reloadCommands) {
      await bot.reloadCommands();
    }

    res.json({ message: '排序更新成功' });
  } catch (error) {
    console.error('更新排序失败:', error);
    res.status(500).json({ error: '更新排序失败' });
  }
});

// 切换命令启用状态
router.post('/:id/toggle', auth, adminAuth, async (req, res) => {
  try {
    const command = await TelegramCommand.findById(req.params.id);
    if (!command) {
      return res.status(404).json({ error: '命令不存在' });
    }

    command.enabled = !command.enabled;
    await command.save();

    // 重新加载 Bot 命令
    const bot = getBotInstance();
    if (bot && bot.reloadCommands) {
      await bot.reloadCommands();
    }

    res.json({ 
      message: `命令已${command.enabled ? '启用' : '禁用'}`,
      command 
    });
  } catch (error) {
    console.error('切换命令状态失败:', error);
    res.status(500).json({ error: '切换命令状态失败' });
  }
});

// 重新加载所有命令到 Telegram
router.post('/reload', auth, adminAuth, async (req, res) => {
  try {
    const bot = getBotInstance();
    if (!bot || !bot.reloadCommands) {
      return res.status(500).json({ error: 'Bot 未启动或不支持重新加载' });
    }

    await bot.reloadCommands();
    res.json({ message: 'Bot 命令已重新加载' });
  } catch (error) {
    console.error('重新加载命令失败:', error);
    res.status(500).json({ error: '重新加载命令失败' });
  }
});

// 获取可用的函数列表
router.get('/functions/list', auth, adminAuth, async (req, res) => {
  try {
    const { commandHandlers } = require('../bot/commandHandler');
    const functions = Object.keys(commandHandlers).map(name => ({
      name,
      description: getFunctionDescription(name)
    }));

    res.json({ functions });
  } catch (error) {
    console.error('获取函数列表失败:', error);
    res.status(500).json({ error: '获取函数列表失败' });
  }
});

// 辅助函数：获取函数描述
function getFunctionDescription(name) {
  const descriptions = {
    start: '启动机器人',
    menu: '显示主菜单',
    help: '显示帮助信息',
    cancel: '取消当前操作',
    pay_usdt: 'USDT 代付',
    pay_trx: 'TRX 代付',
    my_orders: '我的订单',
    energy: '能量租赁',
    swap: '闪兑服务',
    tickets: '我的工单',
    account: '个人中心'
  };

  return descriptions[name] || name;
}

module.exports = router;
