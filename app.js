// ======================================
// MOMENTUM APP V2
// PARTE A
// ======================================

// ---------- DATOS ----------

let habits = JSON.parse(localStorage.getItem("habits")) || [];
let history = JSON.parse(localStorage.getItem("history")) || {};

const todayKey = new Date().toISOString().split("T")[0];

// ---------- ELEMENTOS ----------

const todayDate = document.getElementById("todayDate");
const habitList = document.getElementById("habitList");

const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");

const addHabitBtn = document.getElementById("addHabit");

const modal = document.getElementById("modal");

const habitInput = document.getElementById("habitInput");

const saveHabitBtn = document.getElementById("saveHabit");

const cancelBtn = document.getElementById("cancel");

// ---------- FECHA ----------

todayDate.textContent = new Date().toLocaleDateString("es-AR",{

    weekday:"long",

    day:"numeric",

    month:"long",

    year:"numeric"

});

// ---------- MODAL ----------

addHabitBtn.onclick=()=>{

    modal.classList.remove("hidden");

    habitInput.focus();

}

cancelBtn.onclick=()=>{

    modal.classList.add("hidden");

    habitInput.value="";

}

// ---------- LOCAL STORAGE ----------

function saveHabits(){

    localStorage.setItem(
        "habits",
        JSON.stringify(habits)
    );

}

function saveHistory(){

    localStorage.setItem(
        "history",
        JSON.stringify(history)
    );

}

// ---------- AGREGAR HABITO ----------

saveHabitBtn.onclick=()=>{

    const name=habitInput.value.trim();

    if(name==="") return;

    habits.push({

        name,

        done:false

    });

    saveHabits();

    renderHabits();

    modal.classList.add("hidden");

    habitInput.value="";

}

// ---------- PROGRESO ----------

function updateProgress(){

    if(habits.length===0){

        progressFill.style.width="0%";

        progressText.textContent="0%";

        return;

    }

    const completed=

    habits.filter(h=>h.done).length;

    const percent=Math.round(

        completed/habits.length*100

    );

    progressFill.style.width=

    percent+"%";

    progressText.textContent=

    percent+"%";

}

// ---------- RENDER ----------

function renderHabits(){

    habitList.innerHTML="";

    habits.forEach((habit,index)=>{

        habitList.innerHTML+=`

<div class="habit">

<span>

${habit.name}

</span>

<div class="actions">

<button

class="check ${habit.done ? "completed" : ""}"

onclick="toggleHabit(${index})">

${habit.done ? "✔" : ""}

</button>

<button

class="delete"

onclick="deleteHabit(${index})">

🗑

</button>

</div>

</div>

`;

    });

    updateProgress();

}
// ======================================
// PARTE B
// Hábitos + Historial
// ======================================

// ---------- CAMBIAR ESTADO ----------

function toggleHabit(index){

    habits[index].done = !habits[index].done;

    saveHabits();

    saveTodayHistory();

    renderHabits();

    renderWeek();

    renderSelectedDay();

    updateStats();

}

// ---------- ELIMINAR ----------

function deleteHabit(index){

    habits.splice(index,1);

    saveHabits();

    saveTodayHistory();

    renderHabits();

    renderWeek();
    
    renderSelectedDay();
    
    updateStats();

}

// ---------- GUARDAR DÍA ACTUAL ----------

function saveTodayHistory(){

    history[todayKey] = habits.map(h => ({

        name: h.name,

        done: h.done

    }));

    saveHistory();

}

// ---------- HISTORIAL ----------

const historyList = document.getElementById("historyList");

function renderHistory(){

    historyList.innerHTML = "";

    const days = Object.keys(history).sort().reverse();

    if(days.length===0){

        historyList.innerHTML=`

<div class="card">

Todavía no hay historial.

</div>

`;

        return;

    }

    days.forEach(day=>{

        let title = day;

        if(day===todayKey){

            title="Hoy";

        }

        const card=document.createElement("div");

        card.className="card";

        let html=`<h3>${title}</h3>`;

        history[day].forEach(h=>{

            html+=`

<div style="
display:flex;
justify-content:space-between;
padding:12px 0;
border-bottom:1px solid #334155;
">

<span>

${h.name}

</span>

<span style="color:${
h.done ? "#22C55E" : "#94A3B8"
};font-weight:600;">

${h.done ? "Completado" : "Pendiente"}

</span>

</div>

`;

        });

        card.innerHTML=html;

        historyList.appendChild(card);

    });

}
// ======================================
// PARTE C
// Estadísticas + Reinicio + Inicio
// ======================================

