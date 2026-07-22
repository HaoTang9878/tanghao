/**
 * 专利 API 单元测试
 * 覆盖列表、详情、创建、更新、删除等场景
 * 包含鉴权场景(未登录、他人专利等)、搜索与统计
 */
const request = require("supertest");

// 在 require app 之前切换为内存模式,保证测试隔离
process.env.JWT_SECRET = "test-secret";
const { setMemoryMode, getDb } = require("../src/db");
setMemoryMode();

const app = require("../src/app");
const { closeDb } = require("../src/db");

let token;
let otherToken;
let patentId;

beforeAll(async () => {
    // 注册并登录两个测试用户,用于验证权限
    await request(app)
        .post("/api/auth/register")
        .send({
            username: "patent_inventor",
            email: "patent_inventor@test.com",
            password: "pass123456",
        });
    const res = await request(app)
        .post("/api/auth/login")
        .send({
            username: "patent_inventor",
            password: "pass123456",
        });
    token = res.body.token;

    await request(app)
        .post("/api/auth/register")
        .send({
            username: "patent_visitor",
            email: "patent_visitor@test.com",
            password: "pass123456",
        });
    const res2 = await request(app)
        .post("/api/auth/login")
        .send({
            username: "patent_visitor",
            password: "pass123456",
        });
    otherToken = res2.body.token;
});

afterAll(() => {
    closeDb();
});

describe("专利列表 GET /api/patents", () => {
    test("空列表返回 200", async () => {
        const res = await request(app).get("/api/patents");
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.patents)).toBe(true);
        expect(res.body.patents.length).toBe(0);
    });

    test("创建后列表包含专利", async () => {
        const createRes = await request(app)
            .post("/api/patents")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "一种基于深度学习的图像识别方法",
                inventors: "张三, 李四",
                patent_number: "CN202310001234.5",
                patent_type: "发明专利",
                filing_date: "2023-01-15",
                grant_date: "2024-06-20",
                status: "已授权",
                abstract: "本发明涉及图像识别技术领域",
                url: "http://example.com/patent1",
            });
        patentId = createRes.body.patent.id;

        const res = await request(app).get("/api/patents");
        expect(res.status).toBe(200);
        expect(res.body.patents.length).toBe(1);
        expect(res.body.patents[0].title).toBe(
            "一种基于深度学习的图像识别方法"
        );
    });

    test("列表按创建时间倒序", async () => {
        // 再创建一条专利
        await request(app)
            .post("/api/patents")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "一种区块链数据存储装置",
                patent_number: "CN202310005678.9",
            });

        const res = await request(app).get("/api/patents");
        expect(res.status).toBe(200);
        const patents = res.body.patents;
        expect(patents.length).toBe(2);
        for (let i = 1; i < patents.length; i += 1) {
            const prev = new Date(
                patents[i - 1].created_at
            ).getTime();
            const curr = new Date(
                patents[i].created_at
            ).getTime();
            expect(prev).toBeGreaterThanOrEqual(curr);
        }
    });
});

describe("创建专利 POST /api/patents", () => {
    test("未登录返回 401", async () => {
        const res = await request(app)
            .post("/api/patents")
            .send({ title: "未登录专利" });
        expect(res.status).toBe(401);
    });

    test("缺少 title 返回 400", async () => {
        const res = await request(app)
            .post("/api/patents")
            .set("Authorization", `Bearer ${token}`)
            .send({ inventors: "无名氏" });
        expect(res.status).toBe(400);
    });

    test("登录后成功创建返回 201", async () => {
        const res = await request(app)
            .post("/api/patents")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "一种新型散热结构",
                inventors: "王五",
                patent_number: "CN202410001111.2",
                patent_type: "实用新型",
                filing_date: "2024-03-01",
                grant_date: "",
                status: "审查中",
                abstract: "本实用新型涉及散热技术",
                url: "http://example.com/patent2",
            });
        expect(res.status).toBe(201);
        expect(res.body.patent.title).toBe("一种新型散热结构");
        expect(res.body.patent.user_id).toBeDefined();
        expect(res.body.patent.created_at).toBeDefined();
        expect(res.body.patent.patent_type).toBe("实用新型");
    });

    test("可选字段缺省时使用默认值", async () => {
        const res = await request(app)
            .post("/api/patents")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "最简专利" });
        expect(res.status).toBe(201);
        expect(res.body.patent.inventors).toBe("");
        expect(res.body.patent.patent_number).toBe("");
        expect(res.body.patent.status).toBe("");
    });
});

describe("专利详情 GET /api/patents/:id", () => {
    test("存在的 id 返回 200", async () => {
        const res = await request(app).get(
            `/api/patents/${patentId}`
        );
        expect(res.status).toBe(200);
        expect(res.body.patent.id).toBe(patentId);
        expect(res.body.patent.title).toBe(
            "一种基于深度学习的图像识别方法"
        );
        expect(res.body.patent.patent_number).toBe(
            "CN202310001234.5"
        );
    });

    test("不存在的 id 返回 404", async () => {
        const res = await request(app).get("/api/patents/99999");
        expect(res.status).toBe(404);
    });

    test("无效 id 返回 400", async () => {
        const res = await request(app).get("/api/patents/abc");
        expect(res.status).toBe(400);
    });
});

