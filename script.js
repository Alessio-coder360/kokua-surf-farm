// Configurazione
const CONFIG = {
    adminPassword: 'Surfadmin2025', // Cambia questa password!
    instagramUrl: 'https://instagram.com/tuosurfcamp',
    sheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms', // Sostituisci con il tuo Google Sheets ID
    apiKey: 'AIzaSyBhuTq-RKWnRYfHq3FhO_MLIsaac-AaHlA', // Sostituisci con la tua API key
    // Protezione accessi
    maxVisitsPerHour: 50, // Limite visite orarie
    accessCode: 'KOKUA2025' // Codice accesso opzionale
};

// Stato dell'applicazione
let appState = {
    isAdminLoggedIn: false,
    currentQuiz: null,
    selectedRating: null
};

// Dati di default
const defaultData = {
    program: [
        '07:00 - ☀️ Check-in e colazione',
        '08:00 - 🏄‍♂️ Lezione teorica surf',
        '09:30 - 🌊 Sessione pratica in acqua',
        '12:00 - 🍽️ Pranzo e relax',
        '14:00 - 🏄‍♂️ Sessione pomeridiana',
        '16:30 - 📸 Revisione video e foto',
        '17:30 - 🏆 Feedback e premiazioni'
    ],
    quiz: {
        question: 'Qual è la condizione ideale del vento per il surf?',
        options: [
            'Vento offshore (da terra verso mare)',
            'Vento onshore (da mare verso terra)', 
            'Vento laterale'
        ],
        correct: 'A'
    }
};

// Inizializzazione app
document.addEventListener('DOMContentLoaded', function() {
    checkAccessLimits();
    initializeApp();
});

// Controllo accessi intelligente
function checkAccessLimits() {
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);
    
    // Recupera visite recenti
    let visits = JSON.parse(localStorage.getItem('kokua-visits') || '[]');
    
    // Rimuovi visite più vecchie di 1 ora
    visits = visits.filter(visit => visit > hourAgo);
    
    // Aggiungi visita corrente
    visits.push(now);
    
    // Salva visite aggiornate
    localStorage.setItem('kokua-visits', JSON.stringify(visits));
    
    // Controlla limite
    if (visits.length > CONFIG.maxVisitsPerHour) {
        showAccessLimitWarning();
    }
}

function initializeApp() {
    loadProgram();
    loadQuiz();
    setupEventListeners();
    loadSettings();
}

function setupEventListeners() {
    // Admin toggle
    document.getElementById('admin-toggle').addEventListener('click', toggleAdminPanel);
    document.getElementById('close-admin').addEventListener('click', closeAdminPanel);
    document.getElementById('close-admin-alt').addEventListener('click', closeAdminPanel);
    document.getElementById('admin-login').addEventListener('click', handleAdminLogin);
    document.getElementById('save-settings').addEventListener('click', saveSettings);

    // Enter key nel campo password
    document.getElementById('admin-password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleAdminLogin();
        }
    });

    // Quiz
    document.querySelectorAll('.quiz-option').forEach(button => {
        button.addEventListener('click', handleQuizAnswer);
    });

    // Feedback
    document.querySelectorAll('.feedback-btn').forEach(button => {
        button.addEventListener('click', handleFeedbackRating);
    });
    document.getElementById('submit-feedback').addEventListener('click', submitFeedback);

    // WhatsApp share
    document.getElementById('share-whatsapp').addEventListener('click', shareOnWhatsApp);
}

// Gestione programma
function loadProgram() {
    const programContainer = document.getElementById('daily-program');
    const savedProgram = localStorage.getItem('surfcamp-program');
    const program = savedProgram ? JSON.parse(savedProgram) : defaultData.program;

    programContainer.innerHTML = program.map(activity => `
        <div class="bg-white/20 rounded-lg p-4 text-white flex items-center">
            <div class="mr-4 text-2xl">⏰</div>
            <div class="flex-1">${activity}</div>
        </div>
    `).join('');
}

