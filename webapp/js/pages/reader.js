/**
 * Reader Page - Trang đọc truyện
 */

import { API_BASE_URL, STATIC_DATA_BASE } from '../config.js';
import { state } from '../state.js';
import { renderChapterContent as renderChapterContentUtil } from '../renderers/reader.js';
import { showLoading, hideLoading, showToast } from '../utils/ui.js';
import { router } from '../router.js';
import { escapeHtml } from '../utils/ui.js';

/**
 * Initialize reader page
 * @param {Object} params - Route params { id, chapterId }
 */
export async function initReaderPage(params) {
    try {
        console.log('Reader: Initializing reader page', params);
        console.log('Reader: Full params object:', JSON.stringify(params));
        
        const { id: novelId, chapterId } = params;
        if (!novelId || !chapterId) {
            console.error('Reader: Missing novel ID or chapter ID', { novelId, chapterId });
            showToast('Lỗi: Thiếu thông tin truyện hoặc chương', 'error');
            router.navigate('/');
            return;
        }

        console.log('Reader: Novel ID:', novelId, 'Chapter ID:', chapterId);

        // Hide other views
        hideAllViews();
        showReaderView();
        
        // Close sidebar if open
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        if (sidebar && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
        if (sidebarOverlay && sidebarOverlay.classList.contains('active')) {
            sidebarOverlay.classList.remove('active');
        }
        
        // Initialize chapter list modal
        initChapterListModal();

        // Load novel detail if not loaded
        if (!state.currentNovelDetail || state.currentNovelDetail.id !== novelId) {
            console.log('Reader: Loading novel detail for:', novelId);
            await loadNovelDetail(novelId);
        } else {
            console.log('Reader: Novel detail already loaded');
        }

        // Load chapter content
        console.log('Reader: Loading chapter content:', chapterId);
        await loadChapterContent(novelId, chapterId);
    } catch (error) {
        console.error('Reader: Error initializing reader page:', error);
        showToast('Lỗi: ' + (error.message || 'Không thể tải trang đọc'), 'error');
        hideLoading();
        // Show error in reader view
        const readerView = document.getElementById('readerView');
        if (readerView) {
            const content = document.getElementById('chapterContent');
            if (content) {
                content.innerHTML = `
                    <div class="error-state" style="padding: 20px; text-align: center;">
                        <h2>Lỗi tải trang</h2>
                        <p>${error.message || 'Không thể tải nội dung chương'}</p>
                        <button onclick="window.location.href='/'" style="margin-top: 10px; padding: 8px 16px; background: var(--primary-color); color: white; border: none; border-radius: 6px; cursor: pointer;">
                            Về trang chủ
                        </button>
                    </div>
                `;
            }
        }
    }
}

/**
 * Load novel detail (if needed)
 */
async function loadNovelDetail(novelId) {
    try {
        // Encode novelId for URL (handle special characters)
        const encodedNovelId = encodeURIComponent(novelId);
        const url = `${API_BASE_URL}/novels/${encodedNovelId}`;
        console.log('Reader: Fetching novel detail from:', url);
        
        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Reader: Novel detail fetch failed:', response.status, errorText);
            throw new Error(`Không thể tải thông tin truyện (${response.status})`);
        }
        
        state.currentNovelDetail = await response.json();
        console.log('Reader: Novel detail loaded:', state.currentNovelDetail.title);
        // Ensure chapters array is properly set and sorted
        if (state.currentNovelDetail.chapters && Array.isArray(state.currentNovelDetail.chapters)) {
            state.allChapters = state.currentNovelDetail.chapters.sort((a, b) => {
                // Sort by chapter number if available, otherwise by id
                const numA = a.number !== undefined ? a.number : (a.id || 0);
                const numB = b.number !== undefined ? b.number : (b.id || 0);
                return numA - numB;
            });
        } else {
            state.allChapters = [];
        }
        
        // Find novel in novels list
        state.currentNovel = state.novels.find(n => n.id === novelId) || {
            id: state.currentNovelDetail.id,
            title: state.currentNovelDetail.title,
            totalChapters: state.currentNovelDetail.totalChapters
        };
        
        console.log('Reader: Loaded novel detail with', state.allChapters.length, 'chapters');
    } catch (error) {
        console.warn('Reader: API failed, fallback to static JSON:', error);
        const safeId = sanitizeId(novelId);
        const staticUrl = `${STATIC_DATA_BASE}/novels/${safeId}.json`;
        const resp = await fetch(staticUrl);
        if (!resp.ok) {
            const errText = await resp.text();
            console.error('Reader: Static novel detail fetch failed:', resp.status, errText);
            throw new Error(`Không thể tải thông tin truyện (static ${resp.status})`);
        }
        state.currentNovelDetail = await resp.json();
        state.allChapters = (state.currentNovelDetail.chapters || []).sort((a, b) => {
            const numA = a.number !== undefined ? a.number : (a.id || 0);
            const numB = b.number !== undefined ? b.number : (b.id || 0);
            return numA - numB;
        });
        state.currentNovel = {
            id: state.currentNovelDetail.id,
            title: state.currentNovelDetail.title,
            totalChapters: state.currentNovelDetail.totalChapters,
        };
        console.log('Reader: Loaded novel detail (static) with', state.allChapters.length, 'chapters');
    }
}

