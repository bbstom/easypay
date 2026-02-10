const Blog = require('../models/Blog');
const BlogCategory = require('../models/BlogCategory');
const BlogTag = require('../models/BlogTag');

// 获取博客列表
exports.getBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 12, category, tag, q, status = 'published' } = req.query;
    
    const query = {};
    
    // 状态筛选（支持 'all' 查询所有状态）
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // 分类筛选
    if (category && category !== 'all') {
      const categoryDoc = await BlogCategory.findOne({ slug: category });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      }
    }
    
    // 标签筛选
    if (tag) {
      const tagDoc = await BlogTag.findOne({ slug: tag });
      if (tagDoc) {
        query.tags = tagDoc._id;
      }
    }
    
    // 搜索
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { excerpt: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .populate('category', 'name slug')
        .populate('tags', 'name slug')
        .populate('author', 'username')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Blog.countDocuments(query)
    ]);
    
    res.json({
      blogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取博客列表失败:', error);
    res.status(500).json({ message: '获取博客列表失败' });
  }
};

// 获取博客详情
exports.getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const blog = await Blog.findOne({ slug, status: 'published' })
      .populate('category', 'name slug')
      .populate('tags', 'name slug')
      .populate('author', 'username')
      .lean();
    
    if (!blog) {
      return res.status(404).json({ message: '文章不存在' });
    }
    
    // 获取相关文章（同分类，排除当前文章）
    const relatedBlogs = await Blog.find({
      category: blog.category._id,
      _id: { $ne: blog._id },
      status: 'published'
    })
      .populate('category', 'name slug')
      .sort({ publishedAt: -1 })
      .limit(4)
      .lean();
    
    res.json({ blog, relatedBlogs });
  } catch (error) {
    console.error('获取博客详情失败:', error);
    res.status(500).json({ message: '获取博客详情失败' });
  }
};

// 增加阅读量
exports.incrementViews = async (req, res) => {
  try {
    const { slug } = req.params;
    
    await Blog.findOneAndUpdate(
      { slug },
      { $inc: { views: 1 } }
    );
    
    res.json({ message: '阅读量已更新' });
  } catch (error) {
    console.error('更新阅读量失败:', error);
    res.status(500).json({ message: '更新阅读量失败' });
  }
};

// 获取分类列表
exports.getCategories = async (req, res) => {
  try {
    const categories = await BlogCategory.find()
      .sort({ order: 1, name: 1 })
      .lean();
    
    res.json({ categories });
  } catch (error) {
    console.error('获取分类列表失败:', error);
    res.status(500).json({ message: '获取分类列表失败' });
  }
};

// 获取标签列表
exports.getTags = async (req, res) => {
  try {
    const tags = await BlogTag.find()
      .sort({ name: 1 })
      .lean();
    
    res.json({ tags });
  } catch (error) {
    console.error('获取标签列表失败:', error);
    res.status(500).json({ message: '获取标签列表失败' });
  }
};

// ==================== 管理员接口 ====================

// 创建博客
exports.createBlog = async (req, res) => {
  try {
    const { title, content, excerpt, coverImage, category, tags, status, seo } = req.body;
    
    // 生成 slug
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // 处理标签（如果是字符串数组，自动创建或查找标签）
    let tagIds = [];
    if (tags && Array.isArray(tags)) {
      for (const tagName of tags) {
        if (!tagName || !tagName.trim()) continue;
        
        const tagSlug = tagName
          .toLowerCase()
          .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
          .replace(/^-+|-+$/g, '');
        
        // 查找或创建标签
        let tag = await BlogTag.findOne({ slug: tagSlug });
        if (!tag) {
          tag = new BlogTag({
            name: tagName.trim(),
            slug: tagSlug
          });
          await tag.save();
        }
        tagIds.push(tag._id);
      }
    }
    
    const blog = new Blog({
      title,
      slug,
      content,
      excerpt,
      coverImage,
      category,
      tags: tagIds,
      status,
      seo,
      author: req.user.userId
    });
    
    await blog.save();
    
    res.status(201).json({ message: '博客创建成功', blog });
  } catch (error) {
    console.error('创建博客失败:', error);
    res.status(500).json({ message: '创建博客失败' });
  }
};

