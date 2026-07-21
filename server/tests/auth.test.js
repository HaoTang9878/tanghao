/**
 * 认证 API 单元测试
 * 覆盖注册、登录、登出、获取当前用户等场景
 * 使用内存模式避免磁盘 IO,保证测试隔离
 */
const request = require("supertest");

// 在 require app 之前切换为内存模式
process.env.JWT_SECRET = "test-secret";
const { setMemoryMode } = require("../src/db");
setMemoryMode();

const app = require("../src/app");
const { closeDb } = require("../src/db");

afterAll(() => {
    closeDb();
});

describe("健康检查", () => {
    test("GET /api/health 返回 200 和 ok", async () => {
        const res = await request(app).get("/api/health");
        expect(res.status).toBe(200);
        expect(res.body.status).toBe("ok");
    });
});

describe("用户注册 POST /api/auth/register", () => {
    test("成功注册返回 201 和 token", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ username: "alice", email: "alice@test.com", password: "pass123456" });
        expect(res.status).toBe(201);
        expect(res.body.user).toBeDefined();
        expect(res.body.user.username).toBe("alice");
        expect(res.body.token).toBeDefined();
        // 不应返回密码
        expect(res.body.user.password_hash).toBeUndefined();
    });

    test("重复用户名返回 409", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ username: "alice", email: "another@test.com", password: "pass123456" });
        expect(res.status).toBe(409);
    });

    test("重复邮箱返回 409", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ username: "alice2", email: "alice@test.com", password: "pass123456" });
        expect(res.status).toBe(409);
    });

    test("参数缺失返回 400", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ username: "ab" });
        expect(res.status).toBe(400);
    });

    test("密码过短返回 400", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ username: "bob", email: "bob@test.com", password: "123" });
        expect(res.status).toBe(400);
    });
});

describe("用户登录 POST /api/auth/login", () => {
    test("使用用户名登录成功", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ username: "alice", password: "pass123456" });
        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
        expect(res.body.user.username).toBe("alice");
    });

    test("使用邮箱登录成功", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ username: "alice@test.com", password: "pass123456" });
        expect(res.status).toBe(200);
    });

    test("密码错误返回 401", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ username: "alice", password: "wrong" });
        expect(res.status).toBe(401);
    });

    test("用户不存在返回 401", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ username: "nobody", password: "pass123456" });
        expect(res.status).toBe(401);
    });

    test("参数为空返回 400", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ username: "" });
        expect(res.status).toBe(400);
    });
});

describe("获取当前用户 GET /api/auth/me", () => {
    let token;
    beforeAll(async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ username: "alice", password: "pass123456" });
        token = res.body.token;
    });

    test("带 token 成功获取用户信息", async () => {
        const res = await request(app)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.user.username).toBe("alice");
    });

    test("无 token 返回 401", async () => {
        const res = await request(app).get("/api/auth/me");
        expect(res.status).toBe(401);
    });

    test("错误 token 返回 401", async () => {
        const res = await request(app)
            .get("/api/auth/me")
            .set("Authorization", "Bearer invalid.token.here");
        expect(res.status).toBe(401);
    });

    test("错误的 scheme 返回 401", async () => {
        const res = await request(app)
            .get("/api/auth/me")
            .set("Authorization", "Basic abc");
        expect(res.status).toBe(401);
    });
});

describe("登出 POST /api/auth/logout", () => {
    let token;
    beforeAll(async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ username: "alice", password: "pass123456" });
        token = res.body.token;
    });

    test("带 token 成功登出", async () => {
        const res = await request(app)
            .post("/api/auth/logout")
            .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
    });

    test("无 token 登出返回 401", async () => {
        const res = await request(app).post("/api/auth/logout");
        expect(res.status).toBe(401);
    });
});
