# BruceTang

> developer, researcher, lifelong learner —— 用代码探索世界，用工程理解万物

欢迎来到我的个人作品集。这里收集了我写过的文字、做过的项目、读过的书籍，以及学习过程中的笔记和思考。右上角可以切换主题色，祝浏览愉快。

---

## 快速导航

<div class="home-nav">
    <a class="home-nav-item" href="#/articles/programming/">
        <span class="home-nav-icon">✍️</span>
        <span class="home-nav-label">文章</span>
    </a>
    <a class="home-nav-item" href="#/books">
        <span class="home-nav-icon">📚</span>
        <span class="home-nav-label">书籍</span>
    </a>
    <a class="home-nav-item" href="#/projects">
        <span class="home-nav-icon">📦</span>
        <span class="home-nav-label">项目</span>
    </a>
    <a class="home-nav-item" href="#/forum">
        <span class="home-nav-icon">💬</span>
        <span class="home-nav-label">论坛</span>
    </a>
    <a class="home-nav-item" href="#/github">
        <span class="home-nav-icon">🔥</span>
        <span class="home-nav-label">GitHub 活跃</span>
    </a>
</div>

---

## 精选项目

<div class="home-proj-grid">
    <!-- 精选卡片：OpenDDOS · 原创项目 · 安全研究 -->
    <a class="home-proj-card" href="https://github.com/HaoTang9878/OpenDDOS"
       target="_blank" rel="noopener" data-repo="OpenDDOS">
        <div class="home-proj-head">
            <h3 class="home-proj-name">OpenDDOS</h3>
            <span class="home-proj-stars" data-stars="10">★ 10</span>
        </div>
        <p class="home-proj-desc">DDoS 攻击工具集，用于网络安全研究与测试。</p>
        <div class="home-proj-tags">
            <span class="home-proj-lang" style="color:#3a7a1e;background:#eef7e0">Shell</span>
            <span class="home-proj-lang" style="color:#6c757d;background:#f0f0f0">原创项目</span>
        </div>
    </a>

    <!-- 精选卡片：point_reactor · 学术研究 · 核工程 -->
    <a class="home-proj-card" href="https://github.com/HaoTang9878/point_reactor"
       target="_blank" rel="noopener" data-repo="point_reactor">
        <div class="home-proj-head">
            <h3 class="home-proj-name">point_reactor</h3>
            <span class="home-proj-stars" data-stars="">★ —</span>
        </div>
        <p class="home-proj-desc">点堆中子动力学方程求解程序，用于反应堆物理瞬态分析。</p>
        <div class="home-proj-tags">
            <span class="home-proj-lang" style="color:#3776ab;background:#eaf1f8">Python</span>
            <span class="home-proj-lang" style="color:#6c757d;background:#f0f0f0">学术研究</span>
        </div>
    </a>

    <!-- 精选卡片：strategies · AI 与量化 -->
    <a class="home-proj-card" href="https://github.com/HaoTang9878/strategies"
       target="_blank" rel="noopener" data-repo="strategies">
        <div class="home-proj-head">
            <h3 class="home-proj-name">strategies</h3>
            <span class="home-proj-stars" data-stars="">★ —</span>
        </div>
        <p class="home-proj-desc">量化交易策略合集，涵盖 JS / Python / C++ / PineScript 多语言实现。</p>
        <div class="home-proj-tags">
            <span class="home-proj-lang" style="color:#9a7d00;background:#fbf3cf">JavaScript</span>
            <span class="home-proj-lang" style="color:#6c757d;background:#f0f0f0">AI与量化</span>
        </div>
    </a>
</div>

