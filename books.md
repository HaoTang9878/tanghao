# 书籍

> 记录阅读过的书籍与书评 —— 阅读是最持久的投资

欢迎来到我的阅读板块。这里收录了我读过的好书，按类别整理。每本书都附有简短书评和阅读笔记的入口。

---

## 技术书籍

<div class="book-shelf">
    <div class="book-card">
        <div class="book-cover">代码大全</div>
        <div class="book-body">
            <h3 class="book-title">代码大全（第二版）</h3>
            <p class="book-author">Steve McConnell</p>
            <p class="book-rating">推荐指数：★★★★★</p>
            <p class="book-comment">软件构建的百科全书，从命名到架构都有详尽论述，是每个工程师必读的经典。</p>
            <span class="book-tag">软件工程</span>
            <span class="book-tag">最佳实践</span>
        </div>
    </div>
    <div class="book-card">
        <div class="book-cover">重构</div>
        <div class="book-body">
            <h3 class="book-title">重构：改善既有代码的设计</h3>
            <p class="book-author">Martin Fowler</p>
            <p class="book-rating">推荐指数：★★★★★</p>
            <p class="book-comment">系统化讲解代码坏味道与重构手法，读完后看代码的眼光会完全不同。</p>
            <span class="book-tag">重构</span>
            <span class="book-tag">面向对象</span>
        </div>
    </div>
    <div class="book-card">
        <div class="book-cover">深入理解计算机系统</div>
        <div class="book-body">
            <h3 class="book-title">深入理解计算机系统（CSAPP）</h3>
            <p class="book-author">Randal E. Bryant</p>
            <p class="book-rating">推荐指数：★★★★★</p>
            <p class="book-comment">从程序员视角理解底层原理，打通硬件与软件的桥梁，值得反复研读。</p>
            <span class="book-tag">系统原理</span>
            <span class="book-tag">底层</span>
        </div>
    </div>
</div>

---

## 商业书籍

<div class="book-shelf">
    <div class="book-card">
        <div class="book-cover">精益创业</div>
        <div class="book-body">
            <h3 class="book-title">精益创业</h3>
            <p class="book-author">Eric Ries</p>
            <p class="book-rating">推荐指数：★★★★☆</p>
            <p class="book-comment">用最小可行产品验证假设的方法论，对个人项目迭代同样适用。</p>
            <span class="book-tag">创业</span>
            <span class="book-tag">方法论</span>
        </div>
    </div>
    <div class="book-card">
        <div class="book-cover">跨越鸿沟</div>
        <div class="book-body">
            <h3 class="book-title">跨越鸿沟</h3>
            <p class="book-author">Geoffrey A. Moore</p>
            <p class="book-rating">推荐指数：★★★★☆</p>
            <p class="book-comment">解释技术产品如何从早期用户走向大众市场，对产品定位很有启发。</p>
            <span class="book-tag">产品</span>
            <span class="book-tag">市场</span>
        </div>
    </div>
</div>

---

## 文学书籍

<div class="book-shelf">
    <div class="book-card">
        <div class="book-cover">活着</div>
        <div class="book-body">
            <h3 class="book-title">活着</h3>
            <p class="book-author">余华</p>
            <p class="book-rating">推荐指数：★★★★★</p>
            <p class="book-comment">用最朴素的文字写最沉重的命运，读完会重新思考活着的意义。</p>
            <span class="book-tag">小说</span>
            <span class="book-tag">中国文学</span>
        </div>
    </div>
    <div class="book-card">
        <div class="book-cover">百年孤独</div>
        <div class="book-body">
            <h3 class="book-title">百年孤独</h3>
            <p class="book-author">加西亚·马尔克斯</p>
            <p class="book-rating">推荐指数：★★★★★</p>
            <p class="book-comment">魔幻现实主义的巅峰之作，孤独是贯穿七代人的宿命主题。</p>
            <span class="book-tag">小说</span>
            <span class="book-tag">魔幻现实主义</span>
        </div>
    </div>
    <div class="book-card">
        <div class="book-cover">小王子</div>
        <div class="book-body">
            <h3 class="book-title">小王子</h3>
            <p class="book-author">圣埃克苏佩里</p>
            <p class="book-rating">推荐指数：★★★★★</p>
            <p class="book-comment">看似写给孩子的童话，实则是写给所有大人的成长寓言。</p>
            <span class="book-tag">童话</span>
            <span class="book-tag">寓言</span>
        </div>
    </div>
</div>

<style>
/* 书籍卡片容器：自适应网格 */
.book-shelf {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 16px;
    margin: 16px 0 24px;
}
/* 单本书卡片 */
.book-card {
    background: #fff;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    display: flex;
    flex-direction: column;
}
.book-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.12);
}
/* 书籍封面占位：渐变背景 + 书名 */
.book-cover {
    height: 120px;
    background: linear-gradient(135deg, #42b983, #2c7a52);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 700;
    text-align: center;
    padding: 12px;
}
.book-card:nth-child(2n) .book-cover {
    background: linear-gradient(135deg, #1976d2, #0d47a1);
}
.book-card:nth-child(3n) .book-cover {
    background: linear-gradient(135deg, #f57c00, #c25700);
}
.book-body {
    padding: 16px;
}
.book-title {
    margin: 0 0 6px;
    font-size: 16px;
    color: #333;
}
.book-author {
    margin: 0 0 6px;
    font-size: 13px;
    color: #6c757d;
}
.book-rating {
    margin: 0 0 8px;
    font-size: 13px;
    color: #f57c00;
}
.book-comment {
    margin: 0 0 10px;
    font-size: 13px;
    color: #555;
    line-height: 1.6;
}
/* 标签样式 */
.book-tag {
    display: inline-block;
    padding: 2px 8px;
    background: #eef9f3;
    color: #42b983;
    border-radius: 4px;
    font-size: 12px;
    margin-right: 6px;
    margin-bottom: 4px;
}
</style>
