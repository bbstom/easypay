# 闪兑实时汇率 - 快速指南

## ✅ 已完成

闪兑汇率系统已成功改为直接从交易所获取 USDT/TRX 汇率，不再依赖代付系统的 CNY 汇率计算。

## 🎯 核心改进

### 1. 独立的汇率获取
- **主API**: Binance - `https://api.binance.com/api/v3/ticker/price?symbol=TRXUSDT`
- **备用API**: CoinGecko - `https://api.coingecko.com/api/v3/simple/price`
- **默认值**: 6.7 TRX/USDT（当所有API都失败时使用）

### 2. 两种汇率模式

#### 实时模式（推荐）
- 每次用户创建订单时，实时从 Binance 获取 TRX/USDT 交易对价格
- 如果 Binance 失败，自动切换到 CoinGecko
- 确保汇率始终是最新的市场价格

#### 手动模式
- 管理员手动设置 1 USDT = X TRX
- 适合需要固定汇率的场景

### 3. 汇率加成
- 可设置加成百分比（如 2%）
- 用户实际得到的 TRX = 基础汇率 × (1 - 加成%)
- 示例：基础汇率 6.7，加成 2%，用户得到 6.566 TRX

## 📁 修改的文件

### 后端
- `server/services/swapService.js`
  - 新增 `fetchSwapRateFromAPI()` - 从 Binance 获取汇率
  - 新增 `fetchSwapRateFromBackupAPI()` - 从 CoinGecko 获取汇率
  - 修改 `getSwapRate()` - 实时模式直接调用 API

### 前端
- `src/pages/SwapSystemPage.jsx`
  - 更新汇率设置说明文字
  - 添加实时模式详细说明
  - 修改"系统配置"为"限额配置"
  
- `src/components/AdminLayout.jsx`
  - 闪兑系统菜单：汇率设置 + 限额配置

### 数据模型
- `server/models/Settings.js`
  - `swapRateMode`: 'realtime' | 'manual'
  - `swapRateUSDTtoTRX`: 手动模式的汇率
  - `swapRateMarkup`: 汇率加成百分比

## 🔧 使用方法

### 管理后台配置

1. 进入 **闪兑系统 > 汇率设置**

2. 选择汇率模式：
   - **实时汇率**（推荐）：自动从 Binance 获取
   - **手动设置**：自己设定固定汇率

3. 设置汇率加成（可选）：
   - 例如设置 2%，用户换到的 TRX 会减少 2%

4. 进入 **闪兑系统 > 限额配置**：
   - 设置最小/最大兑换金额
   - 设置订单超时时间

## 📊 汇率计算示例

### 实时模式
```
1. 从 Binance 获取: 1 USDT = 6.7 TRX
2. 应用加成 2%: 6.7 × (1 - 0.02) = 6.566 TRX
3. 用户用 100 USDT 换到: 656.6 TRX
```

### 手动模式
```
1. 管理员设置: 1 USDT = 6.5 TRX
2. 应用加成 2%: 6.5 × (1 - 0.02) = 6.37 TRX
3. 用户用 100 USDT 换到: 637 TRX
```

## 🔄 API 容错机制

```
尝试 Binance API
    ↓ 失败
尝试 CoinGecko API
    ↓ 失败
使用默认值 6.7 TRX/USDT
```

## ⚠️ 重要说明

### 汇率独立性
- **代付汇率**: USDT = X CNY, TRX = X CNY（用于计算人民币支付金额）
- **闪兑汇率**: 1 USDT = X TRX（直接从交易所获取，完全独立）

### API 限制
- Binance API 无需认证，但有请求频率限制
- CoinGecko 免费版有请求限制
- 建议使用实时模式，因为只在用户创建订单时才调用 API

## 🎉 完成状态

✅ 闪兑汇率直接从交易所获取  
✅ Binance + CoinGecko 双重备份  
✅ 实时模式和手动模式  
✅ 汇率加成配置  
✅ 前端界面优化  
✅ 菜单名称修正（限额配置）

---

**更新时间**: 2024-01-31  
**状态**: 已完成并测试通过
