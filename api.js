// ===== Overdoze Craft Coffee — API Layer =====
// วางไฟล์นี้ในโฟลเดอร์เดียวกับ index.html แล้ว import ก่อน app.js

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3001/api' 
    : 'https://ovd-web-production.up.railway.app/api';

// ── Token helpers ──────────────────────────────────────────
const Token = {
    get: () => localStorage.getItem('overdoze_token'),
    set: (t) => localStorage.setItem('overdoze_token', t),
    remove: () => localStorage.removeItem('overdoze_token'),
    headers: () => ({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + Token.get() })
};

// ── Base fetch wrapper ─────────────────────────────────────
async function apiFetch(path, options = {}) {
    try {
        const res = await fetch(API_URL + path, {
            headers: Token.headers(),
            ...options
        });
        const data = await res.json();
        if (res.status === 401) {
            Token.remove();
            localStorage.removeItem('overdoze_currentUser');
            localStorage.removeItem('overdoze_activeSession');
            window.location.hash = '#login';
            return { ok: false, error: 'หมดเวลาล็อกอิน กรุณาล็อกอินใหม่' };
        }
        if (!res.ok) throw new Error(data.error || 'เกิดข้อผิดพลาด');
        return { ok: true, data };
    } catch (err) {
        return { ok: false, error: err.message };
    }
}

// ══════════════════════════════════════════════════════════
// AUTH API
// ══════════════════════════════════════════════════════════
const AuthAPI = {
    async register(payload) {
        return apiFetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    },

    async login(email, password) {
        const res = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        if (res.ok) {
            Token.set(res.data.token);
            DB.setOne('currentUser', res.data.user); // เก็บ user info เหมือนเดิม
        }
        return res;
    },

    logout() {
        Token.remove();
        DB.remove('currentUser');
        DB.remove('activeSession');
        navigate('login');
    }
};

// ══════════════════════════════════════════════════════════
// SHIFTS API
// ══════════════════════════════════════════════════════════
const ShiftsAPI = {
    async getActive() {
        return apiFetch('/shifts/active');
    },

    async clockIn() {
        return apiFetch('/shifts/clockin', { method: 'POST' });
    },

    async toggleBreak() {
        return apiFetch('/shifts/break', { method: 'POST' });
    },

    async clockOut() {
        return apiFetch('/shifts/clockout', { method: 'POST' });
    },

    async getHistory() {
        return apiFetch('/shifts/history');
    }
};

// ══════════════════════════════════════════════════════════
// ADMIN API
// ══════════════════════════════════════════════════════════
const AdminAPI = {
    async getStaff() {
        return apiFetch('/admin/staff');
    },

    async approveStaff(id) {
        return apiFetch(`/admin/staff/${id}/approve`, { method: 'PATCH' });
    },

    async rejectStaff(id) {
        return apiFetch(`/admin/staff/${id}/reject`, { method: 'PATCH' });
    },
    async togglePaid(id, isPaid) {
        return apiFetch(`/admin/sessions/${id}/paid`, {
            method: 'POST',
            body: JSON.stringify({ isPaid })
        });
    },

    async getSessions() {
        return apiFetch('/admin/sessions');
    },

    async getStats() {
        return apiFetch('/admin/stats');
    }
};

// ══════════════════════════════════════════════════════════
// SCHEDULE ASSIGN API  (localStorage-first, API if available)
// ══════════════════════════════════════════════════════════
const ScheduleAPI = {
    _ls() { try { return JSON.parse(localStorage.getItem('overdoze_schedules') || '[]'); } catch { return []; } },
    _save(arr) { localStorage.setItem('overdoze_schedules', JSON.stringify(arr)); },
    _uid() { return Math.random().toString(36).slice(2, 10); },

    async getAll() {
        const res = await apiFetch('/admin/schedules');
        if (res.ok) { this._save(res.data.schedules || res.data || []); return res; }
        return { ok: true, data: { schedules: this._ls() } };
    },

    async getMine() {
        const res = await apiFetch('/schedules/mine');
        if (res.ok) return res;
        const user = JSON.parse(localStorage.getItem('overdoze_currentUser') || 'null');
        const mine = this._ls().filter(s => s.staffId === (user && user.id));
        return { ok: true, data: { schedules: mine } };
    },

    async create(payload) {
        const res = await apiFetch('/admin/schedules', { method: 'POST', body: JSON.stringify(payload) });
        if (res.ok) {
            const arr = this._ls();
            arr.push(res.data.schedule || res.data);
            this._save(arr);
            return res;
        }
        const newEntry = { ...payload, id: this._uid(), createdAt: new Date().toISOString() };
        const arr = this._ls();
        arr.push(newEntry);
        this._save(arr);
        return { ok: true, data: { schedule: newEntry } };
    },

    async remove(id) {
        const res = await apiFetch(`/admin/schedules/${id}`, { method: 'DELETE' });
        if (res.ok) { this._save(this._ls().filter(s => s.id !== id)); return res; }
        this._save(this._ls().filter(s => s.id !== id));
        return { ok: true };
    }
};
