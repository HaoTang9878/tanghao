# 开源项目

> 个人开源项目与对社区的贡献 —— 用代码连接世界

这里整理了我参与和主导的开源项目。每个项目都是一次学习与实践的过程，欢迎 Star、Fork、提 Issue。

---

<div class="project-grid">
    <!-- 项目卡片：OpenAlpha -->
    <a class="project-card" href="#/projects/openalpha/">
        <div class="project-head">
            <h3 class="project-name">OpenAlpha</h3>
            <span class="project-stars">★ 128</span>
        </div>
        <p class="project-desc">
            一个开放式的项目框架，目标是提供开箱即用的工程脚手架与最佳实践模板，
            覆盖前后端、部署、CI/CD 全流程。
        </p>
        <div class="project-tags">
            <span class="project-tag">TypeScript</span>
            <span class="project-tag">Node.js</span>
            <span class="project-tag">Docker</span>
            <span class="project-tag">CI/CD</span>
        </div>
        <div class="project-meta">
            <span>语言：TypeScript</span>
            <span>License：MIT</span>
        </div>
    </a>

    <!-- 项目卡片：个人博客系统 -->
    <a class="project-card" href="#/projects/blog/">
        <div class="project-head">
            <h3 class="project-name">个人博客系统</h3>
            <span class="project-stars">★ 64</span>
        </div>
        <p class="project-desc">
            基于 docsify 搭建的个人作品集与博客系统，支持主题切换、文章搜索、
            认证系统与响应式布局，可一键部署到 GitHub Pages。
        </p>
        <div class="project-tags">
            <span class="project-tag">HTML</span>
            <span class="project-tag">CSS</span>
            <span class="project-tag">docsify</span>
            <span class="project-tag">静态站点</span>
        </div>
        <div class="project-meta">
            <span>语言：HTML/CSS/JS</span>
            <span>License：MIT</span>
        </div>
    </a>

    <!-- 项目卡片：其他（占位） -->
    <a class="project-card" href="https://github.com/HaoTang9878" target="_blank" rel="noopener">
        <div class="project-head">
            <h3 class="project-name">更多项目</h3>
            <span class="project-stars">★ —</span>
        </div>
        <p class="project-desc">
            访问我的 GitHub 主页查看更多实验性项目、代码片段与开源贡献，
            涵盖运维脚本、学习笔记仓库、工具集等多种类型。
        </p>
        <div class="project-tags">
            <span class="project-tag">Python</span>
            <span class="project-tag">Shell</span>
            <span class="project-tag">Go</span>
            <span class="project-tag">更多</span>
        </div>
        <div class="project-meta">
            <span>持续更新中</span>
            <span>欢迎贡献</span>
        </div>
    </a>
</div>

> 想与我合作或贡献代码？欢迎在对应仓库提 Issue 或 PR，也可以通过 [关于我](#/about/) 页面联系我。

<style>
/* 项目卡片网格：自适应列数 */
.project-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
    margin: 16px 0 24px;
}
/* 单个项目卡片：链接形式，整块可点击 */
.project-card {
    display: block;
    background: #fff;
    border-radius: 10px;
    padding: 18px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    text-decoration: none;
    color: inherit;
    border: 1px solid transparent;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}
/* hover 效果：上浮 + 主题色描边 */
.project-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.12);
    border-color: #42b983;
}
.project-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}
.project-name {
    margin: 0;
    font-size: 17px;
    color: #333;
}
.project-stars {
    font-size: 13px;
    color: #f57c00;
    font-weight: 600;
}
.project-desc {
    margin: 0 0 12px;
    font-size: 13px;
    color: #555;
    line-height: 1.6;
}
/* 技术栈标签 */
.project-tags {
    margin-bottom: 12px;
}
.project-tag {
    display: inline-block;
    padding: 2px 8px;
    background: #eef9f3;
    color: #42b983;
    border-radius: 4px;
    font-size: 12px;
    margin-right: 6px;
    margin-bottom: 4px;
}
.project-meta {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #999;
    border-top: 1px solid #f0f0f0;
    padding-top: 10px;
}
</style>