> 查看全部项目请访问 [项目页](#/projects) 或
> [GitHub 主页](https://github.com/HaoTang9878)。

---

## 文字作品

### 技术文章

- [编程学习笔记](#/articles/programming/) —— 编程语言、框架、工具的学习记录
- [服务器运维手记](#/articles/ops/) —— Linux、Docker、Nginx 等运维实战
- [数据库实践](#/articles/database/) —— MySQL、Redis 等数据库使用心得

### 思考与随笔

- [读书笔记](#/articles/reading/) —— 读书后的思考与总结
- [生活随笔](#/articles/life/) —— 日常生活的点滴记录

---

## 作品展示

- [书籍](#/books) —— 技术书籍、商业书籍、文学书籍的阅读与书评
- [开源项目](#/projects) —— 个人开源项目与社区贡献
- [讨论区](#/forum) —— 技术交流与思想碰撞

---

## GitHub 活跃

- [GitHub 活跃记录](#/github) —— 贡献热力图、最近活动、用户信息

---

## 项目作品

- [OpenAlpha](#/projects/openalpha/) —— 开放式的工程脚手架与最佳实践模板
- [个人博客系统](#/projects/blog/) —— 基于 docsify 搭建的个人作品集

---

## 关于我

- [个人简介](#/about/) —— 介绍我自己
- [联系方式](#/about/#联系方式) —— 如何联系我

---

> 这个网站使用 [docsify](https://docsify.js.org/) 构建，代码托管在
> [GitHub](https://github.com/HaoTang9878/tanghao) 上。

<style>
/* ====== 首页快速导航：横向卡片入口 ====== */
.home-nav {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin: 20px 0;
}
.home-nav-item {
    flex: 1 1 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 18px 12px;
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid var(--bt-border-color, #eee);
    border-radius: 10px;
    text-decoration: none;
    color: var(--bt-text-color, #555);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transition: transform 0.2s ease, border-color 0.2s ease;
}
.home-nav-item:hover {
    transform: translateY(-4px);
    border-color: var(--bt-theme-color, #42b983);
}
.home-nav-icon {
    font-size: 24px;
}
.home-nav-label {
    font-size: 14px;
    font-weight: 600;
}

/* ====== 精选项目卡片：flexbox 多列 ====== */
.home-proj-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin: 20px 0;
}
.home-proj-card {
    flex: 1 1 280px;
    max-width: 380px;
    display: flex;
    flex-direction: column;
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid var(--bt-border-color, #eee);
    border-radius: 10px;
    padding: 18px;
    text-decoration: none;
    color: inherit;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transition: transform 0.2s ease, box-shadow 0.2s ease,
                border-color 0.2s ease;
}
.home-proj-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
    border-color: var(--bt-theme-color, #42b983);
}
.home-proj-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    gap: 8px;
}
.home-proj-name {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: var(--bt-text-color, #333);
    word-break: break-all;
}
.home-proj-stars {
    font-size: 13px;
    color: #f5a623;
    font-weight: 700;
    white-space: nowrap;
}
.home-proj-desc {
    margin: 0 0 12px;
    font-size: 13px;
    color: var(--bt-text-color, #555);
    line-height: 1.6;
    flex: 1;
}
.home-proj-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}
.home-proj-lang {
    display: inline-block;
    padding: 2px 9px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
}

/* ====== 暗色模式适配 ====== */
.bt-dark-mode .home-nav-item,
.bt-dark-mode .home-proj-card {
    background: rgba(30, 35, 56, 0.55);
    border-color: var(--bt-border-color, #2a2a4a);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
.bt-dark-mode .home-proj-card:hover {
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.45);
}

/* ====== 响应式：移动端单列 ====== */
@media (max-width: 768px) {
    .home-nav-item {
        flex: 1 1 calc(50% - 6px);
    }
    .home-proj-card {
        flex: 1 1 100%;
        max-width: 100%;
    }
}
</style>

<script>
// 首页精选项目：拉取 GitHub 实时星标数并回填卡片
(function () {
    "use strict";

    const GH_USER = "HaoTang9878";
    const REPOS_API =
        "https://api.github.com/users/" + GH_USER +
        "/repos?per_page=100&sort=pushed";

    // 回填每张精选卡片的星标数
    function fillStars(repoMap) {
        document.querySelectorAll(".home-proj-card").forEach(function (card) {
            const name = card.getAttribute("data-repo");
            if (!name) return;
            const repo = repoMap[name.toLowerCase()];
            if (!repo) return;
            const starEl = card.querySelector(".home-proj-stars");
            if (starEl && typeof repo.stargazers_count === "number") {
                starEl.textContent = "★ " + repo.stargazers_count;
                starEl.setAttribute("data-stars", repo.stargazers_count);
            }
        });
    }

    // 拉取仓库列表，失败时保持卡片已有的本地数据
    async function fetchRepos() {
        const controller = new AbortController();
        const timer = setTimeout(function () {
            controller.abort();
        }, 10000);
        try {
            const res = await fetch(REPOS_API, {
                signal: controller.signal,
                headers: { Accept: "application/vnd.github+json" }
            });
            if (!res.ok) {
                throw new Error("HTTP " + res.status + " " + res.statusText);
            }
            const repos = await res.json();
            const map = {};
            repos.forEach(function (r) {
                if (r && r.name) map[r.name.toLowerCase()] = r;
            });
            fillStars(map);
        } finally {
            clearTimeout(timer);
        }
    }

    function init() {
        fetchRepos().catch(function (err) {
            // 失败不影响首页展示，星标数保留本地值
            console.warn("首页 GitHub 数据获取失败:", err);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        setTimeout(init, 200);
    }
})();
</script>
