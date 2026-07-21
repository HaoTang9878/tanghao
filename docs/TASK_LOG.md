# BruceTang 个人作品集 - 开发任务日志

## 项目概述
基于 docsify 的个人作品集网站，支持多种内容类型（文章、书籍、开源项目、论坛讨论），
包含用户认证系统、主题选择器、GitHub 活跃记录展示。

## 开发阶段记录

### 阶段 1: 基础网站搭建 (feature/auth 分支)
- **时间**: 2026-07-21
- **内容**: docsify 静态站点 + 用户认证后端 + 登录注册页面
- **提交**: 96d99bc feat: 添加用户认证模块与文章 API
- **PR**: #1 feat: 添加用户认证模块与文章 API
- **测试**: 39 个测试通过，覆盖率 85.85%

### 阶段 2: 综合站点扩展 (feature/comprehensive-site 分支)
- **时间**: 2026-07-22
- **框架**: 多智能体并行优化框架
  - Agent A: 后端 API 扩展（书籍/项目/论坛）
  - Agent B: 前端主题选择器 + 内容板块 + GitHub 活跃页

#### Agent A - 后端扩展
- **任务**: Books/Projects/Forum API + 单元测试
- **产出**:
  - server/src/routes/books.js - 书籍 CRUD API
  - server/src/routes/projects.js - 项目 CRUD API
  - server/src/routes/forum.js - 论坛主题/回复 API
  - server/src/db/index.js - 数据库扩展（4 个新集合）
  - server/src/app.js - 路由注册
  - server/tests/books.test.js - 22 个测试
  - server/tests/projects.test.js - 22 个测试
  - server/tests/forum.test.js - 25 个测试
- **测试结果**: 101 个测试全部通过，总覆盖率 91.03%

#### Agent B - 前端扩展
- **任务**: 主题选择器 + 内容板块 + GitHub 活跃记录 + 响应式设计
- **产出**:
  - index.html - 6 主题色选择器 + 响应式 CSS 媒体查询
  - github.md - GitHub 活跃记录页（贡献热力图 + 活动列表）
  - books.md - 书籍板块（卡片式布局）
  - projects.md - 开源项目板块（hover 效果）
  - forum.md - 论坛讨论板块
  - _sidebar.md - 更新导航
  - README.md - 首页总览

## API 接口清单

### 认证 API (/api/auth)
| 方法 | 路径 | 认证 | 说明 |
|---|---|---|---|
| POST | /api/auth/register | 否 | 注册 |
| POST | /api/auth/login | 否 | 登录 |
| POST | /api/auth/logout | 是 | 登出 |
| GET | /api/auth/me | 是 | 获取当前用户 |

### 文章 API (/api/articles)
| 方法 | 路径 | 认证 | 说明 |
|---|---|---|---|
| GET | /api/articles | 否 | 文章列表 |
| GET | /api/articles/:slug | 否 | 文章详情 |
| POST | /api/articles | 是 | 创建文章 |
| PUT | /api/articles/:slug | 是 | 更新文章 |
| DELETE | /api/articles/:slug | 是 | 删除文章 |

### 书籍 API (/api/books)
| 方法 | 路径 | 认证 | 说明 |
|---|---|---|---|
| GET | /api/books | 否 | 书籍列表 |
| GET | /api/books/:slug | 否 | 书籍详情 |
| POST | /api/books | 是 | 创建书籍 |
| PUT | /api/books/:slug | 是 | 更新书籍 |
| DELETE | /api/books/:slug | 是 | 删除书籍 |

### 项目 API (/api/projects)
| 方法 | 路径 | 认证 | 说明 |
|---|---|---|---|
| GET | /api/projects | 否 | 项目列表 |
| GET | /api/projects/:slug | 否 | 项目详情 |
| POST | /api/projects | 是 | 创建项目 |
| PUT | /api/projects/:slug | 是 | 更新项目 |
| DELETE | /api/projects/:slug | 是 | 删除项目 |

### 论坛 API (/api/forum)
| 方法 | 路径 | 认证 | 说明 |
|---|---|---|---|
| GET | /api/forum/topics | 否 | 主题列表 |
| GET | /api/forum/topics/:slug | 否 | 主题详情（含回复） |
| POST | /api/forum/topics | 是 | 创建主题 |
| POST | /api/forum/topics/:slug/replies | 是 | 创建回复 |
| DELETE | /api/forum/topics/:slug | 是 | 删除主题 |

