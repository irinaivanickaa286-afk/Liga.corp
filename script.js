// ====== DATA STORAGE ======
let reports = JSON.parse(localStorage.getItem('reports')) || [];
let chatMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];
let isOwner = false;

const OWNER_PASSWORD = '121212xxx1212';

// ====== PAGE NAVIGATION ======
function goToHome() {
    switchPage('home-page');
    updateRoleIndicator();
}

function goToMainInterface() {
    switchPage('main-interface');
    loadReports();
    updateStatistics();
    updateRoleIndicator();
}

function goToChat() {
    switchPage('chat-page');
    loadChatMessages();
    updateChatRoleIndicator();
    scrollChatToBottom();
}

function switchPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

// ====== OWNER LOGIN ======
function toggleOwnerLogin() {
    document.getElementById('owner-login-modal').classList.toggle('hidden');
}

function loginOwner() {
    const password = document.getElementById('owner-password').value;
    const errorMsg = document.getElementById('login-error');
    
    if (password === OWNER_PASSWORD) {
        isOwner = true;
        errorMsg.textContent = '';
        toggleOwnerLogin();
        document.getElementById('owner-password').value = '';
        updateRoleIndicator();
        updateChatRoleIndicator();
        loadReports(); // Перезагрузить отчеты для владельца
    } else {
        errorMsg.textContent = '❌ Неверный пароль!';
    }
}

function logout() {
    isOwner = false;
    updateRoleIndicator();
    updateChatRoleIndicator();
    loadReports();
}

function updateRoleIndicator() {
    const indicator = document.getElementById('role-indicator');
    if (isOwner) {
        indicator.textContent = '👨‍💼 РАЗРАБОТЧИК';
        indicator.classList.add('owner');
    } else {
        indicator.textContent = '👤 ГОСТЬ';
        indicator.classList.remove('owner');
    }
}

function updateChatRoleIndicator() {
    const indicator = document.getElementById('chat-role-indicator');
    if (isOwner) {
        indicator.textContent = '👨‍💼 РАЗРАБОТЧИК';
        indicator.classList.add('owner');
    } else {
        indicator.textContent = '👤 ГОСТЬ';
        indicator.classList.remove('owner');
    }
}

// ====== REPORT MANAGEMENT ======
function showReportForm() {
    document.getElementById('report-form-container').classList.remove('hidden');
    document.getElementById('submit-report-btn').classList.add('hidden');
}

function hideReportForm() {
    document.getElementById('report-form-container').classList.add('hidden');
    document.getElementById('submit-report-btn').classList.remove('hidden');
    document.getElementById('report-text').value = '';
}

function submitReport() {
    const text = document.getElementById('report-text').value.trim();
    
    if (text === '') {
        alert('⚠️ Пожалуйста, заполните текст отчета!');
        return;
    }
    
    const report = {
        id: Date.now(),
        text: text,
        date: new Date().toLocaleString('ru-RU'),
        status: 'pending', // pending, approved, rejected
        author: isOwner ? 'Разработчик' : 'Гость'
    };
    
    reports.push(report);
    saveReports();
    
    hideReportForm();
    loadReports();
    updateStatistics();
    
    showNotification('✅ Отчет успешно подан!');
}

function saveReports() {
    localStorage.setItem('reports', JSON.stringify(reports));
}

function loadReports() {
    const container = document.getElementById('reports-container');
    container.innerHTML = '';
    
    if (reports.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #00ffff;">📭 Отчетов пока нет</p>';
        return;
    }
    
    reports.forEach(report => {
        const card = createReportCard(report);
        container.appendChild(card);
    });
}

