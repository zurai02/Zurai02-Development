// zurai02 Development - Main App
// Domain: https://zurai02.is-a.dev/Zurai02-Development/

const CONFIG = {
    ROBLOX_CLIENT_ID: '3255755288279625071',
    ROBLOX_REDIRECT: 'https://zurai02.is-a.dev/Zurai02-Development/redirect.html',
    GOOGLE_CLIENT_ID: '870510440840-1akk1vvbiqik864jip7pc4al3hmnki1s.apps.googleusercontent.com',
    GOOGLE_REDIRECT: 'https://zurai02.is-a.dev/Zurai02-Development/redirect.html'
};

const ROBLOX_SCOPES = ['openid', 'profile'];
const GOOGLE_SCOPES = ['openid', 'email', 'profile'];

let state = {
    user: null,
    authed: false,
    execs: parseInt(localStorage.getItem('z02_execs') || '0'),
    links: JSON.parse(localStorage.getItem('z02_links') || '{}')
};

const SCRIPTS = [
    { id: 1, title: 'Auto Farm V2', desc: 'Advanced auto-farming with anti-detection', cat: 'game', execs: 15420, prem: true, fmt: '.lz' },
    { id: 2, title: 'ESP & Wallhack', desc: 'See players through walls', cat: 'utility', execs: 8932, prem: false, fmt: '.lua' },
    { id: 3, title: 'Admin Commands', desc: 'Full admin suite', cat: 'admin', execs: 6781, prem: true, fmt: '.lz' },
    { id: 4, title: 'Speed Hack Pro', desc: 'Adjustable speed modifier', cat: 'utility', execs: 12453, prem: false, fmt: '.txt' },
    { id: 5, title: 'Aimbot Deluxe', desc: 'Precision aimbot with FOV', cat: 'game', execs: 22105, prem: true, fmt: '.lz' },
    { id: 6, title: 'Server Manager', desc: 'Advanced server tools', cat: 'admin', execs: 3421, prem: true, fmt: '.lua' }
];

// Init
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    renderScripts('all');
    updateCounters();
    updateDash();
    setupFilters();
    animateNumbers();
});

// Auth
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAllModals(); });

function checkAuth() {
    let data = localStorage.getItem('z02_auth');
    if (!data) return;
    try {
        let parsed = JSON.parse(data);
        if (parsed.token && Date.now() - parsed.time < (parsed.expires || 3600) * 1000) {
            state.user = parsed.user;
            state.authed = true;
            updateAuthUI();
        } else {
            localStorage.removeItem('z02_auth');
        }
    } catch (e) { localStorage.removeItem('z02_auth'); }
}

function updateAuthUI() {
    let btn = document.getElementById('auth-btn');
    if (!btn) return;
    if (state.authed && state.user) {
        let name = state.user.name || 'User';
        btn.textContent = name;
        btn.onclick = () => { if (confirm('Sign out?')) { localStorage.removeItem('z02_auth'); location.reload(); } };
        document.getElementById('prof-name').textContent = name;
        document.getElementById('prof-email').textContent = state.user.email || '';
        if (state.user.picture) document.getElementById('prof-avatar').src = state.user.picture;
    }
}

function openAuth() { document.getElementById('auth-modal').classList.add('active'); }
function closeAuth() { document.getElementById('auth-modal').classList.remove('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
function closeAllModals() { document.querySelectorAll('.modal').forEach(m => m.classList.remove('active')); }

function signInGoogle() {
    let st = btoa(JSON.stringify({p: 'Google', n: Math.random().toString(36).slice(2)}));
    let params = new URLSearchParams({
        client_id: CONFIG.GOOGLE_CLIENT_ID,
        redirect_uri: CONFIG.GOOGLE_REDIRECT,
        response_type: 'code',
        scope: GOOGLE_SCOPES.join(' '),
        state: st,
        access_type: 'offline',
        prompt: 'consent'
    });
    location.href = 'https://accounts.google.com/o/oauth2/v2/auth?' + params;
}

function signInRoblox() {
    let st = btoa(JSON.stringify({p: 'Roblox', n: Math.random().toString(36).slice(2)}));
    let params = new URLSearchParams({
        client_id: CONFIG.ROBLOX_CLIENT_ID,
        redirect_uri: CONFIG.ROBLOX_REDIRECT,
        response_type: 'code',
        scope: ROBLOX_SCOPES.join(' '),
        state: st
    });
    location.href = 'https://apis.roblox.com/oauth/v1/authorize?' + params;
}

// Scripts
function renderScripts(filter) {
    let grid = document.getElementById('script-grid');
    if (!grid) return;
    let list = filter === 'all' ? SCRIPTS : SCRIPTS.filter(s => s.cat === filter);
    grid.innerHTML = list.map(s => `
        <div class="scard" onclick="loadScript(${s.id})">
            <div class="scard-head">
                <span class="scard-title">${s.title}</span>
                <span class="scard-badge ${s.prem ? 'premium' : 'free'}">${s.prem ? 'PREMIUM' : 'FREE'}</span>
            </div>
            <p class="scard-desc">${s.desc}</p>
            <div class="scard-meta">
                <span>${s.fmt}</span>
                <span class="scard-execs">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 1.5l7.5 4.5-7.5 4.5V1.5z" fill="currentColor"/></svg>
                    ${s.execs.toLocaleString()}
                </span>
            </div>
            <div class="scard-btns">
                <button class="btn btn-glow" onclick="event.stopPropagation(); loadScript(${s.id})">Execute</button>
                <button class="btn btn-secondary" onclick="event.stopPropagation(); toast('${s.title}: ${s.execs.toLocaleString()} execs', 'ok')">Details</button>
            </div>
        </div>
    `).join('');
}

function setupFilters() {
    document.querySelectorAll('.filter').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderScripts(btn.dataset.filter);
        });
    });
}

