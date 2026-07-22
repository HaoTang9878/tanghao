/**
 * 开源项目 API 单元测试
 * 覆盖列表、详情、创建、更新、删除等场景
 * 覆鉴权场景(未登录、他人项目等),以及字段校验
 */
const request = require("supertest");

// 在 require app 之前切换为内存模式,保证测试隔离
process.env.JWT_SECRET = "test-secret";
const { setMemoryMode } = require("../src/db");
setMemoryMode();

const app = require("../src/app");
const { closeDb } = require("../src/db");

let token;
let otherToken;
const TEST_SLUG = "open-alpha";
const DRAFT_SLUG = "draft-project";

beforeAll(async () => {
    // 注册并登录两个测试用户,用于验证权限
    await request(app)
        .post("/api/auth/register")
        .send({
            username: "dev",
            email: "dev@test.com",
            password: "pass123456",
        });
    const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "dev", password: "pass123456" });
    token = res.body.token;

    await request(app)
        .post("/api/auth/register")
        .send({
            username: "guest",
            email: "guest@test.com",
            password: "pass123456",
        });
    const res2 = await request(app)
        .post("/api/auth/login")
        .send({ username: "guest", password: "pass123456" });
    otherToken = res2.body.token;
});

afterAll(() => {
    closeDb();
});

describe("项目列表 GET /api/projects", () => {
    test("空列表返回 200", async () => {
        const res = await request(app).get("/api/projects");
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.projects)).toBe(true);
    });

    test("草稿状态不出现在公开列表", async () => {
        await request(app)
            .post("/api/projects")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "草稿项目", slug: DRAFT_SLUG, status: "draft" });
        const res = await request(app).get("/api/projects");
        expect(res.status).toBe(200);
        expect(
            res.body.projects.find((p) => p.slug === DRAFT_SLUG)
        ).toBeUndefined();
    });
});

describe("创建项目 POST /api/projects", () => {
    test("未登录返回 401", async () => {
        const res = await request(app)
            .post("/api/projects")
            .send({ title: "test", slug: "test-slug" });
        expect(res.status).toBe(401);
    });

    test("缺少参数返回 400", async () => {
        const res = await request(app)
            .post("/api/projects")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "test" });
        expect(res.status).toBe(400);
    });

    test("非法 status 返回 400", async () => {
        const res = await request(app)
            .post("/api/projects")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "t", slug: "bad-status", status: "invalid" });
        expect(res.status).toBe(400);
    });

    test("登录后成功创建返回 201", async () => {
        const res = await request(app)
            .post("/api/projects")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "OpenAlpha",
                slug: TEST_SLUG,
                description: "AI 工作流引擎",
                repo_url: "https://github.com/example/open-alpha",
                demo_url: "https://demo.example.com",
                tags: ["ai", "node", "express"],
                status: "published",
                stars: 128,
            });
        expect(res.status).toBe(201);
        expect(res.body.project.slug).toBe(TEST_SLUG);
        expect(res.body.project.tags).toEqual(["ai", "node", "express"]);
        expect(res.body.project.stars).toBe(128);
        expect(res.body.project.user_id).toBeDefined();
    });

    test("重复 slug 返回 409", async () => {
        const res = await request(app)
            .post("/api/projects")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "重复", slug: TEST_SLUG });
        expect(res.status).toBe(409);
    });

    test("tags 非数组时被规范化为空数组", async () => {
        const res = await request(app)
            .post("/api/projects")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "no-tags", slug: "no-tags", tags: "not-array" });
        expect(res.status).toBe(201);
        expect(res.body.project.tags).toEqual([]);
    });
});

describe("项目详情 GET /api/projects/:slug", () => {
    test("存在的 slug 返回 200", async () => {
        const res = await request(app).get(`/api/projects/${TEST_SLUG}`);
        expect(res.status).toBe(200);
        expect(res.body.project.title).toBe("OpenAlpha");
    });

    test("不存在的 slug 返回 404", async () => {
        const res = await request(app).get("/api/projects/not-exist");
        expect(res.status).toBe(404);
    });

    test("草稿项目仍可通过 slug 直接访问", async () => {
        const res = await request(app).get(`/api/projects/${DRAFT_SLUG}`);
        expect(res.status).toBe(200);
        expect(res.body.project.status).toBe("draft");
    });
});

describe("更新项目 PUT /api/projects/:slug", () => {
    test("未登录返回 401", async () => {
        const res = await request(app)
            .put(`/api/projects/${TEST_SLUG}`)
            .send({ title: "新标题" });
        expect(res.status).toBe(401);
    });

    test("非作者更新返回 403", async () => {
        const res = await request(app)
            .put(`/api/projects/${TEST_SLUG}`)
            .set("Authorization", `Bearer ${otherToken}`)
            .send({ title: "被篡改" });
        expect(res.status).toBe(403);
    });

    test("非法 status 更新返回 400", async () => {
        const res = await request(app)
            .put(`/api/projects/${TEST_SLUG}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ status: "invalid" });
        expect(res.status).toBe(400);
    });

    test("作者成功更新返回 200", async () => {
        const res = await request(app)
            .put(`/api/projects/${TEST_SLUG}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "更新后的标题",
                tags: ["updated"],
                stars: 200,
                status: "draft",
            });
        expect(res.status).toBe(200);
        expect(res.body.project.title).toBe("更新后的标题");
        expect(res.body.project.tags).toEqual(["updated"]);
        expect(res.body.project.stars).toBe(200);
    });

    test("更新不存在的项目返回 404", async () => {
        const res = await request(app)
            .put("/api/projects/nonexistent")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "x" });
        expect(res.status).toBe(404);
    });
});

describe("删除项目 DELETE /api/projects/:slug", () => {
    test("非作者删除返回 403", async () => {
        const res = await request(app)
            .delete(`/api/projects/${TEST_SLUG}`)
            .set("Authorization", `Bearer ${otherToken}`);
        expect(res.status).toBe(403);
    });

    test("作者成功删除返回 200", async () => {
        const res = await request(app)
            .delete(`/api/projects/${TEST_SLUG}`)
            .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
    });

    test("删除后再次获取返回 404", async () => {
        const res = await request(app).get(`/api/projects/${TEST_SLUG}`);
        expect(res.status).toBe(404);
    });

    test("删除不存在的项目返回 404", async () => {
        const res = await request(app)
            .delete("/api/projects/nonexistent")
            .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(404);
    });
});
