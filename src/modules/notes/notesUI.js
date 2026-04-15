const NotesUI = {
    render(container, notes) {
        container.innerHTML = `
        <div class="module-header">
            <h2>📔 Заметки</h2>
            <div class="module-stats">Всего: ${notes.length}</div>
        </div>
        
        <form id="note-form" class="note-form">
            <textarea name="content" placeholder="Запишите мысль, идею или напоминание..." required></textarea>
            <div class="form-row">
                <select name="type">
                    <option value="text">📄 Текст</option>
                    <option value="reminder">⏰ Напоминание</option>
                </select>
                <button type="submit">💾 Сохранить</button>
            </div>
        </form>
        
        <div class="notes-grid">
            ${notes.map(note => `
                <div class="note-card note-type-${note.type}" data-id="${note.id}">
                    <div class="note-content">${note.content}</div>
                    <div class="note-meta">
                        <span>${new Date(note.date).toLocaleString('ru')}</span>
                        <span class="note-points">+5 баллов</span>
                        <button class="note-delete" data-id="${note.id}">🗑️</button>
                    </div>
                </div>
            `).join('')}
        </div>
        `;
    }
};
