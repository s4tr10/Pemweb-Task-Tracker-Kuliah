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
let isLoading = false;
let loadError = null;

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
  if (matkulList.length === 0) return;

  const currentVal = inputMatkul.value;
  inputMatkul.textContent = '';

  matkulList.forEach((namaMatkul) => {
    const opt = document.createElement('option');
    opt.value = namaMatkul;
    opt.textContent = namaMatkul;
    inputMatkul.appendChild(opt);
  });

  if (currentVal && matkulList.includes(currentVal)) {
    inputMatkul.value = currentVal;
  }
}

// Membangun tampilan skeleton saat loading
function renderLoadingState() {
  stateBox.textContent = '';
  stateBox.hidden = false;

  const caption = document.createElement('p');
  caption.className = 'loading-caption';
  caption.textContent = 'Memuat data tugas dari server...';
  stateBox.appendChild(caption);

  const skeletonList = document.createElement('div');
  skeletonList.className = 'skeleton-list';

  for (let i = 0; i < 3; i++) {
    const item = document.createElement('div');
    item.className = 'skeleton-item';

    const lineTitle = document.createElement('div');
    lineTitle.className = 'skeleton-line title';

    const lineMeta = document.createElement('div');
    lineMeta.className = 'skeleton-line meta';

    item.appendChild(lineTitle);
    item.appendChild(lineMeta);
    skeletonList.appendChild(item);
  }

  stateBox.appendChild(skeletonList);
}

// Membangun tampilan error + tombol coba lagi
function renderErrorState(message) {
  stateBox.textContent = '';
  stateBox.hidden = false;

  const card = document.createElement('div');
  card.className = 'error-state-card';

  const text = document.createElement('p');
  text.className = 'error-state-text';
  text.textContent = message;

  const retryBtn = document.createElement('button');
  retryBtn.type = 'button';
  retryBtn.className = 'btn-retry';
  retryBtn.textContent = 'Coba Lagi';
  retryBtn.addEventListener('click', loadInitialData);

  card.appendChild(text);
  card.appendChild(retryBtn);
  stateBox.appendChild(card);
}

// 01 & 05 Muat dari server secara paralel dengan state loading, error + coba lagi, dan kosong
async function loadInitialData() {
  isLoading = true;
  loadError = null;
  render();

  try {
    const [fetchedTasks, fetchedMatkul] = await Promise.all([
      api('/api/tugas'),
      api('/api/matkul')
    ]);

    tasks = Array.isArray(fetchedTasks) ? fetchedTasks : [];
    matkulList = Array.isArray(fetchedMatkul) ? fetchedMatkul : [];

    renderMatkulOptions();
  } catch (err) {
    loadError = err.message || 'Gagal memuat data dari server.';
  } finally {
    isLoading = false;
    render();
  }
}

// Satu fungsi render() untuk membangun seluruh tampilan dari state secara aman (textContent)
function render() {
  const activeCount = tasks.filter((task) => !task.selesai).length;
  taskCounter.textContent = `${activeCount} tugas aktif`;

  filterButtons.forEach((btn) => {
    btn.classList.toggle('on', btn.dataset.filter === currentFilter);
  });

  taskList.textContent = '';

  // 1. State Loading (skeleton + teks)
  if (isLoading) {
    emptyMsg.hidden = true;
    renderLoadingState();
    return;
  }

  // 2. State Error + Tombol Coba Lagi
  if (loadError) {
    emptyMsg.hidden = true;
    renderErrorState(loadError);
    return;
  }

  stateBox.hidden = true;
  stateBox.textContent = '';

  // 3. Filter & urutkan daftar tugas
  const filteredTasks = tasks.filter((task) => {
    if (currentFilter === 'aktif') return !task.selesai;
    if (currentFilter === 'selesai') return task.selesai;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) =>
    a.deadline.localeCompare(b.deadline)
  );

  // 4. State Kosong
  if (sortedTasks.length === 0) {
    if (tasks.length === 0) {
      emptyMsg.textContent = 'Belum ada daftar tugas di server. Yuk tambahkan tugas baru!';
    } else if (currentFilter === 'aktif') {
      emptyMsg.textContent = 'Tidak ada tugas aktif saat ini.';
    } else {
      emptyMsg.textContent = 'Belum ada tugas yang selesai.';
    }
    emptyMsg.hidden = false;
    return;
  }

  emptyMsg.hidden = true;

  // 5. Render daftar tugas dengan textContent
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
btnReload.addEventListener('click', loadInitialData);

// Muat data dari server saat halaman dibuka
loadInitialData();
