class TrackerModule {
  constructor() {
    this.entries = JSON.parse(localStorage.getItem('trackerEntries')) || [];
    this.streak = this.calculateStreak();
    // Привычки как свойство класса
    this.habits = [
      {id:'water', name:'Вода (л)', goal:2, icon:'💧'},
      {id:'sport', name:'Спорт (мин)', goal:30, icon:'💪'},
      {id:'reading', name:'Чтение (стр)', goal:20, icon:'📖'},
      {id:'sleep', name:'Сон (часы)', goal:8, icon:'😴'},
      {id:'walk', name:'Прогулка (км)', goal:5, icon:'🚶'}
    ];
    const customHabits = localStorage.getItem('customHabits');
    if (customHabits) {
      this.habits = [...this.habits, ...JSON.parse(customHabits)];
    }
  }

  render(container) {
    container.innerHTML = `
      <div class="tracker-header">
        <div>
          <h2>📈 Привычки</h2>
          <input type="date" id="datePicker" onchange="window.TrackerInstance.loadDay()" style="margin-top:0.5rem;padding:0.75rem;border:2px solid var(--border);border-radius:8px;">
        </div>
        <button class="add-entry-btn" onclick="window.TrackerInstance.showHabitEditor()">➕ Добавить</button>
      </div>
      <div class="habits-grid" id="habitsGrid"></div>
      <div class="day-stats" id="dayStats"></div>
    `;
    this.renderHabits();
    this.loadDay();
  }

  renderHabits() {
    const grid = document.getElementById('habitsGrid');
    if (!grid) return;
    grid.innerHTML = this.habits.map(habit => {
      const todayData = this.getTodayHabit(habit.id);
      const progress = todayData ? (todayData.value / habit.goal * 100) : 0;
      return `
        <div class="habit-card">
          <div class="habit-icon">${habit.icon}</div>
          <div class="habit-name">${habit.name}</div>
          <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
          <div class="habit-value">${todayData?.value || 0}/${habit.goal}</div>
          <input type="number" min="0" max="${habit.goal*2}" value="${todayData?.value || ''}" onchange="window.TrackerInstance.updateHabit('${habit.id}', this.value)" placeholder="0">
          <button onclick="window.TrackerInstance.resetHabit('${habit.id}')">Сброс</button>
        </div>
      `;
    }).join('');
  }

  getTodayHabit(habitId) {
    const today = new Date().toDateString();
    try {
      const data = localStorage.getItem(`${habitId}_${today}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  updateHabit(id, value) {
    const today = new Date().toDateString();
    const habitData = {value: parseFloat(value) || 0, date: today};
    localStorage.setItem(`${id}_${today}`, JSON.stringify(habitData));
    this.renderHabits();
  }

  resetHabit(id) {
    const today = new Date().toDateString();
    localStorage.removeItem(`${id}_${today}`);
    this.renderHabits();
  }

  loadDay() {
    const dateInput = document.getElementById('datePicker');
    const dateStr = dateInput && dateInput.value ? new Date(dateInput.value).toDateString() : new Date().toDateString();
    const stats = document.getElementById('dayStats');
    if (!stats) return;

    let html = `<h3>📅 ${new Date(dateStr).toLocaleDateString('ru-RU')} (${this.habits.length} привычек)</h3>`;
    let completed = 0;
    this.habits.forEach(habit => {
      try {
        const data = localStorage.getItem(`${habit.id}_${dateStr}`);
        if (data) {
          const val = JSON.parse(data).value;
          const done = val >= habit.goal;
          completed += done ? 1 : 0;
          html += `<div class="stat-item"><span>${habit.icon} ${habit.name}</span><span>${val}/${habit.goal} ${done ? '✅' : '❌'}</span></div>`;
        }
      } catch {}
    });
    html += `<div style="margin-top:1rem;padding:1rem;background:var(--success);color:white;border-radius:8px;font-weight:600;">Завершено: ${completed}/${this.habits.length}</div>`;
    stats.innerHTML = html || '<p>Нет данных</p>';
  }

  showHabitEditor() {
  // Создаём модалку если нет
  let modal = document.querySelector('.habit-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'habit-modal';
    modal.innerHTML = `
      <div class="habit-modal-content">
        <h3>➕ Новая привычка</h3>
        <div class="habit-form-row">
          <input id="new-habit-name" placeholder="Название (Сон, Спорт...)">
          <input id="new-habit-goal" type="number" min="1" placeholder="Цель (8, 30...)">
        </div>
        <div class="habit-form-row">
          <input id="new-habit-icon" placeholder="Иконка (😴, 💧...)">
        </div>
        <div class="modal-actions">
          <button class="modal-cancel" onclick="window.TrackerInstance.closeHabitModal()">Отмена</button>
          <button class="modal-save" onclick="window.TrackerInstance.saveNewHabit()">Добавить</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  modal.classList.add('active');
  document.getElementById('new-habit-name').focus();
}

closeHabitModal() {
  const modal = document.querySelector('.habit-modal');
  if (modal) modal.classList.remove('active');
}

saveNewHabit() {
  const name = document.getElementById('new-habit-name').value.trim();
  const goal = parseFloat(document.getElementById('new-habit-goal').value) || 1;
  const icon = document.getElementById('new-habit-icon').value.trim() || '⭐';

  if (!name) {
    alert('Введите название привычки!');
    return;
  }

  // Добавляем в массив привычек
  this.habits.push({id: name.toLowerCase().replace(/\s+/g, '_'), name, goal, icon});
  
  // Сохраняем в localStorage
  localStorage.setItem('customHabits', JSON.stringify(this.habits));
  
  this.renderHabits();
  this.closeHabitModal();
  
  // Очищаем форму
  document.getElementById('new-habit-name').value = '';
  document.getElementById('new-habit-goal').value = '';
  document.getElementById('new-habit-icon').value = '';
  
  // Уведомление
  this.showNotification('✅ Новая привычка добавлена!');
}


// Уведомление (добавьте метод)
showNotification(message) {
  const notif = document.createElement('div');
  notif.className = 'notification notification--success';
  notif.textContent = message;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 3000);
}

  bindEvents() {
    // Пустой - события через window.TrackerInstance
  }

  calculateStreak() { return 0; } // Заглушка

  save() {
    localStorage.setItem('trackerEntries', JSON.stringify(this.entries));
  }
}

// Глобальная ссылка
window.TrackerInstance = new TrackerModule();
window.Core.registerModule('tracker', window.TrackerInstance);
