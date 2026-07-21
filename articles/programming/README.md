# 编程学习笔记

> 学习、实践、记录 —— 把踩过的坑沉淀成可复用的经验

这里记录我在编程学习过程中的技术笔记和实践经验，涵盖 TypeScript 类型系统、Python 异步编程与 Git 实用技巧。每篇笔记都来自真实编码场景，力求不止于"知道"，更要"用对"。

<div class="note-board">
    <a class="note-card" href="/articles/programming/notes">
        <div class="note-card-cover">TS / Py / Git</div>
        <div class="note-card-body">
            <h3 class="note-card-title">编程学习笔记</h3>
            <p class="note-card-desc">
                TypeScript 类型系统与泛型、Python 装饰器与 asyncio 协程、
                Git rebase 与 bisect 等核心知识点，附实战代码示例。
            </p>
            <div class="note-card-tags">
                <span class="note-tag">TypeScript</span>
                <span class="note-tag">Python</span>
                <span class="note-tag">Git</span>
            </div>
            <span class="note-card-link">阅读全文 →</span>
        </div>
    </a>
</div>

<style>
/* 笔记卡片容器：自适应网格布局 */
.note-board {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
    margin: 20px 0 24px;
}
/* 单张卡片：整卡可点击，圆角 + 阴影 + hover 上浮 */
.note-card {
    display: flex;
    flex-direction: column;
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid var(--bt-border-color, #eee);
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    text-decoration: none;
    transition: transform 0.2s ease, box-shadow 0.2s ease,
                border-color 0.2s ease;
}
/* hover：上浮 + 主题色描边 + 加深阴影 */
.note-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
    border-color: var(--bt-theme-color, #42b983);
}
/* 卡片顶部色块：渐变背景 + 标识居中 */
.note-card-cover {
    height: 96px;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 1px;
    background: linear-gradient(135deg, #42b983, #2c7a52);
}
/* 卡片正文区域 */
.note-card-body {
    padding: 16px;
    flex: 1;
    display: flex;
    flex-direction: column;
}
.note-card-title {
    margin: 0 0 8px;
    font-size: 16px;
    color: var(--bt-text-color, #333);
}
.note-card-desc {
    margin: 0 0 12px;
    font-size: 13px;
    color: var(--bt-text-color, #555);
    line-height: 1.6;
    flex: 1;
}
/* 标签：药丸样式 */
.note-tag {
    display: inline-block;
    padding: 2px 8px;
    background: rgba(66, 185, 131, 0.12);
    color: var(--bt-theme-color, #42b983);
    border-radius: 4px;
    font-size: 12px;
    margin-right: 6px;
    margin-bottom: 4px;
}
/* 阅读全文链接 */
.note-card-link {
    margin-top: 8px;
    font-size: 13px;
    font-weight: 600;
    color: var(--bt-theme-color, #42b983);
}

/* ====== 暗色模式适配：半透明深色卡片 ====== */
body.bt-dark-mode .note-card {
    background: rgba(30, 35, 56, 0.55);
    border-color: var(--bt-border-color, #2a2a4a);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
body.bt-dark-mode .note-card:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.45);
}
body.bt-dark-mode .note-card-desc {
    color: #9aa0b4;
}
body.bt-dark-mode .note-tag {
    background: rgba(255, 255, 255, 0.08);
}

/* ====== 响应式：移动端单列 ====== */
@media (max-width: 768px) {
    .note-board {
        grid-template-columns: 1fr;
    }
}
</style>

---

> 编程是一场没有终点的旅行，每一行代码都是沿途的风景。
