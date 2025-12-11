/**
 * Main Application Entry Point
 * Tái cấu trúc với routing system chuyên nghiệp
 */

// Import modules
import { router } from './router.js';
import { state } from './state.js';
import { initHomePage, loadNovels } from './pages/home.js';
import { initNovelPage } from './pages/novel.js';
import { initReaderPage, loadPreviousChapter, loadNextChapter } from './pages/reader.js';
import { escapeHtml } from './utils/ui.js';

// Import existing modules (cần convert sang ES6 modules sau)
// Tạm thời sử dụng global scope
let Auth, UserFeatures;

// Initialize App - Run immediately if DOM is ready, otherwise wait
async function initializeApp() {
    console.log('[App] Initializing...');
    
    // Wait for auth.js and user-features.js to load
    if (typeof window.Auth !== 'undefined') {
        Auth = window.Auth;
    }
    if (typeof window.UserFeatures !== 'undefined') {
        UserFeatures = window.UserFeatures;
    }
    
    // Initialize theme
    initTheme();
    
    // Initialize auth (non-blocking)
    if (Auth) {
        Auth.init().then(() => updateUserUI()).catch(err => console.error('[App] Auth init error:', err));
    }
    
    // Initialize event listeners
    initEventListeners();
    
    // Initialize router first
    router.init();
    
    // Register routes BEFORE handling initial route
    registerRoutes();
    console.log('[App] Routes registered:', Array.from(router.routes.keys()));
    
    // Handle redirect param from 404 fallback (GitHub Pages)
    const params = new URLSearchParams(window.location.search);
    const redirectPath = params.get('redirect');
    if (redirectPath) {
        const decoded = decodeURIComponent(redirectPath);
        // Clean URL (remove redirect param) and navigate
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, '', cleanUrl);
        router.replace(decoded);
    } else {
        // Handle initial route immediately - THIS IS CRITICAL
        const currentPath = window.location.pathname;
        console.log('[App] Handling initial route:', currentPath);
        router.handleRoute();
    }
    
    // Initialize PWA
    initPWA();
    
    console.log('[App] Initialized');
}

// Run immediately if DOM is ready, otherwise wait
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM is already ready
    initializeApp();
}

/**
 * Register all routes
 */
function registerRoutes() {
    // Home route
    router.register('/', async () => {
        await initHomePage();
    });
    
    // Novel detail route
    router.register('/novel/:id', async (params) => {
        await initNovelPage(params);
    });
    
    // Reader route
    router.register('/novel/:id/chapter/:chapterId', async (params) => {
        await initReaderPage(params);
    });
}

/**
 * Theme Management
 */
function initTheme() {
    if (state.theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.textContent = '☀️';
        }
    }
}

function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', state.theme);
    
    if (state.theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById('themeToggle').textContent = '☀️';
    } else {
        document.documentElement.removeAttribute('data-theme');
        document.getElementById('themeToggle').textContent = '🌙';
    }
}

/**
 * Event Listeners
 */
