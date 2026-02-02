# WalletConfigPage.jsx 修复和重构方案

## 问题诊断

当前 `src/pages/WalletConfigPage.jsx` 文件存在以下问题：
1. 文件被截断，缺少后半部分代码
2. 有语法错误：缺少 '}' 
3. 文件只有前 160 行左右的内容

## 解决方案

### 方案 1：从 Git 恢复（推荐）

如果你使用了 Git 版本控制，可以恢复文件：

```bash
# 查看文件状态
git status

# 恢复文件到最后一次提交的状态
git checkout HEAD -- src/pages/WalletConfigPage.jsx

# 或者查看文件历史
git log --oneline src/pages/WalletConfigPage.jsx

# 恢复到特定提交
git checkout <commit-hash> -- src/pages/WalletConfigPage.jsx
```

### 方案 2：手动重构（如果没有备份）

如果没有 Git 备份，需要重新创建文件。我已经在之前的对话中看到了完整的文件内容（1065行）。

## 重构步骤（恢复文件后执行）

### 步骤 1：确认文件完整性

恢复文件后，确认文件包含以下主要部分：
- [ ] 导入语句
- [ ] 状态定义
- [ ] useEffect 钩子
- [ ] 处理函数（fetchConfig, fetchBalance, handleSave, handleTest, handleValidateKey）
- [ ] 返回的 JSX（包含 AdminLayout 和所有标签内容）
- [ ] 导出语句

### 步骤 2：确认 currentSubTab 已添加

检查第 12-13 行：
```javascript
const currentTab = searchParams.get('tab') || 'status';
const currentSubTab = searchParams.get('subtab') || 'api';  // ← 确认这行存在
```

### 步骤 3：修改 AdminLayout.jsx（已完成 ✅）

文件 `src/components/AdminLayout.jsx` 已经修改：
```javascript
{ id: 'energy', icon: <Zap size={18} />, label: '能量租赁' }
```

### 步骤 4：在 WalletConfigPage.jsx 中添加子标签导航

找到基础配置标签部分（大约在第 447 行），查找：
```javascript
{/* 基础配置标签 */}
{currentTab === 'basic' && (
  <>
```

在 `<>` 之后立即添加子标签导航：

```jsx
{/* 子标签导航 */}
<div className="bg-white rounded-xl border border-slate-200 mb-6 overflow-hidden">
  <div className="flex border-b border-slate-200">
    <button
      onClick={() => setSearchParams({ tab: 'basic', subtab: 'api' })}
      className={`flex-1 px-6 py-4 text-sm font-bold transition-all ${
        currentSubTab === 'api'
          ? 'bg-[#00A3FF] text-white'
          : 'text-slate-600 hover:bg-slate-50'
      }`}
    >
      监控API配置
    </button>
    <button
      onClick={() => setSearchParams({ tab: 'basic', subtab: 'wallet' })}
      className={`flex-1 px-6 py-4 text-sm font-bold transition-all ${
        currentSubTab === 'wallet'
          ? 'bg-[#00A3FF] text-white'
          : 'text-slate-600 hover:bg-slate-50'
      }`}
    >
      钱包地址
    </button>
    <button
      onClick={() => setSearchParams({ tab: 'basic', subtab: 'transfer' })}
      className={`flex-1 px-6 py-4 text-sm font-bold transition-all ${
        currentSubTab === 'transfer'
          ? 'bg-[#00A3FF] text-white'
          : 'text-slate-600 hover:bg-slate-50'
      }`}
    >
      自动转账
    </button>
  </div>
</div>
```

### 步骤 5：重构基础配置内容

将原来的基础配置内容拆分为 3 个子标签：

#### 5.1 监控API配置子标签

```jsx
{/* 监控API配置子标签 */}
{currentSubTab === 'api' && (
  <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
    <h2 className="text-xl font-black text-slate-900 mb-6">链上监控 API 节点配置</h2>
    
    {/* 警告提示 */}
    <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
      <p className="text-xs text-amber-900">
        <strong>⚠️ 重要：</strong>请至少启用并配置一个 API 节点，否则无法进行链上查询和转账操作。
      </p>
    </div>

    {/* API 节点配置（从原来的代码中复制） */}
    <div className="space-y-4 mb-6">
      {config.tronApiNodes && config.tronApiNodes.map((node, index) => (
        // ... 节点配置卡片
      ))}
    </div>

    {/* 多节点策略说明 */}
    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-6">
      {/* ... 策略说明 */}
    </div>

    {/* 保存按钮 */}
    <div className="flex gap-4">
      <button onClick={handleSave} disabled={loading} className="...">
        保存配置
      </button>
    </div>
  </div>
)}
```

#### 5.2 钱包地址子标签

```jsx
{/* 钱包地址子标签 */}
{currentSubTab === 'wallet' && (
  <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
    <h2 className="text-xl font-black text-slate-900 mb-6">钱包地址配置</h2>

    {/* 当前钱包地址显示 */}
    {config.tronWalletAddress && (
      // ... 地址显示
    )}

    {/* 私钥输入 */}
    <div className="mb-6">
      {/* ... 私钥输入框和验证按钮 */}
    </div>

    {/* 保存和测试按钮 */}
    <div className="flex gap-4 mb-6">
      <button onClick={handleSave}>保存配置</button>
      <button onClick={handleTest}>测试连接</button>
    </div>

    {/* 测试结果 */}
    {testResult && (
      // ... 测试结果显示
    )}

    {/* 安全提示 */}
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
      {/* ... 安全提示 */}
    </div>
  </div>
)}
```

#### 5.3 自动转账子标签

```jsx
{/* 自动转账子标签 */}
{currentSubTab === 'transfer' && (
  <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
    <h2 className="text-xl font-black text-slate-900 mb-6">自动转账配置</h2>

    {/* 启用自动转账开关 */}
    <div className="mb-6 flex items-center justify-between">
      {/* ... 开关 */}
    </div>

    {/* 最大重试次数 */}
    <div className="mb-6">
      {/* ... */}
    </div>

    {/* TRX 最低余额预警 */}
    <div className="mb-6">
      {/* ... */}
    </div>

    {/* USDT 最低余额预警 */}
    <div className="mb-6">
      {/* ... */}
    </div>

    {/* 保存按钮 */}
    <div className="flex gap-4">
      <button onClick={handleSave}>保存配置</button>
    </div>
  </div>
)}
```

### 步骤 6：修改资源配置标签为能量租赁

找到资源配置标签（大约在第 642 行），将：
```javascript
{/* 资源配置标签 */}
{currentTab === 'resource' && (
```

改为：
```javascript
{/* 能量租赁标签 */}
{currentTab === 'energy' && (
```

## 验证清单

完成修改后，请验证：

- [ ] 文件没有语法错误
- [ ] 所有导入的组件都被使用
- [ ] 状态监控标签正常显示
- [ ] 基础配置标签显示 3 个子标签按钮
- [ ] 点击子标签按钮可以切换内容
- [ ] 监控API配置子标签显示 API 节点配置
- [ ] 钱包地址子标签显示私钥输入和测试功能
- [ ] 自动转账子标签显示转账配置
- [ ] 能量租赁标签（原资源配置）正常显示
- [ ] 所有保存按钮功能正常
- [ ] URL 参数正确更新（tab 和 subtab）

## 完成后

修改完成并测试通过后，即可继续进行多钱包系统阶段 2 的开发。

## 需要帮助？

如果文件无法恢复或修改遇到问题，请告诉我：
1. 是否有 Git 版本控制
2. 是否有文件备份
3. 具体遇到什么错误

我可以提供更详细的帮助或提供完整的文件内容。
