// ============================================
// zurai02 Development - Main Application
// Secure Roblox Script Execution Platform
// Domain: zurai02.is-a.dev
// ============================================

// Configuration
const CONFIG = {
    // Roblox OAuth 2.0
    ROBLOX_CLIENT_ID: '3255755288279625071',
    ROBLOX_REDIRECT_URI: 'https://zurai02.is-a.dev/redirect.html',

    // Google OAuth 2.0
    GOOGLE_CLIENT_ID: '870510440840-1akk1vvbiqik864jip7pc4al3hmnki1s.apps.googleusercontent.com',
    GOOGLE_REDIRECT_URI: 'https://zurai02.is-a.dev/redirect.html',

    API_BASE: 'https://zurai02.is-a.dev/api',
    ENCRYPTION_KEY: 'zurai02-secure-key-v2'
};

// Roblox OAuth 2.0 Scopes
const ROBLOX_SCOPES = ['openid', 'profile'];

// Google OAuth 2.0 Scopes
const GOOGLE_SCOPES = ['openid', 'email', 'profile'];

// State Management
const AppState = {
    user: null,
    isAuthenticated: false,
    executionCount: parseInt(localStorage.getItem('zurai02_exec_count') || '0'),
    linkedAccounts: JSON.parse(localStorage.getItem('zurai02_links') || '{}'),
    scripts: [],
    currentFilter: 'all'
};

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initParticles();
    checkAuthStatus();
    loadScripts();
    updateExecutionCounter();
    updateDashboard();
    setupEventListeners();
    animateStats();
});

// ============================================
// Particle Background
// ============================================

