/**
 * 开源项目路由模块
 * 提供开源项目资源的 CRUD 接口,支持按 slug 访问与作者权限校验
 * 所有路由前缀:/api/projects
 *
 * 字段说明:
 * - id: 自增主键
 * - user_id: 创建者用户 ID(用于权限校验)
 * - title: 项目名称
 * - slug: URL 友好标识,全局唯一
 * - description: 项目简介
 * - repo_url: 仓库地址
 * - demo_url: 演示地址
 * - tags: 标签数组
 * - status: published/draft,仅 published 出现在公开列表
 * - stars: 星标数
 * - created_at / updated_at: ISO 时间戳
 */
const express = require("express");
const { authRequired } = require("../middleware/auth");
const { getDb, writeDb } = require("../db");

const router = express.Router();

// 允许的 status 取值
const VALID_STATUS = ["published", "draft"];

/**
 * 规范化 tags 字段为字符串数组
 * 非数组或元素非字符串时返回空数组
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
 * GET /api/projects
 * 获取公开项目列表(仅 status=published),按创建时间倒序
 */
router.get("/", (req, res) => {
    const db = getDb();
    const projects = db.projects
        .filter((p) => p.status === "published")
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return res.json({ projects });
});

/**
 * GET /api/projects/:slug
 * 获取单个项目(任意状态,便于作者预览草稿)
 */
router.get("/:slug", (req, res) => {
    const db = getDb();
    const project = db.projects.find((p) => p.slug === req.params.slug);
    if (!project) {
        return res.status(404).json({ error: "项目不存在" });
    }
    return res.json({ project });
});

/**
 * POST /api/projects
 * 创建项目(需登录)
 * 入参:title, slug, description, repo_url, demo_url, tags, status, stars
 */
router.post("/", authRequired, (req, res) => {
    const {
        title,
        slug,
        description = "",
        repo_url = "",
        demo_url = "",
        tags = [],
        status = "draft",
        stars = 0,
    } = req.body;

    // 必填字段校验
    if (!title || !slug) {
        return res.status(400).json({ error: "标题和 slug 必填" });
    }
    // status 合法性校验
    if (!VALID_STATUS.includes(status)) {
        return res.status(400).json({ error: "status 取值非法" });
    }

    const db = getDb();
    // slug 唯一性校验
    if (db.projects.some((p) => p.slug === slug)) {
        return res.status(409).json({ error: "slug 已存在" });
    }

    const now = new Date().toISOString();
    const newProject = {
        id: db.nextProjectId,
        user_id: req.user.id,
        title,
        slug,
        description,
        repo_url,
        demo_url,
        tags: normalizeTags(tags),
        status,
        stars: Number(stars) || 0,
        created_at: now,
        updated_at: now,
    };
    db.projects.push(newProject);
    db.nextProjectId += 1;
    writeDb();
    return res.status(201).json({ project: newProject });
});

/**
 * PUT /api/projects/:slug
 * 更新项目(需登录,仅作者可改)
 */
router.put("/:slug", authRequired, (req, res) => {
    const {
        title,
        description,
        repo_url,
        demo_url,
        tags,
        status,
        stars,
    } = req.body;

    // status 合法性校验(若提供)
    if (status !== undefined && !VALID_STATUS.includes(status)) {
        return res.status(400).json({ error: "status 取值非法" });
    }

    const db = getDb();
    const project = db.projects.find((p) => p.slug === req.params.slug);
    if (!project) {
        return res.status(404).json({ error: "项目不存在" });
    }
    // 仅作者可修改
    if (project.user_id !== req.user.id) {
        return res.status(403).json({ error: "无权修改他人项目" });
    }

    // 按提供字段更新
    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (repo_url !== undefined) project.repo_url = repo_url;
    if (demo_url !== undefined) project.demo_url = demo_url;
    if (tags !== undefined) project.tags = normalizeTags(tags);
    if (status !== undefined) project.status = status;
    if (stars !== undefined) project.stars = Number(stars) || 0;
    project.updated_at = new Date().toISOString();

    writeDb();
    return res.json({ project });
});

/**
 * DELETE /api/projects/:slug
 * 删除项目(需登录,仅作者可删)
 */
router.delete("/:slug", authRequired, (req, res) => {
    const db = getDb();
    const idx = db.projects.findIndex((p) => p.slug === req.params.slug);
    if (idx === -1) {
        return res.status(404).json({ error: "项目不存在" });
    }
    // 仅作者可删除
    if (db.projects[idx].user_id !== req.user.id) {
        return res.status(403).json({ error: "无权删除他人项目" });
    }
    db.projects.splice(idx, 1);
    writeDb();
    return res.json({ message: "已删除" });
});

module.exports = router;