/**
 * Load chapter content
 */
async function loadChapterContent(novelId, chapterId) {
    try {
        showLoading();
        const chapterIdStr = String(chapterId);
        // Encode both novelId and chapterId for URL
        const encodedNovelId = encodeURIComponent(novelId);
        const encodedChapterId = encodeURIComponent(chapterIdStr);
        const url = `${API_BASE_URL}/novels/${encodedNovelId}/chapters/${encodedChapterId}`;
        console.log('Reader: Fetching chapter content from:', url);
        
        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Reader: Chapter content fetch failed:', response.status, errorText);
            throw new Error(`Không thể tải nội dung chương (${response.status})`);
        }
        
        state.currentChapterContent = await response.json();
        
        // Ensure allChapters is loaded
        if (!state.allChapters || state.allChapters.length === 0) {
            console.log('Reader: Chapters not loaded, reloading novel detail...');
            await loadNovelDetail(novelId);
        }
        
        // Find chapter in list
        state.currentChapter = state.allChapters.find(
            ch => String(ch.id) === chapterIdStr || String(ch.number) === chapterIdStr
        );
        
        // Create from response if not found
        if (!state.currentChapter && state.currentChapterContent) {
            state.currentChapter = {
                id: state.currentChapterContent.id,
                number: state.currentChapterContent.number,
                title: state.currentChapterContent.title
            };
            // Add to allChapters if not present and sort
            if (state.allChapters && !state.allChapters.find(ch => String(ch.id) === String(state.currentChapter.id))) {
                state.allChapters.push(state.currentChapter);
                state.allChapters.sort((a, b) => {
                    const numA = a.number !== undefined ? a.number : (a.id || 0);
                    const numB = b.number !== undefined ? b.number : (b.id || 0);
                    return numA - numB;
                });
            }
        }
        
        console.log('Reader: Current chapter:', state.currentChapter, 'Total chapters:', state.allChapters.length);
        
        // Render chapter content with callbacks
        renderChapterContentUtil(
            state.currentChapterContent,
            loadPreviousChapter,
            loadNextChapter,
            updateChapterNavButtons
        );
        
        // Update chapter list modal
        updateChapterListModal();
        
        // Update reading progress
        if (typeof window.Auth !== 'undefined' && window.Auth.isAuthenticated() && state.currentChapter) {
            if (typeof window.UserFeatures !== 'undefined') {
                window.UserFeatures.updateProgress(novelId, state.currentChapter.number);
            }
        }
        
        hideLoading();
    } catch (error) {
        console.warn('Reader: API chapter fetch failed, try static:', error);

        // Ensure novel detail/chapters are loaded from static if needed
        if (!state.allChapters || state.allChapters.length === 0) {
            await loadNovelDetail(novelId);
        }

        const chapterIdStr = String(chapterId);
        const chapter = (state.allChapters || []).find(
            ch => String(ch.id) === chapterIdStr || String(ch.number) === chapterIdStr
        );

        if (!chapter) {
            hideLoading();
            const errMsg = 'Không tìm thấy chương trong dữ liệu tĩnh';
            console.error('Reader:', errMsg);
            showToast(errMsg, 'error');
            router.navigate(`/novel/${novelId}`);
            return;
        }

        state.currentChapterContent = {
            id: chapter.id,
            number: chapter.number,
            title: chapter.title,
            content: chapter.content || '',
        };

        state.currentChapter = chapter;

        renderChapterContentUtil(
            state.currentChapterContent,
            loadPreviousChapter,
            loadNextChapter,
            updateChapterNavButtons
        );

        updateChapterListModal();
        hideLoading();
    }
}

/**
 * Navigate to previous chapter
 */
export function loadPreviousChapter() {
    if (!state.currentChapter || !state.allChapters || !state.currentNovel || state.allChapters.length === 0) {
        showToast('Không thể chuyển chương', 'error');
        return;
    }
    
    const currentIndex = state.allChapters.findIndex(
        ch => String(ch.id) === String(state.currentChapter.id) || 
              (state.currentChapter.number && ch.number === state.currentChapter.number)
    );
    
    if (currentIndex === -1) {
        console.error('Reader: Chapter not found in list');
        showToast('Lỗi: Không tìm thấy chương hiện tại', 'error');
        return;
    }
    
    if (currentIndex > 0) {
        const prevChapter = state.allChapters[currentIndex - 1];
        router.navigate(`/novel/${state.currentNovel.id}/chapter/${prevChapter.id}`);
    } else {
        showToast('Đã đến chương đầu tiên', 'info');
    }
}

/**
 * Navigate to next chapter
 */
