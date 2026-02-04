import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Save, Zap } from 'lucide-react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

const EnergySystemPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);

  // 从URL获取当前tab
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'address';

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchSettings();
  }, [user, navigate]);

  const fetchSettings = async () => {
    try {
      const { data } = await axios.get('/api/settings');
      setSettings(data);
    } catch (error) {
      console.error('获取设置失败:', error);
    }
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
      <div className="bg-white rounded-xl border border-slate-200 p-8">
        {/* 收款地址配置 */}
        {activeTab === 'address' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                <Zap className="text-white" size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-800">收款地址配置</h2>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-orange-800">
                💡 配置能量租赁收款地址后，用户可以在能量租赁页面看到该地址和二维码
              </p>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-600 block mb-2">能量租赁收款地址</label>
              <input
                type="text"
                value={settings.energyRentalAddress || ''}
                onChange={(e) => setSettings({ ...settings, energyRentalAddress: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="TRX地址"
              />
              <p className="text-xs text-slate-500 mt-1">用于接收能量租赁的TRX转账</p>
            </div>
          </div>
        )}

        {/* 价格配置 */}
        {activeTab === 'price' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                <Zap className="text-white" size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-800">价格配置</h2>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-blue-800">
                💡 设置能量租赁的价格比例
              </p>
            </div>

            {/* 价格设置 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-slate-600 block mb-2">TRX 数量</label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.energyPriceTrx || 1}
                  onChange={(e) => setSettings({ ...settings, energyPriceTrx: parseFloat(e.target.value) || 1 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="1"
                  min="0.1"
                />
                <p className="text-xs text-slate-500 mt-1">支持小数，如 0.5、1.5、2.8 等</p>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-600 block mb-2">能量数量</label>
                <input
                  type="number"
                  value={settings.energyPriceEnergy || 65000}
                  onChange={(e) => setSettings({ ...settings, energyPriceEnergy: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="65000"
                  min="0"
                  step="1000"
                />
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-sm font-bold text-slate-700 mb-2">当前价格</p>
              <p className="text-2xl font-black text-orange-600">
                {settings.energyPriceTrx || 1} TRX = {(settings.energyPriceEnergy || 65000).toLocaleString()} 能量
              </p>
            </div>

            {/* 其他配置 */}
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-black text-slate-800 mb-4">其他配置</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-bold text-slate-600 block mb-2">最小金额（TRX）</label>
                  <input
                    type="number"
                    value={settings.energyMinAmount || 10}
                    onChange={(e) => setSettings({ ...settings, energyMinAmount: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="10"
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-600 block mb-2">能量有效期（小时）</label>
                  <input
                    type="number"
                    value={settings.energyValidityHours || 24}
                    onChange={(e) => setSettings({ ...settings, energyValidityHours: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="24"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-600 block mb-2">重要提示（自定义内容）</label>
                <textarea
                  value={settings.energyNotice || ''}
                  onChange={(e) => setSettings({ ...settings, energyNotice: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none"
                  rows="4"
                  placeholder="仅支持 TRX 转账&#10;最小金额：10 TRX&#10;能量有效期：24小时"
                />
                <p className="text-xs text-slate-500 mt-1">每行一条提示，将显示在用户端的"重要提示"区域</p>
              </div>
            </div>

            {/* 价格参考 */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h3 className="text-sm font-bold text-slate-700 mb-3">价格参考</h3>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>标准价格：</span>
                  <span className="font-mono">1 TRX ≈ 65,000 能量</span>
                </div>
                <div className="flex justify-between">
                  <span>优惠价格：</span>
                  <span className="font-mono">1 TRX ≈ 70,000 能量</span>
                </div>
                <div className="flex justify-between">
                  <span>高峰价格：</span>
                  <span className="font-mono">1 TRX ≈ 60,000 能量</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default EnergySystemPage;
