# CatFee API 能量购买集成指南

## 概述

已成功集成 CatFee API 来购买 TRON 能量，作为原有转账租赁方式的补充。

## 后端实现

### 1. CatFee 服务 (`server/services/catfeeService.js`)

**认证方式**: HMAC-SHA256 签名认证

**API Key 格式**: `api_key:api_secret`

提供以下功能：
- `setApiKey(apiKeyWithSecret)` - 设置 API Key 和 Secret（格式: "key:secret"）
- `buyEnergy(address, amount, duration)` - 购买能量（duration 为字符串: "1h" 或 "3h"）
- `queryOrder(orderNo)` - 查询订单状态
- `getPrice(amount, duration)` - 获取能量价格
- `getBalance()` - 获取账户余额

**签名生成**:
```javascript
const signString = timestamp + method + requestPath;
const signature = crypto.createHmac('sha256', apiSecret)
                       .update(signString)
                       .digest('base64');
```

**请求头**:
```javascript
{
  'Content-Type': 'application/json',
  'CF-ACCESS-KEY': apiKey,
  'CF-ACCESS-SIGN': signature,
  'CF-ACCESS-TIMESTAMP': timestamp
}
```

### 2. Settings 模型更新

新增字段：
```javascript
energyRentalMode: 'transfer' | 'catfee'  // 租赁模式
catfeeApiKey: String                      // CatFee API Key
catfeeEnergyFirst: Number                 // 首次转账需要的能量（默认131000）
catfeeEnergyNormal: Number                // 正常转账需要的能量（默认65000）
catfeePeriod: Number                      // 租赁时长（小时）：1 或 3
```

### 3. TronService 更新

- `rentEnergy()` - 根据模式选择租赁方式
- `rentEnergyViaTransfer()` - 转账方式（原有）
- `rentEnergyViaCatFee()` - API 购买方式（新增）

## 前端配置界面

需要在 `src/pages/WalletConfigPage.jsx` 的资源配置标签中添加以下内容：

### 1. State 更新

```javascript
const [config, setConfig] = useState({
  // ... 现有字段
  energyRentalMode: 'transfer',
  catfeeApiKey: '',
  catfeeEnergyFirst: 131000,
  catfeeEnergyNormal: 65000,
  catfeePeriod: 1
});
```

### 2. UI 组件（添加到能量租赁配置中）

