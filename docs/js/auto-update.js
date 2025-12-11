/**
 * Auto Update System - Tự động phát hiện và reload khi có thay đổi
 * Không cần xóa cache thủ công trong DevTools
 */

(function() {
    'use strict';
    
    const CHECK_INTERVAL = 2000; // Check mỗi 2 giây trong dev mode
    const VERSION_KEY = 'app_version';
    let currentVersion = null;
    let checkInterval = null;
    
    /**
     * Get current app version from server
     */
    async function getAppVersion() {
        try {
            const response = await fetch('/', {
                method: 'HEAD',
                cache: 'no-store'
            });
            return response.headers.get('X-App-Version') || null;
        } catch (error) {
            console.warn('[AutoUpdate] Cannot check version:', error);
            return null;
        }
    }
    
    /**
     * Check for updates
     */
    async function checkForUpdate() {
        const newVersion = await getAppVersion();
        
        if (!newVersion) {
            return; // Cannot check version
        }
        
        if (!currentVersion) {
            // First check - save current version
            currentVersion = newVersion;
            localStorage.setItem(VERSION_KEY, currentVersion);
            console.log('[AutoUpdate] Initial version:', currentVersion);
            return;
        }
        
        if (newVersion !== currentVersion) {
            console.log('[AutoUpdate] New version detected!', {
                old: currentVersion,
                new: newVersion
            });
            
            // Clear all caches
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(name => caches.delete(name))
                );
                console.log('[AutoUpdate] Cleared', cacheNames.length, 'caches');
            }
            
            // Unregister service worker
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                await Promise.all(
                    registrations.map(reg => reg.unregister())
                );
                console.log('[AutoUpdate] Unregistered', registrations.length, 'service workers');
            }
            
            // Clear localStorage version
            localStorage.removeItem(VERSION_KEY);
            
            // Reload page
            console.log('[AutoUpdate] Reloading page...');
            window.location.reload(true);
        }
    }
    
    /**
     * Initialize auto-update system
     */
    function initAutoUpdate() {
        // Only run in development (localhost)
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            console.log('[AutoUpdate] Disabled (not localhost)');
            return;
        }
        
        console.log('[AutoUpdate] Initializing...');
        
        // Get saved version
        currentVersion = localStorage.getItem(VERSION_KEY);
        
        // Check immediately
        checkForUpdate();
        
        // Check periodically
        checkInterval = setInterval(checkForUpdate, CHECK_INTERVAL);
        
        console.log('[AutoUpdate] Active - checking every', CHECK_INTERVAL / 1000, 'seconds');
    }
    
    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAutoUpdate);
    } else {
        initAutoUpdate();
    }
    
    // Export for manual control
    window.autoUpdate = {
        check: checkForUpdate,
        stop: () => {
            if (checkInterval) {
                clearInterval(checkInterval);
                checkInterval = null;
                console.log('[AutoUpdate] Stopped');
            }
        }
    };
})();

