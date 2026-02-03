import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Save, RefreshCw, Plus, Trash2, Eye, EyeOff, AlertCircle, ArrowLeft, Wallet as WalletIcon } from 'lucide-react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

const PaymentSystemPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [settings, setSettings] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rateInfo, setRateInfo] = useState(null);
  const [refreshingRates, setRefreshingRates] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [newWallet, setNewWallet] = useState({
    name: '',
    privateKey: '',
    priority: 50,
    alerts: {
      minTrxBalance: 50,
      minUsdtBalance: 100,
      minEnergy: 50000,
      enabled: true
    }
  });
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'wallets';

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchSettings();
    fetchWallets();
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

  const fetchWallets = async () => {
    try {
      const { data } = await axios.get('/api/wallets');
      setWallets(data.wallets || []);
    } catch (error) {
      console.error('获取钱包列表失败:', error);
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
      console.error('汇率更新失败:', error);
      alert('汇率更新失败: ' + (error.response?.data?.error || error.message));
    } finally {
      setRefreshingRates(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.put('/api/settings', settings);
      
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

  const handleToggleWalletStatus = async (walletId, currentStatus) => {
    try {
      await axios.put(`/api/wallets/${walletId}/status`, {
        isActive: !currentStatus
      });
      fetchWallets();
    } catch (error) {
      alert('状态更新失败: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleViewWallet = async (walletId) => {
    try {
      const { data } = await axios.get(`/api/wallets/${walletId}`);
      setSelectedWallet(data.wallet);
    } catch (error) {
      alert('获取钱包详情失败: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleBackToList = () => {
    setSelectedWallet(null);
    setShowAddWallet(false);
  };

  const handleAddWallet = async () => {
    if (!newWallet.name || !newWallet.privateKey) {
      alert('请填写钱包名称和私钥');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/wallets', newWallet);
      alert('钱包添加成功！');
      setShowAddWallet(false);
      setNewWallet({
        name: '',
        privateKey: '',
        priority: 50,
        alerts: {
          minTrxBalance: 50,
          minUsdtBalance: 100,
          minEnergy: 50000,
          enabled: true
        }
      });
      fetchWallets();
    } catch (error) {
      alert('添加失败: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWallet = async (walletId, walletName) => {
    if (!confirm(`确定要删除钱包"${walletName}"吗？此操作不可恢复！`)) {
      return;
    }

    try {
      await axios.delete(`/api/wallets/${walletId}`);
      alert('钱包删除成功');
      setSelectedWallet(null);
      fetchWallets();
    } catch (error) {
      alert('删除失败: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleRefreshWallet = async (walletId) => {
    try {
      await axios.post(`/api/wallets/${walletId}/refresh`);
      alert('刷新成功');
      if (selectedWallet) {
        handleViewWallet(walletId);
      } else {
        fetchWallets();
      }
    } catch (error) {
      alert('刷新失败: ' + (error.response?.data?.error || error.message));
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
        {/* 钱包管理 */}
        {activeTab === 'wallets' && (
          <div className="space-y-6">
            {/* 钱包详情页面 */}
            {selectedWallet ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={handleBackToList}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
                  >
                    <ArrowLeft size={20} />
                    返回钱包列表
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRefreshWallet(selectedWallet._id || selectedWallet.id)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold flex items-center gap-2"
                    >
                      <RefreshCw size={16} />
                      刷新
                    </button>
                  </div>
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
                          <span className="text-sm font-bold text-slate-900">{selectedWallet.name}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm text-slate-600">地址:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-slate-900 break-all">{selectedWallet.address}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(selectedWallet.address);
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
                            selectedWallet.health?.status === 'healthy' ? 'text-green-600' :
                            selectedWallet.health?.status === 'warning' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            ● {selectedWallet.health?.status === 'healthy' ? '健康' :
                               selectedWallet.health?.status === 'warning' ? '警告' : '错误'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">优先级:</span>
                          <span className="text-sm font-bold text-slate-900">{selectedWallet.priority || 50}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">创建时间:</span>
                          <span className="text-xs text-slate-900">{new Date(selectedWallet.createdAt).toLocaleString('zh-CN')}</span>
                        </div>
                      </div>
                    </div>

                    {/* 余额信息 */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-4">余额信息</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">TRX:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-slate-900">{(selectedWallet.balance?.trx || 0).toLocaleString()}</span>
                            <span className={`text-xs font-bold px-2 py-1 rounded ${
                              (selectedWallet.balance?.trx || 0) >= (selectedWallet.alerts?.minTrxBalance || 50)
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {(selectedWallet.balance?.trx || 0) >= (selectedWallet.alerts?.minTrxBalance || 50) ? '正常' : '不足'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">USDT:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-slate-900">{(selectedWallet.balance?.usdt || 0).toLocaleString()}</span>
                            <span className={`text-xs font-bold px-2 py-1 rounded ${
                              (selectedWallet.balance?.usdt || 0) >= (selectedWallet.alerts?.minUsdtBalance || 100)
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {(selectedWallet.balance?.usdt || 0) >= (selectedWallet.alerts?.minUsdtBalance || 100) ? '正常' : '偏低'}
                            </span>
                          </div>
                        </div>
                        {selectedWallet.balance?.lastUpdated && (
                          <div className="pt-2 border-t border-slate-200">
                            <span className="text-xs text-slate-500">
                              最后更新: {new Date(selectedWallet.balance.lastUpdated).toLocaleString('zh-CN')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 右列 */}
                  <div className="space-y-6">
                    {/* 资源信息 */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-4">资源信息</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-600">能量:</span>
                            <span className="text-xs font-bold text-slate-900">
                              {(selectedWallet.resources?.energy?.available || 0).toLocaleString()} / {(selectedWallet.resources?.energy?.limit || 0).toLocaleString()}
                              <span className="text-xs text-slate-500 ml-2">
                                [{(selectedWallet.resources?.energy?.limit || 0) > 0 
                                  ? Math.round((selectedWallet.resources.energy.available / selectedWallet.resources.energy.limit) * 100) 
                                  : 0}%]
                              </span>
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-orange-500 h-2 rounded-full transition-all"
                              style={{ 
                                width: `${(selectedWallet.resources?.energy?.limit || 0) > 0 
                                  ? Math.round((selectedWallet.resources.energy.available / selectedWallet.resources.energy.limit) * 100) 
                                  : 0}%` 
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-600">带宽:</span>
                            <span className="text-xs font-bold text-slate-900">
                              {(selectedWallet.resources?.bandwidth?.available || 0).toLocaleString()} / {(selectedWallet.resources?.bandwidth?.limit || 0).toLocaleString()}
                              <span className="text-xs text-slate-500 ml-2">
                                [{(selectedWallet.resources?.bandwidth?.limit || 0) > 0 
                                  ? Math.round((selectedWallet.resources.bandwidth.available / selectedWallet.resources.bandwidth.limit) * 100) 
                                  : 0}%]
                              </span>
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full transition-all"
                              style={{ 
                                width: `${(selectedWallet.resources?.bandwidth?.limit || 0) > 0 
                                  ? Math.round((selectedWallet.resources.bandwidth.available / selectedWallet.resources.bandwidth.limit) * 100) 
                                  : 0}%` 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 使用统计 */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-4">使用统计</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">总交易:</span>
                          <span className="text-sm font-bold text-slate-900">{selectedWallet.stats?.totalTransactions || 0} 笔</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">成功:</span>
                          <span className="text-sm font-bold text-green-600">{selectedWallet.stats?.successCount || 0} 笔</span>
                          <span className="text-sm text-slate-400">|</span>
                          <span className="text-sm text-slate-600">失败:</span>
                          <span className="text-sm font-bold text-red-600">{selectedWallet.stats?.failCount || 0} 笔</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">成功率:</span>
                          <span className="text-sm font-bold text-slate-900">
                            {(selectedWallet.stats?.totalTransactions || 0) > 0 
                              ? (((selectedWallet.stats?.successCount || 0) / selectedWallet.stats.totalTransactions) * 100).toFixed(1) 
                              : 0}%
                          </span>
                        </div>
                        {selectedWallet.stats?.lastUsedAt && (
                          <div className="pt-2 border-t border-slate-200">
                            <span className="text-xs text-slate-500">
                              最后使用: {new Date(selectedWallet.stats.lastUsedAt).toLocaleString('zh-CN')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 操作按钮 - 跨两列 */}
                  <div className="md:col-span-2 flex gap-3">
                    <button
                      onClick={() => handleToggleWalletStatus(selectedWallet._id || selectedWallet.id, selectedWallet.enabled)}
                      className={`flex-1 px-4 py-3 rounded-lg font-bold transition-all ${
                        selectedWallet.enabled 
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' 
                          : 'bg-green-100 hover:bg-green-200 text-green-700'
                      }`}
                    >
                      {selectedWallet.enabled ? '禁用钱包' : '启用钱包'}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`确定要删除钱包"${selectedWallet.name}"吗？此操作不可恢复！`)) {
                          handleDeleteWallet(selectedWallet._id || selectedWallet.id, selectedWallet.name);
                        }
                      }}
                      className="px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-bold transition-all"
                    >
                      删除钱包
                    </button>
                  </div>
                </div>
              </div>
            ) : showAddWallet ? (
              /* 添加钱包表单 */
              <div>
                <button
                  onClick={handleBackToList}
                  className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
                >
                  <ArrowLeft size={20} />
                  返回钱包列表
                </button>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h2 className="text-xl font-black text-slate-900 mb-6">添加新钱包</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-bold text-slate-600 block mb-2">钱包名称</label>
                      <input
                        type="text"
                        value={newWallet.name}
                        onChange={(e) => setNewWallet({ ...newWallet, name: e.target.value })}
                        placeholder="例如: 主钱包"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-bold text-slate-600 block mb-2">私钥</label>
                      <div className="relative">
                        <input
                          type={showPrivateKey ? 'text' : 'password'}
                          value={newWallet.privateKey}
                          onChange={(e) => setNewWallet({ ...newWallet, privateKey: e.target.value })}
                          placeholder="输入钱包私钥"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 pr-12 font-mono text-sm focus:ring-2 focus:ring-[#00A3FF] outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPrivateKey(!showPrivateKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPrivateKey ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-bold text-slate-600 block mb-2">优先级 (1-100)</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={newWallet.priority}
                        onChange={(e) => setNewWallet({ ...newWallet, priority: parseInt(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                      />
                      <p className="text-xs text-slate-500 mt-1">数值越大优先级越高</p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleAddWallet}
                        disabled={loading}
                        className="flex-1 bg-[#00A3FF] hover:bg-[#0086D1] text-white px-6 py-3 rounded-lg font-bold disabled:opacity-50"
                      >
                        {loading ? '添加中...' : '添加钱包'}
                      </button>
                      <button
                        onClick={handleBackToList}
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
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-black text-slate-800">代付钱包</h2>
                  <button
                    onClick={() => setShowAddWallet(true)}
                    className="bg-cyan-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-cyan-600 transition-all"
                  >
                    <Plus size={18} />
                    添加钱包
                  </button>
                </div>

                {wallets.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-xl">
                    <p className="text-slate-500 mb-4">还没有配置钱包</p>
                    <button
                      onClick={() => setShowAddWallet(true)}
                      className="bg-cyan-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-cyan-600 transition-all"
                    >
                      添加第一个钱包
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {wallets.map((wallet) => (
                      <div 
                        key={wallet._id} 
                        className="border border-slate-200 rounded-xl p-5 cursor-pointer hover:border-cyan-300 hover:shadow-md transition-all"
                        onClick={() => handleViewWallet(wallet._id)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-base font-bold text-slate-900">{wallet.name}</h3>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                wallet.status === 'healthy' ? 'bg-green-100 text-green-700' :
                                wallet.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {wallet.status === 'healthy' ? '正常' : wallet.status === 'warning' ? '预警' : '异常'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 font-mono mb-3 truncate">{wallet.address}</p>
                            
                            <div className="space-y-2 text-sm mb-3">
                              <div className="flex justify-between">
                                <span className="text-slate-500">TRX:</span>
                                <span className="font-bold text-slate-900">{(wallet.balance?.trx || 0).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">USDT:</span>
                                <span className="font-bold text-slate-900">{(wallet.balance?.usdt || 0).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">使用:</span>
                                <span className="font-bold text-slate-900">{wallet.usageCount || 0} 次</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                              <span className="text-xs text-slate-500">优先级: {wallet.priority || 50}</span>
                              <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={wallet.enabled}
                                  onChange={() => handleToggleWalletStatus(wallet._id, wallet.enabled)}
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

        {/* 能量租赁 */}
        {activeTab === 'energy' && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-800 mb-4">能量租赁配置</h2>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <span className="font-bold text-slate-700">启用能量租赁</span>
                <p className="text-xs text-slate-500 mt-1">USDT转账时自动租赁能量</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.energyRentalEnabled}
                  onChange={(e) => setSettings({ ...settings, energyRentalEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#00A3FF]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00A3FF]"></div>
              </label>
            </div>

            {settings.energyRentalEnabled && (
              <>
                <div key="rental-mode">
                  <label className="text-sm font-bold text-slate-600 block mb-2">租赁模式</label>
                  <select
                    value={settings.energyRentalMode}
                    onChange={(e) => setSettings({ ...settings, energyRentalMode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                  >
                    <option value="catfee">CatFee API（推荐）</option>
                    <option value="transfer">转账租赁</option>
                  </select>
                </div>

                {settings.energyRentalMode === 'catfee' ? (
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                      <p className="text-sm text-blue-900 mb-2">
                        💡 <strong>CatFee 能量购买：</strong>通过 API 直接购买能量，无需等待，更加稳定。
                      </p>
                      <p className="text-sm text-blue-800 mb-2">
                        📖 <a href="https://docs.catfee.io/getting-started/buy-energy-via-api-on-catfee/api-overview" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">
                          查看 CatFee API 文档
                        </a>
                      </p>
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <p className="text-xs text-blue-800 font-bold mb-1">环境说明：</p>
                        <p className="text-xs text-blue-700">
                          • <strong>生产环境：</strong><a href="https://catfee.io" target="_blank" rel="noopener noreferrer" className="underline">catfee.io</a> - API: https://api.catfee.io<br/>
                          • <strong>测试环境：</strong><a href="https://nile.catfee.io" target="_blank" rel="noopener noreferrer" className="underline">nile.catfee.io</a> - API: https://nile.catfee.io<br/>
                          • 两个环境账号和 API Key 不互通，需分别注册
                        </p>
                      </div>
                    </div>

                    <div key="catfee-api-url">
                      <label className="text-sm font-bold text-slate-600 block mb-2">
                        CatFee API 环境
                      </label>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <button
                          type="button"
                          onClick={() => setSettings({ ...settings, catfeeApiUrl: 'https://api.catfee.io' })}
                          className={`px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                            settings.catfeeApiUrl === 'https://api.catfee.io'
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          🌐 生产环境
                        </button>
                        <button
                          type="button"
                          onClick={() => setSettings({ ...settings, catfeeApiUrl: 'https://nile.catfee.io' })}
                          className={`px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                            settings.catfeeApiUrl === 'https://nile.catfee.io'
                              ? 'border-orange-500 bg-orange-50 text-orange-700'
                              : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          🧪 测试环境 (Nile)
                        </button>
                      </div>
                      <input
                        type="text"
                        value={settings.catfeeApiUrl || 'https://api.catfee.io'}
                        onChange={(e) => setSettings({ ...settings, catfeeApiUrl: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none font-mono text-sm"
                        placeholder="https://api.catfee.io"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        {settings.catfeeApiUrl === 'https://api.catfee.io' && '✅ 当前：生产环境 - 使用真实 TRX 购买能量'}
                        {settings.catfeeApiUrl === 'https://nile.catfee.io' && '⚠️ 当前：测试环境 - 使用测试币，适合开发调试'}
                        {settings.catfeeApiUrl !== 'https://api.catfee.io' && settings.catfeeApiUrl !== 'https://nile.catfee.io' && '自定义 API 地址'}
                      </p>
                    </div>

                    <div key="catfee-api-credentials" className="space-y-4">
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <p className="text-sm text-amber-900 mb-2">
                          🔑 <strong>获取 API 凭证：</strong>
                        </p>
                        <ol className="text-xs text-amber-800 space-y-1 ml-4 list-decimal">
                          <li>登录 CatFee 后台（{settings.catfeeApiUrl === 'https://nile.catfee.io' ? '测试环境' : '生产环境'}）</li>
                          <li>进入【个人中心】→【API】→【API 配置】</li>
                          <li>复制 <strong>API Key</strong> 和 <strong>API Secret</strong> 两个值</li>
                          <li>分别粘贴到下方输入框</li>
                        </ol>
                      </div>

                      <div>
                        <label className="text-sm font-bold text-slate-600 block mb-2">
                          API Key <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={settings.catfeeApiKey?.split(':')[0] || ''}
                          onChange={(e) => {
                            const secret = settings.catfeeApiKey?.split(':')[1] || '';
                            const newValue = secret ? `${e.target.value}:${secret}` : e.target.value;
                            setSettings({ ...settings, catfeeApiKey: newValue });
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none font-mono text-sm"
                          placeholder="例如: 40e7c486-c18e-40d4-9502-35423dcdb70e"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          在 CatFee 后台【API 配置】页面复制 API Key
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-bold text-slate-600 block mb-2">
                          API Secret <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={settings.catfeeApiKey?.split(':')[1] || ''}
                          onChange={(e) => {
                            const key = settings.catfeeApiKey?.split(':')[0] || '';
                            const newValue = key ? `${key}:${e.target.value}` : `:${e.target.value}`;
                            setSettings({ ...settings, catfeeApiKey: newValue });
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none font-mono text-sm"
                          placeholder="例如: a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          在 CatFee 后台【API 配置】页面复制 API Secret
                        </p>
                      </div>

                      {settings.catfeeApiKey && settings.catfeeApiKey.includes(':') && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                          <p className="text-xs text-green-800">
                            ✅ API 凭证已配置完整
                          </p>
                        </div>
                      )}
                      
                      {settings.catfeeApiKey && !settings.catfeeApiKey.includes(':') && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                          <p className="text-xs text-red-800">
                            ⚠️ 请同时配置 API Key 和 API Secret
                          </p>
                        </div>
                      )}
                    </div>

                    <div key="catfee-energy" className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-bold text-slate-600 block mb-2">首次转账能量</label>
                        <input
                          type="number"
                          value={settings.catfeeEnergyFirst}
                          onChange={(e) => setSettings({ ...settings, catfeeEnergyFirst: parseInt(e.target.value) })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-slate-600 block mb-2">正常转账能量</label>
                        <input
                          type="number"
                          value={settings.catfeeEnergyNormal}
                          onChange={(e) => setSettings({ ...settings, catfeeEnergyNormal: parseInt(e.target.value) })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div key="rental-address">
                      <label className="text-sm font-bold text-slate-600 block mb-2">能量租赁服务商地址</label>
                      <input
                        type="text"
                        value={settings.energyRentalAddress || ''}
                        onChange={(e) => setSettings({ ...settings, energyRentalAddress: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none font-mono text-sm"
                      />
                    </div>

                    <div key="rental-amounts" className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-bold text-slate-600 block mb-2">首次转账金额 (TRX)</label>
                        <input
                          type="number"
                          value={settings.energyRentalAmountFirst}
                          onChange={(e) => setSettings({ ...settings, energyRentalAmountFirst: parseFloat(e.target.value) })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-slate-600 block mb-2">正常转账金额 (TRX)</label>
                        <input
                          type="number"
                          value={settings.energyRentalAmountNormal}
                          onChange={(e) => setSettings({ ...settings, energyRentalAmountNormal: parseFloat(e.target.value) })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* 汇率设置 */}
        {activeTab === 'rate' && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-800 mb-4">代付汇率设置</h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-blue-800">
                💡 代付汇率用于计算用户支付的人民币金额<br/>
                实时汇率模式：自动从CoinGecko获取最新汇率（每小时更新）<br/>
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
                
                {rateInfo.originalRates?.USDT && rateInfo.originalRates?.TRX ? (
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

        {/* 费率设置 */}
        {activeTab === 'fee' && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-800 mb-4">代付服务费设置</h2>
            
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

        {/* API节点配置 */}
        {activeTab === 'api-nodes' && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-800 mb-4">链上监控 API 节点配置</h2>
            
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-amber-900">
                <strong>⚠️ 重要：</strong>请至少启用并配置一个 API 节点，否则无法进行链上查询和转账操作。
              </p>
            </div>

            <div className="space-y-4">
              {settings.tronApiNodes && JSON.parse(settings.tronApiNodes || '[]').map((node, index) => {
                const nodes = JSON.parse(settings.tronApiNodes || '[]');
                return (
                  <div key={index} className="bg-slate-50 border border-slate-200 rounded-xl p-4 relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={node.name}
                          onChange={(e) => {
                            const newNodes = [...nodes];
                            newNodes[index].name = e.target.value;
                            setSettings({ ...settings, tronApiNodes: JSON.stringify(newNodes) });
                          }}
                          className="text-sm font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-cyan-500 outline-none px-1 py-0.5"
                          placeholder="节点名称"
                        />
                        {node.name === 'TronGrid' && (
                          <a 
                            href="https://www.trongrid.io/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-700 underline"
                          >
                            获取 API Key →
                          </a>
                        )}
                        {node.name === 'ZAN' && (
                          <a 
                            href="https://zan.top/cn" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-700 underline"
                          >
                            获取 API Key →
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={node.enabled}
                            onChange={() => {
                              const newNodes = [...nodes];
                              newNodes[index].enabled = !newNodes[index].enabled;
                              setSettings({ ...settings, tronApiNodes: JSON.stringify(newNodes) });
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#00A3FF]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00A3FF]"></div>
                        </label>
                        {nodes.length > 1 && (
                          <button
                            onClick={() => {
                              if (confirm(`确定要删除节点 "${node.name}" 吗？`)) {
                                const newNodes = nodes.filter((_, i) => i !== index);
                                setSettings({ ...settings, tronApiNodes: JSON.stringify(newNodes) });
                              }
                            }}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="删除节点"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-slate-600 block mb-1">API URL</label>
                        <input
                          type="text"
                          value={node.url}
                          onChange={(e) => {
                            const newNodes = [...nodes];
                            newNodes[index].url = e.target.value;
                            setSettings({ ...settings, tronApiNodes: JSON.stringify(newNodes) });
                          }}
                          placeholder={
                            node.name === 'TronGrid' ? 'https://api.trongrid.io' :
                            'https://api.zan.top/node/v1/tron/mainnet/your_api_key'
                          }
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-[#00A3FF] outline-none"
                          disabled={!node.enabled}
                        />
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-slate-600 block mb-1">
                          API Key <span className="text-slate-400">(可选)</span>
                        </label>
                        <input
                          type="text"
                          value={node.apiKey}
                          onChange={(e) => {
                            const newNodes = [...nodes];
                            newNodes[index].apiKey = e.target.value;
                            setSettings({ ...settings, tronApiNodes: JSON.stringify(newNodes) });
                          }}
                          placeholder="输入 API Key"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-[#00A3FF] outline-none"
                          disabled={!node.enabled}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* 添加新节点按钮 */}
              <button
                onClick={() => {
                  const nodes = JSON.parse(settings.tronApiNodes || '[]');
                  nodes.push({
                    name: `自定义节点 ${nodes.length + 1}`,
                    url: '',
                    apiKey: '',
                    enabled: false
                  });
                  setSettings({ ...settings, tronApiNodes: JSON.stringify(nodes) });
                }}
                className="w-full bg-cyan-50 hover:bg-cyan-100 border-2 border-dashed border-cyan-300 rounded-xl px-4 py-3 text-sm font-bold text-cyan-600 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                添加新节点
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-900 mb-2">
                <strong>💡 多节点策略：</strong>
              </p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 系统按顺序尝试连接启用的节点</li>
                <li>• 当前节点失败时自动切换到下一个</li>
                <li>• 建议至少启用 2 个节点以提高可用性</li>
              </ul>
            </div>
          </div>
        )}

        {/* 自动转账配置 */}
        {activeTab === 'auto-transfer' && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-800 mb-4">自动转账配置</h2>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <span className="font-bold text-slate-700">启用自动转账</span>
                <p className="text-xs text-slate-500 mt-1">收到支付后自动执行转账</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.walletAutoTransferEnabled}
                  onChange={(e) => setSettings({ ...settings, walletAutoTransferEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#00A3FF]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00A3FF]"></div>
              </label>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-600 block mb-2">最大重试次数</label>
              <input
                type="number"
                value={settings.walletMaxRetryCount}
                onChange={(e) => setSettings({ ...settings, walletMaxRetryCount: parseInt(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
              />
              <p className="text-xs text-slate-500 mt-2">转账失败时的最大重试次数</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-slate-600 block mb-2">TRX 最低余额预警</label>
                <input
                  type="number"
                  value={settings.walletMinTRXBalance}
                  onChange={(e) => setSettings({ ...settings, walletMinTRXBalance: parseFloat(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-600 block mb-2">USDT 最低余额预警</label>
                <input
                  type="number"
                  value={settings.walletMinUSDTBalance}
                  onChange={(e) => setSettings({ ...settings, walletMinUSDTBalance: parseFloat(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-900">
                <strong>💡 说明：</strong>当钱包余额低于设定值时，系统会发送预警通知
              </p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default PaymentSystemPage;
