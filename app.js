// ===== Overdoze Craft Coffee — Staff Portal SPA =====

// ── Data Layer (localStorage) ──
const DB = {
    get(key) { try { return JSON.parse(localStorage.getItem('overdoze_' + key)) || []; } catch { return []; } },
    set(key, val) { localStorage.setItem('overdoze_' + key, JSON.stringify(val)); },
    getOne(key) { try { return JSON.parse(localStorage.getItem('overdoze_' + key)); } catch { return null; } },
    setOne(key, val) { localStorage.setItem('overdoze_' + key, JSON.stringify(val)); },
    remove(key) { localStorage.removeItem('overdoze_' + key); }
};

function seedData() {
    // API backend handles seeding
}

// ── Auth ──
function currentUser() { return DB.getOne('currentUser'); }
function logout() { AuthAPI.logout(); }

// ── Router ──
function navigate(page) { window.location.hash = '#' + page; }
function getPage() { return (window.location.hash || '#login').slice(1); }

function router() {
    const page = getPage();
    const user = currentUser();
    const app = document.getElementById('app');
    app.style.animation = 'none'; app.offsetHeight; app.style.animation = '';

    // Public pages
    if (page === 'login' || page === '') { if (user) { navigate(user.role === 'admin' ? 'admin' : 'staff'); return; } renderLogin(); return; }
    if (page === 'register') { renderRegister(); return; }
    if (!user) { navigate('login'); return; }

    // Admin-only pages
    const adminPages = ['admin', 'staff-manage'];
    const staffPages = ['staff', 'timeclock'];
    if (adminPages.includes(page) && user.role !== 'admin') { navigate('staff'); return; }
    if (staffPages.includes(page) && user.role === 'admin') { navigate('admin'); return; }

    // Route to page
    const runRoute = async () => {
        switch (page) {
            case 'admin': await renderAdmin(); break;
            case 'staff': await renderStaff(); break;
            case 'timeclock': await renderTimeclock(); break;
            case 'staff-manage': await renderStaffManage(); break;
            case 'schedule': await renderSchedule(); break;
            case 'settings': await renderSettings(); break;
            default: navigate(user.role === 'admin' ? 'admin' : 'staff');
        }
    };
    runRoute();
}

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', () => { seedData(); router(); });

// ── Toast ──
function toast(msg, type = 'info') {
    const el = document.getElementById('toast');
    el.textContent = msg; el.className = 'toast ' + type;
    setTimeout(() => el.classList.add('show'), 10);
    setTimeout(() => el.classList.remove('show'), 3000);
}

