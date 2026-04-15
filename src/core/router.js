class Router {
    constructor() { this.currentRoute = null; }

    init() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigate(btn.dataset.route);
            });
        });
        window.addEventListener('popstate', () => {
            const route = location.pathname.slice(1) || 'tasks';
            this.navigate(route);
        });
    }

    async navigate(route) {
        if (this.currentRoute === route) return;
        
        // UI
        document.querySelectorAll('.nav-btn').forEach(btn => 
            btn.classList.toggle('active', btn.dataset.route === route)
        );
        await window.Core.loadModule(route);
        this.currentRoute = route;
        
        // History ТОЛЬКО если не fallback
        if (!window.location.pathname.includes('public')) {
            history.pushState({}, '', '/' + route);
        }
    }
}

window.Router = new Router();
    