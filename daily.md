# 日报

<!-- Hero 区：眉标 + 期号日期 -->
<div class="rp-hero">
    <span class="rp-eyebrow">BRUCETANG DAILY</span>
    <h1 class="rp-hero-title">2026年7月22日 · 周二</h1>
    <p class="rp-hero-sub">每日记录技术学习、项目进展与生活感悟</p>
</div>

<!-- 目录区 -->
<div class="rp-toc">
    <div class="rp-toc-head">
        <strong>今日看点</strong>
        <span class="rp-toc-meta">12 篇记录 · 约 8 分钟</span>
    </div>
    <ol class="rp-toc-list">
        <li><a href="#sec-01">§ 01 · 技术学习</a></li>
        <li><a href="#sec-02">§ 02 · 项目进展</a></li>
        <li><a href="#sec-03">§ 03 · 阅读思考</a></li>
        <li><a href="#sec-04">§ 04 · 生活记录</a></li>
    </ol>
</div>

---

<!-- § 01 · 技术学习 -->
<h2 id="sec-01" class="rp-section-title">§ 01 · 技术学习</h2>

<div class="rp-card-list">
    <div class="rp-card">
        <div class="rp-card-head">
            <h3 class="rp-card-title">Express 路由模块化拆分</h3>
            <span class="rp-chip rp-chip--doc">官方文档</span>
        </div>
        <p class="rp-card-summary">学习 Express Router 的模块化拆分方式，将认证、文章、书籍等路由独立到单独文件，通过 app.use 挂载。理解了中间件链 next() 的传递机制与错误处理的分层设计。</p>
    </div>
    <div class="rp-card">
        <div class="rp-card-head">
            <h3 class="rp-card-title">JWT 认证原理与实践</h3>
            <span class="rp-chip rp-chip--book">技术书籍</span>
        </div>
        <p class="rp-card-summary">深入理解 JWT 的三段式结构（Header.Payload.Signature），掌握了 jsonwebtoken 库的 sign/verify 用法。在博客系统中实现了注册、登录、鉴权中间件的完整链路。</p>
    </div>
    <div class="rp-card">
        <div class="rp-card-head">
            <h3 class="rp-card-title">CSS 变量与暗色模式适配</h3>
            <span class="rp-chip rp-chip--practice">实践总结</span>
        </div>
        <p class="rp-card-summary">通过 CSS 自定义属性（--bt-theme-color 等）实现主题切换。暗色模式通过 body.bt-dark-mode 类名控制，配合半透明背景色 rgba() 保证可读性。学到了 var() 回退值的用法。</p>
    </div>
</div>

<!-- § 02 · 项目进展 -->
<h2 id="sec-02" class="rp-section-title">§ 02 · 项目进展</h2>

<div class="rp-card-list">
    <div class="rp-card">
        <div class="rp-card-head">
            <h3 class="rp-card-title">个人博客后端 API 完善</h3>
            <span class="rp-chip rp-chip--project">OpenAlpha</span>
        </div>
        <p class="rp-card-summary">完成文章、书籍、项目、论坛四大模块的 CRUD 接口，新增标签聚合与全文搜索功能。使用基于 JSON 文件的同步存储方案，适配 2 核 1.6G 服务器环境，避免原生模块编译 OOM。</p>
    </div>
    <div class="rp-card">
        <div class="rp-card-head">
            <h3 class="rp-card-title">docsify 主题系统开发</h3>
            <span class="rp-chip rp-chip--project">博客开发</span>
        </div>
        <p class="rp-card-summary">实现了 9 种主题色切换（含 3 种暗色主题），通过 localStorage 持久化用户选择。主题切换时同步更新 CSS 变量、docsify themeColor 和侧边栏激活色，体验流畅。</p>
    </div>
</div>

<!-- § 03 · 阅读思考 -->
<h2 id="sec-03" class="rp-section-title">§ 03 · 阅读思考</h2>

