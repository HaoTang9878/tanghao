/**
 * 书籍 API 单元测试
 * 覆盖列表、详情、创建、更新、删除等场景
 * 覆鉴权场景(未登录、他人书籍等),以及字段校验
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
const TEST_SLUG = "clean-code";
const DRAFT_SLUG = "draft-book";

beforeAll(async () => {
    // 注册并登录两个测试用户,用于验证权限
    await request(app)
        .post("/api/auth/register")
        .send({
            username: "reader",
            email: "reader@test.com",
            password: "pass123456",
        });
    const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "reader", password: "pass123456" });
    token = res.body.token;

    await request(app)
        .post("/api/auth/register")
        .send({
            username: "visitor",
            email: "visitor@test.com",
            password: "pass123456",
        });
    const res2 = await request(app)
        .post("/api/auth/login")
        .send({ username: "visitor", password: "pass123456" });
    otherToken = res2.body.token;
});

afterAll(() => {
    closeDb();
});

describe("书籍列表 GET /api/books", () => {
    test("空列表返回 200", async () => {
        const res = await request(app).get("/api/books");
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.books)).toBe(true);
    });

    test("草稿状态不出现在公开列表", async () => {
        // 先创建一个草稿书籍
        await request(app)
            .post("/api/books")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "草稿书", slug: DRAFT_SLUG, status: "draft" });
        const res = await request(app).get("/api/books");
        expect(res.status).toBe(200);
        expect(res.body.books.find((b) => b.slug === DRAFT_SLUG)).toBeUndefined();
    });
});

describe("创建书籍 POST /api/books", () => {
    test("未登录返回 401", async () => {
        const res = await request(app)
            .post("/api/books")
            .send({ title: "test", slug: "test-slug" });
        expect(res.status).toBe(401);
    });

    test("缺少参数返回 400", async () => {
        const res = await request(app)
            .post("/api/books")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "test" });
        expect(res.status).toBe(400);
    });

    test("非法 status 返回 400", async () => {
        const res = await request(app)
            .post("/api/books")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "t", slug: "bad-status", status: "invalid" });
        expect(res.status).toBe(400);
    });

    test("非法 rating 返回 400", async () => {
        const res = await request(app)
            .post("/api/books")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "t", slug: "bad-rating", rating: 6 });
        expect(res.status).toBe(400);
    });

    test("登录后成功创建返回 201", async () => {
        const res = await request(app)
            .post("/api/books")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "代码整洁之道",
                slug: TEST_SLUG,
                author: "Robert C. Martin",
                description: "软件工程师必读",
                cover_url: "http://example.com/cover.png",
                status: "published",
                rating: 5,
            });
        expect(res.status).toBe(201);
        expect(res.body.book.slug).toBe(TEST_SLUG);
        expect(res.body.book.rating).toBe(5);
        expect(res.body.book.user_id).toBeDefined();
    });

    test("重复 slug 返回 409", async () => {
        const res = await request(app)
            .post("/api/books")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "重复", slug: TEST_SLUG });
        expect(res.status).toBe(409);
    });

    test("rating 边界值 1 与 5 均合法", async () => {
        const r1 = await request(app)
            .post("/api/books")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "min", slug: "min-rating", rating: 1, status: "draft" });
        expect(r1.status).toBe(201);
        expect(r1.body.book.rating).toBe(1);

        const r2 = await request(app)
            .post("/api/books")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "max", slug: "max-rating", rating: 5, status: "draft" });
        expect(r2.status).toBe(201);
        expect(r2.body.book.rating).toBe(5);
    });
});

describe("书籍详情 GET /api/books/:slug", () => {
    test("存在的 slug 返回 200", async () => {
        const res = await request(app).get(`/api/books/${TEST_SLUG}`);
        expect(res.status).toBe(200);
        expect(res.body.book.title).toBe("代码整洁之道");
    });

    test("不存在的 slug 返回 404", async () => {
        const res = await request(app).get("/api/books/not-exist");
        expect(res.status).toBe(404);
    });

    test("草稿书籍仍可通过 slug 直接访问", async () => {
        const res = await request(app).get(`/api/books/${DRAFT_SLUG}`);
        expect(res.status).toBe(200);
        expect(res.body.book.status).toBe("draft");
    });
});

describe("更新书籍 PUT /api/books/:slug", () => {
    test("未登录返回 401", async () => {
        const res = await request(app)
            .put(`/api/books/${TEST_SLUG}`)
            .send({ title: "新标题" });
        expect(res.status).toBe(401);
    });

    test("非作者更新返回 403", async () => {
        const res = await request(app)
            .put(`/api/books/${TEST_SLUG}`)
            .set("Authorization", `Bearer ${otherToken}`)
            .send({ title: "被篡改" });
        expect(res.status).toBe(403);
    });

    test("非法 status 更新返回 400", async () => {
        const res = await request(app)
            .put(`/api/books/${TEST_SLUG}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ status: "invalid" });
        expect(res.status).toBe(400);
    });

    test("非法 rating 更新返回 400", async () => {
        const res = await request(app)
            .put(`/api/books/${TEST_SLUG}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ rating: 0 });
        expect(res.status).toBe(400);
    });

    test("作者成功更新返回 200", async () => {
        const res = await request(app)
            .put(`/api/books/${TEST_SLUG}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "更新后的标题", rating: 4, status: "draft" });
        expect(res.status).toBe(200);
        expect(res.body.book.title).toBe("更新后的标题");
        expect(res.body.book.rating).toBe(4);
    });

    test("更新不存在的书籍返回 404", async () => {
        const res = await request(app)
            .put("/api/books/nonexistent")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "x" });
        expect(res.status).toBe(404);
    });
});

describe("删除书籍 DELETE /api/books/:slug", () => {
    test("非作者删除返回 403", async () => {
        const res = await request(app)
            .delete(`/api/books/${TEST_SLUG}`)
            .set("Authorization", `Bearer ${otherToken}`);
        expect(res.status).toBe(403);
    });

    test("作者成功删除返回 200", async () => {
        const res = await request(app)
            .delete(`/api/books/${TEST_SLUG}`)
            .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
    });

    test("删除后再次获取返回 404", async () => {
        const res = await request(app).get(`/api/books/${TEST_SLUG}`);
        expect(res.status).toBe(404);
    });

    test("删除不存在的书籍返回 404", async () => {
        const res = await request(app)
            .delete("/api/books/nonexistent")
            .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(404);
    });
});
