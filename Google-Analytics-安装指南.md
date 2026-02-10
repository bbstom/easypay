# Google Analytics 4 安装指南

## ✅ 已完成的准备工作

- ✅ 创建了 `src/components/GoogleAnalytics.jsx` 组件
- ✅ 组件支持从环境变量读取测量 ID
- ✅ 组件使用 React Helmet Async 注入脚本

---

## 📋 安装步骤

### 步骤 1：创建 Google Analytics 账号

1. **访问 Google Analytics**
   ```
   https://analytics.google.com
   ```

2. **登录 Google 账号**
   - 使用你的 Google 账号登录
   - 如果没有账号，先注册一个

3. **开始设置**
   - 点击"开始测量"按钮

---

### 步骤 2：创建账号和资源

#### 2.1 账号设置

1. **账号名称**：`EasyPay`
2. **账号数据共享设置**（根据需要勾选）：
   - ✅ Google 产品和服务
   - ✅ 基准化分析
   - ✅ 技术支持
   - ⬜ 账号专家（可选）

3. 点击"下一步"

#### 2.2 资源设置

1. **资源名称**：`EasyPay 网站`
2. **报告时区**：`(GMT+08:00) 中国标准时间 - 北京`
3. **货币**：`人民币 (CNY ¥)`

4. 点击"下一步"

#### 2.3 业务信息

1. **行业类别**：`金融` 或 `技术`
2. **业务规模**：根据实际情况选择
   - 小型（1-10 名员工）
   - 中型（11-100 名员工）
   - 大型（100+ 名员工）

3. **业务目标**（可多选）：
   - ✅ 获取基准报告
   - ✅ 衡量客户互动度
   - ✅ 优化广告投资回报率

4. 点击"创建"

5. **接受服务条款**
   - 选择国家/地区：中国
   - 阅读并接受条款
   - 点击"我接受"

---

### 步骤 3：设置数据流

#### 3.1 创建数据流

1. 选择平台：**网站**

2. 填写网站信息：
   - **网站网址**：`https://dd.vpno.eu.org`
   - **数据流名称**：`EasyPay 主站`

3. **增强型衡量**（建议全部开启）：
   - ✅ 网页浏览量
   - ✅ 滚动次数
   - ✅ 出站点击次数
   - ✅ 网站搜索
   - ✅ 视频互动
   - ✅ 文件下载

4. 点击"创建数据流"

#### 3.2 获取测量 ID

创建成功后，你会看到：

```
数据流详情
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
数据流名称：EasyPay 主站
数据流网址：https://dd.vpno.eu.org
数据流 ID：1234567890
测量 ID：G-XXXXXXXXXX  ← 这就是你需要的！
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**重要**：复制这个 `G-XXXXXXXXXX` 格式的测量 ID！

---

### 步骤 4：配置项目

#### 4.1 添加到环境变量

编辑 `.env` 文件，添加：

```bash
# Google Analytics 4 测量 ID
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**注意**：
- 将 `G-XXXXXXXXXX` 替换为你的实际测量 ID
- 不要提交 `.env` 到 Git（已在 .gitignore 中）

#### 4.2 更新 .env.example

编辑 `.env.example`，添加示例：

```bash
# Google Analytics 4 测量 ID
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

#### 4.3 在 App.jsx 中使用

编辑 `src/App.jsx`，导入并使用 GoogleAnalytics 组件：

```javascript
import { HelmetProvider } from 'react-helmet-async';
import GoogleAnalytics from './components/GoogleAnalytics';

function App() {
  return (
    <HelmetProvider>
      <GoogleAnalytics />
      {/* 其他组件 */}
    </HelmetProvider>
  );
}

