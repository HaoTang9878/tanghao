/**
 * 统计 API 单元测试
 * 覆盖各分类计数、最新记录限制、草稿文章不计入统计等场景
 */
const request = require("supertest");

// 在 require app 之前切换为内存模式,保证测试隔离
process.env.JWT_SECRET = "test-secret";
const { setMemoryMode, getDb } = require("../src/db");
setMemoryMode();

const app = require("../src/app");
const { closeDb } = require("../src/db");

let token;

beforeAll(async () => {
    // 注册并登录测试用户
    await request(app)
        .post("/api/auth/register")
        .send({
            username: "statuser",
            email: "stat@test.com",
            password: "pass123456",
        });
    const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "statuser", password: "pass123456" });
    token = res.body.token;

    // 准备数据:2 篇已发布文章 + 1 篇草稿
    await request(app)
        .post("/api/articles")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "已发布文章一",
            slug: "pub-article-1",
            content: "内容一",
            status: "published",
        });
    await request(app)
        .post("/api/articles")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "已发布文章二",
            slug: "pub-article-2",
            content: "内容二",
            status: "published",
        });
    await request(app)
        .post("/api/articles")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "草稿文章",
            slug: "draft-article",
            content: "草稿内容",
            status: "draft",
        });

    // 2 本书籍
    await request(app)
        .post("/api/books")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "书籍一",
            slug: "book-1",
            status: "published",
        });
    await request(app)
        .post("/api/books")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "书籍二",
            slug: "book-2",
            status: "published",
        });

    // 1 个项目
    await request(app)
        .post("/api/projects")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "项目一",
            slug: "project-1",
            status: "published",
        });

    // 1 个论坛主题 + 1 条回复
    await request(app)
        .post("/api/forum/topics")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "论坛主题一",
            slug: "topic-1",
            content: "讨论内容",
        });
    await request(app)
        .post("/api/forum/topics/topic-1/replies")
        .set("Authorization", `Bearer ${token}`)
        .send({ content: "这是一条回复" });
});

afterAll(() => {
    closeDb();
});

describe("统计数据 GET /api/stats", () => {
    test("返回正确的数据结构", async () => {
        const res = await request(app).get("/api/stats");
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("counts");
        expect(res.body).toHaveProperty("recent");
        expect(res.body.counts).toHaveProperty("articles");
        expect(res.body.counts).toHaveProperty("books");
        expect(res.body.counts).toHaveProperty("projects");
        expect(res.body.counts).toHaveProperty("topics");
        expect(res.body.counts).toHaveProperty("replies");
        expect(res.body.counts).toHaveProperty("users");
        expect(res.body.recent).toHaveProperty("articles");
        expect(res.body.recent).toHaveProperty("books");
        expect(res.body.recent).toHaveProperty("projects");
        expect(res.body.recent).toHaveProperty("topics");
    });

    test("文章计数仅统计已发布文章", async () => {
        const res = await request(app).get("/api/stats");
        expect(res.status).toBe(200);
        // 2 篇已发布,1 篇草稿不计入
        expect(res.body.counts.articles).toBe(2);
    });

    test("书籍计数正确", async () => {
        const res = await request(app).get("/api/stats");
        expect(res.body.counts.books).toBe(2);
    });

    test("项目计数正确", async () => {
        const res = await request(app).get("/api/stats");
        expect(res.body.counts.projects).toBe(1);
    });

    test("论坛主题与回复计数正确", async () => {
        const res = await request(app).get("/api/stats");
        expect(res.body.counts.topics).toBe(1);
        expect(res.body.counts.replies).toBe(1);
    });

    test("用户计数正确", async () => {
        const res = await request(app).get("/api/stats");
        // 注册了 1 个用户
        expect(res.body.counts.users).toBe(1);
    });

    test("最新记录包含标题与日期字段", async () => {
        const res = await request(app).get("/api/stats");
        const article = res.body.recent.articles[0];
        expect(article).toHaveProperty("title");
        expect(article).toHaveProperty("date");
        expect(typeof article.title).toBe("string");
        expect(typeof article.date).toBe("string");
    });

    test("最新记录按创建时间倒序", async () => {
        const res = await request(app).get("/api/stats");
        const articles = res.body.recent.articles;
        for (let i = 1; i < articles.length; i += 1) {
            const prev = new Date(articles[i - 1].date).getTime();
            const curr = new Date(articles[i].date).getTime();
            expect(prev).toBeGreaterThanOrEqual(curr);
        }
    });
});

describe("最新记录上限", () => {
    test("各分类最新记录不超过 5 条", async () => {
        // 批量创建 8 篇文章,确保超过 5 条
        for (let i = 0; i < 8; i += 1) {
            await request(app)
                .post("/api/articles")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    title: `批量文章 ${i}`,
                    slug: `batch-article-${i}`,
                    status: "published",
                });
        }

        const res = await request(app).get("/api/stats");
        expect(res.status).toBe(200);
        expect(res.body.recent.articles.length).toBeLessThanOrEqual(5);
        expect(res.body.recent.books.length).toBeLessThanOrEqual(5);
        expect(res.body.recent.projects.length).toBeLessThanOrEqual(5);
        expect(res.body.recent.topics.length).toBeLessThanOrEqual(5);
    });
});

describe("错误处理", () => {
    test("数据库异常时返回 500", async () => {
        const db = getDb();
        const original = db.articles;
        db.articles = null;
        const res = await request(app).get("/api/stats");
        expect(res.status).toBe(500);
        db.articles = original;
    });
});

describe("空库统计", () => {
    test("无数据时返回全零计数与空最新列表", async () => {
        // 重置数据库为空内存状态
        closeDb();
        setMemoryMode();
        getDb();

        const res = await request(app).get("/api/stats");
        expect(res.status).toBe(200);
        expect(res.body.counts.articles).toBe(0);
        expect(res.body.counts.books).toBe(0);
        expect(res.body.counts.projects).toBe(0);
        expect(res.body.counts.topics).toBe(0);
        expect(res.body.counts.replies).toBe(0);
        expect(res.body.counts.users).toBe(0);
        expect(res.body.recent.articles).toEqual([]);
        expect(res.body.recent.books).toEqual([]);
        expect(res.body.recent.projects).toEqual([]);
        expect(res.body.recent.topics).toEqual([]);
    });
});