// Gestione quiz
function loadQuiz() {
    const savedQuiz = localStorage.getItem('surfcamp-quiz');
    const quiz = savedQuiz ? JSON.parse(savedQuiz) : defaultData.quiz;
    appState.currentQuiz = quiz;

    document.getElementById('quiz-question').textContent = quiz.question;
    
    const optionsContainer = document.getElementById('quiz-options');
    optionsContainer.innerHTML = quiz.options.map((option, index) => `
        <button class="quiz-option w-full text-left p-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors" data-answer="${String.fromCharCode(65 + index)}">
            ${String.fromCharCode(65 + index)}) ${option}
        </button>
    `).join('');

    // Riassegna event listeners
    document.querySelectorAll('.quiz-option').forEach(button => {
        button.addEventListener('click', handleQuizAnswer);
    });
}

function handleQuizAnswer(e) {
    const selectedAnswer = e.target.dataset.answer;
    const correct = appState.currentQuiz.correct;
    
    // Reset tutti i bottoni
    document.querySelectorAll('.quiz-option').forEach(btn => {
        btn.classList.remove('bg-green-500', 'bg-red-500');
        btn.classList.add('bg-white/10');
    });

    // Colora la risposta selezionata
    if (selectedAnswer === correct) {
        e.target.classList.remove('bg-white/10');
        e.target.classList.add('bg-green-500');
        showNotification('🎉 Corretto! Ottima risposta!', 'success');
    } else {
        e.target.classList.remove('bg-white/10');
        e.target.classList.add('bg-red-500');
        // Mostra anche quella corretta
        document.querySelector(`[data-answer="${correct}"]`).classList.add('bg-green-500');
        showNotification('❌ Sbagliato! La risposta corretta è evidenziata in verde.', 'error');
    }

    // Mantieni attivi i bottoni per permettere di cambiare risposta
    // Solo evidenzia visualmente la risposta per 2 secondi
    setTimeout(() => {
        document.querySelectorAll('.quiz-option').forEach(btn => {
            btn.classList.remove('bg-green-500', 'bg-red-500');
            btn.classList.add('bg-white/10');
        });
    }, 2000);
}

// Gestione feedback
function handleFeedbackRating(e) {
    appState.selectedRating = e.target.dataset.rating;
    
    // Reset tutti i bottoni
    document.querySelectorAll('.feedback-btn').forEach(btn => {
        btn.classList.remove('scale-125', 'bg-yellow-400', 'rounded-full');
    });

    // Evidenzia il selezionato
    e.target.classList.add('scale-125', 'bg-yellow-400', 'rounded-full');
}

function submitFeedback() {
    if (!appState.selectedRating) {
        showNotification('⚠️ Seleziona prima un rating!', 'warning');
        return;
    }

    const instagramUrl = localStorage.getItem('surfcamp-instagram') || CONFIG.instagramUrl;
    const message = `Ho valutato la mia sessione di surf: ${getFeedbackEmoji(appState.selectedRating)}`;
    
    // Apri Instagram (su mobile aprirà l'app, su desktop il sito)
    window.open(instagramUrl, '_blank');
    
    showNotification(`📸 Perfetto! Condividi la tua esperienza ${getFeedbackEmoji(appState.selectedRating)} su Instagram!`, 'success');
}

function getFeedbackEmoji(rating) {
    const emojis = {
        '1': '😞',
        '2': '😐', 
        '3': '😊',
        '4': '🤩',
        '5': '🏄‍♂️'
    };
    return emojis[rating] || '😊';
}

