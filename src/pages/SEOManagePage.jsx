import { useState, useEffect } from 'react';
import { RefreshCw, FileText, Map, Bot, CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';

export default function SEOManagePage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState({});
  const [message, setMessage] = useState(null);

  // 获取状态
  const fetchStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/seo/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStatus(data);
      }
    } catch (error) {
      console.error('获取状态失败:', error);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // 生成所有文件
  const generateAll = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/seo/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: '所有静态文件生成成功！' });
        await fetchStatus();
      } else {
        setMessage({ type: 'error', text: data.message || '生成失败' });
      }
    } catch (error) {
      console.error('生成失败:', error);
      setMessage({ type: 'error', text: '生成失败：' + error.message });
    } finally {
      setLoading(false);
    }
  };

  // 生成单个文件
  const generateSingle = async (type) => {
    setGenerating({ ...generating, [type]: true });
    setMessage(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/seo/generate/${type}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: `${type} 生成成功！` });
        await fetchStatus();
      } else {
        setMessage({ type: 'error', text: data.message || '生成失败' });
      }
    } catch (error) {
      console.error('生成失败:', error);
      setMessage({ type: 'error', text: '生成失败：' + error.message });
    } finally {
      setGenerating({ ...generating, [type]: false });
    }
  };

  // 格式化文件大小
  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // 格式化时间
  const formatTime = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('zh-CN', { 
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const files = [
    {
      key: 'landing.html',
      name: '首页静态 HTML',
      description: '搜索引擎爬虫访问时显示的静态首页',
      icon: FileText,
      color: 'text-blue-500',
      generateType: 'homepage'
    },
    {
      key: 'sitemap.xml',
      name: 'Sitemap',
      description: '网站地图，帮助搜索引擎索引网站',
      icon: Map,
      color: 'text-green-500',
      generateType: 'sitemap'
    },
    {
      key: 'robots.txt',
      name: 'Robots.txt',
      description: '搜索引擎爬虫规则文件',
      icon: Bot,
      color: 'text-purple-500',
      generateType: 'robots'
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">SEO 管理</h1>
            <p className="text-gray-600 mt-1">生成和管理静态页面、sitemap 和 robots.txt</p>
          </div>
          <button
            onClick={generateAll}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? '生成中...' : '生成所有文件'}
          </button>
        </div>

        {/* 消息提示 */}
        {message && (
          <div className={`p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              <span>{message.text}</span>
            </div>
          </div>
        )}

        {/* 配置信息 */}
        {status && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">配置信息</h3>
            <div className="space-y-1 text-sm text-blue-800">
              <p><strong>域名：</strong>{status.domain}</p>
              <p><strong>输出目录：</strong>{status.distPath}</p>
            </div>
          </div>
        )}

        {/* 文件列表 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {files.map((file) => {
            const fileStatus = status?.files?.[file.key];
            const Icon = file.icon;
            const isGenerating = generating[file.generateType];

            return (
              <div key={file.key} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-8 h-8 ${file.color}`} />
                    <div>
                      <h3 className="font-semibold text-gray-900">{file.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{file.description}</p>
                    </div>
                  </div>
                </div>

                {/* 文件状态 */}
                {fileStatus ? (
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      {fileStatus.exists ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-green-600">已生成</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-500">未生成</span>
                        </>
                      )}
                    </div>
                    {fileStatus.exists && (
                      <>
                        <div className="text-sm text-gray-600">
                          <strong>大小：</strong>{formatSize(fileStatus.size)}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(fileStatus.modified)}</span>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="mb-4 text-sm text-gray-500">加载中...</div>
                )}

                {/* 操作按钮 */}
                <div className="flex gap-2">
                  <button
                    onClick={() => generateSingle(file.generateType)}
                    disabled={isGenerating}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                    {isGenerating ? '生成中...' : '重新生成'}
                  </button>
                  {fileStatus?.exists && (
                    <a
                      href={`/${file.key}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      查看
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 使用说明 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">使用说明</h3>
          <div className="space-y-4 text-sm text-gray-600">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">1. 生成静态文件</h4>
              <p>点击"生成所有文件"按钮，系统会自动生成首页静态 HTML、sitemap.xml 和 robots.txt 文件。</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">2. 配置 Nginx</h4>
              <p>在 Nginx 配置中添加以下规则，让搜索引擎爬虫访问静态页面：</p>
              <pre className="bg-gray-50 p-3 rounded mt-2 overflow-x-auto text-xs">
{`location / {
    root /path/to/easypay/dist;
    
    # 检测搜索引擎爬虫
    set $is_bot 0;
    if ($http_user_agent ~* "googlebot|bingbot|baiduspider|yandex") {
        set $is_bot 1;
    }
    
    # 爬虫访问首页时返回静态页面
    if ($is_bot = 1) {
        rewrite ^/$ /landing.html last;
    }
    
    # 普通用户正常访问
    try_files $uri $uri/ /index.html;
}`}
              </pre>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">3. 提交到搜索引擎</h4>
              <p>将生成的 sitemap.xml 提交到各大搜索引擎：</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Google Search Console: <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://search.google.com/search-console</a></li>
                <li>百度站长平台: <a href="https://ziyuan.baidu.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://ziyuan.baidu.com/</a></li>
                <li>必应网站管理员: <a href="https://www.bing.com/webmasters" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://www.bing.com/webmasters</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">4. 验证效果</h4>
              <p>使用以下命令验证搜索引擎爬虫能否看到内容：</p>
              <pre className="bg-gray-50 p-3 rounded mt-2 overflow-x-auto text-xs">
{`curl -A "Mozilla/5.0 (compatible; Googlebot/2.1)" ${status?.domain || 'https://your-domain.com'}/`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
