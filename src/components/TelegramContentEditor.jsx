import { useState, useEffect } from 'react';

// 系统默认模板
const DEFAULT_TEMPLATES = {
  welcome_new_user: {
    name: '新用户欢迎消息',
    category: 'welcome',
    content: {
      type: 'text',
      text: `🎊 <b>欢迎使用 {{siteName}}！</b>\n\n` +
        `✅ <b>账户已自动创建</b>\n` +
        `━━━━━━━━━━━━━━━\n` +
        `<code>用户名：</code>{{username}}\n` +
        `<code>TG ID：</code>{{telegramId}}\n` +
        `━━━━━━━━━━━━━━━\n\n` +
        `💡 <b>您可以直接开始使用所有功能！</b>\n\n` +
        `🌐 <b>网站同步使用</b>\n` +
        `<code>1️⃣</code> 访问 {{websiteUrl}}\n` +
        `<code>2️⃣</code> 点击 "使用 Telegram 登录"\n` +
        `<code>3️⃣</code> 授权后即可同步使用\n\n` +
        `👇 请选择您需要的服务`,
      parseMode: 'HTML'
    },
    variables: [
      { key: 'siteName', description: '网站名称', example: 'FastPay' },
      { key: 'username', description: '用户名', example: 'user123' },
      { key: 'telegramId', description: 'Telegram ID', example: '123456789' },
      { key: 'websiteUrl', description: '网站地址', example: 'https://example.com' }
    ]
  },
  welcome_returning_user: {
    name: '老用户欢迎消息',
    category: 'welcome',
    content: {
      type: 'text',
      text: `🎉 <b>欢迎回来！</b>\n\n` +
        `👤 <b>账户信息</b>\n` +
        `━━━━━━━━━━━━━━━\n` +
        `<code>用户名：</code>{{firstName}}\n` +
        `<code>邮  箱：</code>{{email}}\n` +
        `<code>TG ID：</code>{{telegramId}}\n` +
        `━━━━━━━━━━━━━━━\n\n` +
        `💡 请选择您需要的服务 👇`,
      parseMode: 'HTML'
    },
    variables: [
      { key: 'firstName', description: '用户名', example: 'John' },
      { key: 'email', description: '邮箱', example: 'user@example.com' },
      { key: 'telegramId', description: 'Telegram ID', example: '123456789' }
    ]
  },
  payment_success: {
    name: '支付成功通知',
    category: 'payment',
    content: {
      type: 'text',
      text: `🎉 <b>支付成功！</b>\n\n` +
        `━━━━━━━━━━━━━━━\n` +
        `<code>订单号：</code><code>{{orderId}}</code>\n` +
        `<code>金  额：</code><b>{{totalCNY}} CNY</b>\n` +
        `━━━━━━━━━━━━━━━\n\n` +
        `⏳ 正在处理 <b>{{payType}} 代付</b>...\n` +
        `⏱️ 预计 <b>2-10 分钟</b>完成\n\n` +
        `💬 完成后会自动通知您\n` +
        `⚠️ 请勿关闭此页面`,
      parseMode: 'HTML'
    },
    variables: [
      { key: 'orderId', description: '订单号', example: 'ORD177053402578855GZ9G5' },
      { key: 'totalCNY', description: '支付金额', example: '75.60' },
      { key: 'payType', description: '支付类型', example: 'USDT' }
    ]
  },
  transfer_complete: {
    name: '代付完成通知',
    category: 'payment',
    content: {
      type: 'text',
      text: `✅ <b>代付完成！</b>\n\n` +
        `━━━━━━━━━━━━━━━\n` +
        `<code>订单号：</code><code>{{orderId}}</code>\n` +
        `<code>数  量：</code><b>{{amount}} {{payType}}</b>\n` +
        `<code>地  址：</code><code>{{address}}</code>\n` +
        `━━━━━━━━━━━━━━━\n\n` +
        `🔗 <b>交易哈希</b>\n` +
        `<code>{{txHash}}</code>\n\n` +
        `🔍 点击下方按钮查看交易详情`,
      parseMode: 'HTML'
    },
    variables: [
      { key: 'orderId', description: '订单号', example: 'ORD177053402578855GZ9G5' },
      { key: 'amount', description: '数量', example: '10' },
      { key: 'payType', description: '类型', example: 'USDT' },
      { key: 'address', description: '收款地址（缩写）', example: 'TXXXxx...xxXXXx' },
      { key: 'txHash', description: '交易哈希', example: 'abc123def456...' }
    ],
    buttons: [
      { text: '🔍 查看交易', type: 'url', data: 'https://tronscan.org/#/transaction/{{txHash}}', row: 0, col: 0 },
      { text: '📋 查看订单详情', type: 'callback', data: 'order_detail_{{orderId}}', row: 1, col: 0 }
    ]
  },
  transfer_failed: {
    name: '代付失败通知',
    category: 'payment',
    content: {
      type: 'text',
      text: `❌ <b>代付失败</b>\n\n` +
        `━━━━━━━━━━━━━━━\n` +
        `<code>订单号：</code><code>{{orderId}}</code>\n` +
        `<code>数  量：</code>{{amount}} {{payType}}\n` +
        `━━━━━━━━━━━━━━━\n\n` +
        `<b>失败原因：</b>\n<i>{{reason}}</i>\n\n` +
        `💬 请联系客服处理`,
      parseMode: 'HTML'
    },
    variables: [
      { key: 'orderId', description: '订单号', example: 'ORD177053402578855GZ9G5' },
      { key: 'amount', description: '数量', example: '10' },
      { key: 'payType', description: '类型', example: 'USDT' },
      { key: 'reason', description: '失败原因', example: '余额不足' }
    ],
    buttons: [
      { text: '📋 查看订单', type: 'callback', data: 'order_detail_{{orderId}}', row: 0, col: 0 }
    ]
  },
  order_completed: {
    name: '订单完成通知',
    category: 'order',
    content: {
      type: 'text',
      text: `🎉 <b>订单已完成！</b>\n\n` +
        `━━━━━━━━━━━━━━━\n` +
        `<code>订单号：</code>{{orderId}}\n` +
        `<code>类  型：</code>{{type}}\n` +
        `<code>数  量：</code>{{amount}} {{currency}}\n` +
        `<code>地  址：</code><code>{{address}}</code>\n` +
        `━━━━━━━━━━━━━━━\n\n` +
        `✅ <b>交易哈希：</b>\n<code>{{txHash}}</code>\n\n` +
        `🔍 <b>查看交易</b>\n{{explorerUrl}}`,
      parseMode: 'HTML'
    },
    variables: [
      { key: 'orderId', description: '订单号', example: 'ORD123456' },
      { key: 'type', description: '类型', example: 'USDT' },
      { key: 'amount', description: '数量', example: '100' },
      { key: 'currency', description: '币种', example: 'USDT' },
      { key: 'address', description: '地址', example: 'TXxx...xxxx' },
      { key: 'txHash', description: '交易哈希', example: 'abc123...' },
      { key: 'explorerUrl', description: '浏览器链接', example: 'https://tronscan.org/#/transaction/...' }
    ]
  },
  order_failed: {
    name: '订单失败通知',
    category: 'order',
    content: {
      type: 'text',
      text: `❌ <b>订单处理失败</b>\n\n` +
        `━━━━━━━━━━━━━━━\n` +
        `<code>订单号：</code>{{orderId}}\n` +
        `<code>原  因：</code>{{reason}}\n` +
        `━━━━━━━━━━━━━━━\n\n` +
        `💬 如有疑问，请联系客服`,
      parseMode: 'HTML'
    },
    variables: [
      { key: 'orderId', description: '订单号', example: 'ORD123456' },
      { key: 'reason', description: '失败原因', example: '余额不足' }
    ]
  },
  // 支付流程模板
  payment_usdt_input: {
    name: 'USDT 代付 - 输入数量',
    category: 'payment',
    content: {
      type: 'text',
      text: `💰 <b>USDT 代付</b>\n\n` +
        `📝 <b>请输入 USDT 数量</b>\n` +
        `━━━━━━━━━━━━━━━\n` +
        `<code>最小：</code>{{minAmount}} USDT\n` +
        `<code>最大：</code>{{maxAmount}} USDT\n` +
        `━━━━━━━━━━━━━━━\n\n` +
        `💡 直接输入数字即可\n` +
        `例如：<code>100</code>`,
      parseMode: 'HTML'
    },
    variables: [
      { key: 'minAmount', description: '最小金额', example: '1' },
      { key: 'maxAmount', description: '最大金额', example: '999' }
    ]
  },
  payment_trx_input: {
    name: 'TRX 代付 - 输入数量',
    category: 'payment',
    content: {
      type: 'text',
      text: `💎 <b>TRX 代付</b>\n\n` +
        `📝 <b>请输入 TRX 数量</b>\n` +
        `━━━━━━━━━━━━━━━\n` +
        `<code>最小：</code>{{minAmount}} TRX\n` +
        `<code>最大：</code>{{maxAmount}} TRX\n` +
        `━━━━━━━━━━━━━━━\n\n` +
        `💡 直接输入数字即可\n` +
        `例如：<code>100</code>`,
      parseMode: 'HTML'
    },
    variables: [
      { key: 'minAmount', description: '最小金额', example: '1' },
      { key: 'maxAmount', description: '最大金额', example: '999' }
    ]
  },
  payment_usdt_order_detail: {
    name: 'USDT 代付 - 订单详情',
    category: 'payment',
    content: {
      type: 'text',
      text: `📊 <b>订单详情</b>\n` +
        `━━━━━━━━━━━━━━━\n` +
        `<code>💵 数量：</code>{{amount}} USDT\n` +
        `<code>💱 汇率：</code>{{rate}} CNY/USDT\n` +
        `<code>💰 金额：</code>{{cnyAmount}} CNY\n` +
        `<code>🔧 服务费：</code>{{serviceFee}} CNY {{feeLabel}}\n` +
        `━━━━━━━━━━━━━━━\n` +
        `<code>💳 总计：</code><b>{{totalCNY}} CNY</b>\n\n` +
        `📍 <b>请输入收款地址</b>\n` +
        `<i>(TRON 地址，以 T 开头)</i>`,
      parseMode: 'HTML'
    },
    variables: [
      { key: 'amount', description: 'USDT 数量', example: '10' },
      { key: 'rate', description: '汇率', example: '7.20' },
      { key: 'cnyAmount', description: '人民币金额', example: '72.00' },
      { key: 'serviceFee', description: '服务费', example: '3.60' },
      { key: 'feeLabel', description: '费率标签', example: '[5%]' },
      { key: 'totalCNY', description: '总计', example: '75.60' }
    ]
  },
  payment_trx_order_detail: {
    name: 'TRX 代付 - 订单详情',
    category: 'payment',
    content: {
      type: 'text',
      text: `📊 <b>订单详情</b>\n` +
        `━━━━━━━━━━━━━━━\n` +
        `<code>💵 数量：</code>{{amount}} TRX\n` +
        `<code>💱 汇率：</code>{{rate}} CNY/TRX\n` +
        `<code>💰 金额：</code>{{cnyAmount}} CNY\n` +
        `<code>🔧 服务费：</code>{{serviceFee}} CNY {{feeLabel}}\n` +
        `━━━━━━━━━━━━━━━\n` +
        `<code>💳 总计：</code><b>{{totalCNY}} CNY</b>\n\n` +
        `📍 <b>请输入收款地址</b>\n` +
        `<i>(TRON 地址，以 T 开头)</i>`,
      parseMode: 'HTML'
    },
    variables: [
      { key: 'amount', description: 'TRX 数量', example: '100' },
      { key: 'rate', description: '汇率', example: '0.95' },
      { key: 'cnyAmount', description: '人民币金额', example: '95.00' },
      { key: 'serviceFee', description: '服务费', example: '4.75' },
      { key: 'feeLabel', description: '费率标签', example: '[5%]' },
      { key: 'totalCNY', description: '总计', example: '99.75' }
    ]
  },
  payment_order_confirm: {
    name: '订单确认 - 输入地址后',
    category: 'payment',
    content: {
      type: 'text',
      text: `✅ <b>订单确认</b>\n` +
        `━━━━━━━━━━━━━━━\n` +
        `<code>💵 数量：</code>{{amount}} {{type}}\n` +
        `<code>📍 地址：</code>\n<code>{{address}}</code>\n` +
        `<code>💳 总计：</code><b>{{totalCNY}} CNY</b>\n` +
        `━━━━━━━━━━━━━━━\n\n` +
        `👇 请确认订单信息`,
      parseMode: 'HTML'
    },
    variables: [
      { key: 'amount', description: '数量', example: '10' },
      { key: 'type', description: '类型', example: 'USDT' },
      { key: 'address', description: '收款地址', example: 'TXXXxxxxxxxxxxxxxxxxxxxxxxxxxxXXXxxx' },
      { key: 'totalCNY', description: '总计', example: '75.60' }
    ]
  },
  payment_select_method: {
    name: '选择支付方式',
    category: 'payment',
    content: {
      type: 'text',
      text: `✅ <b>订单确认</b>\n\n` +
        `━━━━━━━━━━━━━━━\n` +
        `<code>💵 数量：</code>{{amount}} {{type}}\n` +
        `<code>📍 地址：</code>\n<code>{{address}}</code>\n` +
        `<code>💰 金额：</code>{{cnyAmount}} CNY\n` +
        `<code>🔧 服务费：</code>{{serviceFee}} CNY\n` +
        `━━━━━━━━━━━━━━━\n` +
        `<code>💳 总计：</code><b>{{totalCNY}} CNY</b>\n\n` +
        `💳 <b>请选择支付方式</b> 👇`,
      parseMode: 'HTML'
    },
    variables: [
      { key: 'amount', description: '数量', example: '10' },
      { key: 'type', description: '类型', example: 'USDT' },
      { key: 'address', description: '收款地址', example: 'TXXXxxxxxxxxxxxxxxxxxxxxxxxxxxXXXxxx' },
      { key: 'cnyAmount', description: '人民币金额', example: '72.00' },
      { key: 'serviceFee', description: '服务费', example: '3.60' },
      { key: 'totalCNY', description: '总计', example: '75.60' }
    ]
  },
  payment_qrcode: {
    name: '支付二维码',
    category: 'payment',
    content: {
      type: 'text',
      text: `📱 <b>请使用{{paymentName}}扫码支付</b>\n\n` +
        `━━━━━━━━━━━━━━━\n` +
        `<code>订单号：</code><code>{{orderId}}</code>\n` +
        `<code>数  量：</code>{{amount}} {{type}}\n` +
        `<code>地  址：</code>\n<code>{{address}}</code>\n` +
        `<code>金  额：</code><b>{{totalCNY}} CNY</b>\n` +
        `━━━━━━━━━━━━━━━\n\n` +
        `⏰ 支付后请等待 <b>2-10 分钟</b>\n` +
        `💬 完成后会自动通知您`,
      parseMode: 'HTML'
    },
    variables: [
      { key: 'paymentName', description: '支付方式名称', example: '微信' },
      { key: 'orderId', description: '订单号', example: '20240207123456' },
      { key: 'amount', description: '数量', example: '10' },
      { key: 'type', description: '类型', example: 'USDT' },
      { key: 'address', description: '收款地址', example: 'TXXXxxxxxxxxxxxxxxxxxxxxxxxxxxXXXxxx' },
      { key: 'totalCNY', description: '总金额', example: '75.60' }
    ]
  },
  // 订单相关模板
  orders_empty: {
    name: '我的订单 - 空列表',
    category: 'order',
    content: {
      type: 'text',
      text: `📋 <b>我的订单</b>\n\n` +
        `暂无订单记录\n\n` +
        `💡 您可以开始创建第一个订单`,
      parseMode: 'HTML'
    },
    variables: []
  },
  orders_list: {
    name: '我的订单 - 列表',
    category: 'order',
    content: {
      type: 'text',
      text: `📋 <b>我的订单</b>\n\n` +
        `最近 <b>{{orderCount}}</b> 条订单\n` +
        `━━━━━━━━━━━━━━━\n\n` +
        `{{orderList}}\n` +
        `👇 点击订单查看详情`,
      parseMode: 'HTML'
    },
    variables: [
      { key: 'orderCount', description: '订单数量', example: '5' },
      { key: 'orderList', description: '订单列表（自动生成）', example: '1. USDT 代付订单 | 02-07 12:00 ✅ 已完成\n2. TRX 代付订单 | 02-07 11:30 ⏳ 待支付' }
    ]
  },
  order_detail: {
    name: '订单详情',
    category: 'order',
    content: {
      type: 'text',
      text: `📋 <b>订单详情</b>\n\n` +
        `━━━━━━━━━━━━━━━\n` +
        `<code>订单号：</code><code>{{orderId}}</code>\n` +
        `<code>类  型：</code>{{payType}} 代付\n` +
        `<code>数  量：</code><b>{{amount}} {{payType}}</b>\n` +
        `<code>地  址：</code>\n<code>{{address}}</code>\n` +  // ✅ 换行显示完整地址
        `━━━━━━━━━━━━━━━\n` +
        `<code>支付金额：</code>{{totalCNY}} CNY\n` +
        `<code>服务费：</code>{{serviceFee}} CNY\n` +
        `━━━━━━━━━━━━━━━\n` +
        `<code>状  态：</code>{{status}}\n` +
        `<code>创建时间：</code>{{createdAt}}\n` +
        `{{paymentTime}}` +
        `{{transferTime}}` +
        `{{txHash}}`,
      parseMode: 'HTML'
    },
    variables: [
      { key: 'orderId', description: '订单号', example: '20240207123456' },
      { key: 'payType', description: '类型', example: 'USDT' },
      { key: 'amount', description: '数量', example: '10' },
      { key: 'address', description: '收款地址（完整）', example: 'TXXXxxxxxxxxxxxxxxxxxxxxxxxxxxXXXxxx' },
      { key: 'totalCNY', description: '支付金额', example: '75.60' },
      { key: 'serviceFee', description: '服务费', example: '3.60' },
      { key: 'status', description: '状态', example: '✅ 已完成' },
      { key: 'createdAt', description: '创建时间', example: '2024-02-07 12:00:00' },
      { key: 'paymentTime', description: '支付时间（可选）', example: '<code>支付时间：</code>2024-02-07 12:05:00\n' },
      { key: 'transferTime', description: '完成时间（可选）', example: '<code>完成时间：</code>2024-02-07 12:10:00\n' },
      { key: 'txHash', description: '交易哈希（可选）', example: '\n🔗 <b>交易哈希</b>\n<code>abc123...</code>\n' }
    ]
  },
  // 主菜单模板
  main_menu: {
    name: '主菜单',
    category: 'welcome',
    content: {
      type: 'text',
      text: `📋 <b>主菜单</b>\n\n` +
        `👇 请选择您需要的服务`,
      parseMode: 'HTML'
    },
    variables: []
  }
};