// ── Helpers ──
function genId() { return Math.random().toString(36).slice(2, 10); }
function fmtDate(iso) { if (!iso) return '—'; const d = new Date(iso); return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }); }
function fmtTime(iso) { if (!iso) return '—'; return new Date(iso).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }); }
function fmtDuration(ms) { const h = Math.floor(ms / 3600000); const m = Math.floor((ms % 3600000) / 60000); return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`; }
function getInitials(name) { return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2); }
const ROLE_LABELS = { barista: 'Barista', roaster: 'Roaster', manager: 'Manager', inventory_lead: 'Inventory Lead', admin: 'Admin' };

// ── Shared Components ──
function renderFooter() {
    return `<footer class="w-full py-8 mt-auto border-t border-[#ABB3B7]/15 flex flex-col md:flex-row justify-between items-center px-12 opacity-60">
        <p class="font-inter text-xs uppercase tracking-widest text-[#586064]">© 2025 Overdoze Craft Coffee. All Rights Reserved.</p>
        <div class="flex gap-8 mt-4 md:mt-0">
            <a class="font-inter text-xs uppercase tracking-widest text-[#586064] opacity-70 hover:opacity-100 transition-opacity" href="#">Privacy</a>
            <a class="font-inter text-xs uppercase tracking-widest text-[#586064] opacity-70 hover:opacity-100 transition-opacity" href="#">Terms</a>
            <a class="font-inter text-xs uppercase tracking-widest text-[#586064] opacity-70 hover:opacity-100 transition-opacity" href="#">Support</a>
        </div>
    </footer>`;
}

function renderSidebar(activePage) {
    const user = currentUser();
    const isAdmin = user && user.role === 'admin';
    const items = isAdmin ? [
        { icon: 'dashboard', label: 'Overview', page: 'admin' },
        { icon: 'group', label: 'จัดการพนักงาน', page: 'staff-manage' },
        { icon: 'calendar_month', label: 'ตารางงาน', page: 'schedule' },
        { icon: 'settings', label: 'ตั้งค่า', page: 'settings' },
    ] : [
        { icon: 'dashboard', label: 'Overview', page: 'staff' },
        { icon: 'schedule', label: 'ลงเวลางาน', page: 'timeclock' },
        { icon: 'calendar_month', label: 'ตารางงาน', page: 'schedule' },
        { icon: 'settings', label: 'ตั้งค่า', page: 'settings' },
    ];
    return `<aside class="sidebar-desktop h-screen w-64 fixed left-0 top-0 bg-[#F8F9FA] flex flex-col p-4 gap-2 z-40">
        <div class="px-4 py-6 mb-4">
            <div class="flex items-center gap-3 mb-1">
                <div class="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center">
                    <span class="material-symbols-outlined text-primary">coffee</span>
                </div>
                <h1 class="font-headline font-extrabold text-[#4E6073] text-xl tracking-tighter">Overdoze Craft Coffee</h1>
            </div>
            <p class="font-body text-xs text-on-surface-variant font-medium ml-11">Coffee Management</p>
        </div>
        <nav class="flex-1 flex flex-col gap-2">
            ${items.map(i => `<a class="nav-link flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium cursor-pointer ${i.page === activePage ? 'active' : 'text-[#586064] hover:bg-[#EAEFF1]'}" onclick="navigate('${i.page}')">
                <span class="material-symbols-outlined">${i.icon}</span><span>${i.label}</span>
            </a>`).join('')}
        </nav>
        <div class="mt-auto flex flex-col gap-2 border-t border-outline-variant/10 pt-4">
            <div class="flex items-center gap-3 px-4 py-3 mb-2">
                <div class="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold text-sm">${user ? getInitials(user.name) : '??'}</div>
                <div><p class="text-sm font-semibold text-on-surface">${user ? user.name : ''}</p><p class="text-[10px] text-on-surface-variant">${user ? (ROLE_LABELS[user.role] || user.role) : ''}</p></div>
            </div>
            <a class="flex items-center gap-3 text-[#586064] opacity-70 px-4 py-2 hover:opacity-100 transition-opacity cursor-pointer" onclick="logout()">
                <span class="material-symbols-outlined text-sm">logout</span>
                <span class="font-body text-xs uppercase tracking-widest">Logout</span>
            </a>
        </div>
    </aside>`;
}

function renderTopBar(title) {
    const user = currentUser();
    return `<header class="sticky top-0 z-30 flex justify-between items-center w-full px-4 md:px-8 py-4 bg-[#F1F4F6]/80 backdrop-blur-md gap-4">
        <div class="flex items-center min-w-0">
            <h2 class="text-xl md:text-2xl font-bold tracking-tighter text-[#4E6073] font-headline truncate">${title}</h2>
        </div>
        <div class="flex items-center gap-4 flex-shrink-0">
            <button class="p-2 rounded-full hover:bg-[#E3E9EC] transition-colors"><span class="material-symbols-outlined text-[#4E6073]">notifications</span></button>
            <div class="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold text-sm">${user ? getInitials(user.name) : '??'}</div>
        </div>
    </header>`;
}

// ══════════════════ LOGIN PAGE ══════════════════
function renderLogin() {
    const app = document.getElementById('app');
    app.innerHTML = `
    <header class="bg-[#F1F4F6]/80 backdrop-blur-md sticky top-0 z-50 flex justify-between items-center w-full px-4 md:px-8 py-4 gap-4">
        <div class="text-xl md:text-2xl font-bold tracking-tighter text-[#4E6073] font-headline truncate">Overdoze Craft Coffee</div>
        <div class="hidden md:flex gap-8 items-center">
            <nav class="flex gap-6 font-headline tracking-tight font-semibold text-[#586064]">
                <a class="hover:text-[#4E6073] transition-colors" href="#">Experience</a>
                <a class="hover:text-[#4E6073] transition-colors" href="#">Our Beans</a>
            </nav>
        </div>
    </header>
    <main class="min-h-[calc(100vh-80px)] flex flex-col md:flex-row">
        <section class="w-full md:w-1/2 relative min-h-[360px] md:min-h-0 overflow-hidden bg-surface-container">
            <div class="absolute inset-0 z-10 bg-gradient-to-br from-primary/30 to-transparent"></div>
            <img alt="Overdoze Craft Cafe" class="absolute inset-0 w-full h-full object-cover" src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&q=80"/>
            <div class="absolute bottom-12 left-12 z-20 max-w-md">
                <h1 class="text-5xl md:text-6xl font-extrabold text-white tracking-tighter leading-tight drop-shadow-lg mb-4">
                    The Art of<br/>Intentional Brewing.
                </h1>
                <p class="text-white/90 text-lg max-w-sm">ระบบลงชื่อเข้างานสำหรับพนักงานพาร์ทไทม์ Overdoze Craft Coffee</p>
            </div>
        </section>
        <section class="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16 bg-background">
            <div class="w-full max-w-md space-y-10">
                <div class="space-y-2">
                    <span class="text-xs font-bold uppercase tracking-[0.2em] text-primary/60">Authentication</span>
                    <h2 class="text-4xl font-bold tracking-tighter text-on-surface font-headline">Welcome Back</h2>
                    <p class="text-on-surface-variant">เลือกระดับสิทธิ์เพื่อเข้าสู่ระบบ</p>
                </div>
                <div class="space-y-8">
                    <div id="loginToggle" class="bg-surface-container p-1 rounded-2xl flex relative h-12 shadow-sm">
                        <button type="button" id="toggleStaff" class="seg-toggle-btn active flex-1 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all" onclick="setLoginRole('staff')">
                            <span class="material-symbols-outlined text-[18px]">store</span> พนักงาน
                        </button>
                        <button type="button" id="toggleAdmin" class="seg-toggle-btn flex-1 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all text-on-surface-variant hover:bg-surface-container-high" onclick="setLoginRole('admin')">
                            <span class="material-symbols-outlined text-[18px]">admin_panel_settings</span> ผู้ดูแล
                        </button>
                    </div>
                    <form id="loginForm" class="space-y-4" onsubmit="handleLogin(event)">
                        <input type="hidden" id="loginRole" value="staff"/>
                        <div class="space-y-1.5">
                            <label class="text-xs font-bold text-on-surface-variant/70 ml-1 uppercase tracking-wider">Email</label>
                            <input id="loginEmail" class="w-full h-14 px-5 rounded-2xl bg-surface-container-high border-none text-on-surface placeholder:text-outline-variant focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all" placeholder="email@overdoze.coffee" type="email" required/>
                        </div>
                        <div class="space-y-1.5">
                            <label class="text-xs font-bold text-on-surface-variant/70 ml-1 uppercase tracking-wider">Password</label>
                            <input id="loginPassword" class="w-full h-14 px-5 rounded-2xl bg-surface-container-high border-none text-on-surface placeholder:text-outline-variant focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all" placeholder="••••••••" type="password" required/>
                        </div>
                        <button type="submit" class="btn-press w-full h-14 rounded-2xl bg-gradient-to-br from-[#4E6073] to-[#5a6c7f] text-on-primary font-bold text-lg tracking-tight shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all">
                            เข้าสู่ระบบ
                        </button>
                    </form>
                    <div class="flex items-center justify-center gap-6 pt-2">
                        <div class="h-px flex-1 bg-outline-variant/15"></div>
                        <span class="text-xs font-medium text-outline-variant">หรือ</span>
                        <div class="h-px flex-1 bg-outline-variant/15"></div>
                    </div>
                    <button onclick="navigate('register')" class="btn-press w-full h-12 rounded-xl border border-outline-variant/20 flex items-center justify-center gap-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-all">
                        <span class="material-symbols-outlined text-[18px]">person_add</span> ลงทะเบียนพนักงานใหม่
                    </button>
                </div>
            </div>
        </section>
    </main>
    ${renderFooter()}`;
}

let _loginRole = 'staff';
function setLoginRole(role) {
    _loginRole = role;
    document.getElementById('loginRole').value = role;
    document.getElementById('toggleStaff').className = 'seg-toggle-btn flex-1 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all ' + (role === 'staff' ? 'active' : 'text-on-surface-variant hover:bg-surface-container-high');
    document.getElementById('toggleAdmin').className = 'seg-toggle-btn flex-1 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all ' + (role === 'admin' ? 'active' : 'text-on-surface-variant hover:bg-surface-container-high');
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const pw = document.getElementById('loginPassword').value;
    const res = await AuthAPI.login(email, pw);
    if (!res.ok) { toast(res.error, 'error'); return; }
    toast('เข้าสู่ระบบสำเร็จ!', 'success');
    setTimeout(() => navigate(res.data.user.role === 'admin' ? 'admin' : 'staff'), 400);
}

// ══════════════════ REGISTER PAGE ══════════════════
function renderRegister() {
    const app = document.getElementById('app');
    app.innerHTML = `
    <nav class="bg-[#F1F4F6]/80 backdrop-blur-md sticky top-0 z-50 flex justify-between items-center w-full px-4 md:px-8 py-4 md:py-6 gap-2">
        <div class="text-lg md:text-2xl font-bold tracking-tighter text-[#4E6073] font-headline truncate">Overdoze Craft Coffee</div>
        <a class="text-xs md:text-sm font-semibold text-primary hover:opacity-70 transition-opacity cursor-pointer whitespace-nowrap flex-shrink-0" onclick="navigate('login')">← กลับไปหน้า Login</a>
    </nav>
    <main class="min-h-[calc(100vh-160px)] flex items-center justify-center px-4 py-12">
        <div class="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div class="lg:col-span-5 space-y-8">
                <div class="space-y-4">
                    <span class="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant opacity-60">เข้าร่วมทีม</span>
                    <h1 class="text-5xl md:text-6xl font-extrabold tracking-tighter text-primary font-headline leading-[1.1]">
                        The Craft<br/><span class="text-primary-dim opacity-40">Begins With You.</span>
                    </h1>
                    <p class="text-lg text-on-surface-variant leading-relaxed max-w-md">ลงทะเบียนเพื่อเข้าร่วมระบบลงเวลาทำงาน ข้อมูลของคุณจะถูกตรวจสอบโดยผู้ดูแลก่อนเปิดใช้งาน</p>
                </div>
                <div class="bg-surface-container-low p-8 rounded-xl space-y-4 relative overflow-hidden">
                    <div class="flex items-center gap-3 text-primary">
                        <span class="material-symbols-outlined filled">verified_user</span>
                        <span class="font-bold text-sm uppercase tracking-wider font-headline">ขั้นตอนการอนุมัติ</span>
                    </div>
                    <p class="text-sm text-on-surface-variant leading-snug">คำขอลงทะเบียนจะถูกส่งไปยัง Admin Dashboard <strong class="text-primary">ต้องได้รับการอนุมัติ</strong> ก่อนจึงจะเข้าสู่ระบบได้</p>
                    <div class="absolute -right-4 -bottom-4 opacity-5"><span class="material-symbols-outlined text-9xl">coffee_maker</span></div>
                </div>
            </div>
            <div class="lg:col-span-7 bg-white p-10 md:p-14 rounded-[2rem] shadow-[0px_12px_32px_rgba(43,52,55,0.04)] border border-outline-variant/10">
                <form id="regForm" class="space-y-8" onsubmit="handleRegister(event)">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="space-y-2">
                            <label class="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">ชื่อ-นามสกุล</label>
                            <input id="regName" class="w-full bg-surface-container-high border-none rounded-xl px-5 py-4 text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all" placeholder="สมชาย ใจดี" type="text" required/>
                        </div>
                        <div class="space-y-2">
                            <label class="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">ตำแหน่งที่ต้องการ</label>
                            <div class="relative">
                                <select id="regRole" name="regRole"
                                    class="w-full bg-surface-container-high border-none rounded-xl px-5 py-4 pr-12 text-on-surface appearance-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                                    style="-webkit-appearance: none; -moz-appearance: none; appearance: none;">
                                    <option value="" disabled selected>-- เลือกตำแหน่ง --</option>
                                    <option value="barista">Barista</option>
                                    <option value="inventory_lead">Inventory Lead</option>
                                </select>
                                <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant z-10">
                                    expand_more
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="space-y-2">
                            <label class="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">อีเมล</label>
                            <input id="regEmail" class="w-full bg-surface-container-high border-none rounded-xl px-5 py-4 text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all" placeholder="somchai@overdoze.coffee" type="email" required/>
                        </div>
                        <div class="space-y-2">
                            <label class="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">เบอร์โทร</label>
                            <input id="regPhone" class="w-full bg-surface-container-high border-none rounded-xl px-5 py-4 text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all" placeholder="08x-xxx-xxxx" type="tel" required/>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="space-y-2">
                            <label class="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">รหัสผ่าน</label>
                            <input id="regPassword" class="w-full bg-surface-container-high border-none rounded-xl px-5 py-4 text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all" placeholder="••••••••" type="password" required minlength="4"/>
                        </div>
                        <div class="space-y-2">
                            <label class="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">ยืนยันรหัสผ่าน</label>
                            <input id="regPassword2" class="w-full bg-surface-container-high border-none rounded-xl px-5 py-4 text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all" placeholder="••••••••" type="password" required minlength="4"/>
                        </div>
                    </div>
                    <div class="flex gap-4 items-start p-4 bg-surface-container-low/50 rounded-xl">
                        <div class="pt-1"><input id="regTerms" class="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20 bg-white" type="checkbox" required/></div>
                        <p class="text-sm text-on-surface-variant">ข้าพเจ้ารับทราบว่าการลงทะเบียนต้องผ่านการอนุมัติจากผู้ดูแลระบบ และจะได้รับแจ้งเมื่อบัญชีถูกเปิดใช้งาน</p>
                    </div>
                    <div class="pt-4">
                        <button type="submit" class="btn-press w-full py-5 bg-gradient-to-br from-primary to-primary-dim text-on-primary font-bold rounded-xl text-lg font-headline tracking-tight hover:shadow-lg transition-all flex items-center justify-center gap-3">
                            ส่งคำขอลงทะเบียน <span class="material-symbols-outlined text-xl">arrow_right_alt</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </main>
    ${renderFooter()}`;
}

async function handleRegister(e) {
    e.preventDefault();
    const pw = document.getElementById('regPassword').value;
    const pw2 = document.getElementById('regPassword2').value;
    if (pw !== pw2) { toast('รหัสผ่านไม่ตรงกัน', 'error'); return; }
    const email = document.getElementById('regEmail').value.trim();

    const payload = {
        name: document.getElementById('regName').value.trim(),
        email: email,
        phone: document.getElementById('regPhone').value.trim(),
        role: document.getElementById('regRole').value,
        password: pw
    };

    const res = await AuthAPI.register(payload);
    if (!res.ok) { toast(res.error, 'error'); return; }
    toast('ลงทะเบียนสำเร็จ! รอการอนุมัติจาก Admin', 'success');
    setTimeout(() => navigate('login'), 1500);
}

// ══════════════════ STAFF DASHBOARD ══════════════════
let _timerInterval = null;

async function renderStaff() {
    if (_timerInterval) { clearInterval(_timerInterval); _timerInterval = null; }
    const user = currentUser();
    const histRes = await ShiftsAPI.getHistory();
    const sessions = histRes.ok ? histRes.data.history : [];
    const activeRes = await ShiftsAPI.getActive();
    const active = activeRes.ok && activeRes.data.active ? activeRes.data.session : null;
    DB.setOne('activeSession', active);
    const now = new Date();
    const greeting = now.getHours() < 12 ? 'สวัสดีตอนเช้า' : now.getHours() < 17 ? 'สวัสดีตอนบ่าย' : 'สวัสดีตอนเย็น';
    const dateStr = now.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const app = document.getElementById('app');
    app.innerHTML = `${renderSidebar('staff')}
    <main class="main-with-sidebar flex-1 md:ml-64 flex flex-col min-h-screen">
        ${renderTopBar('Staff Portal')}
        <section class="p-8 flex-1">
            <div class="max-w-6xl mx-auto">
                <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <span class="text-xs font-bold uppercase tracking-[0.2em] text-primary/60 mb-2 block">Staff Portal</span>
                        <h1 class="text-4xl md:text-5xl font-headline font-extrabold tracking-tighter text-primary">${greeting}, ${user.name.split(' ')[0]}.</h1>
                    </div>
                    <div class="text-right">
                        <p class="text-xs text-outline font-bold uppercase tracking-widest">${dateStr}</p>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div class="md:col-span-8 bg-surface-container-low rounded-2xl p-8 flex flex-col justify-between min-h-[400px]">
                        <div class="flex justify-between items-start mb-6">
                            <div>
                                <h3 class="text-2xl font-headline font-bold text-primary mb-1">${active ? 'กำลังทำงาน' : 'พร้อมเริ่มงาน'}</h3>
                                <p class="text-on-surface-variant">Overdoze Craft Coffee</p>
                            </div>
                            ${active ? `<div class="px-4 py-2 bg-primary-container/40 rounded-full">
                                <span class="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                                    <span class="w-2 h-2 rounded-full bg-primary pulse-dot"></span>
                                    ${active.onBreak ? 'พักเบรก' : 'On Shift'}
                                </span>
                            </div>` : ''}
                        </div>
                        <div class="flex flex-col items-center justify-center py-6">
                            <div id="clockCircle" class="clock-circle ${active ? 'active' : ''} w-56 h-56 rounded-full border-[12px] ${active ? 'border-primary-container/50' : 'border-surface-container-high'} flex flex-col items-center justify-center bg-surface-container-lowest shadow-xl shadow-primary/5">
                                <span id="timerDisplay" class="text-5xl font-headline font-extrabold tracking-tight text-primary ${active ? 'timer-active' : ''}">${active ? fmtDuration(Date.now() - new Date(active.clockIn).getTime() - (active.totalBreak || 0)) : '00:00'}</span>
                                <span class="text-xs font-bold text-outline-variant uppercase tracking-[0.3em] mt-2">ชั่วโมง:นาที</span>
                            </div>
                        </div>
                        <div id="clockActions" class="grid ${active ? 'grid-cols-2' : 'grid-cols-1'} gap-4 mt-6">
                            ${active ? `
                                <button onclick="handleBreak()" class="btn-press bg-surface-container-lowest text-primary py-5 px-6 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-white shadow-sm">
                                    <span class="material-symbols-outlined">${active.onBreak ? 'play_arrow' : 'coffee_maker'}</span> ${active.onBreak ? 'กลับเข้างาน' : 'พักเบรก'}
                                </button>
                                <button onclick="handleClockOut()" class="btn-press bg-primary text-on-primary py-5 px-6 rounded-2xl font-bold flex items-center justify-center gap-3 hover:opacity-90 shadow-lg shadow-primary/20">
                                    <span class="material-symbols-outlined">logout</span> ลงเวลาออก
                                </button>
                            ` : `
                                <button onclick="handleClockIn()" class="btn-press bg-gradient-to-br from-primary to-primary-dim text-on-primary py-5 px-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:shadow-xl transition-all">
                                    <span class="material-symbols-outlined">login</span> ลงเวลาเข้างาน
                                </button>
                            `}
                        </div>
                    </div>
                    <div class="md:col-span-4 flex flex-col gap-6">
                        <div class="bg-surface-container-high rounded-2xl p-6">
                            <div class="flex items-center gap-3 mb-4">
                                <span class="material-symbols-outlined text-primary">bar_chart</span>
                                <h3 class="text-lg font-headline font-bold text-primary">สรุปเดือนนี้</h3>
                            </div>
                            <div class="space-y-3">
                                <div class="flex justify-between"><span class="text-sm text-on-surface-variant">จำนวนกะ</span><span class="font-bold">${sessions.length} กะ</span></div>
                                <div class="flex justify-between"><span class="text-sm text-on-surface-variant">ชั่วโมงรวม</span><span class="font-bold">${fmtDuration(sessions.reduce((a, s) => a + (s.duration || 0), 0))}</span></div>
                            </div>
                        </div>
                        <div class="bg-tertiary-container/30 rounded-2xl p-6 border border-tertiary-container/50">
                            <div class="flex items-center gap-3 mb-4">
                                <span class="material-symbols-outlined text-tertiary">assignment</span>
                                <h3 class="text-lg font-headline font-bold text-tertiary">โน้ตกะงาน</h3>
                            </div>
                            <p class="text-sm text-on-tertiary-container leading-relaxed">ตรวจสอบเครื่องชงกาแฟก่อนเปิดร้านทุกครั้ง และเช็คสต็อกนมสดก่อนเริ่มงาน</p>
                        </div>
                    </div>
                    <div class="md:col-span-12 mt-4">
                        <h3 class="text-2xl font-headline font-bold text-primary mb-6 px-2">ประวัติการทำงาน</h3>
                        <div class="bg-white rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10">
                            ${sessions.length === 0 ? '<p class="p-8 text-center text-on-surface-variant">ยังไม่มีประวัติการทำงาน</p>' :
            sessions.slice(-10).reverse().map(s => `
                            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 border-b border-surface-container-high last:border-0">
                                <div class="flex flex-col"><span class="text-xs font-bold text-outline-variant uppercase tracking-widest mb-1">วันที่</span><span class="font-semibold">${fmtDate(s.clockIn)}</span></div>
                                <div class="flex flex-col"><span class="text-xs font-bold text-outline-variant uppercase tracking-widest mb-1">เวลาเข้า-ออก</span><span class="font-semibold">${fmtTime(s.clockIn)} — ${fmtTime(s.clockOut)}</span></div>
                                <div class="flex flex-col"><span class="text-xs font-bold text-outline-variant uppercase tracking-widest mb-1">ระยะเวลา</span><span class="font-semibold">${fmtDuration(s.duration || 0)}</span></div>
                                <div class="flex items-center justify-end"><span class="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold uppercase tracking-widest">Verified</span></div>
                            </div>`).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </section>
        ${renderFooter()}
    </main>`;
    if (active) startTimer();
}

function startTimer() {
    if (_timerInterval) clearInterval(_timerInterval);
    _timerInterval = setInterval(() => {
        const active = DB.getOne('activeSession');
        if (!active) { clearInterval(_timerInterval); return; }
        const el = document.getElementById('timerDisplay');
        if (el) {
            const elapsed = Date.now() - new Date(active.clockIn).getTime() - (active.totalBreak || 0) - (active.onBreak ? Date.now() - new Date(active.breakStart).getTime() : 0);
            el.textContent = fmtDuration(Math.max(0, elapsed));
        }
    }, 1000);
}

async function handleClockIn() {
    const res = await ShiftsAPI.clockIn();
    if (!res.ok) { toast(res.error, 'error'); return; }
    toast('ลงเวลาเข้างานเรียบร้อย!', 'success');
    await router();
}

async function handleBreak() {
    const res = await ShiftsAPI.toggleBreak();
    if (!res.ok) { toast(res.error, 'error'); return; }
    toast(res.data.session.onBreak ? 'เริ่มพักเบรก' : 'กลับเข้างานแล้ว', 'info');
    await router();
}

async function handleClockOut() {
    const res = await ShiftsAPI.clockOut();
    if (!res.ok) { toast(res.error, 'error'); return; }
    if (_timerInterval) { clearInterval(_timerInterval); _timerInterval = null; }
    toast('ลงเวลาออกเรียบร้อย!', 'success');
    await router();
}

// ══════════════════ ADMIN DASHBOARD ══════════════════
async function renderAdmin() {
    const user = currentUser();
    const [staffRes, sessRes] = await Promise.all([AdminAPI.getStaff(), AdminAPI.getSessions()]);
    const users = staffRes.ok ? (staffRes.data.staff || staffRes.data.data || staffRes.data || []) : [];
    const sessions = sessRes.ok ? (sessRes.data.sessions || sessRes.data.data || sessRes.data || []) : [];
    const staff = users.filter(u => u.role !== 'admin');
    const pending = staff.filter(u => u.status === 'pending');
    const approved = staff.filter(u => u.status === 'approved');
    const totalHours = sessions.reduce((a, s) => a + (s.duration || 0), 0);
    const todaySessions = sessions.filter(s => { const d = new Date(s.clockIn); const t = new Date(); return d.toDateString() === t.toDateString(); });

    const app = document.getElementById('app');
    app.innerHTML = `${renderSidebar('admin')}
    <main class="main-with-sidebar flex-1 md:ml-64 flex flex-col min-h-screen">
        ${renderTopBar('Admin Dashboard')}
        <div class="p-8 space-y-8">
            <!-- Hero Stats -->
            <section class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div class="md:col-span-2 bg-surface-container-low rounded-xl p-8 flex flex-col justify-between overflow-hidden relative">
                    <div class="z-10">
                        <span class="text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-70">ชั่วโมงทำงานรวม</span>
                        <h2 class="text-4xl font-extrabold text-primary font-headline mt-2">${fmtDuration(totalHours)}</h2>
                        <div class="flex items-center gap-2 mt-4 text-emerald-600 font-semibold text-sm">
                            <span class="material-symbols-outlined text-sm">trending_up</span>
                            <span>${sessions.length} เซสชันทั้งหมด</span>
                        </div>
                    </div>
                    <div class="absolute bottom-0 right-0 w-64 h-32 bg-primary-container/20 rounded-tl-full blur-3xl"></div>
                </div>
                <div class="stat-card bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col items-center justify-center text-center gap-2">
                    <div class="w-12 h-12 rounded-full bg-tertiary-container flex items-center justify-center text-primary">
                        <span class="material-symbols-outlined">groups</span>
                    </div>
                    <span class="text-3xl font-bold text-on-surface font-headline">${approved.length}</span>
                    <span class="text-xs text-on-surface-variant font-medium">พนักงานทั้งหมด</span>
                </div>
                <div class="stat-card bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col items-center justify-center text-center gap-2">
                    <div class="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-secondary">
                        <span class="material-symbols-outlined">pending_actions</span>
                    </div>
                    <span class="text-3xl font-bold text-on-surface font-headline">${pending.length}</span>
                    <span class="text-xs text-on-surface-variant font-medium">รอการอนุมัติ</span>
                </div>
            </section>

            <!-- Main Grid -->
            <section class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div class="lg:col-span-2 space-y-6">
                    <!-- Chart -->
                    <div class="flex justify-between items-end mb-2">
                        <div>
                            <h3 class="text-xl font-bold text-on-surface tracking-tight">ภาพรวมการทำงาน</h3>
                            <p class="text-sm text-on-surface-variant">สถิติการลงเวลา 7 วันล่าสุด</p>
                        </div>
                    </div>
                    <div class="bg-surface-container-low h-64 rounded-[1.5rem] relative overflow-hidden flex items-end px-8 pb-8 gap-4">
                        ${renderWeeklyChart(sessions)}
                        <div class="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent pointer-events-none"></div>
                    </div>

                    <!-- Staff List -->
                    <div class="bg-surface-container-lowest rounded-[1.5rem] p-8 shadow-sm">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-lg font-bold text-on-surface">รายชื่อพนักงาน</h3>
                            <span class="text-xs text-on-surface-variant">${approved.length} คน</span>
                        </div>
                        <div class="space-y-3">
                            ${approved.length === 0 ? '<p class="text-center text-on-surface-variant py-4">ยังไม่มีพนักงาน</p>' :
            approved.map(s => {
                const userSessions = sessions.filter(ss => ss.userId === s.id);
                const lastSession = userSessions[userSessions.length - 1];
                return `<div class="flex items-center justify-between p-3 hover:bg-surface-container-low rounded-xl transition-colors">
                                    <div class="flex items-center gap-4">
                                        <div class="w-10 h-10 rounded-full bg-primary-container/40 flex items-center justify-center font-bold text-primary text-sm">${getInitials(s.name)}</div>
                                        <div>
                                            <p class="font-bold text-sm text-on-surface">${s.name}</p>
                                            <p class="text-xs text-on-surface-variant">${ROLE_LABELS[s.role] || s.role} • ${s.email}</p>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-4">
                                        <div class="text-right">
                                            <p class="text-xs font-bold ${lastSession ? 'text-primary' : 'text-on-surface-variant'}">${lastSession ? fmtDuration(lastSession.duration || 0) + ' ล่าสุด' : 'ยังไม่มีข้อมูล'}</p>
                                            <p class="text-[10px] text-on-surface-variant">${userSessions.length} เซสชัน</p>
                                        </div>
                                        <span class="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                                    </div>
                                </div>`;
            }).join('')}
                        </div>
                    </div>
                </div>

                <!-- Registrations Sidebar -->
                <div class="space-y-6">
                    <div class="bg-surface-container-high rounded-[1.5rem] p-6">
                        <h3 class="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
                            <span class="material-symbols-outlined text-primary">person_add</span>
                            คำขอลงทะเบียน
                        </h3>
                        <div class="space-y-4" id="pendingList">
                            ${pending.length === 0 ? '<p class="text-center text-on-surface-variant py-4 text-sm">ไม่มีคำขอที่รอดำเนินการ</p>' :
            pending.map(p => `
                            <div class="reg-card bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-outline-variant/5">
                                <div class="flex gap-3 mb-3">
                                    <div class="w-10 h-10 rounded-lg bg-primary-container/30 flex items-center justify-center font-bold text-primary">${getInitials(p.name)}</div>
                                    <div>
                                        <p class="text-sm font-bold text-on-surface">${p.name}</p>
                                        <p class="text-[10px] text-on-surface-variant font-medium">${ROLE_LABELS[p.role] || p.role} • ${fmtDate(p.registeredAt)}</p>
                                    </div>
                                </div>
                                <p class="text-xs text-on-surface-variant mb-3">${p.email} • ${p.phone}</p>
                                <div class="flex gap-2">
                                    <button onclick="approveUser('${p.id}')" class="btn-press flex-1 py-2 text-xs font-bold bg-primary text-white rounded-lg hover:opacity-90 transition-opacity">อนุมัติ</button>
                                    <button onclick="rejectUser('${p.id}')" class="btn-press flex-1 py-2 text-xs font-bold text-error border border-error/20 rounded-lg hover:bg-error/5 transition-colors">ปฏิเสธ</button>
                                </div>
                            </div>`).join('')}
                        </div>
                    </div>

                    <!-- All Staff Sessions Today -->
                    <div class="bg-tertiary-container rounded-[1.5rem] p-6 relative overflow-hidden">
                        <div class="relative z-10">
                            <span class="text-[10px] font-bold text-on-tertiary-container/60 uppercase tracking-widest">สรุปวันนี้</span>
                            <p class="mt-2 text-sm text-on-tertiary-container font-medium leading-relaxed">
                                มีการลงเวลา <span class="text-primary font-bold">${todaySessions.length}</span> เซสชันในวันนี้
                                รวม <span class="text-primary font-bold">${fmtDuration(todaySessions.reduce((a, s) => a + (s.duration || 0), 0))}</span> ชั่วโมง
                            </p>
                        </div>
                        <span class="material-symbols-outlined absolute -bottom-4 -right-4 text-8xl text-primary/5">tips_and_updates</span>
                    </div>
                </div>
            </section>
        </div>
        ${renderFooter()}
    </main>`;
}

function renderWeeklyChart(sessions) {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const dayStr = d.toDateString();
        const dayHours = sessions.filter(s => new Date(s.clockIn).toDateString() === dayStr).reduce((a, s) => a + (s.duration || 0), 0);
        days.push({ label: d.toLocaleDateString('th-TH', { weekday: 'short' }), hours: dayHours / 3600000 });
    }
    const maxH = Math.max(...days.map(d => d.hours), 1);
    const colors = ['bg-primary/20', 'bg-primary/40', 'bg-primary/30', 'bg-primary/50', 'bg-primary/60', 'bg-primary/80', 'bg-[#4E6073]'];
    return days.map((d, i) => {
        const h = Math.max(d.hours / maxH * 100, 8);
        return `<div class="flex-1 flex flex-col items-center justify-end gap-2">
            <div class="${colors[i] || 'bg-primary/40'} rounded-t-lg w-full transition-all" style="height:${h}%"></div>
            <span class="text-[10px] text-on-surface-variant font-medium">${d.label}</span>
        </div>`;
    }).join('');
}

async function approveUser(userId) {
    const res = await AdminAPI.approveStaff(userId);
    if (!res.ok) { toast(res.error, 'error'); return; }
    toast('อนุมัติพนักงานสำเร็จ!', 'success');
    await router();
}

async function rejectUser(userId) {
    const res = await AdminAPI.rejectStaff(userId);
    if (!res.ok) { toast(res.error, 'error'); return; }
    toast('ปฏิเสธคำขอสำเร็จ!', 'success');
    await router();
}

// ══════════════════ TIMECLOCK PAGE (Staff) ══════════════════
async function renderTimeclock() {
    if (_timerInterval) { clearInterval(_timerInterval); _timerInterval = null; }
    const user = currentUser();
    const histRes = await ShiftsAPI.getHistory();
    const sessions = histRes.ok ? histRes.data.history : [];
    const activeRes = await ShiftsAPI.getActive();
    const active = activeRes.ok && activeRes.data.active ? activeRes.data.session : null;
    DB.setOne('activeSession', active);
    const todaySessions = sessions.filter(s => new Date(s.clockIn).toDateString() === new Date().toDateString());
    const todayTotal = todaySessions.reduce((a, s) => a + (s.duration || 0), 0);

    const app = document.getElementById('app');
    app.innerHTML = `${renderSidebar('timeclock')}
    <main class="main-with-sidebar flex-1 md:ml-64 flex flex-col min-h-screen">
        ${renderTopBar('ลงเวลางาน')}
        <section class="p-8 flex-1">
            <div class="max-w-4xl mx-auto">
                <div class="mb-10">
                    <span class="text-xs font-bold uppercase tracking-[0.2em] text-primary/60 mb-2 block">Timeclock</span>
                    <h1 class="text-4xl font-headline font-extrabold tracking-tighter text-primary">ลงเวลาเข้า-ออกงาน</h1>
                </div>

                <!-- Main Clock -->
                <div class="bg-surface-container-low rounded-[2rem] p-10 mb-8">
                    <div class="flex justify-between items-start mb-8">
                        <div>
                            <h3 class="text-xl font-headline font-bold text-primary">${active ? 'กำลังทำงานอยู่' : 'พร้อมเริ่มงาน'}</h3>
                            <p class="text-on-surface-variant text-sm">Overdoze Craft Coffee</p>
                        </div>
                        ${active ? `<div class="px-4 py-2 bg-primary-container/40 rounded-full">
                            <span class="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-primary pulse-dot"></span>
                                ${active.onBreak ? 'พักเบรก' : 'On Shift'}
                            </span>
                        </div>` : ''}
                    </div>

                    <div class="flex flex-col items-center py-10">
                        <div class="clock-circle ${active ? 'active' : ''} w-72 h-72 rounded-full border-[16px] ${active ? 'border-primary-container/50' : 'border-surface-container-high'} flex flex-col items-center justify-center bg-surface-container-lowest shadow-2xl shadow-primary/5">
                            <span id="timerDisplay" class="text-6xl font-headline font-extrabold tracking-tight text-primary ${active ? 'timer-active' : ''}">${active ? fmtDuration(Date.now() - new Date(active.clockIn).getTime() - (active.totalBreak || 0)) : '00:00'}</span>
                            <span class="text-xs font-bold text-outline-variant uppercase tracking-[0.3em] mt-3">ชั่วโมง : นาที</span>
                        </div>
                    </div>

                    <div class="grid ${active ? 'grid-cols-2' : 'grid-cols-1'} gap-4 max-w-md mx-auto">
                        ${active ? `
                            <button onclick="handleBreak()" class="btn-press bg-surface-container-lowest text-primary py-5 px-6 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-white shadow-sm text-lg">
                                <span class="material-symbols-outlined">${active.onBreak ? 'play_arrow' : 'coffee_maker'}</span> ${active.onBreak ? 'กลับเข้างาน' : 'พักเบรก'}
                            </button>
                            <button onclick="handleClockOut()" class="btn-press bg-primary text-on-primary py-5 px-6 rounded-2xl font-bold flex items-center justify-center gap-3 hover:opacity-90 shadow-lg shadow-primary/20 text-lg">
                                <span class="material-symbols-outlined">logout</span> ลงเวลาออก
                            </button>
                        ` : `
                            <button onclick="handleClockIn()" class="btn-press bg-gradient-to-br from-primary to-primary-dim text-on-primary py-6 px-6 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:shadow-xl transition-all">
                                <span class="material-symbols-outlined text-3xl">login</span> ลงเวลาเข้างาน
                            </button>
                        `}
                    </div>
                </div>

                <!-- Today Summary -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div class="stat-card bg-surface-container-lowest rounded-xl p-6 shadow-sm text-center">
                        <span class="material-symbols-outlined text-primary text-3xl mb-2">timer</span>
                        <p class="text-2xl font-bold font-headline text-primary">${fmtDuration(todayTotal)}</p>
                        <p class="text-xs text-on-surface-variant mt-1">ชั่วโมงวันนี้</p>
                    </div>
                    <div class="stat-card bg-surface-container-lowest rounded-xl p-6 shadow-sm text-center">
                        <span class="material-symbols-outlined text-primary text-3xl mb-2">event_available</span>
                        <p class="text-2xl font-bold font-headline text-primary">${todaySessions.length}</p>
                        <p class="text-xs text-on-surface-variant mt-1">เซสชันวันนี้</p>
                    </div>
                    <div class="stat-card bg-surface-container-lowest rounded-xl p-6 shadow-sm text-center">
                        <span class="material-symbols-outlined text-primary text-3xl mb-2">assessment</span>
                        <p class="text-2xl font-bold font-headline text-primary">${sessions.length}</p>
                        <p class="text-xs text-on-surface-variant mt-1">เซสชันทั้งหมด</p>
                    </div>
                </div>

                <!-- Today's Sessions -->
                <div class="bg-white rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10">
                    <div class="p-6 border-b border-surface-container-high">
                        <h3 class="text-lg font-bold text-on-surface">เซสชันวันนี้</h3>
                    </div>
                    ${todaySessions.length === 0 ? '<p class="p-8 text-center text-on-surface-variant">ยังไม่มีเซสชันวันนี้</p>' :
            todaySessions.reverse().map(s => `
                    <div class="grid grid-cols-3 gap-4 p-6 border-b border-surface-container-high last:border-0">
                        <div><span class="text-xs font-bold text-outline-variant uppercase tracking-widest block mb-1">เข้างาน</span><span class="font-semibold">${fmtTime(s.clockIn)}</span></div>
                        <div><span class="text-xs font-bold text-outline-variant uppercase tracking-widest block mb-1">ออกงาน</span><span class="font-semibold">${fmtTime(s.clockOut)}</span></div>
                        <div class="text-right"><span class="text-xs font-bold text-outline-variant uppercase tracking-widest block mb-1">ระยะเวลา</span><span class="font-semibold text-primary">${fmtDuration(s.duration || 0)}</span></div>
                    </div>`).join('')}
                </div>
            </div>
        </section>
        ${renderFooter()}
    </main>`;
    if (active) startTimer();
}

// ══════════════════ STAFF MANAGEMENT PAGE (Admin) ══════════════════
async function renderStaffManage() {
    const [staffRes, sessRes] = await Promise.all([AdminAPI.getStaff(), AdminAPI.getSessions()]);
    const users = staffRes.ok ? (staffRes.data.staff || staffRes.data.data || staffRes.data || []) : [];
    const sessions = sessRes.ok ? (sessRes.data.sessions || sessRes.data.data || sessRes.data || []) : [];
    const staff = users.filter(u => u.role !== 'admin');
    const pending = staff.filter(u => u.status === 'pending');
    const approved = staff.filter(u => u.status === 'approved');
    const rejected = staff.filter(u => u.status === 'rejected');

    const app = document.getElementById('app');
    app.innerHTML = `${renderSidebar('staff-manage')}
    <main class="main-with-sidebar flex-1 md:ml-64 flex flex-col min-h-screen">
        ${renderTopBar('จัดการพนักงาน')}
        <section class="p-8 flex-1">
            <div class="max-w-6xl mx-auto">
                <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <span class="text-xs font-bold uppercase tracking-[0.2em] text-primary/60 mb-2 block">Staff Management</span>
                        <h1 class="text-4xl font-headline font-extrabold tracking-tighter text-primary">จัดการพนักงาน</h1>
                    </div>
                    <div class="flex gap-3">
                        <div class="px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">${approved.length} อนุมัติแล้ว</div>
                        <div class="px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">${pending.length} รออนุมัติ</div>
                        <div class="px-4 py-2 rounded-full bg-red-100 text-red-700 text-xs font-bold">${rejected.length} ปฏิเสธ</div>
                    </div>
                </div>

                <!-- Pending Approvals -->
                ${pending.length > 0 ? `
                <div class="mb-8">
                    <h3 class="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
                        <span class="material-symbols-outlined text-amber-500">pending_actions</span>
                        คำขอลงทะเบียนที่รออนุมัติ (${pending.length})
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${pending.map(p => `
                        <div class="reg-card bg-white p-5 rounded-xl shadow-sm border border-outline-variant/10">
                            <div class="flex gap-3 mb-3">
                                <div class="w-11 h-11 rounded-lg bg-amber-100 flex items-center justify-center font-bold text-amber-700">${getInitials(p.name)}</div>
                                <div>
                                    <p class="font-bold text-on-surface">${p.name}</p>
                                    <p class="text-xs text-on-surface-variant">${ROLE_LABELS[p.role] || p.role}</p>
                                </div>
                            </div>
                            <div class="text-xs text-on-surface-variant space-y-1 mb-4">
                                <p><span class="material-symbols-outlined text-[14px] align-middle mr-1">mail</span>${p.email}</p>
                                <p><span class="material-symbols-outlined text-[14px] align-middle mr-1">phone</span>${p.phone}</p>
                                <p><span class="material-symbols-outlined text-[14px] align-middle mr-1">calendar_today</span>${fmtDate(p.registeredAt)}</p>
                            </div>
                            <div class="flex gap-2">
                                <button onclick="approveUser('${p.id}')" class="btn-press flex-1 py-2.5 text-xs font-bold bg-primary text-white rounded-lg hover:opacity-90">อนุมัติ</button>
                                <button onclick="rejectUser('${p.id}')" class="btn-press flex-1 py-2.5 text-xs font-bold text-error border border-error/20 rounded-lg hover:bg-error/5">ปฏิเสธ</button>
                            </div>
                        </div>`).join('')}
                    </div>
                </div>` : ''}

                <!-- All Staff Table -->
                <div class="bg-white rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden">
                    <div class="p-6 border-b border-surface-container-high flex justify-between items-center">
                        <h3 class="text-lg font-bold text-on-surface">รายชื่อพนักงานทั้งหมด</h3>
                        <span class="text-xs text-on-surface-variant">${staff.length} คน</span>
                    </div>
                    ${staff.length === 0 ? '<p class="p-8 text-center text-on-surface-variant">ยังไม่มีพนักงาน</p>' :
            `<div class="overflow-x-auto">
                        <table class="w-full">
                            <thead>
                                <tr class="bg-surface-container-low text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                                    <th class="text-left px-6 py-4">ชื่อ</th>
                                    <th class="text-left px-6 py-4">ตำแหน่ง</th>
                                    <th class="text-left px-6 py-4">อีเมล</th>
                                    <th class="text-left px-6 py-4">เบอร์โทร</th>
                                    <th class="text-center px-6 py-4">เซสชัน</th>
                                    <th class="text-center px-6 py-4">สถานะ</th>
                                    <th class="text-center px-6 py-4">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${staff.map(s => {
                const sc = sessions.filter(ss => ss.userId === s.id).length;
                const statusClass = s.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : s.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';
                const statusLabel = s.status === 'approved' ? 'อนุมัติ' : s.status === 'pending' ? 'รออนุมัติ' : 'ปฏิเสธ';
                return `<tr class="border-b border-surface-container-high hover:bg-surface-container-low/50 transition-colors">
                                        <td class="px-6 py-4">
                                            <div class="flex items-center gap-3">
                                                <div class="w-9 h-9 rounded-full bg-primary-container/40 flex items-center justify-center font-bold text-primary text-xs">${getInitials(s.name)}</div>
                                                <span class="font-semibold text-sm">${s.name}</span>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 text-sm">${ROLE_LABELS[s.role] || s.role}</td>
                                        <td class="px-6 py-4 text-sm text-on-surface-variant">${s.email}</td>
                                        <td class="px-6 py-4 text-sm text-on-surface-variant">${s.phone}</td>
                                        <td class="px-6 py-4 text-center text-sm font-bold">${sc}</td>
                                        <td class="px-6 py-4 text-center"><span class="px-3 py-1 rounded-full text-[10px] font-bold ${statusClass}">${statusLabel}</span></td>
                                        <td class="px-6 py-4 text-center">
                                            ${s.status === 'pending' ? `<button onclick="approveUser('${s.id}')" class="text-xs font-bold text-primary hover:underline mr-2">อนุมัติ</button><button onclick="rejectUser('${s.id}')" class="text-xs font-bold text-error hover:underline">ปฏิเสธ</button>` : `<button onclick="deleteUser('${s.id}')" class="text-xs font-bold text-error/60 hover:text-error transition-colors">ลบ</button>`}
                                        </td>
                                    </tr>`;
            }).join('')}
                            </tbody>
                        </table>
                    </div>`}
                </div>
            </div>
        </section>
        ${renderFooter()}
    </main>`;
}

async function deleteUser(userId) {
    if (!confirm('ต้องการลบพนักงานคนนี้ออกจากระบบ?')) return;
    const res = await apiFetch(`/admin/staff/${userId}`, { method: 'DELETE' });
    if (!res.ok) { toast(res.error, 'error'); return; }
    toast('ลบพนักงานเรียบร้อย', 'info');
    await router();
}

// ══════════════════ SCHEDULE PAGE (Both roles) ══════════════════
async function renderSchedule() {
    const user = currentUser();
    const isAdmin = user.role === 'admin';
    const [staffRes, sessRes] = isAdmin ?
        await Promise.all([AdminAPI.getStaff(), AdminAPI.getSessions()]) :
        await Promise.all([{ ok: true, data: [user] }, ShiftsAPI.getHistory()]);
    const users = staffRes.ok ? (staffRes.data.staff || staffRes.data.data || staffRes.data || []) : [user];
    const sessions = sessRes.ok ? (sessRes.data.history || sessRes.data.sessions || sessRes.data.data || sessRes.data || []) : [];
    const now = new Date();
    const weekDays = [];
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);

    for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        const dayStr = d.toDateString();
        const daySessions = sessions.filter(s => new Date(s.clockIn).toDateString() === dayStr);
        weekDays.push({
            date: d,
            label: d.toLocaleDateString('th-TH', { weekday: 'short' }),
            fullLabel: d.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'short' }),
            day: d.getDate(),
            isToday: d.toDateString() === now.toDateString(),
            sessions: daySessions
        });
    }

    const app = document.getElementById('app');
    app.innerHTML = `${renderSidebar('schedule')}
    <main class="main-with-sidebar flex-1 md:ml-64 flex flex-col min-h-screen">
        ${renderTopBar('ตารางงาน')}
        <section class="p-8 flex-1">
            <div class="max-w-6xl mx-auto">
                <div class="mb-10">
                    <span class="text-xs font-bold uppercase tracking-[0.2em] text-primary/60 mb-2 block">Schedule</span>
                    <h1 class="text-4xl font-headline font-extrabold tracking-tighter text-primary">ตารางงานประจำสัปดาห์</h1>
                    <p class="text-on-surface-variant mt-2">${startOfWeek.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })} — ${weekDays[6].date.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>

                <!-- Week Grid -->
                <div class="grid grid-cols-7 gap-3 mb-8">
                    ${weekDays.map(d => `
                    <div class="rounded-2xl p-4 text-center ${d.isToday ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-surface-container-lowest shadow-sm'} transition-all">
                        <p class="text-xs font-bold uppercase tracking-widest ${d.isToday ? 'text-on-primary/70' : 'text-on-surface-variant'}">${d.label}</p>
                        <p class="text-2xl font-headline font-extrabold mt-1 ${d.isToday ? '' : 'text-on-surface'}">${d.day}</p>
                        <div class="mt-3">
                            <span class="text-xs font-bold ${d.isToday ? 'text-on-primary/80' : 'text-primary'}">${d.sessions.length} เซสชัน</span>
                        </div>
                    </div>`).join('')}
                </div>

                <!-- Daily Detail -->
                ${weekDays.filter(d => d.sessions.length > 0).map(d => `
                <div class="bg-white rounded-2xl shadow-sm border border-outline-variant/10 mb-4 overflow-hidden">
                    <div class="p-5 border-b border-surface-container-high flex justify-between items-center ${d.isToday ? 'bg-primary-container/20' : ''}">
                        <h3 class="font-bold text-on-surface flex items-center gap-2">
                            ${d.isToday ? '<span class="w-2 h-2 rounded-full bg-primary pulse-dot"></span>' : ''}
                            ${d.fullLabel}
                        </h3>
                        <span class="text-xs text-on-surface-variant font-medium">${d.sessions.length} เซสชัน • ${fmtDuration(d.sessions.reduce((a, s) => a + (s.duration || 0), 0))}</span>
                    </div>
                    ${d.sessions.map(s => {
        const staffUser = users.find(u => u.id === s.userId);
        return `<div class="flex items-center justify-between p-4 border-b border-surface-container-high/50 last:border-0 hover:bg-surface-container-low/30 transition-colors">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-primary-container/30 flex items-center justify-center text-primary text-xs font-bold">${staffUser ? getInitials(staffUser.name) : '??'}</div>
                                <div>
                                    <p class="font-semibold text-sm">${staffUser ? staffUser.name : 'ไม่ทราบ'}</p>
                                    <p class="text-xs text-on-surface-variant">${staffUser ? (ROLE_LABELS[staffUser.role] || staffUser.role) : ''}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-6">
                                <span class="text-sm">${fmtTime(s.clockIn)} — ${fmtTime(s.clockOut)}</span>
                                <span class="text-sm font-bold text-primary">${fmtDuration(s.duration || 0)}</span>
                            </div>
                        </div>`;
    }).join('')}
                </div>`).join('')}

                ${weekDays.every(d => d.sessions.length === 0) ? `
                <div class="bg-surface-container-low rounded-2xl p-12 text-center">
                    <span class="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4">calendar_month</span>
                    <p class="text-on-surface-variant text-lg">ยังไม่มีข้อมูลการทำงานในสัปดาห์นี้</p>
                    <p class="text-on-surface-variant/60 text-sm mt-2">ข้อมูลจะแสดงเมื่อมีการลงเวลาเข้า-ออกงาน</p>
                </div>` : ''}
            </div>
        </section>
        ${renderFooter()}
    </main>`;
}

// ══════════════════ SETTINGS PAGE (Both roles) ══════════════════
async function renderSettings() {
    const user = currentUser();
    const histRes = await ShiftsAPI.getHistory();
    const sessions = histRes.ok ? (histRes.data.history || histRes.data.data || histRes.data || []) : [];
    const totalHours = sessions.reduce((a, s) => a + (s.duration || 0), 0);

    const app = document.getElementById('app');
    app.innerHTML = `${renderSidebar('settings')}
    <main class="main-with-sidebar flex-1 md:ml-64 flex flex-col min-h-screen">
        ${renderTopBar('ตั้งค่า')}
        <section class="p-8 flex-1">
            <div class="max-w-3xl mx-auto">
                <div class="mb-10">
                    <span class="text-xs font-bold uppercase tracking-[0.2em] text-primary/60 mb-2 block">Settings</span>
                    <h1 class="text-4xl font-headline font-extrabold tracking-tighter text-primary">ตั้งค่าโปรไฟล์</h1>
                </div>

                <!-- Profile Card -->
                <div class="bg-white rounded-2xl shadow-sm border border-outline-variant/10 p-8 mb-6">
                    <div class="flex items-center gap-6 mb-8">
                        <div class="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold text-2xl font-headline">${getInitials(user.name)}</div>
                        <div>
                            <h2 class="text-2xl font-bold font-headline text-on-surface">${user.name}</h2>
                            <p class="text-on-surface-variant">${ROLE_LABELS[user.role] || user.role}</p>
                            <p class="text-xs text-on-surface-variant/60 mt-1">เข้าร่วมเมื่อ ${fmtDate(user.registeredAt)}</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <label class="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">ชื่อ-นามสกุล</label>
                            <input id="settingName" class="w-full bg-surface-container-high border-none rounded-xl px-5 py-4 text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all" value="${user.name}"/>
                        </div>
                        <div class="space-y-2">
                            <label class="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">อีเมล</label>
                            <input class="w-full bg-surface-container-high border-none rounded-xl px-5 py-4 text-on-surface/50 cursor-not-allowed" value="${user.email}" disabled/>
                        </div>
                        <div class="space-y-2">
                            <label class="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">เบอร์โทร</label>
                            <input id="settingPhone" class="w-full bg-surface-container-high border-none rounded-xl px-5 py-4 text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all" value="${user.phone || ''}"/>
                        </div>
                        <div class="space-y-2">
                            <label class="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">ตำแหน่ง</label>
                            <input class="w-full bg-surface-container-high border-none rounded-xl px-5 py-4 text-on-surface/50 cursor-not-allowed" value="${ROLE_LABELS[user.role] || user.role}" disabled/>
                        </div>
                    </div>

                    <div class="mt-8 flex gap-4">
                        <button onclick="saveSettings()" class="btn-press bg-gradient-to-br from-primary to-primary-dim text-on-primary font-bold py-3 px-8 rounded-xl shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all">
                            บันทึกการเปลี่ยนแปลง
                        </button>
                    </div>
                </div>

                <!-- Stats Card -->
                <div class="bg-surface-container-low rounded-2xl p-8 mb-6">
                    <h3 class="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary">bar_chart</span>
                        สถิติการทำงาน
                    </h3>
                    <div class="grid grid-cols-3 gap-6">
                        <div class="text-center">
                            <p class="text-3xl font-bold font-headline text-primary">${sessions.length}</p>
                            <p class="text-xs text-on-surface-variant mt-1">เซสชันทั้งหมด</p>
                        </div>
                        <div class="text-center">
                            <p class="text-3xl font-bold font-headline text-primary">${fmtDuration(totalHours)}</p>
                            <p class="text-xs text-on-surface-variant mt-1">ชั่วโมงรวม</p>
                        </div>
                        <div class="text-center">
                            <p class="text-3xl font-bold font-headline text-primary">${sessions.length > 0 ? fmtDuration(totalHours / sessions.length) : '00:00'}</p>
                            <p class="text-xs text-on-surface-variant mt-1">เฉลี่ย/เซสชัน</p>
                        </div>
                    </div>
                </div>

                <!-- Change Password -->
                <div class="bg-white rounded-2xl shadow-sm border border-outline-variant/10 p-8 mb-6">
                    <h3 class="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary">lock</span>
                        เปลี่ยนรหัสผ่าน
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="space-y-2">
                            <label class="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">รหัสผ่านปัจจุบัน</label>
                            <input id="oldPw" class="w-full bg-surface-container-high border-none rounded-xl px-5 py-4 text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all" type="password" placeholder="••••••••"/>
                        </div>
                        <div class="space-y-2">
                            <label class="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">รหัสผ่านใหม่</label>
                            <input id="newPw" class="w-full bg-surface-container-high border-none rounded-xl px-5 py-4 text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all" type="password" placeholder="••••••••"/>
                        </div>
                        <div class="space-y-2">
                            <label class="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">ยืนยันรหัสผ่านใหม่</label>
                            <input id="newPw2" class="w-full bg-surface-container-high border-none rounded-xl px-5 py-4 text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all" type="password" placeholder="••••••••"/>
                        </div>
                    </div>
                    <div class="mt-6">
                        <button onclick="changePassword()" class="btn-press bg-surface-container-highest text-on-surface font-bold py-3 px-8 rounded-xl hover:bg-surface-container-high transition-all">
                            อัปเดตรหัสผ่าน
                        </button>
                    </div>
                </div>

                <!-- Danger Zone -->
                <div class="bg-white rounded-2xl shadow-sm border border-error/10 p-8">
                    <h3 class="text-lg font-bold text-error mb-4 flex items-center gap-2">
                        <span class="material-symbols-outlined">warning</span>
                        Danger Zone
                    </h3>
                    <p class="text-sm text-on-surface-variant mb-4">ล้างข้อมูล localStorage ทั้งหมด (ใช้สำหรับ reset ระบบ)</p>
                    <button onclick="resetAll()" class="btn-press bg-error/10 text-error font-bold py-3 px-8 rounded-xl hover:bg-error/20 transition-all">
                        ล้างข้อมูลทั้งหมด
                    </button>
                </div>
            </div>
        </section>
        ${renderFooter()}
    </main>`;
}

async function saveSettings() {
    const user = currentUser();
    const name = document.getElementById('settingName').value.trim();
    const phone = document.getElementById('settingPhone').value.trim();

    // Fallback if backend API doesn't exist for this
    const res = await apiFetch(`/auth/profile`, { method: 'PUT', body: JSON.stringify({ name, phone }) });
    if (res.ok) {
        user.name = name || user.name;
        user.phone = phone || user.phone;
        DB.setOne('currentUser', user);
        toast('บันทึกโปรไฟล์เรียบร้อย!', 'success');
    } else {
        toast(res.error || 'Server missing /auth/profile endpoint', 'error');
    }
    await router();
}

async function changePassword() {
    const oldPw = document.getElementById('oldPw').value;
    const newPw = document.getElementById('newPw').value;
    const newPw2 = document.getElementById('newPw2').value;
    if (newPw.length < 4) { toast('รหัสผ่านใหม่ต้องมีอย่างน้อย 4 ตัวอักษร', 'error'); return; }
    if (newPw !== newPw2) { toast('รหัสผ่านใหม่ไม่ตรงกัน', 'error'); return; }

    const res = await apiFetch(`/auth/password`, { method: 'PUT', body: JSON.stringify({ currentPassword: oldPw, newPassword: newPw }) });
    if (res.ok) {
        toast('เปลี่ยนรหัสผ่านเรียบร้อย!', 'success');
    } else {
        toast(res.error || 'Server missing /auth/password endpoint', 'error');
    }
    await router();
}

function resetAll() {
    if (!confirm('ต้องการล้างข้อมูลทั้งหมดจริงหรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้')) return;
    localStorage.clear();
    toast('ล้างข้อมูลเรียบร้อย กำลัง redirect...', 'info');
    setTimeout(() => { seedData(); navigate('login'); }, 1000);
}
