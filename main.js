// ✅ main.js - Täysi korjattu versio

// Hae elementit
let addBtn = document.getElementById("add-btn");
let cancel = document.getElementById("cancel");
let page = document.querySelector(".page");
let input = document.getElementById("input");
let addTask = document.getElementById("add");
let showTask = document.getElementById("task");
let priority = document.getElementById("priority");
let deadlineInput = document.getElementById("deadline");
const sound = new Audio("add.wav");
let change = "Add";
let upData;

// Vaihda teema
const themeToggle = document.getElementById("theme-toggle");
themeToggle?.addEventListener("click", () => {
  document.body.classList.toggle("light");
  localStorage.setItem("theme", document.body.classList.contains("light") ? "light" : "dark");
});

window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.body.classList.add("light");
  }
  updateClock();
  showData();
  updateStats();
  updateProgressBar();
});

// Kello
function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes().toString().padStart(2, '0');
  let seconds = now.getSeconds().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const timeString = `${hours}:${minutes}:${seconds} ${ampm}`;
  document.getElementById("clock").textContent = `🕒 ${timeString}`;
}
setInterval(updateClock, 1000);

// Lataa tallennetut tehtävät
let arrTasks = JSON.parse(localStorage.getItem("dataTask")) || [];

// Näytä lomake ja peruuta
addBtn.addEventListener("click", () => {
  page.classList.remove("text");
  input.value = "";
  deadlineInput.value = "";
  input.focus();
});

cancel.addEventListener("click", () => {
  page.classList.add("text");
});

// Luo tai päivitä tehtävä
addTask.onclick = () => {
  if (input.value === "") {
    alert("Enter the task name");
    return;
  }
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const date = `${now.getDate()} / ${now.getMonth() + 1} / ${now.getFullYear()} - ${hours}:${minutes} ${ampm}`;

  const taskData = {
    id: Date.now(),
    title: input.value,
    date: date,
    isDone: false,
    priority: priority.value,
    deadline: deadlineInput.value
  };

  if (change === "Add") {
    arrTasks.push(taskData);
    sound.play();
    
  } else {
    arrTasks[upData] = taskData;
    addTask.textContent = "Add";
    change = "Add";
  }

  page.classList.add("text");
  saveTasks();
  showData();
  updateStats();
  updateProgressBar();
};

function saveTasks() {
  localStorage.setItem("dataTask", JSON.stringify(arrTasks));
}
const alertSound = new Audio("add.wav");

