import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, register, telegramLogin } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [telegramLoading, setTelegramLoading] = useState(false);

  useEffect(() => {
    // 加载 Telegram Widget 脚本
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', process.env.REACT_APP_TELEGRAM_BOT_USERNAME || 'YourBotUsername');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '10');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    
    const container = document.getElementById('telegram-login-container');
    if (container) {
      container.innerHTML = '';
      container.appendChild(script);
    }

    // 定义全局回调函数
    window.onTelegramAuth = async (user) => {
      setTelegramLoading(true);
      setError('');
      try {
        await telegramLogin(user);
        navigate('/user-center');
      } catch (err) {
        setError(err.response?.data?.error || 'Telegram 登录失败');
      } finally {
        setTelegramLoading(false);
      }
    };

    return () => {
      delete window.onTelegramAuth;
    };
  }, [telegramLogin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.username, formData.email, formData.password);
      }
      // 登录/注册成功后跳转到个人中心
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
            <div 
              id="telegram-login-container" 
              className="flex justify-center"
              style={{ minHeight: '40px' }}
            >
              {telegramLoading && (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="text-sm font-bold">登录中...</span>
                </div>
              )}
            </div>
            
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
              <div className="font-bold text-blue-900 mb-1">使用 Telegram 登录的优势</div>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 无需记住密码，一键登录</li>
                <li>• 自动同步 Bot 和网站账号</li>
                <li>• 更安全的身份验证</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
