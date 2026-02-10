import { useNavigate } from 'react-router-dom';
import { ArrowRightLeft, ArrowRight } from 'lucide-react';
import SEOHead from '../../components/SEOHead';

const SwapDetailPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SEOHead
        title="TRX/USDT 闪兑服务 - 实时汇率秒级到账 | 加密货币快速兑换"
        description="TRX 与 USDT 之间的快速兑换服务，实时汇率，秒级到账，支持大额交易。无需注册，输入地址即可兑换。"
        keywords={[
          'TRX USDT 兑换',
          '闪兑服务',
          '加密货币兑换',
          'TRX 兑换',
          'USDT 兑换',
          '快速兑换',
          '币币兑换',
          '波场兑换'
        ]}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "TRX/USDT 闪兑服务",
          "description": "快速的加密货币兑换服务"
        }}
      />
      <div className="bg-white border-b border-slate-200 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <button onClick={() => navigate('/')} className="hover:text-cyan-600">首页</button>
            <span>/</span>
            <button onClick={() => navigate('/services')} className="hover:text-cyan-600">服务总览</button>
            <span>/</span>
            <span className="text-slate-900 font-medium">闪兑服务详情</span>
          </div>
        </div>
      </div>

      <section className="relative pt-20 pb-16">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-gradient-to-b from-purple-50/50 to-transparent -z-10"></div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl">
            <h1 className="text-5xl lg:text-6xl font-black text-slate-900 leading-tight mb-6">
              TRX/USDT 闪兑服务
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed mb-8">
              TRX 与 USDT 之间的快速兑换服务。实时汇率，秒级到账，支持大额交易。
              无需注册，输入地址即可兑换。
            </p>
            <button 
              onClick={() => navigate('/swap')}
              className="bg-purple-500 text-white px-8 py-4 rounded-2xl font-black hover:bg-purple-600 transition-all shadow-xl flex items-center gap-2"
            >
              立即兑换 <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl">
            <h2 className="text-3xl font-black text-slate-900 mb-6">什么是闪兑？</h2>
            <div className="prose prose-lg text-slate-600 space-y-4">
              <p>
                闪兑是一种快速的加密货币兑换服务，支持 TRX 和 USDT 之间的互换。
                采用市场实时汇率，公开透明，1-3 分钟内完成兑换并到账。
              </p>
              <p>
                无需注册账户，只需输入接收地址和兑换数量，发送资产到指定地址即可。
                支持单笔 10,000 USDT 以上的大额兑换，是个人和机构快速调配资产的最佳选择。
              </p>
            </div>

            <h2 className="text-3xl font-black text-slate-900 mb-6 mt-12">闪兑原理</h2>
            <div className="prose prose-lg text-slate-600 space-y-4">
              <p>
                闪兑服务基于智能合约和流动性池技术，实现快速、安全的资产兑换：
              </p>
              <div className="bg-purple-50 border-l-4 border-purple-500 p-6 my-6">
                <h3 className="text-xl font-bold text-slate-900 mb-3">1. 实时汇率</h3>
                <p className="mb-0">
                  我们的汇率来自多个主流交易所的实时价格，通过算法加权平均得出。
                  汇率每 10 秒更新一次，确保您获得最公平的价格。
                </p>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6">
                <h3 className="text-xl font-bold text-slate-900 mb-3">2. 流动性保障</h3>
                <p className="mb-0">
                  我们维护充足的 TRX 和 USDT 流动性池，确保大额兑换也能快速成交。
                  单笔支持 10 万 USDT 以上的兑换，满足机构级需求。
                </p>
              </div>
              <div className="bg-green-50 border-l-4 border-green-500 p-6 my-6">
                <h3 className="text-xl font-bold text-slate-900 mb-3">3. 秒级到账</h3>
                <p className="mb-0">
                  收到您的资产后，系统自动执行兑换并转账。整个过程通常在 1-3 分钟内完成，
                  无需等待人工审核，真正实现"闪兑"。
                </p>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">汇率如何确定？</h3>
              <p>
                我们的汇率计算公式：
              </p>
              <div className="bg-slate-50 rounded-xl p-6 my-6">
                <p className="font-mono text-sm mb-4">
                  最终汇率 = 市场汇率 × (1 - 手续费率)
                </p>
                <p className="text-sm text-slate-600">
                  其中，市场汇率来自币安、火币、OKX 等主流交易所的加权平均价格。
                  手续费率根据兑换金额阶梯式递减，大额兑换享受更低费率。
                </p>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">为什么能秒级到账？</h3>
              <p>
                传统交易所需要充值、挂单、成交、提现等多个步骤，整个过程可能需要几小时甚至几天。
                而闪兑服务采用预先准备的流动性池，收到资产后立即转账，大大缩短了时间：
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>无需充值</strong>：直接发送到兑换地址</li>
                <li><strong>无需挂单</strong>：系统自动匹配流动性</li>
                <li><strong>无需等待</strong>：收到即转，1-3 分钟到账</li>
                <li><strong>无需提现</strong>：直接到您的钱包地址</li>
              </ul>
            </div>

            <h2 className="text-3xl font-black text-slate-900 mb-6 mt-12">优势对比</h2>
            <div className="prose prose-lg text-slate-600 space-y-4">
              <p>
                相比其他兑换方式，闪兑服务具有明显优势：
              </p>
              <div className="overflow-x-auto my-6">
                <table className="min-w-full bg-white border border-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-bold text-slate-900 border-b">对比项</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-slate-900 border-b">中心化交易所</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-slate-900 border-b">OTC 场外交易</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-slate-900 border-b">闪兑服务</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-6 py-4 text-slate-900 font-semibold">到账时间</td>
                      <td className="px-6 py-4 text-slate-600">2-24 小时</td>
                      <td className="px-6 py-4 text-slate-600">10-60 分钟</td>
                      <td className="px-6 py-4 text-green-600 font-bold">1-3 分钟</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 text-slate-900 font-semibold">手续费</td>
                      <td className="px-6 py-4 text-slate-600">0.1-0.2%</td>
                      <td className="px-6 py-4 text-slate-600">1-3%</td>
                      <td className="px-6 py-4 text-green-600 font-bold">0.3-0.5%</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 text-slate-900 font-semibold">注册要求</td>
                      <td className="px-6 py-4 text-slate-600">需要 KYC</td>
                      <td className="px-6 py-4 text-slate-600">需要实名</td>
                      <td className="px-6 py-4 text-green-600 font-bold">无需注册</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 text-slate-900 font-semibold">最小金额</td>
                      <td className="px-6 py-4 text-slate-600">10 USDT</td>
                      <td className="px-6 py-4 text-slate-600">100 USDT</td>
                      <td className="px-6 py-4 text-green-600 font-bold">10 USDT</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 text-slate-900 font-semibold">大额支持</td>
                      <td className="px-6 py-4 text-slate-600">需要审核</td>
                      <td className="px-6 py-4 text-slate-600">需要预约</td>
                      <td className="px-6 py-4 text-green-600 font-bold">即时成交</td>
                    </tr>
                    <tr className="bg-purple-50">
                      <td className="px-6 py-4 text-slate-900 font-semibold">综合评分</td>
                      <td className="px-6 py-4 text-slate-600">⭐⭐⭐</td>
                      <td className="px-6 py-4 text-slate-600">⭐⭐</td>
                      <td className="px-6 py-4 text-purple-600 font-bold">⭐⭐⭐⭐⭐</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <h2 className="text-3xl font-black text-slate-900 mb-6 mt-12">使用技巧</h2>
            <div className="prose prose-lg text-slate-600 space-y-4">
              <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">最佳兑换时机</h3>
              <p>
                虽然我们提供实时汇率，但选择合适的时机兑换可以获得更好的价格：
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>市场平稳时</strong>：避免在价格剧烈波动时兑换</li>
                <li><strong>流动性充足时</strong>：交易量大的时段，价差更小</li>
                <li><strong>避开高峰期</strong>：网络拥堵时，确认时间可能延长</li>
                <li><strong>关注市场动态</strong>：重大新闻发布前后，价格可能波动</li>
              </ul>

              <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">如何获得更好的汇率？</h3>
              <div className="bg-blue-50 rounded-xl p-6 my-6">
                <h4 className="text-lg font-bold text-slate-900 mb-3">💡 省钱技巧</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>大额兑换</strong>：单笔 10,000 USDT 以上享受 VIP 费率</li>
                  <li><strong>批量操作</strong>：多笔小额合并为一笔大额</li>
                  <li><strong>避开滑点</strong>：分批兑换大额资产，降低市场冲击</li>
                  <li><strong>使用优惠码</strong>：关注我们的活动，获取手续费折扣</li>
                </ul>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">大额兑换注意事项</h3>
              <p>
                如果您需要兑换大额资产（10 万 USDT 以上），建议：
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>提前咨询</strong>：联系客服确认流动性和费率</li>
                <li><strong>分批兑换</strong>：降低单笔风险，减少价格滑点</li>
                <li><strong>选择时机</strong>：在市场流动性充足时操作</li>
                <li><strong>预留时间</strong>：大额兑换可能需要 5-10 分钟</li>
              </ul>
            </div>

            <h2 className="text-3xl font-black text-slate-900 mb-6 mt-12">使用场景</h2>
            <div className="prose prose-lg text-slate-600 space-y-4">
              <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. 个人资产配置</h3>
              <p>
                根据市场行情，灵活调整 TRX 和 USDT 的持仓比例：
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>TRX 上涨时，兑换部分为 USDT 锁定收益</li>
                <li>TRX 下跌时，用 USDT 买入 TRX 抄底</li>
                <li>需要稳定币时，快速将 TRX 兑换为 USDT</li>
                <li>需要支付能量费时，将 USDT 兑换为 TRX</li>
              </ul>

              <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. 套利交易</h3>
              <p>
                利用不同平台的价差进行套利：
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>在价格低的平台买入 TRX</li>
                <li>通过闪兑快速转换为 USDT</li>
                <li>在价格高的平台卖出</li>
                <li>赚取价差收益</li>
              </ul>

              <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. 商户收款</h3>
              <p>
                如果您接受加密货币支付，闪兑可以帮助您快速转换为稳定币：
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>收到 TRX 付款后，立即兑换为 USDT</li>
                <li>避免价格波动风险</li>
                <li>保持资产稳定</li>
                <li>方便财务管理</li>
              </ul>

              <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. 应急周转</h3>
              <p>
                当您急需某种资产时，闪兑提供最快的解决方案：
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>需要 USDT 支付但只有 TRX</li>
                <li>需要 TRX 支付能量费但只有 USDT</li>
                <li>需要快速调配资产应对市场机会</li>
                <li>需要在不同链之间转移价值</li>
              </ul>
            </div>

            <h2 className="text-3xl font-black text-slate-900 mb-6 mt-12">实际案例</h2>
            <div className="prose prose-lg text-slate-600 space-y-4">
              <div className="bg-slate-50 rounded-xl p-6 my-6">
                <h3 className="text-xl font-bold text-slate-900 mb-3">案例 1：套利交易者</h3>
                <p className="text-slate-600 mb-3">
                  某交易者发现 TRX 在不同交易所存在 2% 的价差。他在低价交易所买入 10 万 TRX，
                  通过闪兑服务快速转换为 USDT，然后在高价交易所卖出，整个过程仅用 5 分钟。
                </p>
                <p className="text-slate-600 mb-0">
                  <strong>收益</strong>：扣除手续费后，净赚 1.5%，约 1,500 USDT。
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-6 my-6">
                <h3 className="text-xl font-bold text-slate-900 mb-3">案例 2：DApp 开发者</h3>
                <p className="text-slate-600 mb-3">
                  某 DApp 项目收到用户的 TRX 付款，需要快速转换为 USDT 用于运营支出。
                  使用闪兑服务，每天处理数百笔兑换，平均 2 分钟到账。
                </p>
                <p className="text-slate-600 mb-0">
                  <strong>效果</strong>：资金周转效率提升 10 倍，运营成本降低 30%。
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-6 my-6">
                <h3 className="text-xl font-bold text-slate-900 mb-3">案例 3：投资者资产配置</h3>
                <p className="text-slate-600 mb-3">
                  某投资者持有大量 TRX，当 TRX 价格上涨 20% 时，他通过闪兑服务将 30% 的 TRX 
                  兑换为 USDT，锁定部分收益。整个过程仅用 3 分钟，避免了价格回调的风险。
                </p>
                <p className="text-slate-600 mb-0">
                  <strong>效果</strong>：成功锁定收益，同时保留 70% 的 TRX 继续持有。
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-black text-slate-900 mb-6 mt-12">常见问题</h2>
            <div className="space-y-6">
              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">兑换需要多久到账？</h3>
                <p className="text-slate-600">
                  通常 1-3 分钟内到账。具体时间取决于网络确认速度和兑换金额。
                  小额兑换（&lt; 1,000 USDT）通常 1 分钟内到账，大额兑换可能需要 3-5 分钟。
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">最小兑换金额是多少？</h3>
                <p className="text-slate-600">
                  最小兑换金额为 10 USDT 或等值的 TRX。建议单笔兑换至少 100 USDT，
                  以获得更好的汇率和更低的手续费比例。
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">支持哪些币种兑换？</h3>
                <p className="text-slate-600">
                  目前支持 TRX 和 USDT-TRC20 之间的互换。未来我们将支持更多波场生态的代币，
                  如 BTT、JST、SUN 等。敬请期待。
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">汇率会变化吗？</h3>
                <p className="text-slate-600">
                  会的。汇率每 10 秒更新一次，跟随市场实时变化。创建订单时会锁定汇率 5 分钟，
                  在此期间完成支付即可享受锁定汇率。超时后需要重新创建订单。
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">兑换失败会退款吗？</h3>
                <p className="text-slate-600">
                  如果兑换失败（如网络异常、流动性不足等），系统会自动将原资产退回到您的地址。
                  退款通常在 10 分钟内完成。您也可以联系客服加急处理。
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">大额兑换有限制吗？</h3>
                <p className="text-slate-600">
                  单笔最大支持 100 万 USDT 的兑换。如需更大金额，请提前联系客服预约。
                  我们会为您提供专属的大额兑换通道和更优惠的费率。
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 mt-12">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">立即开始兑换</h3>
              <p className="text-slate-600 mb-6">
                无需注册，输入地址即可兑换。查看我们的 <button onClick={() => navigate('/guides/beginner')} className="text-purple-600 hover:underline font-semibold">使用教程</button> 了解详细步骤，
                或查看 <button onClick={() => navigate('/guides/faq')} className="text-purple-600 hover:underline font-semibold">常见问题</button> 获取更多帮助。
                如有任何疑问，欢迎 <button onClick={() => navigate('/about/contact')} className="text-purple-600 hover:underline font-semibold">联系我们</button>。
              </p>
              <button 
                onClick={() => navigate('/swap')}
                className="bg-purple-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-purple-600 transition-all"
              >
                立即开始兑换
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-purple-500 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black mb-6">准备开始兑换？</h2>
          <button 
            onClick={() => navigate('/swap')}
            className="bg-white text-purple-600 px-10 py-4 rounded-2xl font-black hover:bg-purple-50 transition-all shadow-xl"
          >
            立即兑换
          </button>
        </div>
      </section>
    </div>
  );
};

export default SwapDetailPage;
