class TasksModule {
  constructor() {
    this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    this.points = parseInt(localStorage.getItem('tasksPoints')) || 0;
  }

  async init() {
  
  }

  render(container) {
    container.innerHTML = `
      <div class="tasks-header">
        <h2>📝 Задачи <span class="points">(${this.points} очков)</span></h2>
        <button class="add-task-btn">➕ Новая задача</button>
      </div>
      <div class="tasks-list"></div>
      <div class="tasks-form" style="display:none;">
        <input id="task-title" placeholder="Название задачи" />
        <textarea id="task-desc" placeholder="Описание"></textarea>
        <div class="form-actions">
          <button id="task-save">Сохранить</button>
          <button id="task-cancel">Отмена</button>
        </div>
      </div>
    `;

    this.renderTasks();
    this.bindEvents();
  }

  renderTasks() {
    const list = document.querySelector('.tasks-list');
    list.innerHTML = this.tasks.map((task, i) => `
      <div class="task-item ${task.done ? 'done' : ''}" data-index="${i}">
        <div class="task-checkbox">
          <input type="checkbox" ${task.done ? 'checked' : ''}>
        </div>
        <div class="task-content">
          <h3>${task.title}</h3>
          <p>${task.desc}</p>
          <small>${new Date(task.created).toLocaleDateString()}</small>
        </div>
        <div class="task-actions">
          <button class="edit-task">✏️</button>
          <button class="delete-task">🗑️</button>
        </div>
      </div>
    `).join('') || '<p style="text-align:center;color:#666;">Нет задач. Добавьте первую!</p>';
  }

  bindEvents() {
    // Add task
    document.querySelector('.add-task-btn').onclick = () => {
      document.querySelector('.tasks-form').style.display = 'block';
      document.querySelector('#task-title').focus();
    };

    // Save task
    document.querySelector('#task-save').onclick = () => this.saveTask();

    // Cancel
    document.querySelector('#task-cancel').onclick = () => {
      document.querySelector('.tasks-form').style.display = 'none';
      this.clearForm();
    };

    // Task interactions
    document.querySelector('.tasks-list').addEventListener('click', (e) => {
      const item = e.target.closest('.task-item');
      if (!item) return;

      const index = parseInt(item.dataset.index);
      
      if (e.target.closest('.task-checkbox input')) {
        this.toggleTask(index);
      } else if (e.target.closest('.edit-task')) {
        this.editTask(index);
      } else if (e.target.closest('.delete-task')) {
        this.deleteTask(index);
      }
    });
  }

  saveTask() {
    const title = document.querySelector('#task-title').value.trim();
    const desc = document.querySelector('#task-desc').value.trim();
    
    if (!title) return;

    this.tasks.push({
      title, desc, done: false, 
      created: new Date().toISOString()
    });

    this.save();
    this.renderTasks();
    document.querySelector('.tasks-form').style.display = 'none';
    this.clearForm();
  }

  toggleTask(index) {
    this.tasks[index].done = !this.tasks[index].done;
    if (this.tasks[index].done) this.points += 10;
    this.save();
    this.renderTasks();
  }

  editTask(index) {
    const task = this.tasks[index];
    document.querySelector('#task-title').value = task.title;
    document.querySelector('#task-desc').value = task.desc;
    document.querySelector('.tasks-form').style.display = 'block';
    
    // Перехватываем save для edit
    document.querySelector('#task-save').onclick = () => {
      this.tasks[index].title = document.querySelector('#task-title').value;
      this.tasks[index].desc = document.querySelector('#task-desc').value;
      this.save();
      this.renderTasks();
      document.querySelector('.tasks-form').style.display = 'none';
      this.clearForm();
    };
  }

  deleteTask(index) {
    if (confirm('Удалить задачу?')) {
      this.tasks.splice(index, 1);
      this.save();
      this.renderTasks();
    }
  }

  clearForm() {
    document.querySelector('#task-title').value = '';
    document.querySelector('#task-desc').value = '';
  }

  save() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  localStorage.setItem('tasksPoints', String(this.points));

  const pointsEl = this.container?.querySelector('.points');
  if (pointsEl) {
    pointsEl.textContent = `(${this.points} очков)`;
  }
  }
}

window.Core.registerModule('tasks', new TasksModule());