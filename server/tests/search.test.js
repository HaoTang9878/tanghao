/**
 * 搜索 API 单元测试
 * 覆盖全站搜索的关键词匹配、大小写不敏感、snippet 生成、
 * 结果上限截断、空关键词与短关键词拒绝等场景
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
            username: "searcher",
            email: "searcher@test.com",
            password: "pass123456",
        });
    const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "searcher", password: "pass123456" });
    token = res.body.token;

    // 准备搜索数据:文章
    await request(app)
        .post("/api/articles")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "JavaScript 入门指南",
            slug: "javascript-guide",
            content: "本教程介绍 JavaScript 基础语法和常用技巧",
            status: "published",
        });
    await request(app)
        .post("/api/articles")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "另一篇文章",
            slug: "another-article",
            content: "本文不包含关键词",
            status: "published",
        });

    // 书籍
    await request(app)
        .post("/api/books")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "JavaScript 高级编程",
            slug: "js-advanced",
            author: "Nicholas",
            description: "深入讲解 JavaScript 语言特性",
            status: "published",
        });
    // 含空字段的书籍(覆盖 findMatchIndex 空字符串分支)
    await request(app)
        .post("/api/books")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "空字段书籍",
            slug: "empty-fields-book",
            author: "specialkeyword",
            description: "",
            status: "published",
        });

    // 项目
    await request(app)
        .post("/api/projects")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "JavaScript 工具库",
            slug: "js-toolkit",
            description: "常用工具函数集合",
            status: "published",
        });

    // 论坛主题
    await request(app)
        .post("/api/forum/topics")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "讨论 JavaScript 最佳实践",
            slug: "js-discussion",
            content: "欢迎大家分享 JavaScript 学习经验",
        });
});

afterAll(() => {
    closeDb();
});

describe("搜索参数校验", () => {
    test("缺少 q 参数返回 400", async () => {
        const res = await request(app).get("/api/search");
        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
    });

    test("q 为空字符串返回 400", async () => {
        const res = await request(app).get("/api/search?q=");
        expect(res.status).toBe(400);
    });

    test("q 少于 2 字符返回 400", async () => {
        const res = await request(app).get("/api/search?q=j");
        expect(res.status).toBe(400);
    });
});

describe("全站搜索 GET /api/search?q=关键词", () => {
    test("返回各类命中结果且结构正确", async () => {
        const res = await request(app).get("/api/search?q=javascript");
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("articles");
        expect(res.body).toHaveProperty("books");
        expect(res.body).toHaveProperty("projects");
        expect(res.body).toHaveProperty("topics");
        expect(res.body).toHaveProperty("total");
        expect(typeof res.body.total).toBe("number");
    });

    test("匹配文章的 title 字段", async () => {
        const res = await request(app).get("/api/search?q=javascript");
        expect(res.status).toBe(200);
        expect(res.body.articles.length).toBeGreaterThan(0);
        const article = res.body.articles[0];
        expect(article.type).toBe("article");
        expect(article.id).toBeDefined();
        expect(article.title).toBeDefined();
        expect(article.slug).toBeDefined();
        expect(article.snippet).toBeDefined();
    });

    test("匹配书籍的 description 字段", async () => {
        const res = await request(app).get("/api/search?q=javascript");
        expect(res.status).toBe(200);
        expect(res.body.books.length).toBeGreaterThan(0);
        expect(res.body.books[0].type).toBe("book");
    });

    test("匹配项目的 slug 字段", async () => {
        const res = await request(app).get("/api/search?q=js-toolkit");
        expect(res.status).toBe(200);
        expect(res.body.projects.length).toBeGreaterThan(0);
        expect(res.body.projects[0].slug).toBe("js-toolkit");
    });

    test("匹配论坛主题的 content 字段", async () => {
        const res = await request(app).get("/api/search?q=经验");
        expect(res.status).toBe(200);
        expect(res.body.topics.length).toBeGreaterThan(0);
        expect(res.body.topics[0].type).toBe("topic");
    });

    test("大小写不敏感搜索", async () => {
        const res = await request(app).get("/api/search?q=JAVASCRIPT");
        expect(res.status).toBe(200);
        expect(res.body.total).toBeGreaterThan(0);
    });

    test("无匹配时返回空结果", async () => {
        const res = await request(app).get("/api/search?q=zzzznomatch");
        expect(res.status).toBe(200);
        expect(res.body.articles).toEqual([]);
        expect(res.body.books).toEqual([]);
        expect(res.body.projects).toEqual([]);
        expect(res.body.topics).toEqual([]);
        expect(res.body.total).toBe(0);
    });

    test("搜索匹配书籍 author 字段(跳过空 description)", async () => {
        const res = await request(app).get(
            "/api/search?q=specialkeyword"
        );
        expect(res.status).toBe(200);
        expect(res.body.books.length).toBeGreaterThan(0);
        const book = res.body.books.find(
            (b) => b.slug === "empty-fields-book"
        );
        expect(book).toBeDefined();
        expect(book.snippet).toContain("specialkeyword");
    });

    test("snippet 包含匹配关键词附近内容", async () => {
        const res = await request(app).get("/api/search?q=javascript");
        expect(res.status).toBe(200);
        // 文章通过 title 命中,snippet 应来自 title
        const article = res.body.articles.find(
            (a) => a.slug === "javascript-guide"
        );
        expect(article).toBeDefined();
        expect(article.snippet.toLowerCase()).toContain("javascript");
    });

    test("长内容 snippet 不超过 100 字符", async () => {
        // 创建一篇含长内容且关键词在中间的文章
        const longPrefix = "前".repeat(80);
        const longSuffix = "后".repeat(80);
        await request(app)
            .post("/api/articles")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "长文测试",
                slug: "long-content-test",
                content: `${longPrefix}关键词${longSuffix}`,
                status: "published",
            });

        const res = await request(app).get("/api/search?q=关键词");
        expect(res.status).toBe(200);
        const article = res.body.articles.find(
            (a) => a.slug === "long-content-test"
        );
        expect(article).toBeDefined();
        // snippet 前后各 50 字符,长度不超过 100
        expect(article.snippet.length).toBeLessThanOrEqual(100);
        expect(article.snippet).toContain("关键词");
    });
});

describe("搜索结果上限", () => {
    test("结果总数不超过 50", async () => {
        // 批量创建 60 篇含相同关键词的文章
        for (let i = 0; i < 60; i += 1) {
            await request(app)
                .post("/api/articles")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    title: `批量文章 keyword ${i}`,
                    slug: `batch-keyword-${i}`,
                    content: "keyword 批量内容",
                    status: "published",
                });
        }

        const res = await request(app).get("/api/search?q=keyword");
        expect(res.status).toBe(200);
        expect(res.body.total).toBeLessThanOrEqual(50);
        expect(res.body.total).toBe(50);
    });
});

describe("错误处理", () => {
    test("数据库异常时返回 500", async () => {
        const db = getDb();
        const original = db.articles;
        db.articles = null;
        const res = await request(app).get("/api/search?q=javascript");
        expect(res.status).toBe(500);
        db.articles = original;
    });
});
