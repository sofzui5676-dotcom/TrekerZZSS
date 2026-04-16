class TrackerModule {
  constructor() {
    this.entries = JSON.parse(localStorage.getItem('trackerEntries')) || {};
    this.container = null;
    this.selectedDate = this.toDateKey(new Date());
    this.moodOptions = [
      { emoji: '😭', label: 'Ужасно', value: 1, color: '#EF9A9A' },
      { emoji: '😔', label: 'Плохо', value: 2, color: '#FFCC80' },
      { emoji: '😐', label: 'Нормально', value: 3, color: '#FFF59D' },
      { emoji: '😊', label: 'Хорошо', value: 4, color: '#A5D6A7' },
      { emoji: '🤩', label: 'Отлично!', value: 5, color: '#80CBC4' }
    ];
  }

  toDateKey(date) {
    return date.toISOString().split('T')[0];
  }

  formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  async init() {
    this.save();
  }

  render(container) {
    this.container = container;
    const entry = this.entries[this.selectedDate];
    
    container.innerHTML = `
      <div class="card">
        <div class="section-title" style="text-align:center;margin-bottom:20px">
          📅 Дневник настроения
        </div>
        
        <!-- Календарь -->
        <div style="background:var(--surface-secondary);border-radius:var(--radius-md);padding:12px;margin-bottom:20px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <button id="prevMonth" class="btn-icon" style="background:var(--surface);font-size:18px">◀</button>
            <span id="currentMonth" style="font-weight:600;font-size:16px"></span>
            <button id="nextMonth" class="btn-icon" style="background:var(--surface);font-size:18px">▶</button>
          </div>
          <div id="calendarGrid" style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center;font-size:12px"></div>
        </div>
        
        <!-- Выбранный день -->
        <div class="card" style="background:var(--surface-secondary);margin-bottom:16px">
          <div style="text-align:center;margin-bottom:16px">
            <div style="font-size:14px;color:var(--text-light)">${this.formatDate(this.selectedDate)}</div>
          </div>
          
          <!-- Выбор настроения -->
          <div style="display:flex;justify-content:center;gap:8px;margin-bottom:16px;flex-wrap:wrap">
            ${this.moodOptions.map(mood => `
              <button class="mood-btn ${entry?.mood === mood.value ? 'selected' : ''}" 
                      data-value="${mood.value}" 
                      style="width:48px;height:48px;border-radius:50%;border:3px solid ${entry?.mood === mood.value ? mood.color : 'var(--border)'};
                             background:${entry?.mood === mood.value ? mood.color + '30' : 'var(--surface)'};
                             font-size:24px;cursor:pointer;transition:all 0.2s ease;display:flex;align-items:center;justify-content:center"
                      onmouseenter="this.style.transform='scale(1.1)'" 
                      onmouseleave="this.style.transform='scale(1)'">
                ${mood.emoji}
              </button>
            `).join('')}
          </div>
          
          <!-- Заметка к дню -->
          <textarea id="dayNote" class="modal-textarea" rows="4" placeholder="Как прошёл день? Напиши пару слов... ✨" style="width:100%;margin:0;margin-bottom:12px">${entry?.note || ''}</textarea>
          
          <!-- Теги/категории -->
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px">
            ${['💪 Спорт', '📚 Учеба', '🎨 Творчество', '👥 Друзья', '🧘 Медитация'].map(tag => `
              <button class="tag-btn ${entry?.tags?.includes(tag) ? 'active' : ''}" 
                      data-tag="${tag}"
                      style="padding:6px 12px;border-radius:20px;font-size:12px;border:1px solid var(--border);
                             background:${entry?.tags?.includes(tag) ? 'var(--primary-light)' : 'var(--surface)'};
                             color:${entry?.tags?.includes(tag) ? 'white' : 'var(--text)'};
                             cursor:pointer;transition:all 0.2s ease">
                ${tag}
              </button>
            `).join('')}
          </div>
          
          <button id="saveDay" class="btn-primary" style="width:100%">💾 Сохранить день</button>
        </div>
        
        <!-- Статистика -->
        <div class="card">
          <div class="section-title" style="margin-bottom:12px">📊 Статистика</div>
          <div id="statsContent">${this.renderStats()}</div>
        </div>
      </div>
    `;
    
    this.renderCalendar();
    this.bindEvents();
  }

  renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    const monthLabel = document.getElementById('currentMonth');
    if (!grid || !monthLabel) return;
    
    const [year, month] = this.selectedDate.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    
    monthLabel.textContent = date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
    
    // Дни недели
    const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    grid.innerHTML = weekdays.map(d => `<div style="color:var(--text-light);font-weight:500;padding:8px 4px">${d}</div>`).join('');
    
    // Первый день месяца
    let firstDay = date.getDay();
    firstDay = firstDay === 0 ? 6 : firstDay - 1; // Пн = 0
    
    // Дни месяца
    const daysInMonth = new Date(year, month, 0).getDate();
    const today = this.toDateKey(new Date());
    
    for (let i = 0; i < firstDay; i++) {
      grid.innerHTML += `<div></div>`;
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const entry = this.entries[dateKey];
      const isToday = dateKey === today;
      const isSelected = dateKey === this.selectedDate;
      const mood = entry?.mood ? this.moodOptions.find(m => m.value === entry.mood) : null;
      
      grid.innerHTML += `
        <button data-date="${dateKey}" class="calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}"
                style="aspect-ratio:1;border-radius:12px;border:none;font-size:13px;cursor:pointer;
                       background:${isSelected ? 'var(--primary)' : isToday ? 'var(--primary-light)' : 'var(--surface)'};
                       color:${isSelected ? 'white' : 'var(--text)'};
                       position:relative;transition:all 0.2s ease"
                onmouseenter="if(!this.classList.contains('selected'))this.style.background='var(--primary-light)';this.style.color='white'"
                onmouseleave="if(!this.classList.contains('selected'))this.style.background='var(--surface)';this.style.color='var(--text)'">
          ${day}
          ${mood ? `<span style="position:absolute;bottom:2px;left:50%;transform:translateX(-50%);font-size:10px">${mood.emoji}</span>` : ''}
        </button>
      `;
    }
  }

  renderStats() {
    const entries = Object.values(this.entries);
    if (entries.length === 0) {
      return `<div class="empty-state" style="padding:20px"><p class="empty-text">Пока нет записей. Начни вести дневник! 🌸</p></div>`;
    }
    
    // Средняя оценка
    const avgMood = entries.filter(e => e.mood).reduce((sum, e) => sum + e.mood, 0) / entries.filter(e => e.mood).length || 0;
    const avgMoodEmoji = this.moodOptions.find(m => Math.abs(m.value - avgMood) < 0.5)?.emoji || '😊';
    
    // Серия дней подряд
    const streak = this.calculateStreak();
    
    // Распределение по тегам
    const tagCount = {};
    entries.forEach(e => {
      e.tags?.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });
    
    return `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
        <div style="text-align:center;padding:12px;background:var(--surface-secondary);border-radius:var(--radius-sm)">
          <div style="font-size:28px;margin-bottom:4px">${avgMoodEmoji}</div>
          <div style="font-size:12px;color:var(--text-light)">Среднее настроение</div>
          <div style="font-weight:600">${avgMood.toFixed(1)}/5</div>
        </div>
        <div style="text-align:center;padding:12px;background:var(--surface-secondary);border-radius:var(--radius-sm)">
          <div style="font-size:28px;margin-bottom:4px">🔥</div>
          <div style="font-size:12px;color:var(--text-light)">Серия дней</div>
          <div style="font-weight:600">${streak} подряд</div>
        </div>
      </div>
      ${Object.keys(tagCount).length > 0 ? `
        <div style="font-size:13px;color:var(--text-light);margin-bottom:8px">Частые активности:</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${Object.entries(tagCount).sort((a,b) => b[1]-a[1]).slice(0,5).map(([tag, count]) => `
            <span style="padding:4px 10px;background:var(--surface-secondary);border-radius:16px;font-size:11px">
              ${tag} <span style="color:var(--text-light)">×${count}</span>
            </span>
          `).join('')}
        </div>
      ` : ''}
    `;
  }

  calculateStreak() {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const key = this.toDateKey(date);
      
      if (this.entries[key]?.mood) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  }

  bindEvents() {
    // Навигация по месяцам
    document.getElementById('prevMonth')?.addEventListener('click', () => {
      const [year, month] = this.selectedDate.split('-').map(Number);
      const prev = new Date(year, month - 2, 1);
      this.selectedDate = this.toDateKey(prev);
      this.renderCalendar();
    });
    
    document.getElementById('nextMonth')?.addEventListener('click', () => {
      const [year, month] = this.selectedDate.split('-').map(Number);
      const next = new Date(year, month, 1);
      this.selectedDate = this.toDateKey(next);
      this.renderCalendar();
    });
    
    // Выбор дня в календаре
    document.getElementById('calendarGrid')?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-date]');
      if (btn) {
        this.selectedDate = btn.dataset.date;
        this.renderCalendar();
        this.updateDayView();
      }
    });
    
    // Выбор настроения
    document.querySelectorAll('.mood-btn')?.forEach(btn => {
      btn.onclick = (e) => {
        document.querySelectorAll('.mood-btn').forEach(b => {
          b.style.borderColor = 'var(--border)';
          b.style.background = 'var(--surface)';
          b.classList.remove('selected');
        });
        const mood = parseInt(btn.dataset.value);
        const moodData = this.moodOptions.find(m => m.value === mood);
        btn.style.borderColor = moodData.color;
        btn.style.background = moodData.color + '30';
        btn.classList.add('selected');
        
        // Авто-сохранение настроения
        this.saveDayEntry({ mood });
        this.renderCalendar();
      };
    });
    
    // Теги
    document.querySelectorAll('.tag-btn')?.forEach(btn => {
      btn.onclick = () => {
        btn.classList.toggle('active');
        const tag = btn.dataset.tag;
        const entry = this.entries[this.selectedDate] || {};
        entry.tags = entry.tags || [];
        
        if (btn.classList.contains('active')) {
          if (!entry.tags.includes(tag)) entry.tags.push(tag);
        } else {
          entry.tags = entry.tags.filter(t => t !== tag);
        }
        this.entries[this.selectedDate] = entry;
      };
    });
    
    // Сохранение дня
    document.getElementById('saveDay')?.addEventListener('click', () => {
      const note = document.getElementById('dayNote')?.value.trim();
      const entry = this.entries[this.selectedDate] || {};
      
      if (note) entry.note = note;
      this.entries[this.selectedDate] = entry;
      
      this.save();
      this.updateDayView();
      window.showToast('День сохранён 🌸');
    });
    
    // Авто-сохранение заметки при потере фокуса
    document.getElementById('dayNote')?.addEventListener('blur', (e) => {
      const note = e.target.value.trim();
      const entry = this.entries[this.selectedDate] || {};
      if (note || entry.note) {
        entry.note = note;
        this.entries[this.selectedDate] = entry;
        this.save();
      }
    });
  }

  updateDayView() {
    const entry = this.entries[this.selectedDate];
    
    // Обновить кнопки настроения
    document.querySelectorAll('.mood-btn')?.forEach(btn => {
      const value = parseInt(btn.dataset.value);
      const moodData = this.moodOptions.find(m => m.value === value);
      const isSelected = entry?.mood === value;
      
      btn.style.borderColor = isSelected ? moodData.color : 'var(--border)';
      btn.style.background = isSelected ? moodData.color + '30' : 'var(--surface)';
      btn.classList.toggle('selected', isSelected);
    });
    
    // Обновить заметку
    const noteEl = document.getElementById('dayNote');
    if (noteEl) noteEl.value = entry?.note || '';
    
    // Обновить теги
    document.querySelectorAll('.tag-btn')?.forEach(btn => {
      const tag = btn.dataset.tag;
      btn.classList.toggle('active', entry?.tags?.includes(tag));
      btn.style.background = entry?.tags?.includes(tag) ? 'var(--primary-light)' : 'var(--surface)';
      btn.style.color = entry?.tags?.includes(tag) ? 'white' : 'var(--text)';
    });
    
    // Обновить статистику
    const statsEl = document.getElementById('statsContent');
    if (statsEl) statsEl.innerHTML = this.renderStats();
  }

  saveDayEntry(partial) {
    const entry = this.entries[this.selectedDate] || {};
    this.entries[this.selectedDate] = { ...entry, ...partial, date: this.selectedDate };
    this.save();
  }

  save() {
    localStorage.setItem('trackerEntries', JSON.stringify(this.entries));
  }

  // Публичный метод для FAB
  async showAddModal() {
    // Открываем редактор для текущего дня
    const noteEl = document.getElementById('dayNote');
    if (noteEl) {
      noteEl.focus();
      window.showToast('Напиши, как прошёл день ✨');
    }
  }
}

// Глобальный экземпляр
window.TrackerInstance = new TrackerModule();
window.Core?.registerModule('tracker', window.TrackerInstance);