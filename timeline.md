# 时间线

> 记录成长路上的每一个里程碑 —— 回望来路，方知去处

<!-- 垂直时间线容器：左侧线条由伪元素绘制 -->
<div class="timeline">
    <!-- 单个节点：圆点 + 内容卡片 -->
    <div class="tl-item">
        <div class="tl-dot"></div>
        <div class="tl-content">
            <span class="tl-date">2024-11</span>
            <h3 class="tl-title">开启 GitHub 之旅</h3>
            <p class="tl-desc">注册 GitHub 账号 @HaoTang9878，迈出开源世界的第一步。从 fork 第一个仓库开始，学习 Git 版本控制与协作流程，把"写代码"从课堂作业变成持续的习惯。</p>
        </div>
    </div>

    <div class="tl-item">
        <div class="tl-dot"></div>
        <div class="tl-content">
            <span class="tl-date">2025-03</span>
            <h3 class="tl-title">深入学习核工程计算</h3>
            <p class="tl-desc">系统学习蒙特卡洛中子输运程序 OpenMC，研究熔盐堆物理特性与燃耗链建模。完成点堆中子动力学求解器 point_reactor，把反应堆物理方程落到代码里。</p>
        </div>
    </div>

    <div class="tl-item">
        <div class="tl-dot"></div>
        <div class="tl-content">
            <span class="tl-date">2025-06</span>
            <h3 class="tl-title">探索量化交易，构建策略框架</h3>
            <p class="tl-desc">从统计学与时间序列入手，构建量化策略合集 strategies，实践均值回归、动量、网格等策略的回测。把核工程里的数值思维迁移到金融市场建模。</p>
        </div>
    </div>

    <div class="tl-item">
        <div class="tl-dot"></div>
        <div class="tl-content">
            <span class="tl-date">2025-12</span>
            <h3 class="tl-title">研究 AI 辅助编程工具</h3>
            <p class="tl-desc">深入使用 AI 编程助手，开发 evil-read-arxiv 论文阅读工具，用大模型自动抓取 arXiv 论文并生成摘要。探索 AI 如何提升科研与工程的效率边界。</p>
        </div>
    </div>

    <div class="tl-item">
        <div class="tl-dot"></div>
        <div class="tl-content">
            <span class="tl-date">2026-03</span>
            <h3 class="tl-title">开发 OpenAlpha 量化交易系统</h3>
            <p class="tl-desc">启动 OpenAlpha 项目，搭建行情接入、策略回测与风险管理的工程化脚手架。追求可复用、可扩展的量化系统架构，把零散策略沉淀为体系。</p>
        </div>
    </div>

    <div class="tl-item">
        <div class="tl-dot"></div>
        <div class="tl-content">
            <span class="tl-date">2026-07</span>
            <h3 class="tl-title">上线个人博客 brucetanghao.com</h3>
            <p class="tl-desc">基于 docsify + Express 上线个人作品集网站，集成暗色模式、主题切换、讨论区与留言功能。把分散在 GitHub 的项目、笔记与思考聚合到一站。</p>
        </div>
    </div>
</div>

> 下一个里程碑，正在书写中。

<style>
/* ====== 时间线容器：左侧竖线由伪元素统一绘制 ====== */
.timeline {
    position: relative;
    margin: 24px 0;
    padding-left: 8px;
}
/* 竖线：绝对定位贴在左侧 */
.timeline::before {
    content: "";
    position: absolute;
    left: 14px;
    top: 6px;
    bottom: 6px;
    width: 2px;
    background: var(--bt-border-color, #e0e0e0);
}

/* 单个节点：圆点 + 内容卡片横向排列 */
.tl-item {
    position: relative;
    padding-left: 40px;
    margin-bottom: 28px;
}
/* 圆点：绝对定位叠在竖线上 */
.tl-dot {
    position: absolute;
    left: 7px;
    top: 4px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #fff;
    border: 3px solid var(--bt-theme-color, #42b983);
    box-sizing: border-box;
    z-index: 1;
}

/* 内容卡片 */
.tl-content {
    background: #fff;
    border-radius: 10px;
    padding: 16px 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.tl-content:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 14px rgba(0,0,0,0.1);
}
.tl-date {
    display: inline-block;
    font-size: 12px;
    color: #fff;
    background: var(--bt-theme-color, #42b983);
    padding: 2px 10px;
    border-radius: 12px;
    margin-bottom: 8px;
}
.tl-title {
    margin: 0 0 8px;
    font-size: 16px;
    color: var(--bt-text-color, #333);
}
.tl-desc {
    margin: 0;
    font-size: 13px;
    color: var(--bt-text-color, #555);
    line-height: 1.7;
}

/* ====== 暗色模式适配 ====== */
body.bt-dark-mode .tl-content {
    background: rgba(30, 35, 56, 0.55);
    border: 1px solid var(--bt-border-color, #2a2a4a);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
body.bt-dark-mode .tl-content:hover {
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45);
}
body.bt-dark-mode .tl-dot {
    background: rgba(30, 35, 56, 0.9);
}

/* ====== 响应式：移动端缩小内边距 ====== */
@media (max-width: 768px) {
    .tl-item {
        padding-left: 32px;
        margin-bottom: 22px;
    }
    .tl-content {
        padding: 14px 16px;
    }
}
</style>
