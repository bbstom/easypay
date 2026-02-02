import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, 
  Image, 
  Settings, 
  LogOut,
  Menu,
  X,
  Home,
  DollarSign,
  Globe,
  Share2,
  Layout as LayoutIcon,
  Key,
  Zap,
  Mail,
  Wallet,
  HelpCircle,
  MessageSquare,
  TrendingUp,
  ArrowDownUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pendingTicketsCount, setPendingTicketsCount] = useState(0);

  useEffect(() => {
    fetchPendingTicketsCount();
    // 每30秒刷新一次
    const interval = setInterval(fetchPendingTicketsCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingTicketsCount = async () => {
    try {
      const { data } = await axios.get('/api/tickets/admin?status=open');
      setPendingTicketsCount(data.tickets?.length || 0);
    } catch (error) {
      console.error('获取待处理工单数量失败:', error);
    }
  };

  const menuItems = [
    { path: '/', icon: <Home size={20} />, label: '返回首页', isExternal: true },
    { 
      path: '/admin', 
      icon: <Image size={20} />, 
      label: '广告管理',
      subItems: [
        { id: 'home-bottom', icon: <Home size={18} />, label: '主页底部' },
        { id: 'workspace-top', icon: <LayoutIcon size={18} />, label: '工作台顶部' },
        { id: 'workspace-middle', icon: <LayoutIcon size={18} />, label: '工作台中部' },
        { id: 'workspace-bottom', icon: <LayoutIcon size={18} />, label: '工作台底部' },
        { id: 'swap-bottom', icon: <ArrowDownUp size={18} />, label: '闪兑页面' },
        { id: 'energy-bottom', icon: <Zap size={18} />, label: '能量租赁页面' }
      ]
    },
    { path: '/finance', icon: <DollarSign size={20} />, label: '财务管理' },
    { path: '/faq-manage', icon: <HelpCircle size={20} />, label: '常见问题' },
    { path: '/admin-tickets', icon: <MessageSquare size={20} />, label: '工单管理' },
    { 
      path: '/payment-system', 
      icon: <DollarSign size={20} />, 
      label: '代付系统',
      subItems: [
        { id: 'wallets', icon: <Wallet size={18} />, label: '代付钱包' },
        { id: 'api-nodes', icon: <Globe size={18} />, label: 'API节点配置' },
        { id: 'auto-transfer', icon: <Share2 size={18} />, label: '自动转账配置' },
        { id: 'energy', icon: <Zap size={18} />, label: '能量租赁' },
        { id: 'rate', icon: <DollarSign size={18} />, label: '汇率设置' },
        { id: 'fee', icon: <DollarSign size={18} />, label: '费率设置' }
      ]
    },
    { 
      path: '/swap-system', 
      icon: <ArrowDownUp size={20} />, 
      label: '闪兑系统',
      subItems: [
        { id: 'swap-wallets', icon: <Wallet size={18} />, label: '闪兑钱包' },
        { id: 'swap-rate', icon: <DollarSign size={18} />, label: '汇率设置' },
        { id: 'swap-limits', icon: <Settings size={18} />, label: '限额配置' }
      ]
    },
    { 
      path: '/energy-system', 
      icon: <Zap size={20} />, 
      label: '能量租赁系统',
      subItems: [
        { id: 'address', icon: <Wallet size={18} />, label: '收款地址' },
        { id: 'price', icon: <DollarSign size={18} />, label: '价格配置' }
      ]
    },
    { 
      path: '/settings', 
      icon: <Settings size={20} />, 
      label: '系统设置',
      subItems: [
        { id: 'site', icon: <Globe size={18} />, label: '网站信息' },
        { id: 'hero', icon: <Image size={18} />, label: '主页图片' },
        { id: 'social', icon: <Share2 size={18} />, label: '社交媒体' },
        { id: 'footer', icon: <LayoutIcon size={18} />, label: 'Footer设置' },
        { id: 'telegram', icon: <MessageSquare size={18} />, label: 'TG客服' },
        { id: 'runtime', icon: <Zap size={18} />, label: '运行时间' },
        { id: 'payment', icon: <Key size={18} />, label: '支付配置' },
        { id: 'email', icon: <Mail size={18} />, label: '邮件配置' }
      ]
    },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname === path;
  };

  const handleNavigation = (path, subItemId) => {
    if (subItemId) {
      navigate(`${path}?tab=${subItemId}`);
    } else {
      // 如果是系统设置且没有subItemId，默认导航到第一个子项
      const menuItem = menuItems.find(item => item.path === path);
      if (menuItem?.subItems) {
        navigate(`${path}?tab=${menuItem.subItems[0].id}`);
      } else {
        navigate(path);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* 侧边栏 */}
      <aside className={`fixed left-0 top-0 h-full bg-white border-r border-slate-200 transition-all duration-300 z-50 overflow-y-auto ${
        sidebarOpen ? 'w-56' : 'w-16'
      }`}>
        {/* Logo区域 */}
        <div className="h-16 border-b border-slate-200 flex items-center justify-between px-4">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="text-white" size={16} />
              </div>
              <span className="text-base font-black text-slate-800">管理后台</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* 菜单列表 */}
        <nav className="p-3 space-y-1.5">
          {menuItems.map((item) => (
            <div key={item.path}>
              <button
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all relative text-sm ${
                  isActive(item.path)
                    ? 'bg-[#00A3FF] text-white shadow-lg shadow-[#00A3FF]/20'
                    : 'text-slate-600 hover:bg-slate-100'
                } ${!sidebarOpen && 'justify-center'}`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {sidebarOpen && <span className="font-bold">{item.label}</span>}
                {item.path === '/admin-tickets' && pendingTicketsCount > 0 && (
                  <span className={`${sidebarOpen ? 'ml-auto' : 'absolute -top-0.5 -right-0.5'} flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full`}>
                    {pendingTicketsCount}
                  </span>
                )}
              </button>
              
              {/* 二级菜单 */}
              {item.subItems && sidebarOpen && isActive(item.path) && (
                <div className="mt-1.5 ml-3 space-y-1">
                  {item.subItems.map((subItem) => {
                    const searchParams = new URLSearchParams(location.search);
                    const currentTab = searchParams.get('tab') || item.subItems[0].id;
                    const isSubActive = currentTab === subItem.id;
                    
                    return (
                      <button
                        key={subItem.id}
                        onClick={() => handleNavigation(item.path, subItem.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-xs ${
                          isSubActive
                            ? 'bg-[#E0F2FE] text-[#00A3FF] font-bold'
                            : 'text-slate-500 hover:bg-slate-50 font-medium'
                        }`}
                      >
                        <span className="flex-shrink-0">{subItem.icon}</span>
                        <span>{subItem.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
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
              {menuItems.find(item => isActive(item.path))?.label || '管理后台'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">欢迎回来，管理员</p>
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

export default AdminLayout;
