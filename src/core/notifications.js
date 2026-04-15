const NotificationService = {
    show(message, type = 'info') {
        // Внутриприложенные уведомления (ТЗ 5.4.1)
        const notif = document.createElement('div');
        notif.className = `notification notification--${type}`;
        notif.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        document.body.appendChild(notif);
        
        // Автоудаление
        setTimeout(() => notif.remove(), 4000);
        
        notif.querySelector('.notification-close').onclick = () => notif.remove();
    },
    
    taskCompleted(taskTitle, points) {
        this.show(`✅ "${taskTitle}" выполнена! +${points} баллов`, 'success');
    },
    
    noteCreated() {
        this.show('📝 Заметка сохранена! +5 баллов', 'success');
    }
};
