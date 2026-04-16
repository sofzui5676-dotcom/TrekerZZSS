class TasksModule {
  constructor() {
    this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    this.points = parseInt(localStorage.getItem('tasksPoints')) || 0;
    this.container = null;
    this.editingIndex = null;
  }

  async init() {
    this.save();
  }

  render(container) {
    this.container = container;
    const completed = this.tasks.filter(t => t.done).length;
    
    container.innerHTML = `
      <div class="card">
        <div class="section-title" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
          <span>📝 Задачи 
            <span class="task-stats" style="color:var(--text-light);font-weight:400;font-size:14px">
              (${completed}/${this.tasks.length}) • ${this.points} ✨
            </span>
          </span>
          <button class="btn-primary" id="addTaskBtn" style="width:auto;padding:10px 20px;font-size:14px">➕ Добавить</button>
        </div>
        
        <div class="tasks-list" style="display:flex;flex-direction:column;gap:8px;margin-top:16px">
          ${this.renderTasksList()}
        </div>
      </div>
    `;
    this.bindEvents();
  }

  renderTasksList() {
    if (this.tasks.length === 0) {
      return `
        <div class="empty-state" style="padding:32px 16px;margin:0">
          <div class="empty-icon" style="font-size:48px;margin-bottom:12px">✅</div>
          <p class="empty-text">Нет задач. Добавь первую и получи +10 ✨!</p>
        </div>
      `;
    }

    // Сортировка: незавершённые сверху
    const sorted = [...this.tasks].sort((a, b) => {
      if (a.done === b.done) return new Date(b.created) - new Date(a.created);
      return a.done ? 1 : -1;
    });

    return sorted.map(task => {
      const index = this.tasks.indexOf(task);
      const date = new Date(task.created).toLocaleDateString('ru-RU', {
        day: 'numeric', month: 'short'
      });
      return `
        <div class="item ${task.done ? 'done' : ''}" data-index="${index}" style="${task.done ? 'opacity:0.7' : ''}">
          <div class="item-checkbox ${task.done ? 'checked' : ''}" data-action="toggle">
            ${task.done ? '✓' : ''}
          </div>
          <div class="item-content" style="min-width:0;flex:1">
            <div class="item-title" style="${task.done ? 'text-decoration:line-through' : ''}">${this.escapeHtml(task.title)}</div>
            ${task.desc ? `<div class="item-note">${this.escapeHtml(task.desc)}</div>` : ''}
            <div class="item-meta">📅 ${date}${task.done ? ' • ✅' : ''}</div>
          </div>
          <div class="item-actions">
            <button class="btn-icon edit-task" title="Редактировать">✏️</button>
            <button class="btn-icon delete-task" title="Удалить">🗑️</button>
          </div>
        </div>
      `;
    }).join('');
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  bindEvents() {
    // Добавить задачу
    document.getElementById('addTaskBtn')?.addEventListener('click', () => {
      this.editingIndex = null;
      this.showTaskForm();
    });

    // Делегирование событий
    document.querySelector('.tasks-list')?.addEventListener('click', (e) => {
      const item = e.target.closest('[data-index]');
      if (!item) return;
      const index = parseInt(item.dataset.index);

      if (e.target.closest('[data-action="toggle"]') || e.target.closest('.item-checkbox')) {
        this.toggleTask(index);
      } else if (e.target.closest('.edit-task')) {
        e.stopPropagation();
        this.editingIndex = index;
        this.showTaskForm();
      } else if (e.target.closest('.delete-task')) {
        e.stopPropagation();
        this.deleteTask(index);
      }
    });
  }

  async showTaskForm() {
    const task = this.editingIndex !== null ? this.tasks[this.editingIndex] : null;
    
    const content = `
      <input type="text" id="taskTitle" class="modal-input" placeholder="Название задачи *" value="${task?.title || ''}" style="width:100%;margin:0;margin-bottom:12px">
      <textarea id="taskDesc" class="modal-textarea" rows="3" placeholder="Описание (необязательно)" style="width:100%;margin:0">${task?.desc || ''}</textarea>
    `;
    
    await window.showModuleModal(
      task ? '✏️ Редактировать задачу' : '📝 Новая задача',
      content,
      () => this.saveTask()
    );
  }

  saveTask() {
    const title = document.getElementById('taskTitle')?.value.trim();
    const desc = document.getElementById('taskDesc')?.value.trim();
    
    if (!title) {
      window.showToast('Введите название задачи ⚠️', '⚠️');
      return;
    }

    if (this.editingIndex !== null) {
      // Редактирование
      this.tasks[this.editingIndex].title = title;
      this.tasks[this.editingIndex].desc = desc;
      this.tasks[this.editingIndex].updated = new Date().toISOString();
      window.showToast('Задача обновлена ✨');
    } else {
      // Новая задача
      this.tasks.unshift({
        title,
        desc,
        done: false,
        created: new Date().toISOString(),
        points: 10
      });
      window.showToast('Задача создана 🌸');
    }
    
    this.save();
    this.render(this.container);
  }

  toggleTask(index) {
    const task = this.tasks[index];
    if (!task) return;
    
    task.done = !task.done;
    if (task.done) {
      this.points += (task.points || 10);
      window.showToast(`+${task.points || 10} ✨ Отлично!`, '🎉');
    }
    this.save();
    this.render(this.container);
  }

  async deleteTask(index) {
    const confirmed = await window.confirmDialog('Удалить задачу?', 'Это действие нельзя отменить');
    if (confirmed) {
      this.tasks.splice(index, 1);
      this.save();
      this.render(this.container);
      window.showToast('Задача удалена 🗑️');
    }
  }

  save() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
    localStorage.setItem('tasksPoints', String(this.points));
  }

  // Публичный метод для FAB
  async showAddModal() {
    this.editingIndex = null;
    await this.showTaskForm();
  }
}

window.Core?.registerModule('tasks', new TasksModule());