const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password });
    await user.save();
    
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({ token, user: { id: user._id, username, email, role: user.role } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }
    
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    
    res.json({ token, user: { id: user._id, username: user.username, email, role: user.role } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 更新用户信息
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 检查邮箱是否已被其他用户使用
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: '该邮箱已被使用' });
      }
      user.email = email;
    }

    if (username) {
      user.username = username;
    }

    await user.save();
    
    res.json({ 
      message: '更新成功',
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 修改密码
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 验证当前密码
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: '当前密码错误' });
    }

    // 更新密码
    user.password = newPassword;
    await user.save();
    
    res.json({ message: '密码修改成功' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Telegram 登录
router.post('/telegram-login', async (req, res) => {
  try {
    const { id, first_name, last_name, username, photo_url, auth_date, hash } = req.body;

    // 验证 Telegram 数据
    // 支持多 Bot 模式：优先使用 TELEGRAM_BOT_TOKEN，如果不存在则使用第一个 Token
    let botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken && process.env.TELEGRAM_BOT_TOKENS) {
      // 多 Bot 模式：使用第一个 Token
      botToken = process.env.TELEGRAM_BOT_TOKENS.split(',')[0].trim();
    }
    
    if (!botToken) {
      return res.status(500).json({ error: 'Telegram Bot 未配置' });
    }

    // 验证数据完整性
    const crypto = require('crypto');
    const checkString = Object.keys(req.body)
      .filter(key => key !== 'hash')
      .sort()
      .map(key => `${key}=${req.body[key]}`)
      .join('\n');
    
    const secretKey = crypto.createHash('sha256').update(botToken).digest();
    const hmac = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

    if (hmac !== hash) {
      return res.status(401).json({ error: 'Telegram 数据验证失败' });
    }

    // 检查数据是否过期（24小时）
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime - auth_date > 86400) {
      return res.status(401).json({ error: 'Telegram 登录已过期，请重新登录' });
    }

    // 查找或创建用户
    let user = await User.findOne({ telegramId: id.toString() });

    if (!user) {
      // 创建新用户
      const telegramUsername = username || `tg_${id}`;
      const telegramEmail = `${id}@telegram.user`;
      
      user = new User({
        username: telegramUsername,
        email: telegramEmail,
        telegramId: id.toString(),
        telegramUsername: username,
        telegramFirstName: first_name,
        telegramLastName: last_name,
        telegramPhotoUrl: photo_url,
        // Telegram 登录的用户不需要密码
        password: crypto.randomBytes(32).toString('hex')
      });

      await user.save();
    } else {
      // 更新用户信息
      user.telegramUsername = username;
      user.telegramFirstName = first_name;
      user.telegramLastName = last_name;
      user.telegramPhotoUrl = photo_url;
      await user.save();
    }

    // 生成 JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        telegramId: user.telegramId,
        telegramUsername: user.telegramUsername,
        telegramFirstName: user.telegramFirstName,
        telegramLastName: user.telegramLastName,
        telegramPhotoUrl: user.telegramPhotoUrl
      }
    });
  } catch (error) {
    console.error('Telegram 登录错误:', error);
    res.status(400).json({ error: error.message });
  }
});

// 检查二维码登录状态
router.get('/check-qr-login', async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ error: '缺少 token 参数' });
    }

    // 从 Redis 或内存中查找登录状态
    // 这里使用简单的内存存储（生产环境应该使用 Redis）
    const loginData = global.qrLoginSessions?.[token];
    
    if (loginData && loginData.userData) {
      console.log('✅ 检测到登录成功:', {
        token: token.substring(0, 20) + '...',
        telegramId: loginData.userData.id
      });
      
      // 不要清除 token，让 complete 端点来清除
      // delete global.qrLoginSessions[token];
      
      return res.json({
        success: true,
        token: token  // 返回 token 供前端调用 complete 端点
      });
    }
    
    // 不打印太多日志，避免刷屏
    // console.log('⏳ 等待登录确认:', token.substring(0, 20) + '...');
    res.json({ success: false });
  } catch (error) {
    console.error('检查登录状态错误:', error);
    res.status(400).json({ error: error.message });
  }
});

