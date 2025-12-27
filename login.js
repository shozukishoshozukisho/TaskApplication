const API = "https://api.github.com/repos/ユーザー名/リポ名/contents/data/users.json";
const TOKEN = "GITHUB_TOKEN"; // ⚠公開しないこと

async function loadUsers() {
  const r = await fetch(API);
  const d = await r.json();
  window.sha = d.sha;
  return JSON.parse(atob(d.content));
}

async function saveUsers(users) {
  await fetch(API, {
    method: "PUT",
    headers: { Authorization: `token ${TOKEN}` },
    body: JSON.stringify({
      message: "update",
      content: btoa(JSON.stringify(users, null, 2)),
      sha: window.sha
    })
  });
}

// ログイン
async function login() {
  const id = document.getElementById("id").value;
  const pw = document.getElementById("pw").value;
  const users = await loadUsers();

  if (!users.users[id] || users.users[id].password !== pw) {
    alert("ID またはパスワードが間違っています");
    return;
  }

  localStorage.setItem("user", id);
  location.href = "app.html";
}

// 新規登録（登録後自動ログイン）
async function register() {
  const id = document.getElementById("regId").value;
  const pw = document.getElementById("regPw").value;

  if (!id || !pw) {
    alert("ID とパスワードを入力してください");
    return;
  }

  const users = await loadUsers();

  // IDまたはPWが既に存在する場合は警告
  if (users.users[id] || Object.values(users.users).some(u => u.password === pw)) {
    alert("IDまたはパスワードが既に使用されています");
    return;
  }

  // 新規ユーザー追加
  users.users[id] = {
    password: pw,
    tasks: []
  };

  await saveUsers(users);

  // ⭐ 登録後自動ログイン
  localStorage.setItem("user", id);
  location.href = "app.html";
}