### 监控
| 方法 | 路径 | 说明 |
|---|---|---|
| GET | /api/health | 健康检查 |

## 主题选项
| 名称 | 主色 | 背景渐变 |
|---|---|---|
| 翠绿 | #42b983 | 默认 |
| 深海蓝 | #1976d2 | 蓝色系 |
| 暖阳橙 | #f57c00 | 暖色系 |
| 玫瑰红 | #e91e63 | 红色系 |
| 暗夜紫 | #7b1fa2 | 紫色系 |
| 极客青 | #00bcd4 | 青色系 |
| 暗夜翠 | #42b983 | 暗色绿系 |
| 暗夜蓝 | #64b5f6 | 暗色蓝系 |
| 极夜紫 | #ba68c8 | 暗色紫系 |

### 阶段 3: 四阶段系统优化 (feature/comprehensive-site 分支)
- **时间**: 2026-07-22
- **四阶段并行执行**

#### 第一阶段 - 系统性完整性测试
- 新增集成测试: server/tests/integration.test.js (6 个场景)
  - 完整用户流程(注册→登录→创建内容→回复→清理)
  - 权限隔离(用户间不能修改/删除)
  - 未认证访问(所有保护端点返回 401)
  - 数据一致性(回复数与实际回复一致)
  - 级联删除(主题删除时回复级联清理)
  - slug 唯一性校验
- 新增安全测试: server/tests/security.test.js
  - 密码强度(短密码/空密码)
  - 错误认证(错误密码/不存在用户)
  - 无效 token(无 Authorization/无效格式/错误密钥)
  - 注入防护(SQL 注入/XSS/超长输入)
- **测试结果**: 117 个测试全部通过, 8 个测试套件, 覆盖率 91.03%

#### 第二阶段 - 项目规则文档
- docs/PROJECT_RULES.md (1034 行): 项目架构/代码规范/开发流程/版本控制/部署/测试
- docs/DEVELOPMENT_GUIDE.md (1220 行): 技术选型/页面设计/功能模块/开发步骤/测试/上线标准

#### 第三阶段 - lixiaolai.com 差异化分析 + GitHub 项目集成
- 分析 lixiaolai.com 设计风格(Astro 框架,极简黑白灰,Newsreader+Inter 字体,§ 编号分区)
- 获取 HaoTang9878 的 35 个 GitHub 仓库,筛选 14 个适合展示的项目
- 重构 projects.md:
  - § 01 · 原创项目(5 个), § 02 · 学术研究(5 个), § 03 · AI与量化(4 个)
  - 卡片式布局 + 语言标签配色 + GitHub API 实时星标
  - 分类筛选器 + 暗色模式适配
- 更新 README.md: 个人定位标题 + 精选项目 + 快速导航入口
- 更新 _sidebar.md: 项目子分类导航

#### 第四阶段 - 持续优化
- 修复 API 响应结构断言(嵌套字段路径)
- 优化项目卡片 hover 效果与语言标签配色
- 主题选择器从 6 个扩展到 9 个(新增 3 个暗色主题)
- 侧边栏导航新增 GitHub 活跃入口

## 测试覆盖率
| 文件 | 语句覆盖 | 分支覆盖 | 函数覆盖 | 行覆盖 |
|---|---|---|---|---|
| auth.js | 97.22% | 93.75% | 100% | 97.22% |
| articles.js | 93.54% | 87.5% | 75% | 94.54% |
| books.js | 94.87% | 88.23% | 91.66% | 98.52% |
| projects.js | 94.87% | 83.33% | 92.3% | 98.48% |
| forum.js | 98.5% | 100% | 92.3% | 98.43% |
| middleware/auth.js | 100% | 93.75% | 100% | 100% |
| **总计** | **91.03%** | **84.84%** | **89.33%** | **92%** |

## 测试统计
- 单元测试: 101 个
- 集成测试: 10 个
- 安全测试: 6 个
- **总计: 117 个测试, 8 个测试套件, 全部通过**
