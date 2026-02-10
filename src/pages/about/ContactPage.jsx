import { useNavigate } from 'react-router-dom';
import { Phone, Mail, MessageCircle, Clock, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import SEOHead from '../../components/SEOHead';

const ContactPage = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    axios.get('/api/settings/public')
      .then(res => setSettings(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SEOHead
        title="联系我们 - 7x24 小时在线客服 | 技术支持"
        description="我们随时为您提供帮助，7x24 小时在线客服。通过 Telegram 联系我们，获取专业的技术支持和服务。"
        keywords={[
          '联系我们',
          '客服支持',
          '技术支持',
          'Telegram 客服',
          '在线客服'
        ]}
      />
      <div className="bg-white border-b border-slate-200 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <button onClick={() => navigate('/')} className="hover:text-cyan-600">首页</button>
            <span>/</span>
            <button onClick={() => navigate('/services')} className="hover:text-cyan-600">服务总览</button>
            <span>/</span>
            <span className="text-slate-900 font-medium">联系我们</span>
          </div>
        </div>
      </div>

      <section className="relative pt-20 pb-16">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-gradient-to-b from-blue-50/50 to-transparent -z-10"></div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl lg:text-6xl font-black text-slate-900 leading-tight mb-6">
              联系我们
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              我们随时为您提供帮助，7x24 小时在线客服
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {settings?.telegramCustomerService && (
              <a 
                href={settings.telegramCustomerService}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100 p-8 hover:shadow-xl transition-all"
              >
                <div className="bg-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6">
                  <Send size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">Telegram 客服</h3>
                <p className="text-slate-600 mb-4">点击联系我们的 Telegram 客服</p>
                <div className="text-blue-600 font-bold">立即咨询 →</div>
              </a>
            )}

            <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 p-8">
              <div className="bg-cyan-500 w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6">
                <Clock size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3">工作时间</h3>
              <p className="text-slate-600 mb-2">7x24 小时在线</p>
              <p className="text-slate-600">全年无休，随时为您服务</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl border border-cyan-100 p-8">
            <h3 className="text-2xl font-black text-slate-900 mb-6 text-center">常见问题</h3>
            <p className="text-slate-600 text-center mb-6">
              在联系我们之前，您可以先查看常见问题，可能会找到您需要的答案
            </p>
            <div className="flex justify-center">
              <button 
                onClick={() => navigate('/guides/faq')}
                className="bg-cyan-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-cyan-600 transition-all"
              >
                查看常见问题
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black mb-6">需要帮助？</h2>
          <p className="text-xl text-cyan-50 mb-8">
            我们的客服团队随时为您解答疑问
          </p>
          {settings?.telegramCustomerService && (
            <a 
              href={settings.telegramCustomerService}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-white text-cyan-600 px-10 py-4 rounded-2xl font-black hover:bg-cyan-50 transition-all shadow-xl"
            >
              联系客服
            </a>
          )}
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
