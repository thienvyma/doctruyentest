/**
 * Router System - Quản lý routing cho SPA
 * Hỗ trợ 3 routes chính:
 * - / : Trang chủ
 * - /novel/:id : Trang thông tin truyện
 * - /novel/:id/chapter/:chapterId : Trang đọc truyện
 */

const BASE_PATH = '/doctruyentest';

class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.init();
    }

    init() {
        // Listen for navigation events
        window.addEventListener('popstate', (e) => {
            this.handleRoute();
        });

        // Intercept link clicks (wait for DOM)
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupLinkInterception();
            });
        } else {
            this.setupLinkInterception();
        }

        // Handle initial load (wait for DOM and routes to be registered)
        // Will be called after routes are registered in app.js
    }

    /**
     * Setup link click interception
     */
    setupLinkInterception() {
        document.addEventListener('click', (e) => {
            // Check for both <a> tags and any element with data-route attribute
            const link = e.target.closest('a[data-route], [data-route]');
            if (link && link.hasAttribute('data-route')) {
                e.preventDefault();
                e.stopPropagation();
                const route = link.getAttribute('data-route');
                if (route) {
                    console.log('Router: Clicked element with route:', route);
                    this.navigate(route);
                }
            }
        });
    }

    /**
     * Đăng ký route
     * @param {string} path - Path pattern (e.g., '/novel/:id')
     * @param {Function} handler - Handler function
     */
    register(path, handler) {
        this.routes.set(path, handler);
    }

    /**
     * Navigate to route
     * @param {string} path - Path to navigate to
     */
    navigate(path) {
        const fullPath = this.normalizePath(path);
        if (fullPath !== window.location.pathname) {
            window.history.pushState({}, '', fullPath);
            this.handleRoute();
        }
    }

    /**
     * Replace current route (không tạo history entry)
     * @param {string} path - Path to navigate to
     */
    replace(path) {
        const fullPath = this.normalizePath(path);
        window.history.replaceState({}, '', fullPath);
        this.handleRoute();
    }

    /**
     * Normalize path with BASE_PATH
     */
    normalizePath(path) {
        // Ensure leading slash
        const p = path.startsWith('/') ? path : `/${path}`;
        return `${BASE_PATH}${p === '/' ? '' : p}`;
    }

    /**
     * Parse route pattern và match với path
     * @param {string} pattern - Route pattern (e.g., '/novel/:id')
     * @param {string} path - Actual path (e.g., '/novel/123')
     * @returns {Object|null} - Params object hoặc null nếu không match
     */
    matchRoute(pattern, path) {
        // Decode URL-encoded path parts
        const patternParts = pattern.split('/').filter(p => p);
        const pathParts = path.split('/').filter(p => p).map(p => {
            try {
                return decodeURIComponent(p);
            } catch (e) {
                return p; // If decoding fails, use original
            }
        });

        if (patternParts.length !== pathParts.length) {
            return null;
        }

        const params = {};
        for (let i = 0; i < patternParts.length; i++) {
            const patternPart = patternParts[i];
            const pathPart = pathParts[i];

            if (patternPart.startsWith(':')) {
                // Dynamic parameter - decode it
                const paramName = patternPart.slice(1);
                params[paramName] = pathPart;
            } else if (patternPart !== pathPart) {
                // Static part doesn't match
                return null;
            }
        }

        return params;
    }

    /**
     * Handle current route
     */
    handleRoute() {
        // Strip BASE_PATH for matching
        let path = window.location.pathname || '/';
        if (path.startsWith(BASE_PATH)) {
            path = path.slice(BASE_PATH.length) || '/';
        }
        console.log('Router: Handling route', path);
        console.log('Router: Available routes:', Array.from(this.routes.keys()));

        // Close sidebar when route changes
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        if (sidebar && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
        if (sidebarOverlay && sidebarOverlay.classList.contains('active')) {
            sidebarOverlay.classList.remove('active');
        }

        // Only proceed if routes are registered
        if (this.routes.size === 0) {
            console.warn('Router: No routes registered yet, waiting...');
            return;
        }

        // Try to match routes
        for (const [pattern, handler] of this.routes) {
            const params = this.matchRoute(pattern, path);
            if (params !== null) {
                console.log('Router: Matched pattern', pattern, 'with params', params);
                this.currentRoute = { pattern, params, path };
                try {
                    handler(params);
                } catch (error) {
                    console.error('Router: Error in route handler:', error);
                }
                return;
            }
        }

        // No route matched - only default to home if path is root or invalid
        // Don't redirect if user is on a valid path that just doesn't match our patterns
        if (path === '/' || path === '' || path === '/index.html') {
            console.log('Router: On root path, loading home');
            if (this.routes.has('/')) {
                this.currentRoute = { pattern: '/', params: {}, path: '/' };
                this.routes.get('/')({});
            }
        } else {
            console.warn('Router: No route matched for', path);
            console.warn('Router: Tried patterns:', Array.from(this.routes.keys()));
            // Default to home for unknown routes
            if (this.routes.has('/')) {
                console.log('Router: Defaulting to home');
                this.currentRoute = { pattern: '/', params: {}, path: '/' };
                this.routes.get('/')({});
            }
        }
    }

    /**
     * Get current route info
     */
    getCurrentRoute() {
        return this.currentRoute;
    }
}

// Export singleton instance
const router = new Router();
window.router = router;

// Export for ES6 modules
export { router };

