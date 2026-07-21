# GitHub 活跃记录

> 实时展示 HaoTang9878 在 GitHub 上的公开活动与贡献

<div id="gh-loading" class="gh-state">正在加载 GitHub 数据...</div>
<div id="gh-error" class="gh-state gh-error" style="display:none;"></div>

<!-- 用户基本信息卡片 -->
<div id="gh-profile" class="gh-profile" style="display:none;"></div>

<!-- 贡献热力图 -->
<h2>贡献热力图</h2>
<p class="gh-hint">基于最近 30 条公开活动聚合而成，颜色深浅代表当日活跃度。</p>
<div id="gh-heatmap" class="gh-heatmap"></div>

<!-- 最近活动列表 -->
<h2>最近活动</h2>
<div id="gh-events" class="gh-events"></div>

<style>
/* ====== GitHub 卡片区通用样式 ====== */
.gh-state {
    padding: 20px;
    text-align: center;
    color: #6c757d;
    font-size: 14px;
}
.gh-error {
    color: #dc3545;
    background: #fff5f5;
    border: 1px solid #ffd6d6;
    border-radius: 6px;
}
/* 用户信息卡片 */
.gh-profile {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 20px;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    margin: 16px 0;
}
.gh-profile img {
    width: 96px;
    height: 96px;
    border-radius: 50%;
    border: 3px solid #42b983;
}
.gh-profile .gh-meta {
    flex: 1;
}
.gh-profile .gh-name {
    font-size: 20px;
    font-weight: 700;
    color: #333;
    margin: 0 0 6px;
}
.gh-profile .gh-bio {
    color: #6c757d;
    font-size: 14px;
    margin: 0 0 10px;
}
.gh-profile .gh-stats {
    display: flex;
    gap: 20px;
    font-size: 13px;
    color: #555;
}
.gh-profile .gh-stats span b {
    color: #42b983;
}
.gh-profile a {
    color: #42b983;
    text-decoration: none;
}
.gh-profile a:hover {
    text-decoration: underline;
}

