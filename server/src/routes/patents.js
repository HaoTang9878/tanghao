/**
 * 专利路由模块
 * 提供专利资源的 CRUD 接口,支持按 ID 访问与作者权限校验
 * 所有路由前缀:/api/patents
 *
 * 字段说明:
 * - id: 自增主键
 * - user_id: 创建者用户 ID(用于权限校验)
 * - title: 专利标题
 * - inventors: 发明人列表
 * - patent_number: 专利号
 * - patent_type: 专利类型(发明/实用新型/外观设计)
 * - filing_date: 申请日期
 * - grant_date: 授权日期
 * - status: 专利状态(已授权/审查中/已驳回等)
 * - abstract: 摘要
 * - url: 专利链接
 * - created_at: ISO 时间戳
 */
const express = require("express");
const { authRequired } = require("../middleware/auth");
const { getDb, writeDb } = require("../db");

const router = express.Router();

/**
 * GET /api/patents
 * 获取专利列表,按创建时间倒序
 */
router.get("/", (req, res) => {
    try {
        const db = getDb();
        const patents = db.patents
            .slice()
            .sort(
                (a, b) =>
                    new Date(b.created_at) - new Date(a.created_at)
            );
        return res.json({ patents });
    } catch (err) {
        console.error("[patents] 获取列表失败:", err.message);
        return res.status(500).json({ error: "服务器内部错误" });
    }
});

/**
 * GET /api/patents/:id
 * 获取单条专利详情
 */
router.get("/:id", (req, res) => {
    try {
        const id = Number(req.params.id);
        // ID 必须为有效整数
        if (!Number.isInteger(id)) {
            return res.status(400).json({ error: "无效的 ID" });
        }
        const db = getDb();
        const patent = db.patents.find((p) => p.id === id);
        if (!patent) {
            return res.status(404).json({ error: "专利不存在" });
        }
        return res.json({ patent });
    } catch (err) {
        console.error("[patents] 获取详情失败:", err.message);
        return res.status(500).json({ error: "服务器内部错误" });
    }
});

/**
 * POST /api/patents
 * 创建专利(需登录)
 * 入参:title, inventors, patent_number, patent_type,
 *       filing_date, grant_date, status, abstract, url
 */
router.post("/", authRequired, (req, res) => {
    try {
        const {
            title,
            inventors = "",
            patent_number = "",
            patent_type = "",
            filing_date = "",
            grant_date = "",
            status = "",
            abstract = "",
            url = "",
        } = req.body;

        // 必填字段校验
        if (!title) {
            return res.status(400).json({ error: "标题必填" });
        }

        const db = getDb();
        const now = new Date().toISOString();
        const newPatent = {
            id: db.nextPatentId,
            user_id: req.user.id,
            title,
            inventors,
            patent_number,
            patent_type,
            filing_date,
            grant_date,
            status,
            abstract,
            url,
            created_at: now,
        };
        db.patents.push(newPatent);
        db.nextPatentId += 1;
        writeDb();
        return res.status(201).json({ patent: newPatent });
    } catch (err) {
        console.error("[patents] 创建失败:", err.message);
        return res.status(500).json({ error: "服务器内部错误" });
    }
});

/**
 * PUT /api/patents/:id
 * 更新专利(需登录,仅作者可改)
 * 入参:title, inventors, patent_number, patent_type,
 *       filing_date, grant_date, status, abstract, url
 */
router.put("/:id", authRequired, (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            return res.status(400).json({ error: "无效的 ID" });
        }

        const db = getDb();
        const patent = db.patents.find((p) => p.id === id);
        if (!patent) {
            return res.status(404).json({ error: "专利不存在" });
        }
        // 仅作者可修改
        if (patent.user_id !== req.user.id) {
            return res.status(403).json({ error: "无权修改他人专利" });
        }

        const {
            title,
            inventors,
            patent_number,
            patent_type,
            filing_date,
            grant_date,
            status,
            abstract,
            url,
        } = req.body;

        // 按提供字段更新
        if (title !== undefined) patent.title = title;
        if (inventors !== undefined) patent.inventors = inventors;
        if (patent_number !== undefined) patent.patent_number = patent_number;
        if (patent_type !== undefined) patent.patent_type = patent_type;
        if (filing_date !== undefined) patent.filing_date = filing_date;
        if (grant_date !== undefined) patent.grant_date = grant_date;
        if (status !== undefined) patent.status = status;
        if (abstract !== undefined) patent.abstract = abstract;
        if (url !== undefined) patent.url = url;

        writeDb();
        return res.json({ patent });
    } catch (err) {
        console.error("[patents] 更新失败:", err.message);
        return res.status(500).json({ error: "服务器内部错误" });
    }
});

/**
 * DELETE /api/patents/:id
 * 删除专利(需登录,仅作者可删)
 */
router.delete("/:id", authRequired, (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            return res.status(400).json({ error: "无效的 ID" });
        }

        const db = getDb();
        const idx = db.patents.findIndex((p) => p.id === id);
        if (idx === -1) {
            return res.status(404).json({ error: "专利不存在" });
        }
        // 仅作者可删除
        if (db.patents[idx].user_id !== req.user.id) {
            return res.status(403).json({ error: "无权删除他人专利" });
        }
        db.patents.splice(idx, 1);
        writeDb();
        return res.json({ message: "已删除" });
    } catch (err) {
        console.error("[patents] 删除失败:", err.message);
        return res.status(500).json({ error: "服务器内部错误" });
    }
});

module.exports = router;