// ---------- ESTADÍSTICAS ----------

const weekAverage = document.getElementById("weekAverage");
const monthAverage = document.getElementById("monthAverage");

let chart = null;

let statsRange = "7";

const statsFilters =
    document.querySelectorAll(".stats-filter");

statsFilters.forEach(button => {

    button.addEventListener("click", () => {

        statsFilters.forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");

        statsRange = button.dataset.range;

        updateStats();

    });

});

function updateStats(){

let days = Object.keys(history).sort();

if(statsRange !== "all"){

    const amount = Number(statsRange);

    days = days.slice(-amount);

}
    if(days.length===0){

        weekAverage.textContent="0%";
        monthAverage.textContent="0%";

        if(chart){

            chart.destroy();
            chart=null;

        }

        return;

    }

    const values = days.map(day=>{

        const list = history[day];

        if(list.length===0) return 0;

        const completed =
            list.filter(h=>h.done).length;

        return Math.round(
            completed/list.length*100
        );

    });

    const month =
        Math.round(
            values.reduce((a,b)=>a+b,0)
            / values.length
        );

    const weekValues = values.slice(-7);

    const week =
        Math.round(
            weekValues.reduce((a,b)=>a+b,0)
            / weekValues.length
        );

    weekAverage.textContent = week + "%";
    monthAverage.textContent = month + "%";

    drawChart(days,values);

}

// ---------- GRÁFICO ----------

function drawChart(labels,data){

    const ctx = document
        .getElementById("chart")
        .getContext("2d");

    if(chart){

        chart.destroy();

    }

    chart = new Chart(ctx,{

        type:"line",

        data:{

            labels,

            datasets:[{

                label:"Cumplimiento",

                data,

                borderWidth:3,

                tension:.35,

                fill:false

            }]

        },

        options:{

            responsive:true,

            plugins:{
                legend:{
                    display:false
                }
            },

            scales:{
                y:{
                    min:0,
                    max:100
                }
            }

        }

    });

}

// ---------- CAMBIO DE DÍA ----------

function checkNewDay(){

    const lastDay =
        localStorage.getItem("lastDay");

    if(lastDay===todayKey) return;

    saveTodayHistory();

    habits.forEach(h=>{

        h.done=false;

    });

    saveHabits();

    localStorage.setItem(
        "lastDay",
        todayKey
    );

}

// ---------- PESTAÑAS ----------

const tabs = document.querySelectorAll(".tab");
const pages = document.querySelectorAll(".page");

tabs.forEach(tab=>{

    tab.addEventListener("click",()=>{

        tabs.forEach(t=>
            t.classList.remove("active")
        );

        pages.forEach(p=>
            p.classList.remove("active")
        );

        tab.classList.add("active");

        document
            .getElementById(tab.dataset.page)
            .classList.add("active");

    });

});

// ---------- INICIO ----------

checkNewDay();

renderHabits();

updateStats();
// ======================================
// PARTE F
// CALENDARIO SEMANAL
// ======================================

const weekCalendar = document.getElementById("weekCalendar");
const selectedDay = document.getElementById("selectedDay");

let selectedDate = todayKey;

let weekOffset = 0;

const previousWeekBtn =
    document.getElementById("previousWeek");

const nextWeekBtn =
    document.getElementById("nextWeek");

const weekTitle =
    document.getElementById("weekTitle");

// Obtener lunes de esta semana
function getMonday(date){

    const d = new Date(date);
    const day = d.getDay();

    const difference = d.getDate() - day + (day === 0 ? -6 : 1);

    d.setDate(difference);

    return d;
}

// Convertir fecha a YYYY-MM-DD
function formatDateKey(date){

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2,"0");

    const day = String(date.getDate()).padStart(2,"0");

    return `${year}-${month}-${day}`;
}

