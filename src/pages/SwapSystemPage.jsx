import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Save, RefreshCw, Eye, EyeOff, ArrowLeft, Trash2 } from 'lucide-react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

const SwapSystemPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rateInfo, setRateInfo] = useState(null);
  const [currentSwapRate, setCurrentSwapRate] = useState(null);
  const [fetchingRate, setFetchingRate] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'swap-rate';
  const [swapWallets, setSwapWallets] = useState([]);
  const [showAddSwapWallet, setShowAddSwapWallet] = useState(false);
  const [selectedSwapWallet, setSelectedSwapWallet] = useState(null);
  const [newSwapWallet, setNewSwapWallet] = useState({
    name: '',
    privateKey: '',
    priority: 50
  });
  const [showSwapPrivateKey, setShowSwapPrivateKey] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchSettings();
    fetchRateInfo();
    loadSwapWallets();
  }, [user, navigate]);

  useEffect(() => {
    if (settings?.swapRateMode === 'realtime') {
      fetchCurrentSwapRate();
    }
  }, [settings?.swapRateMode]);

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

  const fetchCurrentSwapRate = async () => {
    setFetchingRate(true);
    try {
      const { data } = await axios.get('/api/swap/rate');
      setCurrentSwapRate(data);
    } catch (error) {
      console.error('获取闪兑汇率失败:', error);
    } finally {
      setFetchingRate(false);
    }
  };

  const loadSwapWallets = () => {
    if (settings?.swapWallets) {
      try {
        const wallets = JSON.parse(settings.swapWallets);
        setSwapWallets(wallets || []);
      } catch (e) {
        console.error('解析闪兑钱包失败:', e);
        setSwapWallets([]);
      }
    }
  };

  useEffect(() => {
    if (settings) {
      loadSwapWallets();
    }
  }, [settings]);

  const handleAddSwapWallet = async () => {
    if (!newSwapWallet.name || !newSwapWallet.privateKey) {
      alert('请填写钱包名称和私钥');
      return;
    }

    setLoading(true);
    try {
      // 调用后端API添加闪兑钱包
      await axios.post('/api/swap/admin/add-wallet', {
        name: newSwapWallet.name,
        privateKey: newSwapWallet.privateKey,
        priority: newSwapWallet.priority || 50
      });

      alert('闪兑钱包添加成功！');
      setShowAddSwapWallet(false);
      setNewSwapWallet({ name: '', privateKey: '', priority: 50 });
      await fetchSettings();
    } catch (error) {
      alert('添加失败: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSwapWallet = async (walletId) => {
    try {
      await axios.post('/api/swap/admin/toggle-wallet', { walletId });
      await fetchSettings();
    } catch (error) {
      alert('更新失败: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteSwapWallet = async (walletId, walletName) => {
    if (!confirm(`确定要删除闪兑钱包"${walletName}"吗？`)) {
      return;
    }

    try {
      await axios.post('/api/swap/admin/delete-wallet', { walletId });
      alert('删除成功');
      await fetchSettings();
    } catch (error) {
      alert('删除失败: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleViewSwapWallet = (wallet) => {
    setSelectedSwapWallet(wallet);
  };

  const handleBackToSwapList = () => {
    setSelectedSwapWallet(null);
    setShowAddSwapWallet(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.put('/api/settings', settings);
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
      <div className="flex justify-end mb-6">
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-green-600 transition-all disabled:opacity-50"
        >
          <Save size={20} /> {loading ? '保存中...' : '保存设置'}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-8">
        {/* 闪兑钱包管理 */}
        {activeTab === 'swap-wallets' && (
          <div className="space-y-6">
            {selectedSwapWallet ? (
              /* 钱包详情页面 */
              <div>
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={handleBackToSwapList}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
                  >
                    <ArrowLeft size={20} />
                    返回钱包列表
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 左列 */}
                  <div className="space-y-6">
                    {/* 基本信息 */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-4">基本信息</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">钱包名称:</span>
                          <span className="text-sm font-bold text-slate-900">{selectedSwapWallet.name}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm text-slate-600">地址:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-slate-900 break-all">{selectedSwapWallet.address}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(selectedSwapWallet.address);
                                alert('地址已复制');
                              }}
                              className="text-cyan-600 hover:text-cyan-700 text-xs whitespace-nowrap"
                            >
                              [复制]
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">状态:</span>
                          <span className={`text-sm font-bold ${
                            selectedSwapWallet.enabled ? 'text-green-600' : 'text-slate-600'
                          }`}>
                            {selectedSwapWallet.enabled ? '● 已启用' : '○ 已禁用'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">优先级:</span>
                          <span className="text-sm font-bold text-slate-900">{selectedSwapWallet.priority || 50}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">创建时间:</span>
                          <span className="text-xs text-slate-900">{new Date(selectedSwapWallet.createdAt).toLocaleString('zh-CN')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 右列 */}
                  <div className="space-y-6">
                    {/* 使用说明 */}
                    <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
                      <h3 className="text-lg font-bold text-blue-900 mb-3">💡 使用说明</h3>
                      <div className="space-y-2 text-sm text-blue-800">
                        <p>• 用户转 USDT 到此钱包</p>
                        <p>• TRX 从此钱包返回给用户</p>
                        <p>• 请确保钱包有足够的 TRX 余额</p>
                        <p>• 优先级越高越优先使用</p>
                      </div>
                    </div>
                  </div>

                  {/* 操作按钮 - 跨两列 */}
                  <div className="md:col-span-2 flex gap-3">
                    <button
                      onClick={() => handleToggleSwapWallet(selectedSwapWallet.id)}
                      className={`flex-1 px-4 py-3 rounded-lg font-bold transition-all ${
                        selectedSwapWallet.enabled 
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' 
                          : 'bg-green-100 hover:bg-green-200 text-green-700'
                      }`}
                    >
                      {selectedSwapWallet.enabled ? '禁用钱包' : '启用钱包'}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`确定要删除闪兑钱包"${selectedSwapWallet.name}"吗？`)) {
                          handleDeleteSwapWallet(selectedSwapWallet.id, selectedSwapWallet.name);
                          handleBackToSwapList();
                        }
                      }}
                      className="px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-bold transition-all flex items-center gap-2"
                    >
                      <Trash2 size={18} />
                      删除钱包
                    </button>
                  </div>
                </div>
              </div>
            ) : showAddSwapWallet ? (
              /* 添加钱包表单 */
              <div>
                <button
                  onClick={handleBackToSwapList}
                  className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
                >
                  <ArrowLeft size={20} />
                  返回钱包列表
                </button>

                <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">添加闪兑钱包</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-bold text-slate-600 block mb-2">钱包名称</label>
                      <input
                        type="text"
                        value={newSwapWallet.name}
                        onChange={(e) => setNewSwapWallet({ ...newSwapWallet, name: e.target.value })}
                        placeholder="例如: 闪兑钱包1"
                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-bold text-slate-600 block mb-2">私钥</label>
                      <div className="relative">
                        <input
                          type={showSwapPrivateKey ? 'text' : 'password'}
                          value={newSwapWallet.privateKey}
                          onChange={(e) => setNewSwapWallet({ ...newSwapWallet, privateKey: e.target.value })}
                          placeholder="输入钱包私钥"
                          className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 pr-12 font-mono text-sm focus:ring-2 focus:ring-[#00A3FF] outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSwapPrivateKey(!showSwapPrivateKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showSwapPrivateKey ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-bold text-slate-600 block mb-2">优先级 (1-100)</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={newSwapWallet.priority}
                        onChange={(e) => setNewSwapWallet({ ...newSwapWallet, priority: parseInt(e.target.value) })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                      />
                      <p className="text-xs text-slate-500 mt-1">数值越大优先级越高</p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleAddSwapWallet}
                        disabled={loading}
                        className="flex-1 bg-[#00A3FF] hover:bg-[#0086D1] text-white px-6 py-3 rounded-lg font-bold disabled:opacity-50"
                      >
                        {loading ? '添加中...' : '添加钱包'}
                      </button>
                      <button
                        onClick={handleBackToSwapList}
                        className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* 钱包列表 */
              <div>
                <h2 className="text-xl font-black text-slate-800 mb-4">闪兑钱包管理</h2>
                
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    💡 <strong>闪兑钱包说明：</strong><br/>
                    • 用户转 USDT 到哪个钱包，TRX 就从那个钱包返回<br/>
                    • 请确保钱包有足够的 TRX 余额用于闪兑<br/>
                    • 可以配置多个钱包，系统会按优先级选择
                  </p>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-slate-600">
                    已配置 {swapWallets.length} 个闪兑钱包，其中 {swapWallets.filter(w => w.enabled).length} 个已启用
                  </p>
                  <button
                    onClick={() => setShowAddSwapWallet(true)}
                    className="bg-cyan-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-cyan-600 transition-all"
                  >
                    + 添加钱包
                  </button>
                </div>

                {swapWallets.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-xl">
                    <p className="text-slate-500 mb-4">还没有配置闪兑钱包</p>
                    <button
                      onClick={() => setShowAddSwapWallet(true)}
                      className="bg-cyan-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-cyan-600 transition-all"
                    >
                      添加第一个闪兑钱包
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {swapWallets.map((wallet) => (
                      <div 
                        key={wallet.id} 
                        className="border border-slate-200 rounded-xl p-5 cursor-pointer hover:border-cyan-300 hover:shadow-md transition-all"
                        onClick={() => handleViewSwapWallet(wallet)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-base font-bold text-slate-900">{wallet.name}</h3>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                wallet.enabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {wallet.enabled ? '已启用' : '已禁用'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 font-mono mb-3 truncate">{wallet.address}</p>
                            
                            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                              <span className="text-xs text-slate-500">优先级: {wallet.priority}</span>
                              <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={wallet.enabled}
                                  onChange={() => handleToggleSwapWallet(wallet.id)}
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-500/20 rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 汇率设置 */}
        {activeTab === 'swap-rate' && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-800 mb-4">闪兑汇率设置</h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-blue-800">
                💡 闪兑汇率独立于代付汇率，用于 USDT 兑换 TRX<br/>
                <strong>手动模式</strong>：直接设置 1 USDT = X TRX<br/>
                <strong>实时模式</strong>：自动从 Binance 获取 TRX/USDT 交易对价格（推荐）
              </p>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-600 block mb-2">闪兑汇率模式</label>
              <select
                value={settings.swapRateMode}
                onChange={(e) => setSettings({ ...settings, swapRateMode: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
              >
                <option value="realtime">实时汇率（推荐 - 从Binance获取）</option>
                <option value="manual">手动设置</option>
              </select>
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
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-green-800">当前实时汇率</h3>
                    <button
                      onClick={fetchCurrentSwapRate}
                      disabled={fetchingRate}
                      className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 flex items-center gap-1"
                    >
                      <RefreshCw size={12} className={fetchingRate ? 'animate-spin' : ''} />
                      {fetchingRate ? '获取中...' : '刷新汇率'}
                    </button>
                  </div>
                  
                  {currentSwapRate ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-green-700">基础汇率:</span>
                        <span className="font-bold text-green-900">{currentSwapRate.baseRate} TRX/USDT</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">加成:</span>
                        <span className="font-bold text-green-900">{currentSwapRate.markup}%</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-green-200">
                        <span className="text-green-700">用户实际得到 (1 USDT):</span>
                        <span className="font-bold text-green-900">
                          {(currentSwapRate.baseRate * (1 - settings.swapRateMarkup / 100)).toFixed(6)} TRX
                        </span>
                      </div>
                      <div className="pt-2 border-t border-green-200">
                        <span className="text-xs text-green-600">
                          数据来源: {currentSwapRate.mode === 'realtime' ? 'Binance API' : '手动设置'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-green-700">
                      <p>点击"刷新汇率"获取当前实时汇率</p>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h3 className="text-sm font-bold text-blue-800 mb-2">实时汇率说明</h3>
                  <div className="text-sm text-blue-700 space-y-2">
                    <p>• 自动从 Binance API 获取 TRX/USDT 交易对实时价格</p>
                    <p>• 如果 Binance 失败，自动切换到 CoinGecko 备用源</p>
                    <p>• 汇率每次用户创建订单时实时获取</p>
                    <p>• 确保汇率始终是最新的市场价格</p>
                  </div>
                </div>
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
                ) : currentSwapRate ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-cyan-700">当前基础汇率:</span>
                      <span className="font-bold text-cyan-900">{currentSwapRate.baseRate} TRX/USDT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cyan-700">加成:</span>
                      <span className="font-bold text-cyan-900">{settings.swapRateMarkup}%</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-cyan-200">
                      <span className="text-cyan-700">用户实际得到 (1 USDT):</span>
                      <span className="font-bold text-cyan-900">
                        {(currentSwapRate.baseRate * (1 - settings.swapRateMarkup / 100)).toFixed(6)} TRX
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-cyan-700">
                    <p>实时模式下，汇率在用户创建订单时实时获取</p>
                    <p className="mt-2">当前加成: {settings.swapRateMarkup}%</p>
                    <p className="mt-2 text-xs">点击上方"刷新汇率"查看当前市场价格</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 限额配置 */}
        {activeTab === 'swap-limits' && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-800 mb-4">限额配置</h2>
            
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

            <div>
              <label className="text-sm font-bold text-slate-600 block mb-2">重要提示（自定义内容）</label>
              <textarea
                value={settings.swapNotice || ''}
                onChange={(e) => setSettings({ ...settings, swapNotice: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                rows="4"
                placeholder="必须使用 TRC20 网络&#10;最小金额：10 USDT&#10;汇率实时变动"
              />
              <p className="text-xs text-slate-500 mt-1">每行一条提示，将显示在用户端的"重要提示"区域</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="text-sm font-bold text-blue-800 mb-2">💡 使用说明</h3>
              <ul className="text-sm text-blue-700 space-y-1 ml-4 list-disc">
                <li>闪兑功能允许用户直接用USDT兑换TRX</li>
                <li>系统自动监控用户转账并发送TRX</li>
                <li>建议设置合理的金额限制以控制风险</li>
                <li>订单超时后会自动取消</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default SwapSystemPage;