<div class="rp-card-list">
    <div class="rp-card">
        <div class="rp-card-head">
            <h3 class="rp-card-title">《重构》读书笔记：代码坏味道</h3>
            <span class="rp-chip rp-chip--book">读书笔记</span>
        </div>
        <p class="rp-card-summary">重读 Martin Fowler 的《重构》，重点复习了 10 种代码坏味道的识别方法。神秘命名和过长函数是最常见的两个问题，提取函数和重命名是最高频的重构手法。重构的前提是测试覆盖。</p>
    </div>
    <div class="rp-card">
        <div class="rp-card-head">
            <h3 class="rp-card-title">Hacker News 热文：简单设计的力量</h3>
            <span class="rp-chip rp-chip--hn">Hacker News</span>
        </div>
        <p class="rp-card-summary">一篇讨论"过度工程"的热文引发思考。作者认为大多数系统在用户量达到瓶颈前不需要微服务架构。简单的设计更容易维护、调试和扩展。这和当前博客系统选择 JSON 文件存储的思路一致。</p>
    </div>
</div>

<!-- § 04 · 生活记录 -->
<h2 id="sec-04" class="rp-section-title">§ 04 · 生活记录</h2>

<div class="rp-card-list">
    <div class="rp-card">
        <div class="rp-card-head">
            <h3 class="rp-card-title">夏日编程的节奏</h3>
            <span class="rp-chip rp-chip--life">生活随笔</span>
        </div>
        <p class="rp-card-summary">七月的高温让人容易疲惫，但清晨的几个小时是最高效的编码时间。调整作息后，5 点起床写代码到 9 点，下午看书和散步，晚上整理笔记。找到适合自己的节奏比盲目加班更重要。</p>
    </div>
    <div class="rp-card">
        <div class="rp-card-head">
            <h3 class="rp-card-title">核工程与编程的交叉点</h3>
            <span class="rp-chip rp-chip--life">感悟</span>
        </div>
        <p class="rp-card-summary">从核工程专业转向编程，发现数值计算和逻辑思维是共通的。蒙特卡洛方法中的随机采样思想，和量化交易中的蒙特卡洛回测异曲同工。跨学科的视角让人看到更多可能性。</p>
    </div>
</div>

---

<!-- 底部统计区 -->
<div class="rp-stats">
    <div class="rp-stat-item">
        <span class="rp-stat-num">12</span>
        <span class="rp-stat-label">今日记录</span>
    </div>
    <div class="rp-stat-item">
        <span class="rp-stat-num">3.5h</span>
        <span class="rp-stat-label">学习时长</span>
    </div>
    <div class="rp-stat-item">
        <span class="rp-stat-num">8</span>
        <span class="rp-stat-label">新知识点</span>
    </div>
</div>

<!-- 底部翻页 -->
<div class="rp-pager">
    <a class="rp-pager-link rp-pager-prev" href="#/daily">← 前一日</a>
    <a class="rp-pager-link rp-pager-center" href="#/timeline">历史日报</a>
    <a class="rp-pager-link rp-pager-next" href="#/daily">后一日 →</a>
</div>

