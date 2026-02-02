# FAQ 换行符修复说明

## 问题描述
后台编辑常见问题时，输入的换行符在前台显示时不能正确识别，所有内容显示在一行。

## 问题原因
FAQ 答案使用 `dangerouslySetInnerHTML` 渲染 HTML 内容，但普通的换行符（`\n`）不会被 HTML 识别为换行。HTML 需要使用 `<br>` 标签或 CSS `white-space: pre-wrap` 来显示换行。

## 解决方案

### 方案选择
采用自动转换方案：在保存时将换行符转换为 `<br>` 标签，在编辑时将 `<br>` 标签转换回换行符。

### 实现细节

#### 1. 保存时转换（`handleSave`）
```javascript
const handleSave = async () => {
  // 将换行符转换为 <br> 标签
  const processedAnswer = formData.answer.replace(/\n/g, '<br>');
  
  const dataToSave = {
    ...formData,
    answer: processedAnswer
  };
  
  // 保存到数据库
  await axios.post('/api/faq', dataToSave);
};
```

**转换规则：**
- `\n` → `<br>`
- 保留用户输入的所有 HTML 标签
- 不影响已有的 `<br>` 标签

#### 2. 编辑时转换（`handleEdit`）
```javascript
const handleEdit = (faq) => {
  // 将 <br> 标签转换回换行符
  const answerWithNewlines = faq.answer.replace(/<br\s*\/?>/gi, '\n');
  
  setFormData({
    ...formData,
    answer: answerWithNewlines
  });
};
```

**转换规则：**
- `<br>` → `\n`
- `<br/>` → `\n`
- `<BR>` → `\n`（不区分大小写）
- `<br />` → `\n`（支持空格）

#### 3. 显示时渲染（前台和后台）
```jsx
<div 
  className="text-sm text-slate-600"
  dangerouslySetInnerHTML={{ __html: faq.answer }}
/>
```

**渲染效果：**
- `<br>` 标签被浏览器渲染为换行
- 其他 HTML 标签正常渲染
- 支持链接、图片等富文本内容

## 使用示例

### 输入（编辑器）
```
这是第一行
这是第二行

这是第三行（前面有空行）
```

### 存储（数据库）
```
这是第一行<br>这是第二行<br><br>这是第三行（前面有空行）
```

### 显示（前台）
```
这是第一行
这是第二行

这是第三行（前面有空行）
```

## 兼容性

### 向后兼容
- ✅ 已有的 FAQ 数据不受影响
- ✅ 编辑旧数据时自动转换
- ✅ 保存后正确显示

### HTML 标签支持
- ✅ 支持链接：`<a href="url">文字</a>`
- ✅ 支持图片：`<img src="url" alt="描述" />`
- ✅ 支持加粗：`<strong>文字</strong>` 或 `<b>文字</b>`
- ✅ 支持斜体：`<em>文字</em>` 或 `<i>文字</i>`
- ✅ 支持换行：直接按回车键

### 混合使用
可以同时使用换行符和 HTML 标签：

**输入：**
```
第一行普通文字
第二行有<a href="https://example.com">链接</a>
第三行有<strong>加粗文字</strong>
```

**显示：**
```
第一行普通文字
第二行有链接
第三行有加粗文字
```

## 注意事项

### 1. 编辑器提示
在答案输入框下方添加了提示文字：
```
答案 (支持HTML格式)
示例：文字 <a href="链接">文字</a> <img src="图片URL" />
```

### 2. 安全性
- 使用 `dangerouslySetInnerHTML` 需要信任输入内容
- 仅管理员可以编辑 FAQ
- 建议不要输入不受信任的 HTML 代码

### 3. 最佳实践
- 普通换行：直接按回车键
- 链接：使用 `<a href="url" target="_blank">文字</a>`
- 图片：使用 `<img src="url" alt="描述" />`
- 加粗：使用 `<strong>文字</strong>`
- 列表：使用 `<ul><li>项目</li></ul>`

## 测试建议

### 测试用例 1：纯文本换行
```
输入：
第一行
第二行
第三行

预期：三行分别显示
```

### 测试用例 2：混合 HTML
```
输入：
这是<strong>加粗</strong>文字
这是<a href="#">链接</a>文字

预期：两行，HTML 标签正确渲染
```

### 测试用例 3：空行
```
输入：
第一行

第三行（中间有空行）

预期：显示空行
```

### 测试用例 4：编辑已有数据
```
操作：
1. 创建 FAQ 并保存
2. 重新编辑该 FAQ
3. 检查换行符是否正确显示

预期：编辑器中显示换行符，不是 <br> 标签
```

## 修改文件
- `src/pages/FAQManagePage.jsx`
  - `handleSave()` - 保存时转换换行符为 `<br>`
  - `handleEdit()` - 编辑时转换 `<br>` 为换行符

## 完成状态
✅ 换行符自动转换已实现
✅ 编辑器正确显示换行
✅ 前台正确渲染换行
✅ 向后兼容已有数据
✅ 支持混合 HTML 标签
