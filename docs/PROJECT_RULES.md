# BruceTang 个人作品集 - 项目规则文档

> 本文档定义了 BruceTang 个人作品集网站的开发规范、架构说明、代码规范及部署流程，
> 所有参与本项目的开发者应严格遵守本文档约定。

---

## 目录

1. [项目概述](#1-项目概述)
2. [项目架构说明](#2-项目架构说明)
3. [代码规范](#3-代码规范)
4. [开发流程](#4-开发流程)
5. [版本控制策略](#5-版本控制策略)
6. [部署流程](#6-部署流程)
7. [测试规范](#7-测试规范)

---

## 1. 项目概述

### 1.1 项目名称

**BruceTang 个人作品集**（brucetanghao）

### 1.2 项目目标

构建一个基于 docsify 前端 + Express 后端的个人作品集网站，包含：

- 技术文章、书籍书评、开源项目展示
- 论坛讨论区
- GitHub 活跃记录展示
- 用户认证系统（注册、登录、JWT 无状态会话）
- 9 色主题选择器（6 亮色 + 3 暗色），localStorage 持久化
- 响应式设计，适配桌面、平板、移动端

### 1.3 技术栈

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 前端框架 | docsify | 4.x | Markdown 驱动的静态文档站点 |
| 前端插件 | docsify-sidebar-collapse | 1.x | 侧边栏折叠 |
| 前端插件 | docsify-copy-code | 2.x | 代码块一键复制 |
| 前端插件 | Prism.js | 1.x | 代码高亮（bash/python/javascript） |
| 后端框架 | Express | 4.21.0 | Node.js Web 框架 |
| 认证 | jsonwebtoken | 9.0.2 | JWT 生成与验证 |
| 密码 | bcryptjs | 2.4.3 | 纯 JS 密码哈希（无原生依赖） |
| 校验 | express-validator | 7.2.0 | 请求参数校验 |
| 跨域 | cors | 2.8.5 | CORS 中间件 |
| 数据存储 | JSON 文件 | - | 自定义同步存储，零原生依赖 |
| 测试框架 | Jest | 29.7.0 | 单元测试 + 覆盖率报告 |
| 测试工具 | supertest | 7.0.0 | HTTP 接口测试 |
| 运行时 | Node.js | >= 18 | 后端运行环境 |

### 1.4 仓库地址与分支策略

- **仓库地址**：<https://github.com/HaoTang9878/tanghao>
- **主分支**：`main`（受保护，仅通过 PR 合并）
- **开发分支**：按功能特性命名，详见 [版本控制策略](#5-版本控制策略)

---

## 2. 项目架构说明

### 2.1 前端架构

#### 2.1.1 docsify 配置

前端基于 docsify 4.x 构建，核心配置在 `index.html` 中：

```javascript
window.$docsify = {
    name: "BruceTang的作品集",      // 站点名称
    repo: "HaoTang9878/tanghao",    // GitHub 仓库
    homepage: "README.md",          // 首页文件
    loadSidebar: true,              // 加载侧边栏
    subMaxLevel: 3,                 // 侧边栏最大层级
    autoHeader: true,               // 自动头部锚点
    search: {                       // 全文搜索
        placeholder: "搜索文章",
        noData: "没有找到结果",
        depth: 3
    },
    themeColor: "#42b983",          // 默认主题色
    fontSize: "15px"                // 正文字号
};
```

#### 2.1.2 页面结构

| 页面文件 | 路由 | 说明 |
|----------|------|------|
| `README.md` | `#/` | 首页总览 |
| `_sidebar.md` | - | 侧边栏导航配置 |
| `login.md` | `#/login` | 登录页面 |
| `register.md` | `#/register` | 注册页面 |
| `books.md` | `#/books` | 书籍展示（卡片式布局） |
| `projects.md` | `#/projects` | 开源项目（hover 卡片效果） |
| `forum.md` | `#/forum` | 论坛讨论区 |
| `github.md` | `#/github` | GitHub 活跃记录（热力图 + 活动列表） |
| `articles/programming/` | `#/articles/programming/` | 编程学习笔记 |
| `articles/ops/` | `#/articles/ops/` | 服务器运维手记 |
| `articles/database/` | `#/articles/database/` | 数据库实践 |
| `articles/reading/` | `#/articles/reading/` | 读书笔记 |
| `articles/life/` | `#/articles/life/` | 生活随笔 |
| `about/README.md` | `#/about/` | 关于我 |
| `projects/openalpha/` | `#/projects/openalpha/` | OpenAlpha 项目详情 |
| `projects/blog/` | `#/projects/blog/` | 个人博客系统详情 |

#### 2.1.3 主题系统

主题系统通过 CSS 变量 + JavaScript 实现，共 9 套主题：

| 主题 ID | 名称 | 主色 | 类型 |
|---------|------|------|------|
| `green` | 翠绿 | `#42b983` | 亮色 |
| `blue` | 深海蓝 | `#1976d2` | 亮色 |
| `orange` | 暖阳橙 | `#f57c00` | 亮色 |
| `rose` | 玫瑰红 | `#e91e63` | 亮色 |
| `purple` | 暗夜紫 | `#7b1fa2` | 亮色 |
| `cyan` | 极客青 | `#00bcd4` | 亮色 |
| `dark-green` | 暗夜翠 | `#42b983` | 暗色 |
| `dark-blue` | 暗夜蓝 | `#64b5f6` | 暗色 |
| `dark-purple` | 极夜紫 | `#ba68c8` | 暗色 |

**实现要点：**

- 通过 `:root` CSS 变量驱动颜色变化
- `body.bt-dark-mode` 类切换暗色模式样式
- localStorage 键 `brucetanghao_theme` 持久化用户选择
- 浮动按钮 + 展开面板的交互方式

#### 2.1.4 认证状态管理

前端通过 localStorage 管理认证状态：

| 存储 Key | 内容 | 说明 |
|----------|------|------|
| `brucetanghao_token` | JWT token | 请求头 `Authorization: Bearer <token>` |
| `brucetanghao_user` | 用户信息 JSON | 包含 username、display_name 等 |

#### 2.1.5 响应式设计

| 断点 | 宽度 | 适配设备 | 调整内容 |
|------|------|----------|----------|
| 桌面 | > 1024px | PC | 默认布局 |
| 平板 | <= 1024px | iPad | 内容区宽度 90% |
| 移动端 | <= 768px | 手机 | 侧边栏抽屉式、字号缩小、布局堆叠 |

### 2.2 后端架构

#### 2.2.1 Express 应用结构

后端入口为 `server/src/app.js`，采用分层架构：

```
请求 → CORS中间件 → JSON解析 → 路由分发 → 业务路由 → 404处理 → 全局错误处理
```

**中间件链：**

1. `cors()` - 跨域资源共享
2. `express.json()` - JSON 请求体解析
3. 路由挂载：`/api/auth`、`/api/articles`、`/api/books`、`/api/projects`、`/api/forum`
4. 404 处理器
5. 全局错误处理器（记录日志 + 返回 500）

#### 2.2.2 路由模块

| 模块 | 文件 | 前缀 | 功能 |
|------|------|------|------|
| 认证 | `routes/auth.js` | `/api/auth` | 注册、登录、登出、获取当前用户 |
| 文章 | `routes/articles.js` | `/api/articles` | 文章 CRUD |
| 书籍 | `routes/books.js` | `/api/books` | 书籍 CRUD（含评分、状态） |
| 项目 | `routes/projects.js` | `/api/projects` | 项目 CRUD（含标签、星标） |
| 论坛 | `routes/forum.js` | `/api/forum` | 主题创建、回复、删除（级联清理） |
| 监控 | `app.js` 内联 | `/api/health` | 健康检查 |

#### 2.2.3 中间件模块

| 中间件 | 文件 | 说明 |
|--------|------|------|
| `authRequired` | `middleware/auth.js` | 强制认证，解析 Bearer token |
| `authOptional` | `middleware/auth.js` | 可选认证，公开接口个性化 |
| `signToken` | `middleware/auth.js` | JWT 签发工具函数 |

**JWT 配置：**

| 环境变量 | 默认值 | 说明 |
|----------|--------|------|
| `JWT_SECRET` | `brucetanghao-dev-secret-change-in-prod` | 签名密钥，生产环境必须修改 |
| `JWT_EXPIRES_IN` | `7d` | Token 有效期 |

#### 2.2.4 数据模型

后端使用 JSON 文件存储（`server/data/db.json`），数据结构如下：

```json
{
    "users": [],
    "articles": [],
    "books": [],
    "projects": [],
    "forum_topics": [],
    "forum_replies": [],
    "nextUserId": 1,
    "nextArticleId": 1,
    "nextBookId": 1,
    "nextProjectId": 1,
    "nextTopicId": 1,
    "nextReplyId": 1
}
```

**用户模型（User）：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | number | 自增主键 |
| `username` | string | 用户名（3-32 字符，唯一） |
| `email` | string | 邮箱（唯一） |
| `password_hash` | string | bcrypt 哈希（cost factor 10） |
| `display_name` | string | 显示名称 |
| `created_at` | string | ISO 时间戳 |
| `updated_at` | string | ISO 时间戳 |

**文章模型（Article）：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | number | 自增主键 |
| `user_id` | number | 创建者 ID |
| `title` | string | 标题 |
| `slug` | string | URL 标识（唯一） |
| `content` | string | 正文内容 |
| `status` | string | `published` / `draft` |
| `created_at` | string | ISO 时间戳 |
| `updated_at` | string | ISO 时间戳 |

**书籍模型（Book）：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | number | 自增主键 |
| `user_id` | number | 创建者 ID |
| `title` | string | 书名 |
| `slug` | string | URL 标识（唯一） |
| `author` | string | 原作者 |
| `description` | string | 简介 |
| `cover_url` | string | 封面地址 |
| `status` | string | `published` / `draft` |
| `rating` | number | 评分 0-5（0 表示未评分） |
| `created_at` | string | ISO 时间戳 |
| `updated_at` | string | ISO 时间戳 |

**项目模型（Project）：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | number | 自增主键 |
| `user_id` | number | 创建者 ID |
| `title` | string | 项目名称 |
| `slug` | string | URL 标识（唯一） |
| `description` | string | 项目简介 |
| `repo_url` | string | 仓库地址 |
| `demo_url` | string | 演示地址 |
| `tags` | string[] | 标签数组 |
| `status` | string | `published` / `draft` |
| `stars` | number | 星标数 |
| `created_at` | string | ISO 时间戳 |
| `updated_at` | string | ISO 时间戳 |

**论坛主题模型（ForumTopic）：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | number | 自增主键 |
| `user_id` | number | 创建者 ID |
| `title` | string | 标题 |
| `slug` | string | URL 标识（唯一） |
| `content` | string | 正文 |
| `views` | number | 浏览数 |
| `reply_count` | number | 回复数 |
| `created_at` | string | ISO 时间戳 |
| `updated_at` | string | ISO 时间戳 |

**论塔回复模型（ForumReply）：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | number | 自增主键 |
| `topic_id` | number | 关联主题 ID |
| `user_id` | number | 回复者 ID |
| `content` | string | 回复内容 |
| `created_at` | string | ISO 时间戳 |

#### 2.2.5 存储层设计

存储层（`db/index.js`）采用同步 IO 设计：

- **文件模式**（生产）：写入 `server/data/db.json`，临时文件 + rename 保证原子性
- **内存模式**（测试）：`setMemoryMode()` 切换，不写磁盘，保证测试隔离
- **损坏恢复**：JSON 解析失败时自动备份为 `.corrupt.<timestamp>` 并重建
- **字段合并**：读取时与 `DEFAULT_DATA` 合并，保证旧库升级字段完整

### 2.3 目录结构树

```
tanghao-local/
├── index.html                  # docsify 入口页面（含主题系统、认证状态管理）
├── README.md                   # 首页内容
├── _sidebar.md                 # 侧边栏导航配置
├── login.md                    # 登录页面
├── register.md                 # 注册页面
├── books.md                    # 书籍展示页
├── projects.md                 # 开源项目展示页
├── forum.md                    # 论坛讨论区页
├── github.md                   # GitHub 活跃记录页
├── about/
│   └── README.md               # 关于我
├── articles/
│   ├── programming/
│   │   ├── README.md           # 编程学习笔记首页
│   │   └── notes.md            # 编程笔记内容
│   ├── ops/
│   │   └── README.md           # 服务器运维手记
│   ├── database/
│   │   └── README.md           # 数据库实践
│   ├── reading/
│   │   ├── README.md           # 读书笔记首页
│   │   └── notes.md            # 读书笔记内容
│   └── life/
│       └── README.md           # 生活随笔
├── projects/
│   ├── openalpha/
│   │   └── README.md           # OpenAlpha 项目详情
│   └── blog/
│       └── README.md           # 个人博客系统详情
├── docs/
│   ├── TASK_LOG.md             # 开发任务日志
│   ├── PROJECT_RULES.md        # 项目规则文档（本文件）
│   └── DEVELOPMENT_GUIDE.md     # 开发指南文档
└── server/                      # 后端服务
    ├── package.json            # 依赖与脚本配置
    ├── package-lock.json       # 依赖锁定文件
    ├── src/
    │   ├── app.js              # Express 主应用
    │   ├── routes/
    │   │   ├── auth.js         # 认证路由
    │   │   ├── articles.js     # 文章路由
    │   │   ├── books.js        # 书籍路由
    │   │   ├── projects.js     # 项目路由
    │   │   └── forum.js        # 论坛路由
    │   ├── middleware/
    │   │   └── auth.js         # JWT 认证中间件
    │   └── db/
    │       ├── index.js        # 数据库连接与初始化
    │       └── user.js         # 用户数据访问层（User Model）
    ├── tests/
    │   ├── auth.test.js        # 认证 API 测试
    │   ├── articles.test.js    # 文章 API 测试
    │   ├── books.test.js       # 书籍 API 测试
    │   ├── projects.test.js    # 项目 API 测试
    │   ├── forum.test.js       # 论坛 API 测试
    │   └── middleware.test.js  # 中间件与数据库测试
    ├── data/
    │   └── db.json             # JSON 数据存储文件（运行时生成）
    └── coverage/               # 测试覆盖率报告（自动生成）
```

---

## 3. 代码规范

### 3.1 命名约定

| 类型 | 约定 | 示例 |
|------|------|------|
| 变量 | 小驼峰（camelCase） | `articleList`、`isValidRating` |
| 函数 | 小驼峰（camelCase），动词开头 | `findByUsername`、`createUser` |
| 常量 | 全大写 + 下划线分隔（UPPER_SNAKE_CASE） | `JWT_SECRET`、`DEFAULT_DATA`、`VALID_STATUS` |
| 文件名 | 小写 + 短横线或直接单数名词 | `auth.js`、`articles.js`、`index.js` |
| 路由前缀 | 小写复数名词 | `/api/articles`、`/api/books` |
| CSS 类名 | 小写 + 短横线（kebab-case） | `theme-picker-btn`、`book-card` |
| CSS 变量 | `--bt-` 前缀 + 小驼峰 | `--bt-theme-color`、`--bt-bg-gradient` |
| localStorage Key | 项目前缀 + 下划线 + 小写 | `brucetanghao_token`、`brucetanghao_theme` |

### 3.2 注释规范

#### 3.2.1 模块级注释

每个 `.js` 文件顶部必须有模块说明文档：

```javascript
/**
 * 认证路由模块
 * 提供注册、登录、登出、获取当前用户信息的 REST API
 * 所有路由前缀:/api/auth
 */
```

#### 3.2.2 函数级注释

每个函数必须有 JSDoc 注释，说明用途、参数与返回值：

```javascript
/**
 * 生成 JWT
 * @param {Object} payload - 载荷,通常是用户信息
 * @returns {string} 签名后的 token
 */
function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
```

#### 3.2.3 路由注释

每个路由定义前需注明 HTTP 方法、路径、认证要求与入参：

```javascript
/**
 * POST /api/auth/register
 * 用户注册
 * 入参:username, email, password
 */
```

#### 3.2.4 中文注释要求

- 所有注释使用中文撰写
- 解释"为什么"而非"做什么"
- 关键逻辑、复杂算法需添加行内注释

### 3.3 缩进与格式

| 规则 | 要求 |
|------|------|
| 缩进 | 4 个空格（不使用 Tab） |
| 行宽 | 不超过 100 个字符 |
| 引号 | 双引号 `"` |
| 分号 | 语句末尾加分号 |
| 尾逗号 | 函数参数不加，对象/数组最后一项不加 |
| 大括号 | K&R 风格，左括号不换行 |

### 3.4 异常处理规范

#### 3.4.1 路由层异常处理

所有路由必须显式处理异常场景，提前返回：

```javascript
router.get("/:slug", (req, res) => {
    const db = getDb();
    const article = db.articles.find((a) => a.slug === req.params.slug);
    if (!article) {
        return res.status(404).json({ error: "文章不存在" });
    }
    return res.json({ article });
});
```

#### 3.4.2 全局错误处理

`app.js` 中注册全局错误处理器，记录日志并返回 500：

```javascript
app.use((err, req, res, next) => {
    console.error("[ERROR]", new Date().toISOString(), err.message, err.stack);
    res.status(500).json({ error: "服务器内部错误" });
});
```

#### 3.4.3 数据库异常处理

JSON 文件解析失败时自动备份并重建：

```javascript
try {
    const parsed = JSON.parse(raw);
    state = Object.assign(JSON.parse(JSON.stringify(DEFAULT_DATA)), parsed);
} catch (err) {
    console.error("[db] 数据库文件解析失败,重建中:", err.message);
    fs.renameSync(DB_PATH, DB_PATH + ".corrupt." + Date.now());
    state = JSON.parse(JSON.stringify(DEFAULT_DATA));
    writeDb();
}
```

#### 3.4.4 前端异常处理

前端 fetch 请求必须包含 try-catch，网络错误时给用户明确反馈：

```javascript
try {
    const res = await fetch("/api/auth/login", { /* ... */ });
    const data = await res.json();
    if (res.ok) {
        // 成功逻辑
    } else {
        msgEl.textContent = data.error || "登录失败";
    }
} catch (err) {
    msgEl.textContent = "网络错误,请稍后重试";
}
```

### 3.5 依赖版本管理

| 规则 | 说明 |
|------|------|
| 锁定版本 | 所有依赖在 `package.json` 中明确指定精确版本号 |
| 禁止 `latest` | 不得使用 `latest`、`*`、`^`、`~` 等范围版本 |
| 锁文件 | 提交 `package-lock.json` 保证一致性 |
| 升级评估 | 依赖升级需评估兼容性，通过测试后合并 |

**当前锁定版本：**

```json
{
    "dependencies": {
        "bcryptjs": "2.4.3",
        "cors": "2.8.5",
        "express": "4.21.0",
        "express-validator": "7.2.0",
        "jsonwebtoken": "9.0.2"
    },
    "devDependencies": {
        "jest": "29.7.0",
        "supertest": "7.0.0"
    }
}
```

---

## 4. 开发流程

### 4.1 环境搭建步骤

#### 4.1.1 前置条件

- Node.js >= 18
- npm（随 Node.js 安装）
- Git

#### 4.1.2 克隆与安装

```bash
# 克隆仓库
git clone https://github.com/HaoTang9878/tanghao.git
cd tanghao

# 安装后端依赖
cd server
npm install

# 回到项目根目录
cd ..
```

#### 4.1.3 环境变量配置

在后端目录创建 `.env` 文件（不提交到 Git）：

```bash
# server/.env
PORT=4001
JWT_SECRET=your-production-secret-key
JWT_EXPIRES_IN=7d
```

### 4.2 本地开发命令

#### 4.2.1 后端开发

```bash
cd server

# 开发模式（文件变动自动重启）
npm run dev

# 生产模式启动
npm start

# 后端默认监听 http://127.0.0.1:4001
```

#### 4.2.2 前端开发

前端为纯静态站点，无需构建。推荐使用 `docsify-cli` 或任意静态服务器：

```bash
# 方式 1：使用 docsify-cli
npm i -g docsify-cli@4
docsify serve . --port 3000

# 方式 2：使用 Python 内置服务器
python3 -m http.server 3000

# 方式 3：使用 npx http-server
npx http-server@14 -p 3000
```

#### 4.2.3 前后端联调

前端通过相对路径 `/api/*` 调用后端 API，Nginx 反向代理将 `/api` 转发到后端 `4001` 端口。本地开发时需配置代理或直接修改 fetch 路径。

### 4.3 测试命令

```bash
cd server

# 运行全部测试并生成覆盖率报告
npm test

# 仅运行指定模块测试
npx jest tests/auth.test.js
npx jest tests/articles.test.js
npx jest tests/books.test.js
npx jest tests/projects.test.js
npx jest tests/forum.test.js
npx jest tests/middleware.test.js

# 以 watch 模式运行（开发时持续测试）
npx jest --watch
```

**测试输出示例：**

```
101 个测试全部通过，总覆盖率 91.03%
```

### 4.4 代码审查流程

1. **提交前自检**
   - 本地 `npm test` 通过且覆盖率 >= 80%
   - 代码符合 [代码规范](#3-代码规范)
   - 新增功能有对应测试

2. **创建 Pull Request**
   - PR 标题遵循 [提交消息格式](#52-提交消息格式)
   - PR 描述说明改动内容与关联 Issue
   - 指定至少 1 名审查者

3. **审查要点**
   - 功能正确性与边界处理
   - 安全性（是否有注入、越权风险）
   - 测试覆盖是否充分
   - 代码风格是否一致
   - 是否引入不必要的依赖

4. **合并条件**
   - 所有 CI 测试通过
   - 至少 1 名审查者批准
   - 无未解决的修改请求

---

## 5. 版本控制策略

### 5.1 分支命名规范

| 分支类型 | 前缀 | 示例 | 说明 |
|----------|------|------|------|
| 功能 | `feature/` | `feature/auth` | 新功能开发 |
| 修复 | `fix/` | `fix/login-redirect` | Bug 修复 |
| 文档 | `docs/` | `docs/api-reference` | 文档更新 |
| 重构 | `refactor/` | `refactor/db-layer` | 代码重构 |
| 测试 | `test/` | `test/forum-cases` | 测试补充 |
| 杂项 | `chore/` | `chore/update-deps` | 构建、依赖等 |

### 5.2 提交消息格式

采用语义化提交规范：

```
<type>: <description>
```

| Type | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat: 添加用户认证模块与文章 API` |
| `fix` | Bug 修复 | `fix: 修复登录后跳转失败问题` |
| `docs` | 文档更新 | `docs: 更新 API 接口说明` |
| `refactor` | 重构 | `refactor: 提取数据库初始化逻辑` |
| `test` | 测试 | `test: 补充论坛模块测试用例` |
| `chore` | 杂项 | `chore: 升级 express 至 4.21.0` |

**规则：**

- 消息使用中文描述
- 首行不超过 72 个字符
- 一个提交只做一件事

### 5.3 PR 流程与合并条件

```
1. 从 main 分支切出功能分支
   git checkout -b feature/new-module

2. 开发并提交代码
   git add <files>
   git commit -m "feat: 添加新模块功能"

3. 推送并创建 PR
   git push -u origin feature/new-module

4. CI 自动运行测试

5. 审查通过后合并到 main
   - 使用 Squash Merge 合并
   - 删除功能分支
```

**合并条件：**

- [ ] 全部测试通过
- [ ] 覆盖率不低于 80%
- [ ] 至少 1 名审查者批准
- [ ] 无冲突

### 5.4 版本标签管理

采用语义化版本号 `vMAJOR.MINOR.PATCH`：

| 版本类型 | 触发条件 | 示例 |
|----------|----------|------|
| MAJOR | 不兼容的 API 变更 | `v2.0.0` |
| MINOR | 向下兼容的新功能 | `v1.1.0` |
| PATCH | 向下兼容的 Bug 修复 | `v1.0.1` |

**打标签示例：**

```bash
git tag -a v1.0.0 -m "首个正式版本"
git push origin v1.0.0
```

---

## 6. 部署流程

### 6.1 服务器环境要求

| 项目 | 最低要求 | 推荐配置 |
|------|----------|----------|
| CPU | 1 核 | 2 核 |
| 内存 | 1 GB | 1.6 GB+ |
| 磁盘 | 10 GB | 20 GB SSD |
| 操作系统 | Ubuntu 20.04 LTS | Ubuntu 22.04 LTS |
| Node.js | 18.x | 20.x LTS |
| Nginx | 1.18+ | 1.24+ |

### 6.2 Nginx 配置说明

Nginx 同时服务前端静态文件与后端 API 反向代理：

```nginx
server {
    listen 80;
    server_name brucetanghao.com www.brucetanghao.com;

    # 前端静态文件
    root /var/www/tanghao;
    index index.html;

    # docsify 路由：所有非文件请求回退到 index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 反向代理
    location /api/ {
        proxy_pass http://127.0.0.1:4001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 健康检查（可选，供监控系统使用）
    location = /api/health {
        proxy_pass http://127.0.0.1:4001/api/health;
    }

    # 静态资源缓存
    location ~* \.(md|css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1h;
        add_header Cache-Control "public, no-transform";
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    gzip_min_length 1024;
}
```

**SSL 配置（HTTPS）：**

```nginx
server {
    listen 443 ssl http2;
    server_name brucetanghao.com www.brucetanghao.com;

    ssl_certificate /etc/letsencrypt/live/brucetanghao.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/brucetanghao.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # 其余配置与 80 端口一致
    root /var/www/tanghao;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:4001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# 80 端口重定向到 443
server {
    listen 80;
    server_name brucetanghao.com www.brucetanghao.com;
    return 301 https://$host$request_uri;
}
```

### 6.3 后端服务部署

#### 6.3.1 使用 PM2 部署

```bash
# 安装 PM2
npm install -g pm2@5

# 启动后端服务
cd /var/www/tanghao/server
pm2 start src/app.js --name brucetanghao-server

# 设置开机自启
pm2 startup
pm2 save

# 常用命令
pm2 status                    # 查看状态
pm2 logs brucetanghao-server   # 查看日志
pm2 restart brucetanghao-server
pm2 stop brucetanghao-server
```

#### 6.3.2 使用 systemd 部署

```bash
# 创建服务文件
sudo vim /etc/systemd/system/brucetanghao.service
```

```ini
[Unit]
Description=BruceTang Portfolio Backend Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/tanghao/server
ExecStart=/usr/bin/node src/app.js
Restart=on-failure
RestartSec=5
Environment=PORT=4001
Environment=JWT_SECRET=your-production-secret
Environment=JWT_EXPIRES_IN=7d

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl start brucetanghao
sudo systemctl enable brucetanghao
sudo systemctl status brucetanghao
```

### 6.4 SSL 证书申请与配置

使用 Let's Encrypt 免费证书：

```bash
# 安装 Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# 申请证书（自动修改 Nginx 配置）
sudo certbot --nginx -d brucetanghao.com -d www.brucetanghao.com

# 测试自动续期
sudo certbot renew --dry-run

# 证书续期计划任务（Certbot 自动添加）
# 证书有效期 90 天，建议每 60 天自动续期
```

### 6.5 备案要求与流程

#### 6.5.1 ICP 备案

| 步骤 | 说明 | 预计时间 |
|------|------|----------|
| 1. 准备材料 | 身份证、域名证书、服务器信息 | 1 天 |
| 2. 提交申请 | 通过云服务商备案系统提交 | 1 天 |
| 3. 初审 | 云服务商审核材料 | 1-2 天 |
| 4. 管局审核 | 通信管理局审批 | 7-20 个工作日 |
| 5. 备案完成 | 获取备案号 | - |

#### 6.5.2 公安备案

ICP 备案完成后 30 日内进行公安备案：

| 步骤 | 说明 |
|------|------|
| 1. 注册账号 | 全国公安机关互联网站安全管理服务平台 |
| 2. 提交信息 | 网站信息、负责人信息 |
| 3. 等待审核 | 一般 3-10 个工作日 |
| 4. 添加备案号 | 在网站底部展示 ICP 备案号与公安备案号 |

#### 6.5.3 备案号展示

网站底部需展示：

```html
<footer>
    <p>
        <a href="https://beian.miit.gov.cn/" target="_blank">京ICP备XXXXXXXX号</a>
        |
        <a href="http://www.beian.gov.cn/" target="_blank">京公网安备XXXXXXXXXXXXX号</a>
    </p>
</footer>
```

---

## 7. 测试规范

### 7.1 单元测试要求

| 项目 | 要求 |
|------|------|
| 覆盖率 | >= 80%（当前 91.03%） |
| 语句覆盖 | >= 80% |
| 分支覆盖 | >= 80% |
| 函数覆盖 | >= 80% |
| 行覆盖 | >= 80% |
| 测试隔离 | 使用内存模式，不写磁盘 |
| 命名 | `describe` 描述模块，`test` 描述场景 |

**测试模式说明：**

```javascript
// 每个测试文件头部必须切换内存模式
process.env.JWT_SECRET = "test-secret";
const { setMemoryMode } = require("../src/db");
setMemoryMode();

const app = require("../src/app");
const { closeDb } = require("../src/db");

afterAll(() => {
    closeDb();
});
```

### 7.2 集成测试场景

| 场景 | 涉及模块 | 说明 |
|------|----------|------|
| 注册→登录→创建文章→更新→删除 | auth + articles | 完整文章生命周期 |
| 注册→登录→创建书籍→评分校验→删除 | auth + books | 书籍 CRUD + 字段校验 |
| 注册→登录→创建项目→标签规范化→删除 | auth + projects | 项目 CRUD + 标签处理 |
| 注册→登录→创建主题→回复→删除主题 | auth + forum | 主题 + 回复 + 级联删除 |
| 双用户权限隔离 | auth + 任意 CRUD | 非作者操作返回 403 |
| Token 过期/无效 | auth middleware | 返回 401 |

### 7.3 安全测试要求

| 测试项 | 验证内容 | 预期结果 |
|--------|----------|----------|
| 未认证访问 | 不带 token 访问受保护接口 | 返回 401 |
| 无效 token | 携带错误格式 token | 返回 401 |
| 错误 scheme | `Authorization: Basic abc` | 返回 401 |
| 越权修改 | 用户 A 修改用户 B 的资源 | 返回 403 |
| 越权删除 | 用户 A 删除用户 B 的资源 | 返回 403 |
| 密码泄露 | API 响应包含 password_hash | 不包含 |
| 重复注册 | 已存在的用户名/邮箱 | 返回 409 |
| 参数校验 | 缺少必填字段、格式错误 | 返回 400 |
| SQL/NoSQL 注入 | 特殊字符作为输入 | 正常处理或拒绝 |

### 7.4 测试文件命名与组织

| 规则 | 说明 | 示例 |
|------|------|------|
| 文件位置 | `server/tests/` 目录下 | `tests/auth.test.js` |
| 文件命名 | `<模块名>.test.js` | `articles.test.js` |
| 测试框架 | Jest | - |
| 测试工具 | supertest | HTTP 接口测试 |
| 测试环境 | `--testEnvironment=node` | Node 环境（非 jsdom） |
| 覆盖率报告 | `--coverage` | 输出到 `coverage/` 目录 |

**当前测试文件清单：**

| 文件 | 测试数 | 覆盖模块 |
|------|--------|----------|
| `auth.test.js` | ~16 | 注册、登录、登出、获取当前用户 |
| `articles.test.js` | ~13 | 文章 CRUD + 权限校验 |
| `books.test.js` | ~22 | 书籍 CRUD + 字段校验 |
| `projects.test.js` | ~22 | 项目 CRUD + 标签处理 |
| `forum.test.js` | ~25 | 主题/回复 + 级联删除 |
| `middleware.test.js` | ~6 | 内存模式、authOptional |
| **合计** | **101+** | **总覆盖率 91.03%** |

---

> 本文档随项目演进持续更新，最新版本以仓库 `docs/PROJECT_RULES.md` 为准。