// 更新博客
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // 如果标题改变，重新生成 slug
    if (updates.title) {
      updates.slug = updates.title
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
    
    // 处理标签（如果是字符串数组，自动创建或查找标签）
    if (updates.tags && Array.isArray(updates.tags)) {
      let tagIds = [];
      for (const tagName of updates.tags) {
        if (!tagName || !tagName.trim()) continue;
        
        const tagSlug = tagName
          .toLowerCase()
          .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
          .replace(/^-+|-+$/g, '');
        
        // 查找或创建标签
        let tag = await BlogTag.findOne({ slug: tagSlug });
        if (!tag) {
          tag = new BlogTag({
            name: tagName.trim(),
            slug: tagSlug
          });
          await tag.save();
        }
        tagIds.push(tag._id);
      }
      updates.tags = tagIds;
    }
    
    const blog = await Blog.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!blog) {
      return res.status(404).json({ message: '博客不存在' });
    }
    
    res.json({ message: '博客更新成功', blog });
  } catch (error) {
    console.error('更新博客失败:', error);
    res.status(500).json({ message: '更新博客失败' });
  }
};

// 删除博客
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    
    const blog = await Blog.findByIdAndDelete(id);
    
    if (!blog) {
      return res.status(404).json({ message: '博客不存在' });
    }
    
    res.json({ message: '博客删除成功' });
  } catch (error) {
    console.error('删除博客失败:', error);
    res.status(500).json({ message: '删除博客失败' });
  }
};

// 创建分类
exports.createCategory = async (req, res) => {
  try {
    const { name, description, order } = req.body;
    
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    const category = new BlogCategory({
      name,
      slug,
      description,
      order
    });
    
    await category.save();
    
    res.status(201).json({ message: '分类创建成功', category });
  } catch (error) {
    console.error('创建分类失败:', error);
    res.status(500).json({ message: '创建分类失败' });
  }
};

// 更新分类
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (updates.name) {
      updates.slug = updates.name
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
    
    const category = await BlogCategory.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({ message: '分类不存在' });
    }
    
    res.json({ message: '分类更新成功', category });
  } catch (error) {
    console.error('更新分类失败:', error);
    res.status(500).json({ message: '更新分类失败' });
  }
};

// 删除分类
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查是否有文章使用此分类
    const blogCount = await Blog.countDocuments({ category: id });
    if (blogCount > 0) {
      return res.status(400).json({ message: '该分类下还有文章，无法删除' });
    }
    
    const category = await BlogCategory.findByIdAndDelete(id);
    
    if (!category) {
      return res.status(404).json({ message: '分类不存在' });
    }
    
    res.json({ message: '分类删除成功' });
  } catch (error) {
    console.error('删除分类失败:', error);
    res.status(500).json({ message: '删除分类失败' });
  }
};

// 创建标签
exports.createTag = async (req, res) => {
  try {
    const { name } = req.body;
    
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    const tag = new BlogTag({ name, slug });
    
    await tag.save();
    
    res.status(201).json({ message: '标签创建成功', tag });
  } catch (error) {
    console.error('创建标签失败:', error);
    res.status(500).json({ message: '创建标签失败' });
  }
};

// 更新标签
exports.updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    const tag = await BlogTag.findByIdAndUpdate(
      id,
      { name, slug },
      { new: true, runValidators: true }
    );
    
    if (!tag) {
      return res.status(404).json({ message: '标签不存在' });
    }
    
    res.json({ message: '标签更新成功', tag });
  } catch (error) {
    console.error('更新标签失败:', error);
    res.status(500).json({ message: '更新标签失败' });
  }
};

// 删除标签
exports.deleteTag = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tag = await BlogTag.findByIdAndDelete(id);
    
    if (!tag) {
      return res.status(404).json({ message: '标签不存在' });
    }
    
    // 从所有文章中移除此标签
    await Blog.updateMany(
      { tags: id },
      { $pull: { tags: id } }
    );
    
    res.json({ message: '标签删除成功' });
  } catch (error) {
    console.error('删除标签失败:', error);
    res.status(500).json({ message: '删除标签失败' });
  }
};
