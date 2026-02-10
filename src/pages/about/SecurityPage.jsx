import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Eye, CheckCircle, Server, FileCheck } from 'lucide-react';
import SEOHead from '../../components/SEOHead';

const SecurityPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SEOHead
        title="安全保障 - 多重安全措施保护您的资金 | 加密货币安全"
        description="采用银行级安全措施，包括冷钱包存储、多签名技术、实时监控等，确保您的资金和数据安全。"
        keywords={[
          '资金安全',
          '加密货币安全',
          '冷钱包',
          '多签名钱包',
          '隐私保护',
          '数据加密',
          '安全措施'
        ]}
      />
      <div className="bg-white border-b border-slate-200 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <button onClick={() => navigate('/')} className="hover:text-cyan-600">首页</button>
            <span>/</span>
            <button onClick={() => navigate('/services')} className="hover:text-cyan-600">服务总览</button>
            <span>/</span>
            <span className="text-slate-900 font-medium">安全保障</span>
          </div>
        </div>
      </div>

      <section className="relative pt-20 pb-16">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-gradient-to-b from-green-50/50 to-transparent -z-10"></div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full border border-green-100 shadow-sm mb-6">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-xs font-black text-green-600 uppercase tracking-widest">Security</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-slate-900 leading-tight mb-6">
              安全保障
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              多重安全措施，确保您的资金和数据安全
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-black text-slate-900 mb-12 text-center">安全措施</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: <Lock />, title: '冷钱包存储', desc: '95% 的资金存储在离线冷钱包中，防止黑客攻击' },
              { icon: <Shield />, title: '多签名技术', desc: '采用多签名钱包，需要多方授权才能转账' },
              { icon: <Eye />, title: '实时监控', desc: '7x24 小时监控系统，及时发现和处理异常' },
              { icon: <Server />, title: '数据加密', desc: '所有数据传输采用 HTTPS 加密，确保安全' },
              { icon: <FileCheck />, title: '定期审计', desc: '定期进行安全审计，及时发现和修复漏洞' },
              { icon: <CheckCircle />, title: '风控系统', desc: '智能风控系统，自动识别和拦截可疑交易' }
            ].map((item, i) => (
              <div key={i} className="bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 p-6">
                <div className="bg-green-50 w-12 h-12 rounded-xl flex items-center justify-center text-green-600 mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-green-500 to-cyan-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black mb-6">您的资金安全是我们的首要任务</h2>
          <p className="text-xl text-green-50 mb-8">
            采用银行级安全措施，让您放心使用
          </p>
          <button 
            onClick={() => navigate('/pay')}
            className="bg-white text-green-600 px-10 py-4 rounded-2xl font-black hover:bg-green-50 transition-all shadow-xl"
          >
            立即体验
          </button>
        </div>
      </section>
    </div>
  );
};

export default SecurityPage;
