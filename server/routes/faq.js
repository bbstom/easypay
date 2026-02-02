const express = require('express');
const FAQ = require('../models/FAQ');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/faq
 * 获取FAQ列表（公开接口）
 */
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    
    const filter = { enabled: true };
    if (category) {
      filter.category = category;
    }
    
    const faqs = await FAQ.find(filter).sort({ order: 1, createdAt: -1 });
    
    res.json({
      success: true,
      faqs
    });
  } catch (error) {
    console.error('获取FAQ列表失败:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/faq/categories
 * 获取所有分类（公开接口）
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await FAQ.distinct('category', { enabled: true });
    
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('获取FAQ分类失败:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/faq/:id
 * 获取单个FAQ详情（公开接口）
 */
router.get('/:id', async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    
    if (!faq) {
      return res.status(404).json({ error: 'FAQ不存在' });
    }
    
    // 增加浏览次数
    faq.views += 1;
    await faq.save();
    
    res.json({
      success: true,
      faq
    });
  } catch (error) {
    console.error('获取FAQ详情失败:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/faq/admin/list
 * 获取所有FAQ（管理员）
 */
router.get('/admin/list', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }
    
    const faqs = await FAQ.find().sort({ order: 1, createdAt: -1 });
    
    res.json({
      success: true,
      faqs
    });
  } catch (error) {
    console.error('获取FAQ列表失败:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/faq
 * 创建FAQ（管理员）
 */
router.post('/', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }
    
    const { question, answer, category, order, enabled } = req.body;
    
    if (!question || !answer) {
      return res.status(400).json({ error: '问题和答案不能为空' });
    }
    
    const faq = await FAQ.create({
      question,
      answer,
      category: category || '常见问题',
      order: order || 0,
      enabled: enabled !== undefined ? enabled : true
    });
    
    res.json({
      success: true,
      message: 'FAQ创建成功',
      faq
    });
  } catch (error) {
    console.error('创建FAQ失败:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * PUT /api/faq/:id
 * 更新FAQ（管理员）
 */
router.put('/:id', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }
    
    const { question, answer, category, order, enabled } = req.body;
    
    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ error: 'FAQ不存在' });
    }
    
    if (question !== undefined) faq.question = question;
    if (answer !== undefined) faq.answer = answer;
    if (category !== undefined) faq.category = category;
    if (order !== undefined) faq.order = order;
    if (enabled !== undefined) faq.enabled = enabled;
    
    await faq.save();
    
    res.json({
      success: true,
      message: 'FAQ更新成功',
      faq
    });
  } catch (error) {
    console.error('更新FAQ失败:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * DELETE /api/faq/:id
 * 删除FAQ（管理员）
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }
    
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    
    if (!faq) {
      return res.status(404).json({ error: 'FAQ不存在' });
    }
    
    res.json({
      success: true,
      message: 'FAQ删除成功'
    });
  } catch (error) {
    console.error('删除FAQ失败:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
