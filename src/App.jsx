import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Zap, User, LogOut, Twitter, Facebook, Send, Mail, MessageCircle, Home, HelpCircle, Briefcase, ArrowDownUp } from 'lucide-react';
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
import FAQManagePage from './pages/FAQManagePage';
import FAQPage from './pages/FAQPage';
import TicketsPage from './pages/TicketsPage';
import AdminTicketsPage from './pages/AdminTicketsPage';
import SwapPage from './pages/SwapPage';
import EnergyRentalPage from './pages/EnergyRentalPage';
import PaymentSystemPage from './pages/PaymentSystemPage';
import SwapSystemPage from './pages/SwapSystemPage';
import EnergySystemPage from './pages/EnergySystemPage';

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
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [showPayMenu, setShowPayMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isAdminPage = ['/admin', '/finance', '/settings', '/wallet', '/faq-manage', '/admin-tickets', '/payment-system', '/swap-system', '/energy-system'].includes(location.pathname);

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
      {!isAdminPage && (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-lg shadow-sm h-16' : 'bg-transparent h-20'}`}>
          <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between border-b border-slate-200/50">
            <div className="flex items-center gap-10">
              <div onClick={() => navigate('/')} className="flex items-center gap-2 group cursor-pointer">
                <div className="w-9 h-9 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-200 group-hover:rotate-12 transition-transform">
                  <Zap className="text-white" size={20} />
                </div>
                <span className="text-xl font-black tracking-tighter text-slate-800">FASTPAY</span>
              </div>
              <div className="hidden lg:flex items-center gap-8">
                <button onClick={() => navigate('/')} className="text-[13px] font-bold text-slate-500 hover:text-cyan-600 transition-colors flex items-center gap-1.5">
                  <Home size={14} />
                  首页
                </button>
                
                {/* 代付工作台 - 带下拉菜单 */}
                <div 
                  className="relative group"
                  onMouseEnter={() => setShowPayMenu(true)}
                  onMouseLeave={() => setShowPayMenu(false)}
                >
                  <button className="text-[13px] font-bold text-slate-500 hover:text-cyan-600 transition-colors flex items-center gap-1.5">
                    <Briefcase size={14} />
                    代付工作台
                    <svg className={`w-3 h-3 transition-transform ${showPayMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* 下拉菜单 - 无间隙 */}
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

                {/* USDT闪兑TRX */}
                <button onClick={() => navigate('/swap')} className="text-[13px] font-bold text-slate-500 hover:text-cyan-600 transition-colors flex items-center gap-1.5">
                  <ArrowDownUp size={14} />
                  TRX闪兑
                </button>

                {/* 能量租赁 */}
                <button onClick={() => navigate('/energy-rental')} className="text-[13px] font-bold text-slate-500 hover:text-cyan-600 transition-colors flex items-center gap-1.5">
                  <Zap size={14} />
                  能量租赁
                </button>

                {/* 常见问题 */}
                <button onClick={() => navigate('/faq')} className="text-[13px] font-bold text-slate-500 hover:text-cyan-600 transition-colors flex items-center gap-1.5">
                  <HelpCircle size={14} />
                  常见问题
                </button>

                {/* TG客服 */}
                {footerSettings && (
                  <a 
                    href={footerSettings.telegramCustomerService || 'https://t.me/'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[13px] font-bold text-slate-500 hover:text-cyan-600 transition-colors flex items-center gap-1.5"
                    onClick={(e) => {
                      if (!footerSettings.telegramCustomerService) {
                        e.preventDefault();
                        alert('请先在后台管理 > 系统设置 > 社交媒体中配置TG客服地址');
                      }
                    }}
                  >
                    <Send size={14} />
                    TG客服
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3">
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
                <button onClick={() => navigate('/login')} className="bg-slate-900 text-white px-6 py-2 rounded-full text-[13px] font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">登录 / 注册</button>
              )}
            </div>
          </div>
        </nav>
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
        <Route path="/login" element={<LoginPage />} />
      </Routes>

      {/* 运行时间 - 独立区域，在footer上面，自动填充剩余空间 */}
      {!isAdminPage && (
        <div className="flex-grow flex items-end">
          <div className="w-full">
            <RuntimeDisplay />
          </div>
        </div>
      )}

      {!isAdminPage && footerSettings && (
        <footer className="bg-gradient-to-b from-white to-slate-50 py-8 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
              <div className="space-y-3 md:col-span-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-200">
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
