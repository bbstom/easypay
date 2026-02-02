# FAQ（常见问题）功能实现完成

## ✅ 已完成功能

### 1. 后端实现

#### 数据模型 (`server/models/FAQ.js`)
- 问题标题
- 答案内容（支持HTML）
- 分类
- 排序
- 启用/禁用状态
- 浏览次数统计

#### API 接口 (`server/routes/faq.js`)
**公开接口**：
- `GET /api/faq` - 获取FAQ列表
- `GET /api/faq/categories` - 获取所有分类
- `GET /api/faq/:id` - 获取单个FAQ详情（自动增加浏览次数）

**管理员接口**：
- `GET /api/faq/admin/list` - 获取所有FAQ（包括禁用的）
- `POST /api/faq` - 创建FAQ
- `PUT /api/faq/:id` - 更新FAQ
- `DELETE /api/faq/:id` - 删除FAQ

### 2. 前端实现

#### 管理员页面 (`/faq-manage`)
**功能**：
- ✅ FAQ列表展示
- ✅ 添加FAQ
- ✅ 编辑FAQ
- ✅ 删除FAQ
- ✅ 启用/禁用FAQ
- ✅ 分类管理
- ✅ 排序设置
- ✅ 浏览次数统计

**编辑器支持**：
- 文字内容
- HTML格式
- 图片（通过 `<img>` 标签）
- 链接（通过 `<a>` 标签）

#### 用户页面 (`/faq`)
**功能**：
- ✅ FAQ列表展示（卡片式布局）
- ✅ 分类筛选
- ✅ 折叠/展开答案
- ✅ 响应式设计
- ✅ 美观的UI设计

### 3. 路由配置

**已添加路由**：
- `/faq` - 用户FAQ页面（公开访问）
- `/faq-manage` - 管理员FAQ管理页面（需要管理员权限）

**菜单位置**：
- 管理后台侧边栏：常见问题

## 使用指南

### 管理员操作

1. **添加FAQ**：
   - 进入"常见问题"管理页面
   - 点击"添加FAQ"按钮
   - 填写问题和答案
   - 设置分类和排序
   - 保存

2. **编辑FAQ**：
   - 点击FAQ卡片上的编辑按钮
   - 修改内容
   - 保存

3. **删除FAQ**：
   - 点击FAQ卡片上的删除按钮
   - 确认删除

4. **启用/禁用FAQ**：
   - 点击FAQ卡片上的眼睛图标
   - 禁用的FAQ不会在用户页面显示

### 内容格式示例

**纯文字**：
```
这是一个简单的答案。
```

**带链接**：
```
访问我们的 <a href="https://example.com" target="_blank">官方网站</a> 了解更多。
```

**带图片**：
```
<img src="https://example.com/image.jpg" alt="示例图片" style="max-width: 100%; height: auto;" />
```

**混合内容**：
```
这是答案的第一段。

<img src="https://example.com/image.jpg" alt="图片" style="max-width: 100%;" />

这是第二段，包含一个 <a href="https://example.com" target="_blank">链接</a>。
```

## 技术特点

1. **富文本支持**：答案支持HTML格式，可以插入图片、链接等
2. **分类管理**：自动提取所有分类，支持分类筛选
3. **排序功能**：通过order字段控制显示顺序
4. **浏览统计**：自动记录每个FAQ的浏览次数
5. **响应式设计**：适配各种屏幕尺寸
6. **安全性**：管理接口需要管理员权限

## 数据库字段

```javascript
{
  question: String,      // 问题
  answer: String,        // 答案（支持HTML）
  category: String,      // 分类
  order: Number,         // 排序（数字越小越靠前）
  enabled: Boolean,      // 是否启用
  views: Number,         // 浏览次数
  createdAt: Date,       // 创建时间
  updatedAt: Date        // 更新时间
}
```

## 注意事项

1. **HTML安全**：答案内容使用 `dangerouslySetInnerHTML`，请确保只有管理员可以编辑
2. **图片链接**：建议使用HTTPS链接，确保图片可以正常加载
3. **排序规则**：order值越小越靠前，相同order按创建时间倒序
4. **分类命名**：建议使用简短的中文名称，如"支付问题"、"账户问题"等

## 后续优化建议

1. 添加富文本编辑器（如TinyMCE、Quill）
2. 添加图片上传功能
3. 添加搜索功能
4. 添加FAQ点赞/有用统计
5. 添加相关FAQ推荐
6. 添加FAQ导出功能

---

**实现完成时间**: 2026-01-30
**版本**: 1.0.0
**状态**: ✅ 生产就绪
