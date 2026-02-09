const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const staticPageGenerator = require('../services/staticPageGenerator');

/**
 * 生成所有静态文件
 * POST /api/seo/generate
 */
router.post('/generate', auth, adminAuth, async (req, res) => {
  try {
    const result = await staticPageGenerator.generateAll();
    res.json(result);
  } catch (error) {
    console.error('生成静态文件失败:', error);
    res.status(500).json({
      success: false,
      message: '生成静态文件失败',
      error: error.message
    });
  }
});

/**
 * 生成首页
 * POST /api/seo/generate/homepage
 */
router.post('/generate/homepage', auth, adminAuth, async (req, res) => {
  try {
    const result = await staticPageGenerator.generateHomePage();
    res.json(result);
  } catch (error) {
    console.error('生成首页失败:', error);
    res.status(500).json({
      success: false,
      message: '生成首页失败',
      error: error.message
    });
  }
});

/**
 * 生成能量租赁页面
 * POST /api/seo/generate/energy
 */
router.post('/generate/energy', auth, adminAuth, async (req, res) => {
  try {
    const result = await staticPageGenerator.generateEnergyPage();
    res.json(result);
  } catch (error) {
    console.error('生成能量租赁页面失败:', error);
    res.status(500).json({
      success: false,
      message: '生成能量租赁页面失败',
      error: error.message
    });
  }
});

/**
 * 生成闪兑页面
 * POST /api/seo/generate/swap
 */
router.post('/generate/swap', auth, adminAuth, async (req, res) => {
  try {
    const result = await staticPageGenerator.generateSwapPage();
    res.json(result);
  } catch (error) {
    console.error('生成闪兑页面失败:', error);
    res.status(500).json({
      success: false,
      message: '生成闪兑页面失败',
      error: error.message
    });
  }
});

/**
 * 生成 FAQ 页面
 * POST /api/seo/generate/faq
 */
router.post('/generate/faq', auth, adminAuth, async (req, res) => {
  try {
    const result = await staticPageGenerator.generateFAQPage();
    res.json(result);
  } catch (error) {
    console.error('生成 FAQ 页面失败:', error);
    res.status(500).json({
      success: false,
      message: '生成 FAQ 页面失败',
      error: error.message
    });
  }
});

/**
 * 生成 sitemap.xml
 * POST /api/seo/generate/sitemap
 */
router.post('/generate/sitemap', auth, adminAuth, async (req, res) => {
  try {
    const result = await staticPageGenerator.generateSitemap();
    res.json(result);
  } catch (error) {
    console.error('生成 sitemap 失败:', error);
    res.status(500).json({
      success: false,
      message: '生成 sitemap 失败',
      error: error.message
    });
  }
});

/**
 * 生成 robots.txt
 * POST /api/seo/generate/robots
 */
router.post('/generate/robots', auth, adminAuth, async (req, res) => {
  try {
    const result = await staticPageGenerator.generateRobotsTxt();
    res.json(result);
  } catch (error) {
    console.error('生成 robots.txt 失败:', error);
    res.status(500).json({
      success: false,
      message: '生成 robots.txt 失败',
      error: error.message
    });
  }
});

/**
 * 获取生成状态
 * GET /api/seo/status
 */
router.get('/status', auth, adminAuth, async (req, res) => {
  try {
    const result = await staticPageGenerator.getStatus();
    res.json(result);
  } catch (error) {
    console.error('获取状态失败:', error);
    res.status(500).json({
      success: false,
      message: '获取状态失败',
      error: error.message
    });
  }
});

module.exports = router;
