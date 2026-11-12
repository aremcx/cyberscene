# CyberVault - 完整部署指南

## 📋 架构说明

CyberVault 是一个**纯前端应用**（React SPA），当前使用**内存存储**进行数据管理。对于生产部署，有以下三种方案：

### 方案对比

| 方案 | 复杂度 | 成本 | 推荐场景 |
|------|--------|------|----------|
| **A. Supabase（推荐）** | ⭐ 简单 | 免费/低成本 | 快速部署，小型项目 |
| **B. 独立后端 API** | ⭐⭐⭐ 复杂 | 中等 | 完全控制，大型项目 |
| **C. 内存存储（当前）** | ⭐ 简单 | 免费 | 开发/演示，不适合生产 |

---

## 🚀 方案 A：使用 Supabase 部署（推荐）

### 为什么选择 Supabase？
- ✅ 项目已集成 Supabase SDK
- ✅ 提供 PostgreSQL + Auth + Storage + Realtime
- ✅ 免费套餐足够小型项目
- ✅ 无需创建后端服务
- ✅ 5 分钟完成部署

### 步骤 1：创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com)
2. 注册/登录
3. 点击 "New Project"
4. 填写项目信息：
   - **Name**: cybervault
   - **Database Password**: （生成强密码并保存）
   - **Region**: 选择离用户最近的区域
5. 等待项目创建（约 2 分钟）

### 步骤 2：获取项目凭证

1. 进入项目 Dashboard
2. 点击 "Settings" → "API"
3. 复制以下信息：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...`
   - **service_role key**: `eyJhbGc...`（保密！）

### 步骤 3：配置环境变量

创建或更新 `.env` 文件：

```bash
# Supabase 配置
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# 应用配置
VITE_APP_URL=http://localhost:3000
VITE_APP_ENV=production
```

### 步骤 4：创建数据库表

#### 方法 1：使用 Supabase Dashboard（推荐）

1. 进入 Supabase Dashboard
2. 点击 "SQL Editor"
3. 运行以下 SQL 创建核心表：

```sql
-- 用户表（Supabase Auth 自动创建）
-- 无需手动创建