// 完成二维码登录（前端调用，直接返回 JWT token）
router.post('/qr-login-complete', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: '缺少 token 参数' });
    }

    // 从内存中获取登录数据
    const loginData = global.qrLoginSessions?.[token];
    
    if (!loginData || !loginData.userData) {
      return res.status(401).json({ error: '登录会话已过期或无效' });
    }

    const userData = loginData.userData;
    
    // 清除已使用的 token
    delete global.qrLoginSessions[token];
    
    // 查找或创建用户（自动注册）
    let user = await User.findOne({ telegramId: userData.id.toString() });
    
    if (!user) {
      // 自动创建新用户，无需先 /start
      const crypto = require('crypto');
      user = new User({
        username: userData.username || `tg_${userData.id}`,
        email: `${userData.id}@telegram.user`,
        telegramId: userData.id.toString(),
        telegramUsername: userData.username,
        telegramFirstName: userData.first_name,
        telegramLastName: userData.last_name,
        telegramPhotoUrl: userData.photo_url,
        password: crypto.randomBytes(32).toString('hex')
      });
      await user.save();
      console.log('✅ 自动创建新用户（无需 /start）:', user.username);
    }

    // 生成 JWT token
    const jwtToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    console.log('✅ 扫码登录完成:', {
      userId: user._id,
      username: user.username,
      telegramId: user.telegramId
    });

    res.json({
      token: jwtToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        telegramId: user.telegramId,
        telegramUsername: user.telegramUsername,
        telegramFirstName: user.telegramFirstName,
        telegramLastName: user.telegramLastName,
        telegramPhotoUrl: user.telegramPhotoUrl
      }
    });
  } catch (error) {
    console.error('❌ 完成登录错误:', error);
    res.status(400).json({ error: error.message });
  }
});

// 确认二维码登录（由 Bot 调用）
router.post('/confirm-qr-login', async (req, res) => {
  try {
    const { token, telegramId, username, firstName, lastName, photoUrl } = req.body;
    
    console.log('🔐 收到登录确认请求:', {
      token,
      telegramId,
      username,
      firstName
    });
    
    if (!token || !telegramId) {
      console.error('❌ 缺少必要参数');
      return res.status(400).json({ error: '缺少必要参数' });
    }

    // 查找或创建用户
    let user = await User.findOne({ telegramId: telegramId.toString() });
    
    if (!user) {
      const crypto = require('crypto');
      user = new User({
        username: username || `tg_${telegramId}`,
        email: `${telegramId}@telegram.user`,
        telegramId: telegramId.toString(),
        telegramUsername: username,
        telegramFirstName: firstName,
        telegramLastName: lastName,
        telegramPhotoUrl: photoUrl,
        password: crypto.randomBytes(32).toString('hex')
      });
      await user.save();
      console.log('✅ 创建新用户:', user.username);
    } else {
      user.telegramUsername = username;
      user.telegramFirstName = firstName;
      user.telegramLastName = lastName;
      user.telegramPhotoUrl = photoUrl;
      await user.save();
      console.log('✅ 更新用户信息:', user.username);
    }

    // 生成用户数据（包含验证信息）
    const userData = {
      id: telegramId,
      first_name: firstName,
      last_name: lastName,
      username: username,
      photo_url: photoUrl,
      auth_date: Math.floor(Date.now() / 1000)
    };

    // 生成 hash
    const crypto = require('crypto');
    // 支持多 Bot 模式：优先使用 TELEGRAM_BOT_TOKEN，如果不存在则使用第一个 Token
    let botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken && process.env.TELEGRAM_BOT_TOKENS) {
      // 多 Bot 模式：使用第一个 Token
      botToken = process.env.TELEGRAM_BOT_TOKENS.split(',')[0].trim();
    }
    
    if (!botToken) {
      throw new Error('未配置 Telegram Bot Token');
    }
    
    const checkString = Object.keys(userData)
      .sort()
      .map(key => `${key}=${userData[key]}`)
      .join('\n');
    const secretKey = crypto.createHash('sha256').update(botToken).digest();
    userData.hash = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

    // 存储登录数据（使用全局变量，生产环境应该使用 Redis）
    if (!global.qrLoginSessions) {
      global.qrLoginSessions = {};
    }
    global.qrLoginSessions[token] = {
      userData,
      timestamp: Date.now()
    };

    console.log('✅ 登录数据已存储:', {
      token,
      sessionCount: Object.keys(global.qrLoginSessions).length
    });

    // 5分钟后自动清除
    setTimeout(() => {
      if (global.qrLoginSessions?.[token]) {
        delete global.qrLoginSessions[token];
        console.log('🗑️  清除过期登录会话:', token);
      }
    }, 300000);

    res.json({ success: true, message: '登录确认成功' });
  } catch (error) {
    console.error('❌ 确认登录错误:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
