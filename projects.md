# 开源项目

> 用代码连接世界 —— 这里整理了我参与和主导的 GitHub 项目，欢迎 Star、Fork、提 Issue。

<!-- 顶部工具栏：分类筛选器 + GitHub 主页入口 -->
<div class="proj-toolbar">
    <div class="proj-filter" role="tablist" aria-label="项目分类筛选">
        <button class="proj-filter-btn is-active" data-filter="all">全部</button>
        <button class="proj-filter-btn" data-filter="原创项目">原创项目</button>
        <button class="proj-filter-btn" data-filter="学术研究">学术研究</button>
        <button class="proj-filter-btn" data-filter="ai与量化">AI 与量化</button>
    </div>
    <a class="proj-gh-link"
       href="https://github.com/HaoTang9878?tab=repositories"
       target="_blank" rel="noopener">@HaoTang9878 ↗</a>
</div>

<!-- 加载与错误状态：由 JS 控制显隐 -->
<div id="proj-loading" class="proj-state">正在加载项目数据...</div>
<div id="proj-error" class="proj-state proj-error" style="display:none;"></div>

<!-- 卡片容器：由 JS 按 § 分类渲染 -->
<div id="proj-root"></div>

> 想与我合作或贡献代码？欢迎在对应仓库提 Issue 或 PR，也可以通过
> [关于我](#/about/) 页面联系我。

<style>
/* ====== 顶部工具栏：筛选器与主页入口横向排列 ====== */
.proj-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    margin: 20px 0 8px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--bt-border-color, #eee);
}
/* 筛选按钮组 */
.proj-filter {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}
/* 单个筛选按钮：药丸样式 */
.proj-filter-btn {
    padding: 6px 16px;
    border: 1px solid var(--bt-border-color, #ddd);
    border-radius: 20px;
    background: transparent;
    color: var(--bt-text-color, #555);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
}
.proj-filter-btn:hover {
    border-color: var(--bt-theme-color, #42b983);
    color: var(--bt-theme-color, #42b983);
}
/* 激活态：主题色填充 */
.proj-filter-btn.is-active {
    background: var(--bt-theme-color, #42b983);
    border-color: var(--bt-theme-color, #42b983);
    color: #fff;
}
/* GitHub 主页入口 */
.proj-gh-link {
    font-size: 13px;
    color: var(--bt-theme-color, #42b983);
    text-decoration: none;
    white-space: nowrap;
}
.proj-gh-link:hover {
    text-decoration: underline;
}

/* ====== 加载 / 错误状态 ====== */
.proj-state {
    padding: 24px;
    text-align: center;
    color: #6c757d;
    font-size: 14px;
}
.proj-error {
    color: #dc3545;
    background: #fff5f5;
    border: 1px solid #ffd6d6;
    border-radius: 6px;
}

/* ====== § 分区标题 ====== */
.proj-section {
    margin-top: 32px;
}
.proj-section-title {
    font-size: 20px;
    font-weight: 700;
    color: var(--bt-text-color, #333);
    margin: 0 0 16px;
    padding-left: 12px;
    border-left: 4px solid var(--bt-theme-color, #42b983);
    letter-spacing: 0.5px;
}

/* ====== 卡片网格：flexbox 自适应多列 ====== */
.proj-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
}
/* 单个项目卡片：整块可点击链接 */
.proj-card {
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
/* hover 效果：上浮 + 主题色描边 */
.proj-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
    border-color: var(--bt-theme-color, #42b983);
}
.proj-card-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    gap: 8px;
}
.proj-card-name {
    margin: 0;
    font-size: 16px;
    color: var(--bt-text-color, #333);
    font-weight: 700;
    word-break: break-all;
}
/* 星标：金色星星 + 数字 */
.proj-card-stars {
    font-size: 13px;
    color: #f5a623;
    font-weight: 700;
    white-space: nowrap;
}
.proj-card-desc {
    margin: 0 0 12px;
    font-size: 13px;
    color: var(--bt-text-color, #555);
    line-height: 1.6;
    flex: 1;
}
/* 语言标签容器 */
.proj-card-tags {
    margin-bottom: 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}
/* 语言标签：不同语言不同颜色，通过 data-lang 区分 */
.proj-lang {
    display: inline-block;
    padding: 2px 9px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
}
.proj-lang[data-lang="Python"]    { color: #3776ab; background: #eaf1f8; }
.proj-lang[data-lang="Shell"]     { color: #3a7a1e; background: #eef7e0; }
.proj-lang[data-lang="HTML"]       { color: #c14e1f; background: #fbe9df; }
.proj-lang[data-lang="JavaScript"] { color: #9a7d00; background: #fbf3cf; }
.proj-lang[data-lang="C++"]         { color: #c0396e; background: #fbe3ec; }
.proj-lang[data-lang="XML"]         { color: #00598f; background: #e0f0fb; }
.proj-lang[data-lang="PineScript"] { color: #00877a; background: #dff5f1; }
.proj-lang[data-lang="默认"]        { color: #6c757d; background: #f0f0f0; }
/* 卡片底部元信息：主语言 + 最后更新时间 */
.proj-card-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #999;
    border-top: 1px solid var(--bt-border-color, #f0f0f0);
    padding-top: 10px;
    gap: 8px;
}
.proj-meta-lang {
    font-weight: 600;
    color: #6c757d;
}
.proj-meta-updated {
    color: #999;
}

/* ====== 暗色模式适配：半透明深色卡片 ====== */
.bt-dark-mode .proj-card {
    background: rgba(30, 35, 56, 0.55);
    border-color: var(--bt-border-color, #2a2a4a);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
.bt-dark-mode .proj-card:hover {
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.45);
}
.bt-dark-mode .proj-state { color: #9aa0b0; }
.bt-dark-mode .proj-meta-lang { color: #9aa0b0; }
.bt-dark-mode .proj-meta-updated { color: #7a8090; }

/* ====== 响应式：移动端卡片堆叠 ====== */
@media (max-width: 768px) {
    .proj-toolbar {
        flex-direction: column;
        align-items: stretch;
    }
    .proj-filter {
        justify-content: center;
    }
    .proj-gh-link {
        text-align: center;
    }
    .proj-card {
        flex: 1 1 100%;
        max-width: 100%;
    }
}
</style>

<script>
// 开源项目展示模块：渲染卡片 + 分类筛选 + GitHub 实时数据增强
(function () {
    "use strict";

    // GitHub 用户名
    const GH_USER = "HaoTang9878";
    // 仓库列表 API（单次请求获取全部仓库元信息）
    const REPOS_API =
        "https://api.github.com/users/" + GH_USER +
        "/repos?per_page=100&sort=pushed";

    // 项目数据（按推荐展示顺序）。category 与筛选器/侧边栏对齐。
    //   原创项目 / 学术研究 / ai与量化
    const PROJECTS = [
        // —— § 01 原创项目 ——
        {
            name: "tanghao",
            desc: "个人作品集与博客站点，基于 docsify 构建，支持主题切换、文章搜索与响应式布局。",
            lang: "HTML",
            langList: ["HTML"],
            stars: 0,
            category: "原创项目"
        },
        {
            name: "bithot",
            desc: "原创实验性项目。",
            lang: "Python",
            langList: ["Python"],
            stars: 0,
            category: "原创项目"
        },
        {
            name: "OpenDDOS",
            desc: "DDoS 攻击工具集，用于网络安全研究与测试。",
            lang: "Shell",
            langList: ["Shell"],
            stars: 10,
            category: "原创项目"
        },
        {
            name: "activate-clash-core",
            desc: "终端 Clash 内核启动脚本，一键拉起代理内核。",
            lang: "Shell",
            langList: ["Shell"],
            stars: 8,
            category: "原创项目"
        },
        {
            name: "ddos",
            desc: "分布式拒绝服务 Python 脚本，安全研究与压力测试用途。",
            lang: "Python",
            langList: ["Python"],
            stars: 4,
            category: "原创项目"
        },
        // —— § 02 学术研究（核工程方向）——
        {
            name: "point_reactor",
            desc: "点堆中子动力学方程求解程序，用于反应堆物理瞬态分析。",
            lang: "Python",
            langList: ["Python"],
            stars: 0,
            category: "学术研究"
        },
        {
            name: "saltproc",
            desc: "熔盐堆在线后处理流程模拟，研究燃料盐的在线净化与同位素管理。",
            lang: "Python",
            langList: ["Python"],
            stars: 0,
            category: "学术研究"
        },
        {
            name: "openmc",
            desc: "OpenMC 蒙特卡洛中子输运代码（Fork），用于反应堆临界与燃耗计算。",
            lang: "C++",
            langList: ["C++", "Python"],
            stars: 0,
            category: "学术研究"
        },
        {
            name: "endf-python",
            desc: "Python ENDF 评测核数据解析器，读取并处理 ENDF 格式核数据库。",
            lang: "Python",
            langList: ["Python"],
            stars: 0,
            category: "学术研究"
        },
        {
            name: "ca_depletion_chains",
            desc: "基于 OpenMC 修改的燃耗链数据，定制核素衰变与中子反应路径。",
            lang: "XML",
            langList: ["XML"],
            stars: 0,
            category: "学术研究"
        },
        // —— § 03 AI 与量化 ——
        {
            name: "strategies",
            desc: "量化交易策略合集，涵盖 JS / Python / C++ / PineScript 多语言实现。",
            lang: "JavaScript",
            langList: ["JavaScript", "Python", "C++", "PineScript"],
            stars: 0,
            category: "ai与量化"
        },
        {
            name: "crypto_quant_framework",
            desc: "自研加密货币量化交易框架，包含回测引擎与信号执行模块。",
            lang: "Python",
            langList: ["Python"],
            stars: 0,
            category: "ai与量化"
        },
        {
            name: "evil-read-arxiv",
            desc: "基于 Claude Code + Obsidian 的论文阅读与笔记工具链。",
            lang: "Python",
            langList: ["Python"],
            stars: 0,
            category: "ai与量化"
        },
        {
            name: "miaosha-GLM",
            desc: "智谱 GLM Coding Plan 秒杀助手，自动抢购订阅额度。",
            lang: "Python",
            langList: ["Python"],
            stars: 0,
            category: "ai与量化"
        }
    ];

    // § 分类配置：key 对应筛选器/侧边栏，title 为展示标题
    const SECTIONS = [
        { key: "原创项目", title: "§ 01 · 原创项目" },
        { key: "学术研究", title: "§ 02 · 学术研究" },
        { key: "ai与量化", title: "§ 03 · AI 与量化" }
    ];

    // 构造仓库主页地址
    function repoUrl(name) {
        return "https://github.com/" + GH_USER + "/" + name;
    }

    // 转义 HTML 特殊字符，避免注入
    function esc(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    // 渲染单个语言标签
    function langTag(lang) {
        return '<span class="proj-lang" data-lang="' + esc(lang) + '">' +
            esc(lang) + "</span>";
    }

    // 渲染单张项目卡片
    function renderCard(p) {
        const tags = (p.langList || [p.lang]).map(langTag).join("");
        return '<a class="proj-card" href="' + repoUrl(p.name) +
            '" target="_blank" rel="noopener" data-name="' + esc(p.name) + '">' +
            '<div class="proj-card-head">' +
                '<h3 class="proj-card-name">' + esc(p.name) + "</h3>" +
                '<span class="proj-card-stars" data-stars="' + p.stars + '">' +
                    "★ " + p.stars + "</span>" +
            "</div>" +
            '<p class="proj-card-desc">' + esc(p.desc) + "</p>" +
            '<div class="proj-card-tags">' + tags + "</div>" +
            '<div class="proj-card-meta">' +
                '<span class="proj-meta-lang">' + esc(p.lang) + "</span>" +
                '<span class="proj-meta-updated" data-updated="">加载中…</span>' +
            "</div>" +
        "</a>";
    }

    // 按分类渲染所有分区与卡片
    function renderSections() {
        const root = document.getElementById("proj-root");
        if (!root) return;
        root.innerHTML = SECTIONS.map(function (sec) {
            const cards = PROJECTS
                .filter(function (p) { return p.category === sec.key; })
                .map(renderCard)
                .join("");
            return '<section class="proj-section" data-category="' + sec.key +
                '"><h2 class="proj-section-title">' + esc(sec.title) + "</h2>" +
                '<div class="proj-grid">' + cards + "</div></section>";
        }).join("");
    }

    // 应用筛选：控制分区显隐并切换按钮激活态
    function applyFilter(filter) {
        document.querySelectorAll(".proj-section").forEach(function (sec) {
            const cat = sec.getAttribute("data-category");
            sec.style.display = (filter === "all" || filter === cat)
                ? "" : "none";
        });
        document.querySelectorAll(".proj-filter-btn").forEach(function (btn) {
            btn.classList.toggle(
                "is-active",
                btn.getAttribute("data-filter") === filter
            );
        });
    }

    // 从 URL 哈希读取初始筛选分类（支持侧边栏 ?id= 链接）
    function getInitFilter() {
        try {
            const hash = window.location.hash || "";
            const query = hash.split("?")[1] || "";
            const id = new URLSearchParams(query).get("id");
            if (!id) return "all";
            const norm = id.trim().toLowerCase();
            const valid = SECTIONS.map(function (s) {
                return s.key.toLowerCase();
            });
            // 大小写不敏感匹配分类
            const match = SECTIONS.find(function (s) {
                return s.key.toLowerCase() === norm;
            });
            return match ? match.key : "all";
        } catch (e) {
            return "all";
        }
    }

    // 将 ISO 时间格式化为 YYYY-MM-DD
    function formatDate(iso) {
        try {
            const d = new Date(iso);
            if (isNaN(d.getTime())) return "未知";
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            return y + "-" + m + "-" + day;
        } catch (e) {
            return "未知";
        }
    }

    // 标记所有"加载中…"为未知（GitHub 数据获取失败时的兜底）
    function markUpdatedUnknown() {
        document.querySelectorAll(".proj-meta-updated").forEach(function (el) {
            if (/加载中/.test(el.textContent)) {
                el.textContent = "更新时间未知";
            }
        });
    }

    // 拉取 GitHub 仓库实时数据，更新星标数与最后更新时间
    async function fetchRepoData() {
        const controller = new AbortController();
        // 10 秒超时，避免长时间挂起
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
            // 以仓库名小写为键建立索引
            const map = {};
            repos.forEach(function (r) {
                if (r && r.name) map[r.name.toLowerCase()] = r;
            });
            // 逐张卡片更新实时数据
            document.querySelectorAll(".proj-card").forEach(function (card) {
                const name = card.getAttribute("data-name");
                if (!name) return;
                const repo = map[name.toLowerCase()];
                if (!repo) return;
                // 更新星标数（若 API 返回则覆盖本地值）
                if (typeof repo.stargazers_count === "number") {
                    const starEl = card.querySelector(".proj-card-stars");
                    if (starEl) {
                        starEl.textContent = "★ " + repo.stargazers_count;
                        starEl.setAttribute(
                            "data-stars", repo.stargazers_count
                        );
                    }
                }
                // 更新最后推送时间（优先 pushed_at）
                const when = repo.pushed_at || repo.updated_at;
                const upEl = card.querySelector(".proj-meta-updated");
                if (!upEl) return;
                if (when) {
                    upEl.textContent = "更新于 " + formatDate(when);
                    upEl.setAttribute("data-updated", when);
                } else {
                    upEl.textContent = "更新时间未知";
                }
            });
        } finally {
            clearTimeout(timer);
        }
    }

    // 显示错误信息并隐藏加载态
    function showError(msg) {
        const loading = document.getElementById("proj-loading");
        if (loading) loading.style.display = "none";
        const errEl = document.getElementById("proj-error");
        if (errEl) {
            errEl.innerHTML = "项目加载失败：" + esc(msg) +
                '，可前往 <a href="https://github.com/' + GH_USER +
                '" target="_blank" rel="noopener">GitHub 主页</a> 查看。';
            errEl.style.display = "block";
        }
    }

    // 入口：渲染卡片 + 绑定筛选 + 拉取实时数据
    function init() {
        try {
            renderSections();
        } catch (err) {
            showError(err && err.message ? err.message : String(err));
            return;
        }
        // 隐藏加载态
        const loading = document.getElementById("proj-loading");
        if (loading) loading.style.display = "none";

        // 绑定筛选按钮点击事件
        document.querySelectorAll(".proj-filter-btn").forEach(function (btn) {
            btn.addEventListener("click", function () {
                applyFilter(btn.getAttribute("data-filter"));
            });
        });

        // 应用 URL 参数指定的初始筛选
        applyFilter(getInitFilter());

        // 拉取 GitHub 实时数据（失败不影响已有展示）
        fetchRepoData().catch(function (err) {
            console.warn("GitHub 仓库数据获取失败:", err);
            markUpdatedUnknown();
        });
    }

    // 延迟执行，确保 docsify 渲染完成后再操作 DOM
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        setTimeout(init, 200);
    }
})();
</script>
