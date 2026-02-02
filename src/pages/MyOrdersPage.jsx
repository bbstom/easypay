import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, Loader, Filter, Search } from 'lucide-react';
import { USDTIcon, TRXIcon } from '../components/Icons';
import axios from 'axios';
import UserLayout from '../components/UserLayout';

const MyOrdersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  useEffect(() => {
    filterOrders();
  }, [orders, filterStatus, searchQuery]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/payments/my-orders');
      setOrders(data);
    } catch (error) {
      console.error('获取订单失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (filterStatus !== 'all') {
      filtered = filtered.filter(order => order.status === filterStatus);
    }

    if (searchQuery) {
      filtered = filtered.filter(order => 
        order.platformOrderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.txHash?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { text: '待支付', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      paid: { text: '已支付', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
      processing: { text: '处理中', color: 'bg-purple-100 text-purple-700', icon: Loader },
      completed: { text: '已完成', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      failed: { text: '已失败', color: 'bg-red-100 text-red-700', icon: XCircle }
    };
    const config = statusMap[status] || statusMap.pending;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${config.color}`}>
        <Icon size={12} />
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center py-12">
          <Loader className="animate-spin text-cyan-600" size={32} />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow border border-slate-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-cyan-500 outline-none"
              >
                <option value="all">全部状态</option>
                <option value="pending">待支付</option>
                <option value="paid">已支付</option>
                <option value="processing">处理中</option>
                <option value="completed">已完成</option>
                <option value="failed">失败</option>
              </select>
            </div>

            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索订单号、地址或交易哈希..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="font-bold">共 {filteredOrders.length} 条记录</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow border border-slate-200 p-6 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {order.payType === 'USDT' ? (
                      <USDTIcon className="w-10 h-10" />
                    ) : (
                      <TRXIcon className="w-10 h-10" />
                    )}
                    <div>
                      <p className="font-bold text-slate-900">{order.platformOrderId}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(order.createdAt).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-xs text-slate-500 block mb-1">支付金额</span>
                    <p className="font-bold text-slate-900">¥{order.totalCNY || order.amount}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block mb-1">代付数量</span>
                    <p className="font-bold text-slate-900">
                      {order.amount} {order.payType}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block mb-1">支付方式</span>
                    <p className="font-bold text-slate-900">
                      {order.paymentMethod === 'alipay' ? '支付宝' : '微信支付'}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block mb-1">服务费</span>
                    <p className="font-bold text-slate-900">¥{order.serviceFee || 0}</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <div className="mb-2">
                    <span className="text-xs text-slate-500 block mb-1">接收地址</span>
                    <p className="font-mono text-sm text-slate-700 break-all">
                      {order.address}
                    </p>
                  </div>
                  
                  {order.txHash && (
                    <div>
                      <span className="text-xs text-slate-500 block mb-1">交易哈希</span>
                      <a
                        href={`https://tronscan.org/#/transaction/${order.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm text-cyan-600 hover:text-cyan-700 break-all"
                      >
                        {order.txHash}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow border border-slate-200 p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-slate-500 mb-4">
                {searchQuery || filterStatus !== 'all' ? '没有找到匹配的订单' : '暂无订单记录'}
              </p>
              {!searchQuery && filterStatus === 'all' && (
                <button
                  onClick={() => navigate('/pay')}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
                >
                  立即下单
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
};

export default MyOrdersPage;
