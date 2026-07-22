/**
 * 文章 API 单元测试
 * 覆盖列表、详情、创建、更新、删除等场景
 * 覆鉴权场景(未登录、他人文章等)
 * 覆盖浏览量自增、点赞限流、取消点赞等场景
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

    test("创建文章时 views 和 likes 初始化为 0", async () => {
        const res = await request(app)
            .post("/api/articles")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "初始化测试", slug: "init-test", content: "内容" });
        expect(res.status).toBe(201);
        expect(res.body.article.views).toBe(0);
        expect(res.body.article.likes).toBe(0);
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

    test("获取文章后 views 自增", async () => {
        // 第一次获取,记录当前浏览量
        const res1 = await request(app).get(`/api/articles/${TEST_SLUG}`);
        const viewsBefore = res1.body.article.views;
        // 第二次获取,浏览量应 +1
        const res2 = await request(app).get(`/api/articles/${TEST_SLUG}`);
        expect(res2.body.article.views).toBe(viewsBefore + 1);
    });

    test("列表接口返回 views 字段", async () => {
        const res = await request(app).get("/api/articles");
        expect(res.status).toBe(200);
        expect(res.body.articles.length).toBeGreaterThan(0);
        expect(res.body.articles[0]).toHaveProperty("views");
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

    test("更新文章时 views 和 likes 保持不变", async () => {
        // 先获取当前 views 和 likes(GET 会自增 views)
        const getRes = await request(app).get(`/api/articles/${TEST_SLUG}`);
        const viewsBefore = getRes.body.article.views;
        const likesBefore = getRes.body.article.likes;
        // 更新文章,views 和 likes 不应被重置
        const res = await request(app)
            .put(`/api/articles/${TEST_SLUG}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "保持不变" });
        expect(res.status).toBe(200);
        expect(res.body.article.views).toBe(viewsBefore);
        expect(res.body.article.likes).toBe(likesBefore);
    });

    test("更新不存在的文章返回 404", async () => {
        const res = await request(app)
            .put("/api/articles/nonexistent")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "x" });
        expect(res.status).toBe(404);
    });
});

describe("点赞与取消点赞 POST/DELETE /api/articles/:slug/like", () => {
    test("点赞成功 likes +1", async () => {
        const res = await request(app)
            .post(`/api/articles/${TEST_SLUG}/like`);
        expect(res.status).toBe(200);
        expect(res.body.likes).toBe(1);
    });

    test("同IP一小时内重复点赞返回 429", async () => {
        const res = await request(app)
            .post(`/api/articles/${TEST_SLUG}/like`);
        expect(res.status).toBe(429);
        expect(res.body.error).toBe("一小时内已点赞");
    });

    test("点赞不存在的文章返回 404", async () => {
        const res = await request(app)
            .post("/api/articles/nonexistent/like");
        expect(res.status).toBe(404);
    });

    test("未登录取消点赞返回 401", async () => {
        const res = await request(app)
            .delete(`/api/articles/${TEST_SLUG}/like`);
        expect(res.status).toBe(401);
    });

    test("非作者取消点赞返回 403", async () => {
        const res = await request(app)
            .delete(`/api/articles/${TEST_SLUG}/like`)
            .set("Authorization", `Bearer ${otherToken}`);
        expect(res.status).toBe(403);
    });

    test("取消不存在的文章点赞返回 404", async () => {
        const res = await request(app)
            .delete("/api/articles/nonexistent/like")
            .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(404);
    });

    test("作者取消点赞 likes -1", async () => {
        const res = await request(app)
            .delete(`/api/articles/${TEST_SLUG}/like`)
            .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.likes).toBe(0);
    });

    test("多次取消点赞 likes 不低于 0", async () => {
        const res = await request(app)
            .delete(`/api/articles/${TEST_SLUG}/like`)
            .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.likes).toBe(0);
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
