import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Zap, User, LogOut, Twitter, Facebook, Send, Mail, MessageCircle, Home, HelpCircle, Briefcase, ArrowDownUp, Menu, X, FileText, BookOpen, DollarSign, Coins, Battery, RefreshCw, GraduationCap, Code, Building2, Shield, Phone } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { USDTIcon, TRXIcon } from './components/Icons';
import axios from 'axios';
import IndexPage from './pages/IndexPage';
import PayPage from './pages/PayPage';
import PayPageTRX from './pages/PayPageTRX';
import AdminPage from './pages/AdminPage';
import FinancePage from './pages/FinancePage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import WalletConfigPage from './pages/WalletConfigPage';
import UserCenterPage from './pages/UserCenterPage';
import MyOrdersPage from './pages/MyOrdersPage';
import UserManagePage from './pages/UserManagePage';
import FAQManagePage from './pages/FAQManagePage';
import FAQPage from './pages/FAQPage';
import TicketsPage from './pages/TicketsPage';
import AdminTicketsPage from './pages/AdminTicketsPage';
import SwapPage from './pages/SwapPage';
import EnergyRentalPage from './pages/EnergyRentalPage';
import PaymentSystemPage from './pages/PaymentSystemPage';
import SwapSystemPage from './pages/SwapSystemPage';
import EnergySystemPage from './pages/EnergySystemPage';
import TelegramManagePage from './pages/TelegramManagePage';
import SEOManagePage from './pages/SEOManagePage';
import ServiceOverviewPage from './pages/ServiceOverviewPage';
import USDTPaymentDetailPage from './pages/services/USDTPaymentDetailPage';
import TRXPaymentDetailPage from './pages/services/TRXPaymentDetailPage';
import EnergyRentalDetailPage from './pages/services/EnergyRentalDetailPage';
import SwapDetailPage from './pages/services/SwapDetailPage';
import BeginnerGuidePage from './pages/guides/BeginnerGuidePage';
import APIDocPage from './pages/guides/APIDocPage';
import CompanyPage from './pages/about/CompanyPage';
import SecurityPage from './pages/about/SecurityPage';
import ContactPage from './pages/about/ContactPage';
import BlogListPage from './pages/BlogListPage';
import BlogDetailPage from './pages/BlogDetailPage';
import BlogManageContainer from './pages/admin/BlogManageContainer';

// 动态加载 Favicon
const useFavicon = () => {
  useEffect(() => {
    const loadFavicon = async () => {
      try {
        const { data } = await axios.get('/api/settings/public');
        if (data.siteFavicon) {
          // 移除现有的 favicon
          const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
          existingFavicons.forEach(link => link.remove());
          
          // 添加新的 favicon
          const link = document.createElement('link');
          link.rel = 'icon';
          link.href = data.siteFavicon;
          document.head.appendChild(link);
          
          // 同时添加 apple-touch-icon
          const appleLink = document.createElement('link');
          appleLink.rel = 'apple-touch-icon';
          appleLink.href = data.siteFavicon;
          document.head.appendChild(appleLink);
        }
      } catch (error) {
        console.error('加载 favicon 失败:', error);
      }
    };
    
    loadFavicon();
  }, []);
};