<style>
/* ====== Hero 区：居中眉标 + 大标题 ====== */
.rp-hero {
    text-align: center;
    padding: 28px 0 20px;
    border-bottom: 2px solid var(--bt-border-color, #eee);
    margin-bottom: 20px;
}
.rp-eyebrow {
    display: inline-block;
    font-size: 12px;
    letter-spacing: 3px;
    color: var(--bt-theme-color, #42b983);
    font-weight: 700;
    text-transform: uppercase;
    margin-bottom: 8px;
}
.rp-hero-title {
    margin: 0 0 6px;
    font-size: 28px;
    color: var(--bt-text-color, #34495e);
}
.rp-hero-sub {
    margin: 0;
    font-size: 14px;
    color: var(--bt-text-color, #6c757d);
    opacity: 0.8;
}

/* ====== 目录区 ====== */
.rp-toc {
    background: rgba(66, 185, 131, 0.06);
    border: 1px solid var(--bt-border-color, #eee);
    border-radius: 10px;
    padding: 16px 20px;
    margin-bottom: 24px;
}
.rp-toc-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    font-size: 15px;
    color: var(--bt-text-color, #34495e);
}
.rp-toc-meta {
    font-size: 12px;
    color: var(--bt-text-color, #6c757d);
    opacity: 0.8;
}
.rp-toc-list {
    margin: 0;
    padding-left: 20px;
    columns: 2;
    column-gap: 24px;
}
.rp-toc-list li {
    font-size: 13px;
    line-height: 2;
}
.rp-toc-list a {
    color: var(--bt-theme-color, #42b983);
    text-decoration: none;
}
.rp-toc-list a:hover {
    text-decoration: underline;
}

/* ====== 分节标题 ====== */
.rp-section-title {
    font-size: 20px;
    color: var(--bt-text-color, #34495e);
    border-left: 4px solid var(--bt-theme-color, #42b983);
    padding-left: 10px;
    margin: 28px 0 14px;
}

/* ====== 卡片列表 ====== */
.rp-card-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 14px;
    margin-bottom: 20px;
}
/* 单条记录卡片 */
.rp-card {
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid var(--bt-border-color, #eee);
    border-radius: 10px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transition: transform 0.2s ease, box-shadow 0.2s ease,
                border-color 0.2s ease;
}
.rp-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
    border-color: var(--bt-theme-color, #42b983);
}
.rp-card-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 8px;
}
.rp-card-title {
    margin: 0;
    font-size: 15px;
    color: var(--bt-text-color, #34495e);
    flex: 1;
}
.rp-card-summary {
    margin: 0;
    font-size: 13px;
    color: var(--bt-text-color, #555);
    line-height: 1.7;
}

/* ====== 信源 chip 标注 ====== */
.rp-chip {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    white-space: nowrap;
    flex-shrink: 0;
}
.rp-chip--doc {
    background: rgba(66, 185, 131, 0.12);
    color: var(--bt-theme-color, #42b983);
}
.rp-chip--book {
    background: rgba(25, 118, 210, 0.12);
    color: #1976d2;
}
.rp-chip--practice {
    background: rgba(245, 124, 0, 0.12);
    color: #f57c00;
}
.rp-chip--project {
    background: rgba(123, 31, 162, 0.12);
    color: #7b1fa2;
}
.rp-chip--hn {
    background: rgba(255, 87, 34, 0.12);
    color: #ff5722;
}
.rp-chip--life {
    background: rgba(0, 188, 212, 0.12);
    color: #00bcd4;
}

/* ====== 底部统计区 ====== */
.rp-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin: 24px 0;
    padding: 20px;
    background: rgba(66, 185, 131, 0.06);
    border-radius: 10px;
    border: 1px solid var(--bt-border-color, #eee);
}
.rp-stat-item {
    text-align: center;
}
.rp-stat-num {
    display: block;
    font-size: 28px;
    font-weight: 700;
    color: var(--bt-theme-color, #42b983);
}
.rp-stat-label {
    display: block;
    font-size: 12px;
    color: var(--bt-text-color, #6c757d);
    margin-top: 4px;
}

/* ====== 底部翻页 ====== */
.rp-pager {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-top: 1px solid var(--bt-border-color, #eee);
    margin-top: 12px;
}
.rp-pager-link {
    font-size: 13px;
    color: var(--bt-theme-color, #42b983);
    text-decoration: none;
    padding: 6px 14px;
    border-radius: 6px;
    transition: background 0.2s ease;
}
.rp-pager-link:hover {
    background: rgba(66, 185, 131, 0.1);
}
.rp-pager-center {
    color: var(--bt-text-color, #6c757d);
}

/* ====== 暗色模式适配 ====== */
body.bt-dark-mode .rp-card {
    background: rgba(30, 35, 56, 0.55);
    border-color: var(--bt-border-color, #2a2a4a);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
body.bt-dark-mode .rp-card:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.45);
}
body.bt-dark-mode .rp-toc {
    background: rgba(30, 35, 56, 0.4);
}
body.bt-dark-mode .rp-stats {
    background: rgba(30, 35, 56, 0.4);
}
body.bt-dark-mode .rp-chip--book {
    color: #64b5f6;
}
body.bt-dark-mode .rp-chip--practice {
    color: #ffb74d;
}
body.bt-dark-mode .rp-chip--project {
    color: #ba68c8;
}
body.bt-dark-mode .rp-chip--hn {
    color: #ff8a65;
}
body.bt-dark-mode .rp-chip--life {
    color: #4dd0e1;
}

/* ====== 响应式：移动端单列 ====== */
@media (max-width: 768px) {
    .rp-card-list {
        grid-template-columns: 1fr;
    }
    .rp-toc-list {
        columns: 1;
    }
    .rp-hero-title {
        font-size: 22px;
    }
}
</style>
