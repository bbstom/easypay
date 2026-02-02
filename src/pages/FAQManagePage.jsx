import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, Plus, Edit, Trash2, Eye, EyeOff, Save, X } from 'lucide-react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

const FAQManagePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '常见问题',
    order: 0,
    enabled: true
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchFAQs();
  }, [user, navigate]);

  const fetchFAQs = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/faq/admin/list');
      setFaqs(data.faqs);
    } catch (error) {
      console.error('获取FAQ列表失败:', error);
      alert('获取FAQ列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingFaq(null);
    setFormData({
      question: '',
      answer: '',
      category: '常见问题',
      order: 0,
      enabled: true
    });
    setShowEditor(true);
  };

  const handleEdit = (faq) => {
    setEditingFaq(faq);
    // 将 <br> 标签转换回换行符，以便在编辑器中正确显示
    const answerWithNewlines = faq.answer.replace(/<br\s*\/?>/gi, '\n');
    setFormData({
      question: faq.question,
      answer: answerWithNewlines,
      category: faq.category,
      order: faq.order,
      enabled: faq.enabled
    });
    setShowEditor(true);
  };

  const handleSave = async () => {
    if (!formData.question || !formData.answer) {
      alert('问题和答案不能为空');
      return;
    }

    setLoading(true);
    try {
      // 将换行符转换为 <br> 标签，以便正确显示
      const processedAnswer = formData.answer.replace(/\n/g, '<br>');
      
      const dataToSave = {
        ...formData,
        answer: processedAnswer
      };
      
      if (editingFaq) {
        await axios.put(`/api/faq/${editingFaq._id}`, dataToSave);
        alert('FAQ更新成功');
      } else {
        await axios.post('/api/faq', dataToSave);
        alert('FAQ创建成功');
      }
      setShowEditor(false);
      await fetchFAQs();
    } catch (error) {
      alert('操作失败: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, question) => {
    if (!confirm(`确定要删除"${question}"吗？`)) {
      return;
    }

    try {
      await axios.delete(`/api/faq/${id}`);
      alert('删除成功');
      await fetchFAQs();
    } catch (error) {
      alert('删除失败: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleToggle = async (id, enabled) => {
    try {
      await axios.put(`/api/faq/${id}`, { enabled: !enabled });
      await fetchFAQs();
    } catch (error) {
      alert('操作失败: ' + (error.response?.data?.error || error.message));
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <HelpCircle className="text-blue-600" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">常见问题管理</h2>
                <p className="text-xs text-slate-500">管理用户常见问题和答案</p>
              </div>
            </div>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-[#00A3FF] hover:bg-[#0086D1] text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-all"
            >
              <Plus size={16} />
              添加FAQ
            </button>
          </div>

          {loading && !showEditor ? (
            <div className="text-center py-12">
              <p className="text-slate-500">加载中...</p>
            </div>
          ) : faqs.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="mx-auto mb-4 text-slate-300" size={48} />
              <p className="text-slate-500 mb-4">还没有FAQ</p>
              <button
                onClick={handleAdd}
                className="px-6 py-3 bg-[#00A3FF] hover:bg-[#0086D1] text-white rounded-lg font-bold transition-all"
              >
                添加第一个FAQ
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {faqs.map((faq) => (
                <div
                  key={faq._id}
                  className={`border rounded-lg p-4 transition-all ${
                    faq.enabled ? 'border-slate-200 bg-white' : 'border-slate-300 bg-slate-50 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                          {faq.category}
                        </span>
                        <span className="text-xs text-slate-500">排序: {faq.order}</span>
                        <span className="text-xs text-slate-500">浏览: {faq.views}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-2">{faq.question}</h3>
                      <div 
                        className="text-sm text-slate-600 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: faq.answer }}
                      />
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleToggle(faq._id, faq.enabled)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                        title={faq.enabled ? '禁用' : '启用'}
                      >
                        {faq.enabled ? (
                          <Eye size={16} className="text-slate-600" />
                        ) : (
                          <EyeOff size={16} className="text-slate-400" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(faq)}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-all"
                        title="编辑"
                      >
                        <Edit size={16} className="text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(faq._id, faq.question)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-all"
                        title="删除"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 编辑器对话框 */}
        {showEditor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900">
                  {editingFaq ? '编辑FAQ' : '添加FAQ'}
                </h3>
                <button
                  onClick={() => setShowEditor(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">问题</label>
                  <input
                    type="text"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    placeholder="输入问题"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#00A3FF] outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">
                    答案 <span className="text-xs text-slate-500">(支持HTML格式)</span>
                  </label>
                  <textarea
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    placeholder="输入答案，支持HTML标签如 <a href='链接'>文字</a> 或 <img src='图片链接' />"
                    rows={8}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#00A3FF] outline-none font-mono"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    示例：文字 &lt;a href="https://example.com" target="_blank"&gt;链接&lt;/a&gt; &lt;img src="图片URL" alt="图片" /&gt;
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-2">分类</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="常见问题"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#00A3FF] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-2">排序</label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#00A3FF] outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="text-sm font-bold text-slate-700">启用</label>
                  <button
                    onClick={() => setFormData({ ...formData, enabled: !formData.enabled })}
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      formData.enabled ? 'bg-[#00A3FF]' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      formData.enabled ? 'translate-x-6' : ''
                    }`} />
                  </button>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex gap-3">
                <button
                  onClick={() => setShowEditor(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-all"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-[#00A3FF] hover:bg-[#0086D1] text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <Save size={18} />
                  {loading ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default FAQManagePage;
