import { useNavigate } from 'react-router-dom';
import { Wallet, Zap, ArrowRightLeft, Battery, BookOpen, Shield, Phone, FileText, TrendingUp, Users } from 'lucide-react';
import SEOHead from '../components/SEOHead';

const ServiceOverviewPage = () => {
  const navigate = useNavigate();

  const services = [
    {
      icon: <Wallet className="w-12 h-12 text-cyan-500" />,
      title: 'USDT 代付',
      description: '快速、安全的 USDT-TRC20 自动化转账服务，支持批量发放，实时到账。',
      features: ['自动化处理', '批量转账', '实时到账', 'API 接入'],
      link: '/services/usdt-payment',
      actionText: '了解详情',
      color: 'cyan'
    },
    {
      icon: <Zap className="w-12 h-12 text-blue-500" />,
      title: 'TRX 代付',
      description: '波场 TRX 自动化转账服务，为您的 DApp 或平台提供稳定的 TRX 发放能力。',
      features: ['快速确认', '低手续费', '稳定可靠', '7x24 服务'],
      link: '/services/trx-payment',
      actionText: '了解详情',
      color: 'blue'
    },
    {
      icon: <Battery className="w-12 h-12 text-orange-500" />,
      title: '能量租赁',
      description: 'TRON 能量租赁服务，大幅降低 USDT 转账手续费，节省高达 90% 的成本。',
      features: ['降低 90% 费用', '即时到账', '灵活租期', '自动续租'],
      link: '/services/energy-rental',
      actionText: '了解详情',
      color: 'orange'
    },
    {
      icon: <ArrowRightLeft className="w-12 h-12 text-purple-500" />,
      title: '闪兑服务',
      description: 'TRX/USDT 快速兑换，实时汇率，秒级到账，支持大额交易。',
      features: ['实时汇率', '秒级到账', '无需注册', '大额支持'],
      link: '/services/swap',
      actionText: '了解详情',
      color: 'purple'
    }
  ];

  const guides = [
    {
      icon: <BookOpen className="w-8 h-8 text-cyan-500" />,
      title: '新手教程',
      description: '从零开始学习如何使用我们的服务，包含详细的图文教程和视频指导。',
      link: '/guides/beginner'
    },
    {
      icon: <FileText className="w-8 h-8 text-blue-500" />,
      title: 'API 文档',
      description: '完整的 API 接入文档，支持多种编程语言，快速集成到您的系统。',
      link: '/guides/api'
    },
    {
      icon: <Shield className="w-8 h-8 text-green-500" />,
      title: '常见问题',
      description: '汇总了用户最关心的问题和解答，帮助您快速解决使用中的疑问。',
      link: '/guides/faq'
    }
  ];

  const aboutItems = [
    {
      icon: <Users className="w-8 h-8 text-cyan-500" />,
      title: '公司介绍',
      description: '了解我们的团队、发展历程和服务理念。',
      link: '/about/company'
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-500" />,
      title: '安全保障',
      description: '多重安全措施，确保您的资金和数据安全。',
      link: '/about/security'
    },
    {
      icon: <Phone className="w-8 h-8 text-green-500" />,
      title: '联系我们',
      description: '7x24 小时客服支持，随时为您解答疑问。',
      link: '/about/contact'
    }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "服务总览",
    "description": "提供全方位的加密货币支付解决方案",
    "url": typeof window !== 'undefined' ? window.location.href : ''
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SEOHead
        title="服务总览 - USDT/TRX 代付、能量租赁、闪兑服务"
        description="提供全方位的加密货币支付解决方案，包括 USDT/TRX 代付、能量租赁、闪兑服务等。安全、快速、专业的服务。"
        keywords={['USDT 代付', 'TRX 代付', '能量租赁', '闪兑服务', '加密货币支付']}
        structuredData={structuredData}
      />
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-gradient-to-b from-cyan-50/50 to-transparent -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full border border-cyan-100 shadow-sm mb-6">
            <span className="text-[11px] font-black text-cyan-600 uppercase tracking-widest">Service Overview</span>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-black text-slate-900 leading-tight mb-6">
            服务总览
          </h1>
          
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8">
            提供全方位的加密货币支付解决方案，包括 USDT/TRX 代付、能量租赁、闪兑服务等。
            <br />
            安全、快速、专业的服务，助力您的业务发展。
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => navigate('/pay')}
              className="bg-cyan-500 text-white px-8 py-4 rounded-2xl font-black hover:bg-cyan-600 transition-all shadow-xl shadow-cyan-100"
            >
              立即使用
            </button>
            <button 
              onClick={() => navigate('/guides/beginner')}
              className="bg-white border-2 border-cyan-500 text-cyan-600 px-8 py-4 rounded-2xl font-black hover:bg-cyan-50 transition-all"
            >
              新手教程
            </button>
          </div>
        </div>
      </section>

      {/* 核心服务 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4">核心服务</h2>
            <p className="text-lg text-slate-600">为您提供专业的加密货币支付解决方案</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200 p-8 hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="flex items-start gap-6">
                  <div className={`bg-${service.color}-50 p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                    {service.icon}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-2xl font-black text-slate-900 mb-3">{service.title}</h3>
                    <p className="text-slate-600 mb-4 leading-relaxed">{service.description}</p>
                    
                    <div className="grid grid-cols-2 gap-2 mb-6">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                          <div className={`w-1.5 h-1.5 bg-${service.color}-500 rounded-full`}></div>
                          {feature}
                        </div>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => navigate(service.link)}
                      className={`text-${service.color}-600 font-bold hover:text-${service.color}-700 flex items-center gap-2 group-hover:gap-3 transition-all`}
                    >
                      {service.actionText}
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 使用指南 */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4">使用指南</h2>
            <p className="text-lg text-slate-600">帮助您快速上手，充分利用我们的服务</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {guides.map((guide, index) => (
              <div 
                key={index}
                onClick={() => navigate(guide.link)}
                className="bg-white rounded-2xl border border-slate-200 p-8 hover:shadow-xl transition-all cursor-pointer group"
              >
                <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {guide.icon}
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">{guide.title}</h3>
                <p className="text-slate-600 leading-relaxed mb-4">{guide.description}</p>
                <div className="text-cyan-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                  查看详情 <span>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 关于我们 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4">关于我们</h2>
            <p className="text-lg text-slate-600">了解我们的团队和服务保障</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {aboutItems.map((item, index) => (
              <div 
                key={index}
                onClick={() => navigate(item.link)}
                className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 p-8 hover:shadow-xl transition-all cursor-pointer group"
              >
                <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed mb-4">{item.description}</p>
                <div className="text-cyan-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                  了解更多 <span>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 数据统计 */}
      <section className="py-20 bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-black mb-2">12,000+</div>
              <div className="text-cyan-100">服务用户</div>
            </div>
            <div>
              <div className="text-5xl font-black mb-2">500,000+</div>
              <div className="text-cyan-100">交易笔数</div>
            </div>
            <div>
              <div className="text-5xl font-black mb-2">$50M+</div>
              <div className="text-cyan-100">交易金额</div>
            </div>
            <div>
              <div className="text-5xl font-black mb-2">99.9%</div>
              <div className="text-cyan-100">服务可用性</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black text-slate-900 mb-6">准备开始了吗？</h2>
          <p className="text-xl text-slate-600 mb-8">
            立即体验我们的服务，或联系我们的客服团队获取更多帮助
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => navigate('/pay')}
              className="bg-cyan-500 text-white px-10 py-4 rounded-2xl font-black hover:bg-cyan-600 transition-all shadow-xl shadow-cyan-100"
            >
              立即使用
            </button>
            <button 
              onClick={() => navigate('/about/contact')}
              className="bg-white border-2 border-slate-300 text-slate-700 px-10 py-4 rounded-2xl font-black hover:bg-slate-50 transition-all"
            >
              联系客服
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServiceOverviewPage;
