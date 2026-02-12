let tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Токен бота (ПРЯМО В СКРИПТЕ, как ты хочешь)
const BOT_TOKEN = "8539530970:AAGjelAMmAOysbwdPhEHlkZh5SsS0iiFYs0";
const TG_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

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
        const user = tg.initDataUnsafe?.user;
        
        if (!user) {
            showError('Ошибка: не удалось получить данные пользователя');
            return;
        }
        
        userId = user.id;
        isAdmin = tg.initDataUnsafe?.start_param === 'admin';
        
        elements.status.textContent = '🟡 Загрузка данных...';
        
        // Загружаем профиль через Telegram API
        await loadUserProfile();
        
    } catch (error) {
        showError('Ошибка загрузки: ' + error.message);
    }
}

// Загрузка профиля через API бота
async function loadUserProfile() {
    try {
        // 1. Сначала проверим, есть ли пользователь в БД
        const checkResponse = await fetch(`${TG_API}/getProfile?user_id=${userId}`);
        const checkData = await checkResponse.json();
        
        if (checkData.ok && checkData.result) {
            // Пользователь найден
            userData = checkData.result;
            renderProfile();
            elements.status.textContent = '🟢 Онлайн';
        } else {
            // Пользователя нет - регистрируем
            await registerUser();
        }
    } catch (error) {
        console.error('Fetch error:', error);
        showError('Ошибка соединения с ботом');
    }
}

// Регистрация нового пользователя
async function registerUser() {
    try {
        const user = tg.initDataUnsafe?.user;
        const response = await fetch(`${TG_API}/registerUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                nickname: user.first_name,
                registered_at: new Date().toISOString()
            })
        });
        
        const data = await response.json();
        if (data.ok) {
            // После регистрации загружаем профиль
            await loadUserProfile();
        }
    } catch (error) {
        showError('Ошибка регистрации');
    }
}

// Смена ника
async function changeNickname(newNick) {
    if (!newNick || newNick.length < 1 || newNick.length > 32) {
        tg.showAlert('Ник должен быть от 1 до 32 символов');
        return;
    }
    
    elements.status.textContent = '🟡 Сохранение...';
    
    try {
        const response = await fetch(`${TG_API}/updateNickname`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                nickname: newNick
            })
        });
        
        const data = await response.json();
        if (data.ok) {
            userData.nickname = newNick;
            elements.nickname.textContent = newNick;
            elements.modal.classList.remove('show');
            tg.showAlert('✅ Ник успешно изменен!');
            elements.status.textContent = '🟢 Онлайн';
        }
    } catch (error) {
        showError('Ошибка при смене ника');
    }
}

// Отрисовка профиля
function renderProfile() {
    if (!userData) return;
    
    elements.userId.textContent = userData.user_id || userId;
    elements.nickname.textContent = userData.nickname || 'Не указан';
    elements.regDate.textContent = userData.registered_at || 'Неизвестно';
    
    if (userData.is_banned) {
        elements.banStatus.innerHTML = '⛔ Забанен';
        elements.banStatus.style.color = '#ff4d4d';
    } else {
        elements.banStatus.innerHTML = '✅ Активен';
        elements.banStatus.style.color = '#4caf50';
    }
    
    if (isAdmin) {
        elements.adminPanel.style.display = 'block';
    }
}

// Админ кнопки (заглушки)
function handleAdminAction(action) {
    tg.showAlert(`👑 Админ-команда: ${action}\n(заглушка)`);
}

// Ошибка
function showError(message) {
    elements.status.textContent = '🔴 Ошибка';
    tg.showAlert(message);
}

// ========== ОБРАБОТЧИКИ ==========

document.getElementById('editNickBtn').addEventListener('click', () => {
    elements.newNickname.value = userData?.nickname || '';
    elements.modal.classList.add('show');
});

document.getElementById('saveNickBtn').addEventListener('click', () => {
    const newNick = elements.newNickname.value.trim();
    changeNickname(newNick);
});

document.getElementById('cancelNickBtn').addEventListener('click', () => {
    elements.modal.classList.remove('show');
});

window.addEventListener('click', (e) => {
    if (e.target === elements.modal) {
        elements.modal.classList.remove('show');
    }
});

document.querySelectorAll('.admin-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        handleAdminAction(btn.dataset.action);
    });
});

// Запуск
init();
