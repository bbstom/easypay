import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, FileText } from 'lucide-react';
import axios from 'axios';

const BlogManagePage = () => {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/blog', {
        params: { status: 'all', limit: 100 }
      });
      setBlogs(data.blogs);
    } catch (error) {
      console.error('获取博客失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get('/api/blog/categories');
      setCategories(data.categories);
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('确定要删除这篇文章吗？')) return;
    
    try {
      await axios.delete(`/api/blog/${id}`);
      alert('✅ 文章删除成功！');
      fetchBlogs();
    } catch (error) {
      console.error('删除失败:', error);
      alert('❌ 删除失败：' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingBlog(null);
    setShowModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">博客管理</h1>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Plus size={20} />
          新建文章
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-bold text-slate-900">标题</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-slate-900">分类</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-slate-900">状态</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-slate-900">阅读量</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-slate-900">发布时间</th>
                <th className="px-6 py-3 text-right text-sm font-bold text-slate-900">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {blogs.map((blog) => (
                <tr key={blog._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <FileText size={20} className="text-slate-400" />
                      <div>
                        <div className="font-medium text-slate-900">{blog.title}</div>
                        <div className="text-sm text-slate-500 line-clamp-1">{blog.excerpt}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded">
                      {blog.category?.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      blog.status === 'published'
                        ? 'bg-green-50 text-green-600'
                        : 'bg-yellow-50 text-yellow-600'
                    }`}>
                      {blog.status === 'published' ? '已发布' : '草稿'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <div className="flex items-center gap-1">
                      <Eye size={16} />
                      {blog.views}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {blog.publishedAt
                      ? new Date(blog.publishedAt).toLocaleDateString('zh-CN')
                      : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(blog)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(blog._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 编辑/创建模态框 */}
      {showModal && (
        <BlogEditModal
          blog={editingBlog}
          categories={categories}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchBlogs();
          }}
        />
      )}
    </div>
  );
};

// 博客编辑模态框组件
const BlogEditModal = ({ blog, categories, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: blog?.title || '',
    content: blog?.content || '',
    excerpt: blog?.excerpt || '',
    coverImage: blog?.coverImage || '',
    category: blog?.category?._id || '',
    tags: blog?.tags?.map(t => t.name).join(', ') || '',
    status: blog?.status || 'draft',
    seo: {
      title: blog?.seo?.title || '',
      description: blog?.seo?.description || '',
      keywords: blog?.seo?.keywords?.join(', ') || ''
    }
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        seo: {
          ...formData.seo,
          keywords: formData.seo.keywords.split(',').map(k => k.trim()).filter(Boolean)
        }
      };

      if (blog) {
        await axios.put(`/api/blog/${blog._id}`, data);
        alert('✅ 文章更新成功！');
      } else {
        await axios.post('/api/blog', data);
        alert('✅ 文章创建成功！');
      }

      onSuccess();
    } catch (error) {
      console.error('保存失败:', error);
      alert('❌ 保存失败：' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-4xl w-full my-8">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center rounded-t-xl z-10">
          <h2 className="text-xl font-bold text-slate-900">
            {blog ? '编辑文章' : '新建文章'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-80px)] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              标题 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              摘要 *
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              内容 * (Markdown)
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={15}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                分类 *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">选择分类</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                状态 *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="draft">草稿</option>
                <option value="published">发布</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              标签
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="USDT, 代付, TRC20, 区块链支付"
            />
            <p className="text-xs text-slate-500 mt-1">
              用逗号分隔多个标签，系统会自动创建不存在的标签
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              封面图片 URL
            </label>
            <input
              type="url"
              value={formData.coverImage}
              onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">SEO 设置</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  SEO 标题
                </label>
                <input
                  type="text"
                  value={formData.seo.title}
                  onChange={(e) => setFormData({
                    ...formData,
                    seo: { ...formData.seo, title: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  maxLength={60}
                  placeholder="留空则使用文章标题"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {formData.seo.title.length}/60 字符
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  SEO 描述
                </label>
                <textarea
                  value={formData.seo.description}
                  onChange={(e) => setFormData({
                    ...formData,
                    seo: { ...formData.seo, description: e.target.value }
                  })}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  maxLength={160}
                  placeholder="留空则使用文章摘要"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {formData.seo.description.length}/160 字符
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  SEO 关键词
                </label>
                <input
                  type="text"
                  value={formData.seo.keywords}
                  onChange={(e) => setFormData({
                    ...formData,
                    seo: { ...formData.seo, keywords: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="关键词1, 关键词2, 关键词3"
                />
                <p className="text-xs text-slate-500 mt-1">
                  用逗号分隔多个关键词
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogManagePage;
