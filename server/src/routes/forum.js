/**
 * 论坛路由模块
 * 提供主题与回复的接口,支持主题创建、回复、删除(仅作者)
 * 所有路由前缀:/api/forum
 *
 * 主题字段:
 * - id, user_id, title, slug, content, views, reply_count
 * - created_at, updated_at
 *
 * 回复字段:
 * - id, topic_id, user_id, content, created_at
 */
const express = require("express");
const { authRequired } = require("../middleware/auth");
const { getDb, writeDb } = require("../db");

const router = express.Router();

/**
 * 根据 slug 查找主题
 * @param {Object} db - 数据库实例
 * @param {string} slug - 主题 slug
 * @returns {Object|undefined}
 */
function findTopicBySlug(db, slug) {
    return db.forum_topics.find((t) => t.slug === slug);
}

/**
 * GET /api/forum/topics
 * 获取主题列表,按创建时间倒序
 * 列表不含 content,减少传输体积
 */
router.get("/topics", (req, res) => {
    const db = getDb();
    const topics = db.forum_topics
        .slice()
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map(({ content, ...rest }) => rest);
    return res.json({ topics });
});

/**
 * GET /api/forum/topics/:slug
 * 获取单个主题(含回复列表),并自增浏览数
 */
router.get("/topics/:slug", (req, res) => {
    const db = getDb();
    const topic = findTopicBySlug(db, req.params.slug);
    if (!topic) {
        return res.status(404).json({ error: "主题不存在" });
    }
    // 自增浏览数并持久化
    topic.views = (topic.views || 0) + 1;
    writeDb();

    // 关联回复(按时间正序)
    const replies = db.forum_replies
        .filter((r) => r.topic_id === topic.id)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    return res.json({ topic, replies });
});

/**
 * POST /api/forum/topics
 * 创建主题(需登录)
 * 入参:title, slug, content
 */
router.post("/topics", authRequired, (req, res) => {
    const { title, slug, content = "" } = req.body;
    // 必填字段校验
    if (!title || !slug) {
        return res.status(400).json({ error: "标题和 slug 必填" });
    }

    const db = getDb();
    // slug 唯一性校验
    if (findTopicBySlug(db, slug)) {
        return res.status(409).json({ error: "slug 已存在" });
    }

    const now = new Date().toISOString();
    const newTopic = {
        id: db.nextTopicId,
        user_id: req.user.id,
        title,
        slug,
        content,
        views: 0,
        reply_count: 0,
        created_at: now,
        updated_at: now,
    };
    db.forum_topics.push(newTopic);
    db.nextTopicId += 1;
    writeDb();
    return res.status(201).json({ topic: newTopic });
});

/**
 * POST /api/forum/topics/:slug/replies
 * 创建回复(需登录)
 * 入参:content
 */
router.post("/topics/:slug/replies", authRequired, (req, res) => {
    const { content } = req.body;
    // 内容必填校验
    if (!content || !String(content).trim()) {
        return res.status(400).json({ error: "回复内容不能为空" });
    }

    const db = getDb();
    const topic = findTopicBySlug(db, req.params.slug);
    if (!topic) {
        return res.status(404).json({ error: "主题不存在" });
    }

    const now = new Date().toISOString();
    const newReply = {
        id: db.nextReplyId,
        topic_id: topic.id,
        user_id: req.user.id,
        content: String(content),
        created_at: now,
    };
    db.forum_replies.push(newReply);
    db.nextReplyId += 1;
    // 同步更新主题的回复数与更新时间
    topic.reply_count = (topic.reply_count || 0) + 1;
    topic.updated_at = now;
    writeDb();
    return res.status(201).json({ reply: newReply });
});

/**
 * DELETE /api/forum/topics/:slug
 * 删除主题(需登录,仅作者可删)
 * 同时清理该主题下的所有回复
 */
router.delete("/topics/:slug", authRequired, (req, res) => {
    const db = getDb();
    const idx = db.forum_topics.findIndex((t) => t.slug === req.params.slug);
    if (idx === -1) {
        return res.status(404).json({ error: "主题不存在" });
    }
    // 仅作者可删除
    if (db.forum_topics[idx].user_id !== req.user.id) {
        return res.status(403).json({ error: "无权删除他人主题" });
    }
    const topicId = db.forum_topics[idx].id;
    // 删除主题及其关联回复
    db.forum_topics.splice(idx, 1);
    db.forum_replies = db.forum_replies.filter((r) => r.topic_id !== topicId);
    writeDb();
    return res.json({ message: "已删除" });
});

module.exports = router;
