import { useNavigate } from 'react-router-dom';
import { FileText, Code, Key, Send, CheckCircle } from 'lucide-react';
import SEOHead from '../../components/SEOHead';

const APIDocPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SEOHead
        title="API 文档 - USDT/TRX 代付 API 接入指南 | RESTful API 开发文档"
        description="完整的 USDT/TRX 代付 API 接入文档，支持多种编程语言。包含认证方式、接口列表、代码示例等，快速集成到您的系统。"
        keywords={[
          'API 文档',
          'API 接入',
          'RESTful API',
          '代付 API',
          'USDT API',
          'TRX API',
          '开发文档',
          'API 集成',
          '自动化接入'
        ]}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "TechArticle",
          "name": "API 文档",
          "description": "USDT/TRX 代付 API 接入文档"
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
            <span className="text-slate-900 font-medium">API 文档</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative pt-20 pb-16">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-gradient-to-b from-blue-50/50 to-transparent -z-10"></div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full border border-blue-100 shadow-sm mb-6">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-black text-blue-600 uppercase tracking-widest">API Documentation</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-slate-900 leading-tight mb-6">
              API 文档
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              完整的 API 接入文档，支持多种编程语言，快速集成到您的系统
            </p>
          </div>
        </div>
      </section>

      {/* API 概述 */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-black text-slate-900 mb-8">API 概述</h2>
          
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100 p-8 mb-8">
            <p className="text-slate-700 leading-relaxed mb-4">
              我们提供 RESTful API 接口，支持通过 HTTP 请求创建订单、查询订单状态、接收回调通知等操作。
              所有 API 请求都需要进行身份认证，确保数据安全。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white rounded-xl p-4">
                <div className="text-2xl font-black text-blue-600 mb-2">RESTful</div>
                <div className="text-sm text-slate-600">标准 REST API</div>
              </div>
              <div className="bg-white rounded-xl p-4">
                <div className="text-2xl font-black text-blue-600 mb-2">JSON</div>
                <div className="text-sm text-slate-600">数据格式</div>
              </div>
              <div className="bg-white rounded-xl p-4">
                <div className="text-2xl font-black text-blue-600 mb-2">HTTPS</div>
                <div className="text-sm text-slate-600">安全传输</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-xl font-black text-slate-900 mb-4">基础信息</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-4">
                <div className="font-bold text-slate-700 w-32">API 地址：</div>
                <code className="flex-1 bg-slate-100 px-3 py-2 rounded text-sm">https://your-domain.com/api</code>
              </div>
              <div className="flex items-start gap-4">
                <div className="font-bold text-slate-700 w-32">请求方式：</div>
                <div className="text-slate-600">POST（JSON 格式）</div>
              </div>
              <div className="flex items-start gap-4">
                <div className="font-bold text-slate-700 w-32">字符编码：</div>
                <div className="text-slate-600">UTF-8</div>
              </div>
              <div className="flex items-start gap-4">
                <div className="font-bold text-slate-700 w-32">签名算法：</div>
                <div className="text-slate-600">MD5</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 认证方式 */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-black text-slate-900 mb-8">认证方式</h2>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <h3 className="text-xl font-black text-slate-900 mb-4">获取 API 密钥</h3>
            <p className="text-slate-600 mb-4">
              登录后台管理系统，在"个人中心"页面可以查看和管理您的 API 密钥。
            </p>
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Key className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-slate-900">API Key</span>
              </div>
              <code className="text-sm text-slate-600">your_api_key_here</code>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-xl font-black text-slate-900 mb-4">签名算法</h3>
            <p className="text-slate-600 mb-4">
              所有 API 请求都需要携带签名参数，签名算法如下：
            </p>
            <ol className="list-decimal list-inside space-y-2 text-slate-600 mb-4">
              <li>将所有请求参数（除 sign 外）按参数名升序排列</li>
              <li>将参数名和参数值拼接成字符串：key1=value1&key2=value2</li>
              <li>在字符串末尾追加 API 密钥：key1=value1&key2=value2&key=your_api_key</li>
              <li>对字符串进行 MD5 加密，得到签名值</li>
            </ol>
            <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-green-400">
{`// JavaScript 示例
const crypto = require('crypto');

function generateSign(params, apiKey) {
  // 1. 参数排序
  const sortedKeys = Object.keys(params).sort();
  
  // 2. 拼接字符串
  let str = '';
  sortedKeys.forEach(key => {
    str += \`\${key}=\${params[key]}&\`;
  });
  str += \`key=\${apiKey}\`;
  
  // 3. MD5 加密
  return crypto.createHash('md5').update(str).digest('hex');
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* 接口列表 */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-black text-slate-900 mb-8">接口列表</h2>
          
          {/* 创建订单 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-black">POST</div>
              <code className="text-lg font-mono">/api/order/create</code>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-4">创建订单</h3>
            
            <div className="mb-4">
              <h4 className="font-bold text-slate-900 mb-2">请求参数</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left p-3 font-bold">参数名</th>
                      <th className="text-left p-3 font-bold">类型</th>
                      <th className="text-left p-3 font-bold">必填</th>
                      <th className="text-left p-3 font-bold">说明</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3"><code>address</code></td>
                      <td className="p-3">string</td>
                      <td className="p-3">是</td>
                      <td className="p-3">收款地址</td>
                    </tr>
                    <tr>
                      <td className="p-3"><code>amount</code></td>
                      <td className="p-3">number</td>
                      <td className="p-3">是</td>
                      <td className="p-3">转账金额</td>
                    </tr>
                    <tr>
                      <td className="p-3"><code>currency</code></td>
                      <td className="p-3">string</td>
                      <td className="p-3">是</td>
                      <td className="p-3">币种（USDT/TRX）</td>
                    </tr>
                    <tr>
                      <td className="p-3"><code>notify_url</code></td>
                      <td className="p-3">string</td>
                      <td className="p-3">否</td>
                      <td className="p-3">回调地址</td>
                    </tr>
                    <tr>
                      <td className="p-3"><code>sign</code></td>
                      <td className="p-3">string</td>
                      <td className="p-3">是</td>
                      <td className="p-3">签名</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-bold text-slate-900 mb-2">返回示例</h4>
              <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-green-400">
{`{
  "code": 200,
  "message": "success",
  "data": {
    "orderId": "20240101123456789",
    "status": "pending",
    "address": "TXYZoPE5ThdqWmoCwczVgeLnNdS7gEarve",
    "amount": 100,
    "currency": "USDT",
    "createdAt": "2024-01-01T12:34:56Z"
  }
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* 查询订单 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-black">GET</div>
              <code className="text-lg font-mono">/api/order/query</code>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-4">查询订单</h3>
            
            <div className="mb-4">
              <h4 className="font-bold text-slate-900 mb-2">请求参数</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left p-3 font-bold">参数名</th>
                      <th className="text-left p-3 font-bold">类型</th>
                      <th className="text-left p-3 font-bold">必填</th>
                      <th className="text-left p-3 font-bold">说明</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3"><code>orderId</code></td>
                      <td className="p-3">string</td>
                      <td className="p-3">是</td>
                      <td className="p-3">订单号</td>
                    </tr>
                    <tr>
                      <td className="p-3"><code>sign</code></td>
                      <td className="p-3">string</td>
                      <td className="p-3">是</td>
                      <td className="p-3">签名</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black mb-6">需要技术支持？</h2>
          <p className="text-xl text-blue-50 mb-8">
            我们的技术团队随时为您提供帮助
          </p>
          <button 
            onClick={() => navigate('/about/contact')}
            className="bg-white text-blue-600 px-10 py-4 rounded-2xl font-black hover:bg-blue-50 transition-all shadow-xl"
          >
            联系我们
          </button>
        </div>
      </section>
    </div>
  );
};

export default APIDocPage;
