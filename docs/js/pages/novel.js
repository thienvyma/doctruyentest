/**
 * Novel Detail Page - Trang thông tin truyện và danh sách chương
 */

import { API_BASE_URL, STATIC_DATA_BASE } from '../config.js';
import { state } from '../state.js';
import { renderChapterList } from '../renderers/novel.js';
import { showLoading, hideLoading, showToast } from '../utils/ui.js';
import { router } from '../router.js';

/**
 * Initialize novel detail page
 * @param {Object} params - Route params { id }
 */
export async function initNovelPage(params) {
    console.log('Novel: Initializing novel page', params);
    
    const { id: novelId } = params;
    if (!novelId) {
        console.error('Novel: Missing novel ID');
        router.navigate('/');
        return;
    }

    // Hide other views
    hideAllViews();
    showNovelView();

    // Load novel detail
    await loadNovelDetail(novelId);
}

/**
 * Load novel detail from API
 */
async function loadNovelDetail(novelId) {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/novels/${novelId}`);
        if (!response.ok) throw new Error('Không thể tải thông tin truyện (API)');
        state.currentNovelDetail = await response.json();
        state.allChapters = state.currentNovelDetail.chapters;
        
        // Find novel in novels list
        state.currentNovel = state.novels.find(n => n.id === novelId) || {
            id: state.currentNovelDetail.id,
            title: state.currentNovelDetail.title,
            totalChapters: state.currentNovelDetail.totalChapters
        };

        // Update UI
        document.getElementById('novelTitle').textContent = state.currentNovelDetail.title;
        document.getElementById('novelMeta').textContent = `${state.currentNovelDetail.totalChapters} chương`;
        
        renderChapterList(state.currentNovelDetail.chapters);
        hideLoading();
    } catch (error) {
        console.warn('Novel: API failed, fallback to static JSON:', error);
        try {
            const safeId = sanitizeId(novelId);
            const staticUrl = `${STATIC_DATA_BASE}/novels/${safeId}.json`;
            const resp = await fetch(staticUrl);
            if (!resp.ok) throw new Error('Không thể tải thông tin truyện (static)');
            state.currentNovelDetail = await resp.json();
            state.allChapters = state.currentNovelDetail.chapters || [];

            // Update UI
            document.getElementById('novelTitle').textContent = state.currentNovelDetail.title || '';
            document.getElementById('novelMeta').textContent = `${state.currentNovelDetail.totalChapters || 0} chương`;
            renderChapterList(state.currentNovelDetail.chapters || []);
            hideLoading();
        } catch (e2) {
            console.error('Novel: Error loading novel detail (static fallback also failed):', e2);
            showToast('Lỗi: ' + e2.message, 'error');
            hideLoading();
            router.navigate('/');
        }
    }
}

/**
 * Show novel view
 */
function showNovelView() {
    const novelView = document.getElementById('novelDetailView');
    if (novelView) {
        novelView.classList.remove('hidden');
    }
}

/**
 * Hide all views
 */
function hideAllViews() {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.add('hidden');
    });
}

function sanitizeId(id) {
    return String(id || 'unknown').replace(/[^\w.-]/g, '_');
}

