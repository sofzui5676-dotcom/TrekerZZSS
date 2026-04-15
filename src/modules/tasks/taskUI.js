const TaskUI = {
    render(container, tasks) {
        container.innerHTML = `
        <div class="module-header">
            <h2>📝 Задачи и привычки</h2>
            <div class="module-stats">
                <span>Всего: ${tasks.length}</span>
                <span class="stats-completed">${tasks.filter(t => t.status === 'completed').length} ✅</span>
            </div>
        </div>
        
        <form id="task-form" class="task-form">
            <div class="form-row">
                <input type="text" name="title" placeholder="Что нужно сделать?" required>
                <select name="type">
                    <option value="household">🏠 Бытовые дела</option>
                    <option value="health">💪 Здоровье</option>
                    <option value="custom">⭐ Кастомные</option>
                </select>
                <button type="submit">➕</button>
            </div>
        </form>
        
        <div class="tasks-grid">
            ${tasks.map(task => `
                <div class="task-card ${task.status} task-type-${task.type}" data-id="${task.id}">
                    <div class="task-header">
                        <h3>${task.title}</h3>
                        <span class="task-badge">${this.getTypeIcon(task.type)}</span>
                    </div>
                    <div class="task-meta">
                        <span class="task-date">${new Date(task.date).toLocaleDateString('ru')}</span>
                        ${task.points ? `<span class="task-points">+${task.points} баллов</span>` : ''}
                    </div>
                    <button class="task-toggle" data-id="${task.id}">
                        ${task.status === 'completed' ? '↩️ Отменить' : '✅ Выполнено'}
                    </button>
                </div>
            `).join('')}
        </div>
        `;
    },
    
    getTypeIcon(type) {
        return {
            household: '🏠',
            health: '💪', 
            custom: '⭐'
        }[type] || '📋';
    }
};
