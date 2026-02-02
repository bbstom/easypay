import { useState, useEffect } from 'react';
import { Zap, Copy } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';

const EnergyRentalPage = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [priceTrx, setPriceTrx] = useState(1);
  const [priceEnergy, setPriceEnergy] = useState(65000);
  const [minAmount, setMinAmount] = useState(10);
  const [validityHours, setValidityHours] = useState(24);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [ads, setAds] = useState([]);

  useEffect(() => {
    fetchEnergyInfo();
    fetchAds();
  }, []);

  const fetchEnergyInfo = async () => {
    try {
      const { data } = await axios.get('/api/settings/public');
      setWalletAddress(data.energyRentalAddress || '');
      setPriceTrx(data.energyPriceTrx || 1);
      setPriceEnergy(data.energyPriceEnergy || 65000);
      setMinAmount(data.energyMinAmount || 10);
      setValidityHours(data.energyValidityHours || 24);
      setNotice(data.energyNotice || '');
    } catch (error) {
      console.error('获取能量租赁信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAds = async () => {
    try {
      const { data } = await axios.get('/api/ads');
      const energyAds = data.filter(ad => ad.position === 'energy-bottom');
      setAds(energyAds);
    } catch (error) {
      console.error('获取广告失败:', error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('已复制到剪贴板');
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 pt-24 pb-8">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-slate-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 pt-24 pb-8">
      <div className="max-w-4xl mx-auto px-4 w-full">
        {/* 标题 */}
        <div className="text-center mb-3">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-tr from-orange-500 to-red-600 rounded-xl mb-2 shadow-lg shadow-orange-200">
            <Zap className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-1">能量租赁</h1>
          <p className="text-sm text-slate-600">转入 TRX，自动获得能量</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-lg">
          {/* 能量租赁说明 - 两列布局 */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3 mb-4 border border-orange-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center md:text-left">
                <p className="text-xs text-slate-600 mb-1">能量租赁服务</p>
                <p className="text-lg font-black text-slate-900">转 TRX 即可获得能量</p>
              </div>
              <div className="text-center md:text-right">
                <p className="text-xs text-slate-600 mb-1">当前价格</p>
                <p className="text-lg font-black text-orange-600">{priceTrx} TRX = {priceEnergy.toLocaleString()} 能量</p>
              </div>
            </div>
          </div>

          {/* 收款地址和二维码 */}
          {walletAddress ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 左侧：二维码 */}
              <div className="flex flex-col items-center justify-center">
                <p className="text-sm font-bold text-slate-700 mb-2">扫码转账</p>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <QRCodeSVG 
                    value={walletAddress} 
                    size={160}
                    level="H"
                  />
                </div>
              </div>

              {/* 右侧：地址和说明 */}
              <div className="space-y-3">
                {/* 地址 */}
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">收款地址（TRX）</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-50 rounded-lg px-3 py-2 font-mono text-xs text-slate-900 break-all border border-slate-200">
                      {walletAddress}
                    </div>
                    <button 
                      onClick={() => copyToClipboard(walletAddress)} 
                      className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all flex-shrink-0"
                      title="复制地址"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>

                {/* 使用说明 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800 font-bold mb-1.5">💡 使用说明</p>
                  <ol className="text-xs text-blue-700 space-y-1 ml-3 list-decimal">
                    <li>转 TRX 到上方地址</li>
                    <li>系统自动检测并分配能量</li>
                    <li>能量发送到您的转出地址</li>
                    <li>约需 1-5 分钟完成</li>
                  </ol>
                </div>

                {/* 注意事项 */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-800 font-bold mb-1.5">⚠️ 重要提示</p>
                  {notice ? (
                    <div className="text-xs text-yellow-700 space-y-0.5">
                      {notice.split('\n').map((line, index) => (
                        <p key={index}>{line}</p>
                      ))}
                    </div>
                  ) : (
                    <ul className="text-xs text-yellow-700 space-y-0.5 ml-3 list-disc">
                      <li>仅支持 TRX 转账</li>
                      <li>最小金额：{minAmount} TRX</li>
                      <li>能量有效期：{validityHours}小时</li>
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500 text-sm mb-1">暂未配置能量租赁服务</p>
              <p className="text-xs text-slate-400">请联系管理员配置</p>
            </div>
          )}
        </div>

        {/* 广告位 - 两列布局 */}
        {ads.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {ads.map((ad) => (
              <div key={ad._id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {ad.type === 'image' && ad.imageUrl ? (
                  <a 
                    href={ad.link || '#'} 
                    target={ad.link ? '_blank' : '_self'}
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img 
                      src={ad.imageUrl} 
                      alt={ad.title}
                      className="w-full h-auto object-cover"
                      style={{ maxHeight: `${ad.height}px` }}
                    />
                  </a>
                ) : (
                  <div 
                    className="p-4 flex items-center justify-center text-center"
                    style={{ minHeight: `${ad.height}px` }}
                  >
                    {ad.link ? (
                      <a 
                        href={ad.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-slate-700 hover:text-orange-600 transition-colors"
                      >
                        <h3 className="font-bold text-sm mb-1">{ad.title}</h3>
                        <p className="text-xs text-slate-600">{ad.content}</p>
                      </a>
                    ) : (
                      <div>
                        <h3 className="font-bold text-sm mb-1">{ad.title}</h3>
                        <p className="text-xs text-slate-600">{ad.content}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnergyRentalPage;
