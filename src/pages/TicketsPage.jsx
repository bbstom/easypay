import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Plus, Clock, CheckCircle, AlertCircle, Send, X } from 'lucide-react';
import axios from 'axios';
import UserLayout from '../components/UserLayout';

const TicketsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [replyMessage, setReplyMessage] = useState('');
  
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    category: 'other',
    priority: 'medium'
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchTickets();
  }, [user, navigate, filterStatus]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = filterStatus !== 'all' ? { status: filterStatus } : {};
      const { data } = await axios.get('/api/tickets/my', { params });
      setTickets(data.tickets);
    } catch (error) {
      console.error('获取工单失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!formData.subject || !formData.message) {
      alert('标题和内容不能为空');
      return;
    }

    try {
      await axios.post('/api/tickets', formData);
      alert('工单创建成功');
      setShowCreateModal(false);
      setFormData({
        subject: '',
        message: '',
        category: 'other',
        priority: 'medium'
      });
      fetchTickets();
    } catch (error) {
      alert('创建失败: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleReply = async (ticketId) => {
    if (!replyMessage.trim()) {
      alert('回复内容不能为空');
      return;
    }

    try {
      await axios.post(`/api/tickets/${ticketId}/reply`, { message: replyMessage });
      setReplyMessage('');
      const { data } = await axios.get(`/api/tickets/${ticketId}`);
      setSelectedTicket(data.ticket);
      fetchTickets();
    } catch (error) {
      alert('回复失败: ' + (error.response?.data?.error || error.message));
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      open: { text: '待处理', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      in_progress: { text: '处理中', color: 'bg-blue-100 text-blue-700', icon: AlertCircle },
      waiting_user: { text: '等待回复', color: 'bg-purple-100 text-purple-700', icon: MessageSquare },
      resolved: { text: '已解决', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      closed: { text: '已关闭', color: 'bg-slate-100 text-slate-700', icon: CheckCircle }
    };
    const config = statusMap[status] || statusMap.open;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${config.color}`}>
        <Icon size={12} />
        {config.text}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityMap = {
      low: { text: '低', color: 'text-slate-600' },
      medium: { text: '中', color: 'text-blue-600' },
      high: { text: '高', color: 'text-orange-600' },
      urgent: { text: '紧急', color: 'text-red-600' }
    };
    const config = priorityMap[priority] || priorityMap.medium;
    return <span className={`text-xs font-bold ${config.color}`}>优先级: {config.text}</span>;
  };

  const getCategoryText = (category) => {
    const categoryMap = {
      payment: '支付问题',
      technical: '技术问题',
      account: '账户问题',
      other: '其他'
    };
    return categoryMap[category] || '其他';
  };

  if (!user) return null;

  return (
    <UserLayout>
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-cyan-500 outline-none"
              >
                <option value="all">全部状态</option>
                <option value="open">待处理</option>
                <option value="in_progress">处理中</option>
                <option value="waiting_user">等待回复</option>
                <option value="resolved">已解决</option>
                <option value="closed">已关闭</option>
              </select>
              <span className="text-sm text-slate-600">共 {tickets.length} 个工单</span>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-cyan-200"
            >
              <Plus size={16} />
              创建工单
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-500">加载中...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
            <MessageSquare className="mx-auto mb-4 text-slate-300" size={48} />
            <p className="text-slate-500 mb-4">还没有工单</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
            >
              创建第一个工单
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket._id}
                onClick={() => setSelectedTicket(ticket)}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-sm text-slate-600">{ticket.ticketNumber}</span>
                      {getStatusBadge(ticket.status)}
                      <span className="text-xs text-slate-400">|</span>
                      {getPriorityBadge(ticket.priority)}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{ticket.subject}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2">{ticket.message}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{getCategoryText(ticket.category)}</span>
                  <div className="flex items-center gap-4">
                    <span>{ticket.replies.length} 条回复</span>
                    <span>{new Date(ticket.createdAt).toLocaleString('zh-CN')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900">创建工单</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">工单标题</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="简要描述您的问题"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">问题描述</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="详细描述您遇到的问题..."
                    rows={6}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-2">问题类型</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                    >
                      <option value="payment">支付问题</option>
                      <option value="technical">技术问题</option>
                      <option value="account">账户问题</option>
                      <option value="other">其他</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-2">优先级</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                    >
                      <option value="low">低</option>
                      <option value="medium">中</option>
                      <option value="high">高</option>
                      <option value="urgent">紧急</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-all"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateTicket}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg font-bold transition-all"
                >
                  提交工单
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900">{selectedTicket.subject}</h3>
                  <p className="text-sm text-slate-500 mt-1">工单号: {selectedTicket.ticketNumber}</p>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  {getStatusBadge(selectedTicket.status)}
                  {getPriorityBadge(selectedTicket.priority)}
                  <span className="text-sm text-slate-600">{getCategoryText(selectedTicket.category)}</span>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{selectedTicket.userId.username[0].toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{selectedTicket.userId.username}</p>
                      <p className="text-xs text-slate-500">{new Date(selectedTicket.createdAt).toLocaleString('zh-CN')}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedTicket.message}</p>
                </div>

                {selectedTicket.replies.length > 0 && (
                  <div className="space-y-4 mb-6">
                    <h4 className="text-sm font-bold text-slate-700">回复记录</h4>
                    {selectedTicket.replies.map((reply, index) => {
                      // 安全检查：确保 userId 存在
                      if (!reply.userId) {
                        console.warn('回复缺少用户信息:', reply);
                        return null;
                      }
                      
                      return (
                        <div
                          key={index}
                          className={`rounded-lg p-4 ${
                            reply.isAdmin ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              reply.isAdmin ? 'bg-blue-600' : 'bg-gradient-to-tr from-cyan-500 to-blue-600'
                            }`}>
                              <span className="text-white text-xs font-bold">
                                {reply.userId.username?.[0]?.toUpperCase() || '?'}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                {reply.userId.username || '未知用户'}
                                {reply.isAdmin && <span className="ml-2 text-xs text-blue-600">(管理员)</span>}
                              </p>
                              <p className="text-xs text-slate-500">{new Date(reply.createdAt).toLocaleString('zh-CN')}</p>
                            </div>
                          </div>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">{reply.message}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {selectedTicket.status !== 'closed' && (
                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-2">添加回复</label>
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="输入您的回复..."
                      rows={4}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-cyan-500 outline-none mb-3"
                    />
                    <button
                      onClick={() => handleReply(selectedTicket._id)}
                      className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
                    >
                      <Send size={16} />
                      发送回复
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default TicketsPage;