describe("更新专利 PUT /api/patents/:id", () => {
    test("未登录返回 401", async () => {
        const res = await request(app)
            .put(`/api/patents/${patentId}`)
            .send({ title: "新标题" });
        expect(res.status).toBe(401);
    });

    test("非作者更新返回 403", async () => {
        const res = await request(app)
            .put(`/api/patents/${patentId}`)
            .set("Authorization", `Bearer ${otherToken}`)
            .send({ title: "被篡改" });
        expect(res.status).toBe(403);
    });

    test("作者成功更新返回 200", async () => {
        const res = await request(app)
            .put(`/api/patents/${patentId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "更新后的专利标题",
                inventors: "新发明人",
                patent_number: "CN202310001999.9",
                patent_type: "外观设计",
                filing_date: "2023-02-01",
                grant_date: "2024-07-01",
                status: "已驳回",
                abstract: "更新后的摘要",
                url: "http://new.example.com/patent",
            });
        expect(res.status).toBe(200);
        expect(res.body.patent.title).toBe("更新后的专利标题");
        expect(res.body.patent.inventors).toBe("新发明人");
        expect(res.body.patent.status).toBe("已驳回");
        expect(res.body.patent.grant_date).toBe("2024-07-01");
    });

    test("作者仅更新部分字段返回 200", async () => {
        const res = await request(app)
            .put(`/api/patents/${patentId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "仅标题更新" });
        expect(res.status).toBe(200);
        expect(res.body.patent.title).toBe("仅标题更新");
        expect(res.body.patent.inventors).toBe("新发明人");
    });

    test("更新不存在的专利返回 404", async () => {
        const res = await request(app)
            .put("/api/patents/99999")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "x" });
        expect(res.status).toBe(404);
    });

    test("无效 id 更新返回 400", async () => {
        const res = await request(app)
            .put("/api/patents/abc")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "x" });
        expect(res.status).toBe(400);
    });
});

describe("删除专利 DELETE /api/patents/:id", () => {
    test("非作者删除返回 403", async () => {
        const res = await request(app)
            .delete(`/api/patents/${patentId}`)
            .set("Authorization", `Bearer ${otherToken}`);
        expect(res.status).toBe(403);
    });

    test("作者成功删除返回 200", async () => {
        const res = await request(app)
            .delete(`/api/patents/${patentId}`)
            .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
    });

    test("删除后再次获取返回 404", async () => {
        const res = await request(app).get(
            `/api/patents/${patentId}`
        );
        expect(res.status).toBe(404);
    });

    test("删除不存在的专利返回 404", async () => {
        const res = await request(app)
            .delete("/api/patents/99999")
            .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(404);
    });

    test("未登录删除返回 401", async () => {
        // 先创建一个用于测试的专利
        const createRes = await request(app)
            .post("/api/patents")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "待删除专利" });
        const deleteId = createRes.body.patent.id;

        const res = await request(app).delete(
            `/api/patents/${deleteId}`
        );
        expect(res.status).toBe(401);
    });
});

describe("搜索与统计集成", () => {
    test("搜索能匹配专利标题", async () => {
        // 创建一条包含特定关键词的专利
        await request(app)
            .post("/api/patents")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "量子通信搜索关键词专利",
                abstract: "量子通信加密技术",
            });

        const res = await request(app).get(
            "/api/search?q=量子通信"
        );
        expect(res.status).toBe(200);
        expect(res.body.patents.length).toBeGreaterThan(0);
        expect(res.body.patents[0].type).toBe("patent");
    });

    test("统计包含专利计数", async () => {
        const res = await request(app).get("/api/stats");
        expect(res.status).toBe(200);
        expect(res.body.counts).toHaveProperty("patents");
        expect(typeof res.body.counts.patents).toBe("number");
        expect(res.body.counts.patents).toBeGreaterThan(0);
        expect(res.body.recent).toHaveProperty("patents");
    });
});

describe("错误处理", () => {
    test("列表数据库异常返回 500", async () => {
        const db = getDb();
        const original = db.patents;
        db.patents = null;
        const res = await request(app).get("/api/patents");
        expect(res.status).toBe(500);
        db.patents = original;
    });

    test("详情数据库异常返回 500", async () => {
        const db = getDb();
        const original = db.patents;
        db.patents = null;
        const res = await request(app).get("/api/patents/1");
        expect(res.status).toBe(500);
        db.patents = original;
    });

    test("创建数据库异常返回 500", async () => {
        const db = getDb();
        const original = db.patents;
        db.patents = null;
        const res = await request(app)
            .post("/api/patents")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "错误测试" });
        expect(res.status).toBe(500);
        db.patents = original;
    });

    test("更新数据库异常返回 500", async () => {
        const db = getDb();
        const original = db.patents;
        db.patents = null;
        const res = await request(app)
            .put("/api/patents/1")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "错误测试" });
        expect(res.status).toBe(500);
        db.patents = original;
    });

    test("删除数据库异常返回 500", async () => {
        const db = getDb();
        const original = db.patents;
        db.patents = null;
        const res = await request(app)
            .delete("/api/patents/1")
            .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(500);
        db.patents = original;
    });
});