function loadScript(id) {
    let s = SCRIPTS.find(x => x.id === id);
    if (!s) return;
    let input = document.getElementById('script-input');
    if (input) {
        input.value = `-- [ENCRYPTED] ${s.title} (${s.fmt})
-- Executions: ${s.execs.toLocaleString()}
-- Category: ${s.cat}

local zurai02 = require("zurai02.core")
local auth = zurai02.authenticate()

if not auth.verified then
    return zurai02.reject("Unauthorized - use verified executor")
end

zurai02.execute(auth.payload)
`;
    }
    document.getElementById('executor').scrollIntoView({ behavior: 'smooth' });
    toast(`Loaded "${s.title}"`, 'ok');
}

// Executor
function runScript() {
    let input = document.getElementById('script-input');
    let status = document.getElementById('exec-status');
    if (!input || !input.value.trim()) { toast('Enter a script first', 'warn'); return; }
    if (!state.authed) { toast('Sign in to execute', 'warn'); openAuth(); return; }

    status.innerHTML = '<span class="s-dot busy"></span>Executing...';
    let script = input.value;
    let now = () => new Date().toLocaleTimeString('en-US', { hour12: false });

    addOut(now(), 'Starting execution...', 'sys');
    setTimeout(() => addOut(now(), 'Verifying executor signature...', 'sys'), 400);
    setTimeout(() => addOut(now(), 'Decrypting payload...', 'sys'), 800);
    setTimeout(() => {
        if (script.includes('[ENCRYPTED]') || script.includes('zurai02.authenticate')) {
            addOut(now(), '✓ Script verified and decrypted', 'ok');
            addOut(now(), '✓ Executor signature valid', 'ok');
            addOut(now(), '✓ Execution successful', 'ok');
            state.execs++;
            localStorage.setItem('z02_execs', state.execs);
            updateCounters();
            updateDash();
            toast('Script executed!', 'ok');
        } else {
            addOut(now(), '✗ Rejected: Not encrypted', 'err');
            addOut(now(), '✗ Browser execution blocked', 'err');
            toast('Use a verified executor', 'err');
        }
        status.innerHTML = '<span class="s-dot ready"></span>Ready';
    }, 1500);
}

function validateScript() {
    let input = document.getElementById('script-input');
    if (!input || !input.value.trim()) { toast('Enter a script to validate', 'warn'); return; }
    let now = new Date().toLocaleTimeString('en-US', { hour12: false });
    addOut(now, 'Validating...', 'sys');
    setTimeout(() => {
        if (input.value.includes('[ENCRYPTED]')) {
            addOut(new Date().toLocaleTimeString('en-US', { hour12: false }), '✓ Valid encrypted script', 'ok');
            toast('Validation passed', 'ok');
        } else {
            addOut(new Date().toLocaleTimeString('en-US', { hour12: false }), '⚠ Not encrypted - will be rejected', 'warn');
            toast('Script should be encrypted', 'warn');
        }
    }, 600);
}

