<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>LIGA CORP — Reports System</title>

<!-- ✅ Firebase v8 (исправлено) -->
<script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js"></script>

<style>
body {
    margin:0;
    font-family: Arial;
    background:#050505;
    color:#0ff;
}

.neon {
    text-shadow:0 0 10px #0ff,0 0 20px #0ff;
}

header {
    text-align:center;
    padding:20px;
    font-size:22px;
    border-bottom:1px solid #0ff;
}

button {
    width:100%;
    padding:15px;
    margin:5px 0;
    background:#111;
    color:#0ff;
    border:1px solid #0ff;
}

button:hover {
    background:#0ff;
    color:#000;
}

.container {
    padding:15px;
}

.card {
    background:#111;
    padding:15px;
    margin-top:10px;
    border:1px solid #0ff;
}

.chat {
    background:#100000;
    color:#ff2b2b;
}

input, textarea {
    width:100%;
    padding:12px;
    margin:5px 0;
    background:#000;
    color:#0ff;
    border:1px solid #0ff;
}

.hidden { display:none; }
</style>
</head>

<body>

<header class="neon">
LIGA CORP
<div style="font-size:12px;color:#888;">
Будущее цифровых систем управления
</div>
</header>

<div class="container" id="main">

<h3>О компании</h3>
<p>
LIGA CORP — технологическая компания будущего,  
создающая системы управления и автоматизации.
</p>

<button onclick="openReports()">Главная система</button>
<button onclick="openChat()">Чат</button>

</div>

<!-- ОТЧЕТЫ -->
<div class="container hidden" id="reports">

<h3>Система отчётов</h3>

<div id="role">Статус: ГОСТЬ</div>

<button onclick="login()">Вход владельца</button>

<h4>Подать отчёт</h4>
<input id="title" placeholder="Название">
<textarea id="text" placeholder="Описание"></textarea>
<button onclick="addReport()">Отправить</button>

<h4>Статистика</h4>
<div id="stats"></div>

<h4>Отчёты</h4>
<div id="list"></div>

<button onclick="goHome()">Назад</button>

</div>

<!-- ЧАТ -->
<div class="container hidden chat" id="chat">

<h3>Общий чат</h3>

<input id="msg">
<button onclick="sendMsg()">Отправить</button>

<div id="chatList"></div>

<button onclick="goHome()">Назад</button>

</div>

<script>
let isOwner = false;

/* ✅ Firebase config (вставь свой) */
const firebaseConfig = {
  apiKey: "XXX",
  authDomain: "XXX",
  projectId: "XXX"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/* НАВИГАЦИЯ */
function openReports(){
    document.getElementById("main").classList.add("hidden");
    document.getElementById("reports").classList.remove("hidden");
    loadReports();
}

function openChat(){
    document.getElementById("main").classList.add("hidden");
    document.getElementById("chat").classList.remove("hidden");
    loadChat();
}

function goHome(){
    document.getElementById("main").classList.remove("hidden");
    document.getElementById("reports").classList.add("hidden");
    document.getElementById("chat").classList.add("hidden");
}

/* ЛОГИН */
function login(){
    let p = prompt("Пароль");
    if(p === "121212xxx1212"){
        isOwner = true;
        document.getElementById("role").innerText = "Статус: РАЗРАБОТЧИК";
    }
}

/* ОТЧЕТЫ */
function addReport(){
    let t = document.getElementById("title").value;
    let txt = document.getElementById("text").value;

    if(!t || !txt){
        alert("Заполни поля");
        return;
    }

    let now = new Date().toLocaleString();

    db.collection("reports").add({
        title: t,
        text: txt,
        status: "В РАБОТЕ",
        date: now
    });

    document.getElementById("title").value = "";
    document.getElementById("text").value = "";
}

function loadReports(){
    db.collection("reports").onSnapshot(snap=>{
        let list = document.getElementById("list");
        let stats = document.getElementById("stats");

        list.innerHTML = "";

        let done=0, work=0, denied=0;

        snap.forEach(doc=>{
            let r = doc.data();

            if(r.status==="ОДОБРЕНО") done++;
            else if(r.status==="ОТКАЗАНО") denied++;
            else work++;

            list.innerHTML += `
            <div class="card" onclick="openDetail('${doc.id}','${r.title}','${r.text}','${r.status}','${r.date}')">
                <b>${r.title}</b><br>
                ${r.date}<br>
                ${r.status}
            </div>
            `;
        });

        stats.innerHTML = `
        ОДОБРЕНО: ${done}<br>
        В РАБОТЕ: ${work}<br>
        ОТКАЗАНО: ${denied}
        `;
    });
}

/* ДЕТАЛИ */
function openDetail(id,title,text,status,date){
    let html = `
    <div class="card">
    <h3>${title}</h3>
    <p>${text}</p>
    <p>${date}</p>
    <p>${status}</p>
    `;

    if(isOwner){
        html += `
        <button onclick="setStatus('${id}','ОДОБРЕНО')">ОДОБРИТЬ</button>
        <button onclick="setStatus('${id}','ОТКАЗАНО')">ОТКАЗАТЬ</button>
        <button onclick="deleteReport('${id}')">УДАЛИТЬ</button>
        `;
    }

    html += `<button onclick="loadReports()">Назад</button></div>`;

    document.getElementById("list").innerHTML = html;
}

function setStatus(id,status){
    db.collection("reports").doc(id).update({status});
}

function deleteReport(id){
    db.collection("reports").doc(id).delete();
}

/* ЧАТ */
function sendMsg(){
    let text = document.getElementById("msg").value;

    if(!text) return;

    db.collection("chat").add({
        text: text,
        date: new Date().toLocaleTimeString()
    });

    document.getElementById("msg").value = "";
}

function loadChat(){
    db.collection("chat").onSnapshot(snap=>{
        let chat = document.getElementById("chatList");
        chat.innerHTML="";

        snap.forEach(doc=>{
            let m = doc.data();
            chat.innerHTML += `<div>${m.date}: ${m.text}</div>`;
        });
    });
}
</script>

</body>
</html>
