/**
 * 📅 TrackerModule — Дневник настроения и привычек
 * Полностью переработан под дизайн "Нежного дневника"
 */
class TrackerModule {
  constructor() {
    this.entries = JSON.parse(localStorage.getItem('trackerEntries')) || {};
    this.container = null;
    this.selectedDate = this.toDateKey(new Date());
    this.currentCalendarDate = new Date();
    
    this.moodOptions = [
      { emoji: '😭', label: 'Ужасно', value: 1, color: '#EF9A9A' },
      { emoji: '😔', label: 'Плохо', value: 2, color: '#FFCC80' },
      { emoji: '😐', label: 'Нормально', value: 3, color: '#FFF59D' },
      { emoji: '😊', label: 'Хорошо', value: 4, color: '#A5D6A7' },
      { emoji: '🤩', label: 'Отлично!', value: 5, color: '#80CBC4' }
    ];
    
    this.defaultTags = ['💪 Спорт', '📚 Учеба', '🎨 Творчество', '👥 Друзья', '🧘 Медитация', '☕ Отдых', '🚶 Прогулка', '🍽️ Питание'];
  }

  // === УТИЛИТЫ ===
  
  toDateKey(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // === ИНИЦИАЛИЗАЦИЯ ===

  async init() {
    this.save();
    console.log('📅 TrackerModule initialized');
  }

  render(container) {
if (!container) {
    container = document.getElementById('main-container');
  }
  if (!container) {
    console.warn('⚠️ Контейнер для рендера не найден');
    return;
  }
  this.container = container;    const entry = this.entries[this.selectedDate] || {};
    
    container.innerHTML = `
      <div class="card">
        <div class="section-title" style="text-align:center;margin-bottom:20px">
          📅 Дневник настроения
        </div>
        
        <!-- Календарь -->
        <div style="background:var(--surface-secondary);border-radius:var(--radius-md);padding:12px;margin-bottom:20px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <button id="prevMonth" class="btn-icon" style="background:var(--surface);font-size:18px;width:36px;height:36px">◀</button>
            <span id="currentMonth" style="font-weight:600;font-size:16px"></span>
            <button id="nextMonth" class="btn-icon" style="background:var(--surface);font-size:18px;width:36px;height:36px">▶</button>
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
            ${this.moodOptions.map(mood => {
              const isSelected = entry.mood === mood.value;
              return `
                <button class="mood-btn" data-value="${mood.value}" data-color="${mood.color}"
                        style="width:48px;height:48px;border-radius:50%;border:3px solid ${isSelected ? mood.color : 'var(--border)'};
                               background:${isSelected ? mood.color + '30' : 'var(--surface)'};
                               font-size:24px;cursor:pointer;transition:all 0.2s ease;display:flex;align-items:center;justify-content:center;color:var(--text)">
                  ${mood.emoji}
                </button>
              `;
            }).join('')}
          </div>
          
          <!-- Заметка к дню -->
          <textarea id="dayNote" class="modal-textarea" rows="4" placeholder="Как прошёл день? Напиши пару слов... ✨" style="width:100%;margin:0;margin-bottom:12px;resize:vertical">${this.escapeHtml(entry.note || '')}</textarea>
          
          <!-- Теги -->
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px">
            ${this.defaultTags.map(tag => {
              const isActive = entry.tags?.includes(tag);
              return `
                <button class="tag-btn" data-tag="${this.escapeHtml(tag)}"
                        style="padding:6px 12px;border-radius:20px;font-size:12px;border:1px solid var(--border);
                               background:${isActive ? 'var(--primary-light)' : 'var(--surface)'};
                               color:${isActive ? 'white' : 'var(--text)'};
                               cursor:pointer;transition:all 0.2s ease">
                  ${tag}
                </button>
              `;
            }).join('')}
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
    // ВАЖНО: привязываем события после вставки HTML в DOM
    setTimeout(() => this.bindEvents(), 0);
  }

  // === КАЛЕНДАРЬ ===

  renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    const monthLabel = document.getElementById('currentMonth');
    if (!grid || !monthLabel) return;
    
    const year = this.currentCalendarDate.getFullYear();
    const month = this.currentCalendarDate.getMonth();
    
    // Заголовок месяца
    monthLabel.textContent = new Date(year, month, 1).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
    
    // Дни недели (Пн-Вс)
    const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    grid.innerHTML = weekdays.map(d => 
      `<div style="color:var(--text-light);font-weight:500;padding:8px 4px">${d}</div>`
    ).join('');
    
    // Первый день месяца
    let firstDay = new Date(year, month, 1).getDay();
    firstDay = firstDay === 0 ? 6 : firstDay - 1; // Пн = 0
    
    // Количество дней в месяце
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = this.toDateKey(new Date());
    
    // Пустые ячейки до первого дня
    for (let i = 0; i < firstDay; i++) {
      grid.innerHTML += `<div></div>`;
    }
    
    // Дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const entry = this.entries[dateKey];
      const isToday = dateKey === today;
      const isSelected = dateKey === this.selectedDate;
      const mood = entry?.mood ? this.moodOptions.find(m => m.value === entry.mood) : null;
      
      grid.innerHTML += `
        <button data-date="${dateKey}" class="calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}"
                style="aspect-ratio:1;border-radius:12px;border:none;font-size:13px;cursor:pointer;
                       background:${isSelected ? 'var(--primary)' : isToday ? 'var(--primary-light)' : 'var(--surface)'};
                       color:${isSelected ? 'white' : 'var(--text)'};
                       position:relative;transition:all 0.2s ease;font-weight:${isSelected ? '600' : '400'}"
                aria-label="${dateKey}">
          ${day}
          ${mood ? `<span style="position:absolute;bottom:3px;left:50%;transform:translateX(-50%);font-size:11px;line-height:1">${mood.emoji}</span>` : ''}
        </button>
      `;
    }
  }

  // === СТАТИСТИКА ===

  renderStats() {
    const entries = Object.values(this.entries).filter(e => e.mood || e.note || e.tags?.length);
    
    if (entries.length === 0) {
      return `
        <div class="empty-state" style="padding:20px">
          <p class="empty-text">Пока нет записей. Начни вести дневник! 🌸</p>
        </div>
      `;
    }
    
    // Средняя оценка настроения
    const moodEntries = entries.filter(e => e.mood);
    const avgMood = moodEntries.length > 0 
      ? moodEntries.reduce((sum, e) => sum + e.mood, 0) / moodEntries.length 
      : 0;
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
      const entry = this.entries[key];
      
      if (entry?.mood || entry?.note) {
        streak++;
      } else if (i > 0) {
        // Прерываем серию, если не сегодня пропускаем
        break;
      }
    }
    return streak;
  }

  // === ОБРАБОТЧИКИ СОБЫТИЙ ===

  bindEvents() {
    // Навигация по месяцам
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');
    
    if (prevBtn) {
      prevBtn.onclick = (e) => {
        e.preventDefault();
        this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() - 1);
        this.renderCalendar();
      };
    }
    
    if (nextBtn) {
      nextBtn.onclick = (e) => {
        e.preventDefault();
        this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() + 1);
        this.renderCalendar();
      };
    }
    
    // Выбор дня в календаре (делегирование)
    const calendarGrid = document.getElementById('calendarGrid');
    if (calendarGrid) {
      calendarGrid.onclick = (e) => {
        const btn = e.target.closest('[data-date]');
        if (btn) {
          e.preventDefault();
          this.selectedDate = btn.dataset.date;
          this.renderCalendar();
          this.updateDayView();
        }
      };
    }
    
    // Выбор настроения
    document.querySelectorAll('.mood-btn')?.forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const mood = parseInt(btn.dataset.value);
        const color = btn.dataset.color;
        
        // Визуальное обновление
        document.querySelectorAll('.mood-btn').forEach(b => {
          b.style.borderColor = 'var(--border)';
          b.style.background = 'var(--surface)';
        });
        btn.style.borderColor = color;
        btn.style.background = color + '30';
        
        // Сохранение
        this.saveDayEntry({ mood });
        this.renderCalendar(); // Обновить эмодзи в календаре
        if (typeof window.showToast === 'function') {
          const label = this.moodOptions.find(m => m.value === mood)?.label || '';
          window.showToast(`Настроение: ${label} ${btn.textContent}`, '✨');
        }
      };
    });
    
    // Теги
    document.querySelectorAll('.tag-btn')?.forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        btn.classList.toggle('active');
        const tag = btn.dataset.tag;
        const entry = this.entries[this.selectedDate] || {};
        entry.tags = entry.tags || [];
        
        if (btn.classList.contains('active')) {
          if (!entry.tags.includes(tag)) entry.tags.push(tag);
          btn.style.background = 'var(--primary-light)';
          btn.style.color = 'white';
        } else {
          entry.tags = entry.tags.filter(t => t !== tag);
          btn.style.background = 'var(--surface)';
          btn.style.color = 'var(--text)';
        }
        this.entries[this.selectedDate] = entry;
        // Не сохраняем сразу — дадим пользователю нажать "Сохранить"
      };
    });
    
    // Сохранение дня
    const saveBtn = document.getElementById('saveDay');
    if (saveBtn) {
      saveBtn.onclick = (e) => {
        e.preventDefault();
        this.saveCurrentDay();
      };
    }
    
    // Авто-сохранение заметки при потере фокуса (опционально)
    const noteEl = document.getElementById('dayNote');
    if (noteEl) {
      noteEl.onblur = (e) => {
        const note = e.target.value.trim();
        const entry = this.entries[this.selectedDate] || {};
        if (note !== (entry.note || '')) {
          entry.note = note;
          this.entries[this.selectedDate] = entry;
          this.save(); // Автосохранение только заметки
        }
      };
    }
  }

  // === СОХРАНЕНИЕ ===

  updateDayView() {
    const entry = this.entries[this.selectedDate] || {};
    
    // Обновить кнопки настроения
    document.querySelectorAll('.mood-btn')?.forEach(btn => {
      const value = parseInt(btn.dataset.value);
      const color = btn.dataset.color;
      const isSelected = entry.mood === value;
      
      btn.style.borderColor = isSelected ? color : 'var(--border)';
      btn.style.background = isSelected ? color + '30' : 'var(--surface)';
    });
    
    // Обновить заметку
    const noteEl = document.getElementById('dayNote');
    if (noteEl) {
      noteEl.value = this.escapeHtml(entry.note || '');
    }
    
    // Обновить теги
    document.querySelectorAll('.tag-btn')?.forEach(btn => {
      const tag = btn.dataset.tag;
      const isActive = entry.tags?.includes(tag);
      btn.classList.toggle('active', isActive);
      btn.style.background = isActive ? 'var(--primary-light)' : 'var(--surface)';
      btn.style.color = isActive ? 'white' : 'var(--text)';
    });
    
    // Обновить статистику
    const statsEl = document.getElementById('statsContent');
    if (statsEl) {
      statsEl.innerHTML = this.renderStats();
    }
  }

  saveDayEntry(partial) {
    const entry = this.entries[this.selectedDate] || {};
    this.entries[this.selectedDate] = { 
      ...entry, 
      ...partial, 
      date: this.selectedDate,
      updated: new Date().toISOString()
    };
  }

  saveCurrentDay() {
    const noteEl = document.getElementById('dayNote');
    const note = noteEl?.value.trim() || '';
    
    this.saveDayEntry({ note });
    this.save();
    this.updateDayView();
    
    if (typeof window.showToast === 'function') {
      window.showToast('День сохранён 🌸');
    }
  }

  save() {
    try {
      localStorage.setItem('trackerEntries', JSON.stringify(this.entries));
    } catch (e) {
      console.error('❌ Failed to save tracker:', e);
      if (typeof window.showToast === 'function') {
        window.showToast('Ошибка сохранения ⚠️', '⚠️');
      }
    }
  }

  // === ПУБЛИЧНЫЕ МЕТОДЫ ДЛЯ ИНТЕГРАЦИИ ===

  async showAddModal() {
    // Вызывается при нажатии на FAB
    // Переключаемся на сегодня и фокусируем заметку
    this.selectedDate = this.toDateKey(new Date());
    this.currentCalendarDate = new Date();
    
    if (this.container) {
      this.render(this.container);
    }
    
    // Фокус на поле заметки после рендера
    setTimeout(() => {
      const noteEl = document.getElementById('dayNote');
      if (noteEl) {
        noteEl.focus();
        if (typeof window.showToast === 'function') {
          window.showToast('Напиши, как прошёл день ✨');
        }
      }
    }, 100);
  }

  // Метод для внешней установки даты (например, из календаря в другом модуле)
  selectDate(dateStr) {
    const key = this.toDateKey(dateStr);
    if (key) {
      this.selectedDate = key;
      this.currentCalendarDate = new Date(key);
      if (this.container) {
        this.render(this.container);
      }
    }
  }
}

// === РЕГИСТРАЦИЯ МОДУЛЯ ===

// Создаём экземпляр
const trackerInstance = new TrackerModule();

// Регистрация с проверкой Core
if (typeof window.Core !== 'undefined' && typeof window.Core.registerModule === 'function') {
  window.Core.registerModule('tracker', trackerInstance);
  console.log('✅ TrackerModule registered via Core');
} else {
  // Fallback: глобальная переменная
  window.TrackerModule = trackerInstance;
  console.log('✅ TrackerModule registered globally');
}

// Экспорт для отладки
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TrackerModule;
}