export default App;
```

---

### 步骤 5：测试验证

#### 5.1 本地测试

1. **启动开发服务器**
   ```bash
   npm run dev
   ```

2. **打开浏览器**
   ```
   http://localhost:5173
   ```

3. **检查控制台**
   - 按 F12 打开开发者工具
   - 查看 Console 标签
   - 应该看到 Google Analytics 脚本加载成功
   - 不应该有错误信息

4. **检查网络请求**
   - 切换到 Network 标签
   - 刷新页面
   - 搜索 `gtag` 或 `google-analytics`
   - 应该看到请求发送到 Google Analytics

#### 5.2 实时报告验证

1. **访问 Google Analytics**
   ```
   https://analytics.google.com
   ```

2. **查看实时报告**
   - 左侧菜单：报告 → 实时
   - 或直接访问：报告 → 实时 → 概览

3. **验证数据**
   - 应该看到"过去 30 分钟的用户数"显示为 1
   - 查看"按网页标题和屏幕名称"，应该看到你访问的页面
   - 查看"按国家/地区"，应该看到你的位置

4. **多页面测试**
   - 在网站上浏览多个页面
   - 实时报告应该显示页面浏览量增加

---

### 步骤 6：部署到生产环境

#### 6.1 配置生产环境变量

在服务器上设置环境变量：

```bash
# 方式 1：直接在服务器的 .env 文件中添加
echo "VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX" >> .env

# 方式 2：使用 PM2 ecosystem 配置
# 编辑 ecosystem.config.js
module.exports = {
  apps: [{
    name: 'easypay',
    env: {
      VITE_GA_MEASUREMENT_ID: 'G-XXXXXXXXXX'
    }
  }]
};
```

#### 6.2 构建和部署

```bash
# 构建生产版本
npm run build

# 部署
./deploy.sh
# 或
./DEPLOY_NOW.sh
```

#### 6.3 验证生产环境

1. **访问生产网站**
   ```
   https://dd.vpno.eu.org
   ```

2. **检查 GA 脚本**
   - 按 F12 打开开发者工具
   - 查看 Network 标签
   - 确认 Google Analytics 脚本加载

3. **查看实时报告**
   - 在 Google Analytics 中查看实时报告
   - 应该看到生产环境的访问数据

---

## 📊 Google Analytics 功能介绍

### 1. 实时报告

**位置**：报告 → 实时

**功能**：
- 查看当前在线用户数
- 查看用户正在浏览的页面
- 查看用户来源（搜索引擎、直接访问等）
- 查看用户地理位置

**使用场景**：
- 验证 GA 是否正常工作
- 监控营销活动效果
- 查看突发流量

---

### 2. 流量获取报告

**位置**：报告 → 生命周期 → 流量获取

**功能**：
- 查看用户来源渠道（自然搜索、直接访问、社交媒体等）
- 分析各渠道的用户数、会话数、转化率
- 对比不同渠道的效果

**关键指标**：
- **用户数**：访问网站的独立用户数
- **会话数**：用户访问网站的次数
- **互动率**：用户与网站互动的比例
- **平均互动时长**：用户在网站停留的平均时间

---

### 3. 网页和屏幕报告

**位置**：报告 → 生命周期 → 互动度 → 网页和屏幕

**功能**：
- 查看各页面的浏览量
- 分析用户在各页面的停留时间
- 识别最受欢迎的页面
- 发现需要优化的页面

**关键指标**：
- **浏览量**：页面被查看的次数
- **用户数**：访问该页面的独立用户数
- **平均互动时长**：用户在该页面停留的平均时间
- **跳出率**：只浏览一个页面就离开的比例

---

### 4. 事件报告

**位置**：报告 → 生命周期 → 互动度 → 事件

**功能**：
- 查看用户触发的事件（点击、滚动、下载等）
- 分析用户行为模式
- 追踪转化目标

**默认事件**（增强型衡量自动追踪）：
- `page_view`：页面浏览
- `scroll`：滚动到页面底部
- `click`：出站链接点击
- `file_download`：文件下载
- `video_start`：视频播放

---

### 5. 转化报告

**位置**：报告 → 生命周期 → 转化

**功能**：
- 追踪业务目标完成情况
- 分析转化路径
- 优化转化率

**常见转化目标**：
- 用户注册
- 订单提交
- 联系表单提交
- 文件下载

---

## 🎯 自定义事件追踪（可选）

如果你想追踪特定的用户行为（如按钮点击、表单提交），可以添加自定义事件：

### 示例 1：追踪按钮点击

```javascript
// 在按钮点击时发送事件
const handleButtonClick = () => {
  // 发送 GA 事件
  if (window.gtag) {
    window.gtag('event', 'button_click', {
      button_name: 'USDT 代付',
      page_location: window.location.pathname
    });
  }
  
  // 执行其他逻辑
  // ...
};

<button onClick={handleButtonClick}>
  USDT 代付
