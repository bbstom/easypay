import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  User, 
  FileText, 
  MessageSquare, 
  LogOut,
  Menu,
  X,
  Home
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UserLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [unreadTicketsCount, setUnreadTicketsCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadTicketsCount();
      // 每30秒刷新一次
      const interval = setInterval(fetchUnreadTicketsCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadTicketsCount = async () => {
    try {
      const { data } = await axios.get('/api/tickets/my/unread-count');
      setUnreadTicketsCount(data.count || 0);
    } catch (error) {
      console.error('获取未读工单数量失败:', error);
    }
  };

  const menuItems = [
    { path: '/', icon: <Home size={20} />, label: '返回首页', isExternal: true },
    { path: '/user-center', icon: <User size={20} />, label: '个人中心' },
    { path: '/my-orders', icon: <FileText size={20} />, label: '我的订单' },
    { path: '/my-tickets', icon: <MessageSquare size={20} />, label: '我的工单' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      {/* 侧边栏 */}
      <aside className={`fixed left-0 top-0 h-full bg-white border-r border-slate-200 transition-all duration-300 z-50 overflow-y-auto ${
        sidebarOpen ? 'w-56' : 'w-16'
      }`}>
        {/* Logo区域 */}
        <div className="h-16 border-b border-slate-200 flex items-center justify-between px-4">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <User className="text-white" size={16} />
              </div>
              <span className="text-base font-black text-slate-800">个人中心</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* 用户信息 */}
        {sidebarOpen && user && (
          <div className="p-3 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <User className="text-white" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-slate-900 truncate">{user.username}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* 菜单列表 */}
        <nav className="p-3 space-y-1.5">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-sm relative ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-200'
                  : 'text-slate-600 hover:bg-slate-100'
              } ${!sidebarOpen && 'justify-center'}`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="font-bold">{item.label}</span>}
              {item.path === '/my-tickets' && unreadTicketsCount > 0 && (
                <span className={`${sidebarOpen ? 'ml-auto' : 'absolute -top-0.5 -right-0.5'} flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full`}>
                  {unreadTicketsCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* 底部退出按钮 */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-200">
          <button
            onClick={logout}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-all text-sm ${
              !sidebarOpen && 'justify-center'
            }`}
          >
            <LogOut size={18} />
            {sidebarOpen && <span className="font-bold">退出登录</span>}
          </button>
        </div>
      </aside>

      {/* 主内容区域 */}
      <main className={`flex-1 transition-all duration-300 ${
        sidebarOpen ? 'ml-56' : 'ml-16'
      } overflow-x-hidden`}>
        {/* 顶部栏 */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div>
            <h1 className="text-xl font-black text-slate-800">
              {menuItems.find(item => isActive(item.path))?.label || '个人中心'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">欢迎回来，{user?.username}</p>
          </div>
        </header>

        {/* 页面内容 */}
        <div className="p-6 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
};

export default UserLayout;
