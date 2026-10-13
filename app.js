// Seleksi elemen DOM utama
const taskForm = document.querySelector('#task-form');
const inputJudul = document.querySelector('#input-judul');
const inputMatkul = document.querySelector('#input-matkul');
const inputDeadline = document.querySelector('#input-deadline');
const btnSubmit = document.querySelector('#btn-submit');
const inputSearch = document.querySelector('#input-search');
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
let matkulList = [
  'Pemrograman Web',
  'Basis Data',
  'Struktur Data',
  'Jaringan Komputer',
  'Sistem Operasi',
  'Rekayasa Perangkat Lunak'
];
let currentFilter = 'semua';
let searchQuery = '';
let isLoading = false;
let loadError = null;

// Utility Debounce untuk fitur pencarian (Bonus)
function debounce(fn, delay = 250) {
  let timerId = null;
  return function (...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// Menampilkan pesan error di halaman (tanpa error merah tak tertangani di Console)
function showError(message) {
  errorMsg.textContent = message;
  errorMsg.hidden = false;
}

// Menyembunyikan pesan error
function clearError() {
  errorMsg.textContent = '';
  errorMsg.hidden = true;
}

// 04 Helper api() yang mengecek res.ok dan melempar Error berisi pesan server
async function api(url, options = {}) {
  let response;
  try {
    response = await fetch(url, options);
  } catch (networkErr) {
    throw new Error(networkErr.message || 'Gagal terhubung ke server. Periksa koneksi jaringan.');
  }

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

// 01 & 05 Muat dari server secara paralel dengan Promise.all (GET /api/tugas & GET /api/matkul)
async function loadInitialData() {
  isLoading = true;
  loadError = null;
  clearError();
  renderMatkulOptions();
  render();

  try {
    const [fetchedTasks, fetchedMatkul] = await Promise.all([
      api('/api/tugas'),
      api('/api/matkul')
    ]);

    tasks = Array.isArray(fetchedTasks) ? fetchedTasks : [];
    if (Array.isArray(fetchedMatkul) && fetchedMatkul.length > 0) {
      matkulList = fetchedMatkul;
    }

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

  // 3. Filter status & pencarian kata kunci (debounce)
  const filteredTasks = tasks.filter((task) => {
    const matchStatus =
      currentFilter === 'aktif'
        ? !task.selesai
        : currentFilter === 'selesai'
          ? task.selesai
          : true;

    const matchSearch =
      !searchQuery ||
      task.judul.toLowerCase().includes(searchQuery) ||
      task.matkul.toLowerCase().includes(searchQuery);

    return matchStatus && matchSearch;
  });

  // 4. Urutkan berdasarkan deadline terdekat
  const sortedTasks = [...filteredTasks].sort((a, b) =>
    a.deadline.localeCompare(b.deadline)
  );

  // 5. State Kosong
  if (sortedTasks.length === 0) {
    if (tasks.length === 0) {
      emptyMsg.textContent = 'Belum ada daftar tugas di server. Yuk tambahkan tugas baru!';
    } else if (searchQuery) {
      emptyMsg.textContent = `Tidak ditemukan tugas yang cocok dengan "${searchQuery}".`;
    } else if (currentFilter === 'aktif') {
      emptyMsg.textContent = 'Tidak ada tugas aktif saat ini.';
    } else {
      emptyMsg.textContent = 'Belum ada tugas yang selesai.';
    }
    emptyMsg.hidden = false;
    return;
  }

  emptyMsg.hidden = true;

  // 6. Render daftar tugas secara aman dengan textContent
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

// 02 Tambah: form -> POST /api/tugas (header & body JSON), tombol nonaktif selama mengirim, tampilkan error server (400)
async function handleFormSubmit(e) {
  e.preventDefault();
  clearError();

  const payload = {
    judul: inputJudul.value.trim(),
    matkul: inputMatkul.value,
    deadline: inputDeadline.value
  };

  btnSubmit.disabled = true;
  btnSubmit.textContent = 'Mengirim...';

  try {
    const createdTask = await api('/api/tugas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    tasks.push(createdTask);

    inputJudul.value = '';
    inputDeadline.value = '';
    inputJudul.focus();

    render();
  } catch (err) {
    showError(err.message || 'Gagal menambahkan tugas ke server.');
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.textContent = 'Tambah';
  }
}

// 03 & Bonus: Selesai (PATCH) & Hapus (DELETE 204) lewat event delegation + Optimistic Update (rollback jika gagal)
async function handleListClick(e) {
  const itemEl = e.target.closest('.task-item');
  if (!itemEl) return;

  const taskId = Number(itemEl.dataset.id);
  clearError();

  // Aksi Hapus -> DELETE /api/tugas/:id (204) dengan Optimistic Update
  if (e.target.closest('.btn-delete')) {
    const snapshot = tasks.map((t) => ({ ...t }));

    // Optimistic update: hapus dari tampilan lebih dulu
    tasks = tasks.filter((task) => task.id !== taskId);
    render();

    try {
      await api(`/api/tugas/${taskId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      // Rollback jika server gagal (misal mode offline)
      tasks = snapshot;
      render();
      showError(`Gagal menghapus tugas (perubahan dibatalkan): ${err.message}`);
    }
    return;
  }

  // Aksi Toggle Selesai -> PATCH /api/tugas/:id dengan Optimistic Update
  if (e.target.closest('.task-checkbox')) {
    const targetTask = tasks.find((task) => task.id === taskId);
    if (!targetTask) return;

    const snapshot = tasks.map((t) => ({ ...t }));
    const nextStatus = !targetTask.selesai;

    // Optimistic update: ubah tampilan lebih dulu
    tasks = tasks.map((task) =>
      task.id === taskId ? { ...task, selesai: nextStatus } : task
    );
    render();

    try {
      const updatedTask = await api(`/api/tugas/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ selesai: nextStatus })
      });

      // Sinkronkan state dari respons server lalu render()
      tasks = tasks.map((task) => (task.id === taskId ? updatedTask : task));
      render();
    } catch (err) {
      // Rollback jika server gagal (misal mode offline)
      tasks = snapshot;
      render();
      showError(`Gagal memperbarui status tugas (perubahan dibatalkan): ${err.message}`);
    }
  }
}

// Handler filter tugas (Semua / Aktif / Selesai)
function handleFilterClick(e) {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;

  currentFilter = btn.dataset.filter;
  render();
}

// Handler pencarian dengan debounce (Bonus)
const handleSearchInput = debounce((e) => {
  searchQuery = e.target.value.trim().toLowerCase();
  render();
}, 250);

// Sinkronisasi dropdown mode jaringan dengan window.__API
function handleNetworkModeChange(e) {
  if (window.__API && typeof window.__API.setMode === 'function') {
    window.__API.setMode(e.target.value);
  }
}

window.addEventListener('api-mode-change', (e) => {
  if (e.detail && e.detail.mode && networkModeSelect) {
    networkModeSelect.value = e.detail.mode;
  }
});

// Pasang seluruh event listener
taskForm.addEventListener('submit', handleFormSubmit);
taskList.addEventListener('click', handleListClick);
filterGroup.addEventListener('click', handleFilterClick);
if (inputSearch) {
  inputSearch.addEventListener('input', handleSearchInput);
}
if (networkModeSelect) {
  networkModeSelect.addEventListener('change', handleNetworkModeChange);
}
if (btnReload) {
  btnReload.addEventListener('click', loadInitialData);
}

// Muat data dari server saat halaman dibuka
loadInitialData();
