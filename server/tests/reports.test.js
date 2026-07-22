/**
 * 报告 API 单元测试(日报 / 周报 / 月报)
 * 覆盖列表查询、按期号详情查询、404 场景
 * 使用内存模式保证测试隔离,数据通过 getDb() 直接植入
 */
const request = require("supertest");

// 在 require app 之前切换为内存模式,保证测试隔离
process.env.JWT_SECRET = "test-secret";
const { setMemoryMode, getDb } = require("../src/db");
setMemoryMode();

const app = require("../src/app");
const { closeDb } = require("../src/db");

/**
 * 日报测试数据工厂
 * @param {string} date - 日期(YYYY-MM-DD)
 * @param {number} id - 自增 ID
 * @returns {Object} 日报对象
 */
function makeDailyReport(date, id) {
    return {
        id,
        date,
        title: `日报 ${date}`,
        sections: [
            {
                title: "技术学习",
                items: [
                    {
                        title: "Express 路由设计",
                        source: "官方文档",
                        summary: "学习了 Express 路由的模块化拆分方式",
                    },
                ],
            },
        ],
        stats: {
            records: 5,
            study_time: 180,
            knowledge_points: 8,
        },
        created_at: new Date(`${date}T10:00:00.000Z`).toISOString(),
    };
}

/**
 * 周报测试数据工厂
 * @param {string} week - 周号(YYYY-WNN)
 * @param {number} id - 自增 ID
 * @returns {Object} 周报对象
 */
function makeWeeklyReport(week, id) {
    return {
        id,
        week,
        title: `周报 ${week}`,
        lead: "本周聚焦后端架构优化与量化策略回测",
        sections: [
            {
                title: "技术突破",
                items: [
                    {
                        title: "Express 中间件链",
                        source: "实践",
                        summary: "理解了 next() 的传递机制",
                    },
                ],
            },
        ],
        stats: {
            events: 20,
            selected: 6,
            daily_count: 35,
            read_time: 12,
        },
        created_at: new Date().toISOString(),
    };
}

/**
 * 月报测试数据工厂
 * @param {string} month - 月份(YYYY-MM)
 * @param {number} id - 自增 ID
 * @returns {Object} 月报对象
 */
function makeMonthlyReport(month, id) {
    return {
        id,
        month,
        title: `月报 ${month}`,
        lead: "本月完成个人博客上线,OpenAlpha 架构定型",
        sections: [
            {
                title: "月度总结",
                items: [
                    {
                        title: "博客系统上线",
                        source: "项目",
                        summary: "基于 docsify + Express 完成个人作品集",
                    },
                ],
            },
        ],
        stats: {
            events: 80,
            selected: 24,
            daily_count: 150,
            read_time: 48,
        },
        created_at: new Date().toISOString(),
    };
}

beforeAll(() => {
    // 直接通过 getDb() 植入测试数据
    const db = getDb();

    // 植入 3 份日报
    db.daily_reports.push(makeDailyReport("2026-07-20", 1));
    db.daily_reports.push(makeDailyReport("2026-07-21", 2));
    db.daily_reports.push(makeDailyReport("2026-07-22", 3));

    // 植入 2 份周报
    db.weekly_reports.push(makeWeeklyReport("2026-W29", 1));
    db.weekly_reports.push(makeWeeklyReport("2026-W30", 2));

    // 植入 2 份月报
    db.monthly_reports.push(makeMonthlyReport("2026-06", 1));
    db.monthly_reports.push(makeMonthlyReport("2026-07", 2));
});

afterAll(() => {
    closeDb();
});

/* ===================== 日报测试 ===================== */

describe("日报列表 GET /api/reports/daily", () => {
    test("返回 200 并包含所有日报摘要", async () => {
        const res = await request(app).get("/api/reports/daily");
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.daily_reports)).toBe(true);
        expect(res.body.daily_reports).toHaveLength(3);
    });

    test("列表按日期倒序排列", async () => {
        const res = await request(app).get("/api/reports/daily");
        expect(res.status).toBe(200);
        const dates = res.body.daily_reports.map((r) => r.date);
        expect(dates[0]).toBe("2026-07-22");
        expect(dates[2]).toBe("2026-07-20");
    });

    test("列表项不含完整 sections", async () => {
        const res = await request(app).get("/api/reports/daily");
        expect(res.status).toBe(200);
        res.body.daily_reports.forEach((r) => {
            expect(r).not.toHaveProperty("sections");
        });
    });

    test("支持 ?date= 查询指定日期", async () => {
        const res = await request(app).get("/api/reports/daily?date=2026-07-21");
        expect(res.status).toBe(200);
        expect(res.body.daily_reports).toHaveLength(1);
        expect(res.body.daily_reports[0].date).toBe("2026-07-21");
    });

    test("查询不存在的日期返回空列表", async () => {
        const res = await request(app).get("/api/reports/daily?date=2099-01-01");
        expect(res.status).toBe(200);
        expect(res.body.daily_reports).toHaveLength(0);
    });
});

