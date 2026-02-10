import { useState, useEffect } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import SEOHead from '../components/SEOHead';

const FAQPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFAQs();
    fetchCategories();
  }, []);

  const fetchFAQs = async () => {
    try {
      const { data } = await axios.get('/api/faq');
      setFaqs(data.faqs);
    } catch (error) {
      console.error('获取FAQ失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get('/api/faq/categories');
      setCategories(data.categories);
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  };

  const filteredFaqs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="animate-in fade-in duration-700">
      <SEOHead
        title="常见问题 - USDT/TRX 代付常见疑问解答 | FAQ"
        description="USDT/TRX 代付服务常见问题解答，包含账户注册、充值提现、订单查询、API 接入等问题的详细解答。"
        keywords={[
          '常见问题',
          'FAQ',
          'USDT 代付问题',
          'TRX 代付问题',
          '使用帮助',
          '问题解答',
          '客服支持'
        ]}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": filteredFaqs.slice(0, 10).map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          }))
        }}
      />
      <section className="relative pt-24 pb-12 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-gradient-to-b from-cyan-50/50 to-transparent -z-10"></div>
        
        <div className="max-w-4xl mx-auto px-6">
          {/* 头部 */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-200">
              <HelpCircle className="text-white" size={28} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">常见问题</h1>
            <p className="text-base text-slate-500 font-medium">快速找到您需要的答案</p>
          </div>

          {/* 分类筛选 */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-5 py-2 rounded-lg font-bold text-sm transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-100'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                全部
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-5 py-2 rounded-lg font-bold text-sm transition-all ${
                    selectedCategory === category
                      ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-100'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {/* FAQ列表 */}
          {loading ? (
            <div className="text-center py-20">
              <p className="text-slate-500 font-medium">加载中...</p>
            </div>
          ) : filteredFaqs.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
              <HelpCircle className="mx-auto mb-4 text-slate-300" size={40} />
              <p className="text-slate-500 font-medium">暂无常见问题</p>
            </div>
          ) : (
            <div className="space-y-3 pb-12">
              {filteredFaqs.map((faq) => (
                <div
                  key={faq._id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-all hover:shadow-lg hover:border-cyan-200"
                >
                  <button
                    onClick={() => toggleExpand(faq._id)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-all"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-2.5 py-0.5 bg-cyan-50 text-cyan-700 text-xs font-black rounded-lg">
                          {faq.category}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-slate-900">{faq.question}</h3>
                    </div>
                    <div className="ml-4">
                      {expandedId === faq._id ? (
                        <ChevronUp className="text-slate-400" size={20} />
                      ) : (
                        <ChevronDown className="text-slate-400" size={20} />
                      )}
                    </div>
                  </button>

                  {expandedId === faq._id && (
                    <div className="px-5 pb-4 border-t border-slate-100">
                      <div 
                        className="text-sm text-slate-600 leading-relaxed pt-4 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: faq.answer }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default FAQPage;
