import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, RefreshCw, Power, GripVertical, Command } from 'lucide-react';
import axios from 'axios';

const TelegramCommandsManager = () => {
  const [commands, setCommands] = useState([]);
  const [functions, setFunctions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCommand, setEditingCommand] = useState(null);
  const [formData, setFormData] = useState({
    command: '',
    description: '',
    action: 'callback',
    callbackData: '',
    responseText: '',
    functionName: '',
    enabled: true,
    showInMenu: true,
    order: 0,
    icon: ''
  });

  useEffect(() => {
    fetchCommands();
    fetchFunctions();
  }, []);

  const fetchCommands = async () => {
    try {
      const { data } = await axios.get('/api/telegram-commands');
      setCommands(data.commands || []);
    } catch (error) {
      console.error('获取命令列表失败:', error);
      alert('获取命令列表失败');
    }
  };

  const fetchFunctions = async () => {
    try {
      const { data } = await axios.get('/api/telegram-commands/functions/list');
      setFunctions(data.functions || []);
    } catch (error) {
      console.error('获取函数列表失败:', error);
    }
  };

  const handleCreate = () => {
    setEditingCommand(null);
    setFormData({
      command: '',
      description: '',
      action: 'callback',
      callbackData: '',
      responseText: '',
      functionName: '',
      enabled: true,
      showInMenu: true,
      order: commands.length,
      icon: ''
    });
    setShowModal(true);
  };

  const handleEdit = (command) => {
    setEditingCommand(command);
    setFormData({
      command: command.command,
      description: command.description,
      action: command.action,
      callbackData: command.callbackData || '',
      responseText: command.responseText || '',
      functionName: command.functionName || '',
      enabled: command.enabled,
      showInMenu: command.showInMenu,
      order: command.order,
      icon: command.icon || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingCommand) {
        await axios.put(`/api/telegram-commands/${editingCommand._id}`, formData);
        alert('命令更新成功');
      } else {
        await axios.post('/api/telegram-commands', formData);
        alert('命令创建成功');
      }
      setShowModal(false);
      fetchCommands();
    } catch (error) {
      console.error('保存命令失败:', error);
      alert(error.response?.data?.error || '保存命令失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('确定要删除这个命令吗？')) return;

    try {
      await axios.delete(`/api/telegram-commands/${id}`);
      alert('命令删除成功');
      fetchCommands();
    } catch (error) {
      console.error('删除命令失败:', error);
      alert('删除命令失败');
    }
  };

  const handleToggle = async (id) => {
    try {
      await axios.post(`/api/telegram-commands/${id}/toggle`);
      fetchCommands();
    } catch (error) {
      console.error('切换命令状态失败:', error);
      alert('切换命令状态失败');
    }
  };

  const handleReload = async () => {
    if (!confirm('确定要重新加载所有命令到 Telegram 吗？')) return;

    setLoading(true);
    try {
      await axios.post('/api/telegram-commands/reload');
      alert('命令已重新加载到 Telegram');
    } catch (error) {
      console.error('重新加载命令失败:', error);
      alert('重新加载命令失败');
    } finally {
      setLoading(false);
    }
  };

  const getActionLabel = (action) => {
    const labels = {
      callback: '回调动作',
      text: '文本回复',
      function: '函数调用'
    };
    return labels[action] || action;
  };

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">快捷指令管理</h2>
          <p className="text-sm text-slate-600 mt-1">
            管理 Telegram Bot 左下角的快捷指令菜单
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReload}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            重新加载到 Bot
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
          >
            <Plus size={16} />
            添加命令
          </button>
        </div>
      </div>

      {/* 说明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Command className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-blue-900">
            <p className="font-bold mb-1">快捷指令说明</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>快捷指令会显示在 Telegram 输入框左下角的菜单按钮中</li>
              <li>用户可以通过点击菜单或直接输入 /命令 来触发</li>
              <li>命令格式：只能包含小写字母、数字和下划线，不能以数字开头</li>
              <li>修改后需要点击"重新加载到 Bot"按钮才能生效</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 命令列表 */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">排序</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">命令</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">描述</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">动作类型</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">状态</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">显示</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {commands.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                    暂无命令，点击"添加命令"创建第一个快捷指令
                  </td>
                </tr>
              ) : (
                commands.map((command) => (
                  <tr key={command._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <GripVertical size={16} className="text-slate-400" />
                        <span className="text-sm text-slate-600">{command.order}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {command.icon && <span>{command.icon}</span>}
                        <code className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">
                          /{command.command}
                        </code>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-700">{command.description}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {getActionLabel(command.action)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(command._id)}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                          command.enabled
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Power size={12} />
                        {command.enabled ? '启用' : '禁用'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs ${command.showInMenu ? 'text-green-600' : 'text-slate-400'}`}>
                        {command.showInMenu ? '✓ 显示' : '✗ 隐藏'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(command)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="编辑"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(command._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="删除"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 编辑/创建模态框 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">
                {editingCommand ? '编辑命令' : '添加命令'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* 命令名称 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  命令名称 *
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">/</span>
                  <input
                    type="text"
                    value={formData.command}
                    onChange={(e) => setFormData({ ...formData, command: e.target.value.toLowerCase() })}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="例如: start, menu, help"
                    pattern="[a-z][a-z0-9_]*"
                    required
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  只能包含小写字母、数字和下划线，不能以数字开头
                </p>
              </div>

              {/* 描述 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  描述 *
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="例如: 启动机器人"
                  maxLength={256}
                  required
                />
              </div>

              {/* 图标 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  图标（可选）
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="例如: 🚀 💰 ⚡"
                />
              </div>

              {/* 动作类型 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  动作类型 *
                </label>
                <select
                  value={formData.action}
                  onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                >
                  <option value="callback">回调动作（触发按钮点击）</option>
                  <option value="text">文本回复（发送固定文本）</option>
                  <option value="function">函数调用（执行特定功能）</option>
                </select>
              </div>

              {/* 根据动作类型显示不同字段 */}
              {formData.action === 'callback' && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Callback Data *
                  </label>
                  <input
                    type="text"
                    value={formData.callbackData}
                    onChange={(e) => setFormData({ ...formData, callbackData: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="例如: payment, energy, swap"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    触发的回调数据，对应按钮的 callback_data
                  </p>
                </div>
              )}

              {formData.action === 'text' && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    回复文本 *
                  </label>
                  <textarea
                    value={formData.responseText}
                    onChange={(e) => setFormData({ ...formData, responseText: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="输入要回复的文本内容，支持 HTML 格式"
                    rows={4}
                    required
                  />
                </div>
              )}

              {formData.action === 'function' && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    函数名称 *
                  </label>
                  <select
                    value={formData.functionName}
                    onChange={(e) => setFormData({ ...formData, functionName: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  >
                    <option value="">选择函数</option>
                    {functions.map((func) => (
                      <option key={func.name} value={func.name}>
                        {func.name} - {func.description}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 排序 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  排序
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  min={0}
                />
                <p className="text-xs text-slate-500 mt-1">
                  数字越小越靠前
                </p>
              </div>

              {/* 开关选项 */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500"
                  />
                  <span className="text-sm text-slate-700">启用命令</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.showInMenu}
                    onChange={(e) => setFormData({ ...formData, showInMenu: e.target.checked })}
                    className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500"
                  />
                  <span className="text-sm text-slate-700">显示在菜单中</span>
                </label>
              </div>

              {/* 按钮 */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50"
                >
                  <Save size={16} />
                  {loading ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TelegramCommandsManager;
