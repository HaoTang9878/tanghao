/**
 * 书籍路由模块
 * 提供书籍资源的 CRUD 接口,支持按 slug 访问与作者权限校验
 * 所有路由前缀:/api/books
 *
 * 字段说明:
 * - id: 自增主键
 * - user_id: 创建者用户 ID(用于权限校验)
 * - title: 书名
 * - slug: URL 友好标识,全局唯一
 * - author: 原作者/译者
 * - description: 简介
 * - cover_url: 封面图地址
 * - status: published/draft,仅 published 出现在公开列表
 * - rating: 评分 1-5
 * - created_at / updated_at: ISO 时间戳
 */
const express = require("express");
const { authRequired } = require("../middleware/auth");
const { getDb, writeDb } = require("../db");

const router = express.Router();

// 允许的 status 取值
const VALID_STATUS = ["published", "draft"];

/**
 * 校验评分是否在 1-5 范围内
 * @param {*} rating - 待校验的评分
 * @returns {boolean}
 */
function isValidRating(rating) {
    const n = Number(rating);
    return Number.isInteger(n) && n >= 1 && n <= 5;
}

/**
 * GET /api/books
 * 获取公开书籍列表(仅 status=published),按创建时间倒序
 */
router.get("/", (req, res) => {
    const db = getDb();
    const books = db.books
        .filter((b) => b.status === "published")
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return res.json({ books });
});

/**
 * GET /api/books/:slug
 * 获取单本书籍(任意状态,便于作者预览草稿)
 */
router.get("/:slug", (req, res) => {
    const db = getDb();
    const book = db.books.find((b) => b.slug === req.params.slug);
    if (!book) {
        return res.status(404).json({ error: "书籍不存在" });
    }
    return res.json({ book });
});

/**
 * POST /api/books
 * 创建书籍(需登录)
 * 入参:title, slug, author, description, cover_url, status, rating
 * rating 未提供时默认 0 表示未评分,显式提供时必须为 1-5
 */
router.post("/", authRequired, (req, res) => {
    const {
        title,
        slug,
        author = "",
        description = "",
        cover_url = "",
        status = "draft",
        rating,
    } = req.body;

    // 必填字段校验
    if (!title || !slug) {
        return res.status(400).json({ error: "标题和 slug 必填" });
    }
    // status 合法性校验
    if (!VALID_STATUS.includes(status)) {
        return res.status(400).json({ error: "status 取值非法" });
    }
    // 评分范围校验(仅在显式提供时校验,0 表示未评分)
    if (rating !== undefined && !isValidRating(rating)) {
        return res.status(400).json({ error: "rating 必须为 1-5 的整数" });
    }

    const db = getDb();
    // slug 唯一性校验
    if (db.books.some((b) => b.slug === slug)) {
        return res.status(409).json({ error: "slug 已存在" });
    }

    const now = new Date().toISOString();
    const newBook = {
        id: db.nextBookId,
        user_id: req.user.id,
        title,
        slug,
        author,
        description,
        cover_url,
        status,
        rating: rating !== undefined ? Number(rating) : 0,
        created_at: now,
        updated_at: now,
    };
    db.books.push(newBook);
    db.nextBookId += 1;
    writeDb();
    return res.status(201).json({ book: newBook });
});

/**
 * PUT /api/books/:slug
 * 更新书籍(需登录,仅作者可改)
 */
router.put("/:slug", authRequired, (req, res) => {
    const {
        title,
        author,
        description,
        cover_url,
        status,
        rating,
    } = req.body;

    // status 合法性校验(若提供)
    if (status !== undefined && !VALID_STATUS.includes(status)) {
        return res.status(400).json({ error: "status 取值非法" });
    }
    // 评分范围校验(若提供)
    if (rating !== undefined && !isValidRating(rating)) {
        return res.status(400).json({ error: "rating 必须为 1-5 的整数" });
    }

    const db = getDb();
    const book = db.books.find((b) => b.slug === req.params.slug);
    if (!book) {
        return res.status(404).json({ error: "书籍不存在" });
    }
    // 仅作者可修改
    if (book.user_id !== req.user.id) {
        return res.status(403).json({ error: "无权修改他人书籍" });
    }

    // 按提供字段更新
    if (title !== undefined) book.title = title;
    if (author !== undefined) book.author = author;
    if (description !== undefined) book.description = description;
    if (cover_url !== undefined) book.cover_url = cover_url;
    if (status !== undefined) book.status = status;
    if (rating !== undefined) book.rating = Number(rating);
    book.updated_at = new Date().toISOString();

    writeDb();
    return res.json({ book });
});

/**
 * DELETE /api/books/:slug
 * 删除书籍(需登录,仅作者可删)
 */
router.delete("/:slug", authRequired, (req, res) => {
    const db = getDb();
    const idx = db.books.findIndex((b) => b.slug === req.params.slug);
    if (idx === -1) {
        return res.status(404).json({ error: "书籍不存在" });
    }
    // 仅作者可删除
    if (db.books[idx].user_id !== req.user.id) {
        return res.status(403).json({ error: "无权删除他人书籍" });
    }
    db.books.splice(idx, 1);
    writeDb();
    return res.json({ message: "已删除" });
});

module.exports = router;
