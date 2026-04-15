class NotesModule {
  constructor() {
    this.notes = JSON.parse(localStorage.getItem('notes')) || [];
  }

  async init() {
    this.save();
  }

  render(container) {
    container.innerHTML = `
      <div class="notes-header">
        <h2>📔 Заметки <span class="notes-count">(${this.notes.length})</span></h2>
        <div class="notes-controls">
          <input id="notes-search" placeholder="🔍 Поиск заметок..." />
          <button class="add-note-btn">➕ Новая заметка</button>
        </div>
      </div>
      
      <div class="notes-grid">
        <!-- Заметки рендерятся динамически -->
      </div>
      
      <div class="note-editor" style="display:none;">
        <textarea id="note-content" placeholder="Напиши заметку..."></textarea>
        <div class="editor-actions">
          <button id="note-save">💾 Сохранить</button>
          <button id="note-cancel">❌ Отмена</button>
        </div>
      </div>
    `;

    this.renderNotes();
    this.bindEvents();
  }

  renderNotes(filter = '') {
    const grid = document.querySelector('.notes-grid');
    const filtered = this.notes.filter(note => 
      note.content.toLowerCase().includes(filter.toLowerCase())
    );

    grid.innerHTML = filtered.map((note, i) => `
      <div class="note-card" data-index="${i}">
        <div class="note-preview">
          ${note.content.substring(0, 100)}${note.content.length > 100 ? '...' : ''}
        </div>
        <div class="note-meta">
          <small>${new Date(note.created).toLocaleDateString()}</small>
          <div class="note-actions">
            <button class="edit-note">✏️</button>
            <button class="delete-note">🗑️</button>
          </div>
        </div>
      </div>
    `).join('') || '<div class="empty-state"><p>📝 Нет заметок. Создай первую!</p></div>';

    document.querySelector('.notes-count').textContent = `(${filtered.length})`;
  }

  bindEvents() {
    // Поиск
    document.querySelector('#notes-search').oninput = (e) => {
      this.renderNotes(e.target.value);
    };

    // Add note
    document.querySelector('.add-note-btn').onclick = () => {
      this.showEditor();
    };

    // Save
    document.querySelector('#note-save').onclick = () => this.saveNote();

    // Cancel
    document.querySelector('#note-cancel').onclick = () => {
      this.hideEditor();
      this.clearEditor();
    };

    // Card actions
    document.querySelector('.notes-grid').addEventListener('click', (e) => {
      const card = e.target.closest('.note-card');
      if (!card) return;

      const index = parseInt(card.dataset.index);
      
      if (e.target.closest('.edit-note')) {
        this.editNote(index);
      } else if (e.target.closest('.delete-note')) {
        this.deleteNote(index);
      }
    });
  }

  showEditor(editIndex = null) {
    this.editingIndex = editIndex;
    document.querySelector('.note-editor').style.display = 'block';
    document.querySelector('#note-content').focus();
    
    if (editIndex !== null) {
      document.querySelector('#note-content').value = this.notes[editIndex].content;
      document.querySelector('#note-save').textContent = '✏️ Обновить';
    }
  }

  hideEditor() {
    document.querySelector('.note-editor').style.display = 'none';
    this.clearEditor();
  }

  clearEditor() {
    document.querySelector('#note-content').value = '';
    document.querySelector('#note-save').textContent = '💾 Сохранить';
    this.editingIndex = null;
  }

  saveNote() {
    const content = document.querySelector('#note-content').value.trim();
    if (!content) return;

    if (this.editingIndex !== null) {
      // Edit
      this.notes[this.editingIndex].content = content;
      this.notes[this.editingIndex].updated = new Date().toISOString();
    } else {
      // New
      this.notes.push({
        content,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      });
    }

    this.save();
    this.renderNotes();
    this.hideEditor();
  }

  editNote(index) {
    this.showEditor(index);
  }

  deleteNote(index) {
    if (confirm('Удалить заметку?')) {
      this.notes.splice(index, 1);
      this.save();
      this.renderNotes();
    }
  }

  save() {
    localStorage.setItem('notes', JSON.stringify(this.notes));
  }
}

window.Core.registerModule('notes', new NotesModule());