</button>
```

### 示例 2：追踪表单提交

```javascript
const handleFormSubmit = (e) => {
  e.preventDefault();
  
  // 发送 GA 事件
  if (window.gtag) {
    window.gtag('event', 'form_submit', {
      form_name: '联系表单',
      form_destination: 'contact'
    });
  }
  
  // 提交表单
  // ...
};
```

### 示例 3：追踪订单完成

```javascript
const handleOrderComplete = (orderId, amount) => {
  // 发送 GA 转化事件
  if (window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: orderId,
      value: amount,
      currency: 'CNY',
      items: [{
        item_name: 'USDT 代付',
        quantity: 1,
        price: amount
      }]
    });
  }
};
```

---

## 🔍 常见问题

### Q1: 为什么实时报告没有数据？

**可能原因**：
1. 测量 ID 配置错误
2. 浏览器安装了广告拦截插件
3. 网络问题导致脚本加载失败
4. 环境变量未正确设置

**解决方法**：
1. 检查 `.env` 文件中的测量 ID
2. 使用隐私模式或其他浏览器测试
3. 检查浏览器控制台是否有错误
4. 重启开发服务器

---

### Q2: 开发环境的数据会影响生产数据吗？

**回答**：会的。默认情况下，开发环境和生产环境使用同一个测量 ID，数据会混在一起。

**解决方法**：
1. **方案 A**：只在生产环境启用 GA
   ```javascript
   const GoogleAnalytics = () => {
     // 只在生产环境加载
     if (import.meta.env.MODE !== 'production') {
       return null;
     }
     // ...
   };
   ```

2. **方案 B**：使用不同的测量 ID
   ```bash
   # .env.development
   VITE_GA_MEASUREMENT_ID=G-DEV-ID
   
   # .env.production
   VITE_GA_MEASUREMENT_ID=G-PROD-ID
   ```

---

### Q3: 如何排除内部流量？

**方法 1：使用 IP 过滤**（推荐）

1. 在 Google Analytics 中：
   - 管理 → 数据流 → 选择你的数据流
   - 标记为内部流量 → 创建规则
   - 输入你的 IP 地址

2. 创建数据过滤器：
   - 管理 → 数据设置 → 数据过滤器
   - 创建过滤器 → 排除内部流量

**方法 2：使用浏览器扩展**

安装 Google Analytics Opt-out 扩展：
```
https://tools.google.com/dlpage/gaoptout
```

---

### Q4: 数据多久会显示在报告中？

**实时报告**：立即显示（延迟 < 1 分钟）
**标准报告**：24-48 小时后显示
**探索报告**：24-48 小时后可用

---

## ✅ 完成检查清单

### 配置阶段
- [ ] 创建 Google Analytics 账号
- [ ] 创建资源和数据流
- [ ] 获取测量 ID（G-XXXXXXXXXX）
- [ ] 添加到 `.env` 文件
- [ ] 更新 `.env.example`

### 开发阶段
- [ ] 在 App.jsx 中导入 GoogleAnalytics 组件
- [ ] 本地测试 GA 脚本加载
- [ ] 验证实时报告有数据
- [ ] 测试多个页面浏览

### 部署阶段
- [ ] 配置生产环境变量
- [ ] 构建生产版本
- [ ] 部署到服务器
- [ ] 验证生产环境 GA 正常工作

### 监控阶段
- [ ] 每天查看实时报告
- [ ] 每周查看流量获取报告
- [ ] 每月生成详细分析报告
- [ ] 根据数据优化网站

---

## 📚 相关资源

### 官方文档
- Google Analytics 4 文档：https://support.google.com/analytics
- GA4 设置指南：https://support.google.com/analytics/answer/9304153
- 事件参考：https://support.google.com/analytics/answer/9267735

### 学习资源
- Google Analytics 学院：https://analytics.google.com/analytics/academy/
- GA4 快速入门：https://skillshop.exceedlms.com/student/path/508845

---

## 🎉 下一步

完成 Google Analytics 安装后，建议：

1. **创建 OG 图片**
   - 参考 `创建OG图片指南.md`
   - 提升社交媒体分享效果

2. **监控搜索引擎收录**
   - 参考 `搜索引擎收录监控指南.md`
   - 跟踪 SEO 效果

3. **扩充页面内容**
   - 参考 `SEO后续优化计划.md`
   - 提升页面质量和排名

---

**安装完成后，记得在实时报告中验证数据！** 🎉
