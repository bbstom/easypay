import { useState, useEffect, useRef } from 'react';
import { Wallet, History, ExternalLink, ArrowRight, ShieldCheck, QrCode, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { AlipayIcon, WechatIcon, USDTIcon } from '../components/Icons';
import { Html5Qrcode } from 'html5-qrcode';
import jsQR from 'jsqr';

// 移除未使用的组件定义

const PayPage = () => {
  const { user } = useAuth();
  const payType = 'USDT'; // 固定为USDT
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('wechat');
  const [recentPayments, setRecentPayments] = useState([]);
  const [orderId, setOrderId] = useState('');
  const [scrollOffset, setScrollOffset] = useState(0);
  const [ads, setAds] = useState([]);
  const [settings, setSettings] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [currentOrderId, setCurrentOrderId] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  
  // 二维码扫描相关状态
  const [showScanner, setShowScanner] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanMode, setScanMode] = useState('camera'); // 'camera' 或 'file'
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const fileInputRef = useRef(null);

  // 获取汇率（数据库中已经是加成后的汇率）
  const getExchangeRate = (coinType) => {
    if (!settings) return coinType === 'USDT' ? 7.35 : 1.08;
    
    // 直接使用数据库中的汇率（已包含加成）
    return coinType === 'USDT' ? settings.exchangeRateUSDT : settings.exchangeRateTRX;
  };

  useEffect(() => {
    const randomId = 'ORD' + Math.random().toString(36).substring(2, 11).toUpperCase();
    setOrderId(randomId);
    fetchRecentPayments();
    fetchAds();
    fetchSettings();
    const interval = setInterval(fetchRecentPayments, 30000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  // 轮询滚动效果
  useEffect(() => {
    // 重置滚动位置
    setScrollOffset(0);
    
    if (recentPayments.length > 10) {
      const scrollInterval = setInterval(() => {
        setScrollOffset(prev => {
          const nextOffset = prev + 1;
          // 当滚动超过数据长度时重置
          if (nextOffset >= recentPayments.slice(0, 20).length) {
            return 0;
          }
          return nextOffset;
        });
      }, 3000); // 每3秒滚动一次
      
      return () => clearInterval(scrollInterval);
    }
  }, [recentPayments]);

  const fetchRecentPayments = async () => {
    try {
      const { data } = await axios.get('/api/payments/recent');
      setRecentPayments(data);
    } catch (error) {
      console.error('获取记录失败:', error);
    }
  };

  const fetchAds = async () => {
    try {
      const { data } = await axios.get('/api/ads');
      setAds(data);
    } catch (error) {
      console.error('获取广告失败:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data } = await axios.get('/api/settings/public');
      setSettings(data);
    } catch (error) {
      console.error('获取设置失败:', error);
    }
  };

  const getAdsByPosition = (position) => {
    return ads.filter(ad => ad.position === position).sort((a, b) => a.order - b.order);
  };

  const calculateServiceFee = () => {
    if (!settings) return 0;
    const amt = parseFloat(amount) || 0;
    
    // 如果启用了 USDT 阶梯费率
    if (settings.tieredFeeEnabledUSDT) {
      try {
        const rules = JSON.parse(settings.tieredFeeRulesUSDT || '[]');
        
        console.log('🔍 USDT 阶梯费率已启用');
        console.log('📊 当前金额:', amt, 'USDT');
        console.log('📋 费率规则:', rules);
        
        // 查找匹配的费率规则（修改为 <= 包含最大值）
        const matchedRule = rules.find(rule => 
          amt >= rule.minAmount && amt <= rule.maxAmount
        );
        
        if (matchedRule) {
          console.log('✅ 匹配到规则:', matchedRule);
          
          if (matchedRule.feeType === 'fixed') {
            // 固定费用
            console.log('💰 固定费用:', matchedRule.feeValue, 'CNY');
            return matchedRule.feeValue;
          } else {
            // 百分比费率 - 基于 CNY 金额计算
            const cnyAmount = amt * getExchangeRate(payType);
            const fee = (cnyAmount * (matchedRule.feeValue / 100)).toFixed(2);
            console.log('💰 百分比费率:', matchedRule.feeValue + '%', 'CNY金额:', cnyAmount, '服务费:', fee, 'CNY');
            return parseFloat(fee);
          }
        } else {
          console.log('⚠️ 未匹配到任何规则，使用默认费率');
        }
      } catch (error) {
        console.error('❌ 阶梯费率计算失败:', error);
      }
    } else {
      console.log('ℹ️ USDT 阶梯费率未启用，使用传统费率');
    }
    
    // 使用传统费率
    if (settings.feeType === 'fixed') {
      return payType === 'USDT' ? settings.feeUSDT : settings.feeTRX;
    } else {
      // 百分比费率 - 基于 CNY 金额计算
      const cnyAmount = amt * getExchangeRate(payType);
      return parseFloat((cnyAmount * (settings.feePercentage / 100)).toFixed(2));
    }
  };

  // 获取费率类型说明
  const getFeeTypeLabel = () => {
    if (!settings) return '';
    const amt = parseFloat(amount) || 0;
    
    // 如果启用了 USDT 阶梯费率
    if (settings.tieredFeeEnabledUSDT) {
      try {
        const rules = JSON.parse(settings.tieredFeeRulesUSDT || '[]');
        const matchedRule = rules.find(rule => 
          amt >= rule.minAmount && amt <= rule.maxAmount
        );
        
        if (matchedRule) {
          if (matchedRule.feeType === 'fixed') {
            return `[固定${matchedRule.feeValue}]`;
          } else {
            return `[${matchedRule.feeValue}%]`;
          }
        }
      } catch (error) {
        console.error('获取费率类型失败:', error);
      }
    }
    
    // 使用传统费率
    if (settings.feeType === 'fixed') {
      const fixedFee = payType === 'USDT' ? settings.feeUSDT : settings.feeTRX;
      return `[固定${fixedFee}]`;
    } else {
      return `[${settings.feePercentage}%]`;
    }
  };

  // 获取阶梯费率的最大限额
  const getMaxAmount = () => {
    if (!settings) return null;
    
    try {
      if (settings.tieredFeeEnabledUSDT) {
        const rules = JSON.parse(settings.tieredFeeRulesUSDT || '[]');
        if (rules.length === 0) return null;
        
        // 找到最大的 maxAmount（排除 999999 这种无限大的值）
        const maxAmounts = rules
          .map(rule => rule.maxAmount)
          .filter(max => max < 999999);
        
        if (maxAmounts.length === 0) return null; // 如果都是无限大，返回 null
        return Math.max(...maxAmounts);
      }
    } catch (error) {
      console.error('获取最大限额失败:', error);
    }
    
    return null;
  };

  // 检查金额是否超出限额
  const checkAmountLimit = () => {
    const amt = parseFloat(amount) || 0;
    const maxAmount = getMaxAmount();
    
    if (maxAmount && amt > maxAmount) {
      return `当前代付金额超出限额！最大支持 ${maxAmount} USDT`;
    }
    
    return null;
  };

  const calculateCNY = () => {
    const amt = parseFloat(amount) || 0;
    return (amt * getExchangeRate(payType)).toFixed(2);
  };

  const calculateReceiveAmount = () => {
    const amt = parseFloat(amount) || 0;
    return amt.toFixed(6);
  };

  const calculateTotal = () => {
    const amt = parseFloat(amount) || 0;
    const base = amt * getExchangeRate(payType);
    const fee = parseFloat(calculateServiceFee());
    return (base + fee).toFixed(2);
  };

  const currentRateDisplay = `1 USDT = ${getExchangeRate('USDT').toFixed(2)} CNY`;

  // 开始扫描二维码
  const startScanner = async () => {
    setShowScanner(true);
    setScanMode('camera');
    setScanning(true);
    
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;
      
      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          // 扫描成功
          setAddress(decodedText);
          stopScanner();
        },
        (errorMessage) => {
          // 扫描错误（可以忽略）
        }
      );
    } catch (err) {
      console.error('启动扫描失败:', err);
      alert('无法启动摄像头，请尝试上传二维码图片');
      setScanning(false);
      setScanMode('file');
    }
  };

  // 停止扫描
  const stopScanner = async () => {
    if (html5QrCodeRef.current && scanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error('停止扫描失败:', err);
      }
    }
    setShowScanner(false);
    setScanning(false);
    setScanMode('camera');
    html5QrCodeRef.current = null;
  };

  // 切换扫描模式
  const switchScanMode = async (mode) => {
    if (mode === scanMode) return;
    
    // 如果正在摄像头扫描，先停止
    if (scanning && html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error('停止扫描失败:', err);
      }
      setScanning(false);
      html5QrCodeRef.current = null;
    }
    
    setScanMode(mode);
    
    // 如果切换到摄像头模式，启动摄像头
    if (mode === 'camera') {
      setScanning(true);
      try {
        const html5QrCode = new Html5Qrcode("qr-reader");
        html5QrCodeRef.current = html5QrCode;
        
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            setAddress(decodedText);
            stopScanner();
          },
          (errorMessage) => {
            // 扫描错误（可以忽略）
          }
        );
      } catch (err) {
        console.error('启动扫描失败:', err);
        alert('无法启动摄像头');
        setScanning(false);
        setScanMode('file');
      }
    }
  };

  // 处理文件上传
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // 创建 canvas 来处理图片
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // 获取图片数据
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // 使用 jsQR 解析二维码
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });
        
        if (code) {
          setAddress(code.data);
          stopScanner();
          alert('扫描成功！');
        } else {
          alert('无法识别二维码。\n\n建议：\n- 确保图片清晰\n- 二维码占据图片主要区域\n- 尝试使用摄像头扫描\n- 或手动输入地址');
        }
      };
      
      img.onerror = () => {
        alert('无法加载图片，请重试');
      };
      
      img.src = e.target.result;
    };
    
    reader.onerror = () => {
      alert('无法读取文件，请重试');
    };
    
    reader.readAsDataURL(file);
    
    // 清空文件选择，允许重新选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && scanning) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
    };
  }, [scanning]);

  const handleSubmit = async () => {
    if (!address || !address.startsWith('T')) {
      alert('请输入有效的波场地址（以T开头）');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      alert('请输入有效的代付数量');
      return;
    }
    
    // 检查支付方式是否可用
    if (paymentMethod === 'alipay' && !settings.paymentAlipayEnabled) {
      alert('❌ 支付宝支付暂未开通\n\n商户未开通支付宝支付通道，请选择微信支付。');
      return;
    }
    if (paymentMethod === 'wechat' && settings.paymentWechatEnabled === false) {
      alert('❌ 微信支付暂未开通\n\n商户未开通微信支付通道，请选择其他支付方式。');
      return;
    }
    
    setPaymentLoading(true);
    try {
      const { data } = await axios.post('/api/payments', {
        payType,
        amount: parseFloat(amount),
        address: address.trim(),
        email: email.trim() || null,
        paymentMethod,
        totalCNY: parseFloat(calculateTotal()),
        userId: user?._id || null
      });
      
      console.log('订单创建成功:', data);
      
      // 检查是否有支付链接
      if (!data.paymentUrl) {
        alert('支付链接获取失败，请检查支付平台配置');
        console.error('支付响应数据:', data);
        return;
      }
      
      // 显示支付二维码
      setPaymentUrl(data.paymentUrl);
      setCurrentOrderId(data.orderId);
      setShowPayment(true);
      
      // 开始轮询订单状态
      startPollingOrderStatus(data.orderId);
    } catch (error) {
      console.error('创建订单失败:', error);
      alert('创建订单失败：' + (error.response?.data?.error || error.message));
    } finally {
      setPaymentLoading(false);
    }
  };

  const startPollingOrderStatus = (orderId) => {
    let paymentNotified = false;
    let pollCount = 0;
    
    console.log('🔄 开始轮询订单状态:', orderId);
    console.log('📍 轮询 URL:', `/api/payments/order/${orderId}`);
    
    const interval = setInterval(async () => {
      pollCount++;
      try {
        console.log(`⏰ 执行第 ${pollCount} 次轮询查询...`);
        const { data } = await axios.get(`/api/payments/order/${orderId}`);
        
        console.log('📊 订单状态:', {
          orderId: data.platformOrderId,
          paymentStatus: data.paymentStatus,
          transferStatus: data.transferStatus,
          status: data.status,
          paymentNotified: paymentNotified,
          pollCount: pollCount
        });
        
        // 支付完成（第一个通知）
        if (data.paymentStatus === 'paid' && !paymentNotified) {
          paymentNotified = true;
          console.log('✅ 支付成功，显示通知');
          console.log('📢 调用 showNotification...');
          showNotification(
            '支付成功', 
            `您的订单支付已确认！\n正在处理 ${data.payType} 代付，请稍候...`, 
            'success'
          );
          console.log('✅ 通知已触发');
        }
        
        // 代付完成（第二个通知）
        if (data.status === 'completed') {
          clearInterval(interval);
          console.log('✅ 代付完成，显示通知');
          console.log('📢 调用 showNotification...');
          showNotification(
            `${data.payType} 代付完成`, 
            `${data.amount} ${data.payType} 已成功转账到您的地址！\n\n交易哈希：${data.txHash ? data.txHash.slice(0, 10) + '...' + data.txHash.slice(-8) : '处理中'}\n\n点击历史订单可查看详情`, 
            'success'
          );
          console.log('✅ 通知已触发，关闭支付窗口');
          setShowPayment(false);
          setAmount('');
          setAddress('');
          setEmail('');
          setPaymentConfirmed(false);
          fetchRecentPayments();
        } else if (data.status === 'failed') {
          clearInterval(interval);
          console.log('❌ 代付失败，显示通知');
          console.log('📢 调用 showNotification...');
          showNotification(
            `${data.payType} 代付失败`, 
            '转账失败，请联系客服处理。\n\n可能原因：\n• 钱包余额不足\n• 网络拥堵\n\n请联系客服处理或稍后重试', 
            'error'
          );
          console.log('✅ 通知已触发，关闭支付窗口');
          setShowPayment(false);
          setPaymentConfirmed(false);
        }
      } catch (error) {
        console.error('❌ 查询订单状态失败:', error);
        console.error('错误详情:', error.response?.data || error.message);
      }
    }, 3000); // 每3秒查询一次

    // 5分钟后停止轮询
    setTimeout(() => {
      clearInterval(interval);
      console.log(`⏱️ 轮询超时（5分钟），停止查询。共查询 ${pollCount} 次`);
    }, 300000);
  };

  const showNotification = (title, message, type) => {
    console.log('📢 显示通知:', { title, message, type });
    setNotification({ title, message, type });
    console.log('✅ 通知状态已更新，notification =', { title, message, type });
  };

  const closePayment = () => {
    setShowPayment(false);
    setPaymentUrl('');
    setCurrentOrderId('');
  };

  if (!settings) {
    return <div className="pt-32 text-center">加载中...</div>;
  }

  return (
    <div className="animate-in fade-in duration-500 pt-28 pb-20 min-h-screen relative overflow-hidden">
      {/* 渐变背景 */}
      <div className="absolute top-0 left-0 w-full h-[800px] bg-gradient-to-br from-[#F0F9FF] via-[#E0F2FE] to-[#F8FAFC] -z-10"></div>
      
      {/* 通知组件 - 居中显示，优雅设计，最高层级 */}
      {notification && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center animate-in fade-in duration-300 px-4">
          {/* 背景模糊层 - 使用渐变蓝色 */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#E0F2FE]/80 via-[#F0F9FF]/80 to-white/80 backdrop-blur-md"></div>
          
          {/* 通知卡片 */}
          <div className={`relative max-w-md w-full ${
            notification.type === 'success' 
              ? 'bg-white' 
              : 'bg-white'
          } rounded-2xl shadow-2xl border-2 ${
            notification.type === 'success' 
              ? 'border-[#00A3FF]/20' 
              : 'border-red-200'
          } overflow-hidden animate-in zoom-in duration-300`}>
            {/* 顶部装饰条 */}
            <div className={`h-2 ${
              notification.type === 'success' 
                ? 'bg-gradient-to-r from-[#00A3FF] to-[#0086D1]' 
                : 'bg-gradient-to-r from-red-500 to-red-600'
            }`}></div>
            
            <div className="p-6">
              <div className="flex items-start gap-4">
                {notification.type === 'success' ? (
                  <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-[#E0F2FE] to-[#BAE6FD] rounded-2xl flex items-center justify-center shadow-lg">
                    <CheckCircle className="text-[#00A3FF]" size={32} strokeWidth={2.5} />
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl flex items-center justify-center shadow-lg">
                    <AlertTriangle className="text-red-600" size={32} strokeWidth={2.5} />
                  </div>
                )}
                <div className="flex-1 pt-1">
                  <h4 className={`font-black mb-2 text-xl ${
                    notification.type === 'success' ? 'text-slate-900' : 'text-red-900'
                  }`}>
                    {notification.title}
                  </h4>
                  <p className="text-base text-slate-700 whitespace-pre-line leading-relaxed">
                    {notification.message}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setNotification(null)}
                  className={`px-8 py-3 rounded-xl font-bold transition-all shadow-lg ${
                    notification.type === 'success'
                      ? 'bg-gradient-to-r from-[#00A3FF] to-[#0086D1] hover:from-[#0086D1] hover:to-[#006BA8] text-white'
                      : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                  }`}
                >
                  知道了
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>

      <div className="max-w-5xl mx-auto px-6 space-y-6">
        {/* 工作台顶部 - 一句话广告 */}
        {getAdsByPosition('workspace-top').length > 0 && (
          <div className="bg-gradient-to-r from-[#E0F2FE] to-[#F0F9FF] rounded-xl border border-[#00A3FF]/20 px-6 py-3">
            <div className="flex items-center justify-center gap-3 text-center">
              {getAdsByPosition('workspace-top').slice(0, 1).map((ad) => (
                ad.link ? (
                  <a 
                    key={ad._id}
                    href={ad.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-[#00A3FF] hover:text-[#0086D1] transition-colors"
                  >
                    {ad.content}
                  </a>
                ) : (
                  <p key={ad._id} className="text-sm font-bold text-[#00A3FF]">
                    {ad.content}
                  </p>
                )
              ))}
            </div>
          </div>
        )}

        {/* 核心操作卡片 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <div className="w-1 h-5 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full"></div>
              <USDTIcon className="w-5 h-5" />
              <span className="tracking-tight">USDT 代付工作台</span>
            </h3>
          </div>

          <div className="p-6">
            {/* 主要内容区 */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
              {/* 左侧：输入表单 + 使用说明 */}
              <div className="lg:col-span-5 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  {/* 表单区域 */}
                  <div className="lg:col-span-3 space-y-5">
                    {/* 收款地址 */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                        <Wallet size={16} className="text-cyan-600" />
                        代付目标收款地址
                      </label>
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="请输入 T 开头的波场地址"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 focus:bg-white rounded-lg px-4 py-3 pr-12 text-sm outline-none transition-all font-mono placeholder:text-slate-400"
                        />
                        <button
                          type="button"
                          onClick={startScanner}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-all"
                          title="扫描二维码"
                        >
                          <QrCode size={18} />
                        </button>
                      </div>
                    </div>

                    {/* 支付数量 */}
                    <div>
                      <label className="text-sm font-bold text-slate-700 mb-2 block">
                        支付数量
                      </label>
                      <div className="relative">
                        <input 
                          type="number" 
                          placeholder="请输入数量"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 focus:bg-white rounded-lg px-4 py-3 pr-24 text-base font-bold outline-none transition-all tabular-nums placeholder:text-slate-400 placeholder:text-sm placeholder:font-normal"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <span className="text-sm font-black uppercase px-3 py-1.5 rounded-lg text-[#26A17B] bg-[#E6F4EF]">
                            USDT
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-cyan-600 font-bold bg-cyan-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider">实时汇率</span>
                          <span className="text-slate-400">|</span>
                          {currentRateDisplay}
                        </span>
                        {amount && (
                          <span className="text-sm font-bold text-slate-500">
                            约合 <span className="text-slate-900 font-black">¥ {calculateCNY()}</span>
                          </span>
                        )}
                      </div>
                      {/* 限额提示 */}
                      {amount && checkAmountLimit() && (
                        <div className="mt-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                          <p className="text-xs text-red-600 font-bold">
                            ⚠️ {checkAmountLimit()}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* 通知邮箱 */}
                    <div>
                      <label className="text-sm font-bold text-slate-700 mb-2 block">
                        通知邮箱 <span className="text-slate-400 font-normal">(可选)</span>
                      </label>
                      <input 
                        type="email" 
                        placeholder="订单完成后将发送通知邮件"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>

                    {/* 支付方式选择 */}
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 mb-2">支付方式</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('alipay')}
                          className={`relative flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold transition-all ${
                            paymentMethod === 'alipay'
                              ? 'bg-cyan-50 text-cyan-600 border-2 border-cyan-500 shadow-sm'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                          } ${!settings.paymentAlipayEnabled ? 'opacity-60' : ''}`}
                        >
                          <AlipayIcon />
                          支付宝
                          {!settings.paymentAlipayEnabled && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">
                              未开通
                            </span>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('wechat')}
                          className={`relative flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold transition-all ${
                            paymentMethod === 'wechat'
                              ? 'bg-cyan-50 text-cyan-600 border-2 border-cyan-500 shadow-sm'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                          } ${settings.paymentWechatEnabled === false ? 'opacity-60' : ''}`}
                        >
                          <WechatIcon />
                          微信
                          {settings.paymentWechatEnabled === false && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">
                              未开通
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 订单详情 */}
                  <div className="lg:col-span-2">
                    <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-6 border border-slate-200 shadow-sm sticky top-24">
                      <h4 className="text-lg font-black text-slate-900 mb-5">订单详情</h4>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                          <span className="text-sm text-slate-600 font-medium">预计代支付</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-cyan-600 tabular-nums">
                              {amount ? calculateReceiveAmount() : '--'}
                            </span>
                            <span className="text-sm font-bold text-slate-500">USDT</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                          <span className="text-sm text-slate-600 font-medium">汇率结算</span>
                          <span className="text-sm font-bold text-slate-700 tabular-nums">
                            ¥ {amount ? calculateCNY() : '--'}
                          </span>
                        </div>

                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                          <span className="text-sm text-slate-600 font-medium">
                            服务费
                            {amount && getFeeTypeLabel() && (
                              <span className="text-[#00A3FF] ml-1">{getFeeTypeLabel()}</span>
                            )}
                          </span>
                          <span className="text-sm font-bold text-orange-500 tabular-nums">
                            {amount ? `¥ ${calculateServiceFee()}` : '--'}
                          </span>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <span className="text-base font-bold text-slate-700">订单总额</span>
                          <p className="text-3xl font-black text-slate-900 tabular-nums">
                            {amount ? `¥ ${calculateTotal()}` : '¥ --'}
                          </p>
                        </div>
                      </div>

                      <button 
                        onClick={handleSubmit}
                        disabled={!amount || !address || paymentLoading || checkAmountLimit()}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-4 rounded-xl font-black text-base hover:shadow-xl hover:shadow-cyan-200 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed transition-all uppercase tracking-wider flex items-center justify-center gap-2 group"
                      >
                        {paymentLoading ? '创建订单中...' : '立即支付'}
                        {!paymentLoading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                      </button>

                      <p className="text-xs text-center font-bold text-slate-400 flex items-center justify-center gap-2 mt-4">
                        <ShieldCheck size={14} className="text-green-500" />
                        On-chain verified & Secure 7x24
                      </p>
                    </div>
                  </div>
                </div>

                {/* 使用说明 - 横跨整行 */}
                <div className="pt-6 border-t border-slate-200">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 左侧：使用方法 */}
                    <div className="bg-blue-50/50 rounded-xl p-5">
                      <h4 className="text-sm font-black text-slate-900 mb-3">使用方法</h4>
                      <div className="space-y-2 text-sm text-slate-600">
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-5 h-5 bg-[#00A3FF] text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                          <span className="pt-0.5">输入收款地址和代付数量</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-5 h-5 bg-[#00A3FF] text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                          <span className="pt-0.5">点击"立即支付"按钮提交订单</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-5 h-5 bg-[#00A3FF] text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                          <span className="pt-0.5">完成支付后，USDT 将在 2-10 分钟内自动转账到指定地址</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-5 h-5 bg-[#00A3FF] text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                          <span className="pt-0.5">可在下方"历史订单"中查看交易状态和哈希值</span>
                        </div>
                      </div>
                    </div>

                    {/* 右侧：安全提示 */}
                    <div className="bg-green-50/50 rounded-xl p-5">
                      <h4 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
                        <ShieldCheck size={16} className="text-green-600" />
                        安全提示
                      </h4>
                      <div className="space-y-2 text-sm text-slate-600">
                        <p className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">•</span>
                          <span>请仔细核对收款地址，转账后无法撤销</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">•</span>
                          <span>建议先小额测试，确认无误后再大额转账</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">•</span>
                          <span>所有交易均在链上可查，保障资金安全</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">•</span>
                          <span>如遇问题请联系客服：support@fastpay.com</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 工作台中部 - 3x3 广告位 */}
        {getAdsByPosition('workspace-middle').length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {getAdsByPosition('workspace-middle').slice(0, 9).map((ad) => (
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
        )}

        {/* 历史订单列表 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2.5">
              <History size={18} className="text-[#00A3FF]" />
              历史订单
            </h4>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <colgroup>
                <col style={{ width: '140px' }} />
                <col style={{ width: '80px' }} />
                <col style={{ width: '80px' }} />
                <col style={{ width: '100px' }} />
                <col style={{ width: '160px' }} />
                <col style={{ width: '180px' }} />
                <col style={{ width: '200px' }} />
              </colgroup>
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-xs font-bold text-slate-600">
                  <th className="px-4 py-3 text-left">订单号</th>
                  <th className="px-4 py-3 text-left">代付类型</th>
                  <th className="px-4 py-3 text-right">数量</th>
                  <th className="px-4 py-3 text-left">支付方式</th>
                  <th className="px-4 py-3 text-left">地址</th>
                  <th className="px-4 py-3 text-left">交易哈希</th>
                  <th className="px-4 py-3 text-left">创建时间</th>
                </tr>
              </thead>
            </table>
            
            <div className="relative" style={{ height: '552px', overflow: 'hidden' }}>
              <div 
                className="transition-transform duration-1000 ease-in-out"
                style={{ 
                  transform: `translateY(-${scrollOffset * 48}px)` 
                }}
              >
                <table className="w-full table-fixed">
                  <colgroup>
                    <col style={{ width: '140px' }} />
                    <col style={{ width: '80px' }} />
                    <col style={{ width: '80px' }} />
                    <col style={{ width: '100px' }} />
                    <col style={{ width: '160px' }} />
                    <col style={{ width: '180px' }} />
                    <col style={{ width: '200px' }} />
                  </colgroup>
                  <tbody>
                    {(() => {
                      const displayData = recentPayments.slice(0, 20);
                      // 复制数据用于无缝循环
                      const loopData = displayData.length > 10 
                        ? [...displayData, ...displayData.slice(0, 10)]
                        : displayData;
                      
                      return loopData.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                            暂无订单记录
                          </td>
                        </tr>
                      ) : (
                        loopData.map((payment, index) => (
                          <tr key={`${payment._id}-${index}`} className="hover:bg-slate-50 transition-colors border-b border-slate-100" style={{ height: '48px' }}>
                            <td className="px-4 py-3 text-sm font-mono text-slate-900 truncate">
                              {payment.platformOrderId 
                                ? `${payment.platformOrderId.slice(0, 6)}****${payment.platformOrderId.slice(-4)}`
                                : payment._id 
                                  ? `${payment._id.toString().slice(0, 6)}****${payment._id.toString().slice(-4)}`
                                  : '-'
                              }
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-900">
                              {payment.payType}
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-right text-[#00A3FF]">
                              {payment.amount}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-900">
                              {payment.paymentMethod === 'alipay' ? '支付宝' : '微信'}
                            </td>
                            <td className="px-4 py-3 text-sm font-mono text-slate-900 truncate">
                              {payment.address.slice(0, 6)}****{payment.address.slice(-4)}
                            </td>
                            <td className="px-4 py-3 truncate">
                              {payment.txHash ? (
                                <a 
                                  href={`https://tronscan.org/#/transaction/${payment.txHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm font-mono text-[#00A3FF] hover:text-[#0086D1] transition-colors inline-flex items-center gap-1"
                                >
                                  {payment.txHash.slice(0, 6)}****{payment.txHash.slice(-4)}
                                  <ExternalLink size={12} />
                                </a>
                              ) : (
                                <span className="text-sm text-slate-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-900">
                              {new Date(payment.createdAt).toLocaleString('zh-CN', { 
                                year: 'numeric',
                                month: '2-digit', 
                                day: '2-digit', 
                                hour: '2-digit', 
                                minute: '2-digit',
                                second: '2-digit'
                              })}
                            </td>
                          </tr>
                        ))
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* 工作台底部 - 3x3 广告位 */}
        {getAdsByPosition('workspace-bottom').length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {getAdsByPosition('workspace-bottom').slice(0, 9).map((ad) => (
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
        )}
      </div>

      {/* 支付二维码弹窗 */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-300">
            <div className="bg-gradient-to-r from-[#00A3FF] to-[#0086D1] px-6 py-4 rounded-t-2xl">
              <h3 className="text-xl font-black text-white text-center">扫码支付</h3>
            </div>
            
            <div className="p-8">
              <div className="bg-slate-50 rounded-xl p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold text-slate-600">订单号</span>
                  <span className="text-sm font-mono font-bold text-slate-900">{currentOrderId}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold text-slate-600">支付方式</span>
                  <span className="text-sm font-bold text-[#00A3FF]">
                    {paymentMethod === 'alipay' ? '支付宝' : '微信支付'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-600">支付金额</span>
                  <span className="text-2xl font-black text-slate-900">¥ {calculateTotal()}</span>
                </div>
              </div>

              <div className="flex items-center justify-center mb-6">
                {paymentUrl ? (
                  <div className="bg-white border-4 border-slate-100 rounded-xl overflow-hidden inline-block">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentUrl)}`}
                      alt="支付二维码"
                      className="w-48 h-48 block"
                      onError={(e) => {
                        console.error('二维码加载失败');
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="text-red-500 text-sm p-4">二维码加载失败</div>';
                      }}
                    />
                  </div>
                ) : (
                  <div className="bg-white border-4 border-slate-100 rounded-xl p-4">
                    <div className="w-48 h-48 flex flex-col items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#00A3FF] border-t-transparent"></div>
                      <p className="text-sm text-slate-500">正在生成支付链接...</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-800 text-center">
                  请使用{paymentMethod === 'alipay' ? '支付宝' : '微信'}扫描二维码完成支付
                </p>
                <p className="text-xs text-blue-600 text-center mt-2">
                  支付完成后，系统将自动处理代付订单
                </p>
                {/* 轮询状态指示器 */}
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-blue-600">正在监听支付状态...</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={closePayment}
                  className="px-8 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 二维码扫描器模态框 */}
      {showScanner && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-800">扫描二维码</h3>
              <button
                onClick={stopScanner}
                className="p-2 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* 扫描模式选项卡 */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => switchScanMode('camera')}
                className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all ${
                  scanMode === 'camera'
                    ? 'bg-[#00A3FF] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                摄像头扫描
              </button>
              <button
                onClick={() => switchScanMode('file')}
                className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all ${
                  scanMode === 'file'
                    ? 'bg-[#00A3FF] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                读取图片
              </button>
            </div>
            
            {scanMode === 'camera' ? (
              <>
                <div className="bg-slate-100 rounded-xl overflow-hidden mb-4">
                  <div id="qr-reader" className="w-full"></div>
                </div>
                <p className="text-sm text-slate-500 text-center">
                  请将二维码对准摄像头进行扫描
                </p>
              </>
            ) : (
              <>
                <div className="bg-slate-100 rounded-xl p-8 mb-4 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#00A3FF] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#0086D1] transition-all"
                  >
                    选择二维码图片
                  </button>
                  <p className="text-xs text-slate-500 mt-4">
                    支持 JPG、PNG 等图片格式<br/>
                    <span className="text-green-600">仅本地读取，不会上传</span>
                  </p>
                </div>
                <p className="text-sm text-slate-500 text-center">
                  选择图片后将在浏览器本地识别二维码
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PayPage;
