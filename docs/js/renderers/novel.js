/**
 * Novel Detail Page Renderers
 */

import { escapeHtml } from '../utils/ui.js';
import { router } from '../router.js';
import { state } from '../state.js';

/**
 * Render chapter list
 * @param {Array} chapters - Array of chapters
 */
export function renderChapterList(chapters) {
    const listContainer = document.getElementById('chapterList');
    if (!listContainer) return;
    
    if (chapters.length === 0) {
        listContainer.innerHTML = '<div class="loading">Không có chương nào</div>';
        return;
    }
    
    listContainer.innerHTML = chapters.map(chapter => `
        <div class="chapter-item" data-route="/novel/${state.currentNovel.id}/chapter/${chapter.id}" style="cursor: pointer;">
            <div class="chapter-item-number">Chương ${chapter.number}</div>
            <div class="chapter-item-title">${escapeHtml(chapter.title)}</div>
        </div>
    `).join('');
    
    // Add click handlers
    listContainer.querySelectorAll('.chapter-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const route = item.getAttribute('data-route');
            if (route) {
                console.log('Novel: Clicked chapter item, navigating to:', route);
                router.navigate(route);
            }
        });
    });
}

