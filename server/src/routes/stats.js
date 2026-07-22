/**
 * 统计路由模块
 * 提供网站整体统计数据,包括各分类计数与最新记录
 * 所有路由前缀:/api/stats
 *
 * 返回结构:
 * - counts: 各分类记录总数(文章仅统计 published)
 * - recent: 各分类最新 5 条记录的标题与日期
 */
const express = require("express");
const { getDb } = require("../db");

const router = express.Router();

// 各分类最新记录条数
const RECENT_LIMIT = 5;

/**
 * 按创建时间倒序取前 N 条记录,提取标题与日期
 * @param {Array} items - 原始记录数组
 * @param {number} limit - 取前 N 条
 * @returns {Array<{title: string, date: string}>}
 */
function pickRecent(items, limit) {
    return items
        .slice()
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, limit)
        .map((item) => ({
            title: item.title,
            date: item.created_at,
        }));
}

/**
 * GET /api/stats
 * 返回网站统计数据:各分类计数与最新记录
 */
router.get("/", (req, res) => {
    try {
        const db = getDb();

        // 文章计数仅统计已发布
        const publishedArticles = db.articles.filter(
            (a) => a.status === "published"
        );

        const counts = {
            articles: publishedArticles.length,
            books: db.books.length,
            projects: db.projects.length,
            topics: db.forum_topics.length,
            replies: db.forum_replies.length,
            users: db.users.length,
            papers: db.papers.length,
            patents: db.patents.length,
            software: db.software.length,
        };

        const recent = {
            articles: pickRecent(publishedArticles, RECENT_LIMIT),
            books: pickRecent(db.books, RECENT_LIMIT),
            projects: pickRecent(db.projects, RECENT_LIMIT),
            topics: pickRecent(db.forum_topics, RECENT_LIMIT),
            papers: pickRecent(db.papers, RECENT_LIMIT),
            patents: pickRecent(db.patents, RECENT_LIMIT),
            software: pickRecent(db.software, RECENT_LIMIT, "name"),
        };

        return res.json({ counts, recent });
    } catch (err) {
        console.error("[stats] 获取统计数据失败:", err.message);
        return res.status(500).json({ error: "服务器内部错误" });
    }
});

module.exports = router;
