/**
 * 论文路由模块
 * 提供论文资源的 CRUD 接口,支持按 ID 访问与作者权限校验
 * 所有路由前缀:/api/papers
 *
 * 字段说明:
 * - id: 自增主键
 * - user_id: 创建者用户 ID(用于权限校验)
 * - title: 论文标题
 * - authors: 作者列表
 * - abstract: 摘要
 * - journal: 期刊名称
 * - year: 发表年份
 * - doi: 数字对象标识符
 * - url: 论文链接
 * - tags: 标签数组
 * - created_at: ISO 时间戳
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
 * GET /api/papers
 * 获取论文列表,按创建时间倒序,支持 ?tag= 筛选
 */
router.get("/", (req, res) => {
    try {
        const db = getDb();
        let papers = db.papers.slice();
        // 按标签筛选(若提供 tag 参数)
        if (req.query.tag) {
            papers = papers.filter((p) => p.tags.includes(req.query.tag));
        }
        papers.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        return res.json({ papers });
    } catch (err) {
        console.error("[papers] 获取列表失败:", err.message);
        return res.status(500).json({ error: "服务器内部错误" });
    }
});

/**
 * GET /api/papers/:id
 * 获取单篇论文详情
 */
router.get("/:id", (req, res) => {
    try {
        const id = Number(req.params.id);
        // ID 必须为有效整数
        if (!Number.isInteger(id)) {
            return res.status(400).json({ error: "无效的 ID" });
        }
        const db = getDb();
        const paper = db.papers.find((p) => p.id === id);
        if (!paper) {
            return res.status(404).json({ error: "论文不存在" });
        }
        return res.json({ paper });
    } catch (err) {
        console.error("[papers] 获取详情失败:", err.message);
        return res.status(500).json({ error: "服务器内部错误" });
    }
});

/**
 * POST /api/papers
 * 创建论文(需登录)
 * 入参:title, authors, abstract, journal, year, doi, url, tags
 */
router.post("/", authRequired, (req, res) => {
    try {
        const {
            title,
            authors = "",
            abstract = "",
            journal = "",
            year,
            doi = "",
            url = "",
            tags = [],
        } = req.body;

        // 必填字段校验
        if (!title) {
            return res.status(400).json({ error: "标题必填" });
        }

        const db = getDb();
        const now = new Date().toISOString();
        const newPaper = {
            id: db.nextPaperId,
            user_id: req.user.id,
            title,
            authors,
            abstract,
            journal,
            year: year !== undefined ? Number(year) : null,
            doi,
            url,
            tags: normalizeTags(tags),
            created_at: now,
        };
        db.papers.push(newPaper);
        db.nextPaperId += 1;
        writeDb();
        return res.status(201).json({ paper: newPaper });
    } catch (err) {
        console.error("[papers] 创建失败:", err.message);
        return res.status(500).json({ error: "服务器内部错误" });
    }
});

/**
 * PUT /api/papers/:id
 * 更新论文(需登录,仅作者可改)
 * 入参:title, authors, abstract, journal, year, doi, url, tags
 */
router.put("/:id", authRequired, (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            return res.status(400).json({ error: "无效的 ID" });
        }

        const db = getDb();
        const paper = db.papers.find((p) => p.id === id);
        if (!paper) {
            return res.status(404).json({ error: "论文不存在" });
        }
        // 仅作者可修改
        if (paper.user_id !== req.user.id) {
            return res.status(403).json({ error: "无权修改他人论文" });
        }

        const {
            title,
            authors,
            abstract,
            journal,
            year,
            doi,
            url,
            tags,
        } = req.body;

        // 按提供字段更新
        if (title !== undefined) paper.title = title;
        if (authors !== undefined) paper.authors = authors;
        if (abstract !== undefined) paper.abstract = abstract;
        if (journal !== undefined) paper.journal = journal;
        if (year !== undefined) paper.year = Number(year);
        if (doi !== undefined) paper.doi = doi;
        if (url !== undefined) paper.url = url;
        if (tags !== undefined) paper.tags = normalizeTags(tags);

        writeDb();
        return res.json({ paper });
    } catch (err) {
        console.error("[papers] 更新失败:", err.message);
        return res.status(500).json({ error: "服务器内部错误" });
    }
});

/**
 * DELETE /api/papers/:id
 * 删除论文(需登录,仅作者可删)
 */
router.delete("/:id", authRequired, (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            return res.status(400).json({ error: "无效的 ID" });
        }

        const db = getDb();
        const idx = db.papers.findIndex((p) => p.id === id);
        if (idx === -1) {
            return res.status(404).json({ error: "论文不存在" });
        }
        // 仅作者可删除
        if (db.papers[idx].user_id !== req.user.id) {
            return res.status(403).json({ error: "无权删除他人论文" });
        }
        db.papers.splice(idx, 1);
        writeDb();
        return res.json({ message: "已删除" });
    } catch (err) {
        console.error("[papers] 删除失败:", err.message);
        return res.status(500).json({ error: "服务器内部错误" });
    }
});

module.exports = router;
