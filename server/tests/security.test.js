/**
 * 安全测试：验证输入校验与安全防护
 * 覆盖密码强度、错误认证、无效 token、注入攻击等场景
 */
const request = require("supertest");

// 在 require app 之前切换为内存模式
process.env.JWT_SECRET = "security-test-secret";
const { setMemoryMode, closeDb } = require("../src/db");
setMemoryMode();

const app = require("../src/app");
const jwt = require("jsonwebtoken");

afterAll(() => {
    closeDb();
});

describe("安全测试：密码强度", () => {
    test("注册时密码少于6位应拒绝", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ username: "shortpw", email: "s@test.com", password: "12345" });
        expect(res.status).toBe(400);
    });

    test("注册时密码为空应拒绝", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ username: "emptypw", email: "e@test.com", password: "" });
        expect(res.status).toBe(400);
    });
});

describe("安全测试：错误认证", () => {
    test("登录时错误密码应返回 401", async () => {
        // 先注册
        await request(app)
            .post("/api/auth/register")
            .send({ username: "secuser", email: "sec@test.com", password: "correctpass" });

        // 用错误密码登录
        const res = await request(app)
            .post("/api/auth/login")
            .send({ username: "secuser", password: "wrongpass" });
        expect(res.status).toBe(401);
    });

    test("登录不存在的用户应返回 401", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ username: "nonexistent", password: "whatever" });
        expect(res.status).toBe(401);
    });
});

describe("安全测试：无效 Token", () => {
    test("无 Authorization 头应返回 401", async () => {
        const res = await request(app)
            .post("/api/articles")
            .send({ title: "test", slug: "test" });
        expect(res.status).toBe(401);
    });

    test("无效 JWT 格式应返回 401", async () => {
        const res = await request(app)
            .post("/api/articles")
            .set("Authorization", "Bearer invalidtoken123")
            .send({ title: "test", slug: "test" });
        expect(res.status).toBe(401);
    });

    test("用不同密钥签发的 JWT 应返回 401", async () => {
        // 用错误的密钥签发 token
        const fakeToken = jwt.sign(
            { userId: 1, username: "faker" },
            "wrong-secret-key"
        );
        const res = await request(app)
            .post("/api/articles")
            .set("Authorization", "Bearer " + fakeToken)
            .send({ title: "test", slug: "test" });
        expect(res.status).toBe(401);
    });
});

describe("安全测试：注入攻击防护", () => {
    test("SQL 注入尝试在用户名中应被安全处理", async () => {
        // 尝试 SQL 注入
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                username: "' OR 1=1 --",
                email: "inject@test.com",
                password: "password123"
            });
        // 应该正常注册或返回校验错误，不应崩溃或绕过
        expect([201, 400, 409]).toContain(res.status);

        // 如果注册成功，登录时也不应绕过
        if (res.status === 201) {
            const loginRes = await request(app)
                .post("/api/auth/login")
                .send({ username: "' OR 1=1 --", password: "password123" });
            expect(loginRes.status).toBe(200);
            expect(loginRes.body).toHaveProperty("token");
        }
    });

    test("XSS 尝试在文章内容中应被存储（前端负责渲染转义）", async () => {
        // 注册并登录
        await request(app)
            .post("/api/auth/register")
            .send({ username: "xsstest", email: "xss@test.com", password: "password123" });
        const login = await request(app)
            .post("/api/auth/login")
            .send({ username: "xsstest", password: "password123" });
        const token = login.body.token;

        // 创建包含 XSS 的文章
        const xssPayload = '<script>alert("xss")</script>';
        const res = await request(app)
            .post("/api/articles")
            .set("Authorization", "Bearer " + token)
            .send({ title: "XSS Test", slug: "xss-test", content: xssPayload });
        expect(res.status).toBe(201);

        // 获取文章验证内容被存储（后端不转义，前端负责）
        const get = await request(app).get("/api/articles/xss-test");
        expect(get.status).toBe(200);
        expect(get.body.article.content).toBe(xssPayload);
    });

    test("超长用户名应被安全处理（不崩溃）", async () => {
        const longName = "A".repeat(1000);
        const res = await request(app)
            .post("/api/auth/register")
            .send({ username: longName, email: "long@test.com", password: "password123" });
        // 应该返回正常状态码，不应 500
        expect([201, 400]).toContain(res.status);
    });
});
