// Seleksi elemen DOM utama
const taskForm = document.querySelector('#task-form');
const inputJudul = document.querySelector('#input-judul');
const inputMatkul = document.querySelector('#input-matkul');
const inputDeadline = document.querySelector('#input-deadline');
const errorMsg = document.querySelector('#error-msg');
const filterGroup = document.querySelector('#filter-group');
const filterButtons = document.querySelectorAll('.filter-btn');
const taskCounter = document.querySelector('#task-counter');
const taskList = document.querySelector('#task-list');
const emptyMsg = document.querySelector('#empty-msg');

// Kunci penyimpanan localStorage
const STORAGE_KEY = 'task_tracker_kuliah_data';

// Data awal default jika localStorage masih kosong
const defaultTasks = [
  {
    id: 1,
    judul: 'Lab 10 event delegation',
    matkul: 'Pemrograman Web',
    deadline: '2026-10-08',
    selesai: false
  },
  {
    id: 2,
    judul: 'ERD sistem perpustakaan',
    matkul: 'Basis Data',
    deadline: '2026-10-12',
    selesai: true
  }
];

// Memuat data dari localStorage
function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Gagal membaca localStorage:', err);
  }
  return [...defaultTasks];
}

// Menyimpan data ke localStorage
function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Gagal menyimpan ke localStorage:', err);
  }
}

// State aplikasi: array of objects { id, judul, matkul, deadline, selesai }
let tasks = loadTasks();
let currentFilter = 'semua';

// Menampilkan pesan error validasi di halaman
function showError(message) {
  errorMsg.textContent = message;
  errorMsg.hidden = false;
}

// Menyembunyikan pesan error
function clearError() {
  errorMsg.textContent = '';
  errorMsg.hidden = true;
}

// Satu fungsi render() untuk membangun seluruh tampilan dari state secara aman (textContent)
function render() {
  // 1. Update counter tugas aktif
  const activeCount = tasks.filter((task) => !task.selesai).length;
  taskCounter.textContent = `${activeCount} tugas aktif`;

  // 2. Update class 'on' pada tombol filter yang sedang aktif
  filterButtons.forEach((btn) => {
    btn.classList.toggle('on', btn.dataset.filter === currentFilter);
  });

  // 3. Filter daftar tugas sesuai kategori aktif
  const filteredTasks = tasks.filter((task) => {
    if (currentFilter === 'aktif') return !task.selesai;
    if (currentFilter === 'selesai') return task.selesai;
    return true;
  });

  // 4. Bonus: Urutkan berdasarkan deadline terdekat (ascending)
  const sortedTasks = [...filteredTasks].sort((a, b) =>
    a.deadline.localeCompare(b.deadline)
  );

  // 5. Bersihkan isi daftar sebelum merender ulang
  taskList.textContent = '';

  // 6. Tampilkan pesan kosong jika hasil filter tidak memiliki item
  if (sortedTasks.length === 0) {
    if (tasks.length === 0) {
      emptyMsg.textContent = 'Belum ada daftar tugas. Yuk tambahkan tugas kuliahmu!';
    } else if (currentFilter === 'aktif') {
      emptyMsg.textContent = 'Tidak ada tugas aktif. Semua tugas sudah selesai!';
    } else {
      emptyMsg.textContent = 'Belum ada tugas yang diselesaikan.';
    }
    emptyMsg.hidden = false;
    return;
  }

  emptyMsg.hidden = true;

  // 7. Bangun elemen setiap item tugas menggunakan DOM API & textContent
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

// Handler submit form tambah tugas
function handleFormSubmit(e) {
  e.preventDefault();

  const judul = inputJudul.value.trim();
  const matkul = inputMatkul.value;
  const deadline = inputDeadline.value;

  // Validasi judul >= 3 karakter & deadline wajib diisi
  if (judul.length < 3 && !deadline) {
    showError('Judul tugas minimal 3 karakter dan deadline wajib diisi.');
    return;
  }

  if (judul.length < 3) {
    showError('Judul tugas minimal harus 3 karakter.');
    inputJudul.focus();
    return;
  }

  if (!deadline) {
    showError('Deadline tugas wajib dipilih.');
    inputDeadline.focus();
    return;
  }

  clearError();

  // Tambah tugas baru ke state array
  const newTask = {
    id: Date.now(),
    judul: judul,
    matkul: matkul,
    deadline: deadline,
    selesai: false
  };

  tasks.push(newTask);
  saveTasks();

  // Reset form input dan render ulang
  inputJudul.value = '';
  inputDeadline.value = '';
  inputJudul.focus();

  render();
}

// Handler event delegation pada elemen <ul> untuk checkbox selesai & tombol hapus
function handleListClick(e) {
  const itemEl = e.target.closest('.task-item');
  if (!itemEl) return;

  const taskId = Number(itemEl.dataset.id);

  // Jika yang diklik adalah tombol hapus
  if (e.target.closest('.btn-delete')) {
    tasks = tasks.filter((task) => task.id !== taskId);
    saveTasks();
    render();
    return;
  }

  // Jika yang diklik adalah checkbox selesai
  if (e.target.closest('.task-checkbox')) {
    const targetTask = tasks.find((task) => task.id === taskId);
    if (targetTask) {
      targetTask.selesai = !targetTask.selesai;
      saveTasks();
      render();
    }
  }
}

// Handler filter tugas (Semua / Aktif / Selesai) dengan event delegation
function handleFilterClick(e) {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;

  currentFilter = btn.dataset.filter;
  render();
}

// Pasang event listener
taskForm.addEventListener('submit', handleFormSubmit);
taskList.addEventListener('click', handleListClick);
filterGroup.addEventListener('click', handleFilterClick);

// Render tampilan awal
render();