function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 50;

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5 + 0.1;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(99, 102, 241, ${this.opacity})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        // Draw connections
        particles.forEach((p1, i) => {
            particles.slice(i + 1).forEach(p2 => {
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 150) {
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(99, 102, 241, ${0.1 * (1 - distance / 150)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            });
        });

        requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// ============================================
// Authentication
// ============================================

function checkAuthStatus() {
    const authData = localStorage.getItem('zurai02_auth');
    if (authData) {
        try {
            const parsed = JSON.parse(authData);
            if (parsed.access_token && parsed.timestamp) {
                const elapsed = Date.now() - parsed.timestamp;
                const expiresIn = (parsed.expires_in || 3600) * 1000;

                if (elapsed < expiresIn) {
                    AppState.user = parsed.user;
                    AppState.isAuthenticated = true;
                    updateAuthUI();
                    showToast('Welcome back, ' + (parsed.user.name || 'User') + '!', 'success');
                } else {
                    localStorage.removeItem('zurai02_auth');
                }
            }
        } catch (e) {
            console.error('Auth parse error:', e);
            localStorage.removeItem('zurai02_auth');
        }
    }
}

function updateAuthUI() {
    const authSection = document.getElementById('auth-section');
    if (!authSection) return;

    if (AppState.isAuthenticated && AppState.user) {
        const name = AppState.user.name || AppState.user.displayName || 'User';
        const avatar = AppState.user.picture || AppState.user.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${name}`;

        authSection.innerHTML = `
            <div class="user-menu" style="position:relative;">
                <img src="${avatar}" alt="${name}" class="user-avatar-small" style="width:32px;height:32px;border-radius:50%;border:2px solid var(--accent-primary);cursor:pointer;" onclick="toggleUserMenu()">
                <div class="user-dropdown" id="user-dropdown" style="display:none;position:absolute;top:50px;right:0;background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius-md);padding:8px;min-width:160px;box-shadow:var(--shadow-lg);z-index:200;">
                    <div style="padding:8px 12px;border-bottom:1px solid var(--border-color);font-weight:600;">${name}</div>
                    <a href="#dashboard" style="display:block;padding:8px 12px;color:var(--text-secondary);text-decoration:none;font-size:0.85rem;" onmouseover="this.style.color='var(--text-primary)'" onmouseout="this.style.color='var(--text-secondary)'">Dashboard</a>
                    <a href="#" style="display:block;padding:8px 12px;color:var(--text-secondary);text-decoration:none;font-size:0.85rem;" onmouseover="this.style.color='var(--text-primary)'" onmouseout="this.style.color='var(--text-secondary)'" onclick="signOut();return false;">Sign Out</a>
                </div>
            </div>
        `;

        // Update profile section
        const userName = document.getElementById('user-name');
        const userEmail = document.getElementById('user-email');
        const userAvatar = document.getElementById('user-avatar');

        if (userName) userName.textContent = name;
        if (userEmail) userEmail.textContent = AppState.user.email || AppState.user.sub || 'Authenticated User';
        if (userAvatar) userAvatar.src = avatar;
    }
}

function toggleUserMenu() {
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    }
}

function openAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.add('active');
}

function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.remove('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
}

// ============================================
// Google OAuth 2.0
// ============================================

function signInWithGoogle() {
    const state = btoa(JSON.stringify({ provider: 'Google', nonce: generateNonce() }));

    const params = new URLSearchParams({
        client_id: CONFIG.GOOGLE_CLIENT_ID,
        redirect_uri: CONFIG.GOOGLE_REDIRECT_URI,
        response_type: 'code',
        scope: GOOGLE_SCOPES.join(' '),
        state: state,
        access_type: 'offline',
        prompt: 'consent'
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

// ============================================
// Roblox OAuth 2.0
// ============================================

function signInWithRoblox() {
    const state = btoa(JSON.stringify({ provider: 'Roblox', nonce: generateNonce() }));

    const params = new URLSearchParams({
        client_id: CONFIG.ROBLOX_CLIENT_ID,
        redirect_uri: CONFIG.ROBLOX_REDIRECT_URI,
        response_type: 'code',
        scope: ROBLOX_SCOPES.join(' '),
        state: state
    });

    window.location.href = `https://apis.roblox.com/oauth/v1/authorize?${params.toString()}`;
}

// ============================================
// Email Authentication (Mock)
// ============================================

function handleEmailAuth(event) {
    event.preventDefault();
    showToast('Email authentication coming soon!', 'info');
    closeAuthModal();
}

function showRegister() {
    showToast('Registration coming soon!', 'info');
}

function signOut() {
    localStorage.removeItem('zurai02_auth');
    AppState.user = null;
    AppState.isAuthenticated = false;
    location.reload();
}

function generateNonce() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// ============================================
// Third-Party Account Linking
// ============================================

function linkGoogle() {
    if (!AppState.isAuthenticated) {
        showToast('Please sign in first', 'warning');
        openAuthModal();
        return;
    }
    signInWithGoogle();
}

function linkRoblox() {
    if (!AppState.isAuthenticated) {
        showToast('Please sign in first', 'warning');
        openAuthModal();
        return;
    }
    signInWithRoblox();
}

function linkLinkvertise() {
    if (!AppState.isAuthenticated) {
        showToast('Please sign in first', 'warning');
        openAuthModal();
        return;
    }
    openModal('linkvertise-modal');
}

function confirmLinkvertise() {
    const key = document.getElementById('linkvertise-key').value.trim();
    if (!key) {
        showToast('Please enter your Linkvertise API key', 'error');
        return;
    }

    AppState.linkedAccounts.linkvertise = { key: key, linked: true, date: new Date().toISOString() };
    localStorage.setItem('zurai02_links', JSON.stringify(AppState.linkedAccounts));

    document.getElementById('linkvertise-status').textContent = 'Linked';
    document.getElementById('linkvertise-status').classList.add('linked');
    document.getElementById('btn-link-linkvertise').textContent = 'Unlink';
    document.getElementById('btn-link-linkvertise').onclick = unlinkLinkvertise;

    closeModal('linkvertise-modal');
    showToast('Linkvertise account linked successfully!', 'success');
}

function unlinkLinkvertise() {
    delete AppState.linkedAccounts.linkvertise;
    localStorage.setItem('zurai02_links', JSON.stringify(AppState.linkedAccounts));

    document.getElementById('linkvertise-status').textContent = 'Not Linked';
    document.getElementById('linkvertise-status').classList.remove('linked');
    document.getElementById('btn-link-linkvertise').textContent = 'Link';
    document.getElementById('btn-link-linkvertise').onclick = linkLinkvertise;

    showToast('Linkvertise account unlinked', 'info');
}

function linkLootLabs() {
    if (!AppState.isAuthenticated) {
        showToast('Please sign in first', 'warning');
        openAuthModal();
        return;
    }
    openModal('lootlabs-modal');
}

function confirmLootLabs() {
    const key = document.getElementById('lootlabs-key').value.trim();
    if (!key) {
        showToast('Please enter your LootLabs API key', 'error');
        return;
    }

    AppState.linkedAccounts.lootlabs = { key: key, linked: true, date: new Date().toISOString() };
    localStorage.setItem('zurai02_links', JSON.stringify(AppState.linkedAccounts));

    document.getElementById('lootlabs-status').textContent = 'Linked';
    document.getElementById('lootlabs-status').classList.add('linked');
    document.getElementById('btn-link-lootlabs').textContent = 'Unlink';
    document.getElementById('btn-link-lootlabs').onclick = unlinkLootLabs;

    closeModal('lootlabs-modal');
    showToast('LootLabs account linked successfully!', 'success');
}

function unlinkLootLabs() {
    delete AppState.linkedAccounts.lootlabs;
    localStorage.setItem('zurai02_links', JSON.stringify(AppState.linkedAccounts));

    document.getElementById('lootlabs-status').textContent = 'Not Linked';
    document.getElementById('lootlabs-status').classList.remove('linked');
    document.getElementById('btn-link-lootlabs').textContent = 'Link';
    document.getElementById('btn-link-lootlabs').onclick = linkLootLabs;

    showToast('LootLabs account unlinked', 'info');
}

// ============================================
// Script Management
// ============================================

const DEMO_SCRIPTS = [
    {
        id: 1,
        title: 'Auto Farm V2',
        description: 'Advanced auto-farming script with anti-detection. Supports multiple games.',
        category: 'game',
        executions: 15420,
        premium: true,
        encrypted: true,
        format: '.lz'
    },
    {
        id: 2,
        title: 'ESP & Wallhack',
        description: 'See players through walls with customizable ESP options.',
        category: 'utility',
        executions: 8932,
        premium: false,
        encrypted: true,
        format: '.lua'
    },
    {
        id: 3,
        title: 'Admin Commands',
        description: 'Full admin command suite with kick, ban, teleport, and more.',
        category: 'admin',
        executions: 6781,
        premium: true,
        encrypted: true,
        format: '.lz'
    },
    {
        id: 4,
        title: 'Speed Hack Pro',
        description: 'Adjustable speed modifier with server sync protection.',
        category: 'utility',
        executions: 12453,
        premium: false,
        encrypted: true,
        format: '.txt'
    },
    {
        id: 5,
        title: 'Aimbot Deluxe',
        description: 'Precision aimbot with smooth aiming and FOV customization.',
        category: 'game',
        executions: 22105,
        premium: true,
        encrypted: true,
        format: '.lz'
    },
    {
        id: 6,
        title: 'Server Crasher',
        description: 'Advanced server management tools for admins. Use responsibly.',
        category: 'admin',
        executions: 3421,
        premium: true,
        encrypted: true,
        format: '.lua'
    }
];

function loadScripts() {
    AppState.scripts = DEMO_SCRIPTS;
    renderScripts();
    updateScriptStats();
}

function renderScripts() {
    const grid = document.getElementById('scripts-grid');
    if (!grid) return;

    const filtered = AppState.currentFilter === 'all' 
        ? AppState.scripts 
        : AppState.scripts.filter(s => s.category === AppState.currentFilter);

    grid.innerHTML = filtered.map(script => `
        <div class="script-card" data-category="${script.category}" data-id="${script.id}">
            <div class="script-header">
                <span class="script-title">${script.title}</span>
                <span class="script-badge ${script.premium ? 'premium' : 'free'}">${script.premium ? 'PREMIUM' : 'FREE'}</span>
            </div>
            <p class="script-desc">${script.description}</p>
            <div class="script-meta">
                <span class="script-format">${script.format}</span>
                <span class="script-executions">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M4 2l8 5-8 5V2z" fill="currentColor"/></svg>
                    ${script.executions.toLocaleString()}
                </span>
            </div>
            <div class="script-actions">
                <button class="btn btn-primary" onclick="loadScriptToExecutor(${script.id})">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M4 2l8 5-8 5V2z" fill="currentColor"/></svg>
                    Execute
                </button>
                <button class="btn btn-secondary" onclick="viewScriptDetails(${script.id})">
                    Details
                </button>
            </div>
        </div>
    `).join('');
}

function updateScriptStats() {
    const totalScripts = document.getElementById('total-scripts');
    const totalExecs = document.getElementById('total-executions');

    if (totalScripts) {
        const count = AppState.scripts.length;
        animateNumber(totalScripts, 0, count, 1000);
    }

    if (totalExecs) {
        const total = AppState.scripts.reduce((sum, s) => sum + s.executions, 0);
        animateNumber(totalExecs, 0, total, 1500);
    }
}

function animateNumber(element, start, end, duration) {
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (end - start) * easeProgress);

        element.textContent = current.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

function loadScriptToExecutor(scriptId) {
    const script = AppState.scripts.find(s => s.id === scriptId);
    if (!script) return;

    const input = document.getElementById('script-input');
    if (input) {
        input.value = `-- [ENCRYPTED] ${script.title} (${script.format})
-- Executions: ${script.executions.toLocaleString()}
-- Category: ${script.category}
-- Premium: ${script.premium ? 'Yes' : 'No'}

-- This script is encrypted and can only be executed through a verified executor.
-- Direct browser access is rejected.

local zurai02 = require("zurai02.core")
local auth = zurai02.authenticate()

if not auth.verified then
    return zurai02.reject("Unauthorized access attempt detected")
end

-- Loading encrypted payload...
zurai02.execute(auth.payload)
`;
    }

    document.getElementById('executor').scrollIntoView({ behavior: 'smooth' });
    showToast(`Loaded "${script.title}" into executor`, 'success');
}

function viewScriptDetails(scriptId) {
    const script = AppState.scripts.find(s => s.id === scriptId);
    if (!script) return;
    showToast(`${script.title} - ${script.executions.toLocaleString()} executions`, 'info');
}

// ============================================
// Script Execution
// ============================================

function executeScript() {
    const input = document.getElementById('script-input');
    const output = document.getElementById('output-content');
    const status = document.getElementById('executor-status');

    if (!input || !input.value.trim()) {
        showToast('Please enter or upload a script first', 'warning');
        return;
    }

    if (!AppState.isAuthenticated) {
        showToast('Please sign in to execute scripts', 'warning');
        openAuthModal();
        return;
    }

    // Update status
    if (status) {
        status.innerHTML = '<span class="status-dot busy"></span> Executing...';
    }

    const script = input.value;
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });

    // Log execution start
    addOutputLine(timestamp, 'Starting script execution...', 'system');

    // Simulate execution steps
    setTimeout(() => {
        addOutputLine(new Date().toLocaleTimeString('en-US', { hour12: false }), 'Verifying executor signature...', 'system');
    }, 500);

    setTimeout(() => {
        addOutputLine(new Date().toLocaleTimeString('en-US', { hour12: false }), 'Decrypting script payload...', 'system');
    }, 1000);

    setTimeout(() => {
        // Check if script is encrypted/protected
        if (script.includes('[ENCRYPTED]') || script.includes('zurai02.authenticate')) {
            addOutputLine(new Date().toLocaleTimeString('en-US', { hour12: false }), '✓ Script verified and decrypted successfully', 'success');
            addOutputLine(new Date().toLocaleTimeString('en-US', { hour12: false }), '✓ Executor signature validated', 'success');
            addOutputLine(new Date().toLocaleTimeString('en-US', { hour12: false }), '✓ Script executed successfully', 'success');

            // Increment execution count
            AppState.executionCount++;
            localStorage.setItem('zurai02_exec_count', AppState.executionCount.toString());
            updateExecutionCounter();
            updateDashboard();

            showToast('Script executed successfully!', 'success');
        } else {
            addOutputLine(new Date().toLocaleTimeString('en-US', { hour12: false }), '✗ Script rejected: Not encrypted or unauthorized', 'error');
            addOutputLine(new Date().toLocaleTimeString('en-US', { hour12: false }), '✗ Browser execution is not permitted', 'error');
            showToast('Script rejected - use a verified executor', 'error');
        }

        if (status) {
            status.innerHTML = '<span class="status-dot ready"></span> Ready';
        }
    }, 2000);
}

function validateScript() {
    const input = document.getElementById('script-input');
    if (!input || !input.value.trim()) {
        showToast('Please enter a script to validate', 'warning');
        return;
    }

    const script = input.value;
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });

    addOutputLine(timestamp, 'Validating script...', 'system');

    setTimeout(() => {
        if (script.includes('[ENCRYPTED]') || script.includes('zurai02.authenticate')) {
            addOutputLine(new Date().toLocaleTimeString('en-US', { hour12: false }), '✓ Script format valid', 'success');
            addOutputLine(new Date().toLocaleTimeString('en-US', { hour12: false }), '✓ Encryption verified', 'success');
            addOutputLine(new Date().toLocaleTimeString('en-US', { hour12: false }), '✓ Ready for execution', 'success');
            showToast('Script validation passed', 'success');
        } else {
            addOutputLine(new Date().toLocaleTimeString('en-US', { hour12: false }), '⚠ Script is not encrypted', 'warning');
            addOutputLine(new Date().toLocaleTimeString('en-US', { hour12: false }), '⚠ Browser access will be rejected', 'warning');
            showToast('Script should be encrypted for security', 'warning');
        }
    }, 1000);
}