export function loadNextChapter() {
    if (!state.currentChapter || !state.allChapters || !state.currentNovel || state.allChapters.length === 0) {
        showToast('Không thể chuyển chương', 'error');
        return;
    }
    
    const currentIndex = state.allChapters.findIndex(
        ch => String(ch.id) === String(state.currentChapter.id) || 
              (state.currentChapter.number && ch.number === state.currentChapter.number)
    );
    
    if (currentIndex === -1) {
        console.error('Reader: Chapter not found in list');
        showToast('Lỗi: Không tìm thấy chương hiện tại', 'error');
        return;
    }
    
    if (currentIndex < state.allChapters.length - 1) {
        const nextChapter = state.allChapters[currentIndex + 1];
        router.navigate(`/novel/${state.currentNovel.id}/chapter/${nextChapter.id}`);
    } else {
        showToast('Đã đến chương cuối cùng', 'info');
    }
}

/**
 * Update chapter navigation buttons
 */
export function updateChapterNavButtons() {
    if (!state.currentChapter || !state.allChapters || state.allChapters.length === 0) {
        disableAllNavButtons();
        return;
    }
    
    const currentIndex = state.allChapters.findIndex(
        ch => String(ch.id) === String(state.currentChapter.id) || 
              (state.currentChapter.number && ch.number === state.currentChapter.number)
    );
    
    if (currentIndex === -1) {
        console.warn('Reader: Chapter not found in list');
        return;
    }
    
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === state.allChapters.length - 1;
    
    const prevBtn = document.getElementById('prevChapterBtn');
    const nextBtn = document.getElementById('nextChapterBtn');
    
    // Update button states - disable if at first/last chapter
    if (prevBtn) {
        prevBtn.disabled = isFirst;
        if (isFirst) {
            prevBtn.title = 'Đã đến chương đầu tiên';
        } else {
            prevBtn.title = 'Chương trước';
        }
    }
    if (nextBtn) {
        nextBtn.disabled = isLast;
        if (isLast) {
            nextBtn.title = 'Đã đến chương cuối cùng';
        } else {
            nextBtn.title = 'Chương sau';
        }
    }
}

/**
 * Disable all navigation buttons
 */
function disableAllNavButtons() {
    const prevBtn = document.getElementById('prevChapterBtn');
    const nextBtn = document.getElementById('nextChapterBtn');
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
}

/**
 * Initialize chapter list modal
 */
function initChapterListModal() {
    // Modal will be populated when chapters are loaded
}

/**
 * Update chapter list modal
 */
function updateChapterListModal() {
    const chapterListItems = document.getElementById('chapterListItems');
    if (!chapterListItems) {
        return;
    }
    
    if (!state.allChapters || state.allChapters.length === 0) {
        chapterListItems.innerHTML = '<div class="loading">Chưa có chương</div>';
        return;
    }
    
    // Clear existing items
    chapterListItems.innerHTML = '';
    
    // Add chapters to list
    state.allChapters.forEach((chapter, index) => {
        const item = document.createElement('div');
        const chapterNum = chapter.number !== undefined ? chapter.number : (index + 1);
        const chapterTitle = chapter.title || `Chương ${chapterNum}`;
        
        // Check if this is the current chapter
        const isActive = state.currentChapter && 
            (String(chapter.id) === String(state.currentChapter.id) || 
             (chapter.number && state.currentChapter.number && chapter.number === state.currentChapter.number));
        
        item.className = `chapter-list-item ${isActive ? 'active' : ''}`;
        item.innerHTML = `
            <div class="chapter-list-item-title">${escapeHtml(chapterTitle)}</div>
            <div class="chapter-list-item-number">Chương ${chapterNum}</div>
        `;
        
        item.addEventListener('click', () => {
            if (state.currentNovel) {
                const chapterListModal = document.getElementById('chapterListModal');
                if (chapterListModal) {
                    chapterListModal.classList.add('hidden');
                }
                router.navigate(`/novel/${state.currentNovel.id}/chapter/${chapter.id || chapterNum}`);
            }
        });
        
        chapterListItems.appendChild(item);
    });
}

/**
 * Open chapter list modal
 */
function openChapterListModal() {
    updateChapterListModal();
    
    // Setup search functionality
    const chapterSearchInput = document.getElementById('chapterSearchInput');
    if (chapterSearchInput) {
        chapterSearchInput.value = '';
        chapterSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const items = document.querySelectorAll('.chapter-list-item');
            items.forEach(item => {
                const title = item.querySelector('.chapter-list-item-title')?.textContent.toLowerCase() || '';
                const number = item.querySelector('.chapter-list-item-number')?.textContent.toLowerCase() || '';
                if (title.includes(query) || number.includes(query)) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
}

// Export for app.js to use
window.openChapterListModal = openChapterListModal;

/**
 * Show reader view
 */
function showReaderView() {
    const readerView = document.getElementById('readerView');
    if (readerView) {
        readerView.classList.remove('hidden');
    }
}

/**
 * Hide all views
 */
function hideAllViews() {
    document.querySelectorAll('.view').forEach(view => {
        if (view.id !== 'readerView') {
            view.classList.add('hidden');
        }
    });
}

function sanitizeId(id) {
    return String(id || 'unknown').replace(/[^\w.-]/g, '_');
}
