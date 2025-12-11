/**
 * Reader Page Renderers
 */

import { escapeHtml } from '../utils/ui.js';
import { state } from '../state.js';
import { router } from '../router.js';

/**
 * Render chapter content
 * @param {Object} chapterContent - Chapter content object
 * @param {Function} onPrevChapter - Callback for previous chapter
 * @param {Function} onNextChapter - Callback for next chapter
 * @param {Function} updateNavButtons - Callback to update nav buttons
 */
export function renderChapterContent(chapterContent, onPrevChapter, onNextChapter, updateNavButtons) {
    const chapterTitleEl = document.getElementById('chapterTitle');
    const contentDiv = document.getElementById('chapterContent');
    
    if (!chapterTitleEl || !contentDiv) {
        console.error('Reader: Missing chapter title or content element');
        return;
    }
    
    chapterTitleEl.textContent = chapterContent.title;
    
    // Clear old content
    contentDiv.innerHTML = '';
    
    // Format content with paragraphs
    const paragraphs = chapterContent.content.split('\n\n').filter(p => p.trim());
    const contentHTML = paragraphs.map(p => 
        `<p>${escapeHtml(p.trim())}</p>`
    ).join('');
    
    // Create wrapper for content
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'chapter-text-content';
    contentWrapper.innerHTML = contentHTML;
    contentDiv.appendChild(contentWrapper);
    
    // Navigation buttons are now in footer (defined in index.html)
    // No need to create them here or attach event listeners
    // Event listeners are already attached in app.js
    
    // Update button states
    if (updateNavButtons) {
        updateNavButtons();
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Update font size
    updateFontSize();
}

/**
 * Update font size
 */
function updateFontSize() {
    const readerContent = document.querySelector('.reader-content');
    if (readerContent) {
        readerContent.style.fontSize = `${state.fontSize}px`;
    }
}

