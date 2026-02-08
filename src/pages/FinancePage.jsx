import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Download, Search, ChevronLeft, ChevronRight, RefreshCw, CheckCircle } from 'lucide-react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

const FinancePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    todayRevenue: 0,
    totalOrders: 0,
    todayOrders: 0,
    successRate: 0
  });
  const [filter, setFilter] = useState({
    status: 'all',
    payType: 'all',
    startDate: '',
    endDate: '',
    search: ''
  });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [retryingPayment, setRetryingPayment] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchPayments();
    fetchStats();
  }, [user, navigate]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/payments/all');
      setPayments(data);
    } catch (error) {
      console.error('获取订单失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await axios.get('/api/payments/stats');
      setStats(data);
    } catch (error) {
      console.error('获取统计失败:', error);
    }
  };

  const handleRetryTransfer = async (paymentId) => {
    if (!confirm('确定要手动补单吗？\n\n系统会重新执行代付操作，请确保：\n1. 用户已成功支付\n2. 代付地址正确\n3. 钱包余额充足')) return;
    
    setRetryingPayment(paymentId);
    try {
      await axios.post(`/api/payments/retry/${paymentId}`);
      alert('✅ 补单成功！\n\n系统已开始重新执行代付，请稍后刷新查看结果。');
      setTimeout(() => {
        fetchPayments();
      }, 3000);
    } catch (error) {
      alert('❌ 补单失败\n\n' + (error.response?.data?.error || error.message));
    } finally {
      setRetryingPayment(null);
    }
  };

  const filteredPayments = payments.filter(payment => {
    if (filter.status !== 'all' && payment.status !== filter.status) return false;
    if (filter.payType !== 'all' && payment.payType !== filter.payType) return false;
    if (filter.search && !payment.address.toLowerCase().includes(filter.search.toLowerCase()) 
        && !payment.platformOrderId?.toLowerCase().includes(filter.search.toLowerCase())) return false;
    if (filter.startDate && new Date(payment.createdAt) < new Date(filter.startDate)) return false;
    if (filter.endDate && new Date(payment.createdAt) > new Date(filter.endDate)) return false;
    return true;
  });

  // 分页逻辑
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayments = filteredPayments.slice(startIndex, endIndex);

  // 当筛选条件改变时重置到第一页
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const exportData = () => {
    const csv = [
      ['订单号', '类型', '数量', '地址', '总额(CNY)', '服务费(CNY)', '支付方式', '状态', '支付时间', '代付时间', '交易哈希', '创建时间'],
      ...filteredPayments.map(p => [
        p.platformOrderId || '',
        p.payType,
        p.amount,
        p.address,
        p.totalCNY,
        p.serviceFee || 0,
        p.paymentMethod === 'alipay' ? '支付宝' : '微信',
        p.status,
        p.paymentTime ? new Date(p.paymentTime).toLocaleString('zh-CN') : '',
        p.transferTime ? new Date(p.transferTime).toLocaleString('zh-CN') : '',
        p.txHash || '',
        new Date(p.createdAt).toLocaleString('zh-CN')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `财务报表_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <AdminLayout>
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <DollarSign className="text-blue-600" size={24} />
            </div>
            <span className="text-xs font-bold text-green-600 flex items-center gap-1">
              <TrendingUp size={14} />
              +12.5%
            </span>
          </div>
          <p className="text-sm text-slate-500 font-medium mb-1">总收入</p>
          <p className="text-2xl font-black text-slate-900">¥ {stats.totalRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <span className="text-xs font-bold text-green-600 flex items-center gap-1">
              <TrendingUp size={14} />
              +8.2%
            </span>
          </div>
          <p className="text-sm text-slate-500 font-medium mb-1">今日收入</p>
          <p className="text-2xl font-black text-slate-900">¥ {stats.todayRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <Calendar className="text-purple-600" size={24} />
            </div>
            <span className="text-xs font-bold text-slate-400">总订单</span>
          </div>
          <p className="text-sm text-slate-500 font-medium mb-1">订单总数</p>
          <p className="text-2xl font-black text-slate-900">{stats.totalOrders.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
              <Calendar className="text-orange-600" size={24} />
            </div>
            <span className="text-xs font-bold text-green-600">{stats.successRate}%</span>
          </div>
          <p className="text-sm text-slate-500 font-medium mb-1">今日订单</p>
          <p className="text-2xl font-black text-slate-900">{stats.todayOrders} 单</p>
        </div>
      </div>

      {/* 筛选和导出 */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-2">状态</label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#00A3FF] outline-none"
            >
              <option value="all">全部</option>
              <option value="pending">待支付</option>
              <option value="paid">已支付</option>
              <option value="completed">已完成</option>
              <option value="failed">失败</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-2">类型</label>
            <select
              value={filter.payType}
              onChange={(e) => setFilter({ ...filter, payType: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#00A3FF] outline-none"
            >
              <option value="all">全部</option>
              <option value="USDT">USDT</option>
              <option value="TRX">TRX</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-2">开始日期</label>
            <input
              type="date"
              value={filter.startDate}
              onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#00A3FF] outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-2">结束日期</label>
            <input
              type="date"
              value={filter.endDate}
              onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#00A3FF] outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-2">搜索</label>
            <div className="relative">
              <input
                type="text"
                placeholder="订单号/地址"
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-[#00A3FF] outline-none"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={exportData}
            className="bg-[#00A3FF] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#0086D1] transition-all"
          >
            <Download size={16} />
            导出报表
          </button>
        </div>
      </div>

      {/* 订单列表 */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full" style={{ minWidth: '1600px' }}>
            <colgroup>
              <col style={{ width: '180px' }} />
              <col style={{ width: '80px' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '180px' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '180px' }} />
              <col style={{ width: '180px' }} />
              <col style={{ width: '120px' }} />
            </colgroup>
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-xs font-bold text-slate-600">
                <th className="px-4 py-3 text-left whitespace-nowrap">订单号</th>
                <th className="px-4 py-3 text-left whitespace-nowrap">类型</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">数量</th>
                <th className="px-4 py-3 text-left whitespace-nowrap">地址</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">总额</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">服务费</th>
                <th className="px-4 py-3 text-left whitespace-nowrap">支付方式</th>
                <th className="px-4 py-3 text-center whitespace-nowrap">支付状态</th>
                <th className="px-4 py-3 text-center whitespace-nowrap">转账状态</th>
                <th className="px-4 py-3 text-left whitespace-nowrap">创建时间</th>
                <th className="px-4 py-3 text-left whitespace-nowrap">交易哈希</th>
                <th className="px-4 py-3 text-center whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="12" className="px-4 py-8 text-center text-slate-500">
                    加载中...
                  </td>
                </tr>
              ) : currentPayments.length === 0 ? (
                <tr>
                  <td colSpan="12" className="px-4 py-8 text-center text-slate-500">
                    暂无数据
                  </td>
                </tr>
              ) : (
                currentPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-slate-900 whitespace-nowrap">
                      {payment.platformOrderId || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        payment.payType === 'USDT' 
                          ? 'bg-green-50 text-green-600' 
                          : 'bg-red-50 text-red-600'
                      }`}>
                        {payment.payType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-right text-slate-900 whitespace-nowrap">
                      {payment.amount}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-slate-600 whitespace-nowrap">
                      {payment.address.slice(0, 8)}...{payment.address.slice(-6)}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-right text-slate-900 whitespace-nowrap">
                      ¥ {payment.totalCNY}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-right text-orange-600 whitespace-nowrap">
                      ¥ {payment.serviceFee || 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900 whitespace-nowrap">
                      {payment.paymentMethod === 'alipay' ? '支付宝' : '微信'}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        payment.paymentStatus === 'paid' ? 'bg-green-50 text-green-600' :
                        payment.paymentStatus === 'pending' ? 'bg-yellow-50 text-yellow-600' :
                        payment.paymentStatus === 'failed' ? 'bg-red-50 text-red-600' :
                        'bg-slate-50 text-slate-600'
                      }`}>
                        {payment.paymentStatus === 'paid' ? '已支付' :
                         payment.paymentStatus === 'pending' ? '待支付' :
                         payment.paymentStatus === 'failed' ? '失败' :
                         payment.paymentStatus === 'expired' ? '已过期' : '未知'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        payment.transferStatus === 'completed' ? 'bg-green-50 text-green-600' :
                        payment.transferStatus === 'processing' ? 'bg-blue-50 text-blue-600' :
                        payment.transferStatus === 'pending' ? 'bg-yellow-50 text-yellow-600' :
                        payment.transferStatus === 'failed' ? 'bg-red-50 text-red-600' :
                        'bg-slate-50 text-slate-600'
                      }`}>
                        {payment.transferStatus === 'completed' ? '已完成' :
                         payment.transferStatus === 'processing' ? '处理中' :
                         payment.transferStatus === 'pending' ? '待转账' :
                         payment.transferStatus === 'failed' ? '失败' : '未知'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(payment.createdAt).toLocaleString('zh-CN')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {payment.txHash ? (
                        <a
                          href={`https://tronscan.org/#/transaction/${payment.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-mono text-[#00A3FF] hover:text-[#0086D1]"
                        >
                          {payment.txHash.slice(0, 8)}...{payment.txHash.slice(-4)}
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {(payment.transferStatus === 'failed' || payment.transferStatus === 'pending') && payment.paymentStatus === 'paid' ? (
                        <button
                          onClick={() => handleRetryTransfer(payment._id)}
                          disabled={retryingPayment === payment._id}
                          className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
                          title="手动补单 - 重新执行代付"
                        >
                          {retryingPayment === payment._id ? (
                            <>
                              <RefreshCw size={12} className="animate-spin" />
                              补单中
                            </>
                          ) : (
                            <>
                              <RefreshCw size={12} />
                              补单
                            </>
                          )}
                        </button>
                      ) : payment.transferStatus === 'completed' ? (
                        <div className="flex items-center justify-center gap-1 text-green-600">
                          <CheckCircle size={14} />
                          <span className="text-xs font-bold">完成</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 分页控件 */}
      {filteredPayments.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-slate-500 font-medium">
            显示第 {startIndex + 1} - {Math.min(endIndex, filteredPayments.length)} 条，共 {filteredPayments.length} 条记录
          </p>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
            >
              <ChevronLeft size={16} />
              上一页
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                // 只显示当前页附近的页码
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                        currentPage === page
                          ? 'bg-[#00A3FF] text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return <span key={page} className="px-2 text-slate-400">...</span>;
                }
                return null;
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
            >
              下一页
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default FinancePage;
