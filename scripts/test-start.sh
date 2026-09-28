#!/bin/bash

# CyberVault 测试启动脚本

echo "🚀 CyberVault 测试启动脚本"
echo "================================"
echo ""

# 检查依赖
echo "📦 检查依赖..."
if [ ! -d "node_modules" ]; then
    echo "安装依赖..."
    npm install
fi
echo "✅ 依赖检查完成"
echo ""

# 运行类型检查
echo "🔍 运行类型检查..."
npm run typecheck
if [ $? -eq 0 ]; then
    echo "✅ 类型检查通过"
else
    echo "❌ 类型检查失败"
    exit 1
fi
echo ""

# 运行构建
echo "🔨 运行构建..."
npm run build
if [ $? -eq 0 ]; then
    echo "✅ 构建成功"
else
    echo "❌ 构建失败"
    exit 1
fi
echo ""

# 启动开发服务器
echo "🎉 启动开发服务器..."
echo ""
echo "================================"
echo "📱 访问地址: http://localhost:3000"
echo "================================"
echo ""
echo "📝 演示账号（密码都是 Demo@1234）:"
echo "  - superadmin@cybervault.dev (超级管理员)"
echo "  - admin@cybervault.dev (管理员)"
echo "  - editor@cybervault.dev (编辑)"
echo "  - author@cybervault.dev (作者)"
echo "  - user@cybervault.dev (普通用户)"
echo ""
echo "🧪 测试页面:"
echo "  - 数据库演示: http://localhost:3000/demo/database"
echo "  - 认证演示: http://localhost:3000/demo/auth"
echo "  - AI 助手: http://localhost:3000/ai-assistant"
echo ""
echo "按 Ctrl+C 停止服务器"
echo "================================"
echo ""

npm run dev
