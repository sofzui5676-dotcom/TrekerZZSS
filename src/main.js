import { renderAuthView } from "./modules/auth/authView.js";

async function init() {
  console.log('🚀 Smart Dashboard с авторизацией');
  
  const app = document.getElementById('app') || document.getElementById('main-container');
  
  // Показываем auth экран
  renderAuthView(app, async (authData) => {
    console.log('✅ Авторизован:', authData);
    
    // Запускаем основное приложение
    await window.Core.init();
    window.Router.init();
    await window.AuthService.loginGuest(); // для совместимости
    await window.Core.loadModule('tasks');
  });
}

init();