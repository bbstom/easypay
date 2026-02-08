import { useState, useEffect } from 'react';
import axios from 'axios';

const BroadcastSchedulerConfig = () => {
  const [config, setConfig] = useState(null);
  const [intervalMinutes, setIntervalMinutes] = useState(5);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 加载配置
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/telegram/broadcast-scheduler/config`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConfig(response.data);
      setIntervalMinutes(response.data.intervalMinutes);
    } catch (error) {
      console.error('加载配置失败:', error);
    }
  };

  // 更新配置
  const handleUpdateConfig = async () => {
    if (intervalMinutes < 1 || intervalMinutes > 1440) {
      setMessage('检查间隔必须在 1-1440 分钟之间');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/telegram/broadcast-scheduler/config`,
        { intervalMinutes },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setConfig(response.data.config);
      setMessage('✅ 配置已更新');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ 更新失败: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  // 手动触发检查
  const handleManualCheck = async () => {
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/telegram/broadcast-scheduler/check`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage('✅ 已触发检查，请查看服务器日志');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ 触发失败: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  // 预设选项
  const presets = [
    { label: '1 分钟', value: 1 },
    { label: '5 分钟', value: 5 },
    { label: '10 分钟', value: 10 },
    { label: '15 分钟', value: 15 },
    { label: '30 分钟', value: 30 },
    { label: '1 小时', value: 60 },
    { label: '2 小时', value: 120 },
    { label: '6 小时', value: 360 },
    { label: '12 小时', value: 720 },
    { label: '24 小时', value: 1440 }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">群发定时器配置</h3>

      {/* 当前状态 */}
      {config && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">运行状态</p>
              <p className="text-lg font-semibold">
                {config.isRunning ? (
                  <span className="text-green-600">● 运行中</span>
                ) : (
                  <span className="text-red-600">● 已停止</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">检查间隔</p>
              <p className="text-lg font-semibold">
                {config.intervalMinutes} 分钟
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 配置表单 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            检查间隔（分钟）
          </label>
          <input
            type="number"
            min="1"
            max="1440"
            value={intervalMinutes}
            onChange={(e) => setIntervalMinutes(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="输入 1-1440 之间的数字"
          />
          <p className="mt-1 text-sm text-gray-500">
            范围：1 分钟 - 1440 分钟（24 小时）
          </p>
        </div>

        {/* 预设选项 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            快速选择
          </label>
          <div className="grid grid-cols-5 gap-2">
            {presets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setIntervalMinutes(preset.value)}
                className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                  intervalMinutes === preset.value
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <button
            onClick={handleUpdateConfig}
            disabled={loading}
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
          >
            {loading ? '更新中...' : '更新配置'}
          </button>
          <button
            onClick={handleManualCheck}
            disabled={loading}
            className="flex-1 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:bg-gray-400 transition-colors"
          >
            {loading ? '检查中...' : '立即检查'}
          </button>
        </div>

        {/* 消息提示 */}
        {message && (
          <div className={`p-3 rounded-md ${
            message.startsWith('✅') 
              ? 'bg-green-50 text-green-800' 
              : 'bg-red-50 text-red-800'
          }`}>
            {message}
          </div>
        )}
      </div>

      {/* 说明 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">💡 使用说明</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 定时器会按设定的间隔自动检查待发送的群发任务</li>
          <li>• 间隔越短，发送时间越精确，但会增加服务器负载</li>
          <li>• 建议根据实际需求设置：
            <ul className="ml-4 mt-1">
              <li>- 精确定时（误差 ±1 分钟）：设置 1-2 分钟</li>
              <li>- 一般定时（误差 ±5 分钟）：设置 5-10 分钟</li>
              <li>- 低频定时（误差 ±30 分钟）：设置 30-60 分钟</li>
            </ul>
          </li>
          <li>• 点击"立即检查"可手动触发一次检查，不影响定时器</li>
          <li>• 更新配置后，定时器会自动重启</li>
        </ul>
      </div>
    </div>
  );
};

export default BroadcastSchedulerConfig;
