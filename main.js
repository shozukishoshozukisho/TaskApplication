const API = "https://api.github.com/repos/ユーザー名/リポ名/contents/data/users.json";
const TOKEN = "GITHUB_TOKEN";

async function loadUsers() {
  const r = await fetch(API);
  const d = await r.json();
  window.sha = d.sha;
  return JSON.parse(atob(d.content));
}

async function saveUsers(users) {
  await fetch(API, {
    method:"PUT",
    headers:{Authorization:`token ${TOKEN}`},
    body:JSON.stringify({message:"update", content:btoa(JSON.stringify(users,null,2)), sha:window.sha})
  });
}

function isExpired(t){
  return t.date && new Date(t.date)<new Date() && ["未完了","進行中"].includes(t.status);
}

function isNear(t){
  if(!t.date) return false;
  const d=(new Date(t.date)-new Date())/86400000;
  return d>=0 && d<=3 && ["未完了","進行中"].includes(t.status);
}

// タスク追加
async function addTask(){
  const u=await loadUsers();
  const user=localStorage.getItem("user");
  u.users[user].tasks.push({
    id:Date.now(),
    name:newTask.value,
    status:newStatus.value,
    date:newDate.value,
    memo:newMemo.value,
    important:false
  });
  await saveUsers(u); loadTasks();
  newTask.value=""; newMemo.value=""; newDate.value="";
}

// タスク削除
async function deleteTask(id){
  const u=await loadUsers();
  const user=localStorage.getItem("user");
  u.users[user].tasks=u.users[user].tasks.filter(t=>t.id!==id);
  await saveUsers(u); loadTasks();
}

// タスク表示
async function loadTasks(){
  const u=await loadUsers();
  const user=localStorage.getItem("user");
  const kw=taskSearch.value.toLowerCase();
  const f=statusFilter.value;
  tasks.innerHTML="";
  let list=u.users[user].tasks;
  list.forEach(t=>t.important??=false);

  // フィルター
  list=list.filter(t=>(f==="all"||t.status===f)&&t.name.toLowerCase().includes(kw));

  // 並び替え（重要→日付順）
  list.sort((a,b)=>b.important-a.important || new Date(a.date)-new Date(b.date));

  list.forEach(t=>{
    const tr=document.createElement("tr");
    tr.className="status-"+t.status;
    if(isExpired(t)) tr.classList.add("expired");
    else if(isNear(t)) tr.classList.add("near");

    // 各セル
    const starTd=document.createElement("td");
    const star=document.createElement("span");
    star.className="star "+(t.important?"on":"");
    star.textContent=t.important?"★":"☆";
    star.onclick=async()=>{
      t.important=!t.important; await saveUsers(u); loadTasks();
    };
    starTd.appendChild(star); tr.appendChild(starTd);

    const nameTd=document.createElement("td");
    nameTd.textContent=t.name; tr.appendChild(nameTd);

    const statusTd=document.createElement("td");
    statusTd.textContent=t.status; tr.appendChild(statusTd);

    const dateTd=document.createElement("td");
    dateTd.textContent=t.date; tr.appendChild(dateTd);

    const memoTd=document.createElement("td");
    memoTd.textContent=t.memo; tr.appendChild(memoTd);

    const delTd=document.createElement("td");
    const delBtn=document.createElement("button");
    delBtn.textContent="削除";
    delBtn.onclick=()=>deleteTask(t.id);
    delTd.appendChild(delBtn); tr.appendChild(delTd);

    tasks.appendChild(tr);
  });
}

loadTasks();
setInterval(loadTasks,3000);
