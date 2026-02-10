import { useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, Shield, Clock, DollarSign } from 'lucide-react';
import SEOHead from '../../components/SEOHead';

const TRXPaymentDetailPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SEOHead
        title="TRX 代付服务 - 波场 TRX 自动化转账 | 快速确认低手续费"
        description="波场 TRX 自动化转账服务，3 秒快速确认，手续费极低。为 DApp 开发者和平台提供稳定的 TRX 发放能力，7x24 小时服务。"
        keywords={[
          'TRX 代付',
          'TRX 转账',
          '波场转账',
          'TRON 支付',
          'TRX 支付',
          'DApp 支付',
          '波场代付',
          'TRX API'
        ]}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "TRX 代付服务",
          "description": "波场 TRX 自动化转账服务"
        }}
      />
      {/* 面包屑 */}
      <div className="bg-white border-b border-slate-200 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <button onClick={() => navigate('/')} className="hover:text-cyan-600">首页</button>
            <span>/</span>
            <button onClick={() => navigate('/services')} className="hover:text-cyan-600">服务总览</button>
            <span>/</span>
            <span className="text-slate-900 font-medium">TRX 代付详情</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative pt-20 pb-16">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-gradient-to-b from-blue-50/50 to-transparent -z-10"></div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl">
            <h1 className="text-5xl lg:text-6xl font-black text-slate-900 leading-tight mb-6">
              TRX 代付服务
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed mb-8">
              波场 TRX 自动化转账服务，为您的 DApp 或平台提供稳定的 TRX 发放能力。
              快速确认，低手续费，7x24 小时服务。
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => navigate('/pay-trx')}
                className="bg-blue-500 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-600 transition-all shadow-xl flex items-center gap-2"
              >
                立即使用 <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 内容区块 */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl">
            <h2 className="text-3xl font-black text-slate-900 mb-6">什么是 TRX 代付？</h2>
            <div className="prose prose-lg text-slate-600 space-y-4">
              <p>
                TRX 是波场（TRON）网络的原生代币，用于支付网络手续费和参与网络治理。
                我们的 TRX 代付服务让您无需持有 TRX 即可完成转账，使用人民币支付即可。
              </p>
              <p>
                TRX 代付特别适合需要为用户提供 TRX 的 DApp 开发者、需要支付能量费用的平台、
                以及需要批量发放 TRX 的项目方。通过我们的服务，您可以快速、安全地为用户账户充值 TRX，
                无需自己管理钱包和私钥，大大降低了技术门槛和安全风险。
              </p>
            </div>

            <h2 className="text-3xl font-black text-slate-900 mb-6 mt-12">TRX 的作用和用途</h2>
            <div className="prose prose-lg text-slate-600 space-y-4">
              <p>
                在波场网络中，TRX 扮演着至关重要的角色。它不仅是网络的原生代币，更是整个生态系统运转的基础。
                以下是 TRX 的主要用途：
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>支付交易手续费</strong>：每笔 TRC20 代币转账都需要消耗少量 TRX 作为手续费</li>
                <li><strong>获取能量和带宽</strong>：质押 TRX 可以获得能量（Energy）和带宽（Bandwidth）资源</li>
                <li><strong>智能合约部署</strong>：在波场上部署智能合约需要消耗 TRX</li>
                <li><strong>DApp 交互</strong>：与去中心化应用交互时需要 TRX 支付 Gas 费</li>
                <li><strong>网络治理</strong>：持有 TRX 可以参与超级代表投票，获得投票奖励</li>
              </ul>
            </div>

            <h2 className="text-3xl font-black text-slate-900 mb-6 mt-12">为什么需要 TRX 代付？</h2>
            <div className="prose prose-lg text-slate-600 space-y-4">
              <p>
                对于 DApp 开发者和平台运营者来说，TRX 代付服务解决了多个痛点：
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6">
                <h3 className="text-xl font-bold text-slate-900 mb-3">用户体验优化</h3>
                <p className="mb-0">
                  新用户往往没有 TRX，无法完成第一笔交易。通过代付服务，您可以为新用户提供初始 TRX，
                  让他们立即体验您的产品，大大降低了使用门槛。
                </p>
              </div>
              <div className="bg-green-50 border-l-4 border-green-500 p-6 my-6">
                <h3 className="text-xl font-bold text-slate-900 mb-3">运营成本控制</h3>
                <p className="mb-0">
                  相比自己购买和管理 TRX，使用代付服务可以按需支付，避免大量资金占用。
                  同时，我们提供批量优惠，帮助您降低运营成本。
                </p>
              </div>
              <div className="bg-purple-50 border-l-4 border-purple-500 p-6 my-6">
                <h3 className="text-xl font-bold text-slate-900 mb-3">技术门槛降低</h3>
                <p className="mb-0">
                  无需自己搭建钱包系统、管理私钥、监控余额。我们提供简单的 API 接口，
                  几行代码即可集成，让您专注于核心业务开发。
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-black text-slate-900 mb-6 mt-12">适用场景</h2>
            <div className="prose prose-lg text-slate-600 space-y-4">
              <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. DApp 开发者</h3>
              <p>
                如果您正在开发波场 DApp，TRX 代付可以帮助您：
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>为新用户提供初始 TRX，让他们立即体验您的 DApp</li>
                <li>为活跃用户发放 TRX 奖励，提升用户粘性</li>
                <li>补贴用户的交易手续费，降低使用成本</li>
                <li>实现"无 Gas 费"体验，提升产品竞争力</li>
              </ul>

              <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. 游戏平台</h3>
              <p>
                区块链游戏需要频繁的链上交互，TRX 代付可以：
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>为玩家提供游戏内 TRX，用于购买道具和交易</li>
                <li>实现游戏奖励的自动发放</li>
                <li>支持玩家之间的 P2P 交易</li>
                <li>降低玩家的参与门槛，提升游戏活跃度</li>
              </ul>

              <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. 交易所和钱包</h3>
              <p>
                为用户提供更好的服务体验：
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>为新注册用户赠送少量 TRX，帮助他们完成首次交易</li>
                <li>补贴小额提现的手续费，提升用户满意度</li>
                <li>实现批量转账功能，提高运营效率</li>
                <li>为 VIP 用户提供手续费减免服务</li>
              </ul>

              <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. NFT 平台</h3>
              <p>
                NFT 铸造和交易需要消耗 TRX：
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>为创作者提供免费铸造额度</li>
                <li>补贴买家的交易手续费</li>
                <li>实现批量空投功能</li>
                <li>支持盲盒开启等链上操作</li>
              </ul>
            </div>

            <h2 className="text-3xl font-black text-slate-900 mb-6 mt-12">技术原理</h2>
            <div className="prose prose-lg text-slate-600 space-y-4">
              <p>
                我们的 TRX 代付服务基于波场网络的原生特性，采用以下技术方案：
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">转账机制</h3>
              <p>
                波场网络采用 DPoS（委托权益证明）共识机制，平均 3 秒出一个区块。
                TRX 转账通过智能合约执行，具有以下特点：
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>快速确认</strong>：3 秒出块，19 个区块确认（约 1 分钟）即可认为交易不可逆</li>
                <li><strong>低手续费</strong>：普通转账仅需 0.1 TRX 左右，远低于以太坊</li>
                <li><strong>高吞吐量</strong>：网络 TPS 可达 2000+，支持大规模并发</li>
              </ul>

              <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">手续费计算</h3>
              <p>
                波场网络的手续费由两部分组成：
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>带宽消耗</strong>：每笔交易消耗约 200-300 字节带宽</li>
                <li><strong>能量消耗</strong>：智能合约调用需要消耗能量</li>
              </ul>
              <p>
                如果账户没有足够的带宽和能量，系统会自动燃烧 TRX 来支付。
                我们的服务会自动计算所需的 TRX 数量，确保转账成功。
              </p>

              <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">安全保障</h3>
              <p>
                我们采用多重安全措施保障资金安全：
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>冷热钱包分离</strong>：大部分资金存储在冷钱包，热钱包仅保留必要的运营资金</li>
                <li><strong>多签机制</strong>：大额转账需要多人签名确认</li>
                <li><strong>实时监控</strong>：7x24 小时监控系统，异常交易自动告警</li>
                <li><strong>风控系统</strong>：智能识别异常行为，防止资金被盗</li>
              </ul>
            </div>

            <h2 className="text-3xl font-black text-slate-900 mb-6 mt-12">使用案例</h2>
            <div className="prose prose-lg text-slate-600 space-y-4">
              <div className="bg-slate-50 rounded-xl p-6 my-6">
                <h3 className="text-xl font-bold text-slate-900 mb-3">案例 1：DApp 新用户激活</h3>
                <p className="text-slate-600 mb-3">
                  某 DeFi 平台使用我们的 TRX 代付服务，为每个新注册用户赠送 10 TRX。
                  用户无需自己购买 TRX，即可立即体验平台的各项功能。
                </p>
                <p className="text-slate-600 mb-0">
                  <strong>效果</strong>：新用户激活率提升 60%，首日留存率提升 40%。
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-6 my-6">
                <h3 className="text-xl font-bold text-slate-900 mb-3">案例 2：游戏奖励发放</h3>
                <p className="text-slate-600 mb-3">
                  某区块链游戏每天需要为数千名玩家发放 TRX 奖励。使用我们的批量代付 API，
                  一次性提交所有转账请求，系统自动处理。
                </p>
                <p className="text-slate-600 mb-0">
                  <strong>效果</strong>：奖励发放时间从 2 小时缩短到 10 分钟，运营效率提升 12 倍。
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-6 my-6">
                <h3 className="text-xl font-bold text-slate-900 mb-3">案例 3：交易所手续费补贴</h3>
                <p className="text-slate-600 mb-3">
                  某交易所为 VIP 用户提供提现手续费补贴。用户提现时，系统自动调用我们的 API，
                  为用户账户充值相应的 TRX。
                </p>
                <p className="text-slate-600 mb-0">
                  <strong>效果</strong>：VIP 用户满意度提升 50%，大额用户留存率提升 30%。
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-black text-slate-900 mb-6 mt-12">常见问题</h2>
            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">TRX 转账需要多久到账？</h3>
                <p className="text-slate-600">
                  波场网络平均 3 秒出一个区块，转账通常在 10 秒内到账。
                  为了确保安全，建议等待 19 个区块确认（约 1 分钟）后再认为交易完成。
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">最小转账金额是多少？</h3>
                <p className="text-slate-600">
                  最小转账金额为 1 TRX。建议单次转账至少 10 TRX，以确保用户有足够的余额完成后续操作。
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">如何查询转账状态？</h3>
                <p className="text-slate-600">
                  我们提供实时的转账状态查询 API。您可以通过订单号查询转账进度，
                  也可以配置回调地址，转账完成后我们会主动通知您。
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">支持批量转账吗？</h3>
                <p className="text-slate-600">
                  支持。我们提供批量转账 API，一次可以提交最多 1000 笔转账请求。
                  系统会自动排队处理，确保每笔转账都能成功。
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">转账失败会退款吗？</h3>
                <p className="text-slate-600">
                  如果转账失败（如地址错误、网络异常等），系统会自动退款到您的账户余额。
                  您可以在后台查看退款记录，也可以联系客服处理。
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-8 mt-12">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">准备好开始了吗？</h3>
              <p className="text-slate-600 mb-6">
                立即注册账号，获取 API 密钥，几分钟内即可完成集成。
                我们提供详细的 <button onClick={() => navigate('/guides/api')} className="text-blue-600 hover:underline font-semibold">API 文档</button> 和 <button onClick={() => navigate('/guides/beginner')} className="text-blue-600 hover:underline font-semibold">新手教程</button>，
                帮助您快速上手。如有任何问题，欢迎 <button onClick={() => navigate('/about/contact')} className="text-blue-600 hover:underline font-semibold">联系我们</button>。
              </p>
              <button 
                onClick={() => navigate('/pay-trx')}
                className="bg-blue-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-600 transition-all"
              >
                立即开始使用
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 优势 */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-black text-slate-900 mb-12 text-center">服务优势</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Zap />, title: '快速确认', desc: '波场网络 3 秒出块，转账快速确认' },
              { icon: <DollarSign />, title: '低手续费', desc: 'TRX 转账手续费极低，成本可控' },
              { icon: <Shield />, title: '稳定可靠', desc: '7x24 小时服务，稳定性 99.9%' }
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black mb-6">准备开始使用 TRX 代付？</h2>
          <button 
            onClick={() => navigate('/pay-trx')}
            className="bg-white text-blue-600 px-10 py-4 rounded-2xl font-black hover:bg-blue-50 transition-all shadow-xl"
          >
            立即使用
          </button>
        </div>
      </section>
    </div>
  );
};

export default TRXPaymentDetailPage;