function initEventListeners() {
    console.log('[App] Initializing event listeners...');
    
    // Menu toggle
    const menuBtn = document.getElementById('menuBtn');
    const closeBtn = document.getElementById('closeBtn');
    const homeBtn = document.getElementById('homeBtn');
    if (menuBtn) {
        menuBtn.addEventListener('click', toggleSidebar);
        console.log('[App] Menu button listener attached');
    } else {
        console.warn('[App] Menu button not found');
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', closeSidebar);
        console.log('[App] Close button listener attached');
    } else {
        console.warn('[App] Close button not found');
    }
    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            router.navigate('/');
        });
    }
    
    // Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    // Auth
    const loginBtn = document.getElementById('loginBtn');
    const closeLoginModal = document.getElementById('closeLoginModal');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const loginModal = document.getElementById('loginModal');
            if (loginModal) {
                loginModal.classList.remove('hidden');
            }
        });
        console.log('[App] Login button listener attached');
    } else {
        console.warn('[App] Login button not found');
    }
    if (closeLoginModal) {
        closeLoginModal.addEventListener('click', () => {
            const loginModal = document.getElementById('loginModal');
            if (loginModal) {
                loginModal.classList.add('hidden');
            }
        });
    }
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Auth tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const loginForm = document.getElementById('loginForm');
            const registerForm = document.getElementById('registerForm');
            if (loginForm) {
                loginForm.classList.toggle('hidden', tab !== 'login');
            }
            if (registerForm) {
                registerForm.classList.toggle('hidden', tab !== 'register');
            }
        });
    });
    
    // Login/Register forms
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Reader controls
    const backBtn = document.getElementById('backBtn');
    const prevChapterBtn = document.getElementById('prevChapterBtn');
    const nextChapterBtn = document.getElementById('nextChapterBtn');
    const chapterListBtn = document.getElementById('chapterListBtn');
    const closeChapterListModal = document.getElementById('closeChapterListModal');
    const chapterListModal = document.getElementById('chapterListModal');
    const chapterListModalOverlay = document.getElementById('chapterListModalOverlay');
    
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (state.currentNovel) {
                router.navigate(`/novel/${state.currentNovel.id}`);
            } else {
                router.navigate('/');
            }
        });
    }
    if (prevChapterBtn) {
        prevChapterBtn.addEventListener('click', loadPreviousChapter);
    }
    if (nextChapterBtn) {
        nextChapterBtn.addEventListener('click', loadNextChapter);
    }
    if (chapterListBtn) {
        chapterListBtn.addEventListener('click', () => {
            if (chapterListModal) {
                chapterListModal.classList.remove('hidden');
                if (typeof window.openChapterListModal === 'function') {
                    window.openChapterListModal();
                }
            }
        });
    }
    if (closeChapterListModal) {
        closeChapterListModal.addEventListener('click', () => {
            if (chapterListModal) {
                chapterListModal.classList.add('hidden');
            }
        });
    }
    if (chapterListModalOverlay) {
        chapterListModalOverlay.addEventListener('click', () => {
            if (chapterListModal) {
                chapterListModal.classList.add('hidden');
            }
        });
    }
    
    // Font controls
    const increaseFont = document.getElementById('increaseFont');
    const decreaseFont = document.getElementById('decreaseFont');
    if (increaseFont) {
        increaseFont.addEventListener('click', () => changeFontSize(2));
    }
    if (decreaseFont) {
        decreaseFont.addEventListener('click', () => changeFontSize(-2));
    }
    
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        const sidebar = document.getElementById('sidebar');
        const menuBtn = document.getElementById('menuBtn');
        if (sidebar && sidebar.classList.contains('open') && 
            !sidebar.contains(e.target) && 
            menuBtn && !menuBtn.contains(e.target)) {
            toggleSidebar();
        }
    });
    
    console.log('[App] Event listeners initialized');
}

/**
 * Auth handlers
 */
async function handleLogin(e) {
    e.preventDefault();
    if (!Auth) return;
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    const result = await Auth.login(username, password);
    if (result.success) {
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.classList.add('hidden');
        }
        updateUserUI();
        if (errorDiv) {
            errorDiv.textContent = '';
        }
    } else {
        if (errorDiv) {
            errorDiv.textContent = result.error || 'Đăng nhập thất bại';
        }
    }
}

async function handleRegister(e) {
    e.preventDefault();
    if (!Auth) return;
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const errorDiv = document.getElementById('registerError');
    
    const result = await Auth.register(username, email, password);
    if (result.success) {
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.classList.add('hidden');
        }
        updateUserUI();
        if (errorDiv) {
            errorDiv.textContent = '';
        }
    } else {
        if (errorDiv) {
            errorDiv.textContent = result.error || 'Đăng ký thất bại';
        }
    }
}

async function handleLogout() {
    if (!Auth) return;
    await Auth.logout();
    updateUserUI();
    router.navigate('/');
}

