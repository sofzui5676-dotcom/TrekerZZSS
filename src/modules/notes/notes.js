class NotesModule {
  constructor() {
    this.notes = JSON.parse(localStorage.getItem('notes')) || [];
    this.container = null;
  }

  async init() {
    this.save();
  }

  render(container) {
    this.container = container;
    container.innerHTML = `
      <div class="card">
        <div class="section-title" style="display:flex;justify-content:space-between;align-items:center">
          <span>📔 Заметки <span class="notes-count" style="color:var(--text-light);font-weight:400">(${this.notes.length})</span></span>
          <button class="btn-primary" id="addNoteBtn" style="width:auto;padding:10px 20px;font-size:14px">➕ Новая</button>
        </div>
        
        <div style="margin-bottom:16px">
          <input type="text" id="notesSearch" class="modal-input" placeholder="🔍 Поиск заметок..." style="width:100%;margin:0">
        </div>
        
        <div class="notes-grid" style="display:grid;gap:12px">
          ${this.renderNotesList()}
        </div>
      </div>
    `;
    this.bindEvents();
  }

  renderNotesList(filter = '') {
    const filtered = this.notes.filter(note => 
      note.content.toLowerCase().includes(filter.toLowerCase())
    );

    if (filtered.length === 0) {
      return `
        <div class="empty-state" style="padding:32px 16px">
          <div class="empty-icon" style="font-size:48px;margin-bottom:12px">📝</div>
          <p class="empty-text">Нет заметок. Создай первую!</p>
        </div>
      `;
    }

    return filtered.map((note, i) => {
      const originalIndex = this.notes.indexOf(note);
      const date = new Date(note.created).toLocaleDateString('ru-RU', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
      return `
        <div class="item" data-index="${originalIndex}" style="cursor:pointer;position:relative">
          <div class="item-content" style="min-width:0">
            <div class="item-title" style="word-break:break-word">${this.escapeHtml(note.content.substring(0, 80))}${note.content.length > 80 ? '...' : ''}</div>
            <div class="item-meta">${date}</div>
          </div>
          <div class="item-actions">
            <button class="btn-icon edit-note" title="Редактировать">✏️</button>
            <button class="btn-icon delete-note" title="Удалить">🗑️</button>
          </div>
        </div>
      `;
    }).join('');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  bindEvents() {
    // Поиск
    const searchInput = document.getElementById('notesSearch');
    if (searchInput) {
      searchInput.oninput = (e) => {
        const grid = document.querySelector('.notes-grid');
        if (grid) grid.innerHTML = this.renderNotesList(e.target.value);
        document.querySelector('.notes-count').textContent = `(${this.notes.filter(n => 
          n.content.toLowerCase().includes(e.target.value.toLowerCase())
        ).length})`;
      };
    }

    // Добавить заметку
    document.getElementById('addNoteBtn')?.addEventListener('click', () => {
      this.showEditor();
    });

    // Делегирование событий для карточек
    document.querySelector('.notes-grid')?.addEventListener('click', (e) => {
      const card = e.target.closest('[data-index]');
      if (!card) return;
      const index = parseInt(card.dataset.index);

      if (e.target.closest('.edit-note')) {
        e.stopPropagation();
        this.editNote(index);
      } else if (e.target.closest('.delete-note')) {
        e.stopPropagation();
        this.deleteNote(index);
      } else {
        // Просмотр полной заметки
        this.viewNote(index);
      }
    });
  }

  async showEditor(editIndex = null) {
    const note = editIndex !== null ? this.notes[editIndex] : null;
    
    const content = `
      <textarea id="noteEditorContent" class="modal-textarea" rows="6" placeholder="Напиши свою мысль... ✨" style="width:100%;margin:0">${note?.content || ''}</textarea>
    `;
    
    const saved = await window.showModuleModal(
      note ? '✏️ Редактировать заметку' : '📝 Новая заметка',
      content,
      () => {
        const content = document.getElementById('noteEditorContent')?.value.trim();
        if (!content) return;
        
        if (editIndex !== null) {
          this.notes[editIndex].content = content;
          this.notes[editIndex].updated = new Date().toISOString();
        } else {
          this.notes.unshift({
            content,
            created: new Date().toISOString(),
            updated: new Date().toISOString()
          });
        }
        this.save();
        this.render(this.container);
        window.showToast(note ? 'Заметка обновлена ✨' : 'Заметка создана 🌸');
      }
    );
  }

  async viewNote(index) {
    const note = this.notes[index];
    if (!note) return;
    
    const date = new Date(note.created).toLocaleDateString('ru-RU', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    
    const content = `
      <div style="text-align:left">
        <div style="font-size:13px;color:var(--text-light);margin-bottom:12px">📅 ${date}</div>
        <div style="white-space:pre-wrap;line-height:1.6;font-size:15px">${this.escapeHtml(note.content)}</div>
      </div>
    `;
    
    await window.showModuleModal('📔 Заметка', content);
  }

  async editNote(index) {
    await this.showEditor(index);
  }

  async deleteNote(index) {
    const confirmed = await window.confirmDialog('Удалить заметку?', 'Это действие нельзя отменить');
    if (confirmed) {
      this.notes.splice(index, 1);
      this.save();
      this.render(this.container);
      window.showToast('Заметка удалена 🗑️');
    }
  }

  save() {
    localStorage.setItem('notes', JSON.stringify(this.notes));
  }
}

window.Core?.registerModule('notes', new NotesModule());