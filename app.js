// Seleksi elemen DOM utama
const taskForm = document.querySelector('#task-form');
const inputJudul = document.querySelector('#input-judul');
const inputMatkul = document.querySelector('#input-matkul');
const inputDeadline = document.querySelector('#input-deadline');
const errorMsg = document.querySelector('#error-msg');
const filterGroup = document.querySelector('#filter-group');
const taskCounter = document.querySelector('#task-counter');
const taskList = document.querySelector('#task-list');
const emptyMsg = document.querySelector('#empty-msg');

// State aplikasi: array of objects { id, judul, matkul, deadline, selesai }
let tasks = [
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

// Satu fungsi render() untuk membangun tampilan dari state secara aman (textContent)
function render() {
  // Hitung jumlah tugas yang masih aktif (belum selesai)
  const activeCount = tasks.filter((task) => !task.selesai).length;
  taskCounter.textContent = `${activeCount} tugas aktif`;

  // Bersihkan isi daftar sebelum merender ulang
  taskList.textContent = '';

  // Tampilkan pesan kosong jika belum ada tugas
  if (tasks.length === 0) {
    emptyMsg.hidden = false;
    return;
  }

  emptyMsg.hidden = true;

  // Bangun elemen setiap item tugas menggunakan DOM API & textContent
  tasks.forEach((task) => {
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

// Render tampilan awal
render();
