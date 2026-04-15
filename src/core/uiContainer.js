class Core {
    constructor() {
        this.modules = new Map();
    }

    async init() {
        this.container = document.getElementById('main-container');
        console.log('✅ Core готов');
    }

    registerModule(name, module) {
        this.modules.set(name, module);
    }

    async loadModule(name) {
        this.container.innerHTML = '<div style="text-align:center;padding:3rem;color:#6366f1">🔄 Загрузка ' + name + '...</div>';
        const module = this.modules.get(name);
        if (!module) {
            this.container.innerHTML = '<p style="color:red">❌ Модуль ' + name + ' не найден</p>';
            return;
        }
        await module.init?.();
        module.render(this.container);
    }
}

window.Core = new Core();
