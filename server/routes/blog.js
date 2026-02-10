const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { auth, adminAuth } = require('../middleware/auth');

// 公开接口
router.get('/', blogController.getBlogs);
router.get('/categories', blogController.getCategories);
router.get('/tags', blogController.getTags);
router.get('/:slug', blogController.getBlogBySlug);
router.post('/:slug/view', blogController.incrementViews);

// 管理员接口
router.post('/', auth, adminAuth, blogController.createBlog);
router.put('/:id', auth, adminAuth, blogController.updateBlog);
router.delete('/:id', auth, adminAuth, blogController.deleteBlog);

router.post('/categories', auth, adminAuth, blogController.createCategory);
router.put('/categories/:id', auth, adminAuth, blogController.updateCategory);
router.delete('/categories/:id', auth, adminAuth, blogController.deleteCategory);

router.post('/tags', auth, adminAuth, blogController.createTag);
router.put('/tags/:id', auth, adminAuth, blogController.updateTag);
router.delete('/tags/:id', auth, adminAuth, blogController.deleteTag);

module.exports = router;
