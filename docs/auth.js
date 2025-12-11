// Authentication module
const Auth = {
    currentUser: null,
    
    async init() {
        await this.checkAuth();
    },
    
    async checkAuth() {
        try {
            const response = await fetch('/api/auth/me', {
                credentials: 'include'
            });
            
            if (response.ok) {
                this.currentUser = await response.json();
                return true;
            }
            // 401 is expected when not logged in, don't log as error
            if (response.status !== 401) {
                console.warn('Auth: Unexpected status', response.status);
            }
            this.currentUser = null;
            return false;
        } catch (error) {
            // Network errors are expected in some cases, don't log
            this.currentUser = null;
            return false;
        }
    },
    
    async login(username, password) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            if (data.success) {
                this.currentUser = data.user;
                return { success: true };
            }
            return { success: false, error: data.error };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    async register(username, email, password) {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username, email, password })
            });
            
            const data = await response.json();
            if (data.success) {
                this.currentUser = data.user;
                return { success: true };
            }
            return { success: false, error: data.error };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    async logout() {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
            this.currentUser = null;
            return true;
        } catch (error) {
            return false;
        }
    },
    
    isAuthenticated() {
        return this.currentUser !== null;
    },
    
    isAdmin() {
        return this.currentUser && this.currentUser.isAdmin;
    }
};

// Export to global scope for compatibility with app.js
window.Auth = Auth;

