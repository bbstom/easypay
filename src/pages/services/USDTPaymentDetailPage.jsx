import { useNavigate } from 'react-router-dom';
import { Wallet, Check, ArrowRight, Shield, Zap, Clock, DollarSign, Users, TrendingUp, HelpCircle } from 'lucide-react';
import SEOHead from '../../components/SEOHead';

const USDTPaymentDetailPage = () => {
  const navigate = useNavigate();

  const advantages = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: '全自动处理',
      description: '无需人工干预，系统自动处理转账请求，实时到账，提高效率。支付回调后 30 秒内自动触发链上转账。'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: '安全可靠',
      description: '多重安全防护机制，私钥加密存储，交易全程监控，确保资金安全。采用银行级风控系统。'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: '快速到账',
      description: '通常 2-10 分钟内完成转账，自主研发的节点加速技术，确保每笔代付都在下一个区块确认。'
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: '费用透明',
      description: '明码标价，无隐藏费用。手续费低至 0.5%，大额交易享受更多优惠。'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: '批量支持',
      description: '支持批量转账，一次性处理多个地址，适合工资发放、奖励分发等场景。'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'API 接入',
      description: '提供完整的 API 接口，支持系统集成，实现自动化代付流程。'
    }
  ];

  const scenarios = [
    {
      title: '跨境电商支付',
      description: '为跨境电商平台提供 USDT 收付款服务，解决传统支付渠道限制，降低手续费成本。支持多币种结算，实时到账。',
      icon: '🛒'
    },
    {
      title: '自由职业者收款',
      description: '自由职业者、远程工作者的理想收款方式。无需银行账户，全球通用，快速到账，避免汇率损失。',
      icon: '💼'
    },
    {
      title: '游戏工作室发放',
      description: '游戏工作室批量发放玩家奖励、工资结算。支持批量操作，自动化处理，节省人力成本。',
      icon: '🎮'
    },
    {
      title: '平台佣金结算',
      description: '各类平台（电商、直播、内容创作等）的佣金自动结算。API 接入，实时结算，提升用户体验。',
      icon: '💰'
    }
  ];

  const steps = [
    { step: '1', title: '注册登录', description: '创建账户并完成身份验证' },
    { step: '2', title: '充值余额', description: '使用支付宝/微信充值人民币' },
    { step: '3', title: '创建订单', description: '输入收款地址和金额' },
    { step: '4', title: '确认支付', description: '确认订单信息并支付' },
    { step: '5', title: '自动转账', description: '系统自动完成 USDT 转账' },
    { step: '6', title: '完成通知', description: '转账完成后自动通知' }
  ];

  const faqs = [
    {
      question: '什么是 USDT 代付？',
      answer: 'USDT 代付是一种自动化的加密货币转账服务。用户只需提供收款地址和金额，使用人民币支付，系统会自动完成 USDT-TRC20 转账。适用于批量发放、跨境支付等场景。'
    },
    {
      question: '代付需要多长时间？',
      answer: '通常情况下，USDT 代付在 2-10 分钟内完成。具体时间取决于区块链网络拥堵情况。我们采用自主研发的节点加速技术，确保快速确认。'
    },
    {
      question: '手续费是多少？',
      answer: '我们的手续费为 0.5%-2%，具体费率根据交易金额而定。大额交易享受更多优惠。所有费用透明公开，无隐藏费用。'
    },
    {
      question: '支持哪些支付方式？',
      answer: '目前支持支付宝和微信支付充值人民币余额。充值后可用于 USDT 代付服务。我们正在接入更多支付方式。'
    },
    {
      question: '资金安全如何保障？',
      answer: '我们采用多重安全措施：1) 私钥加密存储；2) 多签名冷钱包；3) 实时风控监控；4) 交易全程可追溯。您的资金安全有保障。'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SEOHead
        title="USDT 代付服务 - 快速安全的 USDT-TRC20 自动化转账 | 批量支付解决方案"
        description="专业的 USDT-TRC20 代付服务，支持批量转账、API 接入，2-10 分钟快速到账。适用于跨境电商、自由职业者、游戏工作室等场景。手续费低至 0.5%。"
        keywords={[
          'USDT 代付',
          'USDT-TRC20',
          'USDT 转账',
          '批量转账',
          'USDT 支付',
          '自动化代付',
          '加密货币支付',
          'USDT API',
          '波场转账',
          'TRON 支付'
        ]}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "USDT 代付服务",
          "description": "快速、安全的 USDT-TRC20 自动化转账服务",
          "provider": {
            "@type": "Organization",
            "name": "可可代付"
          },
          "areaServed": "CN",
          "offers": {
            "@type": "Offer",
            "priceSpecification": {
              "@type": "PriceSpecification",
              "priceCurrency": "CNY",
              "price": "0.5-2%"
            }
          }
        }}
      />
      {/* 面包屑导航 */}
      <div className="bg-white border-b border-slate-200 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <button onClick={() => navigate('/')} className="hover:text-cyan-600">首页</button>
            <span>/</span>
            <button onClick={() => navigate('/services')} className="hover:text-cyan-600">服务总览</button>
            <span>/</span>
            <span className="text-slate-900 font-medium">USDT 代付详情</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-gradient-to-b from-cyan-50/50 to-transparent -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full border border-cyan-100 shadow-sm mb-6">
              <Wallet className="w-4 h-4 text-cyan-600" />
              <span className="text-xs font-black text-cyan-600 uppercase tracking-widest">USDT Payment</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-black text-slate-900 leading-tight mb-6">
              USDT 代付服务
            </h1>
            
            <p className="text-xl text-slate-600 leading-relaxed mb-8">
              快速、安全的 USDT-TRC20 自动化转账服务。支持批量发放、API 接入，
              为您的业务提供专业的加密货币支付解决方案。
            </p>

            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => navigate('/pay')}
                className="bg-cyan-500 text-white px-8 py-4 rounded-2xl font-black hover:bg-cyan-600 transition-all shadow-xl shadow-cyan-100 flex items-center gap-2"
              >
                立即使用 <ArrowRight size={20} />
              </button>
              <button 
                onClick={() => navigate('/guides/beginner')}
                className="bg-white border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-2xl font-black hover:bg-slate-50 transition-all"
              >
                查看教程
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 什么是 USDT 代付 */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl">
            <h2 className="text-3xl font-black text-slate-900 mb-6">什么是 USDT 代付？</h2>
            <div className="prose prose-lg text-slate-600 leading-relaxed space-y-4">
              <p>
                USDT 代付是一种创新的加密货币支付服务，让您无需持有 USDT 即可完成转账。
                您只需使用人民币（支付宝/微信）支付，我们的系统会自动将等值的 USDT-TRC20 转账到指定地址。
              </p>
              <p>
                这项服务特别适合需要频繁进行 USDT 转账的个人和企业，如跨境电商、自由职业者、
                游戏工作室、内容创作平台等。通过我们的服务，您可以：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>无需购买和管理 USDT，降低操作复杂度</li>
                <li>无需配置钱包私钥，提高安全性</li>
                <li>支持批量转账，提高工作效率</li>
                <li>API 接入，实现自动化流程</li>
                <li>7x24 小时服务，随时可用</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 服务优势 */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 mb-4">服务优势</h2>
            <p className="text-lg text-slate-600">为什么选择我们的 USDT 代付服务</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advantages.map((advantage, index) => (
              <div key={index} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all">
                <div className="bg-cyan-50 w-12 h-12 rounded-xl flex items-center justify-center text-cyan-600 mb-4">
                  {advantage.icon}
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">{advantage.title}</h3>
                <p className="text-slate-600 leading-relaxed">{advantage.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 适用场景 */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 mb-4">适用场景</h2>
            <p className="text-lg text-slate-600">USDT 代付可以帮助您解决这些问题</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {scenarios.map((scenario, index) => (
              <div key={index} className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 p-8 hover:shadow-xl transition-all">
                <div className="text-4xl mb-4">{scenario.icon}</div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">{scenario.title}</h3>
                <p className="text-slate-600 leading-relaxed">{scenario.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 使用流程 */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 mb-4">使用流程</h2>
            <p className="text-lg text-slate-600">6 个简单步骤，完成 USDT 代付</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((item, index) => (
              <div key={index} className="bg-white rounded-xl border border-slate-200 p-6 relative">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-cyan-500 text-white rounded-full flex items-center justify-center text-xl font-black shadow-lg">
                  {item.step}
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-black text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button 
              onClick={() => navigate('/guides/beginner')}
              className="text-cyan-600 font-bold hover:text-cyan-700 flex items-center gap-2 mx-auto"
            >
              查看详细教程 <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* 费率说明 */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-black text-slate-900 mb-8 text-center">费率说明</h2>
            
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl border border-cyan-100 p-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-cyan-200">
                      <th className="text-left py-4 px-4 font-black text-slate-900">交易金额</th>
                      <th className="text-left py-4 px-4 font-black text-slate-900">手续费率</th>
                      <th className="text-left py-4 px-4 font-black text-slate-900">到账时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-cyan-100">
                      <td className="py-4 px-4 text-slate-700">100 - 1,000 USDT</td>
                      <td className="py-4 px-4 text-slate-700">2%</td>
                      <td className="py-4 px-4 text-slate-700">2-10 分钟</td>
                    </tr>
                    <tr className="border-b border-cyan-100">
                      <td className="py-4 px-4 text-slate-700">1,000 - 10,000 USDT</td>
                      <td className="py-4 px-4 text-slate-700">1.5%</td>
                      <td className="py-4 px-4 text-slate-700">2-10 分钟</td>
                    </tr>
                    <tr className="border-b border-cyan-100">
                      <td className="py-4 px-4 text-slate-700">10,000 - 50,000 USDT</td>
                      <td className="py-4 px-4 text-slate-700">1%</td>
                      <td className="py-4 px-4 text-slate-700">2-10 分钟</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-slate-700">50,000 USDT 以上</td>
                      <td className="py-4 px-4 text-slate-700">0.5%</td>
                      <td className="py-4 px-4 text-slate-700">2-10 分钟</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 p-4 bg-white rounded-xl">
                <p className="text-sm text-slate-600">
                  <strong className="text-slate-900">注意：</strong>
                  以上费率仅供参考，实际费率以系统显示为准。大额交易可联系客服获取专属优惠。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 常见问题 */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-slate-900 mb-4">常见问题</h2>
              <p className="text-lg text-slate-600">关于 USDT 代付的常见疑问解答</p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-cyan-50 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <HelpCircle className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-black text-slate-900 mb-2">{faq.question}</h3>
                      <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <button 
                onClick={() => navigate('/guides/faq')}
                className="text-cyan-600 font-bold hover:text-cyan-700 flex items-center gap-2 mx-auto"
              >
                查看更多问题 <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black mb-6">准备开始使用 USDT 代付？</h2>
          <p className="text-xl text-cyan-50 mb-8">
            立即体验快速、安全的 USDT 转账服务
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => navigate('/pay')}
              className="bg-white text-cyan-600 px-10 py-4 rounded-2xl font-black hover:bg-cyan-50 transition-all shadow-xl"
            >
              立即使用
            </button>
            <button 
              onClick={() => navigate('/about/contact')}
              className="bg-cyan-600 text-white border-2 border-white px-10 py-4 rounded-2xl font-black hover:bg-cyan-700 transition-all"
            >
              联系客服
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default USDTPaymentDetailPage;
