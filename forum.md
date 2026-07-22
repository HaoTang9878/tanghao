# 讨论区

> 技术交流与思想碰撞 —— 期待你的声音

这是一个开放的讨论空间。欢迎在这里分享技术见解、提出问题、交流心得。

<!-- 未登录时显示的发帖按钮：跳转到登录页 -->
<div class="forum-toolbar">
    <button class="forum-new-btn" id="forum-new-btn">+ 发起新讨论</button>
</div>

<!-- 主题列表 -->
<div class="forum-list">
    <a class="forum-topic" href="#/forum">
        <div class="topic-main">
            <h3 class="topic-title">如何高效学习一门新的编程语言？</h3>
            <p class="topic-excerpt">最近在学 Rust，发现和以前学的语言差异很大，想听听大家的系统性学习方法...</p>
            <div class="topic-meta">
                <span class="topic-author">作者：BruceTang</span>
                <span class="topic-time">2 天前</span>
                <span class="topic-tag">学习方法</span>
            </div>
        </div>
        <div class="topic-stats">
            <div class="stat-item">
                <div class="stat-num">12</div>
                <div class="stat-label">回复</div>
            </div>
            <div class="stat-item">
                <div class="stat-num">348</div>
                <div class="stat-label">浏览</div>
            </div>
        </div>
    </a>

    <a class="forum-topic" href="#/forum">
        <div class="topic-main">
            <h3 class="topic-title">docsify 自定义主题的实践分享</h3>
            <p class="topic-excerpt">分享本站使用的浮动主题选择器实现方案，包括 CSS 变量切换与 localStorage 持久化...</p>
            <div class="topic-meta">
                <span class="topic-author">作者：BruceTang</span>
                <span class="topic-time">5 天前</span>
                <span class="topic-tag">docsify</span>
                <span class="topic-tag">前端</span>
            </div>
        </div>
        <div class="topic-stats">
            <div class="stat-item">
                <div class="stat-num">8</div>
                <div class="stat-label">回复</div>
            </div>
            <div class="stat-item">
                <div class="stat-num">156</div>
                <div class="stat-label">浏览</div>
            </div>
        </div>
    </a>
</div>

<p class="forum-empty">更多主题正在路上，欢迎参与讨论～</p>

<style>
/* 工具条：发帖按钮容器 */
.forum-toolbar {
    display: flex;
    justify-content: flex-end;
    margin: 16px 0 20px;
}
/* 发帖按钮：主题色高亮 */
.forum-new-btn {
    padding: 8px 18px;
    background: #42b983;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(66,185,131,0.3);
    transition: background 0.2s ease, transform 0.1s ease;
}
.forum-new-btn:hover {
    background: #369870;
}
.forum-new-btn:active {
    transform: scale(0.97);
}

/* 主题列表 */
.forum-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
/* 单个主题条目：可点击整行 */
.forum-topic {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 18px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    text-decoration: none;
    color: inherit;
    border-left: 3px solid transparent;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}
.forum-topic:hover {
    border-left-color: #42b983;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    transform: translateX(2px);
}
.topic-main {
    flex: 1;
    min-width: 0;
}
.topic-title {
    margin: 0 0 6px;
    font-size: 16px;
    color: #333;
}
.topic-excerpt {
    margin: 0 0 8px;
    font-size: 13px;
    color: #666;
    line-height: 1.5;
    /* 单行省略避免过长 */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.topic-meta {
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: #999;
    flex-wrap: wrap;
}
.topic-tag {
    color: #42b983;
    background: #eef9f3;
    padding: 1px 6px;
    border-radius: 3px;
}
/* 右侧统计区 */
.topic-stats {
    display: flex;
    gap: 18px;
    padding-left: 16px;
    border-left: 1px solid #f0f0f0;
}
.stat-item {
    text-align: center;
    min-width: 48px;
}
.stat-num {
    font-size: 16px;
    font-weight: 700;
    color: #555;
}
.stat-label {
    font-size: 11px;
    color: #999;
    margin-top: 2px;
}
.forum-empty {
    text-align: center;
    color: #999;
    font-size: 13px;
    margin-top: 24px;
}

/* 移动端：统计区下移到下方 */
@media (max-width: 768px) {
    .forum-topic {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }
    .topic-stats {
        border-left: none;
        border-top: 1px solid #f0f0f0;
        padding-left: 0;
        padding-top: 10px;
        width: 100%;
    }
    .topic-excerpt {
        white-space: normal;
    }
}
</style>

<script>
// 讨论区发帖按钮逻辑：未登录则跳转登录页
document.getElementById("forum-new-btn").addEventListener("click", function() {
    const token = localStorage.getItem("brucetanghao_token");
    if (!token) {
        // 未登录：引导跳转登录页
        location.href = "#/login";
        return;
    }
    // 已登录：预留发帖入口（后续可接入发帖表单）
    alert("发帖功能即将上线，敬请期待！");
});
</script>