function createReportCard(report) {
    const card = document.createElement('div');
    card.className = 'report-card';
    
    let statusClass = 'status-pending';
    let statusText = '⏳ В работе';
    
    if (report.status === 'approved') {
        statusClass = 'status-approved';
        statusText = '✅ Одобрено';
    } else if (report.status === 'rejected') {
        statusClass = 'status-rejected';
        statusText = '❌ Отказано';
    }
    
    const preview = report.text.substring(0, 100) + (report.text.length > 100 ? '...' : '');
    
    card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
            <span class="report-status ${statusClass}">${statusText}</span>
            <span style="color: #ffa500; font-size: 0.8rem;">${report.author}</span>
        </div>
        <div class="report-date">📅 ${report.date}</div>
        <div class="report-preview">${preview}</div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem;">
            <button class="btn-small btn-primary" onclick="viewReport(${report.id})" style="flex: 2; background: linear-gradient(135deg, #00ff00, #00ffff); color: #0a0e27;">
                👁️ Просмотр
            </button>
            ${isOwner ? `
                <button class="btn-small btn-primary" onclick="approveReport(${report.id})" style="background: #00ff00; color: #0a0e27;">✅</button>
                <button class="btn-small" onclick="rejectReport(${report.id})" style="padding: 0.4rem 0.8rem; background: transparent; border: 1px solid #ff0066; color: #ff0066;">❌</button>
                <button class="btn-small" onclick="deleteReport(${report.id})" style="padding: 0.4rem 0.8rem; background: transparent; border: 1px solid #ff0066; color: #ff0066; font-size: 0.9rem;">🗑️</button>
            ` : ''}
        </div>
    `;
    
    return card;
}

function viewReport(reportId) {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;
    
    const modal = document.getElementById('report-modal');
    const details = document.getElementById('report-details');
    
    let statusClass = 'status-pending';
    let statusText = '⏳ В работе';
    
    if (report.status === 'approved') {
        statusClass = 'status-approved';
        statusText = '✅ Одобрено';
    } else if (report.status === 'rejected') {
        statusClass = 'status-rejected';
        statusText = '❌ Отказано';
    }
    
    let actionsHTML = '';
    if (isOwner) {
        actionsHTML = `
            <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 2px solid #00ff00; display: flex; gap: 1rem; flex-wrap: wrap;">
                <button class="btn-primary" onclick="approveReport(${report.id}); closeReportModal();" style="background: #00ff00; color: #0a0e27; flex: 1;">
                    ✅ ОДОБРЕНО
                </button>
                <button class="btn-secondary" onclick="rejectReport(${report.id}); closeReportModal();" style="flex: 1;">
                    ❌ ОТКАЗАНО
                </button>
                <button class="btn-secondary" onclick="deleteReport(${report.id}); closeReportModal();" style="flex: 1; background: #ff0066; border-color: #ff0066;">
                    🗑️ УДАЛИТЬ
                </button>
            </div>
        `;
    }
    
    details.innerHTML = `
        <h3>ПОЛНЫЙ ОТЧЕТ</h3>
        <div style="margin: 1.5rem 0;">
            <span class="report-status ${statusClass}">${statusText}</span>
            <div class="report-date" style="margin-top: 0.5rem;">📅 ${report.date}</div>
            <div style="color: #ffa500; font-size: 0.9rem; margin-top: 0.5rem;">👤 Автор: ${report.author}</div>
        </div>
        <div style="background: rgba(0, 255, 0, 0.05); border-left: 3px solid #00ff00; padding: 1.5rem; margin: 1.5rem 0; line-height: 1.8;">
            ${report.text}
        </div>
        ${actionsHTML}
    `;
    
    modal.classList.remove('hidden');
}

function closeReportModal() {
    document.getElementById('report-modal').classList.add('hidden');
}

function approveReport(reportId) {
    const report = reports.find(r => r.id === reportId);
    if (report) {
        report.status = 'approved';
        saveReports();
        loadReports();
        updateStatistics();
        showNotification('✅ Отчет одобрен!');
    }
}

function rejectReport(reportId) {
    const report = reports.find(r => r.id === reportId);
    if (report) {
        report.status = 'rejected';
        saveReports();
        loadReports();
        updateStatistics();
        showNotification('❌ Отчет отклонен!');
    }
}

function deleteReport(reportId) {
    if (confirm('⚠️ Это действие полностью удалит отчет для всех пользователей. Вы уверены?')) {
        reports = reports.filter(r => r.id !== reportId);
        saveReports();
        loadReports();
        updateStatistics();
        showNotification('🗑️ Отчет удален!');
    }
}

function updateStatistics() {
    const completed = reports.filter(r => r.status === 'approved').length;
    const rejected = reports.filter(r => r.status === 'rejected').length;
    const pending = reports.filter(r => r.status === 'pending').length;
    const total = reports.length;
    
    document.getElementById('stat-completed').textContent = completed;
    document.getElementById('stat-rejected').textContent = rejected;
    document.getElementById('stat-pending').textContent = pending;
    document.getElementById('stat-total').textContent = total;
}

// ====== CHAT MANAGEMENT ======
function sendChatMessage() {
    const input = document.getElementById('chat-message-input');
    const text = input.value.trim();
    
    if (text === '') return;
    
    const message = {
        id: Date.now(),
        text: text,
        author: isOwner ? 'Разработчик' : 'Гость_' + Math.floor(Math.random() * 1000),
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        isUser: true
    };
    
    chatMessages.push(message);
    saveChatMessages();
    input.value = '';
    loadChatMessages();
    scrollChatToBottom();
}

function handleChatKeypress(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

function saveChatMessages() {
    localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
}

function loadChatMessages() {
    const container = document.getElementById('chat-messages');
    container.innerHTML = '';
    
    if (chatMessages.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #00ffff; margin: auto;">💬 Общий чат пуст. Начните разговор!</div>';
        return;
    }
    
    chatMessages.forEach(msg => {
        const msgElement = document.createElement('div');
        msgElement.className = `chat-message ${msg.isUser ? 'user' : ''}`;
        
        msgElement.innerHTML = `
            <div class="message-bubble ${msg.isUser ? 'user' : 'other'}">
                <div class="message-author">${msg.author}</div>
                <div>${msg.text}</div>
                <div class="message-time">${msg.time}</div>
            </div>
        `;
        
        container.appendChild(msgElement);
    });
}

function scrollChatToBottom() {
    const container = document.getElementById('chat-messages');
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 0);
}

// ====== UTILITIES ======
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #00ff00, #00ffff);
        color: #0a0e27;
        padding: 1rem 1.5rem;
        border-radius: 0;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ====== INITIALIZATION ======
document.addEventListener('DOMContentLoaded', function() {
    updateStatistics();
    updateRoleIndicator();
});

// ====== CLOSE MODAL ON ESCAPE ======
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        document.getElementById('report-modal').classList.add('hidden');
        document.getElementById('owner-login-modal').classList.add('hidden');
    }
});