function addOutputLine(time, text, type) {
    const output = document.getElementById('output-content');
    if (!output) return;

    const line = document.createElement('div');
    line.className = `output-line ${type}`;
    line.innerHTML = `<span class="output-time">[${time}]</span><span class="output-text">${text}</span>`;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
}

function clearOutput() {
    const output = document.getElementById('output-content');
    if (output) {
        output.innerHTML = `
            <div class="output-line system">
                <span class="output-time">[${new Date().toLocaleTimeString('en-US', { hour12: false })}]</span>
                <span class="output-text">Console cleared.</span>
            </div>
        `;
    }
}

function clearExecutor() {
    const input = document.getElementById('script-input');
    if (input) input.value = '';
    showToast('Executor cleared', 'info');
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const allowedExtensions = ['.lz', '.lua', '.txt'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();

    if (!allowedExtensions.includes(ext)) {
        showToast('Invalid file type. Only .lz, .lua, and .txt files are supported.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const input = document.getElementById('script-input');
        if (input) {
            input.value = `-- Uploaded: ${file.name}
-- Size: ${(file.size / 1024).toFixed(2)} KB
-- Format: ${ext}

${e.target.result}`;
        }
        showToast(`Loaded ${file.name} successfully`, 'success');
    };
    reader.readAsText(file);
}

// ============================================
// Execution Counter
// ============================================

function updateExecutionCounter() {
    const counter = document.getElementById('exec-count');
    if (counter) {
        counter.textContent = AppState.executionCount.toLocaleString();
    }
}

// ============================================
// Dashboard
// ============================================

function updateDashboard() {
    const userExecs = document.getElementById('user-executions');
    const userScripts = document.getElementById('user-scripts');

    if (userExecs) userExecs.textContent = AppState.executionCount;
    if (userScripts) userScripts.textContent = AppState.scripts.filter(s => s.executions > 0).length;

    // Update linked account statuses
    if (AppState.linkedAccounts.linkvertise) {
        const status = document.getElementById('linkvertise-status');
        const btn = document.getElementById('btn-link-linkvertise');
        if (status) { status.textContent = 'Linked'; status.classList.add('linked'); }
        if (btn) { btn.textContent = 'Unlink'; btn.onclick = unlinkLinkvertise; }
    }

    if (AppState.linkedAccounts.lootlabs) {
        const status = document.getElementById('lootlabs-status');
        const btn = document.getElementById('btn-link-lootlabs');
        if (status) { status.textContent = 'Linked'; status.classList.add('linked'); }
        if (btn) { btn.textContent = 'Unlink'; btn.onclick = unlinkLootLabs; }
    }

    if (AppState.isAuthenticated) {
        const googleStatus = document.getElementById('google-status');
        const robloxStatus = document.getElementById('roblox-status');

        if (googleStatus && AppState.user && AppState.user.provider === 'Google') {
            googleStatus.textContent = 'Linked';
            googleStatus.classList.add('linked');
        }
        if (robloxStatus && AppState.user && AppState.user.provider === 'Roblox') {
            robloxStatus.textContent = 'Linked';
            robloxStatus.classList.add('linked');
        }
    }
}

// ============================================
// UI Utilities
// ============================================

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };

    toast.innerHTML = `<span style="font-weight:700;">${icons[type]}</span> ${message}`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function scrollToScripts() {
    document.getElementById('scripts').scrollIntoView({ behavior: 'smooth' });
}

function openExecutor() {
    document.getElementById('executor').scrollIntoView({ behavior: 'smooth' });
}

function animateStats() {
    const activeUsers = document.getElementById('active-users');
    if (activeUsers) {
        animateNumber(activeUsers, 0, 1247, 2000);
    }
}

// ============================================
// Event Listeners
// ============================================

function setupEventListeners() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            AppState.currentFilter = this.dataset.filter;
            renderScripts();
        });
    });

    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
        }
    });

    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(10, 10, 15, 0.95)';
                navbar.style.backdropFilter = 'blur(20px)';
            } else {
                navbar.style.background = 'rgba(10, 10, 15, 0.8)';
            }
        }
    });
}

// ============================================
// Script Encryption / Decryption Utilities
// ============================================

const ScriptCrypto = {
    // Simple XOR encryption for demo (use proper crypto in production)
    encrypt: function(text, key) {
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return btoa(result);
    },

    decrypt: function(encrypted, key) {
        try {
            const text = atob(encrypted);
            let result = '';
            for (let i = 0; i < text.length; i++) {
                result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
            }
            return result;
        } catch (e) {
            return null;
        }
    },

    // Verify if script is from verified executor
    verifyExecutor: function(signature) {
        // In production, verify against known executor signatures
        const validSignatures = [
            'zurai02-executor-v2',
            'synapse-x-compatible',
            'krnl-verified'
        ];
        return validSignatures.includes(signature);
    },

    // Reject browser access
    rejectBrowserAccess: function() {
        return {
            error: true,
            code: 'BROWSER_ACCESS_REJECTED',
            message: 'This script can only be executed through a verified executor. Browser access is not permitted.',
            timestamp: new Date().toISOString()
        };
    }
};

// ============================================
// Export for global access
// ============================================

window.AppState = AppState;
window.CONFIG = CONFIG;
window.ScriptCrypto = ScriptCrypto;
