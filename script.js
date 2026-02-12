let tg = window.Telegram.WebApp;
tg.ready();
tg.expand(); // Разворачиваем на весь экран

// Данные
let userData = null;
let userId = null;
let isAdmin = false;

// DOM элементы
const elements = {
    status: document.getElementById('status'),
    userId: document.getElementById('user_id'),
    nickname: document.getElementById('nickname'),
    regDate: document.getElementById('reg_date'),
    banStatus: document.getElementById('ban_status'),
    adminPanel: document.getElementById('adminPanel'),
    modal: document.getElementById('nickModal'),
    newNickname: document.getElementById('newNickname')
};

// Инициализация
async function init() {
    try {
        // Получаем данные пользователя из Telegram
        const user = tg.initDataUnsafe?.user;
        
        if (!user) {
            showError('Ошибка: не удалось получить данные пользователя');
            return;
        }
        
        userId = user.id;
        isAdmin = tg.initDataUnsafe?.start_param === 'admin'; // Простая проверка
        
        elements.status.textContent = '🟢 Загрузка данных...';
        
        // Загружаем профиль
        await loadUserProfile();
        
    } catch (error) {
        showError('Ошибка загрузки: ' + error.message);
    }
}

// Загрузка профиля
async function loadUserProfile() {
    try {
        // В реальном боте здесь будет fetch к твоему API
        // Сейчас используем заглушку
        setTimeout(() => {
            // Заглушка данных
            userData = {
                user_id: userId,
                nickname: 'Игрок #' + String(userId).slice(-4),
                registered_at: new Date().toLocaleDateString('ru-RU'),
                is_banned: 0
            };
            
            renderProfile();
        }, 500);
        
    } catch (error) {
        showError('Ошибка загрузки профиля');
    }
}

// Отрисовка профиля
function renderProfile() {
    if (!userData) return;
    
    elements.userId.textContent = userData.user_id;
    elements.nickname.textContent = userData.nickname;
    elements.regDate.textContent = userData.registered_at;
    
    // Статус бана
    if (userData.is_banned) {
        elements.banStatus.innerHTML = '⛔ Забанен';
        elements.banStatus.style.color = '#ff4d4d';
    } else {
        elements.banStatus.innerHTML = '✅ Активен';
        elements.banStatus.style.color = '#4caf50';
    }
    
    // Показываем админ панель
    if (isAdmin) {
        elements.adminPanel.style.display = 'block';
    }
    
    elements.status.textContent = '🟢 Онлайн';
}

// Смена ника
async function changeNickname(newNick) {
    if (!newNick || newNick.length < 1 || newNick.length > 32) {
        tg.showAlert('Ник должен быть от 1 до 32 символов');
        return;
    }
    
    elements.status.textContent = '🟡 Сохранение...';
    
    // В реальном боте здесь будет запрос к боту
    setTimeout(() => {
        userData.nickname = newNick;
        elements.nickname.textContent = newNick;
        elements.modal.classList.remove('show');
        elements.status.textContent = '🟢 Онлайн';
        tg.showAlert('✅ Ник успешно изменен!');
    }, 500);
}

// Админ кнопки (затычки)
function handleAdminAction(action) {
    tg.showAlert(`👑 Админ-команда: ${action}\n(заглушка, ничего не делает)`);
    console.log('Admin action:', action);
}

// Ошибка
function showError(message) {
    elements.status.textContent = '🔴 Ошибка';
    tg.showAlert(message);
}

// ========== ОБРАБОТЧИКИ СОБЫТИЙ ==========

// Кнопка редактирования ника
document.getElementById('editNickBtn').addEventListener('click', () => {
    elements.newNickname.value = userData?.nickname || '';
    elements.modal.classList.add('show');
});

// Сохранить ник
document.getElementById('saveNickBtn').addEventListener('click', () => {
    const newNick = elements.newNickname.value.trim();
    changeNickname(newNick);
});

// Отмена
document.getElementById('cancelNickBtn').addEventListener('click', () => {
    elements.modal.classList.remove('show');
});

// Клик вне модалки
window.addEventListener('click', (e) => {
    if (e.target === elements.modal) {
        elements.modal.classList.remove('show');
    }
});

// Админ кнопки
document.querySelectorAll('.admin-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        handleAdminAction(btn.dataset.action);
    });
});

// Запуск
init();