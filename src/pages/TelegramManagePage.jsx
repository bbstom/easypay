import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import TelegramContentEditor from '../components/TelegramContentEditor';
import TelegramCommandsManager from '../components/TelegramCommandsManager';

const TelegramManagePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('commands');
  const [templates, setTemplates] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [stats, setStats] = useState({});
  const [menu, setMenu] = useState(null);
  const [systemActions, setSystemActions] = useState([]);
  const [contents, setContents] = useState([]);
  const [editingContent, setEditingContent] = useState(null);
  const [showContentEditor, setShowContentEditor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 模板表单
  const [templateForm, setTemplateForm] = useState({
    name: '',
    type: 'custom',
    content: '',
    parseMode: 'HTML',
    buttons: [],
    variables: [],
    enabled: true
  });

  // 群发表单
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    content: '',
    contentType: 'text',
    mediaUrl: '',
    parseMode: 'HTML',
    buttons: [],
    targetType: 'all',
    targetGroups: [],
    // 定时发送
    scheduledAt: '',
    // 重复发送
    repeatEnabled: false,
    repeatInterval: 24,
    maxRepeatCount: 0
  });

  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editingBroadcast, setEditingBroadcast] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      if (activeTab === 'templates') {
        const res = await fetch('/api/telegram/templates', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setTemplates(data);
      } else if (activeTab === 'broadcasts') {
        const res = await fetch('/api/telegram/broadcasts', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setBroadcasts(data);
        
        // 同时获取群组列表
        const groupsRes = await fetch('/api/telegram/groups', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const groupsData = await groupsRes.json();
        setGroups(groupsData);
      } else if (activeTab === 'menu') {
        const [menuRes, actionsRes] = await Promise.all([
          fetch('/api/telegram/menu', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/telegram/menu/system-actions', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);
        const menuData = await menuRes.json();
        const actionsData = await actionsRes.json();
        setMenu(menuData);
        setSystemActions(actionsData);
      } else if (activeTab === 'contents') {
        const res = await fetch('/api/telegram/contents', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setContents(data);
      } else if (activeTab === 'stats') {
        const res = await fetch('/api/telegram/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('获取数据失败:', error);
    }
  };

  // 保存模板
  const saveTemplate = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);

    try {
      const url = editingTemplate 
        ? `/api/telegram/templates/${editingTemplate._id}`
        : '/api/telegram/templates';
      
      const method = editingTemplate ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(templateForm)
      });

      if (res.ok) {
        alert(editingTemplate ? '模板已更新' : '模板已创建');
        setShowTemplateModal(false);
        setEditingTemplate(null);
        resetTemplateForm();
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || '操作失败');
      }
    } catch (error) {
      alert('操作失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 删除模板
  const deleteTemplate = async (id) => {
    if (!confirm('确定要删除这个模板吗？')) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/telegram/templates/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        alert('模板已删除');
        fetchData();
      }
    } catch (error) {
      alert('删除失败: ' + error.message);
    }
  };

  // 创建群发
  const createBroadcast = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);

    try {
      // 准备数据，转换 scheduledAt 为 UTC
      const data = { ...broadcastForm };
      if (data.scheduledAt) {
        // datetime-local 返回的是本地时间，需要转换为 UTC
        data.scheduledAt = new Date(data.scheduledAt).toISOString();
      } else {
        // 如果没有设置，删除该字段
        delete data.scheduledAt;
      }

      const res = await fetch('/api/telegram/broadcasts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        alert('群发已创建');
        setShowBroadcastModal(false);
        setEditingBroadcast(null); // 清除编辑状态
        resetBroadcastForm();
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || '创建失败');
      }
    } catch (error) {
      alert('创建失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 发送群发
  const sendBroadcast = async (id) => {
    if (!confirm('确定要发送这条群发消息吗？')) return;

    const token = localStorage.getItem('token');
    setLoading(true);

    try {
      const res = await fetch(`/api/telegram/broadcasts/${id}/send`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (res.ok) {
        alert(`开始发送群发，目标用户: ${data.totalUsers}`);
        fetchData();
      } else {
        alert(data.error || '发送失败');
      }
    } catch (error) {
      alert('发送失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 编辑群发
  const editBroadcast = (broadcast) => {
    // 转换 scheduledAt 为 datetime-local 格式
    let scheduledAtValue = '';
    if (broadcast.scheduledAt) {
      const date = new Date(broadcast.scheduledAt);
      // 转换为本地时间的 datetime-local 格式
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      scheduledAtValue = `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    setBroadcastForm({
      title: broadcast.title,
      content: broadcast.content,
      contentType: broadcast.contentType || 'text',
      mediaUrl: broadcast.mediaUrl || '',
      parseMode: broadcast.parseMode || 'HTML',
      targetType: broadcast.targetType,
      targetUsers: broadcast.targetUsers || [],
      targetGroups: broadcast.targetGroups || [],
      buttons: broadcast.buttons || [],
      scheduledAt: scheduledAtValue,
      repeatEnabled: broadcast.repeatEnabled || false,
      repeatInterval: broadcast.repeatInterval || 24,
      maxRepeatCount: broadcast.maxRepeatCount || 0
    });
    setEditingBroadcast(broadcast);
    setShowBroadcastModal(true);
  };

  // 更新群发
  const updateBroadcast = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);

    try {
      // 准备数据，转换 scheduledAt 为 UTC
      const data = { ...broadcastForm };
      if (data.scheduledAt) {
        data.scheduledAt = new Date(data.scheduledAt).toISOString();
      } else {
        delete data.scheduledAt;
      }

      // 如果是已完成的群发，重置状态为草稿
      if (editingBroadcast.status === 'completed' || editingBroadcast.status === 'failed') {
        data.status = 'draft';
        data.sentCount = 0;
        data.failedCount = 0;
        data.totalUsers = 0;
      }

      const res = await fetch(`/api/telegram/broadcasts/${editingBroadcast._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        alert('群发已更新');
        setShowBroadcastModal(false);
        setEditingBroadcast(null);
        resetBroadcastForm();
        fetchData();
      } else {
        const data = await res.json();
        alert(`更新失败: ${data.error}`);
      }
    } catch (error) {
      alert('更新失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 删除群发
  const deleteBroadcast = async (id) => {
    if (!confirm('确定要删除这条群发消息吗？此操作不可恢复！')) return;

    const token = localStorage.getItem('token');
    setLoading(true);

    try {
      const res = await fetch(`/api/telegram/broadcasts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        alert('删除成功');
        fetchData();
      } else {
        const data = await res.json();
        alert(`删除失败: ${data.error}`);
      }
    } catch (error) {
      alert('删除失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 停止重复发送
  const stopRepeat = async (id) => {
    if (!confirm('确定要停止重复发送吗？')) return;

    const token = localStorage.getItem('token');
    setLoading(true);

    try {
      const res = await fetch(`/api/telegram/broadcasts/${id}/stop-repeat`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        alert('已停止重复发送');
        fetchData();
      } else {
        const data = await res.json();
        alert(`操作失败: ${data.error}`);
      }
    } catch (error) {
      alert('操作失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 手动触发发送
  const triggerBroadcast = async (id) => {
    if (!confirm('确定要立即发送这条群发消息吗？')) return;

    const token = localStorage.getItem('token');
    setLoading(true);

    try {
      const res = await fetch(`/api/telegram/broadcasts/${id}/trigger`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        alert('已触发发送');
        fetchData();
      } else {
        const data = await res.json();
        alert(`操作失败: ${data.error}`);
      }
    } catch (error) {
      alert('操作失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 查看详情
  const viewDetails = async (broadcast) => {
    const token = localStorage.getItem('token');
    setLoading(true);

    try {
      const res = await fetch(`/api/telegram/broadcasts/${broadcast._id}/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const stats = await res.json();
        
        // 构建详细信息
        let message = `📊 群发详情\n\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        message += `📝 标题: ${broadcast.title}\n`;
        message += `📄 类型: ${
          broadcast.contentType === 'photo' ? '图片' :
          broadcast.contentType === 'video' ? '视频' :
          broadcast.contentType === 'document' ? '文档' :
          '文本'
        }\n`;
        message += `🎯 目标: ${
          broadcast.targetType === 'all' ? '所有用户' : 
          broadcast.targetType === 'active' ? '活跃用户' :
          broadcast.targetType === 'group' ? '群组' :
          broadcast.targetType
        }\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        message += `📈 发送统计\n`;
        message += `总用户数: ${stats.totalUsers}\n`;
        message += `成功发送: ${stats.sentCount}\n`;
        message += `发送失败: ${stats.failedCount}\n`;
        message += `成功率: ${stats.successRate}%\n\n`;
        
        if (broadcast.repeatEnabled) {
          message += `🔄 重复发送\n`;
          message += `状态: 已启用\n`;
          message += `间隔: ${broadcast.repeatInterval} 小时\n`;
          message += `已发送: ${broadcast.sentTimes || 0} 次\n`;
          message += `最大次数: ${broadcast.maxRepeatCount || '无限制'}\n`;
          if (broadcast.nextSendAt) {
            message += `下次发送: ${new Date(broadcast.nextSendAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}\n`;
          }
          message += `\n`;
        }
        
        if (broadcast.scheduledAt) {
          message += `⏰ 定时发送\n`;
          message += `设定时间: ${new Date(broadcast.scheduledAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}\n\n`;
        }
        
        if (broadcast.lastSentAt) {
          message += `📅 最后发送: ${new Date(broadcast.lastSentAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}\n`;
        }
        
        if (broadcast.createdAt) {
          message += `📅 创建时间: ${new Date(broadcast.createdAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}\n`;
        }
        
        // 如果有失败，显示失败详情
        if (stats.failedCount > 0 && broadcast.repeatHistory && broadcast.repeatHistory.length > 0) {
          const lastHistory = broadcast.repeatHistory[broadcast.repeatHistory.length - 1];
          
          if (lastHistory.failedDetails && lastHistory.failedDetails.length > 0) {
            message += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            message += `❌ 最近失败详情 (最多显示 10 条)\n\n`;
            
            lastHistory.failedDetails.forEach((detail, index) => {
              message += `${index + 1}. TG ${detail.telegramId}\n`;
              if (detail.username) {
                message += `   用户: @${detail.username}\n`;
              }
              message += `   错误: ${detail.error}\n`;
              if (detail.errorCode) {
                message += `   代码: ${detail.errorCode}\n`;
              }
              message += `\n`;
            });
          } else {
            message += `\n⚠️ 有 ${stats.failedCount} 条消息发送失败\n`;
            message += `常见原因:\n`;
            message += `• 用户屏蔽了 Bot\n`;
            message += `• 用户删除了账号\n`;
            message += `• 按钮 URL 格式错误\n`;
            message += `• 媒体文件无法访问\n`;
          }
        }
        
        alert(message);
      } else {
        const data = await res.json();
        alert(`获取详情失败: ${data.error}`);
      }
    } catch (error) {
      alert('获取详情失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 复制为新草稿
  const duplicateBroadcast = (broadcast) => {
    // 转换 scheduledAt 为 datetime-local 格式（如果有）
    let scheduledAtValue = '';
    if (broadcast.scheduledAt) {
      const date = new Date(broadcast.scheduledAt);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      scheduledAtValue = `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    setBroadcastForm({
      title: `${broadcast.title} (副本)`,
      content: broadcast.content,
      contentType: broadcast.contentType || 'text',
      mediaUrl: broadcast.mediaUrl || '',
      parseMode: broadcast.parseMode || 'HTML',
      targetType: broadcast.targetType,
      targetUsers: broadcast.targetUsers || [],
      targetGroups: broadcast.targetGroups || [],
      buttons: broadcast.buttons || [],
      scheduledAt: scheduledAtValue,
      repeatEnabled: broadcast.repeatEnabled || false,
      repeatInterval: broadcast.repeatInterval || 24,
      maxRepeatCount: broadcast.maxRepeatCount || 0
    });
    setEditingBroadcast(null); // 不设置编辑状态，作为新建
    setShowBroadcastModal(true);
  };

  // 保存群发（创建或更新）
  const saveBroadcast = () => {
    if (editingBroadcast) {
      updateBroadcast();
    } else {
      createBroadcast();
    }
  };

  // 添加按钮
  const addButton = (formType) => {
    const newButton = { text: '', type: 'callback', data: '', row: 0 };
    if (formType === 'template') {
      setTemplateForm({
        ...templateForm,
        buttons: [...templateForm.buttons, newButton]
      });
    } else {
      setBroadcastForm({
        ...broadcastForm,
        buttons: [...broadcastForm.buttons, newButton]
      });
    }
  };

  // 更新按钮
  const updateButton = (index, field, value, formType) => {
    if (formType === 'template') {
      const newButtons = [...templateForm.buttons];
      newButtons[index][field] = value;
      setTemplateForm({ ...templateForm, buttons: newButtons });
    } else {
      const newButtons = [...broadcastForm.buttons];
      newButtons[index][field] = value;
      setBroadcastForm({ ...broadcastForm, buttons: newButtons });
    }
  };

  // 删除按钮
  const removeButton = (index, formType) => {
    if (formType === 'template') {
      setTemplateForm({
        ...templateForm,
        buttons: templateForm.buttons.filter((_, i) => i !== index)
      });
    } else {
      setBroadcastForm({
        ...broadcastForm,
        buttons: broadcastForm.buttons.filter((_, i) => i !== index)
      });
    }
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      type: 'custom',
      content: '',
      parseMode: 'HTML',
      buttons: [],
      variables: [],
      enabled: true
    });
  };

  const resetBroadcastForm = () => {
    setBroadcastForm({
      title: '',
      content: '',
      contentType: 'text',
      mediaUrl: '',
      parseMode: 'HTML',
      buttons: [],
      targetType: 'all',
      targetGroups: [],
      scheduledAt: '',
      repeatEnabled: false,
      repeatInterval: 24,
      maxRepeatCount: 0
    });
  };

  const editTemplate = (template) => {
    setEditingTemplate(template);
    setTemplateForm(template);
    setShowTemplateModal(true);
  };

  // 菜单管理函数
  const saveMenu = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);

    try {
      const res = await fetch('/api/telegram/menu', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(menu)
      });

      if (res.ok) {
        alert('菜单已保存');
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || '保存失败');
      }
    } catch (error) {
      alert('保存失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetMenu = async () => {
    if (!confirm('确定要重置为默认菜单吗？')) return;

    const token = localStorage.getItem('token');
    setLoading(true);

    try {
      const res = await fetch('/api/telegram/menu/reset', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        alert('菜单已重置');
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || '重置失败');
      }
    } catch (error) {
      alert('重置失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addMenuButton = () => {
    const newButton = {
      text: '新按钮',
      type: 'system',
      action: 'payment_usdt',
      row: 0,
      col: 0,
      enabled: true,
      order: menu.buttons.length
    };
    setMenu({
      ...menu,
      buttons: [...menu.buttons, newButton]
    });
  };

  const updateMenuButton = (index, field, value) => {
    const newButtons = [...menu.buttons];
    newButtons[index][field] = value;
    setMenu({ ...menu, buttons: newButtons });
  };

  const removeMenuButton = (index) => {
    setMenu({
      ...menu,
      buttons: menu.buttons.filter((_, i) => i !== index)
    });
  };

  const moveMenuButton = (index, direction) => {
    const newButtons = [...menu.buttons];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newButtons.length) return;
    
    [newButtons[index], newButtons[targetIndex]] = [newButtons[targetIndex], newButtons[index]];
    
    // 更新order
    newButtons.forEach((btn, i) => {
      btn.order = i;
    });
    
    setMenu({ ...menu, buttons: newButtons });
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Telegram Bot 管理</h1>
          <p className="text-slate-600 mt-2">管理消息模板、群发消息和Bot设置</p>
        </div>

        {/* 标签页 */}
        <div className="flex gap-4 mb-6 border-b border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('commands')}
            className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'commands'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚡ 快捷指令
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'menu'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🎛️ 主菜单设置
          </button>
          <button
            onClick={() => setActiveTab('contents')}
            className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'contents'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📄 内容管理
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'templates'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📝 消息模板
          </button>
          <button
            onClick={() => setActiveTab('broadcasts')}
            className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'broadcasts'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📢 群发消息
          </button>
          <button
            onClick={() => setActiveTab('broadcast-stats')}
            className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'broadcast-stats'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📊 群发统计
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'stats'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📈 用户统计
          </button>
        </div>

        {/* 快捷指令管理 */}
        {activeTab === 'commands' && (
          <TelegramCommandsManager />
        )}

        {/* 主菜单设置 */}
        {activeTab === 'menu' && menu && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">主菜单按钮配置</h2>
              <div className="flex gap-2">
                <button
                  onClick={resetMenu}
                  className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  重置默认
                </button>
                <button
                  onClick={addMenuButton}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  + 添加按钮
                </button>
                <button
                  onClick={saveMenu}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? '保存中...' : '保存菜单'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
              <h3 className="font-bold mb-4">预览效果</h3>
              <div className="bg-slate-50 rounded-lg p-4 max-w-md">
                <div className="text-sm text-slate-600 mb-3">📋 主菜单</div>
                <div className="space-y-2">
                  {Object.entries(
                    menu.buttons
                      .filter(btn => btn.enabled)
                      .reduce((acc, btn) => {
                        if (!acc[btn.row]) acc[btn.row] = [];
                        acc[btn.row].push(btn);
                        return acc;
                      }, {})
                  ).map(([row, buttons]) => (
                    <div key={row} className="flex gap-2">
                      {buttons
                        .sort((a, b) => a.col - b.col)
                        .map((btn, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-white border border-slate-300 rounded px-3 py-2 text-center text-sm"
                          >
                            {btn.text}
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {menu.buttons.map((button, index) => (
                <div key={index} className="bg-white rounded-lg border border-slate-200 p-4">
                  <div className="flex gap-3 items-start">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => moveMenuButton(index, 'up')}
                        disabled={index === 0}
                        className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveMenuButton(index, 'down')}
                        disabled={index === menu.buttons.length - 1}
                        className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded disabled:opacity-30"
                      >
                        ↓
                      </button>
                    </div>
                    
                    <div className="flex-1 grid grid-cols-6 gap-3">
                      <input
                        type="text"
                        value={button.text}
                        onChange={(e) => updateMenuButton(index, 'text', e.target.value)}
                        className="col-span-2 px-3 py-2 border border-slate-300 rounded"
                        placeholder="按钮文字（支持emoji）"
                      />
                      
                      <select
                        value={button.type}
                        onChange={(e) => updateMenuButton(index, 'type', e.target.value)}
                        className="px-3 py-2 border border-slate-300 rounded"
                      >
                        <option value="system">系统功能</option>
                        <option value="callback">自定义回调</option>
                        <option value="url">外部链接</option>
                      </select>
                      
                      {button.type === 'system' ? (
                        <select
                          value={button.action}
                          onChange={(e) => updateMenuButton(index, 'action', e.target.value)}
                          className="col-span-2 px-3 py-2 border border-slate-300 rounded"
                        >
                          {systemActions.map(action => (
                            <option key={action.value} value={action.value}>
                              {action.icon} {action.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={button.action}
                          onChange={(e) => updateMenuButton(index, 'action', e.target.value)}
                          className="col-span-2 px-3 py-2 border border-slate-300 rounded"
                          placeholder={button.type === 'url' ? 'https://...' : 'callback_data'}
                        />
                      )}
                      
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={button.row}
                          onChange={(e) => updateMenuButton(index, 'row', parseInt(e.target.value))}
                          className="w-16 px-2 py-2 border border-slate-300 rounded text-center"
                          placeholder="行"
                          min="0"
                        />
                        <input
                          type="number"
                          value={button.col}
                          onChange={(e) => updateMenuButton(index, 'col', parseInt(e.target.value))}
                          className="w-16 px-2 py-2 border border-slate-300 rounded text-center"
                          placeholder="列"
                          min="0"
                        />
                      </div>
                    </div>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={button.enabled}
                        onChange={(e) => updateMenuButton(index, 'enabled', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">启用</span>
                    </label>
                    
                    <button
                      onClick={() => removeMenuButton(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-bold text-blue-900 mb-2">💡 使用说明</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>按钮文字</strong>：支持emoji，建议使用emoji增强视觉效果</li>
                <li>• <strong>系统功能</strong>：选择预定义的功能（代付、订单、工单等）</li>
                <li>• <strong>自定义回调</strong>：输入callback_data，需要在代码中处理</li>
                <li>• <strong>外部链接</strong>：输入完整URL，点击后在浏览器打开</li>
                <li>• <strong>行列设置</strong>：行号相同的按钮在同一行，列号决定顺序</li>
                <li>• <strong>排序</strong>：使用↑↓按钮调整显示顺序</li>
              </ul>
            </div>
          </div>
        )}

        {/* 内容管理 */}
        {activeTab === 'contents' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">内容管理</h2>
              <button
                onClick={() => {
                  setEditingContent(null);
                  setShowContentEditor(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + 创建内容
              </button>
            </div>

            {/* 分类过滤 */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {['all', 'welcome', 'payment', 'order', 'help', 'custom'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 text-sm border rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {cat === 'all' && '全部'}
                  {cat === 'welcome' && '欢迎页面'}
                  {cat === 'payment' && '代付交互'}
                  {cat === 'order' && '订单相关'}
                  {cat === 'help' && '帮助信息'}
                  {cat === 'custom' && '自定义'}
                </button>
              ))}
            </div>

            {/* 内容列表 */}
            <div className="grid gap-4">
              {contents
                .filter(content => selectedCategory === 'all' || content.category === selectedCategory)
                .map(content => (
                <div key={content._id} className="bg-white rounded-lg border border-slate-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold">{content.name}</h3>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {content.category}
                        </span>
                        <span className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded">
                          {content.content.type}
                        </span>
                        <span className="text-xs text-slate-500">
                          key: {content.key}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingContent(content);
                          setShowContentEditor(true);
                        }}
                        className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        编辑
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm('确定要删除这个内容吗？')) return;
                          const token = localStorage.getItem('token');
                          try {
                            const res = await fetch(`/api/telegram/contents/${content.key}`, {
                              method: 'DELETE',
                              headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (res.ok) {
                              alert('内容已删除');
                              fetchData();
                            }
                          } catch (error) {
                            alert('删除失败: ' + error.message);
                          }
                        }}
                        className="px-3 py-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 rounded p-4 text-sm font-mono whitespace-pre-wrap mb-4">
                    {content.content.text?.substring(0, 200)}
                    {content.content.text?.length > 200 && '...'}
                  </div>

                  <div className="flex gap-6 text-sm text-slate-600">
                    {content.buttons?.length > 0 && (
                      <span>按钮: {content.buttons.length} 个</span>
                    )}
                    {content.variables?.length > 0 && (
                      <span>变量: {content.variables.length} 个</span>
                    )}
                    {content.features?.copyable && (
                      <span>✅ 支持复制</span>
                    )}
                    <span className={content.enabled ? 'text-green-600' : 'text-slate-400'}>
                      {content.enabled ? '已启用' : '已禁用'}
                    </span>
                  </div>
                </div>
              ))}

              {contents.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <p className="mb-4">暂无内容配置</p>
                  <button
                    onClick={async () => {
                      const token = localStorage.getItem('token');
                      try {
                        const res = await fetch('/api/telegram/contents/init-defaults', {
                          method: 'POST',
                          headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (res.ok) {
                          alert('默认内容已初始化');
                          fetchData();
                        }
                      } catch (error) {
                        alert('初始化失败: ' + error.message);
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    初始化默认内容
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 模板管理 */}
        {activeTab === 'templates' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">消息模板</h2>
              <button
                onClick={() => {
                  resetTemplateForm();
                  setEditingTemplate(null);
                  setShowTemplateModal(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + 创建模板
              </button>
            </div>

            <div className="grid gap-4">
              {templates.map(template => (
                <div key={template._id} className="bg-white rounded-lg border border-slate-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold">{template.name}</h3>
                      <span className="text-sm text-slate-500">{template.type}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => editTemplate(template)}
                        className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => deleteTemplate(template._id)}
                        className="px-3 py-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded p-4 text-sm font-mono whitespace-pre-wrap">
                    {template.content.substring(0, 200)}
                    {template.content.length > 200 && '...'}
                  </div>
                  {template.buttons.length > 0 && (
                    <div className="mt-4">
                      <span className="text-sm text-slate-600">按钮: {template.buttons.length} 个</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 群发管理 */}
        {activeTab === 'broadcasts' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">群发消息</h2>
              <button
                onClick={() => {
                  setEditingBroadcast(null); // 清除编辑状态
                  resetBroadcastForm();
                  setShowBroadcastModal(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + 创建群发
              </button>
            </div>

            <div className="grid gap-4">
              {broadcasts.map(broadcast => (
                <div key={broadcast._id} className="bg-white rounded-lg border border-slate-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold">{broadcast.title}</h3>
                        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                          {broadcast.contentType === 'photo' && '🖼️ 图片'}
                          {broadcast.contentType === 'video' && '🎬 视频'}
                          {broadcast.contentType === 'document' && '📄 文档'}
                          {(!broadcast.contentType || broadcast.contentType === 'text') && '📝 文本'}
                        </span>
                      </div>
                      <span className={`text-sm px-2 py-1 rounded ${
                        broadcast.status === 'completed' ? 'bg-green-100 text-green-700' :
                        broadcast.status === 'sending' ? 'bg-blue-100 text-blue-700' :
                        broadcast.status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {broadcast.status === 'draft' && '草稿'}
                        {broadcast.status === 'sending' && '发送中'}
                        {broadcast.status === 'completed' && '已完成'}
                        {broadcast.status === 'failed' && '失败'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {broadcast.status === 'draft' && (
                        <>
                          <button
                            onClick={() => editBroadcast(broadcast)}
                            className="px-3 py-1.5 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                            disabled={loading}
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => sendBroadcast(broadcast._id)}
                            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                            disabled={loading}
                          >
                            发送
                          </button>
                        </>
                      )}
                      {(broadcast.status === 'completed' || broadcast.status === 'failed') && (
                        <>
                          <button
                            onClick={() => editBroadcast(broadcast)}
                            className="px-3 py-1.5 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                            disabled={loading}
                            title="编辑内容"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => triggerBroadcast(broadcast._id)}
                            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                            disabled={loading}
                            title="立即发送一次"
                          >
                            立即发送
                          </button>
                          {broadcast.repeatEnabled && (
                            <button
                              onClick={() => stopRepeat(broadcast._id)}
                              className="px-3 py-1.5 text-sm bg-orange-600 text-white rounded hover:bg-orange-700"
                              disabled={loading}
                              title="停止重复发送"
                            >
                              停止重复
                            </button>
                          )}
                          <button
                            onClick={() => viewDetails(broadcast)}
                            className="px-3 py-1.5 text-sm text-purple-600 border border-purple-600 rounded hover:bg-purple-50"
                            disabled={loading}
                            title="查看详细信息"
                          >
                            详情
                          </button>
                          <button
                            onClick={() => duplicateBroadcast(broadcast)}
                            className="px-3 py-1.5 text-sm text-slate-600 border border-slate-600 rounded hover:bg-slate-50"
                            disabled={loading}
                            title="复制为新草稿"
                          >
                            复制
                          </button>
                        </>
                      )}
                      {(broadcast.status === 'draft' || broadcast.status === 'failed' || broadcast.status === 'completed') && (
                        <button
                          onClick={() => deleteBroadcast(broadcast._id)}
                          className="px-3 py-1.5 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
                          disabled={loading}
                        >
                          删除
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded p-4 text-sm font-mono whitespace-pre-wrap mb-4">
                    {broadcast.mediaUrl && (
                      <div className="text-blue-600 mb-2">📎 {broadcast.mediaUrl.substring(0, 50)}...</div>
                    )}
                    {broadcast.content.substring(0, 150)}
                    {broadcast.content.length > 150 && '...'}
                  </div>
                  <div className="flex gap-6 text-sm text-slate-600">
                    <span>目标: {
                      broadcast.targetType === 'all' ? '所有用户' : 
                      broadcast.targetType === 'active' ? '活跃用户' :
                      broadcast.targetType === 'group' ? '群组' :
                      broadcast.targetType
                    }</span>
                    {broadcast.totalUsers > 0 && (
                      <>
                        <span>总数: {broadcast.totalUsers}</span>
                        <span>成功: {broadcast.sentCount}</span>
                        <span>失败: {broadcast.failedCount}</span>
                      </>
                    )}
                  </div>
                  {/* 重复发送状态 */}
                  {broadcast.repeatEnabled && (
                    <div className="mt-3 pt-3 border-t border-slate-200 flex gap-6 text-sm">
                      <span className="text-orange-600 font-medium">🔄 重复发送已启用</span>
                      <span className="text-slate-600">间隔: {broadcast.repeatInterval}小时</span>
                      <span className="text-slate-600">已发送: {broadcast.sentTimes || 0}次</span>
                      {broadcast.maxRepeatCount > 0 && (
                        <span className="text-slate-600">最大: {broadcast.maxRepeatCount}次</span>
                      )}
                      {broadcast.nextSendAt && (
                        <span className="text-blue-600">
                          下次: {new Date(broadcast.nextSendAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
                        </span>
                      )}
                    </div>
                  )}
                  {/* 定时发送状态 */}
                  {broadcast.scheduledAt && broadcast.status === 'draft' && (
                    <div className="mt-3 pt-3 border-t border-slate-200 text-sm text-blue-600">
                      ⏰ 定时发送: {new Date(broadcast.scheduledAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 统计数据 */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="text-slate-600 mb-2">总用户数</div>
              <div className="text-3xl font-bold text-slate-900">{stats.totalUsers || 0}</div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="text-slate-600 mb-2">今日新增</div>
              <div className="text-3xl font-bold text-blue-600">{stats.todayUsers || 0}</div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="text-slate-600 mb-2">活跃用户（7天）</div>
              <div className="text-3xl font-bold text-green-600">{stats.activeUsers || 0}</div>
            </div>
          </div>
        )}

        {/* 群发统计 */}
        {activeTab === 'broadcast-stats' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">群发统计</h2>
              <p className="text-slate-600">查看所有群发消息的详细统计信息</p>
            </div>

            {/* 总体统计 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="text-slate-600 mb-2">总群发数</div>
                <div className="text-3xl font-bold text-slate-900">{broadcasts.length}</div>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="text-slate-600 mb-2">草稿</div>
                <div className="text-3xl font-bold text-slate-600">
                  {broadcasts.filter(b => b.status === 'draft').length}
                </div>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="text-slate-600 mb-2">已完成</div>
                <div className="text-3xl font-bold text-green-600">
                  {broadcasts.filter(b => b.status === 'completed').length}
                </div>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="text-slate-600 mb-2">重复发送中</div>
                <div className="text-3xl font-bold text-orange-600">
                  {broadcasts.filter(b => b.repeatEnabled && b.status === 'completed').length}
                </div>
              </div>
            </div>

            {/* 详细列表 */}
            <div className="bg-white rounded-lg border border-slate-200">
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-bold">群发详情</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">标题</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">状态</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">目标</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">总数</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">成功</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">失败</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">成功率</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">重复</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">下次发送</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {broadcasts.map(broadcast => {
                      const successRate = broadcast.totalUsers > 0 
                        ? ((broadcast.sentCount / broadcast.totalUsers) * 100).toFixed(1)
                        : '0.0';
                      
                      return (
                        <tr key={broadcast._id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-sm">
                            <div className="font-medium">{broadcast.title}</div>
                            <div className="text-xs text-slate-500">
                              {broadcast.contentType === 'photo' && '🖼️ 图片'}
                              {broadcast.contentType === 'video' && '🎬 视频'}
                              {broadcast.contentType === 'document' && '📄 文档'}
                              {(!broadcast.contentType || broadcast.contentType === 'text') && '📝 文本'}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded text-xs ${
                              broadcast.status === 'completed' ? 'bg-green-100 text-green-700' :
                              broadcast.status === 'sending' ? 'bg-blue-100 text-blue-700' :
                              broadcast.status === 'failed' ? 'bg-red-100 text-red-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {broadcast.status === 'draft' && '草稿'}
                              {broadcast.status === 'sending' && '发送中'}
                              {broadcast.status === 'completed' && '已完成'}
                              {broadcast.status === 'failed' && '失败'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {broadcast.targetType === 'all' ? '所有用户' : 
                             broadcast.targetType === 'active' ? '活跃用户' :
                             broadcast.targetType === 'group' ? '群组' :
                             broadcast.targetType}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium">
                            {broadcast.totalUsers || 0}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-green-600">
                            {broadcast.sentCount || 0}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-red-600">
                            {broadcast.failedCount || 0}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            <span className={`font-medium ${
                              parseFloat(successRate) >= 90 ? 'text-green-600' :
                              parseFloat(successRate) >= 70 ? 'text-orange-600' :
                              'text-red-600'
                            }`}>
                              {successRate}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {broadcast.repeatEnabled ? (
                              <div className="text-orange-600">
                                <div className="font-medium">✓ 已启用</div>
                                <div className="text-xs">
                                  {broadcast.sentTimes || 0}
                                  {broadcast.maxRepeatCount > 0 ? `/${broadcast.maxRepeatCount}` : '/∞'}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {broadcast.nextSendAt ? (
                              <div className="text-xs">
                                {new Date(broadcast.nextSendAt).toLocaleString('zh-CN', { 
                                  timeZone: 'Asia/Shanghai',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 模板编辑模态框 */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold">
                {editingTemplate ? '编辑模板' : '创建模板'}
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">模板名称</label>
                <input
                  type="text"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  placeholder="例如: 欢迎消息"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">模板类型</label>
                <select
                  value={templateForm.type}
                  onChange={(e) => setTemplateForm({ ...templateForm, type: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="welcome">欢迎消息</option>
                  <option value="payment_success">支付成功通知</option>
                  <option value="transfer_complete">代付完成通知</option>
                  <option value="transfer_failed">代付失败通知</option>
                  <option value="order_completed">订单完成通知</option>
                  <option value="order_failed">订单失败通知</option>
                  <option value="custom">自定义</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">消息内容</label>
                <textarea
                  value={templateForm.content}
                  onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg font-mono text-sm"
                  rows={10}
                  placeholder="支持HTML标签和变量 {{orderId}}, {{amount}} 等"
                />
                <div className="text-xs text-slate-500 mt-1">
                  提示: 使用 &lt;b&gt; 加粗, &lt;code&gt; 代码, &lt;i&gt; 斜体
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">按钮配置</label>
                {templateForm.buttons.map((button, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={button.text}
                      onChange={(e) => updateButton(index, 'text', e.target.value, 'template')}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded"
                      placeholder="按钮文字"
                    />
                    <select
                      value={button.type}
                      onChange={(e) => updateButton(index, 'type', e.target.value, 'template')}
                      className="px-3 py-2 border border-slate-300 rounded"
                    >
                      <option value="callback">回调</option>
                      <option value="url">链接</option>
                    </select>
                    <input
                      type="text"
                      value={button.data}
                      onChange={(e) => updateButton(index, 'data', e.target.value, 'template')}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded"
                      placeholder={button.type === 'url' ? 'https://...' : 'callback_data'}
                    />
                    <input
                      type="number"
                      value={button.row}
                      onChange={(e) => updateButton(index, 'row', parseInt(e.target.value), 'template')}
                      className="w-16 px-3 py-2 border border-slate-300 rounded"
                      placeholder="行"
                    />
                    <button
                      onClick={() => removeButton(index, 'template')}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      删除
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addButton('template')}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  + 添加按钮
                </button>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowTemplateModal(false);
                  setEditingTemplate(null);
                }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={saveTemplate}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 内容编辑模态框 */}
      {showContentEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold">
                {editingContent ? '编辑内容' : '创建内容'}
              </h2>
            </div>
            
            <div className="p-6">
              <TelegramContentEditor
                content={editingContent}
                onSave={async (formData) => {
                  const token = localStorage.getItem('token');
                  try {
                    const url = editingContent 
                      ? `/api/telegram/contents/${editingContent.key}`
                      : '/api/telegram/contents';
                    
                    const method = editingContent ? 'PUT' : 'POST';

                    const res = await fetch(url, {
                      method,
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify(formData)
                    });

                    if (res.ok) {
                      const data = await res.json();
                      // 显示是创建还是更新
                      if (data.isUpdate !== undefined) {
                        alert(data.isUpdate ? '内容已更新（已存在的内容）' : '内容已创建');
                      } else {
                        alert(editingContent ? '内容已更新' : '内容已创建');
                      }
                      setShowContentEditor(false);
                      setEditingContent(null);
                      fetchData();
                    } else {
                      const data = await res.json();
                      alert(data.error || '操作失败');
                    }
                  } catch (error) {
                    alert('操作失败: ' + error.message);
                  }
                }}
                onCancel={() => {
                  setShowContentEditor(false);
                  setEditingContent(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 群发创建模态框 */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold">{editingBroadcast ? '编辑群发消息' : '创建群发消息'}</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">群发标题</label>
                <input
                  type="text"
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  placeholder="例如: 系统维护通知"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">内容类型</label>
                  <select
                    value={broadcastForm.contentType || 'text'}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, contentType: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="text">📝 纯文本</option>
                    <option value="photo">🖼️ 图片</option>
                    <option value="video">🎬 视频</option>
                    <option value="document">📄 文档</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">解析模式</label>
                  <select
                    value={broadcastForm.parseMode || 'HTML'}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, parseMode: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="HTML">HTML</option>
                    <option value="Markdown">Markdown</option>
                    <option value="MarkdownV2">MarkdownV2</option>
                  </select>
                </div>
              </div>

              {broadcastForm.contentType !== 'text' && (
                <div>
                  <label className="block text-sm font-medium mb-2">媒体URL</label>
                  <input
                    type="text"
                    value={broadcastForm.mediaUrl || ''}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, mediaUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                    placeholder="https://example.com/image.jpg 或 Telegram 文件 ID"
                  />
                  <div className="text-xs text-slate-500 mt-1">
                    💡 支持 HTTPS 链接或 Telegram 文件 ID
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">目标用户</label>
                <select
                  value={broadcastForm.targetType}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, targetType: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="all">👥 所有用户</option>
                  <option value="active">✅ 活跃用户（30天内）</option>
                  <option value="inactive">💤 不活跃用户</option>
                  <option value="group">👨‍👩‍👧‍👦 群组</option>
                </select>
              </div>

              {broadcastForm.targetType === 'group' && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    选择群组/频道
                    <span className="text-xs text-slate-500 ml-2">
                      ({groups.length} 个可用)
                    </span>
                  </label>
                  
                  {groups.length > 0 ? (
                    <div className="space-y-2">
                      {groups.map(group => (
                        <label
                          key={group.chatId}
                          className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={(broadcastForm.targetGroups || []).includes(group.chatId)}
                            onChange={(e) => {
                              const currentGroups = broadcastForm.targetGroups || [];
                              if (e.target.checked) {
                                setBroadcastForm({
                                  ...broadcastForm,
                                  targetGroups: [...currentGroups, group.chatId]
                                });
                              } else {
                                setBroadcastForm({
                                  ...broadcastForm,
                                  targetGroups: currentGroups.filter(id => id !== group.chatId)
                                });
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <div className="flex-1">
                            <div className="font-medium">{group.title}</div>
                            <div className="text-xs text-slate-500">
                              {group.type === 'channel' && '📢 频道'}
                              {group.type === 'supergroup' && '👥 超级群组'}
                              {group.type === 'group' && '👥 群组'}
                              {' • '}
                              {group.botStatus === 'admin' && '👑 管理员'}
                              {group.botStatus === 'member' && '👤 成员'}
                              {' • '}
                              ID: {group.chatId}
                            </div>
                          </div>
                          {group.memberCount && (
                            <div className="text-sm text-slate-600">
                              {group.memberCount} 人
                            </div>
                          )}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="font-medium text-amber-900 mb-2">📢 未检测到群组</div>
                      <div className="text-sm text-amber-700 space-y-1">
                        <div>1. 将 Bot 添加到群组或频道</div>
                        <div>2. 在群组中发送任意消息</div>
                        <div>3. 刷新此页面查看群组列表</div>
                      </div>
                      <div className="mt-3">
                        <button
                          onClick={() => fetchData()}
                          className="text-sm text-amber-700 hover:text-amber-900 underline"
                        >
                          🔄 刷新群组列表
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* 手动输入选项 */}
                  <details className="mt-3">
                    <summary className="text-sm text-blue-600 cursor-pointer hover:text-blue-700">
                      或手动输入 Chat ID
                    </summary>
                    <textarea
                      value={(broadcastForm.targetGroups || []).join('\n')}
                      onChange={(e) => setBroadcastForm({ 
                        ...broadcastForm, 
                        targetGroups: e.target.value.split('\n').filter(id => id.trim())
                      })}
                      className="w-full mt-2 px-4 py-2 border border-slate-300 rounded-lg font-mono text-sm"
                      rows={3}
                      placeholder="每行一个 Chat ID，例如：&#10;-1001234567890"
                    />
                  </details>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  {broadcastForm.contentType === 'text' ? '消息内容' : '说明文字'}
                </label>
                <textarea
                  value={broadcastForm.content}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, content: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg font-mono text-sm"
                  rows={8}
                  placeholder={
                    broadcastForm.contentType === 'text' 
                      ? "输入群发消息内容，支持 HTML 标签..." 
                      : "输入媒体说明文字（可选）..."
                  }
                />
                {broadcastForm.parseMode === 'HTML' && (
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="text-slate-600">HTML标签:</span>
                    <code className="px-2 py-1 bg-slate-100 rounded">&lt;b&gt;加粗&lt;/b&gt;</code>
                    <code className="px-2 py-1 bg-slate-100 rounded">&lt;i&gt;斜体&lt;/i&gt;</code>
                    <code className="px-2 py-1 bg-slate-100 rounded">&lt;code&gt;代码&lt;/code&gt;</code>
                    <code className="px-2 py-1 bg-slate-100 rounded">&lt;a href=""&gt;链接&lt;/a&gt;</code>
                  </div>
                )}
              </div>

              {/* 定时发送配置 */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">⏰ 定时发送（可选）</h4>
                <div>
                  <label className="block text-sm font-medium mb-2">发送时间</label>
                  <input
                    type="datetime-local"
                    value={broadcastForm.scheduledAt}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, scheduledAt: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    留空表示立即发送，设置未来时间则定时发送
                  </p>
                </div>
              </div>

              {/* 重复发送配置 */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    id="repeatEnabled"
                    checked={broadcastForm.repeatEnabled}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, repeatEnabled: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="repeatEnabled" className="font-medium cursor-pointer">
                    🔄 启用重复发送
                  </label>
                </div>

                {broadcastForm.repeatEnabled && (
                  <div className="space-y-3 ml-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">重复间隔（小时）</label>
                      <input
                        type="number"
                        min="1"
                        value={broadcastForm.repeatInterval}
                        onChange={(e) => setBroadcastForm({ ...broadcastForm, repeatInterval: parseInt(e.target.value) || 24 })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                        placeholder="24"
                      />
                      <p className="mt-1 text-xs text-slate-500">
                        例如：24 = 每天发送一次，168 = 每周发送一次
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">最大重复次数</label>
                      <input
                        type="number"
                        min="0"
                        value={broadcastForm.maxRepeatCount}
                        onChange={(e) => setBroadcastForm({ ...broadcastForm, maxRepeatCount: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                        placeholder="0"
                      />
                      <p className="mt-1 text-xs text-slate-500">
                        0 = 无限重复，大于 0 = 重复指定次数后停止
                      </p>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                      <p className="font-medium mb-1">💡 重复发送说明</p>
                      <ul className="text-xs space-y-1">
                        <li>• 首次发送后，系统会按设定的间隔自动重复发送</li>
                        <li>• 可随时在群发列表中停止重复</li>
                        <li>• 适合每日签到提醒、定期活动通知等场景</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">按钮配置（可选）</label>
                {broadcastForm.buttons.map((button, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={button.text}
                      onChange={(e) => updateButton(index, 'text', e.target.value, 'broadcast')}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded"
                      placeholder="按钮文字"
                    />
                    <select
                      value={button.type}
                      onChange={(e) => updateButton(index, 'type', e.target.value, 'broadcast')}
                      className="px-3 py-2 border border-slate-300 rounded"
                    >
                      <option value="callback">回调</option>
                      <option value="url">链接</option>
                    </select>
                    <input
                      type="text"
                      value={button.data}
                      onChange={(e) => updateButton(index, 'data', e.target.value, 'broadcast')}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded"
                      placeholder={button.type === 'url' ? 'https://...' : 'callback_data'}
                    />
                    <button
                      onClick={() => removeButton(index, 'broadcast')}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      删除
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addButton('broadcast')}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  + 添加按钮
                </button>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={saveBroadcast}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? '保存中...' : (editingBroadcast ? '更新' : '创建')}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default TelegramManagePage;
