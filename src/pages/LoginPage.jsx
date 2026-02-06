import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap } from 'lucide-react';
import QRCode from 'qrcode';
import axios from 'axios';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, register, telegramLogin } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loginToken, setLoginToken] = useState('');
  const [qrCodeExpired, setQrCodeExpired] = useState(false);

  const handleTelegramAppLogin = () => {
    const botUsername = process.env.REACT_APP_TELEGRAM_BOT_USERNAME || 'YourBotUsername';
    
    // 生成唯一的登录令牌
    const token = `login_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('🔐 生成登录令牌:', token);
    setLoginToken(token);
    
    // 使用 tg:// 协议直接打开 Telegram 应用
    const tgUrl = `tg://resolve?domain=${botUsername}&start=${token}`;
    console.log('📱 打开 Telegram 应用:', tgUrl);
    
    // 尝试打开应用
    window.location.href = tgUrl;
    
    // 如果1.5秒后还在页面上，说明可能没有安装应用，打开网页版
    setTimeout(() => {
      const webUrl = `https://t.me/${botUsername}?start=${token}`;
      console.log('🌐 打开 Telegram 网页版:', webUrl);
      window.open(webUrl, '_blank');
    }, 1500);
    
    // 开始轮询检查登录状态
    console.log('🔄 启动轮询...');
    startPolling(token);
    
    // 显示提示
    setError('');
    alert('请在 Telegram 中点击"确认登录"按钮');
  };

  const generateQRCode = async () => {
    try {
      // 生成唯一的登录令牌
      const token = `login_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setLoginToken(token);
      
      // 生成 Telegram Bot 深度链接
      const botUsername = process.env.REACT_APP_TELEGRAM_BOT_USERNAME || 'YourBotUsername';
      const deepLink = `https://t.me/${botUsername}?start=${token}`;
      
      // 生成二维码
      const qrDataUrl = await QRCode.toDataURL(deepLink, {
        width: 280,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeUrl(qrDataUrl);
      setShowQRCode(true);
      setQrCodeExpired(false);
      
      // 开始轮询检查登录状态
      startPolling(token);
      
      // 2分钟后二维码过期
      setTimeout(() => {
        setQrCodeExpired(true);
      }, 120000);
      
    } catch (err) {
      console.error('生成二维码失败:', err);
      setError('生成二维码失败，请重试');
    }
  };

  // 轮询检查登录状态
  const startPolling = (token) => {
    console.log('🔄 开始轮询登录状态:', token);
    
    const pollInterval = setInterval(async () => {
      try {
        console.log('⏳ 检查登录状态...');
        const response = await fetch(`/api/auth/check-qr-login?token=${token}`);
        const data = await response.json();
        console.log('📊 轮询响应:', data);
        
        if (data.success && data.token) {
          console.log('✅ 检测到登录成功，准备调用 complete API');
          clearInterval(pollInterval);
          
          // 调用新的 complete 端点获取 JWT token
          try {
            console.log('📡 调用 qr-login-complete API...');
            const completeResponse = await fetch('/api/auth/qr-login-complete', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ token: data.token })
            });
            
            console.log('📊 Complete API 响应状态:', completeResponse.status);
            const completeData = await completeResponse.json();
            console.log('📊 Complete API 响应数据:', completeData);
            
            if (completeResponse.ok && completeData.token) {
              console.log('✅ 获取到 JWT token，设置并跳转...');
              // 直接设置 token 和用户信息
              localStorage.setItem('token', completeData.token);
              axios.defaults.headers.common['Authorization'] = `Bearer ${completeData.token}`;
              
              console.log('🚀 跳转到用户中心...');
              // 使用 window.location.href 强制跳转
              window.location.href = '/user-center';
            } else {
              console.error('❌ Complete API 返回错误:', completeData);
              setError(completeData.error || '登录失败，请重试');
            }
          } catch (err) {
            console.error('❌ 完成登录失败:', err);
            setError('登录失败，请重试');
          }
        }
      } catch (err) {
        console.error('❌ 轮询错误:', err);
        // 继续轮询
      }
    }, 2000); // 每2秒检查一次

    // 2分钟后停止轮询
    setTimeout(() => {
      console.log('⏰ 轮询超时，停止轮询');
      clearInterval(pollInterval);
    }, 120000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.username, formData.email, formData.password);
      }
      navigate('/user-center');
    } catch (err) {
      setError(err.response?.data?.error || '操作失败');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="text-white" size={24} />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-800">FASTPAY</span>
          </div>
          <h2 className="text-3xl font-black text-slate-800">{isLogin ? '登录账户' : '注册账户'}</h2>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm font-bold">{error}</div>}
          
          {/* Telegram 登录 */}
          <div className="mb-6">
            <div className="text-center mb-3">
              <span className="text-sm font-bold text-slate-600">使用 Telegram 快速登录</span>
            </div>
            
            {!showQRCode ? (
              <div className="space-y-3">
                {/* 打开 Telegram 应用按钮 */}
                <button
                  onClick={handleTelegramAppLogin}
                  className="w-full bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.717-.962 3.767-1.362 5.001-.169.523-.506.697-.831.715-.704.031-1.238-.465-1.92-.911-.106-.07-2.022-1.294-2.726-1.892-.193-.164-.41-.492-.013-.876.917-.886 2.014-1.877 2.68-2.537.297-.295.594-.984-.652-.145-1.784 1.201-3.527 2.368-3.527 2.368s-.414.263-.119.263c.295 0 4.343-1.411 4.343-1.411s.801-.314.801.209z"/>
                  </svg>
                  <span>打开 Telegram 应用登录</span>
                </button>
                
                {/* 扫码登录按钮 */}
                <button
                  onClick={generateQRCode}
                  className="w-full bg-white hover:bg-slate-50 text-[#0088cc] font-bold py-3 px-4 rounded-xl transition-all border-2 border-[#0088cc] flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                  </svg>
                  <span>或扫描二维码登录</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className={`bg-white p-4 rounded-2xl border-2 ${qrCodeExpired ? 'border-red-300' : 'border-blue-300'} relative`}>
                  {qrCodeExpired && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-2xl">
                      <div className="text-white text-center">
                        <div className="text-2xl mb-2">⏰</div>
                        <div className="font-bold">二维码已过期</div>
                      </div>
                    </div>
                  )}
                  <img src={qrCodeUrl} alt="登录二维码" className="w-64 h-64" />
                </div>
                
                <div className="mt-4 text-center">
                  {!qrCodeExpired ? (
                    <>
                      <div className="text-sm font-bold text-slate-700 mb-2">
                        📱 使用 Telegram 扫描二维码
                      </div>
                      <div className="text-xs text-slate-500">
                        在 Telegram 中确认登录
                      </div>
                      <div className="mt-3 flex items-center justify-center gap-2 text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-xs font-bold">等待扫码...</span>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={generateQRCode}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-bold underline"
                    >
                      点击刷新二维码
                    </button>
                  )}
                </div>
                
                <button
                  onClick={() => setShowQRCode(false)}
                  className="mt-4 text-sm text-slate-500 hover:text-slate-700"
                >
                  返回
                </button>
              </div>
            )}
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500 font-bold">或使用邮箱登录</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">用户名</label>
                <input 
                  type="text" 
                  value={formData.username} 
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-500 outline-none" 
                  autoComplete="username"
                  required={!isLogin} 
                />
              </div>
            )}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">邮箱</label>
              <input 
                type="email" 
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-500 outline-none" 
                autoComplete="email"
                required 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">密码</label>
              <input 
                type="password" 
                value={formData.password} 
                onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-500 outline-none" 
                autoComplete={isLogin ? "current-password" : "new-password"}
                required 
              />
            </div>
            <button type="submit" className="w-full bg-cyan-500 text-white py-4 rounded-xl font-black hover:bg-cyan-600 transition-all shadow-lg">
              {isLogin ? '登录' : '注册'}
            </button>
          </form>

          <div className="text-center mt-6">
            <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-slate-500 hover:text-cyan-600 font-bold">
              {isLogin ? '还没有账户？立即注册' : '已有账户？立即登录'}
            </button>
          </div>
        </div>

        {/* 提示信息 */}
        <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div className="flex-1">
              <div className="font-bold text-blue-900 mb-2">Telegram 登录方式</div>
              <div className="text-sm text-blue-700 space-y-3">
                <div>
                  <div className="font-bold mb-1">📱 方式一：打开应用（推荐）</div>
                  <ul className="space-y-1 ml-4">
                    <li>• 点击"打开 Telegram 应用登录"</li>
                    <li>• 在 Telegram 中确认登录</li>
                    <li>• 自动完成登录</li>
                  </ul>
                </div>
                <div>
                  <div className="font-bold mb-1">📷 方式二：扫码登录</div>
                  <ul className="space-y-1 ml-4">
                    <li>• 点击"扫描二维码登录"</li>
                    <li>• 用 Telegram 扫描二维码</li>
                    <li>• 在 Telegram 中确认登录</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