/* 贡献热力图：CSS grid 模拟 GitHub contribution graph */
.gh-hint {
    color: #6c757d;
    font-size: 13px;
}
.gh-heatmap {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(14px, 1fr));
    gap: 3px;
    padding: 12px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    margin-bottom: 24px;
}
.gh-cell {
    width: 14px;
    height: 14px;
    border-radius: 2px;
    background: #ebedf0;
    position: relative;
    cursor: default;
}
.gh-cell.l1 { background: #c6e48b; }
.gh-cell.l2 { background: #7bc96f; }
.gh-cell.l3 { background: #239a3b; }
.gh-cell.l4 { background: #196127; }
.gh-cell:hover::after {
    content: attr(data-tip);
    position: absolute;
    bottom: 18px;
    left: 0;
    background: #333;
    color: #fff;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 11px;
    white-space: nowrap;
    z-index: 10;
}

/* 活动列表 */
.gh-events {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.gh-event {
    padding: 14px 16px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    border-left: 3px solid #42b983;
}
.gh-event-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
    flex-wrap: wrap;
    gap: 6px;
}
.gh-event-type {
    display: inline-block;
    padding: 2px 8px;
    background: #eef9f3;
    color: #42b983;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
}
.gh-event-repo {
    color: #1976d2;
    font-size: 13px;
    text-decoration: none;
}
.gh-event-repo:hover {
    text-decoration: underline;
}
.gh-event-time {
    color: #999;
    font-size: 12px;
}
.gh-event-msg {
    color: #444;
    font-size: 14px;
    margin: 4px 0 0;
}
.gh-event-sha {
    color: #999;
    font-size: 12px;
    font-family: monospace;
}
@media (max-width: 768px) {
    .gh-profile {
        flex-direction: column;
        text-align: center;
    }
    .gh-profile .gh-stats {
        justify-content: center;
    }
}
</style>

<script>
// GitHub 活跃记录模块：拉取公开数据并渲染
(function () {
    const USER = "HaoTang9878";
    // GitHub 公开事件 API（无需 token）
    const EVENTS_API = "https://api.github.com/users/" + USER + "/events/public";
    // GitHub 用户信息 API
    const USER_API = "https://api.github.com/users/" + USER;

    // 通用 fetch 封装：含错误处理与超时控制
    async function fetchJSON(url) {
        const controller = new AbortController();
        // 10 秒超时，避免长时间挂起
        const timer = setTimeout(function() { controller.abort(); }, 10000);
        try {
            const res = await fetch(url, {
                signal: controller.signal,
                headers: { "Accept": "application/vnd.github+json" }
            });
            if (!res.ok) {
                throw new Error("HTTP " + res.status + " " + res.statusText);
            }
            return await res.json();
        } finally {
            clearTimeout(timer);
        }
    }

    // 显示错误信息
    function showError(msg) {
        document.getElementById("gh-loading").style.display = "none";
        const errEl = document.getElementById("gh-error");
        errEl.textContent = "加载失败：" + msg;
        errEl.style.display = "block";
    }

    // 渲染用户基本信息卡片
    function renderProfile(user) {
        const el = document.getElementById("gh-profile");
        if (!user) return;
        el.innerHTML =
            '<img src="' + user.avatar_url + '" alt="' + user.login + '">' +
            '<div class="gh-meta">' +
                '<p class="gh-name">' + (user.name || user.login) + '</p>' +
                '<p class="gh-bio">' + (user.bio || "暂无简介") + '</p>' +
                '<div class="gh-stats">' +
                    '<span>仓库 <b>' + user.public_repos + '</b></span>' +
                    '<span>关注者 <b>' + user.followers + '</b></span>' +
                    '<span>关注中 <b>' + user.following + '</b></span>' +
                '</div>' +
                '<p style="margin:8px 0 0;font-size:13px;">' +
                    '<a href="' + user.html_url + '" target="_blank" rel="noopener">访问 GitHub 主页 →</a>' +
                '</p>' +
            '</div>';
        el.style.display = "flex";
    }

    // 渲染贡献热力图：基于近 30 条活动按日期聚合
    function renderHeatmap(events) {
        const el = document.getElementById("gh-heatmap");
        if (!el) return;
        // 构建日期到活动数的映射
        const dateCount = {};
        events.forEach(function(ev) {
            const d = ev.created_at ? ev.created_at.slice(0, 10) : "";
            if (d) dateCount[d] = (dateCount[d] || 0) + 1;
        });
        // 生成最近 53 周 × 7 天 = 371 格的网格
        const cells = [];
        const today = new Date();
        // 起点设为 371 天前，对齐到周日
        const start = new Date(today);
        start.setDate(start.getDate() - 370);
        for (let i = 0; i < 371; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            const key = d.toISOString().slice(0, 10);
            const count = dateCount[key] || 0;
            // 根据活动数映射到 4 个等级
            let level = "";
            if (count >= 4) level = "l4";
            else if (count === 3) level = "l3";
            else if (count === 2) level = "l2";
            else if (count === 1) level = "l1";
            const tip = key + " " + count + " 次活动";
            cells.push('<div class="gh-cell ' + level + '" data-tip="' + tip + '"></div>');
        }
        el.innerHTML = cells.join("");
    }

    // 渲染最近活动列表
    function renderEvents(events) {
        const el = document.getElementById("gh-events");
        if (!el) return;
        // 限制显示最近 30 条
        const list = events.slice(0, 30);
        if (list.length === 0) {
            el.innerHTML = '<p style="color:#999;text-align:center;padding:20px;">暂无最近活动数据</p>';
            return;
        }
        // 事件类型中英文映射
        const typeMap = {
            "PushEvent": "提交",
            "CreateEvent": "创建",
            "ForkEvent": "Fork",
            "WatchEvent": "Star",
            "PullRequestEvent": "PR",
            "IssuesEvent": "Issue",
            "IssueCommentEvent": "评论",
            "ReleaseEvent": "发布"
        };
        el.innerHTML = list.map(function(ev) {
            const type = typeMap[ev.type] || ev.type;
            const repo = ev.repo ? ev.repo.name : "";
            const repoUrl = repo ? "https://github.com/" + repo : "#";
            const time = ev.created_at ? new Date(ev.created_at).toLocaleString("zh-CN") : "";
            // 提取提交信息与 SHA（仅 PushEvent 有）
            let msg = "";
            let sha = "";
            if (ev.type === "PushEvent" && ev.payload && ev.payload.commits && ev.payload.commits.length) {
                const c = ev.payload.commits[0];
                msg = c.message ? c.message.split("\n")[0] : "";
                sha = c.sha ? c.sha.slice(0, 7) : "";
            } else if (ev.payload && ev.payload.pull_request) {
                msg = ev.payload.pull_request.title || "";
            } else if (ev.payload && ev.payload.issue) {
                msg = ev.payload.issue.title || "";
            } else if (ev.payload && ev.payload.release) {
                msg = ev.payload.release.name || ev.payload.release.tag_name || "";
            }
            return '<div class="gh-event">' +
                '<div class="gh-event-head">' +
                    '<span class="gh-event-type">' + type + '</span>' +
                    '<a class="gh-event-repo" href="' + repoUrl + '" target="_blank" rel="noopener">' + repo + '</a>' +
                    '<span class="gh-event-time">' + time + '</span>' +
                '</div>' +
                (msg ? '<p class="gh-event-msg">' + escapeHTML(msg) + '</p>' : '') +
                (sha ? '<p class="gh-event-sha">SHA: ' + sha + '</p>' : '') +
            '</div>';
        }).join("");
    }

    // 转义 HTML 特殊字符，避免注入
    function escapeHTML(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    // 入口：并行拉取用户信息与活动数据
    async function init() {
        try {
            // Promise.all 并行请求，任一失败则进入 catch
            const results = await Promise.allSettled([
                fetchJSON(USER_API),
                fetchJSON(EVENTS_API)
            ]);
            const user = results[0].status === "fulfilled" ? results[0].value : null;
            const events = results[1].status === "fulfilled" ? results[1].value : null;
            // 隐藏 loading
            document.getElementById("gh-loading").style.display = "none";
            // 两个请求都失败才报错
            if (!user && !events) {
                throw new Error("用户信息与活动数据均无法获取");
            }
            if (user) renderProfile(user);
            if (events && Array.isArray(events)) {
                renderHeatmap(events);
                renderEvents(events);
            } else {
                document.getElementById("gh-events").innerHTML =
                    '<p style="color:#999;text-align:center;padding:20px;">活动数据为空或获取失败</p>';
            }
        } catch (err) {
            showError(err && err.message ? err.message : String(err));
        }
    }

    // 延迟执行，确保 docsify 渲染完成后再操作 DOM
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        setTimeout(init, 200);
    }
})();
</script>