// Dibujar semana
function renderWeek(){

    weekCalendar.innerHTML = "";

const monday = getMonday(new Date());

monday.setDate(
    monday.getDate() + (weekOffset * 7)
);

    const dayNames = [
        "Lun",
        "Mar",
        "Mié",
        "Jue",
        "Vie",
        "Sáb",
        "Dom"
    ];

    for(let i = 0; i < 7; i++){

        const date = new Date(monday);

        date.setDate(monday.getDate() + i);

        const key = formatDateKey(date);

        const dayData = history[key];

        let percentage = null;

        if(dayData && dayData.length > 0){

            const completed =
                dayData.filter(h => h.done).length;

            percentage = Math.round(
                completed / dayData.length * 100
            );
        }

        const button = document.createElement("button");

        button.className = "week-day";

        if(key === selectedDate){
            button.classList.add("selected");
        }

        if(key === todayKey){
            button.classList.add("today");
        }

        button.innerHTML = `
            <span class="week-name">${dayNames[i]}</span>

            <strong>${date.getDate()}</strong>

            <small>
                ${percentage !== null ? percentage + "%" : "—"}
            </small>
        `;

        button.onclick = () => {

            selectedDate = key;

            renderWeek();

            renderSelectedDay();

        };

        weekCalendar.appendChild(button);
    }
}

// Mostrar detalle del día
function renderSelectedDay(){

    const data = history[selectedDate];

    const date = new Date(selectedDate + "T12:00:00");

    const formattedDate = date.toLocaleDateString("es-AR",{
        weekday:"long",
        day:"numeric",
        month:"long"
    });

    if(!data || data.length === 0){

        selectedDay.innerHTML = `
            <div class="card day-detail">

                <h3>${formattedDate}</h3>

                <p class="empty-day">
                    No hay datos para este día.
                </p>

            </div>
        `;

        return;
    }

    const completed = data.filter(h => h.done).length;

    const percentage = Math.round(
        completed / data.length * 100
    );

    let habitsHTML = "";

    data.forEach(h => {

        habitsHTML += `
            <div class="history-habit">

                <span>${h.name}</span>

                <strong class="${h.done ? "done" : "pending"}">
                    ${h.done ? "Completado" : "Pendiente"}
                </strong>

            </div>
        `;

    });

    selectedDay.innerHTML = `
        <div class="card day-detail">

            <div class="day-detail-header">

                <h3>${formattedDate}</h3>

                <span>${percentage}%</span>

            </div>

            ${habitsHTML}

        </div>
    `;
}

// Iniciar calendario
renderWeek();

renderSelectedDay();

// ---------- NAVEGACIÓN SEMANAL ----------

previousWeekBtn.onclick = () => {

    weekOffset--;

    const monday = getMonday(new Date());

    monday.setDate(
        monday.getDate() + weekOffset * 7
    );

    selectedDate = formatDateKey(monday);

    updateWeekTitle();

    renderWeek();

    renderSelectedDay();

};

nextWeekBtn.onclick = () => {

    weekOffset++;

    const monday = getMonday(new Date());

    monday.setDate(
        monday.getDate() + weekOffset * 7
    );

    selectedDate = formatDateKey(monday);

    updateWeekTitle();

    renderWeek();

    renderSelectedDay();

};


function updateWeekTitle(){

    if(weekOffset === 0){

        weekTitle.textContent = "Esta semana";

        return;

    }

    if(weekOffset === -1){

        weekTitle.textContent = "Semana pasada";

        return;

    }

    if(weekOffset === 1){

        weekTitle.textContent = "Semana siguiente";

        return;

    }


    const monday = getMonday(new Date());

    monday.setDate(
        monday.getDate() + weekOffset * 7
    );

    const sunday = new Date(monday);

    sunday.setDate(
        monday.getDate() + 6
    );


    const start =
        monday.toLocaleDateString("es-AR",{
            day:"numeric",
            month:"short"
        });

    const end =
        sunday.toLocaleDateString("es-AR",{
            day:"numeric",
            month:"short"
        });

    weekTitle.textContent =
        `${start} - ${end}`;

}
// ======================================
// PWA - FUNCIONAMIENTO OFFLINE
// ======================================

if ("serviceWorker" in navigator) {

    window.addEventListener("load", () => {

        navigator.serviceWorker
            .register("./service-worker.js")
            .catch(error => {
                console.error("Error al registrar Service Worker:", error);
            });

    });

}