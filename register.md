# 注册

> 创建一个新账号,开始记录你的所学所思

<form id="register-form" class="auth-form">
  <div class="form-group">
    <label for="reg-username">用户名</label>
    <input type="text" id="reg-username" name="username" placeholder="3-32 个字符" required>
  </div>
  <div class="form-group">
    <label for="reg-email">邮箱</label>
    <input type="email" id="reg-email" name="email" placeholder="your@email.com" required>
  </div>
  <div class="form-group">
    <label for="reg-password">密码</label>
    <input type="password" id="reg-password" name="password" placeholder="6-64 个字符" required>
  </div>
  <button type="submit" class="auth-btn">注册</button>
  <p class="auth-tip">已有账号? <a href="#/login">立即登录</a></p>
  <p id="reg-msg" class="auth-msg"></p>
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
// 注册表单处理逻辑
document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("reg-username").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value;
    const msgEl = document.getElementById("reg-msg");
    msgEl.textContent = "注册中...";
    msgEl.className = "auth-msg";
    try {
        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();
        if (res.ok) {
            // 注册成功后自动登录,保存 token
            localStorage.setItem("brucetanghao_token", data.token);
            localStorage.setItem("brucetanghao_user", JSON.stringify(data.user));
            msgEl.textContent = "注册成功,即将跳转首页";
            msgEl.className = "auth-msg success";
            setTimeout(() => location.href = "#/", 1000);
        } else {
            // 展示第一条校验错误信息
            const errMsg = data.error || (data.errors && data.errors[0] && data.errors[0].msg) || "注册失败";
            msgEl.textContent = errMsg;
            msgEl.className = "auth-msg error";
        }
    } catch (err) {
        msgEl.textContent = "网络错误,请稍后重试";
        msgEl.className = "auth-msg error";
    }
});
</script>
