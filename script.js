let tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Данные
let userData = null;
let userId = null;
let isAdmin = false;

// API бота (твой бот должен отвечать на эти запросы)
const API_BASE = "https://api.telegram.org/bot8539530970:AAGjelAMmAOysbwdPhEHlkZh5SsS0iiFYs0"; // Твой токен

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
        const user = tg.initDataUnsafe?.user;
        
        if (!user) {
            showError('Ошибка: не удалось получить данные пользователя');
            return;
        }
        
        userId = user.id;
        
        // Проверяем админа через start_param
        const startParam = tg.initDataUnsafe?.start_param;
        isAdmin = startParam === 'admin';
        
        elements.status.textContent = '🟡 Загрузка данных...';
        
        // Загружаем реальный профиль из БД
        await loadUserProfile();
        
    } catch (error) {
        showError('Ошибка загрузки: ' + error.message);
    }
}

// Загрузка профиля из БД через бота
async function loadUserProfile() {
    try {
        // Отправляем запрос боту через WebApp Data
        tg.sendData(JSON.stringify({
            action: 'get_profile',
            user_id: userId
        }));
        
        // Бот ответит через message WebAppData
        // Этот ответ поймает обработчик ниже
        
        elements.status.textContent = '🟡 Ожидание ответа...';
        
    } catch (error) {
        showError('Ошибка загрузки профиля');
    }
}

// Получение данных от бота
window.Telegram.WebApp.onEvent('webAppData', function(event) {
    try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'profile_data') {
            userData = data.profile;
            renderProfile();
            elements.status.textContent = '🟢 Онлайн';
        } else if (data.type === 'nickname_updated') {
            userData.nickname = data.new_nickname;
            elements.nickname.textContent = data.new_nickname;
            elements.modal.classList.remove('show');
            tg.showAlert('✅ Ник успешно изменен!');
            elements.status.textContent = '🟢 Онлайн';
        } else if (data.type === 'error') {
            showError(data.message);
            elements.status.textContent = '🔴 Ошибка';
        }
    } catch (e) {
        console.error('Error parsing webapp data:', e);
    }
});

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
}

// Смена ника
async function changeNickname(newNick) {
    if (!newNick || newNick.length < 1 || newNick.length > 32) {
        tg.showAlert('Ник должен быть от 1 до 32 символов');
        return;
    }
    
    elements.status.textContent = '🟡 Сохранение...';
    
    // Отправляем запрос на смену ника
    tg.sendData(JSON.stringify({
        action: 'change_nickname',
        user_id: userId,
        new_nickname: newNick
    }));
}

// Админ кнопки (пока заглушки)
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
