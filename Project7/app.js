// ===============================
// TaskMate Lush — Premium JS
// ===============================

const LS_KEY = "taskmate.tasks.v1";
const DAY = 24 * 60 * 60 * 1000;

// ===== DOM =====
const form = document.getElementById("taskForm");
const titleIn = document.getElementById("title");
const notesIn = document.getElementById("notes");
const dueIn = document.getElementById("due");
const priorityIn = document.getElementById("priority");
const tasksNode = document.getElementById("tasks");
const search = document.getElementById("search");
const filterStatus = document.getElementById("filterStatus");
const sortBy = document.getElementById("sortBy");
const countNode = document.getElementById("count");
const editingId = document.getElementById("editingId");
const notifyPermBtn = document.getElementById("notifyPermBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const toast = document.getElementById("toast");
const toastText = document.getElementById("toastText");
const toastUndoBtn = document.getElementById("toastUndo");

let undoTimer = null;
let lastDeletedTask = null;
let lastDeletedIndex = null;


function showToast(message) {
  toastText.textContent = message;
  toast.classList.remove("hidden");
  requestAnimationFrame(() => toast.classList.add("show"));

  clearTimeout(undoTimer);
  undoTimer = setTimeout(hideToast, 5000);
}

function hideToast() {
  toast.classList.remove("show");
  setTimeout(() => toast.classList.add("hidden"), 300);
}


// ===== State =====
let tasks = loadTasks();
let lastDeleted = null;

// ===============================
// Storage
// ===============================
function loadTasks() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(LS_KEY, JSON.stringify(tasks));
  render();
}

// ===============================
// Utilities
// ===============================
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleString();
}

function isDueSoon(t) {
  if (!t.due) return false;
  const diff = new Date(t.due).getTime() - Date.now();
  return diff > 0 && diff <= DAY;
}

// ===============================
// Form Submit
// ===============================
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = titleIn.value.trim();
  if (!title) return titleIn.focus();

  const task = {
    id: editingId.value || uid(),
    title,
    notes: notesIn.value.trim(),
    due: dueIn.value ? new Date(dueIn.value).toISOString() : null,
    priority: priorityIn.value,
    done: false,
    updatedAt: new Date().toISOString(),
  };

  if (editingId.value) {
    const i = tasks.findIndex((t) => t.id === editingId.value);
    tasks[i] = { ...tasks[i], ...task };
    editingId.value = "";
    document.getElementById("saveBtn").textContent = "Add Task";
  } else {
    task.createdAt = new Date().toISOString();
    task.reminded = false;
    tasks.unshift(task);
  }

  form.reset();
  saveTasks();
});

// ===============================
// CRUD
// ===============================
function toggleDone(id) {
  const t = tasks.find((x) => x.id === id);
  if (!t) return;
  t.done = !t.done;
  t.updatedAt = new Date().toISOString();
  saveTasks();
}