-- 文章表
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'article',
  status TEXT DEFAULT 'draft',
  difficulty TEXT,
  featured_image TEXT,
  author_id UUID REFERENCES auth.users(id),
  category_id UUID REFERENCES categories(id),
  reading_time_minutes INT DEFAULT 1,
  view_count INT DEFAULT 0,
  published_at TIMESTAMPTZ,
  seo_title TEXT,
  seo_description TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- 分类表
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 标签表
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 文章标签关联表
CREATE TABLE article_tags (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- 评论表
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  status TEXT DEFAULT 'approved',
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id),
  parent_id UUID REFERENCES comments(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 书签表
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

-- 创建索引
CREATE INDEX idx_articles_status ON articles(status, published_at DESC);
CREATE INDEX idx_articles_author ON articles(author_id);
CREATE INDEX idx_articles_category ON articles(category_id);
CREATE INDEX idx_comments_article ON comments(article_id, created_at);
```

#### 方法 2：使用 Prisma 迁移

如果你已经创建了 Prisma schema，可以使用：

```bash
# 配置 Supabase 数据库 URL
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"

# 运行迁移
npx prisma migrate dev --name init
```

### 步骤 5：配置 RLS（行级安全）

在 Supabase SQL Editor 中运行：

```sql
-- 启用 RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- 文章策略
CREATE POLICY "公开文章可查看" ON articles
  FOR SELECT USING (status = 'published');

CREATE POLICY "作者可管理自己的文章" ON articles
  FOR ALL USING (auth.uid() = author_id);

-- 书签策略
CREATE POLICY "用户可管理自己的书签" ON bookmarks
  FOR ALL USING (auth.uid() = user_id);

-- 评论策略
CREATE POLICY "已批准评论可查看" ON comments
  FOR SELECT USING (status = 'approved');

CREATE POLICY "用户可管理自己的评论" ON comments
  FOR ALL USING (auth.uid() = author_id);
```

### 步骤 6：更新前端代码

修改 `src/services/articles.ts` 使用 Supabase：

```typescript
import { supabase } from '../lib/supabase';

export async function listArticles(filters?: any) {
  let query = supabase
    .from('articles')
    .select(`
      *,
      author:users!author_id(display_name, avatar_url),
      category:categories(name, slug),
      tags:tags(name, slug)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (filters?.category) {
    query = query.eq('category_id', filters.category);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  return { data: data || [], total: data?.length || 0 };
}
```

### 步骤 7：部署到 Vercel

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel

# 按提示操作：
# - Set up and deploy? Y
# - Which scope? 选择你的账户
# - Link to existing project? N
# - Project name? cybervault
# - Directory? ./
# - Override settings? N

# 配置环境变量
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# 生产部署
vercel --prod
```

### 步骤 8：验证部署

1. 访问你的 Vercel 域名（如 `cybervault.vercel.app`）
2. 测试注册/登录
3. 测试文章浏览
4. 检查 Supabase Dashboard 中的数据

---

## 🔧 方案 B：创建独立后端 API

### 架构

```
前端 (React) → 后端 API (Express) → PostgreSQL (Prisma)
```

### 步骤 1：创建后端项目

```bash
# 创建后端目录
mkdir cybervault-api
cd cybervault-api

# 初始化
npm init -y

# 安装依赖
npm install express cors helmet @prisma/client
npm install --save-dev prisma typescript @types/express @types/node tsx

# 初始化 TypeScript
npx tsc --init
```

### 步骤 2：配置 Prisma

```bash
# 初始化 Prisma
npx prisma init

# 编辑 prisma/schema.prisma（已创建）

# 配置数据库
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/cybervault"

# 生成客户端
npx prisma generate

# 运行迁移
npx prisma migrate dev --name init
```

### 步骤 3：创建 API 服务

创建 `src/index.ts`：

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

// 中间件
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

// 文章 API
app.get('/api/articles', async (req, res) => {
  const articles = await prisma.article.findMany({
    where: { status: 'published' },
    include: {
      author: true,
      category: true,
      tags: { include: { tag: true } },
    },
    orderBy: { publishedAt: 'desc' },
  });
  res.json(articles);
});

app.get('/api/articles/:slug', async (req, res) => {
  const article = await prisma.article.findUnique({
    where: { slug: req.params.slug },
    include: {
      author: true,
      category: true,
      tags: { include: { tag: true } },
    },
  });
  if (!article) return res.status(404).json({ error: 'Not found' });
  res.json(article);
});

// 启动服务器
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
```

### 步骤 4：部署后端

**选项 1：Railway（推荐）**
```bash
# 安装 Railway CLI
npm i -g @railway/cli

# 登录
railway login

# 创建项目
railway init

# 添加 PostgreSQL 插件
railway add
# 选择 PostgreSQL

# 部署
railway up
```

**选项 2：Render**
1. 推送代码到 GitHub
2. 在 Render.com 创建新 Web Service
3. 连接 GitHub 仓库
4. 配置环境变量
5. 部署

### 步骤 5：更新前端代码

修改 `src/services/articles.ts`：

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function listArticles() {
  const response = await fetch(`${API_URL}/api/articles`);
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
}
```

---

## 📊 方案 C：继续使用内存存储（仅用于开发）

**警告**：此方案不适合生产环境！数据会在应用重启后丢失。

### 适用场景
- ✅ 本地开发
- ✅ 演示/原型
- ✅ 学习/测试

### 使用方法

```bash
# 直接启动
npm run dev

# 访问 http://localhost:3000
```

所有数据存储在内存中，重启后重置。

---

## 🎯 推荐方案

### 对于生产环境：**方案 A（Supabase）**

**理由**：
- ✅ 最快部署（5 分钟）
- ✅ 成本最低（免费套餐）
- ✅ 无需维护后端
- ✅ 自动扩展
- ✅ 内置认证
- ✅ 实时功能

### 对于大型项目：**方案 B（独立后端）**

**理由**：
- ✅ 完全控制
- ✅ 自定义业务逻辑
- ✅ 更好的性能优化
- ✅ 复杂的集成需求

---

## 📝 部署检查清单

### 部署前
- [ ] 所有测试通过：`npm test`
- [ ] 构建成功：`npm run build`
- [ ] 环境变量配置完成
- [ ] 数据库准备就绪
- [ ] 域名购买（可选）

### 部署中
- [ ] 代码推送到 GitHub
- [ ] 连接到部署平台（Vercel/Railway）
- [ ] 配置环境变量
- [ ] 运行数据库迁移
- [ ] 填充初始数据

### 部署后
- [ ] 验证所有功能
- [ ] 测试用户流程
- [ ] 检查性能
- [ ] 配置监控
- [ ] 设置备份

---

## 🔍 故障排除

### 问题 1：Supabase 连接失败
**解决**：
- 检查 Project URL 是否正确
- 检查 anon key 是否正确
- 确认项目处于活跃状态

### 问题 2：数据库表未创建
**解决**：
```bash
# 重新运行迁移
npx prisma migrate dev

# 或手动运行 SQL
# 在 Supabase SQL Editor 中执行建表语句
```

### 问题 3：CORS 错误
**解决**：
```typescript
// 后端配置
app.use(cors({ 
  origin: ['http://localhost:3000', 'https://your-domain.com'] 
}));
```

### 问题 4：环境变量未加载
**解决**：
```bash
# 重启开发服务器
npm run dev

# 或清除缓存
rm -rf node_modules/.cache
```

---

## 📚 额外资源

### Supabase
- [Supabase 文档](https://supabase.com/docs)
- [Supabase 认证](https://supabase.com/docs/guides/auth)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)

### 部署平台
- [Vercel 文档](https://vercel.com/docs)
- [Railway 文档](https://docs.railway.app/)
- [Render 文档](https://render.com/docs)

### 数据库
- [PostgreSQL 文档](https://www.postgresql.org/docs/)
- [Prisma 文档](https://www.prisma.io/docs)

---

## 🎉 总结

**最快部署路径**（推荐）：
1. 创建 Supabase 项目（2 分钟）
2. 配置环境变量（1 分钟）
3. 运行 SQL 创建表（2 分钟）
4. 部署到 Vercel（1 分钟）

**总时间**：6 分钟完成生产部署！

---

**选择你的方案，开始部署吧！** 🚀