// WhatsApp sharing
function shareOnWhatsApp() {
    const url = window.location.href;
    const message = `🏄‍♂️ Dai un'occhiata al programma di Kokua Surf Farm! ${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    showNotification('📱 Link WhatsApp generato!', 'success');
}

// Protezione accessi
function showAccessLimitWarning() {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black/90 flex items-center justify-center z-50';
    overlay.innerHTML = `
        <div class="bg-white rounded-xl p-6 max-w-md mx-4 text-center">
            <h3 class="text-xl font-bold mb-4">🏄‍♂️ Kokua Surf Farm</h3>
            <p class="mb-4">Benvenuto! Per accedere al programma riservato ai nostri ospiti, inserisci il codice che hai ricevuto:</p>
            <input type="text" id="access-code" class="w-full p-3 border rounded-lg mb-4" placeholder="Codice ospite (es: KOKUA2025)">
            <div class="flex space-x-2">
                <button onclick="checkAccessCode()" class="flex-1 bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600">
                    🌺 Accedi come Ospite
                </button>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" class="flex-1 bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600">
                    Visualizza Comunque
                </button>
            </div>
            <p class="text-xs text-gray-500 mt-3">Non hai il codice? Contattaci per info!</p>
        </div>
    `;
    document.body.appendChild(overlay);
}

function checkAccessCode() {
    const code = document.getElementById('access-code').value;
    if (code === CONFIG.accessCode) {
        localStorage.setItem('kokua-vip', 'true');
        document.querySelector('.fixed.inset-0.bg-black\\/90').remove();
        showNotification('🌺 Benvenuto nella famiglia Kokua!', 'success');
    } else {
        showNotification('❌ Codice non valido', 'error');
    }
}

// Admin Panel
function toggleAdminPanel() {
    document.getElementById('admin-panel').classList.remove('hidden');
}

function closeAdminPanel() {
    document.getElementById('admin-panel').classList.add('hidden');
    document.getElementById('admin-content').classList.add('hidden');
    document.getElementById('admin-login-section').classList.remove('hidden');
    document.getElementById('admin-password').value = '';
    appState.isAdminLoggedIn = false;
}

function handleAdminLogin() {
    const password = document.getElementById('admin-password').value;
    
    if (password === CONFIG.adminPassword) {
        appState.isAdminLoggedIn = true;
        // Nascondi la sezione login
        document.getElementById('admin-login-section').classList.add('hidden');
        // Mostra il contenuto admin
        document.getElementById('admin-content').classList.remove('hidden');
        loadAdminData();
        showNotification('✅ Accesso admin effettuato!', 'success');
    } else {
        showNotification('❌ Password errata!', 'error');
        // Pulisci il campo password se errata
        document.getElementById('admin-password').value = '';
    }
}

function loadAdminData() {
    // Carica programma corrente
    const savedProgram = localStorage.getItem('surfcamp-program');
    const program = savedProgram ? JSON.parse(savedProgram) : defaultData.program;
    document.getElementById('program-editor').value = program.join('\n');

    // Carica quiz corrente
    const savedQuiz = localStorage.getItem('surfcamp-quiz');
    const quiz = savedQuiz ? JSON.parse(savedQuiz) : defaultData.quiz;
    document.getElementById('quiz-question-editor').value = quiz.question;
    document.getElementById('quiz-answer1').value = quiz.options[0] || '';
    document.getElementById('quiz-answer2').value = quiz.options[1] || '';
    document.getElementById('quiz-answer3').value = quiz.options[2] || '';
    document.getElementById('quiz-correct').value = quiz.correct;

    // Carica Instagram link
    const instagramUrl = localStorage.getItem('surfcamp-instagram') || CONFIG.instagramUrl;
    document.getElementById('instagram-link').value = instagramUrl;
}

function saveSettings() {
    if (!appState.isAdminLoggedIn) return;

    // Salva programma
    const programText = document.getElementById('program-editor').value;
    const programArray = programText.split('\n').filter(line => line.trim());
    localStorage.setItem('surfcamp-program', JSON.stringify(programArray));

    // Salva quiz
    const quizData = {
        question: document.getElementById('quiz-question-editor').value,
        options: [
            document.getElementById('quiz-answer1').value,
            document.getElementById('quiz-answer2').value,
            document.getElementById('quiz-answer3').value
        ],
        correct: document.getElementById('quiz-correct').value
    };
    localStorage.setItem('surfcamp-quiz', JSON.stringify(quizData));

    // Salva Instagram link
    const instagramUrl = document.getElementById('instagram-link').value;
    localStorage.setItem('surfcamp-instagram', instagramUrl);

    // Ricarica la pagina con i nuovi dati
    loadProgram();
    loadQuiz();
    
    showNotification('💾 Impostazioni salvate con successo!', 'success');
    closeAdminPanel();
}

function loadSettings() {
    // Questa funzione può essere espansa per caricare impostazioni aggiuntive
}

// Utility functions
function showNotification(message, type = 'info') {
    // Rimuovi notifiche esistenti
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());

    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };

    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 left-1/2 transform -translate-x-1/2 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-md text-center`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Animazione di entrata
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translate(-50%, 0)';
    }, 10);

    // Rimuovi dopo 3 secondi
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translate(-50%, -20px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Gestione errori globale
window.addEventListener('error', function(e) {
    console.error('Errore nell\'applicazione:', e.error);
    showNotification('⚠️ Si è verificato un errore. Ricarica la pagina.', 'error');
});

// Service Worker per funzionalità offline (opzionale)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registrato'))
            .catch(error => console.log('SW non registrato'));
    });
}
