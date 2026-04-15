class DataService {
    constructor() {
        this.db = null;
        this.initDB();
    }
    
    initDB() {
        const req = indexedDB.open('SmartDashboardDB', 2);  // Версия 2!
        
        req.onupgradeneeded = e => {
            const db = e.target.result;
            console.log('🗄️ Создаём stores...');
            
            // Tasks
            if (!db.objectStoreNames.contains('tasks')) {
                const taskStore = db.createObjectStore('tasks', {keyPath: 'id', autoIncrement: true});
                taskStore.createIndex('status', 'status');
            }
            
            // Notes
            if (!db.objectStoreNames.contains('notes')) {
                const noteStore = db.createObjectStore('notes', {keyPath: 'id', autoIncrement: true});
                noteStore.createIndex('type', 'type');
            }
            
            // Tracker
            if (!db.objectStoreNames.contains('tracker')) {
                db.createObjectStore('tracker', {keyPath: 'id', autoIncrement: true});
            }
            
            console.log('✅ DB готова');
        };
        
        req.onsuccess = e => {
            this.db = e.target.result;
            console.log('✅ DB подключена');
        };
        
        req.onerror = () => console.error('❌ DB ошибка');
    }
    
    async getTasks() {
        await this.waitDB();
        return new Promise(resolve => {
            const tx = this.db.transaction('tasks', 'readonly');
            tx.objectStore('tasks').getAll().onsuccess = e => resolve(e.target.result || []);
        });
    }
    
    async getNotes() {
        await this.waitDB();
        return new Promise(resolve => {
            const tx = this.db.transaction('notes', 'readonly');
            tx.objectStore('notes').getAll().onsuccess = e => resolve(e.target.result || []);
        });
    }
    
    async saveTask(task) {
        await this.waitDB();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('tasks', 'readwrite');
            const req = tx.objectStore('tasks').add(task);
            req.onsuccess = () => resolve(req.result);
            req.onerror = reject;
        });
    }
    
    async saveNote(note) {
        await this.waitDB();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('notes', 'readwrite');
            const req = tx.objectStore('notes').add(note);
            req.onsuccess = () => resolve(req.result);
            req.onerror = reject;
        });
    }
    
    async waitDB() {
        while (!this.db) {
            await new Promise(r => setTimeout(r, 50));
        }
    }
}

window.DataService = new DataService();
console.log('🗄️ DataService v2');