const TelegramContentEditor = ({ content, onSave, onCancel }) => {
  const [formData, setFormData] = useState(content || {
    key: '',
    name: '',
    category: 'custom',
    content: {
      type: 'text',
      text: '',
      mediaUrl: '',
      caption: '',
      parseMode: 'HTML'
    },
    features: {
      copyable: false,
      copyText: '',
      highlight: [],
      links: [],
      emojis: []
    },
    buttons: [],
    variables: [],
    triggers: [],
    enabled: true
  });

  const [loading, setLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // 当选择 key 时，如果有对应的默认模板，自动填充
  useEffect(() => {
    if (formData.key && DEFAULT_TEMPLATES[formData.key] && !content) {
      const template = DEFAULT_TEMPLATES[formData.key];
      setFormData({
        ...formData,
        name: template.name,
        category: template.category,
        content: template.content,
        variables: template.variables || [],
        buttons: template.buttons || []
      });
    }
  }, [formData.key]);

  const loadTemplate = (templateKey) => {
    const template = DEFAULT_TEMPLATES[templateKey];
    if (template) {
      setFormData({
        ...formData,
        key: templateKey,
        name: template.name,
        category: template.category,
        content: template.content,
        variables: template.variables || [],
        buttons: template.buttons || []
      });
      setShowTemplates(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  const addButton = () => {
    setFormData({
      ...formData,
      buttons: [...formData.buttons, { text: '', type: 'callback', data: '', row: 0, col: 0 }]
    });
  };

  const updateButton = (index, field, value) => {
    const newButtons = [...formData.buttons];
    newButtons[index][field] = value;
    setFormData({ ...formData, buttons: newButtons });
  };

  const removeButton = (index) => {
    setFormData({
      ...formData,
      buttons: formData.buttons.filter((_, i) => i !== index)
    });
  };

  const addVariable = () => {
    setFormData({
      ...formData,
      variables: [...formData.variables, { key: '', description: '', example: '' }]
    });
  };

  const updateVariable = (index, field, value) => {
    const newVariables = [...formData.variables];
    newVariables[index][field] = value;
    setFormData({ ...formData, variables: newVariables });
  };

  const removeVariable = (index) => {
    setFormData({
      ...formData,
      variables: formData.variables.filter((_, i) => i !== index)
    });
  };

  const insertVariable = (varKey) => {
    const textarea = document.getElementById('content-text');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.content.text;
    const newText = text.substring(0, start) + `{{${varKey}}}` + text.substring(end);
    
    setFormData({
      ...formData,
      content: { ...formData.content, text: newText }
    });
  };

  return (
    <div className="space-y-6">
      {/* 模板选择器 */}
      {!content && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="font-medium text-blue-900">💡 使用系统模板</h3>
              <p className="text-sm text-blue-700 mt-1">选择一个模板快速开始，或手动创建</p>
            </div>
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              {showTemplates ? '隐藏模板' : '查看模板'}
            </button>
          </div>
          
          {showTemplates && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              {Object.entries(DEFAULT_TEMPLATES).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => loadTemplate(key)}
                  className="text-left p-3 bg-white border border-blue-200 rounded-lg hover:border-blue-400 hover:shadow-sm transition-all"
                >
                  <div className="font-medium text-slate-900">{template.name}</div>
                  <div className="text-xs text-slate-500 mt-1">Key: {key}</div>
                  <div className="text-xs text-blue-600 mt-1">
                    {template.variables?.length || 0} 个变量 • {template.category}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 基本信息 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">内容标识 (key)</label>
          <input
            type="text"
            value={formData.key}
            onChange={(e) => setFormData({ ...formData, key: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
            placeholder="例如: welcome_new_user"
            disabled={content && content._id}
          />
          <div className="text-xs text-slate-500 mt-1">
            唯一标识，创建后不可修改
            {!content && formData.key && DEFAULT_TEMPLATES[formData.key] && (
              <span className="text-blue-600 ml-2">✓ 已加载系统模板</span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">显示名称</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
            placeholder="例如: 新用户欢迎消息"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">分类</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
          >
            <option value="welcome">欢迎页面</option>
            <option value="payment">代付交互</option>
            <option value="order">订单相关</option>
            <option value="help">帮助信息</option>
            <option value="custom">自定义</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">内容类型</label>
          <select
            value={formData.content.type}
            onChange={(e) => setFormData({ 
              ...formData, 
              content: { ...formData.content, type: e.target.value }
            })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
          >
            <option value="text">纯文本</option>
            <option value="photo">图片</option>
            <option value="video">视频</option>
            <option value="document">文档</option>
          </select>
        </div>
      </div>

      {/* 媒体URL */}
      {formData.content.type !== 'text' && (
        <div>
          <label className="block text-sm font-medium mb-2">媒体URL</label>
          <input
            type="text"
            value={formData.content.mediaUrl}
            onChange={(e) => setFormData({ 
              ...formData, 
              content: { ...formData.content, mediaUrl: e.target.value }
            })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
            placeholder="https://..."
          />
          <div className="text-xs text-slate-500 mt-1">
            💡 Telegram 支持的图片格式：JPG, PNG, GIF, WebP (最大 10MB)
          </div>
        </div>
      )}

      {/* 文本内容 */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium">
            {formData.content.type === 'text' ? '消息内容' : '说明文字 (Caption)'}
          </label>
          <select
            value={formData.content.parseMode}
            onChange={(e) => setFormData({ 
              ...formData, 
              content: { ...formData.content, parseMode: e.target.value }
            })}
            className="px-3 py-1 border border-slate-300 rounded text-sm"
          >
            <option value="HTML">HTML</option>
            <option value="Markdown">Markdown</option>
            <option value="MarkdownV2">MarkdownV2</option>
          </select>
        </div>
        
        {/* 图片显示提示 */}
        {formData.content.type === 'text' && (
          <div className="mb-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
            <div className="font-medium text-amber-900 mb-1">⚠️ 图片显示说明</div>
            <div className="text-amber-700">
              Telegram 不支持在文本中使用 &lt;img&gt; 标签。如需显示图片，请：
              <br />1. 将"内容类型"改为"图片"
              <br />2. 在"媒体URL"中填入图片链接
              <br />3. 在下方文本框中填写图片说明文字
            </div>
          </div>
        )}
        
        <textarea
          id="content-text"
          value={formData.content.text}
          onChange={(e) => setFormData({ 
            ...formData, 
            content: { ...formData.content, text: e.target.value }
          })}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg font-mono text-sm"
          rows={12}
          placeholder={
            formData.content.type === 'text' 
              ? "输入消息内容，支持HTML标签和变量 {{variable}}" 
              : "输入图片说明文字（可选）"
          }
        />
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="text-xs text-slate-600">HTML标签:</span>
          <button
            onClick={() => {
              const textarea = document.getElementById('content-text');
              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;
              const text = formData.content.text;
              const selected = text.substring(start, end);
              const newText = text.substring(0, start) + `<b>${selected}</b>` + text.substring(end);
              setFormData({ ...formData, content: { ...formData.content, text: newText }});
            }}
            className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded"
          >
            &lt;b&gt; 加粗
          </button>
          <button
            onClick={() => {
              const textarea = document.getElementById('content-text');
              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;
              const text = formData.content.text;
              const selected = text.substring(start, end);
              const newText = text.substring(0, start) + `<code>${selected}</code>` + text.substring(end);
              setFormData({ ...formData, content: { ...formData.content, text: newText }});
            }}
            className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded"
          >
            &lt;code&gt; 代码
          </button>
          <button
            onClick={() => {
              const textarea = document.getElementById('content-text');
              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;
              const text = formData.content.text;
              const selected = text.substring(start, end);
              const newText = text.substring(0, start) + `<i>${selected}</i>` + text.substring(end);
              setFormData({ ...formData, content: { ...formData.content, text: newText }});
            }}
            className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded"
          >
            &lt;i&gt; 斜体
          </button>
          <button
            onClick={() => {
              const textarea = document.getElementById('content-text');
              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;
              const text = formData.content.text;
              const selected = text.substring(start, end);
              const newText = text.substring(0, start) + `<a href="https://">${selected}</a>` + text.substring(end);
              setFormData({ ...formData, content: { ...formData.content, text: newText }});
            }}
            className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded"
          >
            &lt;a&gt; 链接
          </button>
        </div>
      </div>

      {/* 变量管理 */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium">变量配置</label>
          <button
            onClick={addVariable}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            + 添加变量
          </button>
        </div>
        <div className="space-y-2">
          {formData.variables.map((variable, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={variable.key}
                onChange={(e) => updateVariable(index, 'key', e.target.value)}
                className="w-32 px-3 py-2 border border-slate-300 rounded text-sm"
                placeholder="变量名"
              />
              <input
                type="text"
                value={variable.description}
                onChange={(e) => updateVariable(index, 'description', e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm"
                placeholder="说明"
              />
              <input
                type="text"
                value={variable.example}
                onChange={(e) => updateVariable(index, 'example', e.target.value)}
                className="w-32 px-3 py-2 border border-slate-300 rounded text-sm"
                placeholder="示例值"
              />
              <button
                onClick={() => insertVariable(variable.key)}
                className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded text-sm"
                title="插入到内容中"
              >
                插入
              </button>
              <button
                onClick={() => removeVariable(index)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded text-sm"
              >
                删除
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 功能特性 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.features.copyable}
              onChange={(e) => setFormData({
                ...formData,
                features: { ...formData.features, copyable: e.target.checked }
              })}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">支持复制</span>
          </label>
          {formData.features.copyable && (
            <input
              type="text"
              value={formData.features.copyText}
              onChange={(e) => setFormData({
                ...formData,
                features: { ...formData.features, copyText: e.target.value }
              })}
              className="w-full mt-2 px-3 py-2 border border-slate-300 rounded text-sm"
              placeholder="可复制的文本或变量 {{variable}}"
            />
          )}
        </div>
      </div>

      {/* 按钮配置 */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium">按钮配置</label>
          <button
            onClick={addButton}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            + 添加按钮
          </button>
        </div>
        <div className="space-y-2">
          {formData.buttons.map((button, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={button.text}
                onChange={(e) => updateButton(index, 'text', e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm"
                placeholder="按钮文字"
              />
              <select
                value={button.type}
                onChange={(e) => updateButton(index, 'type', e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded text-sm"
              >
                <option value="callback">回调</option>
                <option value="url">链接</option>
                <option value="copy">复制</option>
              </select>
              <input
                type="text"
                value={button.data}
                onChange={(e) => updateButton(index, 'data', e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm"
                placeholder={
                  button.type === 'url' ? 'https://...' :
                  button.type === 'copy' ? '要复制的文本' :
                  'callback_data'
                }
              />
              <input
                type="number"
                value={button.row}
                onChange={(e) => updateButton(index, 'row', parseInt(e.target.value))}
                className="w-16 px-2 py-2 border border-slate-300 rounded text-sm text-center"
                placeholder="行"
              />
              <input
                type="number"
                value={button.col}
                onChange={(e) => updateButton(index, 'col', parseInt(e.target.value))}
                className="w-16 px-2 py-2 border border-slate-300 rounded text-sm text-center"
                placeholder="列"
              />
              <button
                onClick={() => removeButton(index)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded text-sm"
              >
                删除
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          onClick={onCancel}
          className="px-6 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          取消
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  );
};

export default TelegramContentEditor;
