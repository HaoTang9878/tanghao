/**
 * 软件作品路由模块
 * 提供软件作品资源的 CRUD 接口,支持按 ID 访问与作者权限校验
 * 所有路由前缀:/api/software
 *
 * 字段说明:
 * - id: 自增主键
 * - user_id: 创建者用户 ID(用于权限校验)
 * - name: 软件名称
 * - description: 简介
 * - tech_stack: 技术栈
 * - repo_url: 仓库地址
 * - demo_url: 演示地址
 * - version: 版本号
 * - license: 开源协议
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
 * GET /api/software
 * 获取软件作品列表,按创建时间倒序,支持 ?tag= 筛选
 */
router.get("/", (req, res) => {
    try {
        const db = getDb();
        let items = db.software.slice();
        // 按标签筛选(若提供 tag 参数)
        if (req.query.tag) {
            items = items.filter((s) => s.tags.includes(req.query.tag));
        }
        items.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        return res.json({ software: items });
    } catch (err) {
        console.error("[software] 获取列表失败:", err.message);
        return res.status(500).json({ error: "服务器内部错误" });
    }
});

/**
 * GET /api/software/:id
 * 获取单个软件作品详情
 */
router.get("/:id", (req, res) => {
    try {
        const id = Number(req.params.id);
        // ID 必须为有效整数
        if (!Number.isInteger(id)) {
            return res.status(400).json({ error: "无效的 ID" });
        }
        const db = getDb();
        const item = db.software.find((s) => s.id === id);
        if (!item) {
            return res.status(404).json({ error: "软件作品不存在" });
        }
        return res.json({ software: item });
    } catch (err) {
        console.error("[software] 获取详情失败:", err.message);
        return res.status(500).json({ error: "服务器内部错误" });
    }
});

/**
 * POST /api/software
 * 创建软件作品(需登录)
 * 入参:name, description, tech_stack, repo_url, demo_url,
 *       version, license, tags
 */
router.post("/", authRequired, (req, res) => {
    try {
        const {
            name,
            description = "",
            tech_stack = "",
            repo_url = "",
            demo_url = "",
            version = "",
            license = "",
            tags = [],
        } = req.body;

        // 必填字段校验
        if (!name) {
            return res.status(400).json({ error: "名称必填" });
        }

        const db = getDb();
        const now = new Date().toISOString();
        const newSoftware = {
            id: db.nextSoftwareId,
            user_id: req.user.id,
            name,
            description,
            tech_stack,
            repo_url,
            demo_url,
            version,
            license,
            tags: normalizeTags(tags),
            created_at: now,
        };
        db.software.push(newSoftware);
        db.nextSoftwareId += 1;
        writeDb();
        return res.status(201).json({ software: newSoftware });
    } catch (err) {
        console.error("[software] 创建失败:", err.message);
        return res.status(500).json({ error: "服务器内部错误" });
    }
});

/**
 * PUT /api/software/:id
 * 更新软件作品(需登录,仅作者可改)
 * 入参:name, description, tech_stack, repo_url, demo_url,
 *       version, license, tags
 */
router.put("/:id", authRequired, (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            return res.status(400).json({ error: "无效的 ID" });
        }

        const db = getDb();
        const item = db.software.find((s) => s.id === id);
        if (!item) {
            return res.status(404).json({ error: "软件作品不存在" });
        }
        // 仅作者可修改
        if (item.user_id !== req.user.id) {
            return res.status(403).json({ error: "无权修改他人软件作品" });
        }

        const {
            name,
            description,
            tech_stack,
            repo_url,
            demo_url,
            version,
            license,
            tags,
        } = req.body;

        // 按提供字段更新
        if (name !== undefined) item.name = name;
        if (description !== undefined) item.description = description;
        if (tech_stack !== undefined) item.tech_stack = tech_stack;
        if (repo_url !== undefined) item.repo_url = repo_url;
        if (demo_url !== undefined) item.demo_url = demo_url;
        if (version !== undefined) item.version = version;
        if (license !== undefined) item.license = license;
        if (tags !== undefined) item.tags = normalizeTags(tags);

        writeDb();
        return res.json({ software: item });
    } catch (err) {
        console.error("[software] 更新失败:", err.message);
        return res.status(500).json({ error: "服务器内部错误" });
    }
});

/**
 * DELETE /api/software/:id
 * 删除软件作品(需登录,仅作者可删)
 */
router.delete("/:id", authRequired, (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            return res.status(400).json({ error: "无效的 ID" });
        }

        const db = getDb();
        const idx = db.software.findIndex((s) => s.id === id);
        if (idx === -1) {
            return res.status(404).json({ error: "软件作品不存在" });
        }
        // 仅作者可删除
        if (db.software[idx].user_id !== req.user.id) {
            return res.status(403).json({
                error: "无权删除他人软件作品",
            });
        }
        db.software.splice(idx, 1);
        writeDb();
        return res.json({ message: "已删除" });
    } catch (err) {
        console.error("[software] 删除失败:", err.message);
        return res.status(500).json({ error: "服务器内部错误" });
    }
});

module.exports = router;