```jsx
{config.energyRentalEnabled && (
  <>
    {/* 租赁模式选择 */}
    <div className="mb-6">
      <label className="text-sm font-bold text-slate-700 block mb-2">租赁模式</label>
      <select
        value={config.energyRentalMode}
        onChange={(e) => setConfig({ ...config, energyRentalMode: e.target.value })}
        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-cyan-500 outline-none"
      >
        <option value="transfer">转账租赁（向指定地址转账）</option>
        <option value="catfee">API 购买（CatFee 平台）</option>
      </select>
      <p className="text-xs text-slate-500 mt-1">
        {config.energyRentalMode === 'transfer' 
          ? '向能量服务商地址转账 TRX 来租赁能量' 
          : '通过 CatFee API 直接购买能量，更快更稳定'}
      </p>
    </div>

    {/* 转账模式配置 */}
    {config.energyRentalMode === 'transfer' && (
      <>
        <div className="mb-6">
          <label className="text-sm font-bold text-slate-700 block mb-2">租赁服务商地址</label>
          <input
            type="text"
            value={config.energyRentalAddress}
            onChange={(e) => setConfig({ ...config, energyRentalAddress: e.target.value })}
            placeholder="输入能量租赁服务商的 TRON 地址"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-cyan-500 outline-none"
          />
        </div>

        <div className="mb-6">
          <label className="text-sm font-bold text-slate-700 block mb-2">首次转账租赁金额（TRX）</label>
          <input
            type="number"
            min="1"
            value={config.energyRentalAmountFirst}
            onChange={(e) => setConfig({ ...config, energyRentalAmountFirst: parseInt(e.target.value) })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
          />
        </div>

        <div className="mb-6">
          <label className="text-sm font-bold text-slate-700 block mb-2">正常转账租赁金额（TRX）</label>
          <input
            type="number"
            min="1"
            value={config.energyRentalAmountNormal}
            onChange={(e) => setConfig({ ...config, energyRentalAmountNormal: parseInt(e.target.value) })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
          />
        </div>

        <div className="mb-6">
          <label className="text-sm font-bold text-slate-700 block mb-2">等待时间（秒）</label>
          <input
            type="number"
            min="10"
            value={config.energyRentalWaitTime}
            onChange={(e) => setConfig({ ...config, energyRentalWaitTime: parseInt(e.target.value) })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
          />
        </div>
      </>
    )}

    {/* CatFee 模式配置 */}
    {config.energyRentalMode === 'catfee' && (
      <>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900 mb-2">
            💡 <strong>CatFee 能量购买：</strong>通过 API 直接购买能量，无需等待，更加稳定。
          </p>
          <p className="text-sm text-blue-800">
            📖 <a href="https://docs.catfee.io" target="_blank" rel="noopener noreferrer" className="underline">
              查看 CatFee 文档
            </a> 获取 API Key
          </p>
        </div>

        <div className="mb-6">
          <label className="text-sm font-bold text-slate-700 block mb-2">CatFee API Key</label>
          <input
            type="text"
            value={config.catfeeApiKey}
            onChange={(e) => setConfig({ ...config, catfeeApiKey: e.target.value })}
            placeholder="输入 CatFee API Key"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-cyan-500 outline-none"
          />
          <p className="text-xs text-slate-500 mt-1">
            在 CatFee 平台注册并获取 API Key
          </p>
        </div>

        <div className="mb-6">
          <label className="text-sm font-bold text-slate-700 block mb-2">首次转账能量（Energy）</label>
          <input
            type="number"
            min="10000"
            step="1000"
            value={config.catfeeEnergyFirst}
            onChange={(e) => setConfig({ ...config, catfeeEnergyFirst: parseInt(e.target.value) })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
          />
          <p className="text-xs text-slate-500 mt-1">
            目标地址无 USDT 时购买的能量（建议 131000）
          </p>
        </div>

        <div className="mb-6">
          <label className="text-sm font-bold text-slate-700 block mb-2">正常转账能量（Energy）</label>
          <input
            type="number"
            min="10000"
            step="1000"
            value={config.catfeeEnergyNormal}
            onChange={(e) => setConfig({ ...config, catfeeEnergyNormal: parseInt(e.target.value) })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
          />
          <p className="text-xs text-slate-500 mt-1">
            目标地址有 USDT 时购买的能量（建议 65000）
          </p>
        </div>

        <div className="mb-6">
          <label className="text-sm font-bold text-slate-700 block mb-2">租赁时长</label>
          <select
            value={config.catfeePeriod}
            onChange={(e) => setConfig({ ...config, catfeePeriod: parseInt(e.target.value) })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-cyan-500 outline-none"
          >
            <option value="1">1 小时</option>
            <option value="3">3 小时</option>
          </select>
          <p className="text-xs text-slate-500 mt-1">
            能量的有效期，建议选择 1 小时
          </p>
        </div>
      </>
    )}

    <div className="flex gap-4">
      <button
        onClick={handleSave}
        disabled={loading}
        className="flex-1 bg-[#00A3FF] hover:bg-[#0086D1] text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
      >
        {loading ? (
          <>
            <RefreshCw size={18} className="animate-spin" />
            保存中...
          </>
        ) : (
          '保存配置'
        )}
      </button>
    </div>
  </>
)}
```

## 使用流程

### 转账模式（原有）
1. 配置租赁服务商地址
2. 设置租赁金额
3. 系统向服务商转账 TRX
4. 等待能量到账

### CatFee 模式（新增）
1. 在 CatFee 平台注册并获取 API Key
2. 配置 API Key
3. 设置需要购买的能量数量
4. 系统通过 API 直接购买
5. 能量快速到账（约 10 秒）

## 优势对比

| 特性 | 转账模式 | CatFee 模式 |
|------|---------|------------|
| 速度 | 较慢（30秒+） | 快速（10秒） |
| 稳定性 | 依赖服务商 | API 稳定 |
| 配置 | 需要地址 | 需要 API Key |
| 成本 | 固定 TRX | 按能量计费 |
| 灵活性 | 固定金额 | 精确能量 |

## 测试

### 1. 测试 CatFee 连接

创建测试脚本 `server/scripts/testCatFee.js`：

```javascript
const catfeeService = require('../services/catfeeService');
require('dotenv').config();

async function test() {
  const apiKey = 'your_api_key_here';
  catfeeService.setApiKey(apiKey);

  // 测试获取余额
  const balance = await catfeeService.getBalance();
  console.log('余额:', balance);

  // 测试获取价格
  const price = await catfeeService.getPrice(131000, 1);
  console.log('价格:', price);
}

test();
```

### 2. 测试能量购买

在钱包配置中：
1. 选择 "API 购买（CatFee 平台）"
2. 输入 API Key
3. 保存配置
4. 创建一个测试订单
5. 查看后端日志确认购买成功

## 注意事项

1. **API Key 安全**：不要在前端暴露 API Key
2. **余额充足**：确保 CatFee 账户有足够余额
3. **能量数量**：根据实际需求调整能量数量
4. **租赁时长**：1小时通常足够，3小时用于高峰期
5. **错误处理**：API 失败时会自动回退到使用 TRX 支付手续费

## 文档链接

- CatFee 官方文档：https://docs.catfee.io
- API 文档：https://docs.catfee.io/getting-started/buy-energy-via-api-on-catfee/php
