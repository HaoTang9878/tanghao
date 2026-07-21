/**
 * 文章路由模块
 * 预留文章 CRUD 接口,供后续功能扩展使用
 * 所有路由前缀:/api/articles
 */
const express = require("express");
const { authRequired } = require("../middleware/auth");
const { getDb, writeDb } = require("../db");

const router = express.Router();

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
 * 获取单篇文章
 */
router.get("/:slug", (req, res) => {
    const db = getDb();
    const article = db.articles.find((a) => a.slug === req.params.slug);
    if (!article) {
        return res.status(404).json({ error: "文章不存在" });
    }
    return res.json({ article });
});

/**
 * POST /api/articles
 * 创建文章(需登录)
 */
router.post("/", authRequired, (req, res) => {
    const { title, slug, content = "", status = "draft" } = req.body;
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
        status,
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
 */
router.put("/:slug", authRequired, (req, res) => {
    const { title, content, status } = req.body;
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
