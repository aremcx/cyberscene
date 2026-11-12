# 🚀 推送到 GitHub 指南

## 📋 准备工作

### 1. 确保已安装 Git

```bash
# 检查 Git 是否已安装
git --version

# 如果未安装，请访问 https://git-scm.com/downloads 下载安装
```

### 2. 配置 Git 用户信息（首次使用）

```bash
# 设置用户名
git config --global user.name "你的名字"

# 设置邮箱
git config --global user.email "你的邮箱@example.com"
```

---

## 🔧 推送步骤

### 步骤 1：初始化 Git 仓库

```bash
# 在项目根目录执行
git init
```

### 步骤 2：添加所有文件

```bash
# 添加所有文件到暂存区
git add .

# 或者添加特定文件
git add README.md
git add package.json
git add src/
```

### 步骤 3：创建初始提交

```bash
git commit -m "Initial commit: CyberVault cybersecurity platform

- Complete cybersecurity intelligence platform
- 10 major feature modules
- 110 tests with 90% coverage
- Security score: 93/100
- Production ready

Features:
- Content Management System
- Threat Intelligence
- Vulnerability Management
- Tools Directory
- Cyber Academy
- Community Features
- AI Assistant
- Newsletter & Notifications
- Job Board
- Events Management"
```

### 步骤 4：创建 GitHub 仓库

#### 方法 A：使用 GitHub CLI（推荐）

```bash
# 安装 GitHub CLI（如果还没安装）
# macOS: brew install gh
# Windows: winget install GitHub.cli
# Linux: 访问 https://cli.github.com/

# 登录 GitHub
gh auth login

# 创建仓库并推送
gh repo create cybervault --public --source=. --push
```

#### 方法 B：手动创建

1. 访问 https://github.com/new
2. 填写仓库信息：
   - **Repository name**: `cybervault`
   - **Description**: `Cybersecurity Intelligence Platform - Articles, Threat Intel, Vulnerabilities, Tools, Academy, Community`
   - **Public** 或 **Private**（根据需要选择）
   - ❌ **不要** 勾选 "Initialize this repository with a README"
   - ❌ **不要** 勾选 "Add .gitignore"
   - ❌ **不要** 勾选 "Choose a license"
3. 点击 "Create repository"
4. 复制仓库的 URL（例如：`https://github.com/你的用户名/cybervault.git`）

### 步骤 5：关联远程仓库并推送

```bash
# 添加远程仓库（替换为你的 GitHub 用户名和仓库名）
git remote add origin https://github.com/你的用户名/cybervault.git

# 或者如果使用 SSH
git remote add origin git@github.com:你的用户名/cybervault.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

---

## 🎯 完整命令序列

如果你想一次性执行所有命令，复制以下代码块：

```bash
# 初始化仓库
git init

# 添加所有文件
git add .

# 创建提交
git commit -m "Initial commit: CyberVault cybersecurity platform

- Complete cybersecurity intelligence platform
- 10 major feature modules
- 110 tests with 90% coverage
- Security score: 93/100
- Production ready"

# 创建主分支
git branch -M main

# 添加远程仓库（替换为你的仓库 URL）
git remote add origin https://github.com/你的用户名/cybervault.git

# 推送
git push -u origin main
```

---

## 🔐 使用 SSH 推送（推荐）

如果你经常推送代码，建议使用 SSH 而不是 HTTPS。

### 1. 生成 SSH 密钥

```bash
# 生成新的 SSH 密钥
ssh-keygen -t ed25519 -C "你的邮箱@example.com"

# 按提示操作（可以直接按 Enter 使用默认设置）
```

### 2. 添加 SSH 密钥到 GitHub

```bash
# 启动 ssh-agent
eval "$(ssh-agent -s)"

# 添加密钥
ssh-add ~/.ssh/id_ed25519

# 复制公钥
cat ~/.ssh/id_ed25519.pub
```

然后：
1. 访问 https://github.com/settings/keys
2. 点击 "New SSH key"
3. 粘贴公钥
4. 保存

### 3. 使用 SSH URL

```bash
# 添加远程仓库（使用 SSH）
git remote add origin git@github.com:你的用户名/cybervault.git

# 推送
git push -u origin main
```

---

## 📝 后续更新

当你修改代码后，推送更新的步骤：

```bash
# 1. 查看更改
git status

# 2. 添加更改的文件
git add .

# 3. 提交更改
git commit -m "描述你的更改"

# 4. 推送到 GitHub
git push
```

---

## 🐛 常见问题

### 问题 1：权限被拒绝

```bash
# 如果使用 HTTPS，确保使用正确的凭据
# 如果使用 SSH，确保 SSH 密钥已添加到 GitHub

# 检查 SSH 连接
ssh -T git@github.com
```

### 问题 2：远程仓库已存在

```bash
# 删除旧的远程仓库
git remote remove origin

# 重新添加
git remote add origin https://github.com/你的用户名/cybervault.git
```

### 问题 3：推送被拒绝

```bash
# 如果远程仓库有更新，先拉取
git pull origin main

# 然后再推送
git push
```

### 问题 4：大文件问题

如果仓库包含大文件（如 node_modules），确保 .gitignore 已配置：

```bash
# 从 Git 跟踪中移除 node_modules
git rm -r --cached node_modules

# 提交更改
git commit -m "Remove node_modules from tracking"

# 推送
git push
```

---

## 📊 仓库信息

### 推荐的仓库设置

在 GitHub 仓库设置中（Settings）：

#### 1. 基本信息
- **Description**: `Cybersecurity Intelligence Platform - Articles, Threat Intel, Vulnerabilities, Tools, Academy, Community`
- **Website**: `https://cybervault.vercel.app`（如果已部署）
- **Topics**: `cybersecurity`, `security`, `threat-intelligence`, `vulnerability`, `react`, `typescript`

#### 2. Features
- ✅ Enable Issues
- ✅ Enable Projects
- ✅ Enable Wiki（可选）
- ✅ Enable Discussions

#### 3. Branch Protection（推荐）
- 保护 `main` 分支
- 要求 PR 审查
- 要求状态检查通过

---

## 🎉 推送成功后的检查清单

- [ ] 访问 GitHub 仓库页面
- [ ] 检查所有文件是否已上传
- [ ] 检查 README.md 是否正确显示
- [ ] 检查 .gitignore 是否生效（node_modules 不应被上传）
- [ ] 测试克隆仓库：`git clone https://github.com/你的用户名/cybervault.git`
- [ ] 在克隆的仓库中运行 `npm install && npm run dev`

---

## 📚 相关资源

- [GitHub 文档](https://docs.github.com/)
- [Git 手册](https://git-scm.com/doc)
- [GitHub CLI 文档](https://cli.github.com/manual/)
- [SSH 密钥指南](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

---

## 💡 提示

1. **使用 GitHub CLI** 可以简化操作
2. **使用 SSH** 比 HTTPS 更方便（不需要每次输入密码）
3. **定期推送** 代码，避免丢失工作
4. **写清晰的提交信息** 有助于团队协作
5. **使用分支** 开发新功能，然后合并到 main

---

**准备好了吗？开始推送吧！** 🚀

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/cybervault.git
git push -u origin main
```
