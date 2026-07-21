# 登录

> 欢迎回来,请登录你的账号

<form id="login-form" class="auth-form">
  <div class="form-group">
    <label for="login-username">用户名 / 邮箱</label>
    <input type="text" id="login-username" name="username" placeholder="输入用户名或邮箱" required>
  </div>
  <div class="form-group">
    <label for="login-password">密码</label>
    <input type="password" id="login-password" name="password" placeholder="输入密码" required>
  </div>
  <button type="submit" class="auth-btn">登录</button>
  <p class="auth-tip">还没有账号? <a href="#/register">立即注册</a></p>
  <p id="login-msg" class="auth-msg"></p>
</form>

<style>
.auth-form {
    max-width: 400px;
    margin: 20px auto;
    padding: 24px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
}
.form-group {
    margin-bottom: 16px;
}
.form-group label {
    display: block;
    margin-bottom: 6px;
    color: #42b983;
    font-weight: 600;
}
.form-group input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 14px;
    box-sizing: border-box;
}
.form-group input:focus {
    outline: none;
    border-color: #42b983;
}
.auth-btn {
    width: 100%;
    padding: 12px;
    background: #42b983;
    color: #fff;
    border: none;
    border-radius: 4px;
    font-size: 15px;
    cursor: pointer;
    transition: background 0.2s;
}
.auth-btn:hover {
    background: #369870;
}
.auth-tip {
    text-align: center;
    margin-top: 16px;
    color: #6c757d;
    font-size: 13px;
}
.auth-tip a {
    color: #42b983;
}
.auth-msg {
    text-align: center;
    margin-top: 12px;
    font-size: 13px;
    min-height: 18px;
}
.auth-msg.error {
    color: #dc3545;
}
.auth-msg.success {
    color: #28a745;
}
</style>

<script>
// 登录表单处理逻辑
document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value;
    const msgEl = document.getElementById("login-msg");
    msgEl.textContent = "登录中...";
    msgEl.className = "auth-msg";
    try {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
            // 保存 token 到 localStorage 供后续接口使用
            localStorage.setItem("brucetanghao_token", data.token);
            localStorage.setItem("brucetanghao_user", JSON.stringify(data.user));
            msgEl.textContent = "登录成功,即将跳转首页";
            msgEl.className = "auth-msg success";
            setTimeout(() => location.href = "#/", 1000);
        } else {
            msgEl.textContent = data.error || "登录失败";
            msgEl.className = "auth-msg error";
        }
    } catch (err) {
        msgEl.textContent = "网络错误,请稍后重试";
        msgEl.className = "auth-msg error";
    }
});
</script>