function updateUserUI() {
    if (!Auth) return;
    
    const loginBtn = document.getElementById('loginBtn');
    const userInfo = document.getElementById('userInfo');
    const usernameDisplay = document.getElementById('usernameDisplay');
    
    if (Auth.isAuthenticated()) {
        if (loginBtn) loginBtn.classList.add('hidden');
        if (userInfo) userInfo.classList.remove('hidden');
        if (usernameDisplay) {
            usernameDisplay.textContent = Auth.currentUser.username;
        }
    } else {
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (userInfo) userInfo.classList.add('hidden');
    }
}

/**
 * Sidebar
 */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) {
        sidebar.classList.toggle('open');
        if (overlay) {
            overlay.classList.toggle('active');
            // Close sidebar when clicking overlay
            if (overlay.classList.contains('active')) {
                overlay.addEventListener('click', closeSidebar, { once: true });
            }
        }
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) {
        sidebar.classList.remove('open');
    }
    if (overlay) {
        overlay.classList.remove('active');
    }
}

/**
 * Search
 */
function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    const novels = state.novels || [];
    const filtered = novels.filter(novel =>
        novel.title && novel.title.toLowerCase().includes(query)
    );
    renderSidebarNovelList(filtered);
}

/**
 * Render novel list in sidebar
 */
function renderSidebarNovelList(novels) {
    const listContainer = document.getElementById('novelList');
    if (!listContainer) return;
    
    const novelsList = novels || state.novels || [];
    
    if (novelsList.length === 0) {
        listContainer.innerHTML = '<div class="loading">Không có truyện nào</div>';
        return;
    }
    
    listContainer.innerHTML = novelsList.map(novel => {
        const title = novel.title || 'Không có tiêu đề';
        const author = novel.author ? ` • ${escapeHtml(novel.author.substring(0, 30))}` : '';
        return `
        <div class="novel-item" data-route="/novel/${novel.id || novel.novel_id}" style="cursor: pointer;">
            <div class="novel-item-title">${escapeHtml(title)}</div>
            <div class="novel-item-meta">${novel.totalChapters || 0} chương${author}</div>
        </div>
    `;
    }).join('');
    
    // Add click handlers
    listContainer.querySelectorAll('.novel-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const route = item.getAttribute('data-route');
            if (route) {
                router.navigate(route);
                toggleSidebar();
            }
        });
    });
}

// Export for home page to update sidebar
window.updateSidebarNovels = (novels) => {
    renderSidebarNovelList(novels);
};

/**
 * Font Size
 */
function changeFontSize(delta) {
    state.fontSize = Math.max(12, Math.min(24, state.fontSize + delta));
    localStorage.setItem('fontSize', state.fontSize);
    updateFontSize();
    updateFontSizeDisplay();
}

function updateFontSize() {
    document.documentElement.style.setProperty('--font-size-base', `${state.fontSize}px`);
    const readerContent = document.querySelector('.reader-content');
    if (readerContent) {
        readerContent.style.fontSize = `${state.fontSize}px`;
    }
}

function updateFontSizeDisplay() {
    const fontSizeEl = document.getElementById('fontSize');
    if (fontSizeEl) {
        fontSizeEl.textContent = state.fontSize;
    }
}

/**
 * PWA Support
 */
function initPWA() {
    // Only register service worker in production
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if ('serviceWorker' in navigator) {
        if (isDev) {
            // In dev mode, unregister any existing workers
            navigator.serviceWorker.getRegistrations().then(registrations => {
                registrations.forEach(reg => {
                    reg.unregister().then(() => {
                        console.log('[App] Service Worker unregistered (dev mode)');
                    });
                });
            });
        } else {
            // In production, register service worker
            navigator.serviceWorker.register('/service-worker.js')
                .then(reg => console.log('[App] Service Worker registered'))
                .catch(err => console.log('[App] Service Worker registration failed:', err));
        }
    }
}

// Export for use in other modules (legacy support)
window.app = {
    router,
    state
};

