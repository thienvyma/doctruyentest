/**
 * Home Page - Trang chủ hiển thị danh sách truyện
 * Code mới hoàn toàn, đơn giản và rõ ràng
 */

import { router } from '../router.js';
import { state } from '../state.js';
import { escapeHtml } from '../utils/ui.js';
import { API_BASE_URL, STATIC_DATA_BASE } from '../config.js';

/**
 * Load novels from API
 */
export async function loadNovels() {
    // Try API first, fallback to static JSON
    try {
        console.log('[Home] Loading novels from API:', `${API_BASE_URL}/novels`);
        const response = await fetch(`${API_BASE_URL}/novels`, { cache: 'no-cache' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        state.novels = Array.isArray(data) ? data : [];
        console.log('[Home] Loaded', state.novels.length, 'novels (API)');
        return state.novels;
    } catch (error) {
        console.warn('[Home] API failed, fallback to static JSON:', error);
        try {
            const staticUrl = `${STATIC_DATA_BASE}/novels.json`;
            console.log('[Home] Loading novels from static:', staticUrl);
            const resp = await fetch(staticUrl, { cache: 'no-cache' });
            if (!resp.ok) throw new Error(`Static HTTP ${resp.status}`);
            const data = await resp.json();
            state.novels = Array.isArray(data) ? data : [];
            console.log('[Home] Loaded', state.novels.length, 'novels (static)');
            return state.novels;
        } catch (e2) {
            console.error('[Home] Static load failed:', e2);
            state.novels = [];
            return [];
        }
    }
}

/**
 * Initialize home page
 */
export async function initHomePage() {
    try {
        console.log('[Home] Initializing home page');
        
        // Show home view
        const homeView = document.getElementById('homeView');
        if (!homeView) {
            console.error('[Home] homeView element not found!');
            return;
        }
        
        // Hide other views
        document.querySelectorAll('.view').forEach(view => {
            if (view.id !== 'homeView') {
                view.classList.add('hidden');
            }
        });
        homeView.classList.remove('hidden');
        
        // Show loading state
        homeView.innerHTML = '<div class="loading">Đang tải truyện...</div>';
        
        // Load novels
        const novels = await loadNovels();
        console.log('[Home] Novels loaded:', novels.length);
        
        // Render novels
        if (novels && novels.length > 0) {
            renderNovels(novels);
        } else {
            homeView.innerHTML = `
                <div class="empty-state">
                    <h2>Chưa có truyện nào</h2>
                    <p>Hãy sử dụng Admin Panel để thêm truyện mới</p>
                </div>
            `;
        }
        
        // Update sidebar if exists
        if (typeof window.updateSidebarNovels === 'function') {
            window.updateSidebarNovels(novels);
        }
    } catch (error) {
        console.error('[Home] Error initializing home page:', error);
        const homeView = document.getElementById('homeView');
        if (homeView) {
            homeView.innerHTML = `
                <div class="empty-state">
                    <h2>Lỗi tải trang chủ</h2>
                    <p>${error.message}</p>
                    <button onclick="window.location.reload()" style="margin-top: 10px; padding: 8px 16px; background: var(--primary-color); color: white; border: none; border-radius: 6px; cursor: pointer;">Refresh trang</button>
                </div>
            `;
        }
    }
}

/**
 * Render novels to home page
 */
function renderNovels(novels) {
    const homeView = document.getElementById('homeView');
    if (!homeView) return;
    
    // Clear content
    homeView.innerHTML = '';
    
    if (!novels || novels.length === 0) {
        homeView.innerHTML = `
            <div class="empty-state">
                <h2>Chưa có truyện nào</h2>
                <p>Hãy sử dụng Admin Panel để thêm truyện mới</p>
            </div>
        `;
        return;
    }
    
    // Create novels grid
    const novelsSection = document.createElement('div');
    novelsSection.className = 'novels-section';
    
    const header = document.createElement('div');
    header.className = 'home-header';
    header.innerHTML = `
        <h2>📚 Thư viện truyện</h2>
        <p class="home-subtitle">${novels.length} truyện có sẵn</p>
    `;
    novelsSection.appendChild(header);
    
    const grid = document.createElement('div');
    grid.className = 'novels-grid';
    
    novels.forEach(novel => {
        const card = createNovelCard(novel);
        grid.appendChild(card);
    });
    
    novelsSection.appendChild(grid);
    homeView.appendChild(novelsSection);
    
    console.log('[Home] Rendered', novels.length, 'novels');
}

/**
 * Create novel card element
 */
function createNovelCard(novel) {
    const card = document.createElement('div');
    card.className = 'novel-card';
    card.style.cursor = 'pointer';
    
    // Extract clean title (first 50 chars)
    const title = novel.title || 'Không có tiêu đề';
    const cleanTitle = title.length > 50 ? title.substring(0, 50) + '...' : title;
    
    // Extract clean author (first 30 chars)
    const author = novel.author || '';
    const cleanAuthor = author.length > 30 ? author.substring(0, 30) + '...' : author;
    
    card.innerHTML = `
        ${novel.coverImage ? `
            <div class="novel-card-cover">
                <img src="${novel.coverImage}" alt="${escapeHtml(cleanTitle)}" onerror="this.style.display='none'">
            </div>
        ` : '<div class="novel-card-cover placeholder">📖</div>'}
        <div class="novel-card-info">
            <h3 class="novel-card-title">${escapeHtml(cleanTitle)}</h3>
            ${cleanAuthor ? `<p class="novel-card-author">${escapeHtml(cleanAuthor)}</p>` : ''}
            <div class="novel-card-meta">
                <span>${novel.totalChapters || 0} chương</span>
                ${novel.status === 'full' ? '<span class="status-badge">✅ Full</span>' : ''}
            </div>
        </div>
    `;
    
    // Add click handler
    card.addEventListener('click', () => {
        const novelId = novel.id || novel.novel_id;
        if (novelId) {
            router.navigate(`/novel/${novelId}`);
        }
    });
    
    return card;
}

