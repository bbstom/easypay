#!/bin/bash

# ==================== EasyPay SEO 预渲染服务部署脚本 ====================
# 功能：自动安装和配置 Prerender 预渲染服务（开源版本）
# 适用系统：Ubuntu/Debian
# 
# 使用方法：
# chmod +x setup-seo-prerender.sh
# ./setup-seo-prerender.sh

set -e

echo "=========================================="
echo "  EasyPay SEO 预渲染服务部署脚本"
echo "  使用 Prerender (开源版本)"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}请使用 root 用户运行此脚本${NC}"
    echo "使用命令：sudo ./setup-seo-prerender.sh"
    exit 1
fi

# 检查 Node.js 是否已安装
echo -e "${YELLOW}[1/6] 检查 Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js 未安装，正在安装...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
    echo -e "${GREEN}✓ Node.js 安装完成${NC}"
else
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js 已安装: $NODE_VERSION${NC}"
fi

# 检查 PM2 是否已安装
echo -e "${YELLOW}[2/6] 检查 PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}PM2 未安装，正在安装...${NC}"
    npm install -g pm2
    echo -e "${GREEN}✓ PM2 安装完成${NC}"
else
    echo -e "${GREEN}✓ PM2 已安装${NC}"
fi

# 创建 Prerender 目录
echo -e "${YELLOW}[3/6] 创建 Prerender 目录...${NC}"
PRERENDER_DIR="/opt/prerender"
if [ -d "$PRERENDER_DIR" ]; then
    echo -e "${YELLOW}目录已存在，正在清理...${NC}"
    rm -rf "$PRERENDER_DIR"
fi
mkdir -p "$PRERENDER_DIR"
cd "$PRERENDER_DIR"

# 克隆 Prerender 项目
echo -e "${YELLOW}[4/6] 下载 Prerender...${NC}"
git clone https://github.com/prerender/prerender.git .
npm install
echo -e "${GREEN}✓ Prerender 安装完成${NC}"

# 创建配置文件
echo -e "${YELLOW}[5/6] 创建配置文件...${NC}"
cat > server.js <<'EOF'
#!/usr/bin/env node
const prerender = require('./lib');

const server = prerender({
    // 监听端口
    port: process.env.PORT || 3000,
    
    // Chrome 启动参数
    chromeFlags: [
        '--no-sandbox',
        '--headless',
        '--disable-gpu',
        '--remote-debugging-port=9222',
        '--hide-scrollbars',
        '--disable-dev-shm-usage'
    ],
    
    // 页面加载超时（毫秒）
    pageLoadTimeout: 20000,
    
    // 等待渲染完成的时间（毫秒）
    waitAfterLastRequest: 500,
    
    // 日志级别
    logRequests: true
});

// 启用内存缓存（可选）
server.use(prerender.sendPrerenderHeader());
server.use(prerender.removeScriptTags());
server.use(prerender.httpHeaders());

// 启动服务器
server.start();

console.log('✓ Prerender 服务已启动');
console.log('  监听端口: 3000');
console.log('  测试命令: curl http://localhost:3000/render?url=https://example.com');
EOF

chmod +x server.js

# 创建 PM2 配置文件
cat > ecosystem.config.js <<EOF
module.exports = {
  apps: [{
    name: 'prerender',
    script: './server.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      PORT: 3000,
      NODE_ENV: 'production'
    },
    error_file: '/var/log/prerender-error.log',
    out_file: '/var/log/prerender-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '500M'
  }]
};
EOF

# 停止旧的 Prerender 进程（如果存在）
pm2 delete prerender 2>/dev/null || true

# 启动 Prerender
echo -e "${YELLOW}[6/6] 启动 Prerender...${NC}"
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo ""
echo -e "${GREEN}=========================================="
echo "  ✓ Prerender 部署完成！"
echo "==========================================${NC}"
echo ""
echo "服务信息："
echo "  - 服务名称：prerender"
echo "  - 监听端口：3000"
echo "  - 监听地址：127.0.0.1:3000"
echo "  - 安装目录：$PRERENDER_DIR"
echo ""
echo "管理命令："
echo "  - 查看状态：pm2 status prerender"
echo "  - 查看日志：pm2 logs prerender"
echo "  - 重启服务：pm2 restart prerender"
echo "  - 停止服务：pm2 stop prerender"
echo ""
echo "测试命令："
echo "  curl 'http://127.0.0.1:3000/render?url=https://example.com'"
echo ""
echo -e "${YELLOW}下一步：${NC}"
echo "1. 修改 Nginx 配置，启用 Prerender 预渲染"
echo "2. 参考 nginx配置示例_SEO增强版.conf 中的方案 B"
echo "3. 测试配置：nginx -t"
echo "4. 重载 Nginx：nginx -s reload"
echo ""
echo -e "${YELLOW}验证 SEO 效果：${NC}"
echo "curl -A \"Mozilla/5.0 (compatible; Googlebot/2.1)\" https://your-domain.com/"
echo ""

