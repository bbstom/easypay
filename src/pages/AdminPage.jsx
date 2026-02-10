import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Edit, Trash2, Image as ImageIcon, Type } from 'lucide-react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [ads, setAds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'text',
    content: '',
    imageUrl: '',
    link: '',
    height: 120,
    position: 'workspace-top',
    order: 0,
    isActive: true,
    backgroundColor: '#E0F2FE',
    textColor: '#00A3FF',
    isBold: true
  });

  // 从URL获取当前位置
  const searchParams = new URLSearchParams(location.search);
  const activePosition = searchParams.get('tab') || 'home-bottom';

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchAds();
  }, [user, navigate]);

  const fetchAds = async () => {
    try {
      const { data } = await axios.get('/api/ads/all');
      setAds(data);
    } catch (error) {
      console.error(error);
    }
  };

  // 根据当前位置筛选广告
  const filteredAds = ads.filter(ad => ad.position === activePosition);

  // 位置名称映射
  const positionNames = {
    'home-bottom': '主页底部',
    'workspace-top': '工作台顶部',
    'workspace-middle': '工作台中部',
    'workspace-bottom': '工作台底部',
    'swap-bottom': '闪兑页面底部',
    'energy-bottom': '能量租赁页面底部'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAd) {
        await axios.put(`/api/ads/${editingAd._id}`, formData);
      } else {
        await axios.post('/api/ads', formData);
      }
      setShowModal(false);
      setEditingAd(null);
      setFormData({ title: '', type: 'text', content: '', imageUrl: '', link: '', height: 120, position: activePosition, order: 0, isActive: true });
      fetchAds();
    } catch (error) {
      alert('操作失败：' + error.response?.data?.error);
    }
  };

  const handleEdit = (ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title || '',
      type: ad.type || 'text',
      content: ad.content || '',
      imageUrl: ad.imageUrl || '',
      link: ad.link || '',
      height: ad.height || 120,
      position: ad.position || 'workspace-top',
      order: ad.order || 0,
      isActive: ad.isActive !== undefined ? ad.isActive : true,
      backgroundColor: ad.backgroundColor || '#E0F2FE',
      textColor: ad.textColor || '#00A3FF',
      isBold: ad.isBold !== undefined ? ad.isBold : true
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('确定删除此广告？')) return;
    try {
      await axios.delete(`/api/ads/${id}`);
      fetchAds();
    } catch (error) {
      alert('删除失败');
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-800 mb-2">广告管理 - {positionNames[activePosition]}</h1>
        <p className="text-sm text-slate-500">管理 {positionNames[activePosition]} 的广告内容</p>
      </div>

      <div className="flex justify-between items-center mb-8">
        <button onClick={() => { setShowModal(true); setEditingAd(null); setFormData({ title: '', type: 'text', content: '', imageUrl: '', link: '', height: 120, position: activePosition, order: 0, isActive: true, backgroundColor: '#E0F2FE', textColor: '#00A3FF', isBold: true }); }} className="bg-[#00A3FF] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#0086D1] transition-all ml-auto">
          <Plus size={20} /> 新建广告
        </button>
      </div>

      {filteredAds.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-12 text-center">
          <p className="text-slate-400 mb-2">暂无广告</p>
          <p className="text-xs text-slate-400">点击"新建广告"按钮创建第一个广告</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAds.map(ad => (
          <div key={ad._id} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {ad.type === 'text' ? <Type size={20} className="text-slate-400" /> : <ImageIcon size={20} className="text-slate-400" />}
                <h3 className="font-black text-slate-800">{ad.title}</h3>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-bold ${ad.isActive ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                {ad.isActive ? '启用' : '禁用'}
              </span>
            </div>
            {ad.type === 'image' && ad.imageUrl && (
              <img src={ad.imageUrl} alt={ad.title} className="w-full h-32 object-cover rounded-lg" />
            )}
            <p className="text-sm text-slate-500 line-clamp-2">{ad.content}</p>
            <div className="text-xs text-slate-400 font-mono space-y-1">
              <div>高度: {ad.height}px</div>
              <div>位置: {ad.position} | 排序: {ad.order}</div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => handleEdit(ad)} className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-lg font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-1">
                <Edit size={16} /> 编辑
              </button>
              <button onClick={() => handleDelete(ad._id)} className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-1">
                <Trash2 size={16} /> 删除
              </button>
            </div>
          </div>
        ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black text-slate-800 mb-6">{editingAd ? '编辑广告' : '新建广告'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">标题</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-500 outline-none" required />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">类型</label>
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-500 outline-none">
                  <option value="text">纯文字</option>
                  <option value="image">图片</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">内容</label>
                <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-500 outline-none" rows="3" required />
              </div>
              {formData.type === 'image' && (
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">图片链接</label>
                  <input type="url" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-500 outline-none" />
                </div>
              )}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">跳转链接</label>
                <input type="url" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-500 outline-none" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">高度 (px)</label>
                  <input type="number" value={formData.height} onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">位置</label>
                  <select value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-500 outline-none" disabled>
                    <option value="home-bottom">主页底部</option>
                    <option value="workspace-top">工作台顶部（一句话）</option>
                    <option value="workspace-middle">工作台中部</option>
                    <option value="workspace-bottom">工作台底部</option>
                    <option value="swap-bottom">闪兑页面底部</option>
                    <option value="energy-bottom">能量租赁页面底部</option>
                  </select>
                  <p className="text-xs text-slate-400 mt-1">位置由当前标签页决定，不可修改</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">排序</label>
                  <input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-500 outline-none" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-5 h-5" />
                <label className="text-sm font-bold text-slate-600">启用广告</label>
              </div>
              
              {/* 样式配置 - 仅工作台顶部广告显示 */}
              {formData.position === 'workspace-top' && (
                <div className="border-t border-slate-200 pt-4 mt-4">
                  <h3 className="text-sm font-black text-slate-700 mb-4">🎨 样式配置</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">背景颜色</label>
                      <div className="flex gap-2">
                        <input 
                          type="color" 
                          value={formData.backgroundColor} 
                          onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })} 
                          className="w-12 h-10 rounded-lg border border-slate-200 cursor-pointer"
                        />
                        <input 
                          type="text" 
                          value={formData.backgroundColor} 
                          onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })} 
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-cyan-500 outline-none font-mono text-sm"
                          placeholder="#E0F2FE"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">文字颜色</label>
                      <div className="flex gap-2">
                        <input 
                          type="color" 
                          value={formData.textColor} 
                          onChange={(e) => setFormData({ ...formData, textColor: e.target.value })} 
                          className="w-12 h-10 rounded-lg border border-slate-200 cursor-pointer"
                        />
                        <input 
                          type="text" 
                          value={formData.textColor} 
                          onChange={(e) => setFormData({ ...formData, textColor: e.target.value })} 
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-cyan-500 outline-none font-mono text-sm"
                          placeholder="#00A3FF"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <input 
                      type="checkbox" 
                      checked={formData.isBold} 
                      onChange={(e) => setFormData({ ...formData, isBold: e.target.checked })} 
                      className="w-5 h-5" 
                    />
                    <label className="text-sm font-bold text-slate-600">文字加粗显示</label>
                  </div>
                  {/* 预览 */}
                  <div className="mt-4">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">预览效果</label>
                    <div 
                      className="rounded-xl border px-6 py-3"
                      style={{ backgroundColor: formData.backgroundColor }}
                    >
                      <p 
                        className="text-sm text-center"
                        style={{ 
                          color: formData.textColor,
                          fontWeight: formData.isBold ? 'bold' : 'normal'
                        }}
                      >
                        {formData.content || '这里是广告内容预览'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-cyan-500 text-white py-3 rounded-xl font-bold hover:bg-cyan-600 transition-all">
                  {editingAd ? '保存修改' : '创建广告'}
                </button>
                <button type="button" onClick={() => { setShowModal(false); setEditingAd(null); }} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all">
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminPage;
