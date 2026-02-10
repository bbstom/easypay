import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Eye, Tag, ArrowLeft, Share2 } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import SEOHead from '../components/SEOHead';

const BlogDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageSettings, setImageSettings] = useState({
    maxWidth: '100%',
    maxHeight: '500px',
    coverMaxHeight: '500px'
  });

  useEffect(() => {
    fetchBlog();
    fetchImageSettings();
  }, [slug]);

  const fetchImageSettings = async () => {
    try {
      const { data } = await axios.get('/api/settings/public');
      setImageSettings({
        maxWidth: data.blogImageMaxWidth || '100%',
        maxHeight: data.blogImageMaxHeight || '500px',
        coverMaxHeight: data.blogCoverMaxHeight || '500px'
      });
    } catch (error) {
      console.error('获取图片配置失败:', error);
    }
  };

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/blog/${slug}`);
      setBlog(data.blog);
      setRelatedBlogs(data.relatedBlogs || []);
      
      // 增加阅读量
      await axios.post(`/api/blog/${slug}/view`);
    } catch (error) {
      console.error('获取文章失败:', error);
      navigate('/blog');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        text: blog.excerpt,
        url: window.location.href
      });
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!blog) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-24">
      <SEOHead
        title={`${blog.seo?.title || blog.title} - EasyPay 博客`}
        description={blog.seo?.description || blog.excerpt}
        keywords={blog.seo?.keywords || blog.tags?.map(t => t.name) || []}
        ogImage={blog.coverImage}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": blog.title,
          "description": blog.excerpt,
          "image": blog.coverImage,
          "datePublished": blog.publishedAt,
          "dateModified": blog.updatedAt,
          "author": {
            "@type": "Person",
            "name": blog.author?.username || "EasyPay"
          }
        }}
      />

      {/* 文章头部 */}
      <article className="py-8">
        <div className="max-w-4xl mx-auto px-6">
          {/* 返回按钮 */}
          <button
            onClick={() => navigate('/blog')}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors mb-8 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">返回博客列表</span>
          </button>

          {/* 分类和标签 */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="px-4 py-1.5 bg-blue-500 text-white text-sm font-bold rounded-full">
              {blog.category?.name}
            </span>
            {blog.tags?.map((tag) => (
              <span
                key={tag._id}
                className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-full flex items-center gap-1"
              >
                <Tag size={12} />
                {tag.name}
              </span>
            ))}
          </div>

          {/* 标题 */}
          <h1 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 leading-tight">
            {blog.title}
          </h1>

          {/* 元信息 */}
          <div className="flex flex-wrap items-center gap-6 text-slate-600 mb-8 pb-8 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <span>{new Date(blog.publishedAt).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye size={18} />
              <span>{blog.views} 次阅读</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📖 约 {blog.readingTime || Math.ceil(blog.content.split(/\s+/).length / 200)} 分钟</span>
            </div>
            <button
              onClick={handleShare}
              className="ml-auto flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Share2 size={18} />
              <span>分享</span>
            </button>
          </div>

          {/* 封面图 */}
          {blog.coverImage && (
            <div 
              className="rounded-2xl overflow-hidden mb-12 bg-gradient-to-br from-blue-100 to-cyan-100"
              style={{ 
                maxHeight: imageSettings.coverMaxHeight === 'none' ? 'none' : imageSettings.coverMaxHeight 
              }}
            >
              <img
                src={blog.coverImage}
                alt={blog.title}
                className="w-full h-full object-cover"
                style={{ 
                  maxHeight: imageSettings.coverMaxHeight === 'none' ? 'none' : imageSettings.coverMaxHeight,
                  objectFit: 'cover'
                }}
              />
            </div>
          )}

          {/* 文章内容 */}
          <div className="prose prose-lg max-w-none 
            prose-headings:font-bold prose-headings:text-slate-900
            prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-8
            prose-h2:text-3xl prose-h2:mb-4 prose-h2:mt-8 prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-200
            prose-h3:text-2xl prose-h3:mb-3 prose-h3:mt-6
            prose-h4:text-xl prose-h4:mb-2 prose-h4:mt-4
            prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-4
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-slate-900 prose-strong:font-bold
            prose-code:text-pink-600 prose-code:bg-pink-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
            prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
            prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-slate-600
            prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4
            prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4
            prose-li:text-slate-700 prose-li:mb-2
            prose-table:w-full prose-table:border-collapse prose-table:my-6
            prose-th:bg-slate-100 prose-th:p-3 prose-th:text-left prose-th:font-bold prose-th:border prose-th:border-slate-300
            prose-td:p-3 prose-td:border prose-td:border-slate-300
            prose-img:max-w-full prose-img:h-auto prose-img:rounded-lg prose-img:shadow-lg prose-img:my-6
            prose-hr:my-8 prose-hr:border-slate-300
          ">
            <ReactMarkdown
              components={{
                // 自定义图片渲染
                img: ({node, ...props}) => {
                  const maxHeight = imageSettings.maxHeight === 'none' ? 'none' : imageSettings.maxHeight;
                  const maxWidth = imageSettings.maxWidth === 'none' ? 'none' : imageSettings.maxWidth;
                  
                  return (
                    <img 
                      {...props} 
                      className="max-w-full h-auto rounded-lg shadow-lg my-6 mx-auto"
                      style={{ 
                        maxHeight: maxHeight,
                        maxWidth: maxWidth,
                        objectFit: 'contain' 
                      }}
                      alt={props.alt || ''}
                    />
                  );
                },
                // 自定义代码块渲染
                code: ({node, inline, className, children, ...props}) => {
                  if (inline) {
                    return (
                      <code className="text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
                // 自定义表格渲染
                table: ({node, ...props}) => (
                  <div className="overflow-x-auto my-6">
                    <table className="w-full border-collapse" {...props} />
                  </div>
                ),
                // 自定义链接渲染
                a: ({node, ...props}) => (
                  <a 
                    className="text-blue-600 hover:underline font-medium" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    {...props} 
                  />
                ),
                // 自定义标题渲染（添加锚点）
                h2: ({node, children, ...props}) => {
                  const id = children?.toString().toLowerCase().replace(/\s+/g, '-');
                  return (
                    <h2 id={id} className="scroll-mt-24" {...props}>
                      {children}
                    </h2>
                  );
                },
                h3: ({node, children, ...props}) => {
                  const id = children?.toString().toLowerCase().replace(/\s+/g, '-');
                  return (
                    <h3 id={id} className="scroll-mt-24" {...props}>
                      {children}
                    </h3>
                  );
                }
              }}
            >
              {blog.content}
            </ReactMarkdown>
          </div>

          {/* 文章底部 */}
          <div className="mt-12 pt-8 border-t border-slate-200">
            <div className="flex flex-wrap gap-2">
              <span className="text-slate-600 font-semibold">标签：</span>
              {blog.tags?.map((tag) => (
                <button
                  key={tag._id}
                  onClick={() => navigate(`/blog?tag=${tag.slug}`)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded-full transition-colors"
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </article>

      {/* 相关文章 */}
      {relatedBlogs.length > 0 && (
        <section className="py-12 bg-slate-50">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-black text-slate-900 mb-6">相关文章</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedBlogs.map((relatedBlog) => (
                <article
                  key={relatedBlog._id}
                  onClick={() => navigate(`/blog/${relatedBlog.slug}`)}
                  className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full inline-block mb-3">
                    {relatedBlog.category?.name}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {relatedBlog.title}
                  </h3>
                  <p className="text-slate-600 text-sm line-clamp-2">
                    {relatedBlog.excerpt}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default BlogDetailPage;
