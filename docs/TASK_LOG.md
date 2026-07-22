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

### 阶段 4: 暗色主题扩展 (feature/comprehensive-site 分支)
- **时间**: 2026-07-22
- **提交**: 0595457 feat: 添加暗色主题模式 - 深色背景 + 自适应白色字体
- **内容**:
  - 新增 3 个暗色主题: 暗夜翠(#0d1f17)、暗夜蓝(#0a1929)、极夜紫(#1a0a2e)
  - 暗色模式下字体自动切换为浅色(#e0e0e0)
  - 侧边栏/内容区/代码块背景自适应
  - CSS 变量驱动: --bt-text-color, --bt-sidebar-bg, --bt-content-bg, --bt-border-color
  - body.bt-dark-mode 类切换全局暗色样式

### 阶段 5: 持续优化 - SEO/UX/新页面/后端API/内容丰富 (feature/comprehensive-site 分支)
- **时间**: 2026-07-22
- **提交**: c3675c0 feat: 持续优化 - SEO/UX/新页面/后端API/内容丰富
- **三智能体并行执行**

#### Agent A - SEO与UX增强
- Open Graph 标签(og:title/description/type/url/image/site_name/locale)
- Twitter Card 标签(twitter:card/title/description)
- favicon(SVG内联 data URI, BT字母图标, 主题色背景)
- canonical 链接(https://brucetanghao.com/)
- preconnect 到 cdn.jsdelivr.net
- defer/async 脚本加载优化
- 回到顶部按钮(滚动>300px淡入, 平滑滚动, SVG箭头, 主题色)
- 阅读进度条(顶部3px, z-index:300, 滚动百分比驱动)
- 加载动画(居中旋转圆环, docsify doneEach钩子隐藏)
- 主题面板暗色模式适配
- 用户状态条: GitHub图标链接 + JSON.parse错误处理 + hover效果
- 404页面(大字404 + 友好提示 + 返回首页按钮, notFoundPage配置)

#### Agent B - 新增页面与内容丰富
- resume.md: 简历页面(个人信息/教育背景/技能清单/项目经历卡片)
- timeline.md: 垂直时间线(6个里程碑: 2024-11开启GitHub→2026-07上线博客)
- contact.md: 联系页面(联系方式卡片 + 留言表单POST到/api/forum/topics)
- articles/programming/notes.md: TypeScript/Python/Git真实技术笔记(含代码示例)
- articles/reading/notes.md: 《重构》《代码整洁》《CSAPP》读后感(每本300字+)
- articles/ops/README.md: Linux/Nginx/Docker/故障排查运维手记(含真实命令)
- _sidebar.md: 新增简历/时间线/联系我导航

#### Agent C - 后端API扩展
- tags.js: 标签管理API(GET /api/tags, GET /api/tags/:tag/articles, GET /api/tags/:tag/projects)
- search.js: 全站搜索API(GET /api/search?q=关键词, 多字段匹配, snippet生成, 上限50)
- stats.js: 统计API(GET /api/stats, 各分类计数+最近5条)
- articles.js: 添加tags字段支持(POST/PUT)
- db/index.js: normalizeArticles()旧数据tags字段兼容
- 42个新测试(tags15+search14+stats13)

### 阶段 6: 第二轮内容优化 (feature/comprehensive-site 分支)
- **时间**: 2026-07-22
- **提交**: b203ba0 feat: 第二轮内容优化 - 书籍/数据库笔记/关于我
- **内容**:
  - books.md: 10本真实书籍卡片(技术4+商业3+文学3), 每本含书评和推荐指数
  - articles/database/README.md: MySQL/PostgreSQL索引优化+Redis实战+数据库设计原则(SQL示例)
  - about/README.md: 个人介绍+技术栈+研究方向+What I'm Doing Now状态面板+GitHub统计

### 阶段 7: 第三轮迭代 - SEO基础设施 + 内容填充 + 文章浏览量点赞 (feature/comprehensive-site 分支)
- **时间**: 2026-07-22
- **提交**: fa62b8b feat: 第三轮迭代 - SEO基础设施 + 内容填充 + 文章浏览量点赞
- **三智能体并行执行**

#### Agent A - SEO基础设施与前端增强
- robots.txt: 爬虫规则 + sitemap声明
- sitemap.xml: 18个页面URL(priority分级: 首页1.0/文章0.8-0.9/功能0.5-0.7/登录注册0.3)
- rss.xml: RSS 2.0订阅源(5篇最新文章作为item)
- 文章阅读时间估算(中文300字/分钟, 仅articles/路径显示)
- 社交分享按钮(Twitter/X + LinkedIn + 复制链接, 内联SVG图标)
- 打印友好CSS(@media print: 隐藏侧边栏/主题/进度条, 链接显示URL)

#### Agent B - 填充剩余占位内容
- articles/life/README.md: 4篇生活随笔(转型之路/深夜debug/读活着/开源之旅)
- articles/programming/README.md: 板块介绍页+卡片导航
- projects/openalpha/README.md: OpenAlpha量化交易系统介绍(技术栈/功能模块/状态)
- projects/blog/README.md: 博客系统技术文档(技术栈/8个API模块/158测试/92.32%覆盖率)

#### Agent C - 文章浏览量与点赞API
- GET /api/articles/:slug: 自动浏览量views+1
- POST /api/articles/:slug/like: 匿名点赞(IP每小时限流1次, article_likes集合记录)
- DELETE /api/articles/:slug/like: 作者取消点赞(likes不低于0)
- normalizeArticles(): 旧文章补views=0, likes=0
- 12个新测试(浏览量自增/点赞/限流/取消/不为负)

### 阶段 8: 服务器诊断 (2026-07-22)
- **服务器**: 121.43.224.214 (阿里云ECS, 杭州)
- **诊断结果**:
  - Ping: 正常(0%丢包, 延迟~12ms)
  - 端口扫描: 22/80/443 全部开放
  - SSH诊断: Connection timed out during banner exchange
  - 根因: SSH服务端sshd进程响应缓慢(疑似OOM后服务异常或系统负载过高)
- **原因分析**: 之前npm install编译better-sqlite3触发OOM, sshd进程可能被OOM killer杀死或资源未恢复
- **建议**: 需要从阿里云控制台强制重启服务器恢复SSH

## API 接口完整清单

### 认证 API (/api/auth)
| 方法 | 路径 | 认证 | 说明 |
|---|---|---|---|
| POST | /api/auth/register | 否 | 用户注册 |
| POST | /api/auth/login | 否 | 用户登录 |
| POST | /api/auth/logout | 是 | 用户登出 |
| GET | /api/auth/me | 是 | 获取当前用户 |

### 文章 API (/api/articles)
| 方法 | 路径 | 认证 | 说明 |
|---|---|---|---|
| GET | /api/articles | 否 | 文章列表 |
| GET | /api/articles/:slug | 否 | 文章详情(views+1) |
| POST | /api/articles | 是 | 创建文章(含tags) |
| PUT | /api/articles/:slug | 是 | 更新文章(含tags) |
| DELETE | /api/articles/:slug | 是 | 删除文章 |
| POST | /api/articles/:slug/like | 否 | 匿名点赞(IP限流) |
| DELETE | /api/articles/:slug/like | 是 | 作者取消点赞 |

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
| DELETE | /api/forum/topics/:slug | 是 | 删除主题(级联删除回复) |

### 标签 API (/api/tags)
| 方法 | 路径 | 认证 | 说明 |
|---|---|---|---|
| GET | /api/tags | 否 | 所有标签及使用计数 |
| GET | /api/tags/:tag/articles | 否 | 按标签筛选文章 |
| GET | /api/tags/:tag/projects | 否 | 按标签筛选项目 |

### 搜索 API (/api/search)
| 方法 | 路径 | 认证 | 说明 |
|---|---|---|---|
| GET | /api/search?q=关键词 | 否 | 全站搜索(文章/书籍/项目/主题) |

### 统计 API (/api/stats)
| 方法 | 路径 | 认证 | 说明 |
|---|---|---|---|
| GET | /api/stats | 否 | 各分类计数+最近5条 |

### 监控
| 方法 | 路径 | 说明 |
|---|---|---|
| GET | /api/health | 健康检查 |

## 测试覆盖率（最新）
| 文件 | 语句覆盖 | 分支覆盖 | 函数覆盖 | 行覆盖 |
|---|---|---|---|---|
| auth.js | 97.22% | 93.75% | 100% | 97.22% |
| articles.js | 98% | 92% | 95% | 98.87% |
| books.js | 94.87% | 88.23% | 91.66% | 98.52% |
| projects.js | 94.87% | 83.33% | 92.3% | 98.48% |
| forum.js | 98.5% | 100% | 92.3% | 98.43% |
| tags.js | 100% | 100% | 100% | 100% |
| search.js | 98.27% | 92% | 100% | 98.27% |
| stats.js | 100% | 100% | 100% | 100% |
| middleware/auth.js | 100% | 93.75% | 100% | 100% |
| **总计** | **92.44%** | **84.58%** | **93.91%** | **93.06%** |

## 测试统计（最新）
- 单元测试: 101 个
- 集成测试: 10 个
- 安全测试: 6 个
- 标签测试: 15 个
- 搜索测试: 14 个
- 统计测试: 13 个
- 文章浏览量/点赞测试: 12 个（新增）
- **总计: 170 个测试, 11 个测试套件, 全部通过**

## 前端页面清单（18 个）
| 页面 | 路径 | 说明 |
|---|---|---|
| 首页 | /README.md | 个人定位 + 精选项目 + 快速导航 |
| 登录 | /login.md | 用户登录表单 |
| 注册 | /register.md | 用户注册表单 |
| 书籍 | /books.md | 10 本书籍卡片 + 书评 |
| 开源项目 | /projects.md | 14 个 GitHub 仓库 + 筛选器 |
| 论坛 | /forum.md | 主题列表 + 发帖 |
| GitHub 活跃 | /github.md | 贡献热力图 + 活动列表 |
| 简历 | /resume.md | 教育/技能/项目经历 |
| 时间线 | /timeline.md | 6 个里程碑垂直时间线 |
| 联系我 | /contact.md | 联系方式 + 留言表单 |
| 404 | /404.md | 友好 404 页面 |
| 编程笔记 | /articles/programming/ | 板块介绍 + 卡片导航 |
| 编程笔记详情 | /articles/programming/notes.md | TS/Python/Git 笔记 |
| 运维手记 | /articles/ops/ | Linux/Nginx/Docker/故障排查 |
| 数据库实践 | /articles/database/ | MySQL/Redis/设计原则 |
| 读书笔记 | /articles/reading/ | 重构/代码整洁/CSAPP |
| 生活随笔 | /articles/life/ | 4 篇生活随笔 |
| 关于我 | /about/ | 技术栈 + 研究方向 + 状态面板 |

## UX 功能清单
| 功能 | 说明 |
|---|---|
| 主题选择器 | 9 色(6亮+3暗), localStorage 持久化 |
| 回到顶部 | 滚动>300px 淡入, 平滑滚动 |
| 阅读进度条 | 顶部 3px, 滚动百分比驱动 |
| 加载动画 | 旋转圆环, docsify doneEach 隐藏 |
| 阅读时间估算 | 中文 300 字/分钟, 仅文章页显示 |
| 社交分享 | Twitter/LinkedIn/复制链接, 仅文章页显示 |
| 打印友好 | @media print 隐藏装饰元素, 链接显示 URL |
| 响应式设计 | 768px/1024px 断点 |
| SEO | Open Graph + Twitter Card + favicon + robots + sitemap + RSS |
| 暗色模式 | 全站适配(body.bt-dark-mode) |

## SEO 基础设施
| 文件 | 说明 |
|---|---|
| robots.txt | 爬虫规则 + sitemap 声明 |
| sitemap.xml | 18 个 URL, priority 分级 |
| rss.xml | RSS 2.0 订阅源, 5 篇文章 |

## 服务器状态
| 项目 | 状态 |
|---|---|
| IP | 121.43.224.214 |
| SSH | ❌ 超时(banner exchange timeout) |
| Ping | ✅ 正常(0% 丢包) |
| 22 端口 | ✅ 开放(但 SSH 握手失败) |
| 80 端口 | ✅ 开放 |
| 443 端口 | ✅ 开放 |
| 根因 | OOM 后 sshd 进程异常, 需阿里云控制台强制重启 |

## Git 提交历史
| 序号 | Commit | 说明 |
|---|---|---|
| 1 | 744103f | feat: 初始化个人作品集网站 |
| 2 | 98dc141 | refactor: 将站名「唐昊」统一改为「BruceTang」 |
| 3 | 96d99bc | feat: 添加用户认证模块与文章 API |
| 4 | e8e4dcd | feat: 综合站点扩展 - 多内容类型 + 主题选择器 + GitHub 活跃记录 |
| 5 | 0595457 | feat: 添加暗色主题模式 - 深色背景 + 自适应白色字体 |
| 6 | 208fc42 | feat: 四阶段系统优化 - 测试/文档/项目集成/持续改进 |
| 7 | a906536 | docs: 更新任务日志 - 四阶段优化记录与测试统计 |
| 8 | c3675c0 | feat: 持续优化 - SEO/UX/新页面/后端API/内容丰富 |
| 9 | b203ba0 | feat: 第二轮内容优化 - 书籍/数据库笔记/关于我 |
| 10 | fa62b8b | feat: 第三轮迭代 - SEO基础设施 + 内容填充 + 文章浏览量点赞 |
