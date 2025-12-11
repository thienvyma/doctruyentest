// User features: bookmarks, reading progress
const UserFeatures = {
    async updateProgress(novelId, chapterNumber) {
        if (!Auth.isAuthenticated()) return;
        
        try {
            await fetch('/api/user/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ novelId, chapterNumber })
            });
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    },
    
    async getProgress() {
        if (!Auth.isAuthenticated()) return null;
        
        try {
            const response = await fetch('/api/user/progress', {
                credentials: 'include'
            });
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Error getting progress:', error);
        }
        return null;
    },
    
    async toggleBookmark(novelId) {
        if (!Auth.isAuthenticated()) return false;
        
        try {
            const response = await fetch('/api/user/bookmarks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ novelId })
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.isBookmarked;
            }
        } catch (error) {
            console.error('Error toggling bookmark:', error);
        }
        return false;
    },
    
    async getBookmarks() {
        if (!Auth.isAuthenticated()) return [];
        
        try {
            const response = await fetch('/api/user/bookmarks', {
                credentials: 'include'
            });
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Error getting bookmarks:', error);
        }
        return [];
    }
};

// Export to global scope for compatibility with app.js
window.UserFeatures = UserFeatures;

