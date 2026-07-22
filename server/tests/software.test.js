/**
 * 软件作品 API 单元测试
 * 覆盖列表、详情、创建、更新、删除等场景
 * 包含鉴权场景(未登录、他人作品等)、标签筛选、搜索与统计
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
let softwareId;

beforeAll(async () => {
    // 注册并登录两个测试用户,用于验证权限
    await request(app)
        .post("/api/auth/register")
        .send({
            username: "sw_developer",
            email: "sw_developer@test.com",
            password: "pass123456",
        });
    const res = await request(app)
        .post("/api/auth/login")
        .send({
            username: "sw_developer",
            password: "pass123456",
        });
    token = res.body.token;

    await request(app)
        .post("/api/auth/register")
        .send({
            username: "sw_visitor",
            email: "sw_visitor@test.com",
            password: "pass123456",
        });
    const res2 = await request(app)
        .post("/api/auth/login")
        .send({
            username: "sw_visitor",
            password: "pass123456",
        });
    otherToken = res2.body.token;
});

afterAll(() => {
    closeDb();
});

describe("软件作品列表 GET /api/software", () => {
    test("空列表返回 200", async () => {
        const res = await request(app).get("/api/software");
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.software)).toBe(true);
        expect(res.body.software.length).toBe(0);
    });

    test("创建后列表包含软件作品", async () => {
        const createRes = await request(app)
            .post("/api/software")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "任务管理系统",
                description: "基于 Web 的团队任务管理工具",
                tech_stack: "React, Node.js, PostgreSQL",
                repo_url: "http://github.com/example/task-manager",
                demo_url: "http://demo.example.com",
                version: "1.0.0",
                license: "MIT",
                tags: ["Web", "效率工具"],
            });
        softwareId = createRes.body.software.id;

        const res = await request(app).get("/api/software");
        expect(res.status).toBe(200);
        expect(res.body.software.length).toBe(1);
        expect(res.body.software[0].name).toBe("任务管理系统");
    });

    test("支持 ?tag= 筛选", async () => {
        // 创建另一个带不同标签的软件作品
        await request(app)
            .post("/api/software")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "命令行工具集",
                tags: ["CLI", "效率工具"],
            });

        // 筛选 CLI 标签
        const res1 = await request(app).get(
            "/api/software?tag=CLI"
        );
        expect(res1.status).toBe(200);
        expect(res1.body.software.length).toBe(1);
        expect(res1.body.software[0].name).toBe("命令行工具集");

        // 筛选效率工具标签(两条都包含)
        const res2 = await request(app).get(
            "/api/software?tag=效率工具"
        );
        expect(res2.status).toBe(200);
        expect(res2.body.software.length).toBe(2);
    });

    test("列表按创建时间倒序", async () => {
        const res = await request(app).get("/api/software");
        expect(res.status).toBe(200);
        const items = res.body.software;
        for (let i = 1; i < items.length; i += 1) {
            const prev = new Date(
                items[i - 1].created_at
            ).getTime();
            const curr = new Date(
                items[i].created_at
            ).getTime();
            expect(prev).toBeGreaterThanOrEqual(curr);
        }
    });
});

describe("创建软件作品 POST /api/software", () => {
    test("未登录返回 401", async () => {
        const res = await request(app)
            .post("/api/software")
            .send({ name: "未登录作品" });
        expect(res.status).toBe(401);
    });

    test("缺少 name 返回 400", async () => {
        const res = await request(app)
            .post("/api/software")
            .set("Authorization", `Bearer ${token}`)
            .send({ description: "没有名称" });
        expect(res.status).toBe(400);
    });

    test("登录后成功创建返回 201", async () => {
        const res = await request(app)
            .post("/api/software")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "数据分析平台",
                description: "一站式数据分析与可视化平台",
                tech_stack: "Vue, Python, MongoDB",
                repo_url: "http://github.com/example/data-platform",
                demo_url: "http://data.example.com",
                version: "2.1.0",
                license: "Apache-2.0",
                tags: ["数据", "可视化"],
            });
        expect(res.status).toBe(201);
        expect(res.body.software.name).toBe("数据分析平台");
        expect(res.body.software.user_id).toBeDefined();
        expect(res.body.software.created_at).toBeDefined();
        expect(res.body.software.license).toBe("Apache-2.0");
    });

    test("tags 字段被规范为字符串数组", async () => {
        const res = await request(app)
            .post("/api/software")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "非数组 tags 测试",
                tags: "不是数组",
            });
        expect(res.status).toBe(201);
        expect(Array.isArray(res.body.software.tags)).toBe(true);
        expect(res.body.software.tags).toEqual([]);
    });

    test("tags 数组中非字符串元素被过滤", async () => {
        const res = await request(app)
            .post("/api/software")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "混合类型 tags 测试",
                tags: ["有效标签", 456, null, "另一个有效标签"],
            });
        expect(res.status).toBe(201);
        expect(res.body.software.tags).toEqual([
            "有效标签",
            "另一个有效标签",
        ]);
    });
});

describe("软件作品详情 GET /api/software/:id", () => {
    test("存在的 id 返回 200", async () => {
        const res = await request(app).get(
            `/api/software/${softwareId}`
        );
        expect(res.status).toBe(200);
        expect(res.body.software.id).toBe(softwareId);
        expect(res.body.software.name).toBe("任务管理系统");
        expect(res.body.software.tech_stack).toBe(
            "React, Node.js, PostgreSQL"
        );
    });

    test("不存在的 id 返回 404", async () => {
        const res = await request(app).get("/api/software/99999");
        expect(res.status).toBe(404);
    });

    test("无效 id 返回 400", async () => {
        const res = await request(app).get("/api/software/abc");
        expect(res.status).toBe(400);
    });
});

describe("更新软件作品 PUT /api/software/:id", () => {
    test("未登录返回 401", async () => {
        const res = await request(app)
            .put(`/api/software/${softwareId}`)
            .send({ name: "新名称" });
        expect(res.status).toBe(401);
    });

    test("非作者更新返回 403", async () => {
        const res = await request(app)
            .put(`/api/software/${softwareId}`)
            .set("Authorization", `Bearer ${otherToken}`)
            .send({ name: "被篡改" });
        expect(res.status).toBe(403);
    });

    test("作者成功更新返回 200", async () => {
        const res = await request(app)
            .put(`/api/software/${softwareId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "更新后的系统名称",
                description: "更新后的描述",
                tech_stack: "Vue, Python",
                repo_url: "http://github.com/new/repo",
                demo_url: "http://new.demo.com",
                version: "2.0.0",
                license: "GPL-3.0",
                tags: ["Web", "更新标签"],
            });
        expect(res.status).toBe(200);
        expect(res.body.software.name).toBe("更新后的系统名称");
        expect(res.body.software.version).toBe("2.0.0");
        expect(res.body.software.license).toBe("GPL-3.0");
        expect(res.body.software.tags).toContain("更新标签");
    });

    test("作者仅更新部分字段返回 200", async () => {
        const res = await request(app)
            .put(`/api/software/${softwareId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "仅名称更新" });
        expect(res.status).toBe(200);
        expect(res.body.software.name).toBe("仅名称更新");
        expect(res.body.software.version).toBe("2.0.0");
    });

    test("更新不存在的软件作品返回 404", async () => {
        const res = await request(app)
            .put("/api/software/99999")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "x" });
        expect(res.status).toBe(404);
    });

    test("无效 id 更新返回 400", async () => {
        const res = await request(app)
            .put("/api/software/abc")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "x" });
        expect(res.status).toBe(400);
    });
});

describe("删除软件作品 DELETE /api/software/:id", () => {
    test("非作者删除返回 403", async () => {
        const res = await request(app)
            .delete(`/api/software/${softwareId}`)
            .set("Authorization", `Bearer ${otherToken}`);
        expect(res.status).toBe(403);
    });

    test("作者成功删除返回 200", async () => {
        const res = await request(app)
            .delete(`/api/software/${softwareId}`)
            .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
    });

    test("删除后再次获取返回 404", async () => {
        const res = await request(app).get(
            `/api/software/${softwareId}`
        );
        expect(res.status).toBe(404);
    });

    test("删除不存在的软件作品返回 404", async () => {
        const res = await request(app)
            .delete("/api/software/99999")
            .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(404);
    });

    test("无效 id 删除返回 400", async () => {
        const res = await request(app)
            .delete("/api/software/abc")
            .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(400);
    });

    test("未登录删除返回 401", async () => {
        // 先创建一个用于测试的软件作品
        const createRes = await request(app)
            .post("/api/software")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "待删除作品" });
        const deleteId = createRes.body.software.id;

        const res = await request(app).delete(
            `/api/software/${deleteId}`
        );
        expect(res.status).toBe(401);
    });
});

describe("搜索与统计集成", () => {
    test("搜索能匹配软件作品名称", async () => {
        // 创建一个包含特定关键词的软件作品
        await request(app)
            .post("/api/software")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "量子计算仿真搜索关键词平台",
                description: "量子计算仿真工具",
            });

        const res = await request(app).get(
            "/api/search?q=量子计算"
        );
        expect(res.status).toBe(200);
        expect(res.body.software.length).toBeGreaterThan(0);
        expect(res.body.software[0].type).toBe("software");
    });

    test("统计包含软件作品计数", async () => {
        const res = await request(app).get("/api/stats");
        expect(res.status).toBe(200);
        expect(res.body.counts).toHaveProperty("software");
        expect(typeof res.body.counts.software).toBe("number");
        expect(res.body.counts.software).toBeGreaterThan(0);
        expect(res.body.recent).toHaveProperty("software");
    });
});

describe("错误处理", () => {
    test("列表数据库异常返回 500", async () => {
        const db = getDb();
        const original = db.software;
        db.software = null;
        const res = await request(app).get("/api/software");
        expect(res.status).toBe(500);
        db.software = original;
    });

    test("详情数据库异常返回 500", async () => {
        const db = getDb();
        const original = db.software;
        db.software = null;
        const res = await request(app).get("/api/software/1");
        expect(res.status).toBe(500);
        db.software = original;
    });

    test("创建数据库异常返回 500", async () => {
        const db = getDb();
        const original = db.software;
        db.software = null;
        const res = await request(app)
            .post("/api/software")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "错误测试" });
        expect(res.status).toBe(500);
        db.software = original;
    });

    test("更新数据库异常返回 500", async () => {
        const db = getDb();
        const original = db.software;
        db.software = null;
        const res = await request(app)
            .put("/api/software/1")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "错误测试" });
        expect(res.status).toBe(500);
        db.software = original;
    });

    test("删除数据库异常返回 500", async () => {
        const db = getDb();
        const original = db.software;
        db.software = null;
        const res = await request(app)
            .delete("/api/software/1")
            .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(500);
        db.software = original;
    });
});
