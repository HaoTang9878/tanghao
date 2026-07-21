/**
 * 文章路由模块
 * 提供文章 CRUD 接口,支持按 slug 访问与作者权限校验
 * 所有路由前缀:/api/articles
 *
 * 字段说明:
 * - id: 自增主键
 * - user_id: 创建者用户 ID(用于权限校验)
 * - title: 标题
 * - slug: URL 友好标识,全局唯一
 * - content: 正文
 * - tags: 标签数组(字符串),可选
 * - status: published/draft,仅 published 出现在公开列表
 * - views: 浏览量,获取详情时自增
 * - likes: 点赞数,匿名点赞自增,作者可取消
 * - created_at / updated_at: ISO 时间戳
 */
const express = require("express");
const { authRequired } = require("../middleware/auth");
const { getDb, writeDb } = require("../db");

const router = express.Router();

/**
 * 规范化 tags 字段为字符串数组
 * 非数组或元素非字符串时返回空数组,保证存储结构一致
 * @param {*} tags - 待规范化的 tags
 * @returns {string[]}
 */
function normalizeTags(tags) {
    if (!Array.isArray(tags)) {
        return [];
    }
    return tags.filter((t) => typeof t === "string");
}

/**
 * 获取客户端 IP 地址
 * 优先使用 Express 的 req.ip,回退到连接的 remoteAddress
 * @param {Object} req - Express 请求对象
 * @returns {string} 客户端 IP 地址
 */
function getClientIp(req) {
    return req.ip || (req.connection && req.connection.remoteAddress) || "unknown";
}

/** 一小时的毫秒数,用于点赞限流判断 */
const ONE_HOUR_MS = 60 * 60 * 1000;

/**
 * GET /api/articles
 * 获取公开文章列表
 */
router.get("/", (req, res) => {
    const db = getDb();
    const articles = db.articles
        .filter((a) => a.status === "published")
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map(({ content, ...rest }) => rest);
    return res.json({ articles });
});

/**
 * GET /api/articles/:slug
 * 获取单篇文章,并自增浏览量
 */
router.get("/:slug", (req, res) => {
    const db = getDb();
    const article = db.articles.find((a) => a.slug === req.params.slug);
    if (!article) {
        return res.status(404).json({ error: "文章不存在" });
    }
    // 自增浏览量并持久化
    article.views = (article.views || 0) + 1;
    writeDb();
    return res.json({ article });
});

/**
 * POST /api/articles/:slug/like
 * 匿名点赞(每个 IP 每小时限 1 次)
 * 返回 { likes: N }
 */
router.post("/:slug/like", (req, res) => {
    const db = getDb();
    const article = db.articles.find((a) => a.slug === req.params.slug);
    if (!article) {
        return res.status(404).json({ error: "文章不存在" });
    }
    const ip = getClientIp(req);
    const now = Date.now();
    // 检查同 IP 一小时内是否已点赞该文章
    const recentLike = db.article_likes.find(
        (l) => l.article_id === article.id &&
               l.ip === ip &&
               (now - l.created_at) < ONE_HOUR_MS
    );
    if (recentLike) {
        return res.status(429).json({ error: "一小时内已点赞" });
    }
    // 记录点赞 IP 并自增点赞数
    article.likes = (article.likes || 0) + 1;
    db.article_likes.push({
        id: db.nextArticleLikeId,
        article_id: article.id,
        ip,
        created_at: now,
    });
    db.nextArticleLikeId += 1;
    writeDb();
    return res.json({ likes: article.likes });
});

/**
 * DELETE /api/articles/:slug/like
 * 取消点赞(需登录,仅作者可操作)
 * likes 减 1 但不低于 0,返回 { likes: N }
 */
router.delete("/:slug/like", authRequired, (req, res) => {
    const db = getDb();
    const article = db.articles.find((a) => a.slug === req.params.slug);
    if (!article) {
        return res.status(404).json({ error: "文章不存在" });
    }
    // 仅作者可以取消自己文章的点赞
    if (article.user_id !== req.user.id) {
        return res.status(403).json({ error: "无权操作他人文章" });
    }
    // 取消点赞,不低于 0
    article.likes = Math.max(0, (article.likes || 0) - 1);
    writeDb();
    return res.json({ likes: article.likes });
});

/**
 * POST /api/articles
 * 创建文章(需登录)
 * 入参:title, slug, content, tags, status
 */
router.post("/", authRequired, (req, res) => {
    const { title, slug, content = "", tags = [], status = "draft" } = req.body;
    if (!title || !slug) {
        return res.status(400).json({ error: "标题和 slug 必填" });
    }
    const db = getDb();
    // slug 唯一性校验
    if (db.articles.some((a) => a.slug === slug)) {
        return res.status(409).json({ error: "slug 已存在" });
    }
    const now = new Date().toISOString();
    const newArticle = {
        id: db.nextArticleId,
        user_id: req.user.id,
        title,
        slug,
        content,
        tags: normalizeTags(tags),
        status,
        views: 0,
        likes: 0,
        created_at: now,
        updated_at: now,
    };
    db.articles.push(newArticle);
    db.nextArticleId += 1;
    writeDb();
    return res.status(201).json({ article: newArticle });
});

/**
 * PUT /api/articles/:slug
 * 更新文章(需登录,仅作者可改)
 * 入参:title, content, tags, status
 */
router.put("/:slug", authRequired, (req, res) => {
    const { title, content, tags, status } = req.body;
    const db = getDb();
    const article = db.articles.find((a) => a.slug === req.params.slug);
    if (!article) {
        return res.status(404).json({ error: "文章不存在" });
    }
    if (article.user_id !== req.user.id) {
        return res.status(403).json({ error: "无权修改他人文章" });
    }
    if (title !== undefined) article.title = title;
    if (content !== undefined) article.content = content;
    if (tags !== undefined) article.tags = normalizeTags(tags);
    if (status !== undefined) article.status = status;
    article.updated_at = new Date().toISOString();
    writeDb();
    return res.json({ article });
});

/**
 * DELETE /api/articles/:slug
 * 删除文章(需登录,仅作者可删)
 */
router.delete("/:slug", authRequired, (req, res) => {
    const db = getDb();
    const idx = db.articles.findIndex((a) => a.slug === req.params.slug);
    if (idx === -1) {
        return res.status(404).json({ error: "文章不存在" });
    }
    if (db.articles[idx].user_id !== req.user.id) {
        return res.status(403).json({ error: "无权删除他人文章" });
    }
    db.articles.splice(idx, 1);
    writeDb();
    return res.json({ message: "已删除" });
});

module.exports = router;
