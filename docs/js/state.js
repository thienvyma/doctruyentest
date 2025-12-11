/**
 * Global State Management
 */

export const state = {
    novels: [],
    currentNovel: null,
    currentNovelDetail: null,
    currentChapter: null,
    currentChapterContent: null,
    allChapters: [],
    fontSize: parseInt(localStorage.getItem('fontSize')) || 16,
    theme: localStorage.getItem('theme') || 'light'
};

