/**
 * 标签路由模块
 * 聚合文章与项目的标签,提供标签列表及按标签筛选内容
 * 所有路由前缀:/api/tags
 *
 * 统计范围:
 * - 文章:仅 status=published 的文章参与统计
 * - 项目:全部项目参与统计
 */
const express = require("express");
const { getDb } = require("../db");

const router = express.Router();

/**
 * 收集所有标签及其使用计数
 * 遍历已发布文章与全部项目,聚合 tags 出现次数
 * @param {Object} db - 数据库实例
 * @returns {Array<{tag: string, count: number}>} 按使用频率倒序
 */
function collectTagCounts(db) {
    const counter = new Map();

    // 已发布文章的标签参与计数
    db.articles
        .filter((a) => a.status === "published")
        .forEach((a) => {
            (a.tags || []).forEach((tag) => {
                counter.set(tag, (counter.get(tag) || 0) + 1);
            });
        });

    // 全部项目的标签参与计数
    db.projects.forEach((p) => {
        (p.tags || []).forEach((tag) => {
            counter.set(tag, (counter.get(tag) || 0) + 1);
        });
    });

    return Array.from(counter.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count);
}

/**
 * GET /api/tags
 * 获取所有标签及使用计数,按使用频率倒序
 */
router.get("/", (req, res) => {
    try {
        const db = getDb();
        const tags = collectTagCounts(db);
        return res.json({ tags });
    } catch (err) {
        console.error("[tags] 获取标签列表失败:", err.message);
        return res.status(500).json({ error: "服务器内部错误" });
    }
});

/**
 * GET /api/tags/:tag/articles
 * 获取带某标签的已发布文章列表,按创建时间倒序
 */
router.get("/:tag/articles", (req, res) => {
    try {
        const db = getDb();
        const tag = req.params.tag;
        const articles = db.articles
            .filter(
                (a) =>
                    a.status === "published" &&
                    Array.isArray(a.tags) &&
                    a.tags.includes(tag)
            )
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .map(({ content, ...rest }) => rest);
        return res.json({ articles });
    } catch (err) {
        console.error("[tags] 按标签获取文章失败:", err.message);
        return res.status(500).json({ error: "服务器内部错误" });
    }
});

/**
 * GET /api/tags/:tag/projects
 * 获取带某标签的项目列表,按创建时间倒序
 */
router.get("/:tag/projects", (req, res) => {
    try {
        const db = getDb();
        const tag = req.params.tag;
        const projects = db.projects
            .filter((p) => Array.isArray(p.tags) && p.tags.includes(tag))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return res.json({ projects });
    } catch (err) {
        console.error("[tags] 按标签获取项目失败:", err.message);
        return res.status(500).json({ error: "服务器内部错误" });
    }
});

module.exports = router;
