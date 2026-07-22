/**
 * 报告路由模块(日报 / 周报 / 月报)
 * 提供刊物式报告的查询接口,支持列表与按期号详情访问
 * 所有路由前缀:/api/reports
 *
 * 字段说明:
 * - daily_reports: { id, date(YYYY-MM-DD), title,
 *     sections:[{ title, items:[{ title, source, summary }] }],
 *     stats:{ records, study_time, knowledge_points }, created_at }
 * - weekly_reports: { id, week(YYYY-WNN), title, lead,
 *     stats:{ events, selected, daily_count, read_time },
 *     sections, created_at }
 * - monthly_reports: { id, month(YYYY-MM), title, lead,
 *     stats, sections, created_at }
 */
const express = require("express");
const { getDb } = require("../db");

const router = express.Router();

/**
 * 规范化 sections 结构
 * 确保每条报告的 sections 字段为数组,避免旧数据或缺字段导致后续逻辑报错
 * @param {Object} report - 报告对象
 */
function normalizeSections(report) {
    if (!Array.isArray(report.sections)) {
        report.sections = [];
    }
}

/**
 * 规范化 stats 结构
 * 确保 stats 字段存在且为对象,缺字段时补 0
 * @param {Object} report - 报告对象
 * @param {string[]} keys - 需要保证存在的 stats 键名
 */
function normalizeStats(report, keys) {
    if (typeof report.stats !== "object" || report.stats === null) {
        report.stats = {};
    }
    keys.forEach((k) => {
        if (typeof report.stats[k] !== "number") {
            report.stats[k] = 0;
        }
    });
}

/* ===================== 日报 ===================== */

/**
 * GET /api/reports/daily
 * 获取日报列表,支持 ?date=2026-07-22 查询指定日期日报
 */
router.get("/daily", (req, res) => {
    const db = getDb();
    let reports = (db.daily_reports || []).slice();
    // 按日期参数过滤(若提供)
    if (req.query.date) {
        reports = reports.filter((r) => r.date === req.query.date);
    }
    // 按日期倒序排列
    reports.sort((a, b) => new Date(b.date) - new Date(a.date));
    // 列表仅返回摘要,不含完整 sections
    const summaries = reports.map((r) => ({
        id: r.id,
        date: r.date,
        title: r.title,
        stats: r.stats,
        created_at: r.created_at,
    }));
    return res.json({ daily_reports: summaries });
});

/**
 * GET /api/reports/daily/:date
 * 获取指定日期日报详情(含完整 sections)
 */
router.get("/daily/:date", (req, res) => {
    const db = getDb();
    const report = (db.daily_reports || []).find(
        (r) => r.date === req.params.date
    );
    if (!report) {
        return res.status(404).json({ error: "日报不存在" });
    }
    normalizeSections(report);
    normalizeStats(report, ["records", "study_time", "knowledge_points"]);
    return res.json({ daily_report: report });
});

/* ===================== 周报 ===================== */

/**
 * GET /api/reports/weekly
 * 获取周报列表,支持 ?week=2026-W30 查询指定周报
 */
router.get("/weekly", (req, res) => {
    const db = getDb();
    let reports = (db.weekly_reports || []).slice();
    if (req.query.week) {
        reports = reports.filter((r) => r.week === req.query.week);
    }
    reports.sort((a, b) => (b.week > a.week ? 1 : -1));
    const summaries = reports.map((r) => ({
        id: r.id,
        week: r.week,
        title: r.title,
        lead: r.lead,
        stats: r.stats,
        created_at: r.created_at,
    }));
    return res.json({ weekly_reports: summaries });
});

/**
 * GET /api/reports/weekly/:week
 * 获取指定周报详情(含完整 sections)
 */
router.get("/weekly/:week", (req, res) => {
    const db = getDb();
    const report = (db.weekly_reports || []).find(
        (r) => r.week === req.params.week
    );
    if (!report) {
        return res.status(404).json({ error: "周报不存在" });
    }
    normalizeSections(report);
    normalizeStats(report, ["events", "selected", "daily_count", "read_time"]);
    return res.json({ weekly_report: report });
});

/* ===================== 月报 ===================== */

/**
 * GET /api/reports/monthly
 * 获取月报列表,支持 ?month=2026-07 查询指定月报
 */
router.get("/monthly", (req, res) => {
    const db = getDb();
    let reports = (db.monthly_reports || []).slice();
    if (req.query.month) {
        reports = reports.filter((r) => r.month === req.query.month);
    }
    reports.sort((a, b) => (b.month > a.month ? 1 : -1));
    const summaries = reports.map((r) => ({
        id: r.id,
        month: r.month,
        title: r.title,
        lead: r.lead,
        stats: r.stats,
        created_at: r.created_at,
    }));
    return res.json({ monthly_reports: summaries });
});

/**
 * GET /api/reports/monthly/:month
 * 获取指定月报详情(含完整 sections)
 */
router.get("/monthly/:month", (req, res) => {
    const db = getDb();
    const report = (db.monthly_reports || []).find(
        (r) => r.month === req.params.month
    );
    if (!report) {
        return res.status(404).json({ error: "月报不存在" });
    }
    normalizeSections(report);
    normalizeStats(report, ["events", "selected", "daily_count", "read_time"]);
    return res.json({ monthly_report: report });
});

module.exports = router;
