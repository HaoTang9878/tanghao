/**
 * 全站搜索路由模块
 * 提供对文章、书籍、项目、论坛主题、论文、专利、软件作品的统一关键词搜索
 * 所有路由前缀:/api/search
 *
 * 搜索字段:
 * - articles: title / content / slug
 * - books: title / description / author
 * - projects: title / description / slug
 * - forum_topics: title / content
 *
 * 结果项字段:type, id, title, slug, snippet
 * 大小写不敏感,结果总数上限 50
 */
const express = require("express");
const { getDb } = require("../db");

const router = express.Router();

// 搜索结果总数上限
const MAX_RESULTS = 50;
// snippet 截取的匹配位置前后字符数
const SNIPPET_RADIUS = 50;

/**
 * 在给定文本中查找关键词首次出现位置(大小写不敏感)
 * @param {string} text - 待搜索文本
 * @param {string} keyword - 关键词(已转小写)
 * @returns {number} 首次匹配索引,无匹配返回 -1
 */
function findMatchIndex(text, keyword) {
    if (typeof text !== "string" || !text) {
        return -1;
    }
    return text.toLowerCase().indexOf(keyword);
}

/**
 * 根据匹配位置生成 snippet(前后各取 50 字符)
 * @param {string} text - 原始文本
 * @param {number} index - 匹配起始索引
 * @returns {string} 截取后的摘要
 */
function buildSnippet(text, index) {
    if (typeof text !== "string" || !text) {
        return "";
    }
    const start = Math.max(0, index - SNIPPET_RADIUS);
    const end = Math.min(text.length, index + SNIPPET_RADIUS);
    return text.slice(start, end);
}

/**
 * 构造单个搜索结果项
 * 依次检查传入字段,首个命中字段即生成结果
 * @param {string} type - 结果类型(article/book/project/topic/paper/patent/software)
 * @param {Object} item - 原始记录
 * @param {string} keyword - 关键词(已转小写)
 * @param {Array<string>} fields - 参与匹配的字段名
 * @param {string} titleField - 用于结果标题的字段名(默认 "title")
 * @returns {Object|null} 命中则返回结果项,未命中返回 null
 */
function buildResult(type, item, keyword, fields, titleField = "title") {
    for (const field of fields) {
        const value = item[field];
        const idx = findMatchIndex(value, keyword);
        if (idx !== -1) {
            return {
                type,
                id: item.id,
                title: item[titleField],
                slug: item.slug || "",
                snippet: buildSnippet(value, idx),
            };
        }
    }
    return null;
}

/**
 * GET /api/search?q=关键词
 * 全站搜索,返回各类资源命中结果
 * q 为空或少于 2 字符返回 400
 */
router.get("/", (req, res) => {
    try {
        const q = (req.query.q || "").trim();
        // 关键词过短直接拒绝,避免无意义全表扫描
        if (!q || q.length < 2) {
            return res.status(400).json({
                error: "搜索关键词至少 2 个字符",
            });
        }

        const db = getDb();
        const keyword = q.toLowerCase();
        const all = [];

        // 文章:搜索 title/content/slug
        db.articles.forEach((a) => {
            const r = buildResult("article", a, keyword, [
                "title",
                "content",
                "slug",
            ]);
            if (r) all.push(r);
        });

        // 书籍:搜索 title/description/author
        db.books.forEach((b) => {
            const r = buildResult("book", b, keyword, [
                "title",
                "description",
                "author",
            ]);
            if (r) all.push(r);
        });

        // 项目:搜索 title/description/slug
        db.projects.forEach((p) => {
            const r = buildResult("project", p, keyword, [
                "title",
                "description",
                "slug",
            ]);
            if (r) all.push(r);
        });

        // 论坛主题:搜索 title/content
        db.forum_topics.forEach((t) => {
            const r = buildResult("topic", t, keyword, [
                "title",
                "content",
            ]);
            if (r) all.push(r);
        });

        // 论文:搜索 title/abstract/authors/journal
        db.papers.forEach((p) => {
            const r = buildResult("paper", p, keyword, [
                "title",
                "abstract",
                "authors",
                "journal",
            ]);
            if (r) all.push(r);
        });

        // 专利:搜索 title/abstract/inventors/patent_number
        db.patents.forEach((p) => {
            const r = buildResult("patent", p, keyword, [
                "title",
                "abstract",
                "inventors",
                "patent_number",
            ]);
            if (r) all.push(r);
        });

        // 软件作品:搜索 name/description/tech_stack
        db.software.forEach((s) => {
            const r = buildResult(
                "software",
                s,
                keyword,
                ["name", "description", "tech_stack"],
                "name"
            );
            if (r) all.push(r);
        });

        // 总数不超过 50:截取后按类型分类
        const capped = all.slice(0, MAX_RESULTS);
        const result = {
            articles: [],
            books: [],
            projects: [],
            topics: [],
            papers: [],
            patents: [],
            software: [],
            total: capped.length,
        };
        capped.forEach((item) => {
            if (item.type === "article") result.articles.push(item);
            else if (item.type === "book") result.books.push(item);
            else if (item.type === "project") result.projects.push(item);
            else if (item.type === "topic") result.topics.push(item);
            else if (item.type === "paper") result.papers.push(item);
            else if (item.type === "patent") result.patents.push(item);
            else if (item.type === "software") result.software.push(item);
        });

        return res.json(result);
    } catch (err) {
        console.error("[search] 搜索失败:", err.message);
        return res.status(500).json({ error: "服务器内部错误" });
    }
});

module.exports = router;