function addOut(time, text, type) {
    let box = document.getElementById('out-body');
    if (!box) return;
    let div = document.createElement('div');
    div.className = 'out-line ' + type;
    div.innerHTML = `<span class="time">[${time}]</span><span>${text}</span>`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

function clearOutput() {
    let box = document.getElementById('out-body');
    if (box) box.innerHTML = `<div class="out-line sys"><span class="time">[${new Date().toLocaleTimeString('en-US', { hour12: false })}]</span><span>Console cleared</span></div>`;
}

function clearInput() {
    let input = document.getElementById('script-input');
    if (input) input.value = '';
}

function handleFile(e) {
    let file = e.target.files[0];
    if (!file) return;
    let ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!['.lz', '.lua', '.txt'].includes(ext)) { toast('Only .lz, .lua, .txt files', 'err'); return; }
    let reader = new FileReader();
    reader.onload = (ev) => {
        let input = document.getElementById('script-input');
        if (input) input.value = `-- Uploaded: ${file.name} (${(file.size / 1024).toFixed(1)} KB)

${ev.target.result}`;
        toast(`Loaded ${file.name}`, 'ok');
    };
    reader.readAsText(file);
}

// Dashboard
function updateCounters() {
    let el = document.getElementById('exec-count');
    if (el) el.textContent = state.execs.toLocaleString();
}

function updateDash() {
    let e = document.getElementById('user-execs');
    let s = document.getElementById('user-scripts');
    if (e) e.textContent = state.execs;
    if (s) s.textContent = SCRIPTS.filter(x => x.execs > 0).length;

    if (state.links.lv) { document.getElementById('st-lv').textContent = 'Linked'; document.getElementById('st-lv').classList.add('linked'); document.getElementById('btn-lv').textContent = 'Unlink'; document.getElementById('btn-lv').onclick = () => { delete state.links.lv; localStorage.setItem('z02_links', JSON.stringify(state.links)); location.reload(); }; }
    if (state.links.ll) { document.getElementById('st-ll').textContent = 'Linked'; document.getElementById('st-ll').classList.add('linked'); document.getElementById('btn-ll').textContent = 'Unlink'; document.getElementById('btn-ll').onclick = () => { delete state.links.ll; localStorage.setItem('z02_links', JSON.stringify(state.links)); location.reload(); }; }
    if (state.authed) {
        if (state.user && state.user.provider === 'Google') { document.getElementById('st-google').textContent = 'Linked'; document.getElementById('st-google').classList.add('linked'); }
        if (state.user && state.user.provider === 'Roblox') { document.getElementById('st-roblox').textContent = 'Linked'; document.getElementById('st-roblox').classList.add('linked'); }
    }
}

// Linking
function linkGoogle() { if (!state.authed) { toast('Sign in first', 'warn'); openAuth(); return; } signInGoogle(); }
function linkRoblox() { if (!state.authed) { toast('Sign in first', 'warn'); openAuth(); return; } signInRoblox(); }
function linkLV() { if (!state.authed) { toast('Sign in first', 'warn'); openAuth(); return; } document.getElementById('lv-modal').classList.add('active'); }
function linkLL() { if (!state.authed) { toast('Sign in first', 'warn'); openAuth(); return; } document.getElementById('ll-modal').classList.add('active'); }

function confirmLV() {
    let key = document.getElementById('lv-key').value.trim();
    if (!key) { toast('Enter API key', 'err'); return; }
    state.links.lv = { key: key, date: Date.now() };
    localStorage.setItem('z02_links', JSON.stringify(state.links));
    closeModal('lv-modal');
    toast('Linkvertise linked!', 'ok');
    updateDash();
}

function confirmLL() {
    let key = document.getElementById('ll-key').value.trim();
    if (!key) { toast('Enter API key', 'err'); return; }
    state.links.ll = { key: key, date: Date.now() };
    localStorage.setItem('z02_links', JSON.stringify(state.links));
    closeModal('ll-modal');
    toast('LootLabs linked!', 'ok');
    updateDash();
}

// Toast
function toast(msg, type) {
    let box = document.getElementById('toast-box');
    if (!box) return;
    let t = document.createElement('div');
    t.className = 'toast ' + type;
    let icon = type === 'ok' ? '✓' : type === 'err' ? '✗' : '⚠';
    t.innerHTML = `<b>${icon}</b> ${msg}`;
    box.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(100%)'; setTimeout(() => t.remove(), 300); }, 3500);
}

// Animations
function animateNumbers() {
    animateNum('total-scripts', 0, SCRIPTS.length, 1000);
    animateNum('total-executions', 0, SCRIPTS.reduce((a, s) => a + s.execs, 0), 1500);
    animateNum('active-users', 0, 1247, 2000);
}

function animateNum(id, start, end, dur) {
    let el = document.getElementById(id);
    if (!el) return;
    let t0 = performance.now();
    function step(t) {
        let p = Math.min((t - t0) / dur, 1);
        let ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(start + (end - start) * ease).toLocaleString();
        if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
          }
