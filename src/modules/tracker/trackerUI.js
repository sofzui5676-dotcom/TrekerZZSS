const TrackerUI = {
    render(container, stats) {
        container.innerHTML = `
        <div class="module-header">
            <h2>📈 Ваш прогресс</h2>
            <div class="level-badge">Уровень ${Math.floor(stats.totalPoints / 100) + 1}</div>
        </div>
        
        <!-- Маскот (ТЗ 5.3.4) -->
        <div class="mascot-container">
            <div class="mascot mascot--happy">
                <div class="mascot-face">😊</div>
                <div class="mascot-body">🚀</div>
                <p class="mascot-speech">Супер! Продолжай в том же духе!</p>
            </div>
        </div>
        
        <!-- Статистика -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${stats.totalPoints}</div>
                <div class="stat-label">Всего баллов</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.completedTasks}</div>
                <div class="stat-label">Задач выполнено</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.notesCount}</div>
                <div class="stat-label">Заметок</div>
            </div>
            <div class="stat-card streak">
                <div class="stat-value">${stats.streak}🔥</div>
                <div class="stat-label">Текущий стрик</div>
            </div>
        </div>
        
        <!-- Прогресс-бар -->
        <div class="progress-section">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${Math.min((stats.totalPoints % 100), 100)}%"></div>
            </div>
            <span>До следующего уровня: ${100 - (stats.totalPoints % 100)} баллов</span>
        </div>
        `;
    }
};
