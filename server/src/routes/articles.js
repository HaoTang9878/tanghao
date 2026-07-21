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
