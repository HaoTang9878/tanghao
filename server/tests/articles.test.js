/**
 * 文章 API 单元测试
 * 覆盖列表、详情、创建、更新、删除等场景
 * 覆鉴权场景(未登录、他人文章等)
 */
const request = require("supertest");

process.env.JWT_SECRET = "test-secret";
const { setMemoryMode } = require("../src/db");
setMemoryMode();

const app = require("../src/app");
const { closeDb } = require("../src/db");

let token;
let otherToken;
const TEST_SLUG = "first-post";

beforeAll(async () => {
    // 注册并登录两个测试用户,用于验证权限
    await request(app)
        .post("/api/auth/register")
        .send({ username: "writer", email: "writer@test.com", password: "pass123456" });
    const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "writer", password: "pass123456" });
    token = res.body.token;

    await request(app)
        .post("/api/auth/register")
        .send({ username: "other", email: "other@test.com", password: "pass123456" });
    const res2 = await request(app)
        .post("/api/auth/login")
        .send({ username: "other", password: "pass123456" });
    otherToken = res2.body.token;
});

afterAll(() => {
    closeDb();
});

describe("文章列表 GET /api/articles", () => {
    test("空列表返回 200", async () => {
        const res = await request(app).get("/api/articles");
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.articles)).toBe(true);
    });
});

describe("创建文章 POST /api/articles", () => {
    test("未登录返回 401", async () => {
        const res = await request(app)
            .post("/api/articles")
            .send({ title: "test", slug: "test-slug" });
        expect(res.status).toBe(401);
    });

    test("缺少参数返回 400", async () => {
        const res = await request(app)
            .post("/api/articles")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "test" });
        expect(res.status).toBe(400);
    });

    test("登录后成功创建返回 201", async () => {
        const res = await request(app)
            .post("/api/articles")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "我的第一篇文章", slug: TEST_SLUG, content: "内容", status: "published" });
        expect(res.status).toBe(201);
        expect(res.body.article.slug).toBe(TEST_SLUG);
    });

    test("重复 slug 返回 409", async () => {
        const res = await request(app)
            .post("/api/articles")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "重复", slug: TEST_SLUG });
        expect(res.status).toBe(409);
    });
});

describe("文章详情 GET /api/articles/:slug", () => {
    test("存在的 slug 返回 200", async () => {
        const res = await request(app).get(`/api/articles/${TEST_SLUG}`);
        expect(res.status).toBe(200);
        expect(res.body.article.title).toBe("我的第一篇文章");
    });

    test("不存在的 slug 返回 404", async () => {
        const res = await request(app).get("/api/articles/not-exist");
        expect(res.status).toBe(404);
    });
});

describe("更新文章 PUT /api/articles/:slug", () => {
    test("未登录返回 401", async () => {
        const res = await request(app)
            .put(`/api/articles/${TEST_SLUG}`)
            .send({ title: "新标题" });
        expect(res.status).toBe(401);
    });

    test("非作者更新返回 403", async () => {
        const res = await request(app)
            .put(`/api/articles/${TEST_SLUG}`)
            .set("Authorization", `Bearer ${otherToken}`)
            .send({ title: "被篡改" });
        expect(res.status).toBe(403);
    });

    test("作者成功更新返回 200", async () => {
        const res = await request(app)
            .put(`/api/articles/${TEST_SLUG}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "更新后的标题", status: "draft" });
        expect(res.status).toBe(200);
        expect(res.body.article.title).toBe("更新后的标题");
    });

    test("更新不存在的文章返回 404", async () => {
        const res = await request(app)
            .put("/api/articles/nonexistent")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "x" });
        expect(res.status).toBe(404);
    });
});

describe("删除文章 DELETE /api/articles/:slug", () => {
    test("非作者删除返回 403", async () => {
        const res = await request(app)
            .delete(`/api/articles/${TEST_SLUG}`)
            .set("Authorization", `Bearer ${otherToken}`);
        expect(res.status).toBe(403);
    });

    test("作者成功删除返回 200", async () => {
        const res = await request(app)
            .delete(`/api/articles/${TEST_SLUG}`)
            .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
    });

    test("删除后再次获取返回 404", async () => {
        const res = await request(app).get(`/api/articles/${TEST_SLUG}`);
        expect(res.status).toBe(404);
    });

    test("删除不存在的文章返回 404", async () => {
        const res = await request(app)
            .delete("/api/articles/nonexistent")
            .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(404);
    });
});

describe("404 处理", () => {
    test("访问不存在的接口返回 404", async () => {
        const res = await request(app).get("/api/nonexistent");
        expect(res.status).toBe(404);
    });
});
