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
  const [sidebarOpen, setSidebarOpen] = useState(false); // 默认关闭，桌面端会自动打开
  const [unreadTicketsCount, setUnreadTicketsCount] = useState(0);

  // 检测屏幕尺寸，桌面端自动打开侧边栏
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    // 初始化
    handleResize();
    
    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      {/* 移动端遮罩层 */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <aside className={`fixed left-0 top-0 h-full bg-white border-r border-slate-200 transition-all duration-300 z-50 overflow-y-auto ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      } w-56 md:w-56`}>
        {/* Logo区域 */}
        <div className="h-16 border-b border-slate-200 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <User className="text-white" size={16} />
            </div>
            <span className="text-base font-black text-slate-800">个人中心</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* 用户信息 */}
        {user && (
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
              onClick={() => {
                navigate(item.path);
                // 移动端点击后关闭侧边栏
                if (window.innerWidth < 768) {
                  setSidebarOpen(false);
                }
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-sm relative ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="font-bold">{item.label}</span>
              {item.path === '/my-tickets' && unreadTicketsCount > 0 && (
                <span className="ml-auto flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full">
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
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-all text-sm"
          >
            <LogOut size={18} />
            <span className="font-bold">退出登录</span>
          </button>
        </div>
      </aside>

      {/* 主内容区域 */}
      <main className="flex-1 md:ml-56 overflow-x-hidden">
        {/* 顶部栏 */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6">
          {/* 移动端汉堡菜单 */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors md:hidden"
          >
            <Menu size={20} />
          </button>

          <div className="flex-1 md:flex-none">
            <h1 className="text-lg md:text-xl font-black text-slate-800">
              {menuItems.find(item => isActive(item.path))?.label || '个人中心'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 hidden md:block">欢迎回来，{user?.username}</p>
          </div>
        </header>

        {/* 页面内容 */}
        <div className="p-4 md:p-6 min-h-[calc(100vh-4rem)]">
          {children}
        </div>
      </main>
    </div>
  );
};

export default UserLayout;
