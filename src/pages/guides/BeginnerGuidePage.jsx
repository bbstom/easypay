import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle } from 'lucide-react';
import SEOHead from '../../components/SEOHead';

const BeginnerGuidePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SEOHead
        title="新手教程 - USDT/TRX 代付使用指南 | 从零开始学习加密货币支付"
        description="详细的 USDT/TRX 代付新手教程，包含加密货币基础知识、注册登录、充值余额等完整指南。帮助您快速上手使用代付服务。"
        keywords={[
          'USDT 教程',
          'TRX 教程',
          '加密货币新手',
          '代付教程',
          'USDT 使用指南',
          '波场教程',
          '新手指南',
          '加密货币入门'
        ]}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          "name": "如何使用 USDT/TRX 代付服务",
          "description": "从零开始学习使用代付服务的完整教程"
        }}
      />
      <div className="bg-white border-b border-slate-200 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <button onClick={() => navigate('/')} className="hover:text-cyan-600">首页</button>
            <span>/</span>
            <button onClick={() => navigate('/services')} className="hover:text-cyan-600">服务总览</button>
            <span>/</span>
            <span className="text-slate-900 font-medium">新手教程</span>
          </div>
        </div>
      </div>

      <section className="relative pt-20 pb-16">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-gradient-to-b from-cyan-50/50 to-transparent -z-10"></div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full border border-cyan-100 shadow-sm mb-6">
              <BookOpen className="w-4 h-4 text-cyan-600" />
              <span className="text-xs font-black text-cyan-600 uppercase tracking-widest">Beginner Guide</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-slate-900 leading-tight mb-6">
              新手教程
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              从零开始学习如何使用我们的服务，包含详细的图文教程和常见问题解答
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl border border-cyan-100 p-8">
            <h2 className="text-2xl font-black text-slate-900 mb-6">📚 教程目录</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: '1. 加密货币基础知识', link: '#basics' },
                { title: '2. 如何注册和登录', link: '#register' },
                { title: '3. 如何充值余额', link: '#recharge' }
              ].map((item, i) => (
                <a 
                  key={i}
                  href={item.link}
                  className="flex items-center gap-3 p-4 bg-white rounded-xl hover:shadow-md transition-all"
                >
                  <CheckCircle className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                  <span className="font-bold text-slate-700">{item.title}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="basics" className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-black text-slate-900 mb-8">1. 加密货币基础知识</h2>
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-xl font-black text-slate-900 mb-4">什么是 USDT？</h3>
              <p className="text-slate-600 leading-relaxed">
                USDT（Tether）是一种稳定币，其价值与美元 1:1 锚定。USDT 有多个版本，我们主要使用 USDT-TRC20，
                运行在波场（TRON）网络，转账速度快，手续费低。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black mb-6">准备开始使用？</h2>
          <p className="text-xl text-cyan-50 mb-8">
            立即注册账户，体验快速、安全的代付服务
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="bg-white text-cyan-600 px-10 py-4 rounded-2xl font-black hover:bg-cyan-50 transition-all shadow-xl"
          >
            立即注册
          </button>
        </div>
      </section>
    </div>
  );
};

export default BeginnerGuidePage;
