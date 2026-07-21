# BruceTang 个人作品集 - 开发指南

> 本文档记录个人作品集网站从零到上线的完整开发过程，
> 包含技术选型、页面设计、模块规划、开发步骤、测试方法与上线标准。

---

## 目录

1. [技术选型](#1-技术选型)
2. [页面结构设计](#2-页面结构设计)
3. [功能模块规划](#3-功能模块规划)
4. [开发步骤](#4-开发步骤)
5. [测试方法](#5-测试方法)
6. [上线标准](#6-上线标准)

---

## 1. 技术选型

### 1.1 前端选型对比

| 维度 | docsify 4.x | Astro | Next.js | Vue 3 |
|------|-------------|-------|---------|-------|
| 构建方式 | 无构建，运行时渲染 | SSG 静态生成 | SSR/SSG | SPA/SSR |
| 内容格式 | Markdown 原生 | Markdown + 组件 | JSX + MDX | SFC + 组件 |
| 学习成本 | 极低 | 中 | 高 | 中 |
| 部署复杂度 | 极低（纯静态） | 低 | 中 | 中 |
| 主题能力 | CSS 变量覆盖 | 组件样式 | 完整主题系统 | 完整主题系统 |
| 搜索功能 | 内置插件 | 需集成 | 需集成 | 需集成 |
| 包体积 | ~100KB（CDN） | 按页面拆分 | 较大 | 中等 |
| 适用场景 | 文档/博客 | 内容站 | 全功能应用 | 交互式应用 |

**选择：docsify 4.x**

理由：
- 个人作品集以 Markdown 内容为主，docsify 运行时渲染无需构建步骤
- 零配置启动，CDN 引入即可使用
- 内置搜索、侧边栏、代码高亮等插件
- 通过 CSS 变量可灵活实现主题切换
- 部署仅需静态文件服务器，对 2 核 1.6G 服务器极其友好

### 1.2 后端选型对比

| 维度 | Express 4.21 | Fastify 4 | FastAPI |
|------|-------------|-----------|---------|
| 语言 | Node.js | Node.js | Python |
| 性能 | 中等 | 高 | 中等 |
| 生态 | 极丰富 | 丰富 | 丰富 |
| 学习成本 | 低 | 低 | 中 |
| 中间件生态 | 极丰富 | 中等 | 中等 |
| 原生依赖风险 | 无 | 无 | 可能需要编译 |
| 部署方式 | node 进程 | node 进程 | uvicorn/gunicorn |
| 适合场景 | 中小项目 | 高并发 API | 数据处理/ML |

**选择：Express 4.21**

理由：
- 后端逻辑简单（5 个 CRUD 模块），Express 足够
- 生态成熟，中间件丰富（cors、express-validator 等）
- 纯 JS 实现，无原生编译依赖
- 与前端同语言栈，降低维护成本
- 对低配服务器友好，内存占用低

### 1.3 数据存储选型对比

| 维度 | JSON 文件 | SQLite | PostgreSQL |
|------|-----------|--------|------------|
| 类型 | 文件 | 嵌入式数据库 | 客户端/服务器 |
| 安装 | 无需安装 | 需 npm 包 | 需独立服务 |
| 原生依赖 | 无 | 可能有 | 需要 |
| 并发写入 | 单进程同步 | WAL 模式 | MVCC |
| 查询能力 | JS Array.filter | SQL | 完整 SQL |
| 数据量上限 | ~10MB | ~1TB | 无限 |
| 备份方式 | 复制文件 | 复制文件 | pg_dump |
| 适合场景 | 原型/小项目 | 中型应用 | 生产级应用 |

**选择：JSON 文件**

理由：
- 个人作品集数据量小（文章、书籍、项目各数十条）
- 2 核 1.6G 服务器避免原生模块编译导致 OOM
- 自定义同步 IO 简化路由代码（无需 async/await）
- 临时文件 + rename 保证写入原子性
- 测试时可切换内存模式，零磁盘 IO

### 1.4 选择理由与适用场景总结

| 选型决策 | 核心考量 | 适用场景 |
|----------|----------|----------|
| docsify 前端 | Markdown 内容为主，零构建，低配服务器 | 个人博客、文档站、作品集 |
| Express 后端 | CRUD 简单，生态成熟，纯 JS 无原生依赖 | 小型 API 服务、原型开发 |
| JSON 文件存储 | 数据量小，避免原生编译，测试隔离方便 | 小型项目、开发原型、低配服务器 |

> **迁移路径**：若未来数据量增长或需要高并发，可平滑迁移至 SQLite（npm 包 `better-sqlite3`）或 PostgreSQL。

---

## 2. 页面结构设计

### 2.1 首页布局设计

首页（`README.md`）采用分区式布局：

```
┌─────────────────────────────────────────────┐
│  [侧边栏]  │         [顶部用户状态条]        │
│            │                          [🎨] │  ← 主题选择器
│  首页      │  ┌──────────────────────────┐  │
│            │  │   Hero 区：站点介绍       │  │
│  文字作品  │  │   > 记录所学、所思、所做   │  │
│   - 技术   │  └──────────────────────────┘  │
│   - 随笔   │                                │
│            │  ## 文字作品                    │
│  作品展示  │  - 技术文章链接                 │
│   - 书籍   │  - 思考与随笔链接               │
│   - 项目   │                                │
│   - 论坛   │  ## 作品展示                    │
│            │  - 书籍 / 项目 / 论坛链接        │
│  GitHub    │                                │
│            │  ## GitHub 活跃                  │
│  关于我    │  - 活跃记录链接                 │
│            │                                │
│  账号      │  ## 项目作品                    │
│   - 登录   │  - OpenAlpha / 博客系统         │
│   - 注册   │                                │
│            │  ## 关于我                      │
│            │  - 个人简介链接                 │
└─────────────────────────────────────────────┘
```

### 2.2 侧边栏导航设计

侧边栏（`_sidebar.md`）采用层级分组：

```
- 首页

- 文字作品
  - 技术文章
    - 编程学习笔记
    - 服务器运维手记
    - 数据库实践
  - 思考与随笔
    - 读书笔记
    - 生活随笔

- 作品展示
  - 书籍
  - 开源项目
  - 讨论区

- GitHub 活跃

- 项目作品
  - OpenAlpha
  - 个人博客系统

- 关于我

- 账号
  - 登录
  - 注册
```

### 2.3 内容页面模板

#### 2.3.1 列表展示页模板（书籍/项目）

```markdown
# [页面标题]

> [一句话描述]

[页面内容介绍]

---

<div class="[模块名]-grid">
    <a class="[模块名]-card" href="[详情链接]">
        <div class="[模块名]-head">
            <h3 class="[模块名]-name">[标题]</h3>
            <span class="[模块名]-stars">★ [数值]</span>
        </div>
        <p class="[模块名]-desc">[描述]</p>
        <div class="[模块名]-tags">
            <span class="[模块名]-tag">[标签]</span>
        </div>
    </a>
</div>

<style>
/* 网格布局 */
.[模块名]-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
    margin: 16px 0 24px;
}
/* 卡片样式 */
.[模块名]-card {
    background: #fff;
    border-radius: 10px;
    padding: 18px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.[模块名]-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.12);
}
</style>
```

#### 2.3.2 认证表单页模板（登录/注册）

```markdown
# [登录/注册]

> [引导文案]

<form id="[form-id]" class="auth-form">
  <div class="form-group">
    <label for="[input-id]">[字段名]</label>
    <input type="[text/password/email]" id="[input-id]" name="[name]" required>
  </div>
  <button type="submit" class="auth-btn">[按钮文案]</button>
  <p class="auth-tip">[切换链接]</p>
  <p id="[msg-id]" class="auth-msg"></p>
</form>

<style>
.auth-form { max-width: 400px; margin: 20px auto; padding: 24px; }
.auth-btn { width: 100%; padding: 12px; background: #42b983; color: #fff; }
.auth-msg.error { color: #dc3545; }
.auth-msg.success { color: #28a745; }
</style>

<script>
document.getElementById("[form-id]").addEventListener("submit", async (e) => {
    e.preventDefault();
    // 表单处理逻辑
});
</script>
```

#### 2.3.3 GitHub 活跃页模板

```markdown
# GitHub 活跃记录

<div id="gh-loading">正在加载 GitHub 数据...</div>
<div id="gh-error" style="display:none;"></div>
<div id="gh-profile" style="display:none;"></div>

## 贡献热力图
<div id="gh-heatmap"></div>

## 最近活动
<div id="gh-events"></div>

<script>
// 1. 并行拉取用户信息与活动数据
// 2. Promise.allSettled 容错
// 3. 渲染热力图（CSS grid）
// 4. 渲染活动列表
</script>
```

### 2.4 响应式断点设计

| 断点名称 | 屏幕宽度 | 适配设备 | 布局调整 |
|----------|----------|----------|----------|
| `desktop` | > 1024px | PC 显示器 | 默认布局，侧边栏固定，内容区居中 |
| `tablet` | <= 1024px | iPad / 平板 | 内容区宽度 90% |
| `mobile` | <= 768px | 手机 | 侧边栏抽屉式，主题面板缩窄，字号缩小 |

**CSS 实现示例：**

```css
/* 平板 */
@media (max-width: 1024px) {
    .markdown-section { max-width: 90% !important; }
}

/* 移动端 */
@media (max-width: 768px) {
    .theme-picker-btn { width: 36px; height: 36px; }
    .theme-panel { width: 180px; }
    .markdown-section { max-width: 95% !important; padding: 16px !important; }
    body.close .sidebar { transform: translateX(-100%); }
    .sidebar-toggle { display: block !important; }
}
```

---

## 3. 功能模块规划

### 3.1 用户认证模块设计

#### 3.1.1 架构设计

```
前端                          后端
┌──────────┐    fetch      ┌──────────────────┐
│  注册页   │ ──────────→  │ POST /api/auth/  │
│  登录页   │              │      register    │
│          │  ←──────────  │ POST /api/auth/  │
│          │   {token}     │      login       │
└────┬─────┘               └────────┬─────────┘
     │                              │
     │ localStorage.setItem         │ bcrypt.hashSync
     │ brucetanghao_token            │ jwt.sign
     │                              │
     ▼                              ▼
┌──────────┐               ┌──────────────────┐
│ 后续请求  │ ──────────→  │ authRequired    │
│ Bearer   │              │ 中间件验证 token │
│  token   │  ←────────── │ 失败返回 401     │
└──────────┘   {data}      └──────────────────┘
```

#### 3.1.2 接口定义

| 方法 | 路径 | 认证 | 入参 | 返回 |
|------|------|------|------|------|
| POST | `/api/auth/register` | 否 | username, email, password | 201 + user + token |
| POST | `/api/auth/login` | 否 | username(或email), password | 200 + user + token |
| POST | `/api/auth/logout` | 是 | - | 200 |
| GET | `/api/auth/me` | 是 | - | 200 + user |

#### 3.1.3 安全设计

- 密码使用 bcryptjs 哈希存储（cost factor 10），不存储明文
- JWT 有效期 7 天，密钥通过环境变量注入
- 响应中不返回 `password_hash` 字段（sanitize 函数过滤）
- 支持用户名或邮箱登录
- 前端通过 localStorage 存储 token，请求头携带 `Authorization: Bearer <token>`

### 3.2 文章管理模块

#### 3.2.1 数据模型

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | number | 自动 | 自增主键 |
| `user_id` | number | 自动 | 创建者 ID |
| `title` | string | 是 | 标题 |
| `slug` | string | 是 | URL 标识（唯一） |
| `content` | string | 否 | 正文（默认空字符串） |
| `status` | string | 否 | `published` / `draft`（默认 draft） |

#### 3.2.2 接口定义

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/api/articles` | 否 | 获取已发布文章列表（不含 content） |
| GET | `/api/articles/:slug` | 否 | 获取单篇文章 |
| POST | `/api/articles` | 是 | 创建文章 |
| PUT | `/api/articles/:slug` | 是 | 更新文章（仅作者） |
| DELETE | `/api/articles/:slug` | 是 | 删除文章（仅作者） |

#### 3.2.3 权限模型

- 公开列表仅返回 `status = "published"` 的文章
- 详情接口返回任意状态的文章（便于作者预览草稿）
- 修改和删除操作仅限文章作者（`user_id` 匹配）

### 3.3 书籍管理模块

#### 3.3.1 数据模型

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | number | 自动 | 自增主键 |
| `user_id` | number | 自动 | 创建者 ID |
| `title` | string | 是 | 书名 |
| `slug` | string | 是 | URL 标识（唯一） |
| `author` | string | 否 | 原作者（默认空） |
| `description` | string | 否 | 简介（默认空） |
| `cover_url` | string | 否 | 封面地址（默认空） |
| `status` | string | 否 | `published` / `draft`（默认 draft） |
| `rating` | number | 否 | 0-5（0 表示未评分，显式提供时必须 1-5） |

#### 3.3.2 校验规则

- `rating` 为 0 时表示未评分，不触发校验
- `rating` 显式提供时必须为 1-5 的整数
- `status` 必须为 `published` 或 `draft`

### 3.4 项目展示模块

#### 3.4.1 数据模型

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | number | 自动 | 自增主键 |
| `user_id` | number | 自动 | 创建者 ID |
| `title` | string | 是 | 项目名称 |
| `slug` | string | 是 | URL 标识（唯一） |
| `description` | string | 否 | 项目简介 |
| `repo_url` | string | 否 | 仓库地址 |
| `demo_url` | string | 否 | 演示地址 |
| `tags` | string[] | 否 | 标签数组（非数组时规范化为空数组） |
| `status` | string | 否 | `published` / `draft`（默认 draft） |
| `stars` | number | 否 | 星标数（默认 0） |

#### 3.4.2 标签规范化

```javascript
function normalizeTags(tags) {
    if (!Array.isArray(tags)) {
        return [];
    }
    return tags.filter((t) => typeof t === "string");
}
```

### 3.5 论坛讨论模块

#### 3.5.1 数据模型

**主题（ForumTopic）：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | number | 自增主键 |
| `user_id` | number | 创建者 ID |
| `title` | string | 标题 |
| `slug` | string | URL 标识（唯一） |
| `content` | string | 正文 |
| `views` | number | 浏览数（详情页自增） |
| `reply_count` | number | 回复数 |
| `created_at` | string | ISO 时间戳 |
| `updated_at` | string | ISO 时间戳 |

**回复（ForumReply）：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | number | 自增主键 |
| `topic_id` | number | 关联主题 ID |
| `user_id` | number | 回复者 ID |
| `content` | string | 回复内容 |
| `created_at` | string | ISO 时间戳 |

#### 3.5.2 接口定义

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/api/forum/topics` | 否 | 主题列表（不含 content） |
| GET | `/api/forum/topics/:slug` | 否 | 主题详情 + 回复列表（自增浏览数） |
| POST | `/api/forum/topics` | 是 | 创建主题 |
| POST | `/api/forum/topics/:slug/replies` | 是 | 创建回复 |
| DELETE | `/api/forum/topics/:slug` | 是 | 删除主题 + 级联清理回复 |

#### 3.5.3 特殊逻辑

- 主题列表不含 `content` 字段，减少传输体积
- 主题详情接口自增 `views` 并持久化
- 回复按创建时间正序排列
- 删除主题时级联删除该主题下的所有回复
- 创建回复时同步更新主题的 `reply_count` 和 `updated_at`

### 3.6 GitHub 活跃记录模块

#### 3.6.1 数据来源

| API | URL | 说明 |
|-----|-----|------|
| 用户信息 | `https://api.github.com/users/HaoTang9878` | 头像、简介、仓库数、关注者 |
| 公开活动 | `https://api.github.com/users/HaoTang9878/events/public` | 最近 30 条公开事件 |

#### 3.6.2 渲染组件

| 组件 | 说明 |
|------|------|
| 用户信息卡片 | 头像、姓名、简介、仓库数/关注者/关注中 |
| 贡献热力图 | CSS Grid 模拟 GitHub contribution graph（371 格 = 53 周 × 7 天） |
| 活动列表 | 事件类型、仓库名、时间、提交信息、SHA |

#### 3.6.3 事件类型映射

| GitHub 事件 | 中文显示 |
|-------------|----------|
| PushEvent | 提交 |
| CreateEvent | 创建 |
| ForkEvent | Fork |
| WatchEvent | Star |
| PullRequestEvent | PR |
| IssuesEvent | Issue |
| IssueCommentEvent | 评论 |
| ReleaseEvent | 发布 |

#### 3.6.4 安全与容错

- `Promise.allSettled` 并行请求，任一失败不影响另一个
- 10 秒超时控制（AbortController）
- `escapeHTML` 函数防止 XSS 注入
- 两个请求都失败才显示错误信息

### 3.7 主题选择器模块

#### 3.7.1 架构设计

```
用户点击主题
    │
    ▼
applyTheme(theme)
    │
    ├── 更新 CSS 变量 (--bt-theme-color, --bt-bg-gradient, ...)
    ├── 切换暗色模式 (body.bt-dark-mode)
    ├── 同步 docsify themeColor
    ├── 更新侧边栏激活色
    └── localStorage 持久化
```

#### 3.7.2 主题配置表

```javascript
const BT_THEMES = [
    { id: "green",       name: "翠绿",    color: "#42b983", dark: false },
    { id: "blue",        name: "深海蓝",  color: "#1976d2", dark: false },
    { id: "orange",      name: "暖阳橙",  color: "#f57c00", dark: false },
    { id: "rose",        name: "玫瑰红",  color: "#e91e63", dark: false },
    { id: "purple",       name: "暗夜紫",  color: "#7b1fa2", dark: false },
    { id: "cyan",        name: "极客青",  color: "#00bcd4", dark: false },
    { id: "dark-green",  name: "暗夜翠",  color: "#42b983", dark: true  },
    { id: "dark-blue",   name: "暗夜蓝",  color: "#64b5f6", dark: true  },
    { id: "dark-purple", name: "极夜紫",  color: "#ba68c8", dark: true  }
];
```

#### 3.7.3 持久化策略

- localStorage Key：`brucetanghao_theme`
- 存储完整主题对象（JSON 序列化）
- 页面加载时读取并应用已保存的主题
- localStorage 不可用时仅本次会话生效，不影响使用

---

## 4. 开发步骤

### 4.1 从零搭建 docsify 前端

#### 步骤 1：创建项目入口

创建 `index.html`，引入 docsify CDN 与插件：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BruceTang的作品集</title>
    <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/docsify@4/lib/themes/vue.css">
</head>
<body>
    <div id="app">加载中...</div>
    <script>
        window.$docsify = {
            name: "BruceTang的作品集",
            repo: "HaoTang9878/tanghao",
            homepage: "README.md",
            loadSidebar: true,
            search: { placeholder: "搜索文章", noData: "没有找到结果", depth: 3 }
        };
    </script>
    <script src="//cdn.jsdelivr.net/npm/docsify@4"></script>
</body>
</html>
```

#### 步骤 2：创建首页与侧边栏

创建 `README.md` 作为首页内容，`_sidebar.md` 作为导航配置。

#### 步骤 3：添加内容页面

创建文章、书籍、项目、论坛等 Markdown 页面。

#### 步骤 4：启动本地预览

```bash
python3 -m http.server 3000
# 访问 http://localhost:3000
```

### 4.2 搭建 Express 后端

#### 步骤 1：初始化项目

```bash
mkdir server && cd server
npm init -y
npm install express@4.21.0 cors@2.8.5 jsonwebtoken@9.0.2 bcryptjs@2.4.3 express-validator@7.2.0
npm install --save-dev jest@29.7.0 supertest@7.0.0
```

#### 步骤 2：创建应用入口

```javascript
// server/src/app.js
const express = require("express");
const cors = require("cors");
const { initDb } = require("./db");

const app = express();
initDb();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 路由注册...
app.use("/api/auth", require("./routes/auth"));
app.use("/api/articles", require("./routes/articles"));
// ...

if (require.main === module) {
    const PORT = process.env.PORT || 4001;
    app.listen(PORT, () => {
        console.log(`listening on http://127.0.0.1:${PORT}`);
    });
}

module.exports = app;
```

#### 步骤 3：创建存储层

```javascript
// server/src/db/index.js
const fs = require("fs");
const path = require("path");
const DB_PATH = path.join(__dirname, "..", "..", "data", "db.json");
// 同步 IO + 临时文件 rename + 内存模式切换
```

#### 步骤 4：配置 package.json scripts

```json
{
    "scripts": {
        "start": "node src/app.js",
        "dev": "node --watch src/app.js",
        "test": "jest --coverage --testEnvironment=node"
    }
}
```

### 4.3 实现 JWT 认证

#### 步骤 1：编写认证中间件

```javascript
// server/src/middleware/auth.js
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function authRequired(req, res, next) {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");
    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ error: "未提供有效的认证令牌" });
    }
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        return res.status(401).json({ error: "认证令牌无效或已过期" });
    }
}
```

#### 步骤 2：编写 User Model

```javascript
// server/src/db/user.js
const bcrypt = require("bcryptjs");
const { getDb, writeDb } = require("./index");

function createUser({ username, email, password, displayName }) {
    const db = getDb();
    const passwordHash = bcrypt.hashSync(password, 10);
    // ... 创建用户并持久化
}

function verifyPassword(plainText, hash) {
    return bcrypt.compareSync(plainText, hash);
}
```

#### 步骤 3：编写认证路由

```javascript
// server/src/routes/auth.js
router.post("/register", [校验规则], (req, res) => {
    // 1. 参数校验
    // 2. 唯一性校验（用户名 + 邮箱）
    // 3. 创建用户 + 签发 token
    // 4. 返回 201
});

router.post("/login", [校验规则], (req, res) => {
    // 1. 参数校验
    // 2. 查找用户（支持用户名或邮箱）
    // 3. 验证密码
    // 4. 签发 token，返回用户信息（不含密码）
});
```

### 4.4 实现 CRUD API

以文章模块为例，其余模块（书籍、项目、论坛）结构一致：

```javascript
// server/src/routes/articles.js
const router = express.Router();

// 公开接口
router.get("/", (req, res) => { /* 列表 */ });
router.get("/:slug", (req, res) => { /* 详情 */ });

// 需认证接口
router.post("/", authRequired, (req, res) => {
    // 1. 参数校验（title, slug 必填）
    // 2. slug 唯一性校验
    // 3. 创建并持久化
    // 4. 返回 201
});

router.put("/:slug", authRequired, (req, res) => {
    // 1. 查找文章
    // 2. 权限校验（user_id 匹配）
    // 3. 按字段更新
    // 4. 持久化，返回 200
});

router.delete("/:slug", authRequired, (req, res) => {
    // 1. 查找文章
    // 2. 权限校验
    // 3. 删除并持久化
    // 4. 返回 200
});
```

### 4.5 添加主题系统

#### 步骤 1：定义 CSS 变量

```css
:root {
    --bt-theme-color: #42b983;
    --bt-bg-gradient: linear-gradient(135deg, #f0f9f4 0%, #e3f5eb 100%);
    --bt-text-color: #34495e;
    --bt-sidebar-bg: #fff;
    --bt-content-bg: #fff;
    --bt-border-color: #eee;
}
```

#### 步骤 2：编写主题选择器 UI

浮动按钮 + 展开面板：

```html
<div class="theme-picker">
    <button class="theme-picker-btn" id="theme-picker-btn">
        <svg><!-- 调色板图标 --></svg>
    </button>
    <div class="theme-panel" id="theme-panel">
        <p class="theme-panel-title">选择主题</p>
        <ul class="theme-list" id="theme-list"></ul>
    </div>
</div>
```

#### 步骤 3：编写主题切换逻辑

```javascript
function applyTheme(theme) {
    // 更新 CSS 变量
    document.documentElement.style.setProperty("--bt-theme-color", theme.color);
    document.documentElement.style.setProperty("--bt-bg-gradient", theme.gradient);
    // 暗色模式切换
    if (theme.dark) {
        document.body.classList.add("bt-dark-mode");
        // 暗色变量
    } else {
        document.body.classList.remove("bt-dark-mode");
        // 亮色变量
    }
    // 同步 docsify themeColor
    if (window.$docsify) window.$docsify.themeColor = theme.color;
    // 持久化
    localStorage.setItem("brucetanghao_theme", JSON.stringify(theme));
}
```

### 4.6 添加 GitHub 集成

#### 步骤 1：创建 GitHub 活跃页

在 `github.md` 中编写页面结构与样式。

#### 步骤 2：编写数据拉取逻辑

```javascript
async function fetchJSON(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
        const res = await fetch(url, {
            signal: controller.signal,
            headers: { "Accept": "application/vnd.github+json" }
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        return await res.json();
    } finally {
        clearTimeout(timer);
    }
}
```

#### 步骤 3：编写渲染逻辑

- `renderProfile(user)` - 用户信息卡片
- `renderHeatmap(events)` - 贡献热力图（371 格 CSS Grid）
- `renderEvents(events)` - 活动列表（类型映射 + HTML 转义）

#### 步骤 4：入口函数

```javascript
async function init() {
    const results = await Promise.allSettled([
        fetchJSON(USER_API),
        fetchJSON(EVENTS_API)
    ]);
    // 容错处理 + 渲染
}
```

### 4.7 部署上线

#### 步骤 1：服务器准备

```bash
# 安装 Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs nginx

# 克隆代码
git clone https://github.com/HaoTang9878/tanghao.git /var/www/tanghao
cd /var/www/tanghao/server
npm install --production
```

#### 步骤 2：配置 Nginx

参见 [PROJECT_RULES.md - Nginx 配置说明](./PROJECT_RULES.md#62-nginx-配置说明)。

#### 步骤 3：启动后端服务

```bash
# 使用 PM2
npm install -g pm2@5
pm2 start src/app.js --name brucetanghao-server
pm2 startup && pm2 save
```

#### 步骤 4：申请 SSL 证书

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d brucetanghao.com -d www.brucetanghao.com
```

#### 步骤 5：完成备案

- ICP 备案：通过云服务商提交
- 公安备案：ICP 备案完成后 30 日内
- 在网站底部添加备案号

---

## 5. 测试方法

### 5.1 单元测试编写指南

#### 5.1.1 测试文件结构

```javascript
/**
 * [模块名] API 单元测试
 * 覆盖[测试场景列表]
 */
const request = require("supertest");

// 关键：在 require app 之前切换内存模式
process.env.JWT_SECRET = "test-secret";
const { setMemoryMode } = require("../src/db");
setMemoryMode();

const app = require("../src/app");
const { closeDb } = require("../src/db");

// 测试数据准备
let token;
let otherToken;
const TEST_SLUG = "test-slug";

beforeAll(async () => {
    // 注册并登录测试用户
});

afterAll(() => {
    closeDb();
});
```

#### 5.1.2 测试用例编写规范

```javascript
describe("模块名 METHOD /api/path", () => {
    test("正常场景描述", async () => {
        const res = await request(app)
            .post("/api/articles")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "标题", slug: "slug" });
        expect(res.status).toBe(201);
        expect(res.body.article.slug).toBe("slug");
    });

    test("异常场景描述", async () => {
        const res = await request(app)
            .post("/api/articles")
            .send({ title: "无slug" });
        expect(res.status).toBe(400);
    });
});
```

#### 5.1.3 测试覆盖率要求

| 指标 | 最低要求 | 当前值 |
|------|----------|--------|
| 语句覆盖 | 80% | 91.03% |
| 分支覆盖 | 80% | 84.84% |
| 函数覆盖 | 80% | 89.33% |
| 行覆盖 | 80% | 92% |

### 5.2 集成测试场景设计

#### 5.2.1 完整文章生命周期

```javascript
test("注册→登录→创建→更新→删除完整流程", async () => {
    // 1. 注册
    const reg = await request(app).post("/api/auth/register")
        .send({ username: "user1", email: "u1@test.com", password: "pass123456" });

    // 2. 登录
    const login = await request(app).post("/api/auth/login")
        .send({ username: "user1", password: "pass123456" });
    const token = login.body.token;

    // 3. 创建文章
    const create = await request(app).post("/api/articles")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "测试", slug: "test", status: "published" });
    expect(create.status).toBe(201);

    // 4. 更新文章
    const update = await request(app).put("/api/articles/test")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "更新标题" });
    expect(update.status).toBe(200);

    // 5. 删除文章
    const del = await request(app).delete("/api/articles/test")
        .set("Authorization", `Bearer ${token}`);
    expect(del.status).toBe(200);
});
```

#### 5.2.2 权限隔离测试

```javascript
test("用户 A 无法修改用户 B 的文章", async () => {
    // 用户 A 创建文章
    // 用户 B 尝试修改 → 403
    // 用户 B 尝试删除 → 403
});
```

#### 5.2.3 论坛级联删除测试

```javascript
test("删除主题同时清理关联回复", async () => {
    // 创建主题 + 回复
    // 删除主题
    // 验证 forum_replies 中该 topic_id 的回复数为 0
});
```

### 5.3 API 测试（curl 示例）

#### 5.3.1 认证接口

```bash
# 注册
curl -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"bruce","email":"bruce@example.com","password":"secret123"}'

# 登录
curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"bruce","password":"secret123"}'

# 获取当前用户（需替换 TOKEN）
curl http://localhost:4001/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

#### 5.3.2 文章接口

```bash
# 文章列表
curl http://localhost:4001/api/articles

# 文章详情
curl http://localhost:4001/api/articles/first-post

# 创建文章（需认证）
curl -X POST http://localhost:4001/api/articles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"我的文章","slug":"my-post","content":"内容","status":"published"}'

# 更新文章
curl -X PUT http://localhost:4001/api/articles/my-post \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"新标题"}'

# 删除文章
curl -X DELETE http://localhost:4001/api/articles/my-post \
  -H "Authorization: Bearer TOKEN"
```

#### 5.3.3 书籍接口

```bash
# 创建书籍
curl -X POST http://localhost:4001/api/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"代码大全","slug":"code-complete","author":"Steve McConnell","rating":5,"status":"published"}'

# 书籍列表
curl http://localhost:4001/api/books
```

#### 5.3.4 项目接口

```bash
# 创建项目
curl -X POST http://localhost:4001/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"OpenAlpha","slug":"open-alpha","tags":["ai","node"],"status":"published","stars":128}'

# 项目列表
curl http://localhost:4001/api/projects
```

#### 5.3.5 论坛接口

```bash
# 创建主题
curl -X POST http://localhost:4001/api/forum/topics \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"讨论话题","slug":"discussion","content":"正文"}'

# 主题列表
curl http://localhost:4001/api/forum/topics

# 主题详情（含回复）
curl http://localhost:4001/api/forum/topics/discussion

# 创建回复
curl -X POST http://localhost:4001/api/forum/topics/discussion/replies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"content":"我的回复"}'

# 删除主题
curl -X DELETE http://localhost:4001/api/forum/topics/discussion \
  -H "Authorization: Bearer TOKEN"
```

#### 5.3.6 健康检查

```bash
curl http://localhost:4001/api/health
# {"status":"ok","timestamp":"2026-07-22T..."}
```

### 5.4 前端页面验证

| 验证项 | 验证方法 | 预期结果 |
|--------|----------|----------|
| 首页加载 | 访问 `http://localhost:3000` | 显示首页内容，侧边栏正常 |
| 侧边栏导航 | 点击各导航项 | 正确跳转到对应页面 |
| 主题切换 | 点击浮动按钮，选择不同主题 | 页面颜色实时变化，刷新后保持 |
| 暗色模式 | 选择暗色主题 | 背景变深，文字变白 |
| 登录流程 | 填写表单 → 提交 | 成功后跳转首页，顶部显示用户名 |
| 注册流程 | 填写表单 → 提交 | 成功后自动登录并跳转首页 |
| 登出 | 点击登出链接 | 清除 token，显示登录/注册入口 |
| GitHub 页面 | 访问 `#/github` | 加载并显示热力图与活动列表 |
| 响应式 | 缩小浏览器窗口 | 布局自适应，移动端侧边栏可折叠 |
| 搜索 | 使用搜索框搜索关键词 | 显示匹配结果 |

---

## 6. 上线标准

### 6.1 功能完整性检查清单

- [ ] 前端首页正常加载
- [ ] 侧边栏所有导航项可正常跳转
- [ ] 9 套主题均可切换并持久化
- [ ] 暗色模式样式正确
- [ ] 注册功能正常（参数校验 + 唯一性校验）
- [ ] 登录功能正常（用户名 + 邮箱）
- [ ] 登出功能正常
- [ ] 文章 CRUD 全流程正常
- [ ] 书籍 CRUD 全流程正常（含评分校验）
- [ ] 项目 CRUD 全流程正常（含标签规范化）
- [ ] 论坛主题/回复 CRUD 正常（含级联删除）
- [ ] GitHub 活跃页正常加载
- [ ] 健康检查接口返回 200
- [ ] 响应式布局在 3 个断点下正常
- [ ] 404 页面正常返回错误信息

### 6.2 测试覆盖率要求

| 指标 | 上线标准 | 当前达标 |
|------|----------|----------|
| 测试总数 | >= 100 | 101+ |
| 语句覆盖率 | >= 80% | 91.03% |
| 分支覆盖率 | >= 80% | 84.84% |
| 函数覆盖率 | >= 80% | 89.33% |
| 行覆盖率 | >= 80% | 92% |
| 全部测试通过 | 是 | 是 |

**各模块覆盖率明细：**

| 文件 | 语句覆盖 | 分支覆盖 | 函数覆盖 | 行覆盖 |
|------|----------|----------|----------|--------|
| `routes/auth.js` | 97.22% | 93.75% | 100% | 97.22% |
| `routes/articles.js` | 93.54% | 87.5% | 75% | 94.54% |
| `routes/books.js` | 94.87% | 88.23% | 91.66% | 98.52% |
| `routes/projects.js` | 94.87% | 83.33% | 92.3% | 98.48% |
| `routes/forum.js` | 98.5% | 100% | 92.3% | 98.43% |
| `middleware/auth.js` | 100% | 93.75% | 100% | 100% |

### 6.3 性能基准

| 指标 | 基准要求 | 测试方法 |
|------|----------|----------|
| 首页加载时间 | < 2s | 浏览器开发者工具 Network 面板 |
| API 响应时间 | < 200ms | `curl -w "%{time_total}"` |
| 健康检查响应 | < 50ms | `curl -w "%{time_total}"` |
| 内存占用 | < 150MB | `pm2 monit` 或 `top` |
| 后端启动时间 | < 3s | `time npm start` |
| CDN 资源加载 | < 1s | 浏览器 Network 面板 |

### 6.4 安全检查清单

- [ ] JWT 密钥使用环境变量注入（非硬编码）
- [ ] 生产环境 JWT_SECRET 已修改为高强度随机值
- [ ] 密码使用 bcrypt 哈希存储（不存储明文）
- [ ] API 响应不包含 `password_hash` 字段
- [ ] CORS 配置正确（生产环境限制来源）
- [ ] 所有写操作需要认证（authRequired）
- [ ] 资源修改/删除有权限校验（仅作者）
- [ ] 输入参数有校验（express-validator）
- [ ] 前端用户输入有 HTML 转义（escapeHTML）
- [ ] Nginx 配置 HTTPS 重定向
- [ ] SSL 证书有效且自动续期
- [ ] 无敏感信息提交到 Git（.env、db.json）
- [ ] 依赖无已知高危漏洞（`npm audit`）

### 6.5 备案完成确认

- [ ] ICP 备案已通过
- [ ] 公安备案已提交（ICP 备案后 30 日内）
- [ ] 网站底部展示 ICP 备案号
- [ ] 网站底部展示公安备案号
- [ ] 备案号链接指向工信部/公安备案查询网站
- [ ] 域名 DNS 解析正确指向服务器 IP

---

> 本文档随项目演进持续更新，最新版本以仓库 `docs/DEVELOPMENT_GUIDE.md` 为准。
