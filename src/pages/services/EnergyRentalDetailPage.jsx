import { useNavigate } from 'react-router-dom';
import { Battery, ArrowRight } from 'lucide-react';
import SEOHead from '../../components/SEOHead';

const EnergyRentalDetailPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SEOHead
        title="TRON 能量租赁 - 降低 90% USDT 转账手续费 | 波场能量租赁服务"
        description="TRON 能量租赁服务，大幅降低 USDT-TRC20 转账手续费，节省高达 90% 的成本。即时到账，灵活租期，支持自动续租。"
        keywords={[
          'TRON 能量',
          '能量租赁',
          '波场能量',
          'USDT 手续费',
          '降低手续费',
          'TRON Energy',
          '能量租用',
          'TRC20 手续费',
          '波场资源'
        ]}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "TRON 能量租赁",
          "description": "降低 USDT 转账手续费的能量租赁服务"
        }}
      />
      <div className="bg-white border-b border-slate-200 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <button onClick={() => navigate('/')} className="hover:text-cyan-600">首页</button>
            <span>/</span>
            <button onClick={() => navigate('/services')} className="hover:text-cyan-600">服务总览</button>
            <span>/</span>
            <span className="text-slate-900 font-medium">能量租赁详情</span>
          </div>
        </div>
      </div>

      <section className="relative pt-20 pb-16">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-gradient-to-b from-orange-50/50 to-transparent -z-10"></div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl">
            <h1 className="text-5xl lg:text-6xl font-black text-slate-900 leading-tight mb-6">
              TRON 能量租赁
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed mb-8">
              大幅降低 USDT-TRC20 转账手续费，节省高达 90% 的成本。
              即时到账，灵活租期，支持自动续租。
            </p>
            <button 
              onClick={() => navigate('/energy-rental')}
              className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-black hover:bg-orange-600 transition-all shadow-xl flex items-center gap-2"
            >
              立即租赁 <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl">
            <h2 className="text-3xl font-black text-slate-900 mb-6">什么是 TRON 能量？</h2>
            <div className="prose prose-lg text-slate-600 space-y-4">
              <p>
                TRON 能量（Energy）是波场网络中用于执行智能合约的资源。每次 USDT-TRC20 转账都需要消耗约 31,895 能量。
                如果账户没有足够的能量，系统会自动燃烧 TRX 来支付手续费，成本较高。
              </p>
              <p>
                通过租赁能量，您可以大幅降低转账成本。相比直接消耗 TRX，租赁能量可节省 80-90% 的手续费。
                特别适合需要频繁转账的用户和平台。能量租赁是波场生态中最经济实惠的手续费解决方案。
              </p>
            </div>

            <h2 className="text-3xl font-black text-slate-900 mb-6 mt-12">能量机制详解</h2>
            <div className="prose prose-lg text-slate-600 space-y-4">
              <p>
                波场网络采用独特的资源模型，主要包括三种资源：
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>能量（Energy）</strong>：用于执行智能合约，如 USDT 转账</li>
                <li><strong>带宽（Bandwidth）</strong>：用于普通 TRX 转账和交易广播</li>
                <li><strong>TRX</strong>：网络原生代币，可以燃烧来获取能量和带宽</li>
              </ul>

              <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">能量如何获得？</h3>
              <p>
                获取能量有两种方式：
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6">
                <h4 className="text-lg font-bold text-slate-900 mb-2">方式 1：质押 TRX</h4>
                <p className="mb-0">
                  将 TRX 质押（Stake）到波场网络，可以获得能量。质押 1 TRX 约可获得 1,000 能量，
                  质押期间 TRX 被锁定，解除质押需要等待 3 天。这种方式适合长期持有 TRX 的用户。
                </p>
              </div>
              <div className="bg-orange-50 border-l-4 border-orange-500 p-6 my-6">
                <h4 className="text-lg font-bold text-slate-900 mb-2">方式 2：租赁能量（推荐）</h4>
                <p className="mb-0">
                  从能量租赁平台租赁能量，无需质押 TRX，即时到账，灵活租期。
                  这是最经济实惠的方式，特别适合需要频繁转账但不想长期持有 TRX 的用户。
                </p>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">能量如何消耗？</h3>
              <p>
                不同的智能合约操作消耗的能量不同：
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>USDT-TRC20 转账</strong>：约 31,895 能量（最常见）</li>
                <li><strong>其他 TRC20 代币转账</strong>：约 15,000-65,000 能量</li>
                <li><strong>智能合约调用</strong>：根据复杂度，几千到几十万能量不等</li>
                <li><strong>NFT 铸造和转移</strong>：约 50,000-100,000 能量</li>
              </ul>
              <p>
                如果账户能量不足，系统会自动燃烧 TRX 来支付。1 能量 ≈ 0.00042 TRX（价格会波动），
                一笔 USDT 转账需要燃烧约 13.4 TRX，成本较高。
              </p>
            </div>

            <h2 className="text-3xl font-black text-slate-900 mb-6 mt-12">成本对比分析</h2>
            <div className="prose prose-lg text-slate-600 space-y-4">
              <p>
                让我们通过实际数据对比三种方式的成本：
              </p>
              <div className="overflow-x-auto my-6">
                <table className="min-w-full bg-white border border-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-bold text-slate-900 border-b">方式</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-slate-900 border-b">单次成本</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-slate-900 border-b">100 次成本</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-slate-900 border-b">节省比例</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-6 py-4 text-slate-900 font-semibold">直接燃烧 TRX</td>
                      <td className="px-6 py-4 text-slate-600">≈ 13.4 TRX</td>
                      <td className="px-6 py-4 text-slate-600">≈ 1,340 TRX</td>
                      <td className="px-6 py-4 text-slate-600">-</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 text-slate-900 font-semibold">质押 TRX</td>
                      <td className="px-6 py-4 text-slate-600">≈ 32 TRX（质押）</td>
                      <td className="px-6 py-4 text-slate-600">≈ 3,200 TRX（质押）</td>
                      <td className="px-6 py-4 text-green-600 font-bold">需要大量资金</td>
                    </tr>
                    <tr className="bg-orange-50">
                      <td className="px-6 py-4 text-slate-900 font-bold">租赁能量</td>
                      <td className="px-6 py-4 text-orange-600 font-bold">≈ 1.5 TRX</td>
                      <td className="px-6 py-4 text-orange-600 font-bold">≈ 150 TRX</td>
                      <td className="px-6 py-4 text-green-600 font-bold">节省 88%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-slate-500">
                * 以上数据基于 2024 年市场价格，实际价格可能有波动。TRX 价格按 0.15 美元计算。
              </p>

              <div className="bg-green-50 border-l-4 border-green-500 p-6 my-6">
                <h3 className="text-xl font-bold text-slate-900 mb-3">💰 节省计算示例</h3>
                <p className="mb-2">
                  假设您每天需要进行 100 笔 USDT 转账：
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>直接燃烧 TRX：1,340 TRX/天 ≈ 201 美元/天 ≈ 6,030 美元/月</li>
                  <li>租赁能量：150 TRX/天 ≈ 22.5 美元/天 ≈ 675 美元/月</li>
                  <li><strong className="text-green-600">每月节省：5,355 美元（88%）</strong></li>
                </ul>
              </div>
            </div>

            <h2 className="text-3xl font-black text-slate-900 mb-6 mt-12">租赁策略</h2>
            <div className="prose prose-lg text-slate-600 space-y-4">
              <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">如何选择租赁时长？</h3>
              <p>
                我们提供多种租赁时长，您可以根据实际需求选择：
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>1 小时</strong>：适合临时需求，如单次大额转账</li>
                <li><strong>1 天</strong>：适合短期活动，如空投、促销</li>
                <li><strong>3 天</strong>：适合中期需求，性价比较高</li>
                <li><strong>7 天</strong>：适合长期使用，价格最优惠</li>
                <li><strong>自动续租</strong>：适合持续运营，无需手动续费</li>
              </ul>

              <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">如何计算所需能量？</h3>
              <p>
                计算公式：所需能量 = 单次消耗 × 转账次数
              </p>
              <div className="bg-blue-50 rounded-xl p-6 my-6">
                <h4 className="text-lg font-bold text-slate-900 mb-3">📊 计算示例</h4>
                <p className="mb-2">
                  如果您计划在 1 天内进行 50 笔 USDT 转账：
                </p>
                <ul className="list-none space-y-1">
                  <li>• 单次消耗：31,895 能量</li>
                  <li>• 转账次数：50 次</li>
                  <li>• 所需能量：31,895 × 50 = 1,594,750 能量</li>
                  <li>• 建议租赁：1,600,000 能量（留 5% 余量）</li>
                </ul>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">最佳租赁时机</h3>
              <p>
                能量价格会随市场波动，以下时机租赁更划算：
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>TRX 价格下跌时</strong>：能量价格通常也会下降</li>
                <li><strong>网络拥堵较少时</strong>：非高峰期价格更优惠</li>
                <li><strong>批量租赁</strong>：一次性租赁大量能量可享受折扣</li>
                <li><strong>长期租赁</strong>：租期越长，单价越低</li>
              </ul>
            </div>

            <h2 className="text-3xl font-black text-slate-900 mb-6 mt-12">使用场景</h2>
            <div className="prose prose-lg text-slate-600 space-y-4">
              <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. 个人用户</h3>
              <p>
                如果您需要频繁转账 USDT，租赁能量可以大幅降低成本：
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>日常转账：每天几笔到几十笔转账</li>
                <li>交易套利：在不同交易所之间搬砖</li>
                <li>支付收款：使用 USDT 进行商业支付</li>
                <li>资产管理：在多个钱包之间转移资产</li>
              </ul>

              <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. 商户平台</h3>
              <p>
                如果您运营电商、游戏或其他平台，需要为用户处理大量转账：
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>用户提现：每天处理数百笔提现请求</li>
                <li>批量发放：向用户发放奖励、返利</li>
                <li>供应商结算：向供应商支付货款</li>
                <li>员工工资：使用 USDT 发放工资</li>
              </ul>

              <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. 交易所和钱包</h3>
              <p>
                大型平台每天需要处理数千笔转账，能量租赁可以显著降低运营成本：
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>用户充提：处理用户的充值和提现</li>
                <li>热钱包管理：在热钱包和冷钱包之间转移资产</li>
                <li>流动性管理：在不同交易对之间调配资金</li>
                <li>跨链桥接：支持资产跨链转移</li>
              </ul>

              <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. DeFi 协议</h3>
              <p>
                DeFi 协议需要频繁与智能合约交互，能量消耗巨大：
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>流动性挖矿：用户存取资产</li>
                <li>借贷协议：抵押、借款、还款操作</li>
                <li>DEX 交易：代币兑换和流动性管理</li>
                <li>收益聚合：自动复投和收益分配</li>
              </ul>
            </div>

            <h2 className="text-3xl font-black text-slate-900 mb-6 mt-12">实际案例</h2>
            <div className="prose prose-lg text-slate-600 space-y-4">
              <div className="bg-slate-50 rounded-xl p-6 my-6">
                <h3 className="text-xl font-bold text-slate-900 mb-3">案例 1：电商平台批量提现</h3>
                <p className="text-slate-600 mb-3">
                  某跨境电商平台每天需要为 500 个商户处理 USDT 提现。使用能量租赁后，
                  每月手续费从 18 万元降低到 2 万元，节省 88%。
                </p>
                <p className="text-slate-600 mb-0">
                  <strong>效果</strong>：年节省成本 192 万元，商户满意度大幅提升。
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-6 my-6">
                <h3 className="text-xl font-bold text-slate-900 mb-3">案例 2：交易所热钱包管理</h3>
                <p className="text-slate-600 mb-3">
                  某中型交易所每天需要处理 2000 笔 USDT 充提。通过租赁能量，
                  每月手续费从 72 万元降低到 9 万元。
                </p>
                <p className="text-slate-600 mb-0">
                  <strong>效果</strong>：年节省成本 756 万元，显著提升盈利能力。
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-6 my-6">
                <h3 className="text-xl font-bold text-slate-900 mb-3">案例 3：DeFi 协议用户补贴</h3>
                <p className="text-slate-600 mb-3">
                  某 DeFi 协议为用户补贴手续费，每天约 1000 笔交易。使用能量租赁后，
                  补贴成本降低 85%，用户活跃度提升 60%。
                </p>
                <p className="text-slate-600 mb-0">
                  <strong>效果</strong>：在降低成本的同时，吸引了更多用户使用协议。
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-black text-slate-900 mb-6 mt-12">常见问题</h2>
            <div className="space-y-6">
              <div className="border-l-4 border-orange-500 pl-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">能量租赁后多久到账？</h3>
                <p className="text-slate-600">
                  能量租赁是即时到账的。支付成功后，能量会立即委托到您的地址，
                  您可以马上使用。整个过程通常在 1 分钟内完成。
                </p>
              </div>

              <div className="border-l-4 border-orange-500 pl-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">租赁的能量会过期吗？</h3>
                <p className="text-slate-600">
                  会的。能量租赁有固定期限（1 小时、1 天、3 天、7 天等）。
                  到期后，能量会自动回收。建议根据实际需求选择合适的租期，
                  或开启自动续租功能。
                </p>
              </div>

              <div className="border-l-4 border-orange-500 pl-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">能量用不完会退款吗？</h3>
                <p className="text-slate-600">
                  能量租赁是按时长计费的，不是按使用量。如果租赁期内没有用完，
                  剩余能量会在到期后回收，不会退款。建议根据实际需求精确计算所需能量。
                </p>
              </div>

              <div className="border-l-4 border-orange-500 pl-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">可以为多个地址租赁能量吗？</h3>
                <p className="text-slate-600">
                  可以。我们支持批量租赁，您可以一次性为多个地址租赁能量。
                  这对于需要管理多个钱包的平台特别有用。
                </p>
              </div>

              <div className="border-l-4 border-orange-500 pl-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">能量不够用怎么办？</h3>
                <p className="text-slate-600">
                  如果能量不够，系统会自动燃烧 TRX 来支付剩余的手续费。
                  建议在租赁时预留 5-10% 的余量，或开启自动续租功能，确保能量充足。
                </p>
              </div>

              <div className="border-l-4 border-orange-500 pl-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">支持自动续租吗？</h3>
                <p className="text-slate-600">
                  支持。您可以在后台开启自动续租功能，系统会在能量即将用完时自动续租，
                  确保您的业务不受影响。自动续租还可以享受额外折扣。
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8 mt-12">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">立即开始节省手续费</h3>
              <p className="text-slate-600 mb-6">
                能量租赁是降低 USDT 转账成本的最佳方案。立即注册，享受首次租赁优惠。
                查看我们的 <button onClick={() => navigate('/guides/beginner')} className="text-orange-600 hover:underline font-semibold">新手教程</button> 了解如何使用，
                或 <button onClick={() => navigate('/about/contact')} className="text-orange-600 hover:underline font-semibold">联系客服</button> 获取专属优惠方案。
              </p>
              <button 
                onClick={() => navigate('/energy-rental')}
                className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all"
              >
                立即租赁能量
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-orange-500 to-red-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black mb-6">立即租赁能量，降低 90% 手续费</h2>
          <button 
            onClick={() => navigate('/energy-rental')}
            className="bg-white text-orange-600 px-10 py-4 rounded-2xl font-black hover:bg-orange-50 transition-all shadow-xl"
          >
            开始租赁
          </button>
        </div>
      </section>
    </div>
  );
};

export default EnergyRentalDetailPage;
