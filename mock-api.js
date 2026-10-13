// Mock REST API untuk Task Tracker Kuliah v2
// Menyediakan endpoint:
// - GET    /api/tugas
// - GET    /api/matkul
// - POST   /api/tugas
// - PATCH  /api/tugas/:id
// - DELETE /api/tugas/:id (204 No Content)
// Serta simulasi jaringan via window.__API.setMode("normal" | "lambat" | "offline")

(function () {
  const STORAGE_KEY = 'task_tracker_v2_mock_db';

  const defaultMatkul = [
    'Pemrograman Web',
    'Basis Data',
    'Struktur Data',
    'Jaringan Komputer',
    'Sistem Operasi',
    'Rekayasa Perangkat Lunak'
  ];

  const initialTasks = [
    {
      id: 1,
      judul: 'Lab 10 event delegation',
      matkul: 'Pemrograman Web',
      deadline: '2026-10-08',
      selesai: false
    },
    {
      id: 2,
      judul: 'Ringkasan materi async/await',
      matkul: 'Pemrograman Web',
      deadline: '2026-10-10',
      selesai: false
    },
    {
      id: 3,
      judul: 'ERD sistem perpustakaan',
      matkul: 'Basis Data',
      deadline: '2026-10-12',
      selesai: true
    }
  ];

  function loadDb() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) {
      // Abaikan jika gagal akses localStorage
    }
    return initialTasks.map((t) => ({ ...t }));
  }

  function saveDb(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (_) {
      // Abaikan jika gagal simpan
    }
  }

  let dbTasks = loadDb();
  let networkMode = 'normal'; // 'normal' | 'lambat' | 'offline'

  function getDelay() {
    if (networkMode === 'lambat' || networkMode === 'slow') return 1800;
    return 250;
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function jsonResponse(body, status = 200) {
    return new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Objek global __API untuk pengujian via Console maupun UI
  window.__API = {
    setMode(mode) {
      const normalized = String(mode || '').toLowerCase().trim();
      if (!['normal', 'lambat', 'offline'].includes(normalized)) {
        console.warn('[__API] Mode tidak dikenal. Gunakan: "normal", "lambat", atau "offline".');
        return networkMode;
      }
      networkMode = normalized;
      window.dispatchEvent(new CustomEvent('api-mode-change', { detail: { mode: networkMode } }));
      console.info(`[__API] Mode jaringan diubah ke: "${networkMode}"`);
      return networkMode;
    },
    getMode() {
      return networkMode;
    },
    resetData() {
      dbTasks = initialTasks.map((t) => ({ ...t }));
      saveDb(dbTasks);
      return dbTasks;
    }
  };

  const originalFetch = window.fetch.bind(window);

  window.fetch = async function (input, init = {}) {
    const urlStr = typeof input === 'string' ? input : input.url;

    // Hanya intercept request ke /api/...
    if (!urlStr.startsWith('/api/')) {
      return originalFetch(input, init);
    }

    const method = (init.method || 'GET').toUpperCase();
    const delay = getDelay();
    await wait(delay);

    // Simulasi jika mode offline
    if (networkMode === 'offline') {
      throw new Error('Tidak dapat terhubung ke server (Jaringan Offline).');
    }

    const path = urlStr.split('?')[0];

    // GET /api/matkul
    if (method === 'GET' && path === '/api/matkul') {
      return jsonResponse(defaultMatkul, 200);
    }

    // GET /api/tugas
    if (method === 'GET' && path === '/api/tugas') {
      return jsonResponse([...dbTasks], 200);
    }

    // POST /api/tugas
    if (method === 'POST' && path === '/api/tugas') {
      let payload = {};
      try {
        payload = init.body ? JSON.parse(init.body) : {};
      } catch (_) {
        return jsonResponse({ message: 'Format JSON tidak valid (400).' }, 400);
      }

      const judul = typeof payload.judul === 'string' ? payload.judul.trim() : '';
      const matkul = typeof payload.matkul === 'string' ? payload.matkul.trim() : '';
      const deadline = typeof payload.deadline === 'string' ? payload.deadline.trim() : '';

      if (judul.length < 3 && !deadline) {
        return jsonResponse(
          { message: 'Server 400: Judul tugas minimal 3 karakter dan deadline wajib diisi.' },
          400
        );
      }
      if (judul.length < 3) {
        return jsonResponse(
          { message: 'Server 400: Judul tugas minimal harus 3 karakter.' },
          400
        );
      }
      if (!deadline) {
        return jsonResponse(
          { message: 'Server 400: Tanggal deadline wajib diisi.' },
          400
        );
      }
      if (!matkul) {
        return jsonResponse(
          { message: 'Server 400: Mata kuliah wajib dipilih.' },
          400
        );
      }

      const newTask = {
        id: Date.now(),
        judul,
        matkul,
        deadline,
        selesai: false
      };

      dbTasks.push(newTask);
      saveDb(dbTasks);
      return jsonResponse(newTask, 201);
    }

    // PATCH /api/tugas/:id & DELETE /api/tugas/:id
    const matchId = path.match(/^\/api\/tugas\/(\d+)$/);
    if (matchId) {
      const id = Number(matchId[1]);
      const index = dbTasks.findIndex((t) => t.id === id);

      if (index === -1) {
        return jsonResponse({ message: `Tugas dengan ID ${id} tidak ditemukan.` }, 404);
      }

      if (method === 'PATCH') {
        let updates = {};
        try {
          updates = init.body ? JSON.parse(init.body) : {};
        } catch (_) {
          return jsonResponse({ message: 'Body JSON tidak valid.' }, 400);
        }

        const updatedTask = {
          ...dbTasks[index],
          ...(typeof updates.selesai === 'boolean' ? { selesai: updates.selesai } : {}),
          ...(typeof updates.judul === 'string' ? { judul: updates.judul.trim() } : {})
        };

        dbTasks[index] = updatedTask;
        saveDb(dbTasks);
        return jsonResponse(updatedTask, 200);
      }

      if (method === 'DELETE') {
        dbTasks.splice(index, 1);
        saveDb(dbTasks);
        return new Response(null, { status: 204 });
      }
    }

    return jsonResponse({ message: `Endpoint ${method} ${path} tidak ditemukan.` }, 404);
  };
})();
