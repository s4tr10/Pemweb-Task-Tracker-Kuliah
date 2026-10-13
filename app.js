// Seleksi elemen DOM utama
const taskForm = document.querySelector('#task-form');
const inputJudul = document.querySelector('#input-judul');
const inputMatkul = document.querySelector('#input-matkul');
const inputDeadline = document.querySelector('#input-deadline');
const btnSubmit = document.querySelector('#btn-submit');
const errorMsg = document.querySelector('#error-msg');
const filterGroup = document.querySelector('#filter-group');
const filterButtons = document.querySelectorAll('.filter-btn');
const taskCounter = document.querySelector('#task-counter');
const stateBox = document.querySelector('#state-box');
const taskList = document.querySelector('#task-list');
const emptyMsg = document.querySelector('#empty-msg');
const networkModeSelect = document.querySelector('#network-mode');
const btnReload = document.querySelector('#btn-reload');

// State aplikasi
let tasks = [];
let matkulList = [];
let currentFilter = 'semua';

// 04 Helper api() yang mengecek res.ok dan melempar Error berisi pesan server
async function api(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    let serverMessage = `Gagal memproses permintaan (HTTP ${response.status}).`;
    try {
      const errBody = await response.json();
      if (errBody && errBody.message) {
        serverMessage = errBody.message;
      }
    } catch (_) {
      // Abaikan jika body error bukan JSON
    }
    throw new Error(serverMessage);
  }

  // Untuk response 204 No Content (seperti DELETE), kembalikan null
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// Render daftar pilihan mata kuliah ke elemen <select>
function renderMatkulOptions() {
  inputMatkul.textContent = '';
  matkulList.forEach((namaMatkul) => {
    const opt = document.createElement('option');
    opt.value = namaMatkul;
    opt.textContent = namaMatkul;
    inputMatkul.appendChild(opt);
  });
}

// 05 Paralel: muat tugas & daftar mata kuliah (untuk <select>) dengan Promise.all
async function loadInitialData() {
  try {
    const [fetchedTasks, fetchedMatkul] = await Promise.all([
      api('/api/tugas'),
      api('/api/matkul')
    ]);

    tasks = Array.isArray(fetchedTasks) ? fetchedTasks : [];
    matkulList = Array.isArray(fetchedMatkul) ? fetchedMatkul : [];

    renderMatkulOptions();
    render();
  } catch (err) {
    console.warn('Gagal memuat data awal:', err.message);
  }
}

// Satu fungsi render() untuk membangun seluruh tampilan dari state secara aman (textContent)
function render() {
  const activeCount = tasks.filter((task) => !task.selesai).length;
  taskCounter.textContent = `${activeCount} tugas aktif`;

  filterButtons.forEach((btn) => {
    btn.classList.toggle('on', btn.dataset.filter === currentFilter);
  });

  const filteredTasks = tasks.filter((task) => {
    if (currentFilter === 'aktif') return !task.selesai;
    if (currentFilter === 'selesai') return task.selesai;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) =>
    a.deadline.localeCompare(b.deadline)
  );

  taskList.textContent = '';

  if (sortedTasks.length === 0) {
    emptyMsg.textContent = 'Tidak ada tugas untuk ditampilkan.';
    emptyMsg.hidden = false;
    return;
  }

  emptyMsg.hidden = true;

  sortedTasks.forEach((task) => {
    const li = document.createElement('li');
    li.className = 'task-item';
    if (task.selesai) {
      li.classList.add('selesai');
    }
    li.dataset.id = String(task.id);

    const leftDiv = document.createElement('div');
    leftDiv.className = 'task-left';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.selesai;
    checkbox.setAttribute('aria-label', `Tandai selesai ${task.judul}`);

    const infoDiv = document.createElement('div');
    infoDiv.className = 'task-info';

    const titleSpan = document.createElement('span');
    titleSpan.className = 'task-title';
    titleSpan.textContent = task.judul;

    const metaSpan = document.createElement('span');
    metaSpan.className = 'task-meta';
    metaSpan.textContent = `${task.matkul} · deadline ${task.deadline}`;

    infoDiv.appendChild(titleSpan);
    infoDiv.appendChild(metaSpan);

    leftDiv.appendChild(checkbox);
    leftDiv.appendChild(infoDiv);

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn-delete';
    deleteBtn.textContent = '✕';
    deleteBtn.setAttribute('aria-label', `Hapus tugas ${task.judul}`);

    li.appendChild(leftDiv);
    li.appendChild(deleteBtn);

    taskList.appendChild(li);
  });
}

// Handler filter tugas (Semua / Aktif / Selesai)
function handleFilterClick(e) {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;

  currentFilter = btn.dataset.filter;
  render();
}

filterGroup.addEventListener('click', handleFilterClick);

// Muat data dari server saat halaman dibuka
loadInitialData();