describe("日报详情 GET /api/reports/daily/:date", () => {
    test("存在的日期返回 200 及完整 sections", async () => {
        const res = await request(app).get("/api/reports/daily/2026-07-22");
        expect(res.status).toBe(200);
        expect(res.body.daily_report.date).toBe("2026-07-22");
        expect(res.body.daily_report.title).toBe("日报 2026-07-22");
        expect(Array.isArray(res.body.daily_report.sections)).toBe(true);
        expect(res.body.daily_report.sections).toHaveLength(1);
    });

    test("详情包含 stats 字段", async () => {
        const res = await request(app).get("/api/reports/daily/2026-07-22");
        expect(res.status).toBe(200);
        expect(res.body.daily_report.stats.records).toBe(5);
        expect(res.body.daily_report.stats.study_time).toBe(180);
        expect(res.body.daily_report.stats.knowledge_points).toBe(8);
    });

    test("不存在的日期返回 404", async () => {
        const res = await request(app).get("/api/reports/daily/2099-12-31");
        expect(res.status).toBe(404);
        expect(res.body.error).toBe("日报不存在");
    });
});

/* ===================== 周报测试 ===================== */

describe("周报列表 GET /api/reports/weekly", () => {
    test("返回 200 并包含所有周报摘要", async () => {
        const res = await request(app).get("/api/reports/weekly");
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.weekly_reports)).toBe(true);
        expect(res.body.weekly_reports).toHaveLength(2);
    });

    test("列表按周号倒序排列", async () => {
        const res = await request(app).get("/api/reports/weekly");
        expect(res.status).toBe(200);
        const weeks = res.body.weekly_reports.map((r) => r.week);
        expect(weeks[0]).toBe("2026-W30");
        expect(weeks[1]).toBe("2026-W29");
    });

    test("列表项包含 lead 字段但不含 sections", async () => {
        const res = await request(app).get("/api/reports/weekly");
        expect(res.status).toBe(200);
        res.body.weekly_reports.forEach((r) => {
            expect(r).toHaveProperty("lead");
            expect(r).not.toHaveProperty("sections");
        });
    });

    test("支持 ?week= 查询指定周报", async () => {
        const res = await request(app).get("/api/reports/weekly?week=2026-W29");
        expect(res.status).toBe(200);
        expect(res.body.weekly_reports).toHaveLength(1);
        expect(res.body.weekly_reports[0].week).toBe("2026-W29");
    });
});

describe("周报详情 GET /api/reports/weekly/:week", () => {
    test("存在的周号返回 200 及完整 sections", async () => {
        const res = await request(app).get("/api/reports/weekly/2026-W30");
        expect(res.status).toBe(200);
        expect(res.body.weekly_report.week).toBe("2026-W30");
        expect(res.body.weekly_report.lead).toBeDefined();
        expect(Array.isArray(res.body.weekly_report.sections)).toBe(true);
    });

    test("详情包含 stats 字段", async () => {
        const res = await request(app).get("/api/reports/weekly/2026-W30");
        expect(res.status).toBe(200);
        expect(res.body.weekly_report.stats.events).toBe(20);
        expect(res.body.weekly_report.stats.selected).toBe(6);
        expect(res.body.weekly_report.stats.daily_count).toBe(35);
        expect(res.body.weekly_report.stats.read_time).toBe(12);
    });

    test("不存在的周号返回 404", async () => {
        const res = await request(app).get("/api/reports/weekly/2099-W01");
        expect(res.status).toBe(404);
        expect(res.body.error).toBe("周报不存在");
    });
});

/* ===================== 月报测试 ===================== */

describe("月报列表 GET /api/reports/monthly", () => {
    test("返回 200 并包含所有月报摘要", async () => {
        const res = await request(app).get("/api/reports/monthly");
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.monthly_reports)).toBe(true);
        expect(res.body.monthly_reports).toHaveLength(2);
    });

    test("列表按月份倒序排列", async () => {
        const res = await request(app).get("/api/reports/monthly");
        expect(res.status).toBe(200);
        const months = res.body.monthly_reports.map((r) => r.month);
        expect(months[0]).toBe("2026-07");
        expect(months[1]).toBe("2026-06");
    });

    test("列表项包含 lead 字段但不含 sections", async () => {
        const res = await request(app).get("/api/reports/monthly");
        expect(res.status).toBe(200);
        res.body.monthly_reports.forEach((r) => {
            expect(r).toHaveProperty("lead");
            expect(r).not.toHaveProperty("sections");
        });
    });

    test("支持 ?month= 查询指定月报", async () => {
        const res = await request(app).get("/api/reports/monthly?month=2026-06");
        expect(res.status).toBe(200);
        expect(res.body.monthly_reports).toHaveLength(1);
        expect(res.body.monthly_reports[0].month).toBe("2026-06");
    });
});

describe("月报详情 GET /api/reports/monthly/:month", () => {
    test("存在的月份返回 200 及完整 sections", async () => {
        const res = await request(app).get("/api/reports/monthly/2026-07");
        expect(res.status).toBe(200);
        expect(res.body.monthly_report.month).toBe("2026-07");
        expect(res.body.monthly_report.lead).toBeDefined();
        expect(Array.isArray(res.body.monthly_report.sections)).toBe(true);
    });

    test("详情包含 stats 字段", async () => {
        const res = await request(app).get("/api/reports/monthly/2026-07");
        expect(res.status).toBe(200);
        expect(res.body.monthly_report.stats.events).toBe(80);
        expect(res.body.monthly_report.stats.selected).toBe(24);
        expect(res.body.monthly_report.stats.daily_count).toBe(150);
        expect(res.body.monthly_report.stats.read_time).toBe(48);
    });

    test("不存在的月份返回 404", async () => {
        const res = await request(app).get("/api/reports/monthly/2099-12");
        expect(res.status).toBe(404);
        expect(res.body.error).toBe("月报不存在");
    });
});