function updateStats() {
  const validTasks = arrTasks.filter(task => task && task.priority); // ✅ Suodatetaan nullit

  let high = validTasks.filter(task => task.priority === "high").length;
  let medium = validTasks.filter(task => task.priority === "medium").length;
  let low = validTasks.filter(task => task.priority === "low").length;

  let done = validTasks.filter(task => task.isDone).length;
  let notDone = validTasks.length - done;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let dueToday = validTasks.filter(task => {
    if (!task.deadline) return false;
    const deadlineDate = new Date(task.deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    return deadlineDate.getTime() === today.getTime();
  }).length;
  let statsBox = document.getElementById("stats");

  statsBox.innerHTML = `
    📊 High: ${high} | Medium: ${medium} | Low: ${low}<br>
    ✅ Done: ${done} | ⏳ Not Done: ${notDone}<br>
    📌 Due Today: ${dueToday}
  `;
  
  // 🔴 لو فيه مهام اليوم، نغيّر اللون
  if (dueToday > 0) {
    statsBox.style.color = "red";
    statsBox.style.backgroundColor = "#ffe0e0";
    alertSound.play();
  } else {
    statsBox.style.color = "#18188e";
    statsBox.style.backgroundColor = "transparent";
  }
  
}


function showData() {
  let sorted = arrTasks
    .filter(task => task && task.priority)
    .sort((a, b) => {
      const order = { high: 1, medium: 2, low: 3 };
      if (order[a.priority] !== order[b.priority]) return order[a.priority] - order[b.priority];
      return new Date(b.date) - new Date(a.date);
    });
  displayTasks(sorted);
}

function displayTasks(tasksList) {
  showTask.innerHTML = "";
  for (let task of tasksList) {
    if (!task || !task.id) continue;
    let idx = arrTasks.findIndex(t => t && t.id === task.id);
    let color = task.priority === 'high' ? '#ffd6d6' : task.priority === 'medium' ? '#fff5cc' : '#d4f7dc';
    showTask.innerHTML += `
      <div class="task ${task.isDone ? 'checked' : ''}" style="background-color: ${color};">
        <div class="task-txt">
          <p>${task.title}</p>
          <p><strong>Priority:</strong> ${task.priority}</p>
          <p>🗓️ Deadline: ${task.deadline || "Not set"}</p>
          <div class="task-date">
            <span class="material-symbols-outlined">calendar_month</span>
            <time>${task.date}</time>
          </div>
        </div>
        <div class="icons">
          <button onclick="updateTask(${idx})" class="circule">✏️</button>
          <button onclick="completeTask(${idx})" class="circule">${task.isDone ? '❌' : '✅'}</button>
          <button onclick="deleteData(${idx})" class="circule">🗑️</button>
        </div>
      </div>`;
  }
}

function updateTask(index) {
  if (!arrTasks[index]) return;
  if (confirm(`Update ${arrTasks[index].title}?`)) {
    page.classList.remove("text");
    input.value = arrTasks[index].title;
    priority.value = arrTasks[index].priority;
    deadlineInput.value = arrTasks[index].deadline || "";
    change = "Update";
    upData = index;
    addTask.textContent = "Update";
  }
}

function completeTask(index) {
  arrTasks[index].isDone = !arrTasks[index].isDone;
  saveTasks();
  showData();
  updateStats();
  updateProgressBar();
}

function deleteData(index) {
  if (confirm(`Delete ${arrTasks[index].title}?`)) {
    arrTasks.splice(index, 1);
    saveTasks();
    showData();
    updateStats();
    updateProgressBar();
  }
}

function deleteTask(index) {
  if (confirm("Are you sure you want to delete this task?")) {
    tasks.splice(index, 1);
    localStorage.setItem("dataTask", JSON.stringify(tasks));
    displayTasks(tasks);
    updateProgressBar();
  }
}

function updateProgressBar() {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.isDone).length;
  const progress = totalTasks ? (completedTasks / totalTasks) * 100 : 0;
  document.getElementById("progress-bar-inner").style.width = `${progress}%`;
}

// Suodatus ja lajittelu

// Vain keskeneräiset
get("filter-done").addEventListener("click", () => {
  const validTasks = arrTasks.filter(task => task && task.isDone);
  displayTasks(validTasks);
});
get("sort-date").addEventListener("click", () => {
  const validTasks = arrTasks.filter(task => task && task.date);
  let sorted = [...validTasks].sort((a, b) => new Date(b.date) - new Date(a.date));
  displayTasks(sorted);
});
get("filter-undone").addEventListener("click", () => {
  const validTasks = arrTasks.filter(task => task && !task.isDone);
  displayTasks(validTasks);
});
// Kaikki
get("show-all").addEventListener("click", showData);

// Poista kaikki
get("clear-all").addEventListener("click", () => {
  if (confirm("Poista kaikki tehtävät?")) {
    arrTasks = [];
    saveTasks();
    showData();
    updateStats();
    updateProgressBar();
  }
});

// Järjestä vanhimmasta uusimpaan
get("sort-oldest").addEventListener("click", () => {
  const validTasks = arrTasks.filter(task => task && task.title && task.priority && task.date);

  let sorted = [...validTasks].sort((a, b) => new Date(a.date) - new Date(b.date));
  displayTasks(sorted);
});