function editTask(id) {
  const t = tasks.find((x) => x.id === id);
  if (!t) return;

  titleIn.value = t.title;
  notesIn.value = t.notes || "";
  priorityIn.value = t.priority;
  dueIn.value = t.due ? t.due.split("T")[0] : "";
  editingId.value = id;

  document.getElementById("saveBtn").textContent = "Save";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function softDelete(id) {
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return;

  lastDeletedTask = tasks[index];
  lastDeletedIndex = index;

  tasks.splice(index, 1);
  saveTasks();

  showToast("Task deleted");
}

toastUndoBtn.addEventListener("click", () => {
  if (!lastDeletedTask) return;

  tasks.splice(lastDeletedIndex, 0, lastDeletedTask);
  lastDeletedTask = null;
  lastDeletedIndex = null;

  saveTasks();
  hideToast();
});


clearAllBtn.onclick = () => {
  if (!confirm("Clear all tasks?")) return;
  tasks = [];
  saveTasks();
};

// ===============================
// Render
// ===============================
function render() {
  let out = [...tasks];
  const q = search.value.trim().toLowerCase();

  if (filterStatus.value === "active") out = out.filter(t => !t.done);
  if (filterStatus.value === "completed") out = out.filter(t => t.done);
  if (filterStatus.value === "due") out = out.filter(isDueSoon);

  if (q)
    out = out.filter(t =>
      (t.title + " " + (t.notes || "")).toLowerCase().includes(q)
    );

  out = sortTasks(out);
  tasksNode.innerHTML = "";

  if (!out.length) {
    tasksNode.innerHTML = `<div class="empty">No tasks yet — add one.</div>`;
    countNode.textContent = tasks.length;
    return;
  }

  out.forEach(t => tasksNode.appendChild(createTaskNode(t)));
  countNode.textContent = tasks.length;
  lucide?.createIcons();
}

function createTaskNode(t) {
  const el = document.createElement("div");
  el.className = `
    task
    priority-${t.priority}
    ${t.done ? "is-completed" : ""}
    ${isDueSoon(t) ? "is-due-soon" : ""}
  `;

  el.innerHTML = `
    <input class="task-check" type="checkbox" ${t.done ? "checked" : ""} />
    <div class="task-body">
      <div class="task-header">
        <div>
          <div class="task-title">${escapeHtml(t.title)}</div>
          <div class="task-notes">${t.notes || "<em>No details added</em>"}</div>
        </div>
        <div class="task-actions">
          ${t.due ? `<span class="chip">${fmtDate(t.due)}</span>` : ""}
          <button data-edit class="btn ghost">✏️</button>
          <button data-delete class="btn ghost">🗑️</button>
        </div>
      </div>
      <div class="task-meta">Created ${fmtDate(t.createdAt)}</div>
    </div>
  `;

  el.querySelector(".task-check").onchange = () => toggleDone(t.id);
  el.querySelector("[data-edit]").onclick = () => editTask(t.id);
  el.querySelector("[data-delete]").onclick = () => softDelete(t.id);

  return el;
}

// ===============================
// Sorting
// ===============================
function sortTasks(arr) {
  if (sortBy.value === "createdDesc")
    return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (sortBy.value === "createdAsc")
    return arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  if (sortBy.value === "dueAsc")
    return arr.sort(
      (a, b) =>
        (a.due ? new Date(a.due) : Infinity) -
        (b.due ? new Date(b.due) : Infinity)
    );

  if (sortBy.value === "priorityHigh") {
    const map = { high: 0, medium: 1, low: 2 };
    return arr.sort((a, b) => map[a.priority] - map[b.priority]);
  }

  return arr;
}

// ===============================
// Notifications
// ===============================
async function ensurePermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  return (await Notification.requestPermission()) === "granted";
}

notifyPermBtn.onclick = async () => {
  const ok = await ensurePermission();
  notifyPermBtn.textContent = ok
    ? "Notifications enabled"
    : "Enable Notifications";
};

// ===============================
// Reminder Loop
// ===============================
setInterval(() => {
  const now = Date.now();
  tasks.forEach(t => {
    if (t.due && !t.reminded && now >= new Date(t.due)) {
      if (Notification.permission === "granted") {
        new Notification("Task due", { body: t.title });
      }
      t.reminded = true;
      t.updatedAt = new Date().toISOString();
      saveTasks();
    }
  });
}, 30000);

// ===============================
// Events
// ===============================
[search, filterStatus, sortBy].forEach(el =>
  el.addEventListener("input", render)
);

window.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "n") {
    e.preventDefault();
    titleIn.focus();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === "z" && lastDeleted) {
    tasks.unshift(lastDeleted);
    lastDeleted = null;
    saveTasks();
  }
});

window.addEventListener("storage", () => {
  tasks = loadTasks();
  render();
});

// ===============================
// First Run Demo Task
// ===============================
if (!tasks.length) {
  tasks.push({
    id: uid(),
    title: "Welcome to TaskMate Lush",
    notes: "This app is refined, fast, and built with care.",
    priority: "medium",
    done: false,
    due: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reminded: false,
  });
  saveTasks();
}

render();
lucide?.createIcons();