// 运行时间组件
const RuntimeDisplay = () => {
  const [runningTime, setRunningTime] = useState({ days: 0, hours: 0, min: 0, sec: 0 });
  const [startTime, setStartTime] = useState(new Date('2024-01-01T00:00:00'));

  useEffect(() => {
    // 从后台获取系统运行起始时间
    const fetchStartTime = async () => {
      try {
        const { data } = await axios.get('/api/settings/public');
        if (data.systemStartTime) {
          setStartTime(new Date(data.systemStartTime));
        }
      } catch (error) {
        console.error('获取系统运行时间失败:', error);
      }
    };
    
    fetchStartTime();
  }, []);

  useEffect(() => {
    const updateRuntime = () => {
      const now = new Date();
      const diff = now - startTime;
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const min = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const sec = Math.floor((diff % (1000 * 60)) / 1000);
      
      setRunningTime({ days, hours, min, sec });
    };

    updateRuntime();
    const interval = setInterval(updateRuntime, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="flex justify-center py-6">
      <div className="flex flex-col items-center gap-3">
        <p className="text-xs font-extrabold text-green-600 tracking-wide">运行时间</p>
        <div className="flex gap-6">
          {[
            { val: String(runningTime.days).padStart(3, '0'), label: 'Days' },
            { val: String(runningTime.hours).padStart(2, '0'), label: 'Hours' },
            { val: String(runningTime.min).padStart(2, '0'), label: 'Min' },
            { val: String(runningTime.sec).padStart(2, '0'), label: 'Sec' }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-2xl font-black text-slate-900 tabular-nums">{item.val}</span>
              <span className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider mt-1">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [footerSettings, setFooterSettings] = useState(null);
  const [siteSettings, setSiteSettings] = useState({ siteName: 'FASTPAY' }); // 网站设置
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [showPayMenu, setShowPayMenu] = useState(false);
  const [showServicesMenu, setShowServicesMenu] = useState(false); // 服务总览下拉菜单
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // 移动端菜单状态

  // 加载动态 favicon
  useFavicon();
  useFavicon();

  const isAdminPage = ['/admin', '/finance', '/settings', '/wallet', '/faq-manage', '/admin-tickets', '/payment-system', '/swap-system', '/energy-system', '/user-manage', '/telegram-manage', '/seo-manage', '/admin/blog'].includes(location.pathname);
  const isUserCenterPage = ['/user-center', '/my-orders', '/my-tickets'].includes(location.pathname);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchFooterSettings = async () => {
      try {
        const { data } = await axios.get('/api/settings/public');
        setFooterSettings(data);
        setSiteSettings({ 
          siteName: data.siteName || 'FASTPAY',
          siteLogo: data.siteLogo || ''
        }); // 同时设置网站名称和Logo
        
        // 更新页面标题 - 优先使用 seoTitle，如果没有则使用 siteName
        if (data.seoTitle) {
          document.title = data.seoTitle;
        } else if (data.siteName) {
          document.title = `${data.siteName} - USDT/TRX 代付平台`;
        }
      } catch (error) {
        console.error('获取Footer设置失败:', error);
      }
    };
    fetchFooterSettings();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-[#334155] font-sans selection:bg-cyan-100 flex flex-col">
      {!isAdminPage && !isUserCenterPage && (
        <>
          {/* 移动端汉堡菜单按钮 - 替代登录按钮的位置 */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="fixed top-5 right-5 z-[60] lg:hidden p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            {mobileMenuOpen ? <X size={24} className="text-slate-700" /> : <Menu size={24} className="text-slate-700" />}
          </button>

          {/* 移动端侧边栏菜单 */}
          {mobileMenuOpen && (
            <>
              <div 
                className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
                onClick={() => setMobileMenuOpen(false)} 
              />
              <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 overflow-y-auto lg:hidden transform transition-transform duration-300">
                <div className="p-6 pt-20 space-y-2">
                  {user && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl">
                      <p className="text-sm font-bold text-slate-800">{user.username}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  )}
                  
                  <button onClick={() => { navigate('/'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 font-bold text-slate-700 flex items-center gap-3">
                    <Home size={20} />
                    <span>首页</span>
                  </button>
                  <button onClick={() => { navigate('/pay'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 font-bold text-slate-700 flex items-center gap-3">
                    <USDTIcon className="w-5 h-5 flex-shrink-0" />
                    <span>USDT 代付</span>
                  </button>
                  <button onClick={() => { navigate('/pay-trx'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 font-bold text-slate-700 flex items-center gap-3">
                    <TRXIcon className="w-5 h-5 flex-shrink-0" />
                    <span>TRX 代付</span>
                  </button>
                  <button onClick={() => { navigate('/energy-rental'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 font-bold text-slate-700 flex items-center gap-3">
                    <Zap size={20} />
                    <span>能量租赁</span>
                  </button>
                  <button onClick={() => { navigate('/swap'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 font-bold text-slate-700 flex items-center gap-3">
                    <ArrowDownUp size={20} />
                    <span>闪兑中心</span>
                  </button>
                  <button onClick={() => { navigate('/services'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 font-bold text-slate-700 flex items-center gap-3">
                    <Menu size={20} />
                    <span>服务总览</span>
                  </button>
                  <button onClick={() => { navigate('/blog'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 font-bold text-slate-700 flex items-center gap-3">
                    <BookOpen size={20} />
                    <span>博客</span>
                  </button>
                  
                  {user && (
                    <>
                      <div className="border-t border-slate-200 my-3"></div>
                      <button onClick={() => { navigate('/user-center'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 font-bold text-slate-700 flex items-center gap-3">
                        <User size={20} />
                        <span>个人中心</span>
                      </button>
                      <button onClick={() => { navigate('/my-orders'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 font-bold text-slate-700 flex items-center gap-3">
                        <FileText size={20} />
                        <span>我的订单</span>
                      </button>
                      {user.role === 'admin' && (
                        <button onClick={() => { navigate('/admin'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg hover:bg-cyan-50 font-bold text-cyan-600 flex items-center gap-3">
                          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>管理后台</span>
                        </button>
                      )}
                      <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-50 font-bold text-red-600 flex items-center gap-3">
                        <LogOut size={20} />
                        <span>退出登录</span>
                      </button>
                    </>
                  )}
                  
                  {!user && (
                    <button onClick={() => { navigate('/login'); setMobileMenuOpen(false); }} className="w-full px-4 py-3 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all mt-4">
                      登录 / 注册
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-lg shadow-sm h-16' : 'bg-transparent h-20'}`}>
          <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between border-b border-slate-200/50">
            <div className="flex items-center gap-10">
              <div onClick={() => navigate('/')} className="flex items-center gap-2 group cursor-pointer">
                {siteSettings.siteLogo ? (
                  <img 
                    src={siteSettings.siteLogo} 
                    alt={siteSettings.siteName}
                    className="w-9 h-9 object-contain group-hover:scale-110 transition-transform"
                    onError={(e) => {
                      // 如果Logo加载失败，显示默认图标
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`w-9 h-9 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-200 group-hover:rotate-12 transition-transform ${siteSettings.siteLogo ? 'hidden' : ''}`}>
                  <Zap className="text-white" size={20} />
                </div>
                <span className="text-xl font-black tracking-tighter text-slate-800">{siteSettings.siteName}</span>
              </div>
              <div className="hidden lg:flex items-center gap-8">
                <button onClick={() => navigate('/')} className="text-[13px] font-bold text-slate-500 hover:text-cyan-600 transition-colors flex items-center gap-1.5">
                  <Home size={14} />
                  首页
                </button>
                
                {/* 代付服务 - 带下拉菜单 */}
                <div 
                  className="relative group"
                  onMouseEnter={() => setShowPayMenu(true)}
                  onMouseLeave={() => setShowPayMenu(false)}
                >
                  <button className="text-[13px] font-bold text-slate-500 hover:text-cyan-600 transition-colors flex items-center gap-1.5">
                    <Briefcase size={14} />
                    代付服务
                    <svg className={`w-3 h-3 transition-transform ${showPayMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* 下拉菜单 */}
                  <div className={`absolute top-full left-0 pt-2 transition-opacity duration-200 ${showPayMenu ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                    <div className="w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
                      <button 
                        onClick={() => { navigate('/pay'); setShowPayMenu(false); }}
                        className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-slate-600 hover:bg-cyan-50 hover:text-cyan-600 transition-colors flex items-center gap-2"
                      >
                        <USDTIcon className="w-4 h-4" />
                        USDT 代付
                      </button>
                      <button 
                        onClick={() => { navigate('/pay-trx'); setShowPayMenu(false); }}
                        className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-slate-600 hover:bg-cyan-50 hover:text-cyan-600 transition-colors flex items-center gap-2"
                      >
                        <TRXIcon className="w-4 h-4" />
                        TRX 代付
                      </button>
                    </div>
                  </div>
                </div>

                {/* 能量租赁 */}
                <button onClick={() => navigate('/energy-rental')} className="text-[13px] font-bold text-slate-500 hover:text-cyan-600 transition-colors flex items-center gap-1.5">
                  <Zap size={14} />
                  能量租赁
                </button>

                {/* 闪兑中心 */}
                <button onClick={() => navigate('/swap')} className="text-[13px] font-bold text-slate-500 hover:text-cyan-600 transition-colors flex items-center gap-1.5">
                  <ArrowDownUp size={14} />
                  闪兑中心
                </button>

                {/* 服务总览 - 下拉菜单 */}
                <div 
                  className="relative"
                  onMouseEnter={() => setShowServicesMenu(true)}
                  onMouseLeave={() => setShowServicesMenu(false)}
                >
                  <button 
                    onClick={() => navigate('/services')}
                    className="text-[13px] font-bold text-slate-500 hover:text-cyan-600 transition-colors flex items-center gap-1.5"
                  >
                    <Menu size={14} />
                    服务总览
                    <svg className={`w-3 h-3 transition-transform ${showServicesMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* 下拉菜单 - 使用 pt-2 而不是 mt-2，确保鼠标移动时不会离开触发区域 */}
                  <div className={`absolute top-full left-0 pt-2 transition-opacity duration-200 ${showServicesMenu ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                    <div className="w-56 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 z-50">
                      {/* 服务介绍 */}
                      <div className="px-3 py-2 text-xs font-black text-slate-400 uppercase tracking-wider">服务介绍</div>
                      <button onClick={() => { navigate('/services/usdt-payment'); setShowServicesMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-cyan-50 hover:text-cyan-600 transition-colors flex items-center gap-2">
                        <USDTIcon className="w-4 h-4 flex-shrink-0" />
                        USDT 代付详情
                      </button>
                      <button onClick={() => { navigate('/services/trx-payment'); setShowServicesMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-cyan-50 hover:text-cyan-600 transition-colors flex items-center gap-2">
                        <TRXIcon className="w-4 h-4 flex-shrink-0" />
                        TRX 代付详情
                      </button>
                      <button onClick={() => { navigate('/services/energy-rental'); setShowServicesMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-cyan-50 hover:text-cyan-600 transition-colors flex items-center gap-2">
                        <Zap size={16} className="flex-shrink-0" />
                        能量租赁详情
                      </button>
                      <button onClick={() => { navigate('/services/swap'); setShowServicesMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-cyan-50 hover:text-cyan-600 transition-colors flex items-center gap-2">
                        <RefreshCw size={16} className="flex-shrink-0" />
                        闪兑服务详情
                      </button>
                      
                      <div className="my-2 border-t border-slate-100"></div>
                      
                      {/* 使用指南 */}
                      <div className="px-3 py-2 text-xs font-black text-slate-400 uppercase tracking-wider">使用指南</div>
                      <button onClick={() => { navigate('/guides/beginner'); setShowServicesMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-cyan-50 hover:text-cyan-600 transition-colors flex items-center gap-2">
                        <GraduationCap size={16} className="flex-shrink-0" />
                        新手教程
                      </button>
                      <button onClick={() => { navigate('/guides/api'); setShowServicesMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-cyan-50 hover:text-cyan-600 transition-colors flex items-center gap-2">
                        <Code size={16} className="flex-shrink-0" />
                        API 文档
                      </button>
                      <button onClick={() => { navigate('/guides/faq'); setShowServicesMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-cyan-50 hover:text-cyan-600 transition-colors flex items-center gap-2">
                        <HelpCircle size={16} className="flex-shrink-0" />
                        常见问题
                      </button>
                      
                      <div className="my-2 border-t border-slate-100"></div>
                      
                      {/* 关于我们 */}
                      <div className="px-3 py-2 text-xs font-black text-slate-400 uppercase tracking-wider">关于我们</div>
                      <button onClick={() => { navigate('/about/company'); setShowServicesMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-cyan-50 hover:text-cyan-600 transition-colors flex items-center gap-2">
                        <Building2 size={16} className="flex-shrink-0" />
                        公司介绍
                      </button>
                      <button onClick={() => { navigate('/about/security'); setShowServicesMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-cyan-50 hover:text-cyan-600 transition-colors flex items-center gap-2">
                        <Shield size={16} className="flex-shrink-0" />
                        安全保障
                      </button>
                      <button onClick={() => { navigate('/about/contact'); setShowServicesMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-cyan-50 hover:text-cyan-600 transition-colors flex items-center gap-2">
                        <Phone size={16} className="flex-shrink-0" />
                        联系我们
                      </button>
                    </div>
                  </div>
                </div>

                {/* 博客 */}
                <button onClick={() => navigate('/blog')} className="text-[13px] font-bold text-slate-500 hover:text-cyan-600 transition-colors flex items-center gap-1.5">
                  <BookOpen size={14} />
                  博客
                </button>

                {/* TG客服 */}
                {footerSettings && footerSettings.telegramCustomerService && (
                  <a 
                    href={footerSettings.telegramCustomerService} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[13px] font-bold text-slate-500 hover:text-cyan-600 transition-colors flex items-center gap-1.5"
                  >
                    <Send size={14} />
                    TG客服
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <div className="hidden lg:flex items-center gap-3">
                  {/* 用户菜单 - 带下拉 */}
                  <div 
                    className="relative"
                    onMouseEnter={() => setShowUserMenu(true)}
                    onMouseLeave={() => setShowUserMenu(false)}
                  >
                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-all">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center">
                        <User size={16} className="text-white" />
                      </div>
                      <span className="text-xs font-bold text-slate-600">{user.username}</span>
                      <svg className={`w-3 h-3 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* 下拉菜单 */}
                    <div className={`absolute top-full right-0 pt-2 transition-opacity duration-200 ${showUserMenu ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                      <div className="w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
                        <button 
                          onClick={() => { navigate('/user-center'); setShowUserMenu(false); }}
                          className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-slate-600 hover:bg-cyan-50 hover:text-cyan-600 transition-colors flex items-center gap-2"
                        >
                          <User size={14} />
                          个人中心
                        </button>
                        <button 
                          onClick={() => { navigate('/my-orders'); setShowUserMenu(false); }}
                          className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-slate-600 hover:bg-cyan-50 hover:text-cyan-600 transition-colors flex items-center gap-2"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          订单记录
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {user.role === 'admin' && (
                    <button onClick={() => navigate('/admin')} className="text-[13px] font-bold text-cyan-600 hover:text-cyan-700 transition-colors">
                      管理后台
                    </button>
                  )}
                  <button onClick={logout} className="text-slate-400 hover:text-slate-600">
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <button onClick={() => navigate('/login')} className="hidden lg:block bg-slate-900 text-white px-6 py-2 rounded-full text-[13px] font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">登录 / 注册</button>
              )}
            </div>
          </div>
        </nav>
        </>
      )}

      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/pay" element={<PayPage />} />
        <Route path="/pay-trx" element={<PayPageTRX />} />
        <Route path="/user-center" element={<UserCenterPage />} />
        <Route path="/my-orders" element={<MyOrdersPage />} />
        <Route path="/my-tickets" element={<TicketsPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/user-manage" element={<UserManagePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/wallet" element={<WalletConfigPage />} />
        <Route path="/faq-manage" element={<FAQManagePage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/swap" element={<SwapPage />} />
        <Route path="/energy-rental" element={<EnergyRentalPage />} />
        <Route path="/admin-tickets" element={<AdminTicketsPage />} />
        <Route path="/payment-system" element={<PaymentSystemPage />} />
        <Route path="/swap-system" element={<SwapSystemPage />} />
        <Route path="/energy-system" element={<EnergySystemPage />} />
        <Route path="/telegram-manage" element={<TelegramManagePage />} />
        <Route path="/seo-manage" element={<SEOManagePage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* 服务总览 */}
        <Route path="/services" element={<ServiceOverviewPage />} />
        <Route path="/services/usdt-payment" element={<USDTPaymentDetailPage />} />
        <Route path="/services/trx-payment" element={<TRXPaymentDetailPage />} />
        <Route path="/services/energy-rental" element={<EnergyRentalDetailPage />} />
        <Route path="/services/swap" element={<SwapDetailPage />} />
        
        {/* 使用指南 */}
        <Route path="/guides/beginner" element={<BeginnerGuidePage />} />
        <Route path="/guides/api" element={<APIDocPage />} />
        <Route path="/guides/faq" element={<FAQPage />} />
        
        {/* 关于我们 */}
        <Route path="/about/company" element={<CompanyPage />} />
        <Route path="/about/security" element={<SecurityPage />} />
        <Route path="/about/contact" element={<ContactPage />} />
        
        {/* 博客系统 */}
        <Route path="/blog" element={<BlogListPage />} />
        <Route path="/blog/:slug" element={<BlogDetailPage />} />
        <Route path="/admin/blog" element={<BlogManageContainer />} />
        
        {/* 保留 /faq 路由兼容性 */}
      </Routes>

      {/* 运行时间 - 独立区域，在footer上面，自动填充剩余空间 */}
      {!isAdminPage && !isUserCenterPage && (
        <div className="flex-grow flex items-end">
          <div className="w-full">
            <RuntimeDisplay />
          </div>
        </div>
      )}

      {!isAdminPage && !isUserCenterPage && footerSettings && (
        <footer className="bg-gradient-to-b from-white to-slate-50 py-8 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
              <div className="space-y-3 md:col-span-2">
                <div className="flex items-center gap-2">
                  {footerSettings.siteLogo ? (
                    <img 
                      src={footerSettings.siteLogo} 
                      alt={footerSettings.footerCompanyName || 'FASTPAY'}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-8 h-8 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-200 ${footerSettings.siteLogo ? 'hidden' : ''}`}>
                    <Zap className="text-white" size={16} />
                  </div>
                  <span className="text-lg font-black tracking-tighter text-slate-800">
                    {footerSettings.footerCompanyName || 'FASTPAY'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-md">
                  {footerSettings.footerDescription || '领先的自动化代付协议，为 TRON 生态提供安全、快速、便捷的 USDT 和 TRX 代付服务。'}
                </p>
                
                {/* 社交图标 */}
                <div className="flex items-center gap-2 pt-1">
                  {footerSettings.socialTwitter && (
                    <a 
                      href={footerSettings.socialTwitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-8 h-8 bg-slate-100 hover:bg-cyan-500 rounded-lg flex items-center justify-center transition-all group"
                    >
                      <Twitter size={14} className="text-slate-600 group-hover:text-white transition-colors" />
                    </a>
                  )}
                  {footerSettings.socialFacebook && (
                    <a 
                      href={footerSettings.socialFacebook} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-8 h-8 bg-slate-100 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all group"
                    >
                      <Facebook size={14} className="text-slate-600 group-hover:text-white transition-colors" />
                    </a>
                  )}
                  {footerSettings.socialTelegram && (
                    <a 
                      href={footerSettings.socialTelegram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-8 h-8 bg-slate-100 hover:bg-blue-500 rounded-lg flex items-center justify-center transition-all group"
                    >
                      <Send size={14} className="text-slate-600 group-hover:text-white transition-colors" />
                    </a>
                  )}
                  {footerSettings.socialWeChat && (
                    <a 
                      href={footerSettings.socialWeChat} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-8 h-8 bg-slate-100 hover:bg-green-500 rounded-lg flex items-center justify-center transition-all group"
                    >
                      <MessageCircle size={14} className="text-slate-600 group-hover:text-white transition-colors" />
                    </a>
                  )}
                  {footerSettings.socialEmail && (
                    <a 
                      href={`mailto:${footerSettings.socialEmail}`}
                      className="w-8 h-8 bg-slate-100 hover:bg-orange-500 rounded-lg flex items-center justify-center transition-all group"
                    >
                      <Mail size={14} className="text-slate-600 group-hover:text-white transition-colors" />
                    </a>
                  )}
                </div>
              </div>
              
              {(() => {
                try {
                  const footerLinks = JSON.parse(footerSettings.footerLinks || '[]');
                  return footerLinks.map((section, idx) => (
                    <div key={idx} className="space-y-3">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{section.title}</h4>
                      <ul className="space-y-2">
                        {section.links.map((link, linkIdx) => (
                          <li key={linkIdx}>
                            <a href={link.url} className="text-xs text-slate-600 hover:text-cyan-600 transition-colors font-medium">
                              {link.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ));
                } catch (e) {
                  return null;
                }
              })()}
            </div>
            
            <div className="border-t border-slate-200 pt-4 flex flex-col md:flex-row justify-between items-center gap-3">
              <p className="text-xs text-slate-400 font-medium">
                {footerSettings.footerCopyright || '© 2024 FastPay. All rights reserved.'}
              </p>
              <div className="flex gap-4">
                {(() => {
                  try {
                    const bottomLinks = JSON.parse(footerSettings.footerBottomLinks || '[]');
                    return bottomLinks.map((link, idx) => (
                      <a key={idx} href={link.url} className="text-xs text-slate-400 hover:text-cyan-600 transition-colors font-medium">
                        {link.name}
                      </a>
                    ));
                  } catch (e) {
                    return null;
                  }
                })()}
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