// Järjestä prioriteetin mukaan
get("sort-priority").addEventListener("click", () => {
  const validTasks = arrTasks.filter(task => task && task.title && task.priority && task.date);

  let order = { high: 1, medium: 2, low: 3 };
  let sorted = [...validTasks].sort((a, b) => order[a.priority] - order[b.priority]);
  displayTasks(sorted);
});

// Aakkosjärjestys
get("sort-name").addEventListener("click", () => {
  const validTasks = arrTasks.filter(task => task && task.title && task.priority && task.date);

  let sorted = [...validTasks].sort((a, b) => a.title.localeCompare(b.title));
  displayTasks(sorted);
});
// ✅ زر لإعادة ضبط الترتيب والتصفية
// ✅ زر لإعادة ضبط الفلاتر مع تأثير نشط مؤقت
get("reset-filters").addEventListener("click", () => {
  showData();      
  updateStats();

  const resetBtn = get("reset-filters");

  // إضافة تأثير نشط مؤقت
  resetBtn.classList.add("active-button");

  setTimeout(() => {
    resetBtn.classList.remove("active-button");
  }, 300); // بعد 0.3 ثانية يُزال اللون
});
get("filter-today").addEventListener("click", () => {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  const todayStr = `${day} / ${month} / ${year}`;

  const filtered = arrTasks.filter(task => {
    if (!task || !task.date) return false;
    return task.date.includes(todayStr);
  });

  displayTasks(filtered);
});
get("filter-deadline-today").addEventListener("click", () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`; // deadline مخزنة بهذا الشكل

  const filtered = arrTasks.filter(task => {
    if (!task || !task.deadline) return false;
    return task.deadline === todayStr;
  });

  displayTasks(filtered);
});
get("filter-deadline-passed").addEventListener("click", () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // نزيل الوقت لكي نقارن فقط التاريخ

  const filtered = arrTasks.filter(task => {
    if (!task || !task.deadline) return false;
    const deadlineDate = new Date(task.deadline);
    return deadlineDate < today;
  });

  displayTasks(filtered);
});
get("filter-deadline-future").addEventListener("click", () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // إزالة الوقت للمقارنة الدقيقة

  const filtered = arrTasks.filter(task => {
    if (!task || !task.deadline) return false;
    const deadlineDate = new Date(task.deadline);
    return deadlineDate > today;
  });

  displayTasks(filtered);
});


// Hakukenttä
get("search-input").addEventListener("input", function () {
  const searchText = this.value.toLowerCase();
  const filtered = arrTasks.filter(task => task.title.toLowerCase().includes(searchText));
  displayTasks(filtered);
});

function get(id) {
  return document.getElementById(id);
}
function exportToExcel() {
  if (!arrTasks.length) {
    alert("No tasks to export!");
    return;
  }
  const worksheet = XLSX.utils.json_to_sheet(arrTasks);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");
  XLSX.writeFile(workbook, "tasks.xlsx");
}
function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 10;
  arrTasks.forEach((task) => {
    doc.text(`Title: ${task.title}`, 10, y);
    y += 7;
    doc.text(`Date: ${task.date}`, 10, y);
    y += 7;
    doc.text(`Priority: ${task.priority}`, 10, y);
    y += 7;
    doc.text(`Status: ${task.isDone ? "Done" : "Not Done"}`, 10, y);
    y += 7;
    doc.text(`Deadline: ${task.deadline || "None"}`, 10, y);
    y += 10;
  });
  doc.save("tasks.pdf");
}
function printTasks() {
  window.print();
}

function downloadCSV() {
  if (!arrTasks.length) {
    alert("No tasks to export!");
    return;
  }
  const csvContent = "data:text/csv;charset=utf-8,"
    + arrTasks.map(task => `${task.title},${task.date},${task.priority},${task.isDone ? "Done" : "Not Done"},${task.deadline || "None"}`).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "tasks.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
