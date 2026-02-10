#!/bin/bash

echo "🔧 开始修复博客 Markdown 显示..."
echo ""

# 步骤 1：安装必要的插件
echo "📦 步骤 1/3：安装 Markdown 插件..."
npm install remark-gfm rehype-raw rehype-sanitize

if [ $? -eq 0 ]; then
    echo "✅ 插件安装成功"
else
    echo "❌ 插件安装失败"
    exit 1
fi

echo ""

# 步骤 2：更新 BlogDetailPage.jsx
echo "📝 步骤 2/3：更新 BlogDetailPage.jsx..."
echo "⚠️  需要手动添加以下导入到文件顶部："
echo ""
echo "import remarkGfm from 'remark-gfm';"
echo "import rehypeRaw from 'rehype-raw';"
echo "import rehypeSanitize from 'rehype-sanitize';"
echo ""
echo "然后在 ReactMarkdown 组件中添加："
echo ""
echo "<ReactMarkdown"
echo "  remarkPlugins={[remarkGfm]}"
echo "  rehypePlugins={[rehypeRaw, rehypeSanitize]}"
echo "  components={{"
echo "    // ... 现有配置"
echo "  }}"
echo ">"
echo ""

# 步骤 3：重启服务
echo "🔄 步骤 3/3：重启开发服务器..."
echo "请手动执行："
echo "  1. 停止当前服务器（Ctrl+C）"
echo "  2. 运行：npm run dev"
echo ""

echo "✅ 修复脚本执行完成！"
echo ""
echo "📖 详细说明请查看：博客Markdown渲染优化.md"
