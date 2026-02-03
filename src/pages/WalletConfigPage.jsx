import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Wallet, Key, Shield, AlertTriangle, CheckCircle, RefreshCw, Eye, EyeOff, Lock, DollarSign, Zap, Wifi, Battery, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

const WalletConfigPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'wallets';
  const currentSubTab = searchParams.get('subtab') || 'api';
  
  const [config, setConfig] = useState({
    tronWalletAddress: '',
    hasPrivateKey: false,
    tronApiNodes: [
      { name: 'TronGrid', url: 'https://api.trongrid.io', apiKey: '', enabled: false },
      { name: 'ZAN', url: '', apiKey: '', enabled: false }
    ],
    walletAutoTransferEnabled: true,
    walletMaxRetryCount: 3,
    walletMinTRXBalance: 50,
    walletMinUSDTBalance: 100,
    energyRentalEnabled: false,
    energyRentalMode: 'transfer',
    energyRentalAddress: '',
    energyRentalAmountFirst: 20,
    energyRentalAmountNormal: 10,
    energyRentalWaitTime: 30,
    catfeeApiUrl: 'https://api.catfee.io',
    catfeeApiKey: '',
    catfeeEnergyFirst: 131000,
    catfeeEnergyNormal: 65000,
    catfeePeriod: 1
  });

  const [privateKey, setPrivateKey] = useState('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [validating, setValidating] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [validationResult, setValidationResult] = useState(null);

  // 钱包管理相关状态
  const [wallets, setWallets] = useState([]);
  const [walletsLoading, setWalletsLoading] = useState(false);
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null); // 选中的钱包（用于详情页）
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

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchConfig();
  }, [user, navigate]);

  const fetchConfig = async () => {
    try {
      const { data } = await axios.get('/api/wallet/config');
      // 解析 tronApiNodes JSON 字符串
      if (data.tronApiNodes) {
        try {
          data.tronApiNodes = JSON.parse(data.tronApiNodes);
        } catch (e) {
          console.error('解析 tronApiNodes 失败:', e);
          data.tronApiNodes = [
            { name: 'TronGrid', url: 'https://api.trongrid.io', apiKey: '', enabled: false },
            { name: 'ZAN', url: '', apiKey: '', enabled: false }
          ];
        }
      }
      setConfig(data);
    } catch (error) {
      console.error('获取钱包配置失败:', error);
    }
  };

  const handleValidateKey = async () => {
    if (!privateKey) {
      alert('请输入私钥');
      return;
    }

    setValidating(true);
    setValidationResult(null);

    try {
      const { data } = await axios.post('/api/wallet/validate-key', { privateKey });
      setValidationResult(data);
    } catch (error) {
      setValidationResult({
        valid: false,
        message: error.response?.data?.error || '验证失败'
      });
    } finally {
      setValidating(false);
    }
  };

  const handleSave = async () => {
    // 验证至少有一个节点启用
    const hasEnabledNode = config.tronApiNodes && config.tronApiNodes.some(node => node.enabled && node.url);
    if (!hasEnabledNode) {
      alert('请至少启用并配置一个 API 节点');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        tronApiNodes: JSON.stringify(config.tronApiNodes),
        walletAutoTransferEnabled: config.walletAutoTransferEnabled,
        walletMaxRetryCount: config.walletMaxRetryCount,
        walletMinTRXBalance: config.walletMinTRXBalance,
        walletMinUSDTBalance: config.walletMinUSDTBalance,
        energyRentalEnabled: config.energyRentalEnabled,
        energyRentalMode: config.energyRentalMode,
        energyRentalAddress: config.energyRentalAddress,
        energyRentalAmountFirst: config.energyRentalAmountFirst,
        energyRentalAmountNormal: config.energyRentalAmountNormal,
        energyRentalWaitTime: config.energyRentalWaitTime,
        catfeeApiUrl: config.catfeeApiUrl,
        catfeeApiKey: config.catfeeApiKey,
        catfeeEnergyFirst: config.catfeeEnergyFirst,
        catfeeEnergyNormal: config.catfeeEnergyNormal,
        catfeePeriod: config.catfeePeriod
      };

      if (privateKey) {
        payload.tronPrivateKey = privateKey;
      }

      const { data } = await axios.put('/api/wallet/config', payload);
      
      alert('保存成功！' + (data.walletAddress ? `\n钱包地址: ${data.walletAddress}` : ''));
      
      setPrivateKey('');
      setValidationResult(null);
      
      await fetchConfig();
      
      if (payload.tronGridApiKey !== undefined || payload.tronPrivateKey) {
        if (confirm('配置已保存。是否立即测试连接？')) {
          await handleTest();
        }
      }
    } catch (error) {
      alert('保存失败: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const { data } = await axios.post('/api/wallet/test');
      setTestResult(data);
    } catch (error) {
      setTestResult({
        success: false,
        error: error.response?.data?.error || error.message
      });
    } finally {
      setTesting(false);
    }
  };

  // 钱包管理函数
  const fetchWallets = async () => {
    setWalletsLoading(true);
    try {
      const { data } = await axios.get('/api/wallets');
      setWallets(data.wallets);
    } catch (error) {
      console.error('获取钱包列表失败:', error);
      alert('获取钱包列表失败: ' + (error.response?.data?.error || error.message));
    } finally {
      setWalletsLoading(false);
    }
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
      await fetchWallets();
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
      await fetchWallets();
    } catch (error) {
      alert('删除失败: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleToggleWallet = async (walletId, enabled) => {
    try {
      const endpoint = enabled ? 'disable' : 'enable';
      await axios.post(`/api/wallets/${walletId}/${endpoint}`);
      await fetchWallets();
    } catch (error) {
      alert('操作失败: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleRefreshWallet = async (walletId) => {
    try {
      await axios.post(`/api/wallets/${walletId}/refresh`);
      await fetchWallets();
      alert('刷新成功');
    } catch (error) {
      alert('刷新失败: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleRefreshAllWallets = async () => {
    setWalletsLoading(true);
    try {
      const { data } = await axios.post('/api/wallets/refresh-all');
      alert(data.message);
      await fetchWallets();
    } catch (error) {
      alert('刷新失败: ' + (error.response?.data?.error || error.message));
    } finally {
      setWalletsLoading(false);
    }
  };

  // 在 useEffect 中添加钱包列表的加载
  useEffect(() => {
    if (currentTab === 'wallets') {
      fetchWallets();
    }
  }, [currentTab]);

  // 查看钱包详情
  const handleViewWallet = async (walletId) => {
    try {
      const { data } = await axios.get(`/api/wallets/${walletId}`);
      setSelectedWallet(data.wallet);
    } catch (error) {
      console.error('获取钱包详情失败:', error);
      alert('获取钱包详情失败: ' + (error.response?.data?.error || error.message));
    }
  };

  // 返回钱包列表
  const handleBackToList = () => {
    setSelectedWallet(null);
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        {/* 主标签导航 */}
        <div className="bg-white rounded-xl border border-slate-200 mb-6 overflow-hidden">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setSearchParams({ tab: 'wallets' })}
              className={`flex-1 px-6 py-4 text-sm font-bold transition-all ${
                currentTab === 'wallets'
                  ? 'bg-[#00A3FF] text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              钱包管理
            </button>
            <button
              onClick={() => setSearchParams({ tab: 'basic', subtab: 'api' })}
              className={`flex-1 px-6 py-4 text-sm font-bold transition-all ${
                currentTab === 'basic'
                  ? 'bg-[#00A3FF] text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              基础配置
            </button>
            <button
              onClick={() => setSearchParams({ tab: 'energy' })}
              className={`flex-1 px-6 py-4 text-sm font-bold transition-all ${
                currentTab === 'energy'
                  ? 'bg-[#00A3FF] text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              能量租赁
            </button>
          </div>
        </div>

        {/* 基础配置标签 */}
        {currentTab === 'basic' && (
          <>
            {/* 子标签导航 */}
            <div className="bg-white rounded-xl border border-slate-200 mb-6 overflow-hidden">
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setSearchParams({ tab: 'basic', subtab: 'api' })}
                  className={`flex-1 px-6 py-4 text-sm font-bold transition-all ${
                    currentSubTab === 'api'
                      ? 'bg-[#00A3FF] text-white'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  监控API配置
                </button>
                <button
                  onClick={() => setSearchParams({ tab: 'basic', subtab: 'wallet' })}
                  className={`flex-1 px-6 py-4 text-sm font-bold transition-all ${
                    currentSubTab === 'wallet'
                      ? 'bg-[#00A3FF] text-white'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  钱包地址
                </button>
                <button
                  onClick={() => setSearchParams({ tab: 'basic', subtab: 'transfer' })}
                  className={`flex-1 px-6 py-4 text-sm font-bold transition-all ${
                    currentSubTab === 'transfer'
                      ? 'bg-[#00A3FF] text-white'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  自动转账
                </button>
              </div>
            </div>

            {/* 监控API配置子标签 */}
            {currentSubTab === 'api' && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                <h2 className="text-xl font-black text-slate-900 mb-6">链上监控 API 节点配置</h2>

                <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-900">
                    <strong>⚠️ 重要：</strong>请至少启用并配置一个 API 节点，否则无法进行链上查询和转账操作。
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  {config.tronApiNodes && config.tronApiNodes.map((node, index) => (
                    <div key={index} className="bg-slate-50 border border-slate-200 rounded-lg p-4 relative">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={node.name}
                            onChange={(e) => {
                              const newNodes = [...config.tronApiNodes];
                              newNodes[index].name = e.target.value;
                              setConfig({ ...config, tronApiNodes: newNodes });
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
                          <button
                            onClick={() => {
                              const newNodes = [...config.tronApiNodes];
                              newNodes[index].enabled = !newNodes[index].enabled;
                              setConfig({ ...config, tronApiNodes: newNodes });
                            }}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              node.enabled ? 'bg-[#00A3FF]' : 'bg-slate-300'
                            }`}
                          >
                            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                              node.enabled ? 'translate-x-6' : ''
                            }`} />
                          </button>
                          {config.tronApiNodes.length > 1 && (
                            <button
                              onClick={() => {
                                if (confirm(`确定要删除节点 "${node.name}" 吗？`)) {
                                  const newNodes = config.tronApiNodes.filter((_, i) => i !== index);
                                  setConfig({ ...config, tronApiNodes: newNodes });
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
                              const newNodes = [...config.tronApiNodes];
                              newNodes[index].url = e.target.value;
                              setConfig({ ...config, tronApiNodes: newNodes });
                            }}
                            placeholder={
                              node.name === 'TronGrid' ? 'https://api.trongrid.io' :
                              'https://api.zan.top/node/v1/tron/mainnet/your_api_key'
                            }
                            className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-[#00A3FF] outline-none"
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
                              const newNodes = [...config.tronApiNodes];
                              newNodes[index].apiKey = e.target.value;
                              setConfig({ ...config, tronApiNodes: newNodes });
                            }}
                            placeholder="输入 API Key"
                            className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-[#00A3FF] outline-none"
                            disabled={!node.enabled}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* 添加新节点按钮 */}
                  <button
                    onClick={() => {
                      const newNodes = [...config.tronApiNodes];
                      newNodes.push({
                        name: `自定义节点 ${newNodes.length + 1}`,
                        url: '',
                        apiKey: '',
                        enabled: false
                      });
                      setConfig({ ...config, tronApiNodes: newNodes });
                    }}
                    className="w-full bg-cyan-50 hover:bg-cyan-100 border-2 border-dashed border-cyan-300 rounded-lg px-4 py-3 text-sm font-bold text-cyan-600 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    添加新节点
                  </button>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                  <p className="text-xs text-blue-900 mb-1">
                    <strong>💡 多节点策略：</strong>
                  </p>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• 系统按顺序尝试连接启用的节点</li>
                    <li>• 当前节点失败时自动切换到下一个</li>
                    <li>• 建议至少启用 2 个节点以提高可用性</li>
                    <li>• 所有查询使用当前连接的节点</li>
                  </ul>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 bg-[#00A3FF] hover:bg-[#0086D1] text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        保存中...
                      </>
                    ) : (
                      '保存配置'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* 钱包地址子标签 */}
            {currentSubTab === 'wallet' && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                <h2 className="text-xl font-black text-slate-900 mb-6">默认钱包配置</h2>
                
                <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-900">
                    💡 <strong>说明：</strong>此处配置的是系统默认钱包，用于基础操作和监控。如需使用多钱包智能分配功能，请前往"钱包管理"标签添加多个钱包。
                  </p>
                </div>

                {config.tronWalletAddress && (
                  <div className="mb-6">
                    <label className="text-sm font-bold text-slate-700 block mb-2">当前钱包地址</label>
                    <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center gap-2">
                      <CheckCircle className="text-green-600" size={20} />
                      <span className="text-sm font-mono text-green-900">{config.tronWalletAddress}</span>
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <label className="text-sm font-bold text-slate-700 block mb-2 flex items-center gap-2">
                    <Lock size={16} />
                    钱包私钥 {config.hasPrivateKey && <span className="text-green-600 text-xs">(已配置)</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={showPrivateKey ? 'text' : 'password'}
                      value={privateKey}
                      onChange={(e) => {
                        setPrivateKey(e.target.value);
                        setValidationResult(null);
                      }}
                      placeholder={config.hasPrivateKey ? '留空表示不修改私钥' : '输入64位十六进制私钥'}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 pr-24 text-sm font-mono focus:ring-2 focus:ring-[#00A3FF] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPrivateKey(!showPrivateKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600"
                    >
                      {showPrivateKey ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">私钥将使用 AES-256-GCM 加密后存储，只有服务器可以解密</p>

                  {privateKey && (
                    <button
                      onClick={handleValidateKey}
                      disabled={validating}
                      className="mt-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      {validating ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          验证中...
                        </>
                      ) : (
                        <>
                          <Key size={16} />
                          验证私钥
                        </>
                      )}
                    </button>
                  )}

                  {validationResult && (
                    <div className={`mt-2 p-3 rounded-lg flex items-start gap-2 ${
                      validationResult.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}>
                      {validationResult.valid ? (
                        <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                      ) : (
                        <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
                      )}
                      <div className="flex-1">
                        <p className={`text-sm font-bold ${validationResult.valid ? 'text-green-900' : 'text-red-900'}`}>
                          {validationResult.message}
                        </p>
                        {validationResult.walletAddress && (
                          <p className="text-xs font-mono text-green-700 mt-1">钱包地址: {validationResult.walletAddress}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 mb-6">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 bg-[#00A3FF] hover:bg-[#0086D1] text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        保存中...
                      </>
                    ) : (
                      '保存配置'
                    )}
                  </button>

                  <button
                    onClick={handleTest}
                    disabled={testing || !config.hasPrivateKey}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {testing ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        测试中...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        测试连接
                      </>
                    )}
                  </button>
                </div>

                {testResult && (
                  <div className={`mb-6 p-4 rounded-xl border ${
                    testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      {testResult.success ? (
                        <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                      ) : (
                        <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                      )}
                      <div className="flex-1">
                        <p className={`text-sm font-bold mb-2 ${testResult.success ? 'text-green-900' : 'text-red-900'}`}>
                          {testResult.message || (testResult.success ? '连接成功' : '连接失败')}
                        </p>
                        {testResult.success && (
                          <div className="text-xs text-green-800 space-y-1">
                            <p>钱包地址: {testResult.address}</p>
                            <p>TRX 余额: {testResult.trxBalance?.toFixed(6)} TRX</p>
                            <p>USDT 余额: {testResult.usdtBalance?.toFixed(6)} USDT</p>
                          </div>
                        )}
                        {!testResult.success && testResult.error && (
                          <p className="text-xs text-red-700 mt-1">{testResult.error}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <Shield className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-sm font-bold text-amber-900 mb-1">安全提示</p>
                    <ul className="text-sm text-amber-800 space-y-1">
                      <li>• 私钥使用 AES-256-GCM 加密存储，只有服务器可以解密</li>
                      <li>• 私钥不会在前端显示或传输到浏览器</li>
                      <li>• 建议使用专用钱包，不要与个人资产混用</li>
                      <li>• 定期备份私钥到安全的离线位置</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 自动转账子标签 */}
            {currentSubTab === 'transfer' && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                <h2 className="text-xl font-black text-slate-900 mb-6">自动转账配置</h2>

                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-1">启用自动转账</label>
                    <p className="text-xs text-slate-500">支付完成后自动执行区块链转账</p>
                  </div>
                  <button
                    onClick={() => setConfig({ ...config, walletAutoTransferEnabled: !config.walletAutoTransferEnabled })}
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      config.walletAutoTransferEnabled ? 'bg-[#00A3FF]' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      config.walletAutoTransferEnabled ? 'translate-x-6' : ''
                    }`} />
                  </button>
                </div>

                <div className="mb-6">
                  <label className="text-sm font-bold text-slate-700 block mb-2">最大重试次数</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={config.walletMaxRetryCount}
                    onChange={(e) => setConfig({ ...config, walletMaxRetryCount: parseInt(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#00A3FF] outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">转账失败时自动重试的次数（建议 3 次）</p>
                </div>

                <div className="mb-6">
                  <label className="text-sm font-bold text-slate-700 block mb-2">TRX 最低余额预警</label>
                  <input
                    type="number"
                    min="10"
                    value={config.walletMinTRXBalance}
                    onChange={(e) => setConfig({ ...config, walletMinTRXBalance: parseInt(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#00A3FF] outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">TRX 余额低于此值时显示预警（建议 50 TRX）</p>
                </div>

                <div className="mb-6">
                  <label className="text-sm font-bold text-slate-700 block mb-2">USDT 最低余额预警</label>
                  <input
                    type="number"
                    min="10"
                    value={config.walletMinUSDTBalance}
                    onChange={(e) => setConfig({ ...config, walletMinUSDTBalance: parseInt(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#00A3FF] outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">USDT 余额低于此值时显示预警（建议 100 USDT）</p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 bg-[#00A3FF] hover:bg-[#0086D1] text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        保存中...
                      </>
                    ) : (
                      '保存配置'
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* 钱包管理标签 */}
        {currentTab === 'wallets' && (
          <>
            {/* 钱包详情页面 */}
            {selectedWallet ? (
              <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                {/* 头部 */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleBackToList}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div>
                      <h2 className="text-xl font-black text-slate-900">{selectedWallet.name}</h2>
                      <p className="text-xs text-slate-500">钱包详情</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRefreshWallet(selectedWallet._id || selectedWallet.id)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold flex items-center gap-2 transition-all"
                    >
                      <RefreshCw size={16} />
                      刷新
                    </button>
                  </div>
                </div>

                {/* 基本信息 */}
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-slate-700 mb-2">基本信息</h3>
                  <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">钱包地址</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-900">{selectedWallet.address}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(selectedWallet.address);
                            alert('地址已复制');
                          }}
                          className="p-1 hover:bg-slate-200 rounded text-slate-600"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">状态</span>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                          selectedWallet.health?.status === 'healthy' ? 'bg-green-100 text-green-700' :
                          selectedWallet.health?.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {selectedWallet.health?.status === 'healthy' ? '● 健康' :
                           selectedWallet.health?.status === 'warning' ? '● 警告' : '● 错误'}
                        </span>
                        {selectedWallet.enabled ? (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded">启用</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-xs font-bold rounded">禁用</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">优先级</span>
                      <span className="text-sm font-bold text-slate-900">{selectedWallet.priority}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">创建时间</span>
                      <span className="text-xs text-slate-900">{new Date(selectedWallet.createdAt).toLocaleString('zh-CN')}</span>
                    </div>
                  </div>
                </div>

                {/* 余额信息 */}
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-slate-700 mb-2">余额信息</h3>
                  <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">TRX:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-slate-900">{(selectedWallet.balance?.trx || 0).toFixed(2)}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                          (selectedWallet.balance?.trx || 0) < (selectedWallet.alerts?.minTrxBalance || 50)
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {(selectedWallet.balance?.trx || 0) < (selectedWallet.alerts?.minTrxBalance || 50) ? '不足' : '正常'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">USDT:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-slate-900">{(selectedWallet.balance?.usdt || 0).toFixed(2)}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                          (selectedWallet.balance?.usdt || 0) < (selectedWallet.alerts?.minUsdtBalance || 100)
                            ? 'bg-yellow-100 text-yellow-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {(selectedWallet.balance?.usdt || 0) < (selectedWallet.alerts?.minUsdtBalance || 100) ? '偏低' : '正常'}
                        </span>
                      </div>
                    </div>
                    {selectedWallet.balance?.lastUpdated && (
                      <div className="pt-2 border-t border-slate-200">
                        <p className="text-xs text-slate-500">
                          最后更新: {new Date(selectedWallet.balance.lastUpdated).toLocaleString('zh-CN')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 使用统计 */}
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-slate-700 mb-2">使用统计</h3>
                  <div className="bg-slate-50 rounded-lg p-3 space-y-2">
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
                        <p className="text-xs text-slate-500">
                          最后使用: {new Date(selectedWallet.stats.lastUsedAt).toLocaleString('zh-CN')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 资源信息 */}
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-slate-700 mb-2">资源信息</h3>
                  <div className="bg-slate-50 rounded-lg p-3 space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-600">能量</span>
                        <span className="text-xs font-bold text-slate-900">
                          {(selectedWallet.resources?.energy?.available || 0).toLocaleString()} / {(selectedWallet.resources?.energy?.limit || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div 
                          className="bg-orange-500 h-1.5 rounded-full transition-all"
                          style={{ 
                            width: `${(selectedWallet.resources?.energy?.limit || 0) > 0 ? ((selectedWallet.resources.energy.available / selectedWallet.resources.energy.limit) * 100) : 0}%` 
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-600">带宽</span>
                        <span className="text-xs font-bold text-slate-900">
                          {(selectedWallet.resources?.bandwidth?.available || 0).toLocaleString()} / {(selectedWallet.resources?.bandwidth?.limit || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div 
                          className="bg-purple-500 h-1.5 rounded-full transition-all"
                          style={{ 
                            width: `${(selectedWallet.resources?.bandwidth?.limit || 0) > 0 ? ((selectedWallet.resources.bandwidth.available / selectedWallet.resources.bandwidth.limit) * 100) : 0}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleToggleWallet(selectedWallet._id || selectedWallet.id, selectedWallet.enabled)}
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
                        handleBackToList();
                      }
                    }}
                    className="px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-bold transition-all"
                  >
                    删除钱包
                  </button>
                </div>
              </div>
            ) : (
              /* 钱包列表 */
              <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Wallet className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">钱包管理</h2>
                    <p className="text-xs text-slate-500">管理多个钱包，智能分配转账任务</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleRefreshAllWallets}
                    disabled={walletsLoading}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    <RefreshCw size={16} className={walletsLoading ? 'animate-spin' : ''} />
                    刷新全部
                  </button>
                  <button
                    onClick={() => setShowAddWallet(true)}
                    className="px-4 py-2 bg-[#00A3FF] hover:bg-[#0086D1] text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-all"
                  >
                    <Plus size={16} />
                    添加钱包
                  </button>
                </div>
              </div>

              {walletsLoading ? (
                <div className="text-center py-12">
                  <RefreshCw className="animate-spin mx-auto mb-4 text-slate-400" size={32} />
                  <p className="text-slate-500">加载中...</p>
                </div>
              ) : wallets.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wallet className="text-slate-400" size={32} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">还没有钱包</h3>
                  <p className="text-slate-500 mb-6">添加第一个钱包开始使用多钱包系统</p>
                  <button
                    onClick={() => setShowAddWallet(true)}
                    className="px-6 py-3 bg-[#00A3FF] hover:bg-[#0086D1] text-white rounded-lg font-bold transition-all"
                  >
                    添加钱包
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {wallets.map((wallet) => (
                    <div 
                      key={wallet._id || wallet.id} 
                      className={`border rounded-lg p-4 transition-all cursor-pointer ${
                        wallet.enabled ? 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md' : 'border-slate-300 bg-slate-50 opacity-75'
                      }`}
                      onClick={() => handleViewWallet(wallet._id || wallet.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-black text-slate-900">{wallet.name}</h3>
                            {wallet.enabled ? (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded">启用</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-xs font-bold rounded">禁用</span>
                            )}
                            <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                              wallet.health?.status === 'healthy' ? 'bg-green-100 text-green-700' :
                              wallet.health?.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {wallet.health?.status === 'healthy' ? '健康' :
                               wallet.health?.status === 'warning' ? '警告' : '错误'}
                            </span>
                          </div>
                          <p className="text-xs font-mono text-slate-600">{wallet.address}</p>
                        </div>
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleRefreshWallet(wallet._id || wallet.id)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                            title="刷新状态"
                          >
                            <RefreshCw size={16} className="text-slate-600" />
                          </button>
                          <button
                            onClick={() => handleToggleWallet(wallet._id || wallet.id, wallet.enabled)}
                            className={`px-3 py-2 rounded-lg font-bold text-xs transition-all ${
                              wallet.enabled 
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' 
                                : 'bg-green-100 hover:bg-green-200 text-green-700'
                            }`}
                            title={wallet.enabled ? '禁用钱包' : '启用钱包'}
                          >
                            {wallet.enabled ? '禁用' : '启用'}
                          </button>
                          <button
                            onClick={() => handleDeleteWallet(wallet._id || wallet.id, wallet.name)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-all"
                            title="删除"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-xs text-slate-600 mb-1">优先级</p>
                          <p className="text-lg font-black text-slate-900">{wallet.priority || 50}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-xs text-slate-600 mb-1">TRX 余额</p>
                          <p className="text-lg font-black text-slate-900">{(wallet.balance?.trx || 0).toFixed(2)}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-xs text-slate-600 mb-1">USDT 余额</p>
                          <p className="text-lg font-black text-slate-900">{(wallet.balance?.usdt || 0).toFixed(2)}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-xs text-slate-600 mb-1">交易次数</p>
                          <p className="text-lg font-black text-slate-900">{wallet.stats?.totalTransactions || 0}</p>
                        </div>
                      </div>

                      {(wallet.stats?.totalTransactions || 0) > 0 && (
                        <div className="flex items-center gap-4 text-xs text-slate-600">
                          <span>成功: {wallet.stats?.successCount || 0}</span>
                          <span>失败: {wallet.stats?.failCount || 0}</span>
                          <span>成功率: {(wallet.stats?.totalTransactions || 0) > 0 ? (((wallet.stats?.successCount || 0) / wallet.stats.totalTransactions) * 100).toFixed(1) : 0}%</span>
                          {wallet.stats?.lastUsedAt && (
                            <span>最后使用: {new Date(wallet.stats.lastUsedAt).toLocaleString('zh-CN')}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            )}

            {/* 添加钱包对话框 */}
            {showAddWallet && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-black text-slate-900 mb-4">添加钱包</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="text-sm font-bold text-slate-700 block mb-2">钱包名称</label>
                      <input
                        type="text"
                        value={newWallet.name}
                        onChange={(e) => setNewWallet({ ...newWallet, name: e.target.value })}
                        placeholder="例如：主钱包、备用钱包"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#00A3FF] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-bold text-slate-700 block mb-2">私钥</label>
                      <input
                        type="password"
                        value={newWallet.privateKey}
                        onChange={(e) => setNewWallet({ ...newWallet, privateKey: e.target.value })}
                        placeholder="64位十六进制私钥"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-[#00A3FF] outline-none"
                      />
                      <p className="text-xs text-slate-500 mt-1">私钥将使用 AES-256-GCM 加密存储</p>
                    </div>

                    <div>
                      <label className="text-sm font-bold text-slate-700 block mb-2">优先级（1-100）</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={newWallet.priority}
                        onChange={(e) => setNewWallet({ ...newWallet, priority: parseInt(e.target.value) || 50 })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#00A3FF] outline-none"
                      />
                      <p className="text-xs text-slate-500 mt-1">数值越高优先级越高，建议 50-100</p>
                    </div>

                    <div className="border-t border-slate-200 pt-4">
                      <h4 className="text-sm font-bold text-slate-700 mb-3">预警设置</h4>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-slate-600 block mb-1">TRX 最低余额</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="10"
                              value={newWallet.alerts.minTrxBalance}
                              onChange={(e) => setNewWallet({
                                ...newWallet,
                                alerts: { ...newWallet.alerts, minTrxBalance: parseInt(e.target.value) || 50 }
                              })}
                              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#00A3FF] outline-none"
                            />
                            <span className="text-xs text-slate-600">TRX</span>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-medium text-slate-600 block mb-1">USDT 最低余额</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="10"
                              value={newWallet.alerts.minUsdtBalance}
                              onChange={(e) => setNewWallet({
                                ...newWallet,
                                alerts: { ...newWallet.alerts, minUsdtBalance: parseInt(e.target.value) || 100 }
                              })}
                              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#00A3FF] outline-none"
                            />
                            <span className="text-xs text-slate-600">USDT</span>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-medium text-slate-600 block mb-1">最低能量</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="10000"
                              value={newWallet.alerts.minEnergy}
                              onChange={(e) => setNewWallet({
                                ...newWallet,
                                alerts: { ...newWallet.alerts, minEnergy: parseInt(e.target.value) || 50000 }
                              })}
                              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#00A3FF] outline-none"
                            />
                            <span className="text-xs text-slate-600">能量</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <label className="text-xs font-medium text-slate-700">启用余额预警</label>
                          <button
                            onClick={() => setNewWallet({
                              ...newWallet,
                              alerts: { ...newWallet.alerts, enabled: !newWallet.alerts.enabled }
                            })}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              newWallet.alerts.enabled ? 'bg-[#00A3FF]' : 'bg-slate-300'
                            }`}
                          >
                            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                              newWallet.alerts.enabled ? 'translate-x-6' : ''
                            }`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
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
                      }}
                      className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-all"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleAddWallet}
                      disabled={loading}
                      className="flex-1 px-4 py-3 bg-[#00A3FF] hover:bg-[#0086D1] text-white rounded-lg font-bold transition-all disabled:opacity-50"
                    >
                      {loading ? '添加中...' : '添加'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* 能量租赁标签 */}
        {currentTab === 'energy' && (
          <>
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
              <div className="flex items-center gap-2 mb-6">
                <Zap className="text-orange-600" size={20} />
                <h2 className="text-xl font-black text-slate-900">能量租赁配置</h2>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900 mb-2">
                  💡 <strong>按需租赁策略：</strong>系统只在实际转账时检查能量，如果不足才自动租赁。
                  无需提前储备能量，即使能量为 0 也没关系。
                </p>
                <p className="text-sm text-blue-900 mb-2">
                  🎯 <strong>智能判断：</strong>系统会自动检测目标地址是否首次接收 USDT：
                </p>
                <ul className="text-sm text-blue-800 ml-4 space-y-1 mb-2">
                  <li>• 首次转账（激活账户）：需要约 131,000 能量，租赁 20 TRX</li>
                  <li>• 后续转账（已有 USDT）：需要约 65,000 能量，租赁 10 TRX</li>
                  <li>• 一次租赁（20 TRX）获得约 200,000 能量，足够多笔转账</li>
                </ul>
                <p className="text-sm text-blue-900">
                  ⚙️ <strong>适用范围：</strong>此配置对所有钱包（包括默认钱包和多钱包系统中的所有钱包）生效。
                </p>
              </div>

              <div className="mb-6 flex items-center justify-between">
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-1">启用能量租赁</label>
                  <p className="text-xs text-slate-500">能量不足时自动租赁</p>
                </div>
                <button
                  onClick={() => setConfig({ ...config, energyRentalEnabled: !config.energyRentalEnabled })}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    config.energyRentalEnabled ? 'bg-[#00A3FF]' : 'bg-slate-300'
                  }`}
                >
                  <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    config.energyRentalEnabled ? 'translate-x-6' : ''
                  }`} />
                </button>
              </div>

              {config.energyRentalEnabled ? (
                <>
                  <div className="mb-6">
                    <label className="text-sm font-bold text-slate-700 block mb-2">租赁模式</label>
                    <select
                      value={config.energyRentalMode}
                      onChange={(e) => setConfig({ ...config, energyRentalMode: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                    >
                      <option value="transfer">转账租赁（向指定地址转账）</option>
                      <option value="catfee">API 购买（CatFee 平台）</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-1">
                      {config.energyRentalMode === 'transfer' 
                        ? '向能量服务商地址转账 TRX 来租赁能量' 
                        : '通过 CatFee API 直接购买能量，更快更稳定'}
                    </p>
                  </div>

                  {config.energyRentalMode === 'transfer' && (
                    <>
                      <div className="mb-6">
                        <label className="text-sm font-bold text-slate-700 block mb-2">租赁服务商地址</label>
                        <input
                          type="text"
                          value={config.energyRentalAddress}
                          onChange={(e) => setConfig({ ...config, energyRentalAddress: e.target.value })}
                          placeholder="输入能量租赁服务商的 TRON 地址"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-[#00A3FF] outline-none"
                        />
                        <p className="text-xs text-slate-500 mt-1">向此地址发送 TRX 后会收到能量</p>
                      </div>

                      <div className="mb-6">
                        <label className="text-sm font-bold text-slate-700 block mb-2">首次转账租赁金额（TRX）</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={config.energyRentalAmountFirst}
                          onChange={(e) => setConfig({ ...config, energyRentalAmountFirst: parseInt(e.target.value) })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#00A3FF] outline-none"
                        />
                        <p className="text-xs text-slate-500 mt-1">目标地址无 USDT 时的租赁金额（需要约 131,000 能量，建议 20 TRX）</p>
                      </div>

                      <div className="mb-6">
                        <label className="text-sm font-bold text-slate-700 block mb-2">正常转账租赁金额（TRX）</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={config.energyRentalAmountNormal}
                          onChange={(e) => setConfig({ ...config, energyRentalAmountNormal: parseInt(e.target.value) })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#00A3FF] outline-none"
                        />
                        <p className="text-xs text-slate-500 mt-1">目标地址有 USDT 时的租赁金额（需要约 65,000 能量，建议 10 TRX）</p>
                      </div>

                      <div className="mb-6">
                        <label className="text-sm font-bold text-slate-700 block mb-2">等待时间（秒）</label>
                        <input
                          type="number"
                          min="10"
                          max="120"
                          value={config.energyRentalWaitTime}
                          onChange={(e) => setConfig({ ...config, energyRentalWaitTime: parseInt(e.target.value) })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#00A3FF] outline-none"
                        />
                        <p className="text-xs text-slate-500 mt-1">等待能量到账的时间（建议 30 秒）</p>
                      </div>
                    </>
                  )}

                  {config.energyRentalMode === 'catfee' && (
                    <>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-blue-900 mb-2">
                          💡 <strong>CatFee 能量购买：</strong>通过 API 直接购买能量，无需等待，更加稳定。
                        </p>
                        <p className="text-sm text-blue-800 mb-2">
                          📖 <a href="https://docs.catfee.io/getting-started/buy-energy-via-api-on-catfee/api-overview" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">
                            查看 CatFee API 文档
                          </a> 获取 API Key 和 Secret
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

                      <div className="mb-6">
                        <label className="text-sm font-bold text-slate-700 block mb-2">
                          CatFee API 环境
                        </label>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <button
                            type="button"
                            onClick={() => setConfig({ ...config, catfeeApiUrl: 'https://api.catfee.io' })}
                            className={`px-4 py-3 rounded-lg border-2 text-sm font-bold transition-all ${
                              config.catfeeApiUrl === 'https://api.catfee.io'
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            🌐 生产环境
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfig({ ...config, catfeeApiUrl: 'https://nile.catfee.io' })}
                            className={`px-4 py-3 rounded-lg border-2 text-sm font-bold transition-all ${
                              config.catfeeApiUrl === 'https://nile.catfee.io'
                                ? 'border-orange-500 bg-orange-50 text-orange-700'
                                : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            🧪 测试环境 (Nile)
                          </button>
                        </div>
                        <input
                          type="text"
                          value={config.catfeeApiUrl}
                          onChange={(e) => setConfig({ ...config, catfeeApiUrl: e.target.value })}
                          placeholder="https://api.catfee.io"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-[#00A3FF] outline-none"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          {config.catfeeApiUrl === 'https://api.catfee.io' && '✅ 当前：生产环境 - 使用真实 TRX 购买能量'}
                          {config.catfeeApiUrl === 'https://nile.catfee.io' && '⚠️ 当前：测试环境 - 使用测试币，适合开发调试'}
                          {config.catfeeApiUrl !== 'https://api.catfee.io' && config.catfeeApiUrl !== 'https://nile.catfee.io' && '自定义 API 地址'}
                        </p>
                      </div>

                      <div className="mb-6 space-y-4">
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <p className="text-sm text-amber-900 mb-2">
                            🔑 <strong>获取 API 凭证：</strong>
                          </p>
                          <ol className="text-xs text-amber-800 space-y-1 ml-4 list-decimal">
                            <li>登录 CatFee 后台（{config.catfeeApiUrl === 'https://nile.catfee.io' ? '测试环境' : '生产环境'}）</li>
                            <li>进入【个人中心】→【API】→【API 配置】</li>
                            <li>复制 <strong>API Key</strong> 和 <strong>API Secret</strong> 两个值</li>
                            <li>分别粘贴到下方输入框</li>
                          </ol>
                        </div>

                        <div>
                          <label className="text-sm font-bold text-slate-700 block mb-2">
                            API Key <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={config.catfeeApiKey?.split(':')[0] || ''}
                            onChange={(e) => {
                              const secret = config.catfeeApiKey?.split(':')[1] || '';
                              const newValue = secret ? `${e.target.value}:${secret}` : e.target.value;
                              setConfig({ ...config, catfeeApiKey: newValue });
                            }}
                            placeholder="例如: 40e7c486-c18e-40d4-9502-35423dcdb70e"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-[#00A3FF] outline-none"
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            在 CatFee 后台【API 配置】页面复制 API Key
                          </p>
                        </div>

                        <div>
                          <label className="text-sm font-bold text-slate-700 block mb-2">
                            API Secret <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={config.catfeeApiKey?.split(':')[1] || ''}
                            onChange={(e) => {
                              const key = config.catfeeApiKey?.split(':')[0] || '';
                              const newValue = key ? `${key}:${e.target.value}` : `:${e.target.value}`;
                              setConfig({ ...config, catfeeApiKey: newValue });
                            }}
                            placeholder="例如: a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-[#00A3FF] outline-none"
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            在 CatFee 后台【API 配置】页面复制 API Secret
                          </p>
                        </div>

                        {config.catfeeApiKey && config.catfeeApiKey.includes(':') && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-xs text-green-800">
                              ✅ API 凭证已配置完整
                            </p>
                          </div>
                        )}
                        
                        {config.catfeeApiKey && !config.catfeeApiKey.includes(':') && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-xs text-red-800">
                              ⚠️ 请同时配置 API Key 和 API Secret
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="mb-6">
                        <label className="text-sm font-bold text-slate-700 block mb-2">首次转账能量（Energy）</label>
                        <input
                          type="number"
                          min="10000"
                          step="1000"
                          value={config.catfeeEnergyFirst}
                          onChange={(e) => setConfig({ ...config, catfeeEnergyFirst: parseInt(e.target.value) })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#00A3FF] outline-none"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          目标地址无 USDT 时购买的能量（建议 131000）
                        </p>
                      </div>

                      <div className="mb-6">
                        <label className="text-sm font-bold text-slate-700 block mb-2">正常转账能量（Energy）</label>
                        <input
                          type="number"
                          min="10000"
                          step="1000"
                          value={config.catfeeEnergyNormal}
                          onChange={(e) => setConfig({ ...config, catfeeEnergyNormal: parseInt(e.target.value) })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#00A3FF] outline-none"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          目标地址有 USDT 时购买的能量（建议 65000）
                        </p>
                      </div>

                      <div className="mb-6">
                        <label className="text-sm font-bold text-slate-700 block mb-2">租赁时长</label>
                        <select
                          value={config.catfeePeriod}
                          onChange={(e) => setConfig({ ...config, catfeePeriod: parseInt(e.target.value) })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-[#00A3FF] outline-none"
                        >
                          <option value="1">1 小时</option>
                          <option value="3">3 小时</option>
                        </select>
                        <p className="text-xs text-slate-500 mt-1">
                          能量的有效期，建议选择 1 小时
                        </p>
                      </div>
                    </>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex-1 bg-[#00A3FF] hover:bg-[#0086D1] text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <RefreshCw size={18} className="animate-spin" />
                          保存中...
                        </>
                      ) : (
                        '保存配置'
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="text-slate-400" size={32} />
                  </div>
                  <p className="text-slate-500 mb-4">能量租赁功能未启用</p>
                  <p className="text-sm text-slate-400">
                    启用后，系统会在能量不足时自动租赁能量，节省转账成本
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-black text-slate-900 mb-4">资源管理说明</h3>
              <div className="space-y-4 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Zap className="text-orange-600" size={14} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 mb-1">能量租赁（按需）</p>
                    <p>只在转账时检查能量，不足才租赁。无需提前储备，避免浪费。</p>
                    <p className="text-xs text-slate-500 mt-1">成本：约 1.4 TRX/笔，一次租赁支持 6-7 笔转账</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Battery className="text-indigo-600" size={14} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 mb-1">质押 TRX</p>
                    <p>在钱包中质押 TRX 获取能量和带宽。适合高频转账场景。</p>
                    <p className="text-xs text-slate-500 mt-1">成本：几乎为 0（质押可随时解除）</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Wifi className="text-purple-600" size={14} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 mb-1">免费带宽</p>
                    <p>每个账户每天有 1,500 免费带宽，足够 4-5 笔转账。</p>
                    <p className="text-xs text-slate-500 mt-1">成本：完全免费</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default WalletConfigPage;
