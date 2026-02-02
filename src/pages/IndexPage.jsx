import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Zap, ArrowRight, Clock } from 'lucide-react';
import axios from 'axios';

const IndexPage = () => {
  const navigate = useNavigate();
  const [ads, setAds] = useState([]);
  const [heroImage, setHeroImage] = useState('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop');

  useEffect(() => {
    axios.get('/api/ads').then(res => setAds(res.data)).catch(console.error);
    // 获取主页展示图片
    axios.get('/api/settings/public').then(res => {
      if (res.data.homeHeroImage) {
        setHeroImage(res.data.homeHeroImage);
      }
    }).catch(console.error);
  }, []);

  const getAdsByPosition = (position) => {
    return ads.filter(ad => ad.position === position && ad.isActive).sort((a, b) => a.order - b.order);
  };

  return (
    <div className="animate-in fade-in duration-700">
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-cyan-50/50 to-transparent -z-10"></div>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full border border-cyan-100 shadow-sm">
              <span className="text-[11px] font-black text-cyan-600 uppercase tracking-widest">Enterprise Ready</span>
              <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
              <span className="text-[11px] font-medium text-slate-500">已为超过 12,000 名用户提供服务</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.05] tracking-tight">
              让链上支付 <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">像发红包一样简单</span>
            </h1>
            <p className="text-lg text-slate-500 font-medium max-w-xl leading-relaxed">
              FastPay 是领先的自动化代付协议。支持通过法币直接为任何波场地址发放 USDT 或 TRX，无需配置私钥，无需购买能量。
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button onClick={() => navigate('/pay')} className="bg-cyan-500 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-cyan-600 transition-all shadow-xl shadow-cyan-100">
                USDT 代付 <ArrowRight size={20} />
              </button>
              <button onClick={() => navigate('/pay-trx')} className="bg-white border-2 border-cyan-500 text-cyan-600 px-8 py-4 rounded-2xl font-black hover:bg-cyan-50 transition-all">
                TRX 代付
              </button>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur-3xl rounded-full animate-pulse"></div>
            <div className="relative bg-white/40 backdrop-blur-xl border border-white p-4 rounded-[40px] shadow-2xl">
              <img src={heroImage} alt="Dashboard Preview" className="rounded-[32px] shadow-sm grayscale-[0.5] opacity-90" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { title: "全自动结算", icon: <Zap className="text-amber-500" />, desc: "支付回调后 30 秒内自动触发链上转账，全天候 24/7 无间断服务。" },
            { title: "银行级风控", icon: <ShieldCheck className="text-blue-500" />, desc: "多签名冷钱包存储技术，所有代付流水实时监控，确保资金链路绝对安全。" },
            { title: "极速到账", icon: <Clock className="text-cyan-500" />, desc: "自主研发的节点加速技术，确保您的每一笔代付都在下一个区块确认。" },
          ].map((item, i) => (
            <div key={i} className="space-y-4 text-center md:text-left">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto md:mx-0">
                {item.icon}
              </div>
              <h3 className="text-xl font-black text-slate-800">{item.title}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 主页底部 - 3x3 广告位 */}
      {getAdsByPosition('home-bottom').length > 0 && (
        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl font-black text-slate-800 mb-8">合作伙伴</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {getAdsByPosition('home-bottom').slice(0, 9).map((ad) => (
                <div 
                  key={ad._id} 
                  className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  style={{ height: `${ad.height}px` }}
                >
                  {ad.link ? (
                    <a 
                      href={ad.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block w-full h-full"
                    >
                      {ad.type === 'image' ? (
                        <img 
                          src={ad.imageUrl} 
                          alt={ad.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-4 text-center">
                          <p className="text-sm font-medium text-slate-700 line-clamp-3">{ad.content}</p>
                        </div>
                      )}
                    </a>
                  ) : (
                    <div className="w-full h-full">
                      {ad.type === 'image' ? (
                        <img 
                          src={ad.imageUrl} 
                          alt={ad.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-4 text-center">
                          <p className="text-sm font-medium text-slate-700 line-clamp-3">{ad.content}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default IndexPage;
