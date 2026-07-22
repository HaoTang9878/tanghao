/**
 * 论文 API 单元测试
 * 覆盖列表、详情、创建、更新、删除等场景
 * 包含鉴权场景(未登录、他人论文等)、标签筛选、搜索与统计
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
let paperId;

beforeAll(async () => {
    // 注册并登录两个测试用户,用于验证权限
    await request(app)
        .post("/api/auth/register")
        .send({
            username: "paper_author",
            email: "paper_author@test.com",
            password: "pass123456",
        });
    const res = await request(app)
        .post("/api/auth/login")
        .send({
            username: "paper_author",
            password: "pass123456",
        });
    token = res.body.token;

    await request(app)
        .post("/api/auth/register")
        .send({
            username: "paper_visitor",
            email: "paper_visitor@test.com",
            password: "pass123456",
        });
    const res2 = await request(app)
        .post("/api/auth/login")
        .send({
            username: "paper_visitor",
            password: "pass123456",
        });
    otherToken = res2.body.token;
});

afterAll(() => {
    closeDb();
});

describe("论文列表 GET /api/papers", () => {
    test("空列表返回 200", async () => {
        const res = await request(app).get("/api/papers");
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.papers)).toBe(true);
        expect(res.body.papers.length).toBe(0);
    });

    test("创建后列表包含论文", async () => {
        // 先创建一篇论文
        const createRes = await request(app)
            .post("/api/papers")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "深度学习在图像识别中的应用",
                authors: "张三, 李四",
                abstract: "本文研究深度学习在图像识别领域的应用",
                journal: "计算机学报",
                year: 2023,
                doi: "10.1234/test",
                url: "http://example.com/paper1",
                tags: ["AI", "深度学习"],
            });
        paperId = createRes.body.paper.id;

        const res = await request(app).get("/api/papers");
        expect(res.status).toBe(200);
        expect(res.body.papers.length).toBe(1);
        expect(res.body.papers[0].title).toBe(
            "深度学习在图像识别中的应用"
        );
    });

    test("支持 ?tag= 筛选", async () => {
        // 创建另一篇带不同标签的论文
        await request(app)
            .post("/api/papers")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "区块链技术研究",
                tags: ["区块链"],
            });

        // 筛选 AI 标签
        const res1 = await request(app).get("/api/papers?tag=AI");
        expect(res1.status).toBe(200);
        expect(res1.body.papers.length).toBe(1);
        expect(res1.body.papers[0].tags).toContain("AI");

        // 筛选区块链标签
        const res2 = await request(app).get(
            "/api/papers?tag=区块链"
        );
        expect(res2.status).toBe(200);
        expect(res2.body.papers.length).toBe(1);
        expect(res2.body.papers[0].title).toBe("区块链技术研究");
    });

    test("列表按创建时间倒序", async () => {
        const res = await request(app).get("/api/papers");
        expect(res.status).toBe(200);
        const papers = res.body.papers;
        for (let i = 1; i < papers.length; i += 1) {
            const prev = new Date(papers[i - 1].created_at).getTime();
            const curr = new Date(papers[i].created_at).getTime();
            expect(prev).toBeGreaterThanOrEqual(curr);
        }
    });
});

describe("创建论文 POST /api/papers", () => {
    test("未登录返回 401", async () => {
        const res = await request(app)
            .post("/api/papers")
            .send({ title: "未登录论文" });
        expect(res.status).toBe(401);
    });

    test("缺少 title 返回 400", async () => {
        const res = await request(app)
            .post("/api/papers")
            .set("Authorization", `Bearer ${token}`)
            .send({ authors: "无名氏" });
        expect(res.status).toBe(400);
    });

    test("登录后成功创建返回 201", async () => {
        const res = await request(app)
            .post("/api/papers")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "区块链共识算法综述",
                authors: "王五",
                abstract: "本文综述了主流区块链共识算法",
                journal: "软件学报",
                year: 2024,
                doi: "10.5678/blockchain",
                url: "http://example.com/paper2",
                tags: ["区块链", "共识算法"],
            });
        expect(res.status).toBe(201);
        expect(res.body.paper.title).toBe("区块链共识算法综述");
        expect(res.body.paper.user_id).toBeDefined();
        expect(res.body.paper.created_at).toBeDefined();
    });

    test("tags 字段被规范为字符串数组", async () => {
        const res = await request(app)
            .post("/api/papers")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "非数组 tags 测试",
                tags: "不是数组",
            });
        expect(res.status).toBe(201);
        expect(Array.isArray(res.body.paper.tags)).toBe(true);
        expect(res.body.paper.tags).toEqual([]);
    });

    test("tags 数组中非字符串元素被过滤", async () => {
        const res = await request(app)
            .post("/api/papers")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "混合类型 tags 测试",
                tags: ["有效标签", 123, null, "另一个有效标签"],
            });
        expect(res.status).toBe(201);
        expect(res.body.paper.tags).toEqual([
            "有效标签",
            "另一个有效标签",
        ]);
    });

    test("未提供 tags 时默认为空数组", async () => {
        const res = await request(app)
            .post("/api/papers")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "无标签论文" });
        expect(res.status).toBe(201);
        expect(res.body.paper.tags).toEqual([]);
    });
});

describe("论文详情 GET /api/papers/:id", () => {
    test("存在的 id 返回 200", async () => {
        const res = await request(app).get(`/api/papers/${paperId}`);
        expect(res.status).toBe(200);
        expect(res.body.paper.id).toBe(paperId);
        expect(res.body.paper.title).toBe(
            "深度学习在图像识别中的应用"
        );
    });

    test("不存在的 id 返回 404", async () => {
        const res = await request(app).get("/api/papers/99999");
        expect(res.status).toBe(404);
    });

    test("无效 id 返回 400", async () => {
        const res = await request(app).get("/api/papers/abc");
        expect(res.status).toBe(400);
    });
});

describe("更新论文 PUT /api/papers/:id", () => {
    test("未登录返回 401", async () => {
        const res = await request(app)
            .put(`/api/papers/${paperId}`)
            .send({ title: "新标题" });
        expect(res.status).toBe(401);
    });

    test("非作者更新返回 403", async () => {
        const res = await request(app)
            .put(`/api/papers/${paperId}`)
            .set("Authorization", `Bearer ${otherToken}`)
            .send({ title: "被篡改" });
        expect(res.status).toBe(403);
    });

    test("作者成功更新返回 200", async () => {
        const res = await request(app)
            .put(`/api/papers/${paperId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "更新后的论文标题",
                authors: "新作者",
                abstract: "新摘要",
                journal: "新期刊",
                year: 2025,
                doi: "10.1234/new",
                url: "http://new.example.com",
                tags: ["AI", "更新标签"],
            });
        expect(res.status).toBe(200);
        expect(res.body.paper.title).toBe("更新后的论文标题");
        expect(res.body.paper.authors).toBe("新作者");
        expect(res.body.paper.year).toBe(2025);
        expect(res.body.paper.tags).toContain("更新标签");
    });

    test("作者仅更新部分字段返回 200", async () => {
        const res = await request(app)
            .put(`/api/papers/${paperId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "仅标题更新" });
        expect(res.status).toBe(200);
        expect(res.body.paper.title).toBe("仅标题更新");
        // 其他字段保持不变
        expect(res.body.paper.authors).toBe("新作者");
    });

    test("更新不存在的论文返回 404", async () => {
        const res = await request(app)
            .put("/api/papers/99999")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "x" });
        expect(res.status).toBe(404);
    });

    test("无效 id 更新返回 400", async () => {
        const res = await request(app)
            .put("/api/papers/abc")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "x" });
        expect(res.status).toBe(400);
    });
});

describe("删除论文 DELETE /api/papers/:id", () => {
    test("非作者删除返回 403", async () => {
        const res = await request(app)
            .delete(`/api/papers/${paperId}`)
            .set("Authorization", `Bearer ${otherToken}`);
        expect(res.status).toBe(403);
    });

    test("作者成功删除返回 200", async () => {
        const res = await request(app)
            .delete(`/api/papers/${paperId}`)
            .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
    });

    test("删除后再次获取返回 404", async () => {
        const res = await request(app).get(
            `/api/papers/${paperId}`
        );
        expect(res.status).toBe(404);
    });

    test("删除不存在的论文返回 404", async () => {
        const res = await request(app)
            .delete("/api/papers/99999")
            .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(404);
    });

    test("无效 id 删除返回 400", async () => {
        const res = await request(app)
            .delete("/api/papers/abc")
            .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(400);
    });

    test("未登录删除返回 401", async () => {
        // 先创建一个用于测试的论文
        const createRes = await request(app)
            .post("/api/papers")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "待删除论文" });
        const deleteId = createRes.body.paper.id;

        const res = await request(app).delete(
            `/api/papers/${deleteId}`
        );
        expect(res.status).toBe(401);
    });
});

describe("搜索与统计集成", () => {
    test("搜索能匹配论文标题", async () => {
        // 创建一篇包含特定关键词的论文
        await request(app)
            .post("/api/papers")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "量子计算搜索关键词论文",
                abstract: "量子计算前沿研究",
            });

        const res = await request(app).get(
            "/api/search?q=量子计算"
        );
        expect(res.status).toBe(200);
        expect(res.body.papers.length).toBeGreaterThan(0);
        expect(res.body.papers[0].type).toBe("paper");
    });

    test("统计包含论文计数", async () => {
        const res = await request(app).get("/api/stats");
        expect(res.status).toBe(200);
        expect(res.body.counts).toHaveProperty("papers");
        expect(typeof res.body.counts.papers).toBe("number");
        expect(res.body.counts.papers).toBeGreaterThan(0);
        expect(res.body.recent).toHaveProperty("papers");
    });
});

describe("错误处理", () => {
    test("列表数据库异常返回 500", async () => {
        const db = getDb();
        const original = db.papers;
        db.papers = null;
        const res = await request(app).get("/api/papers");
        expect(res.status).toBe(500);
        db.papers = original;
    });

    test("详情数据库异常返回 500", async () => {
        const db = getDb();
        const original = db.papers;
        db.papers = null;
        const res = await request(app).get("/api/papers/1");
        expect(res.status).toBe(500);
        db.papers = original;
    });

    test("创建数据库异常返回 500", async () => {
        const db = getDb();
        const original = db.papers;
        db.papers = null;
        const res = await request(app)
            .post("/api/papers")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "错误测试" });
        expect(res.status).toBe(500);
        db.papers = original;
    });

    test("更新数据库异常返回 500", async () => {
        const db = getDb();
        const original = db.papers;
        db.papers = null;
        const res = await request(app)
            .put("/api/papers/1")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "错误测试" });
        expect(res.status).toBe(500);
        db.papers = original;
    });

    test("删除数据库异常返回 500", async () => {
        const db = getDb();
        const original = db.papers;
        db.papers = null;
        const res = await request(app)
            .delete("/api/papers/1")
            .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(500);
        db.papers = original;
    });
});
