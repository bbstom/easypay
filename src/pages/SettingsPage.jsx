import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Save, RefreshCw } from 'lucide-react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';
import { AlipayIcon, WechatIcon } from '../components/Icons';

const SettingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rateInfo, setRateInfo] = useState(null);
  const [refreshingRates, setRefreshingRates] = useState(false);

  // 从URL获取当前tab
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'site';

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchSettings();
    fetchRateInfo();
  }, [user, navigate]);

  const fetchSettings = async () => {
    try {
      const { data } = await axios.get('/api/settings');
      setSettings(data);
    } catch (error) {
      console.error('获取设置失败:', error);
    }
  };

  const fetchRateInfo = async () => {
    try {
      const { data } = await axios.get('/api/settings/rate-info');
      setRateInfo(data);
    } catch (error) {
      console.error('获取汇率信息失败:', error);
    }
  };

  const handleRefreshRates = async () => {
    setRefreshingRates(true);
    try {
      const { data } = await axios.post('/api/settings/refresh-rates');
      alert('汇率更新成功！\nUSDT: ' + data.rates.USDT + ' CNY\nTRX: ' + data.rates.TRX + ' CNY');
      await fetchSettings();
      await fetchRateInfo();
    } catch (error) {
      alert('汇率更新失败: ' + (error.response?.data?.error || error.message));
    } finally {
      setRefreshingRates(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.put('/api/settings', settings);
      
      // 如果是实时汇率模式，保存后自动刷新汇率以应用新的加成
      if (settings.exchangeRateMode === 'realtime') {
        try {
          await axios.post('/api/settings/refresh-rates');
          await fetchRateInfo();
        } catch (error) {
          console.error('刷新汇率失败:', error);
        }
      }
      
      alert('设置保存成功！');
    } catch (error) {
      alert('保存失败: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') return null;
  if (!settings) return <div className="pt-32 text-center">加载中...</div>;

  return (
    <AdminLayout>
      {/* 保存按钮 */}
      <div className="flex justify-end mb-6">
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-green-600 transition-all disabled:opacity-50"
        >
          <Save size={20} /> {loading ? '保存中...' : '保存设置'}
        </button>
      </div>

      {/* 内容区域 */}
      <div className="bg-white rounded-xl border border-slate-200 p-8">{/* 网站信息 */}
            {activeTab === 'site' && (
              <div className="space-y-6">
                <h2 className="text-xl font-black text-slate-800 mb-4">网站基本信息</h2>
                
                <div>
                  <label className="text-sm font-bold text-slate-600 block mb-2">网站名称</label>
                  <input
                    type="text"
                    value={settings.siteName || ''}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-600 block mb-2">网站描述</label>
                  <textarea
                    value={settings.siteDescription || ''}
                    onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-600 block mb-2">SEO标题</label>
                  <input
                    type="text"
                    value={settings.seoTitle || ''}
                    onChange={(e) => setSettings({ ...settings, seoTitle: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-600 block mb-2">SEO描述</label>
                  <textarea
                    value={settings.seoDescription || ''}
                    onChange={(e) => setSettings({ ...settings, seoDescription: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                    rows="3"
                  />
                </div>
              </div>
            )}

            {/* 主页图片 */}
            {activeTab === 'hero' && (
              <div className="space-y-6">
                <h2 className="text-xl font-black text-slate-800 mb-4">主页展示图片</h2>
                
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    💡 设置主页右侧展示的图片，建议使用高质量的横向图片，推荐尺寸：1200x800 或更大
                  </p>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-600 block mb-2">图片URL</label>
                  <input
                    type="url"
                    value={settings.homeHeroImage || ''}
                    onChange={(e) => setSettings({ ...settings, homeHeroImage: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-slate-500 mt-1">输入图片的完整URL地址</p>
                </div>

                {settings.homeHeroImage && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-slate-700 mb-3">图片预览</h3>
                    <div className="relative bg-white/40 backdrop-blur-xl border border-white p-3 rounded-3xl shadow-lg max-w-md">
                      <img 
                        src={settings.homeHeroImage} 
                        alt="主页展示图片预览" 
                        className="rounded-2xl shadow-sm grayscale-[0.5] opacity-90 w-full"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="hidden items-center justify-center h-48 bg-slate-100 rounded-2xl">
                        <p className="text-sm text-slate-500">图片加载失败，请检查URL是否正确</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-3">
                      💡 提示：图片会自动应用灰度和透明度效果，与主页风格保持一致
                    </p>
                  </div>
                )}

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <h3 className="text-sm font-bold text-slate-700 mb-2">推荐图片来源</h3>
                  <div className="text-xs text-slate-600 space-y-1">
                    <p>• Unsplash: <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:underline">unsplash.com</a> (免费高质量图片)</p>
                    <p>• Pexels: <a href="https://pexels.com" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:underline">pexels.com</a> (免费商用图片)</p>
                    <p>• 自己的服务器或CDN上传的图片</p>
                  </div>
                </div>
              </div>
            )}

            {/* 社交媒体 */}
            {activeTab === 'social' && (
              <div className="space-y-6">
                <h2 className="text-xl font-black text-slate-800 mb-4">社交媒体链接</h2>
                
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    💡 配置社交媒体链接后，将在网站Footer显示对应的图标
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-slate-600 block mb-2">Twitter</label>
                    <input
                      type="url"
                      value={settings.socialTwitter || ''}
                      onChange={(e) => setSettings({ ...settings, socialTwitter: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                      placeholder="https://twitter.com/yourcompany"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-600 block mb-2">Facebook</label>
                    <input
                      type="url"
                      value={settings.socialFacebook || ''}
                      onChange={(e) => setSettings({ ...settings, socialFacebook: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                      placeholder="https://facebook.com/yourcompany"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-600 block mb-2">Telegram</label>
                    <input
                      type="url"
                      value={settings.socialTelegram || ''}
                      onChange={(e) => setSettings({ ...settings, socialTelegram: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                      placeholder="https://t.me/yourcompany"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-600 block mb-2">微信</label>
                    <input
                      type="text"
                      value={settings.socialWeChat || ''}
                      onChange={(e) => setSettings({ ...settings, socialWeChat: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                      placeholder="微信号或二维码链接"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-600 block mb-2">联系邮箱</label>
                    <input
                      type="email"
                      value={settings.socialEmail || ''}
                      onChange={(e) => setSettings({ ...settings, socialEmail: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                      placeholder="contact@yourcompany.com"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TG客服 */}
            {activeTab === 'telegram' && (
              <div className="space-y-6">
                <h2 className="text-xl font-black text-slate-800 mb-4">TG客服配置</h2>
                
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    💡 配置TG客服地址后，将在网站导航栏显示TG客服入口
                  </p>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-600 block mb-2">TG客服地址</label>
                  <input
                    type="text"
                    value={settings.telegramCustomerService || ''}
                    onChange={(e) => setSettings({ ...settings, telegramCustomerService: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                    placeholder="https://t.me/your_customer_service"
                  />
                  <p className="text-xs text-slate-500 mt-1">例如：https://t.me/your_username</p>
                </div>
              </div>
            )}

            {/* 运行时间 */}
            {activeTab === 'runtime' && (
              <div className="space-y-6">
                <h2 className="text-xl font-black text-slate-800 mb-4">运行时间配置</h2>
                
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-green-800">
                    💡 设置系统运行起始时间，将在网站底部显示系统已运行的天数、小时、分钟和秒数
                  </p>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-600 block mb-2">系统运行起始时间</label>
                  <input
                    type="datetime-local"
                    value={settings.systemStartTime ? new Date(settings.systemStartTime).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setSettings({ ...settings, systemStartTime: new Date(e.target.value).toISOString() })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">选择系统开始运行的日期和时间</p>
                </div>

                {settings.systemStartTime && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-slate-700 mb-2">当前设置</h3>
                    <p className="text-sm text-slate-600">
                      起始时间：{new Date(settings.systemStartTime).toLocaleString('zh-CN')}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      系统将从这个时间开始计算运行时长
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Footer设置 */}
            {activeTab === 'footer' && (
              <div className="space-y-6">
                <h2 className="text-xl font-black text-slate-800 mb-4">Footer自定义设置</h2>
                
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    💡 自定义网站Footer的显示内容，包括公司名称、描述、版权信息和导航链接
                  </p>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-600 block mb-2">公司名称</label>
                  <input
                    type="text"
                    value={settings.footerCompanyName || 'FASTPAY'}
                    onChange={(e) => setSettings({ ...settings, footerCompanyName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                    placeholder="FASTPAY"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-600 block mb-2">公司描述</label>
                  <textarea
                    value={settings.footerDescription || ''}
                    onChange={(e) => setSettings({ ...settings, footerDescription: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                    rows="3"
                    placeholder="领先的自动化代付协议，为 TRON 生态提供安全、快速、便捷的 USDT 和 TRX 代付服务。"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-600 block mb-2">版权信息</label>
                  <input
                    type="text"
                    value={settings.footerCopyright || ''}
                    onChange={(e) => setSettings({ ...settings, footerCopyright: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                    placeholder="© 2024 FastPay. All rights reserved."
                  />
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-lg font-black text-slate-800 mb-4">Footer导航菜单 (JSON格式)</h3>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-2">
                    <p className="text-xs text-slate-600 mb-2">格式示例：</p>
                    <pre className="text-xs text-slate-700 overflow-x-auto">
{`[
  {
    "title": "产品服务",
    "links": [
      { "name": "USDT 代付", "url": "#" },
      { "name": "TRX 代付", "url": "#" }
    ]
  }
]`}
                    </pre>
                  </div>
                  <textarea
                    value={settings.footerLinks || ''}
                    onChange={(e) => setSettings({ ...settings, footerLinks: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none font-mono text-sm"
                    rows="8"
                  />
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-lg font-black text-slate-800 mb-4">Footer底部链接 (JSON格式)</h3>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-2">
                    <p className="text-xs text-slate-600 mb-2">格式示例：</p>
                    <pre className="text-xs text-slate-700 overflow-x-auto">
{`[
  { "name": "隐私政策", "url": "#" },
  { "name": "服务协议", "url": "#" }
]`}
                    </pre>
                  </div>
                  <textarea
                    value={settings.footerBottomLinks || ''}
                    onChange={(e) => setSettings({ ...settings, footerBottomLinks: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none font-mono text-sm"
                    rows="4"
                  />
                </div>
              </div>
            )}

            {/* 费率设置 */}
            {activeTab === 'fee' && (
              <div className="space-y-6">
                <h2 className="text-xl font-black text-slate-800 mb-4">服务费设置</h2>
                
                <div>
                  <label className="text-sm font-bold text-slate-600 block mb-2">费率类型</label>
                  <select
                    value={settings.feeType}
                    onChange={(e) => setSettings({ ...settings, feeType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                  >
                    <option value="fixed">固定费用</option>
                    <option value="percentage">百分比费率</option>
                  </select>
                </div>

                {settings.feeType === 'fixed' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-slate-600 block mb-2">USDT 服务费 (CNY)</label>
                      <input
                        type="number"
                        value={settings.feeUSDT}
                        onChange={(e) => setSettings({ ...settings, feeUSDT: parseFloat(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-600 block mb-2">TRX 服务费 (CNY)</label>
                      <input
                        type="number"
                        value={settings.feeTRX}
                        onChange={(e) => setSettings({ ...settings, feeTRX: parseFloat(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-bold text-slate-600 block mb-2">服务费百分比 (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={settings.feePercentage}
                      onChange={(e) => setSettings({ ...settings, feePercentage: parseFloat(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                    />
                  </div>
                )}
              </div>
            )}

            {/* 汇率设置 */}
            {activeTab === 'exchange' && (
              <div className="space-y-6">
                <h2 className="text-xl font-black text-slate-800 mb-4">汇率设置</h2>
                
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    💡 实时汇率模式：自动从CoinGecko获取最新汇率（每小时更新）<br/>
                    手动模式：使用您设置的固定汇率
                  </p>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-600 block mb-2">汇率模式</label>
                  <select
                    value={settings.exchangeRateMode}
                    onChange={(e) => setSettings({ ...settings, exchangeRateMode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                  >
                    <option value="realtime">实时汇率（推荐）</option>
                    <option value="manual">手动设置</option>
                  </select>
                </div>

                {settings.exchangeRateMode === 'realtime' && rateInfo && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-green-800">当前实时汇率</h3>
                      <button
                        onClick={handleRefreshRates}
                        disabled={refreshingRates}
                        className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 flex items-center gap-1"
                      >
                        <RefreshCw size={12} className={refreshingRates ? 'animate-spin' : ''} />
                        {refreshingRates ? '更新中...' : '手动更新'}
                      </button>
                    </div>
                    
                    {rateInfo.originalRates?.USDT ? (
                      <>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-green-700 font-medium">USDT:</span>
                            <span className="text-green-900 font-bold ml-2">{rateInfo.originalRates.USDT} CNY</span>
                          </div>
                          <div>
                            <span className="text-green-700 font-medium">TRX:</span>
                            <span className="text-green-900 font-bold ml-2">{rateInfo.originalRates.TRX} CNY</span>
                          </div>
                        </div>
                        
                        {settings.exchangeRateMarkup > 0 && (
                          <div className="mt-3 pt-3 border-t border-green-200">
                            <p className="text-xs text-green-700 font-medium mb-1">加成后汇率 (+{settings.exchangeRateMarkup}%):</p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-green-700 font-medium">USDT:</span>
                                <span className="text-green-900 font-bold ml-2">
                                  {(rateInfo.originalRates.USDT * (1 + settings.exchangeRateMarkup / 100)).toFixed(4)} CNY
                                </span>
                              </div>
                              <div>
                                <span className="text-green-700 font-medium">TRX:</span>
                                <span className="text-green-900 font-bold ml-2">
                                  {(rateInfo.originalRates.TRX * (1 + settings.exchangeRateMarkup / 100)).toFixed(4)} CNY
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {rateInfo.lastUpdate && (
                          <p className="text-xs text-green-600 mt-3">
                            最后更新: {new Date(rateInfo.lastUpdate).toLocaleString('zh-CN')}
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="text-sm text-green-700">
                        <p>暂无汇率数据，请点击"手动更新"获取最新汇率</p>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="text-sm font-bold text-slate-600 block mb-2">
                    汇率加成 (%)
                    <span className="text-xs text-slate-400 ml-2">在实时汇率基础上增加的百分比</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.exchangeRateMarkup}
                    onChange={(e) => setSettings({ ...settings, exchangeRateMarkup: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                    placeholder="例如: 5 表示在实时汇率基础上+5%"
                  />
                </div>

                {settings.exchangeRateMode === 'manual' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-slate-600 block mb-2">USDT 汇率 (CNY)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={settings.exchangeRateUSDT}
                        onChange={(e) => setSettings({ ...settings, exchangeRateUSDT: parseFloat(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-600 block mb-2">TRX 汇率 (CNY)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={settings.exchangeRateTRX}
                        onChange={(e) => setSettings({ ...settings, exchangeRateTRX: parseFloat(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 闪兑设置 */}
            {activeTab === 'swap' && (
              <div className="space-y-6">
                <h2 className="text-xl font-black text-slate-800 mb-4">USDT闪兑TRX设置</h2>
                
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    💡 闪兑功能允许用户直接用USDT兑换TRX，系统自动处理转账<br/>
                    闪兑汇率独立于代付汇率，可以单独设置
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <span className="font-bold text-slate-700">启用闪兑功能</span>
                    <p className="text-xs text-slate-500 mt-1">关闭后用户将无法访问闪兑页面</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.swapEnabled}
                      onChange={(e) => setSettings({ ...settings, swapEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#00A3FF]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00A3FF]"></div>
                  </label>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-600 block mb-2">闪兑汇率模式</label>
                  <select
                    value={settings.swapRateMode}
                    onChange={(e) => setSettings({ ...settings, swapRateMode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                  >
                    <option value="manual">手动设置</option>
                    <option value="realtime">实时计算（基于代付汇率）</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-2">
                    手动模式：直接设置 1 USDT = X TRX<br/>
                    实时模式：根据代付汇率自动计算（TRX的CNY价格 / USDT的CNY价格）
                  </p>
                </div>

                {settings.swapRateMode === 'manual' ? (
                  <div>
                    <label className="text-sm font-bold text-slate-600 block mb-2">
                      闪兑汇率（1 USDT = ? TRX）
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={settings.swapRateUSDTtoTRX}
                      onChange={(e) => setSettings({ ...settings, swapRateUSDTtoTRX: parseFloat(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                      placeholder="例如: 6.7"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      示例：设置为 6.7，表示用户用 1 USDT 可以换到 6.7 TRX（加成前）
                    </p>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-green-800 mb-2">实时计算汇率</h3>
                    {rateInfo && rateInfo.originalRates?.USDT && rateInfo.originalRates?.TRX ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-green-700">USDT汇率:</span>
                          <span className="font-bold text-green-900">{rateInfo.originalRates.USDT} CNY</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">TRX汇率:</span>
                          <span className="font-bold text-green-900">{rateInfo.originalRates.TRX} CNY</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-green-200">
                          <span className="text-green-700">计算结果 (1 USDT):</span>
                          <span className="font-bold text-green-900">
                            {(rateInfo.originalRates.TRX / rateInfo.originalRates.USDT).toFixed(6)} TRX
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-green-700">请先在"汇率设置"中获取实时汇率</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="text-sm font-bold text-slate-600 block mb-2">
                    闪兑汇率加成 (%)
                    <span className="text-xs text-slate-400 ml-2">用户换到的TRX会减少这个百分比</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.swapRateMarkup}
                    onChange={(e) => setSettings({ ...settings, swapRateMarkup: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                    placeholder="例如: 2 表示用户换到的TRX减少2%"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    示例：基础汇率 6.7 TRX/USDT，加成2%后，用户实际得到 6.566 TRX
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-slate-600 block mb-2">最小兑换金额 (USDT)</label>
                    <input
                      type="number"
                      value={settings.swapMinAmount}
                      onChange={(e) => setSettings({ ...settings, swapMinAmount: parseFloat(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-600 block mb-2">最大兑换金额 (USDT)</label>
                    <input
                      type="number"
                      value={settings.swapMaxAmount}
                      onChange={(e) => setSettings({ ...settings, swapMaxAmount: parseFloat(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-600 block mb-2">订单超时时间 (分钟)</label>
                  <input
                    type="number"
                    value={settings.swapOrderTimeout}
                    onChange={(e) => setSettings({ ...settings, swapOrderTimeout: parseInt(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    用户需要在此时间内完成USDT转账，否则订单自动取消
                  </p>
                </div>

                <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4">
                  <h3 className="text-sm font-bold text-cyan-800 mb-2">最终闪兑汇率预览</h3>
                  <div className="space-y-2 text-sm">
                    {settings.swapRateMode === 'manual' ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-cyan-700">基础汇率:</span>
                          <span className="font-bold text-cyan-900">{settings.swapRateUSDTtoTRX} TRX/USDT</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-cyan-700">加成:</span>
                          <span className="font-bold text-cyan-900">{settings.swapRateMarkup}%</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-cyan-200">
                          <span className="text-cyan-700">用户实际得到 (1 USDT):</span>
                          <span className="font-bold text-cyan-900">
                            {(settings.swapRateUSDTtoTRX * (1 - settings.swapRateMarkup / 100)).toFixed(6)} TRX
                          </span>
                        </div>
                      </>
                    ) : rateInfo && rateInfo.originalRates?.USDT && rateInfo.originalRates?.TRX ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-cyan-700">基础汇率:</span>
                          <span className="font-bold text-cyan-900">
                            {(rateInfo.originalRates.TRX / rateInfo.originalRates.USDT).toFixed(6)} TRX/USDT
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-cyan-700">加成:</span>
                          <span className="font-bold text-cyan-900">{settings.swapRateMarkup}%</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-cyan-200">
                          <span className="text-cyan-700">用户实际得到 (1 USDT):</span>
                          <span className="font-bold text-cyan-900">
                            {((rateInfo.originalRates.TRX / rateInfo.originalRates.USDT) * (1 - settings.swapRateMarkup / 100)).toFixed(6)} TRX
                          </span>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-cyan-700">请先配置汇率</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 支付配置 */}
            {activeTab === 'payment' && (
              <div className="space-y-6">
                <h2 className="text-xl font-black text-slate-800 mb-4">支付平台配置</h2>
                
                <div>
                  <label className="text-sm font-bold text-slate-600 block mb-2">API版本</label>
                  <select
                    value={settings.paymentApiVersion}
                    onChange={(e) => setSettings({ ...settings, paymentApiVersion: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                  >
                    <option value="v1">V1 (旧版)</option>
                    <option value="v2">V2 (新版)</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-600 block mb-2">API地址</label>
                  <input
                    type="url"
                    value={settings.paymentApiUrl}
                    onChange={(e) => setSettings({ ...settings, paymentApiUrl: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-600 block mb-2">商户ID</label>
                  <input
                    type="text"
                    value={settings.paymentMerchantId}
                    onChange={(e) => setSettings({ ...settings, paymentMerchantId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-600 block mb-2">
                    {settings.paymentApiVersion === 'v2' ? '商户私钥' : 'MD5密钥'}
                  </label>
                  <textarea
                    value={settings.paymentApiKey}
                    onChange={(e) => setSettings({ ...settings, paymentApiKey: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none font-mono text-sm"
                    rows="4"
                  />
                </div>

                {settings.paymentApiVersion === 'v2' && (
                  <div>
                    <label className="text-sm font-bold text-slate-600 block mb-2">平台公钥</label>
                    <textarea
                      value={settings.paymentPublicKey}
                      onChange={(e) => setSettings({ ...settings, paymentPublicKey: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none font-mono text-sm"
                      rows="4"
                    />
                  </div>
                )}

                <div>
                  <label className="text-sm font-bold text-slate-600 block mb-2">回调地址</label>
                  <input
                    type="url"
                    value={settings.paymentNotifyUrl}
                    onChange={(e) => setSettings({ ...settings, paymentNotifyUrl: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                  />
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-lg font-black text-slate-800 mb-4">支付方式开关</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <AlipayIcon className="w-8 h-8" />
                        <span className="font-bold text-slate-700">支付宝</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.paymentAlipayEnabled}
                          onChange={(e) => setSettings({ ...settings, paymentAlipayEnabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#00A3FF]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00A3FF]"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <WechatIcon className="w-8 h-8" />
                        <span className="font-bold text-slate-700">微信支付</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.paymentWechatEnabled}
                          onChange={(e) => setSettings({ ...settings, paymentWechatEnabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#00A3FF]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00A3FF]"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 邮件配置 */}
            {activeTab === 'email' && (
              <div className="space-y-6">
                <h2 className="text-xl font-black text-slate-800 mb-4">SMTP邮件配置</h2>
                
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    💡 配置SMTP后，系统将在订单完成时自动发送邮件通知给用户（如果用户填写了邮箱）
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-slate-600 block mb-2">SMTP服务器</label>
                    <input
                      type="text"
                      value={settings.smtpHost || ''}
                      onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-600 block mb-2">SMTP端口</label>
                    <input
                      type="number"
                      value={settings.smtpPort || 465}
                      onChange={(e) => setSettings({ ...settings, smtpPort: parseInt(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-600 block mb-2">使用SSL/TLS</label>
                  <select
                    value={settings.smtpSecure ? 'true' : 'false'}
                    onChange={(e) => setSettings({ ...settings, smtpSecure: e.target.value === 'true' })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                  >
                    <option value="true">是 (推荐，端口465)</option>
                    <option value="false">否 (端口587)</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-600 block mb-2">SMTP用户名</label>
                  <input
                    type="text"
                    value={settings.smtpUser || ''}
                    onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                    placeholder="your-email@gmail.com"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-600 block mb-2">SMTP密码</label>
                  <input
                    type="password"
                    value={settings.smtpPass || ''}
                    onChange={(e) => setSettings({ ...settings, smtpPass: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                    placeholder="应用专用密码"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-slate-600 block mb-2">发件人名称</label>
                    <input
                      type="text"
                      value={settings.smtpFromName || 'FastPay'}
                      onChange={(e) => setSettings({ ...settings, smtpFromName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-600 block mb-2">发件人邮箱</label>
                    <input
                      type="email"
                      value={settings.smtpFromEmail || ''}
                      onChange={(e) => setSettings({ ...settings, smtpFromEmail: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                      placeholder="noreply@yourdomain.com"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-6">
                  <h3 className="text-sm font-bold text-slate-700 mb-2">常用SMTP配置参考</h3>
                  <div className="text-xs text-slate-600 space-y-1">
                    <p>• Gmail: smtp.gmail.com, 端口465 (SSL) 或 587 (TLS)</p>
                    <p>• QQ邮箱: smtp.qq.com, 端口465 (SSL) 或 587 (TLS)</p>
                    <p>• 163邮箱: smtp.163.com, 端口465 (SSL) 或 25 (无加密)</p>
                    <p>• Outlook: smtp-mail.outlook.com, 端口587 (TLS)</p>
                  </div>
                </div>
              </div>
            )}

          </div>
    </AdminLayout>
  );
};

export default SettingsPage;
