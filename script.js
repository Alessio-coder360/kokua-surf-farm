// Configurazione pubblica (sicura per GitHub)
let CONFIG = {
    adminPassword: 'demo123', // Fallback per demo - sovrascritto da variabili ambiente
    instagramUrl: 'https://www.instagram.com/kokuasurfarm?igsh=MXhybHYzNmZjcnhveQ%3D%3D&utm_source=qr',
    sheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms', // Google Sheets ID (pubblico)
    apiKey: '', // API key protetta
    // Protezione accessi
    maxVisitsPerHour: 50, // Limite visite orarie
    accessCode: 'DEMO2025' // Codice protetto
};


// --- Caricamento programma dal file remoto (con fallback locale) ---
async function loadProgram() {
  try {
    // Prova a caricare dal file remoto
    const res = await fetch('/data/programma.json', { cache: "no-store" });
    if (!res.ok) throw new Error('Remote fetch failed');
    const data = await res.json();
    // Aggiorna anche localStorage per fallback futuro
    localStorage.setItem('programma', JSON.stringify(data));
    return data;
  } catch (e) {
    // Se fallisce, usa localStorage
    const local = localStorage.getItem('programma');
    if (local) return JSON.parse(local);
    // Se non c’è nulla, restituisci array vuoto
    return [];
  }
}

// --- Salvataggio programma su Netlify (con fallback locale) ---
async function saveProgram(programma, adminPassword) {
  try {
    // Prova a salvare tramite funzione Netlify
    const res = await fetch('/.netlify/functions/update-programma', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: adminPassword, programma })
    });
    if (!res.ok) throw new Error('Remote save failed');
    // Aggiorna anche localStorage
    localStorage.setItem('programma', JSON.stringify(programma));
    return true;
  } catch (e) {
    // Se fallisce, salva solo in localStorage
    localStorage.setItem('programma', JSON.stringify(programma));
    return false;
  }
}

// Carica variabili d'ambiente Netlify se disponibili (solo se presenti)
if (typeof process !== 'undefined' && process.env) {
    CONFIG.adminPassword = process.env.VITE_ADMIN_PASSWORD || CONFIG.adminPassword;
    CONFIG.accessCode = process.env.VITE_ACCESS_CODE || CONFIG.accessCode;
    CONFIG.apiKey = process.env.VITE_API_KEY || CONFIG.apiKey;
}

// Aggiorna configurazione con dati privati se disponibili
function updateConfigFromPrivate() {
    if (typeof PRIVATE_CONFIG !== 'undefined' && PRIVATE_CONFIG) {
        CONFIG.adminPassword = PRIVATE_CONFIG.adminPassword || CONFIG.adminPassword;
        CONFIG.accessCode = PRIVATE_CONFIG.accessCode || CONFIG.accessCode;
        CONFIG.apiKey = PRIVATE_CONFIG.apiKey || CONFIG.apiKey;
        console.log('🔐 Configurazione privata caricata');
    } else {
        console.log('🔓 Modalità demo - config pubblico');
    }
}

// Stato dell'applicazione
let appState = {
    isAdminLoggedIn: false,
    quizList: [], // array di domande
    quizIndex: 0, // domanda attuale
    quizAnswers: [], // risposte utente
    quizSubmitted: false,
    selectedRating: null,
    tempProgram: null // Programma temporaneo per editing admin
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
    quiz: [
        {
            question: 'Qual è la condizione ideale del vento per il surf?',
            options: [
                'Vento offshore (da terra verso mare)',
                'Vento onshore (da mare verso terra)',
                'Vento laterale'
            ],
            correct: 'A'
        },
        {
            question: 'Qual è la tavola più adatta per un principiante?',
            options: [
                'Shortboard',
                'Longboard',
                'Gun'
            ],
            correct: 'B'
        },
        {
            question: 'Cosa significa "duck dive"?',
            options: [
                'Tuffarsi sotto l’onda con la tavola',
                'Saltare sull’onda',
                'Girare la tavola in aria'
            ],
            correct: 'A'
        },
        {
            question: 'Qual è il segnale universale per chiedere aiuto in acqua?',
            options: [
                'Alzare un braccio',
                'Fischiare',
                'Battere la tavola sull’acqua'
            ],
            correct: 'A'
        }
    ]
};

// Inizializzazione app
document.addEventListener('DOMContentLoaded', function() {
    // Aggiorna config con dati privati se disponibili
    updateConfigFromPrivate();
    
    checkAccessLimits();
    initializeApp();

    // Precompila campo password admin SOLO in locale se PRIVATE_CONFIG presente
    if ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && typeof PRIVATE_CONFIG !== 'undefined' && PRIVATE_CONFIG && PRIVATE_CONFIG.adminPassword) {
        const adminPasswordInput = document.getElementById('admin-password');
        if (adminPasswordInput) {
            adminPasswordInput.value = PRIVATE_CONFIG.adminPassword;
        }
    }
    
    // --- Admin panel navigation (solo Programma e Quiz) ---
    function showAdminSection(section) {
        document.querySelectorAll('.admin-section').forEach(s => s.classList.add('hidden'));
        document.getElementById('admin-section-' + section).classList.remove('hidden');
        document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('bg-blue-100', 'text-blue-700'));
        document.getElementById('admin-tab-' + section).classList.add('bg-blue-100', 'text-blue-700');
    }
    // Tabs (solo program e quiz)
    const tabIds = ['program', 'quiz'];
    tabIds.forEach(tab => {
        const btn = document.getElementById('admin-tab-' + tab);
        if (btn) btn.onclick = () => showAdminSection(tab);
    });
    // Frecce/carousel (solo tra program e quiz)
    const navMap = [
        {from: 'program', to: 'quiz', btn: 'to-quiz'},
        {from: 'quiz', to: 'program', btn: 'to-program'}
    ];
    navMap.forEach(nav => {
        const btn = document.getElementById(nav.btn);
        if (btn) btn.onclick = () => showAdminSection(nav.to);
    });
    // Default: mostra Programma
    if (document.getElementById('admin-section-program')) showAdminSection('program');

    // Semplifica pulsanti chiudi: lascia solo close-admin
    const closeAlt = document.getElementById('close-admin-alt');
    if (closeAlt) closeAlt.style.display = 'none';
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
    // Carica il programma dal file remoto (con fallback locale)
    loadProgram().then(programma => renderProgram(programma));
    loadQuiz();
    setupEventListeners();
    loadSettings();
}

function setupEventListeners() {
    // Chiudi pannello admin (Annulla modifiche)
    const closeAdminBtn = document.getElementById('close-admin');
    if (closeAdminBtn) closeAdminBtn.addEventListener('click', closeAdminPanel);
    const adminLoginBtn = document.getElementById('admin-login');
    if (adminLoginBtn) adminLoginBtn.addEventListener('click', handleAdminLogin);
    // Admin toggle
    const adminToggle = document.getElementById('admin-toggle');
    if (adminToggle) adminToggle.addEventListener('click', toggleAdminPanel);


    const closeAdminLogin = document.getElementById('close-admin-login');
    if (closeAdminLogin) closeAdminLogin.addEventListener('click', closeAdminPanel);

    const submitFeedbackBtn = document.getElementById('submit-feedback');
    if (submitFeedbackBtn) submitFeedbackBtn.addEventListener('click', submitFeedback);

    // WhatsApp share
    const shareWhatsappBtn = document.getElementById('share-whatsapp');
    if (shareWhatsappBtn) shareWhatsappBtn.addEventListener('click', shareOnWhatsApp);
}

// Gestione programma

// Rendering del programma: accetta array di oggetti [{time, activity}] o array di stringhe legacy
function renderProgram(program) {
    const programContainer = document.getElementById('daily-program');
    if (!Array.isArray(program) || !program.length) {
        programContainer.innerHTML = '<div class="text-white text-center py-4">Nessuna attività programmata.</div>';
        return;
    }
    let tableRows = program.map(row => {
        if (typeof row === 'object' && row.time && row.activity) {
            // Nuovo formato JSON
            return `<tr>
                <td class="px-3 py-2 border-b border-white/20 text-blue-200 font-mono text-sm">${row.time}</td>
                <td class="px-3 py-2 border-b border-white/20 text-white text-sm">${row.activity}</td>
            </tr>`;
        } else if (typeof row === 'string') {
            // Vecchio formato stringa
            const match = row.match(/^(\d{2}:\d{2})\s*-\s*(.+)$/);
            let time = '', activity = '';
            if (match) {
                time = match[1];
                activity = match[2];
            } else {
                time = '';
                activity = row;
            }
            return `<tr>
                <td class="px-3 py-2 border-b border-white/20 text-blue-200 font-mono text-sm">${time}</td>
                <td class="px-3 py-2 border-b border-white/20 text-white text-sm">${activity}</td>
            </tr>`;
        }
        return '';
    }).join('');
    programContainer.innerHTML = `
        <table class="w-full bg-white/10 rounded-lg overflow-hidden">
            <thead>
                <tr>
                    <th class="px-3 py-2 text-left text-blue-400 text-xs font-bold border-b border-white/30">Time</th>
                    <th class="px-3 py-2 text-left text-blue-400 text-xs font-bold border-b border-white/30">Activity</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    `;
}

// Gestione quiz
function loadQuiz() {
    // Carica quiz multiplo
    const savedQuiz = localStorage.getItem('surfcamp-quiz');
    let quizList = [];
    if (savedQuiz) {
        try {
            const parsed = JSON.parse(savedQuiz);
            quizList = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
            quizList = defaultData.quiz;
        }
    } else {
        quizList = defaultData.quiz;
    }
    appState.quizList = quizList;
    appState.quizIndex = 0;
    appState.quizAnswers = new Array(quizList.length).fill(null);
    appState.quizSubmitted = false;
    renderQuiz();
}

// Rendering quiz carosello
function renderQuiz() {
    const quizSection = document.getElementById('quiz-section');
    const idx = appState.quizIndex;
    const quiz = appState.quizList[idx];
    const total = appState.quizList.length;
    const answered = appState.quizAnswers[idx];
    const submitted = appState.quizSubmitted;

    // Se quiz finito, mostra risultato e animazione onda
    if (submitted) {
        let score = 0;
        appState.quizAnswers.forEach((ans, i) => {
            if (ans === appState.quizList[i].correct) score++;
        });
        quizSection.innerHTML = `
        <div class="bg-white/20 rounded-lg p-4 mb-4 flex flex-col items-center relative overflow-hidden">
            <div class="relative w-full flex flex-col items-center mb-4" style="height:120px;">
                <!-- Onde animate -->
                <div class="absolute left-0 bottom-0 w-full h-24 pointer-events-none overflow-hidden">
                    <div class="wave wave1"></div>
                    <div class="wave wave2"></div>
                    <div class="wave wave3"></div>
                </div>
                <!-- Surfista -->
                <div class="absolute left-1/2 bottom-16 -translate-x-1/2 z-10 surfer-anim">
                    <span style="font-size:2.5rem; filter: drop-shadow(0 2px 6px #0003);">🏄‍♂️</span>
                </div>
            </div>
            <div class="text-2xl font-bold text-blue-700 mb-2 animate-fade-in">Risultato Quiz</div>
            <div class="text-lg text-gray-100 mb-2 animate-fade-in">Hai risposto correttamente a <span class="font-bold">${score} / ${total}</span> domande!</div>
            <div class="text-lg text-blue-400 mb-4 animate-fade-in">🌊🤙 Aloha spirit!</div>
            <button id="quiz-retry" class="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-full font-bold animate-fade-in">Riprova</button>
        </div>
        <style>
        /* Onde animate parallax */
        .wave {
            position: absolute;
            left: 0; bottom: 0;
            width: 200%; height: 60px;
            background-repeat: repeat-x;
            background-size: 50% 60px;
            opacity: 0.7;
        }
        .wave1 {
            background-image: url('data:image/svg+xml;utf8,<svg width="400" height="60" viewBox="0 0 400 60" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 40 Q 50 20 100 40 T 200 40 T 300 40 T 400 40 V60 H0Z" fill="%233b82f6"/></svg>');
            animation: wave-move1 7s linear infinite;
            z-index: 1;
        }
        .wave2 {
            background-image: url('data:image/svg+xml;utf8,<svg width="400" height="60" viewBox="0 0 400 60" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 35 Q 50 55 100 35 T 200 35 T 300 35 T 400 35 V60 H0Z" fill="%233b82f6" fill-opacity="0.7"/></svg>');
            animation: wave-move2 10s linear infinite;
            z-index: 2;
        }
        .wave3 {
            background-image: url('data:image/svg+xml;utf8,<svg width="400" height="60" viewBox="0 0 400 60" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 50 Q 50 30 100 50 T 200 50 T 300 50 T 400 50 V60 H0Z" fill="%233b82f6" fill-opacity="0.4"/></svg>');
            animation: wave-move3 13s linear infinite;
            z-index: 3;
        }
        @keyframes wave-move1 { 0%{transform:translateX(0);} 100%{transform:translateX(-50%);} }
        @keyframes wave-move2 { 0%{transform:translateX(0);} 100%{transform:translateX(-40%);} }
        @keyframes wave-move3 { 0%{transform:translateX(0);} 100%{transform:translateX(-30%);} }
        /* Surfista galleggiante */
        .surfer-anim { animation: surfer-bounce 2.5s ease-in-out infinite; }
        @keyframes surfer-bounce { 0%,100%{transform:translate(-50%,0);} 50%{transform:translate(-50%,-18px);} }
        /* Fade-in testo */
        @keyframes fade-in { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
        .animate-fade-in { animation: fade-in 1s ease; }
        </style>
        `;
        document.getElementById('quiz-retry').onclick = () => {
            appState.quizIndex = 0;
            appState.quizAnswers = new Array(total).fill(null);
            appState.quizSubmitted = false;
            renderQuiz();
        };
        return;
    }

    // Domanda attuale
    quizSection.innerHTML = `
        <div class="bg-white/20 rounded-lg p-4 mb-4">
            <p class="text-white text-lg mb-4" id="quiz-question">${quiz.question}</p>
            <div class="space-y-2" id="quiz-options">
                ${quiz.options.map((option, i) => {
                    const letter = String.fromCharCode(65 + i);
                    let btnClass = 'quiz-option w-full text-left p-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors';
                    if (answered === letter) {
                        btnClass += ' bg-green-500'; // Sempre verde se selezionata
                    }
                    return `<button class="${btnClass}" data-answer="${letter}">${letter}) ${option}</button>`;
                }).join('')}
            </div>
            <div class="flex justify-end mt-6">
                <button id="quiz-next" class="${!answered ? 'opacity-30 pointer-events-none' : ''} bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">${idx === total - 1 ? 'Invia' : 'Avanti'}</button>
            </div>
        </div>
    `;
    // Event listeners risposte
    document.querySelectorAll('.quiz-option').forEach(btn => {
        btn.onclick = (e) => {
            appState.quizAnswers[idx] = e.target.dataset.answer;
            renderQuiz();
        };
    });
    document.getElementById('quiz-next').onclick = () => {
        if (!appState.quizAnswers[idx]) return;
        if (idx < total - 1) {
            appState.quizIndex++;
            renderQuiz();
        } else {
            appState.quizSubmitted = true;
            // Feedback finale con riepilogo
            let score = 0;
            appState.quizAnswers.forEach((ans, i) => {
                if (ans === appState.quizList[i].correct) score++;
            });
            let summary = '<div class="mt-4 text-left w-full max-w-lg mx-auto">';
            summary += '<h4 class="text-lg font-bold text-blue-400 mb-2">Riepilogo risposte:</h4>';
            appState.quizList.forEach((q, i) => {
                const userAns = appState.quizAnswers[i];
                const isCorrect = userAns === q.correct;
                // Trova il testo della risposta data e di quella corretta
                const userText = userAns ? q.options["ABC".indexOf(userAns)] : '-';
                const correctText = q.options["ABC".indexOf(q.correct)];
                summary += `<div class="mb-2 p-2 rounded-lg ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                    <span class="font-bold">${i+1}.</span> ${q.question}<br>
                    <span>Risposta data: <b>${userText}</b></span><br>
                    <span>Corretta: <b>${correctText}</b></span>
                </div>`;
            });
            summary += '</div>';
            quizSection.innerHTML = `
            <div class="bg-white/20 rounded-lg p-4 mb-4 flex flex-col items-center relative overflow-hidden">
                <div class="relative w-full flex flex-col items-center mb-4" style="height:120px;">
                    <!-- Onde animate -->
                    <div class="absolute left-0 bottom-0 w-full h-24 pointer-events-none overflow-hidden">
                        <div class="wave wave1"></div>
                        <div class="wave wave2"></div>
                        <div class="wave wave3"></div>
                    </div>
                    <!-- Surfista -->
                    <div class="absolute left-1/2 bottom-16 -translate-x-1/2 z-10 surfer-anim">
                        <span style="font-size:2.5rem; filter: drop-shadow(0 2px 6px #0003);">🏄‍♂️</span>
                    </div>
                </div>
                <div class="text-2xl font-bold text-blue-700 mb-2 animate-fade-in">Risultato Quiz</div>
                <div class="text-lg text-gray-100 mb-2 animate-fade-in">Hai risposto correttamente a <span class="font-bold">${score} / ${appState.quizList.length}</span> domande!</div>
                <div class="text-lg text-blue-400 mb-4 animate-fade-in">🌊🤙 Aloha spirit!</div>
                ${summary}
                <button id="quiz-retry" class="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-full font-bold animate-fade-in">Riprova</button>
            </div>
            <style>
            /* Onde animate parallax */
            .wave {
                position: absolute;
                left: 0; bottom: 0;
                width: 200%; height: 60px;
                background-repeat: repeat-x;
                background-size: 50% 60px;
                opacity: 0.7;
            }
            .wave1 {
                background-image: url('data:image/svg+xml;utf8,<svg width="400" height="60" viewBox="0 0 400 60" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 40 Q 50 20 100 40 T 200 40 T 300 40 T 400 40 V60 H0Z" fill="%233b82f6"/></svg>');
                animation: wave-move1 7s linear infinite;
                z-index: 1;
            }
            .wave2 {
                background-image: url('data:image/svg+xml;utf8,<svg width="400" height="60" viewBox="0 0 400 60" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 35 Q 50 55 100 35 T 200 35 T 300 35 T 400 35 V60 H0Z" fill="%233b82f6" fill-opacity="0.7"/></svg>');
                animation: wave-move2 10s linear infinite;
                z-index: 2;
            }
            .wave3 {
                background-image: url('data:image/svg+xml;utf8,<svg width="400" height="60" viewBox="0 0 400 60" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 50 Q 50 30 100 50 T 200 50 T 300 50 T 400 50 V60 H0Z" fill="%233b82f6" fill-opacity="0.4"/></svg>');
                animation: wave-move3 13s linear infinite;
                z-index: 3;
            }
            @keyframes wave-move1 { 0%{transform:translateX(0);} 100%{transform:translateX(-50%);} }
            @keyframes wave-move2 { 0%{transform:translateX(0);} 100%{transform:translateX(-40%);} }
            @keyframes wave-move3 { 0%{transform:translateX(0);} 100%{transform:translateX(-30%);} }
            /* Surfista galleggiante */
            .surfer-anim { animation: surfer-bounce 2.5s ease-in-out infinite; }
            @keyframes surfer-bounce { 0%,100%{transform:translate(-50%,0);} 50%{transform:translate(-50%,-18px);} }
            /* Fade-in testo */
            @keyframes fade-in { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
            .animate-fade-in { animation: fade-in 1s ease; }
            </style>
            `;
            document.getElementById('quiz-retry').onclick = () => {
                appState.quizIndex = 0;
                appState.quizAnswers = new Array(appState.quizList.length).fill(null);
                appState.quizSubmitted = false;
                renderQuiz();
            };
        }
    };
}
//
// handleQuizAnswer non serve più, gestito da renderQuiz

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

// Login admin tramite funzione serverless
// MODIFICA: La funzione handleAdminLogin ora gestisce login locale (confronto diretto password) e login Netlify (fetch serverless).
// Se hai problemi su Netlify, puoi ripristinare la versione precedente eliminando il blocco 'isLocal' e lasciando solo la fetch.
// (Vedi storico conversazione Copilot per il codice originale)
function handleAdminLogin() {
    const password = document.getElementById('admin-password').value;
    // Se siamo in locale (no Netlify Functions), confronto diretto
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal) {
        let valid = false;
        if (typeof PRIVATE_CONFIG !== 'undefined' && PRIVATE_CONFIG.adminPassword) {
            valid = password === PRIVATE_CONFIG.adminPassword;
        } else if (typeof CONFIG !== 'undefined' && CONFIG.adminPassword) {
            valid = password === CONFIG.adminPassword;
        }
        if (valid) {
            appState.isAdminLoggedIn = true;
            document.getElementById('admin-login-section').classList.add('hidden');
            document.getElementById('admin-content').classList.remove('hidden');
            loadAdminData();
            showNotification('✅ Accesso admin effettuato!', 'success');
        } else {
            showNotification('❌ Password errata!', 'error');
            document.getElementById('admin-password').value = '';
        }
        return;
    }
    // In produzione: fetch serverless
    fetch('/.netlify/functions/check-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            appState.isAdminLoggedIn = true;
            document.getElementById('admin-login-section').classList.add('hidden');
            document.getElementById('admin-content').classList.remove('hidden');
            loadAdminData();
            showNotification('✅ Accesso admin effettuato!', 'success');
        } else {
            showNotification('❌ Password errata!', 'error');
            document.getElementById('admin-password').value = '';
        }
    })
    .catch(() => {
        showNotification('⚠️ Errore di connessione al server!', 'error');
    });
}

function loadAdminData() {
    // Collega il bottone Salva dopo aver generato la UI admin
    const saveBtn = document.getElementById('save-settings');
    if (saveBtn) saveBtn.onclick = saveSettings;
    // Carica programma corrente SOLO la prima volta o se tempProgram è nullo
    if (!appState.tempProgram) {
        const savedProgram = localStorage.getItem('surfcamp-program');
        appState.tempProgram = savedProgram ? JSON.parse(savedProgram) : [...defaultData.program];
    }
    const program = appState.tempProgram;
    // Editor tabellare per time/activity
    const programEditor = document.getElementById('program-editor');
    if (programEditor) programEditor.style.display = 'none';
    const programTableEditor = document.getElementById('program-table-editor');
    if (programTableEditor) {
        // Se il programma è vuoto, mostra comunque la tabella con una riga vuota
        const safeProgram = Array.isArray(program) && program.length ? program : [' - '];
        // Genera la tabella
        let tableHtml = `<table class="w-full bg-white/10 rounded-lg overflow-hidden mb-2">
            <thead>
                <tr>
                    <th class="px-2 py-2 text-left text-blue-400 text-xs font-bold border-b border-white/30">Time</th>
                    <th class="px-2 py-2 text-left text-blue-400 text-xs font-bold border-b border-white/30">Activity</th>
                    <th class="px-2 py-2 text-xs font-bold border-b border-white/30"></th>
                </tr>
            </thead>
            <tbody>`;
        safeProgram.forEach((row, idx) => {
            const match = row.match(/^([0-9]{2}:[0-9]{2})\s*-\s*(.+)$/);
            let time = '', activity = '';
            if (match) {
                time = match[1];
                activity = match[2];
            } else {
                time = '';
                activity = row;
            }
            tableHtml += `<tr>
                <td><input type="text" class="program-time-input w-full p-1 rounded text-xs" value="${time}" data-idx="${idx}"></td>
                <td><input type="text" class="program-activity-input w-full p-1 rounded text-xs" value="${activity}" data-idx="${idx}"></td>
                <td><button type="button" class="remove-program-row text-red-500 text-lg font-bold" data-idx="${idx}" title="Elimina">&times;</button></td>
            </tr>`;
        });
        tableHtml += `</tbody></table>
            <div class="flex gap-2 mb-2">
                <button id="add-program-row" class="bg-blue-500 text-white px-3 py-1 rounded text-xs font-bold">+ Aggiungi cella</button>
            </div>`;
        programTableEditor.innerHTML = tableHtml;
        // Binding eventi: elimina, aggiungi, modifica
        // Elimina riga
        const removeBtns = programTableEditor.querySelectorAll('.remove-program-row');
        removeBtns.forEach((btn, i) => {
            if (!btn) return;
            btn.onclick = (e) => {
                const idx = parseInt(e.target.dataset.idx);
                appState.tempProgram.splice(idx, 1);
                loadAdminData();
            };
        });
        // Aggiungi riga
        const addBtn = programTableEditor.querySelector('#add-program-row');
        if (addBtn) {
            addBtn.onclick = () => {
                appState.tempProgram.push(' - ');
                loadAdminData();
            };
        }
        // Modifica input
        const timeInputs = programTableEditor.querySelectorAll('.program-time-input');
        const activityInputs = programTableEditor.querySelectorAll('.program-activity-input');
        timeInputs.forEach((input, i) => {
            if (!input) return;
            input.addEventListener('input', () => {
                const idx = parseInt(input.dataset.idx);
                const time = input.value.trim();
                const activity = activityInputs[idx] ? activityInputs[idx].value.trim() : '';
                appState.tempProgram[idx] = time ? `${time} - ${activity}` : activity;
            });
        });
        activityInputs.forEach((input, i) => {
            if (!input) return;
            input.addEventListener('input', () => {
                const idx = parseInt(input.dataset.idx);
                const activity = input.value.trim();
                const time = timeInputs[idx] ? timeInputs[idx].value.trim() : '';
                appState.tempProgram[idx] = time ? `${time} - ${activity}` : activity;
            });
        });
    }

    // Carica quiz multiplo e genera UI dinamica
    const savedQuiz = localStorage.getItem('surfcamp-quiz');
    let quizList = [];
    try {
        const parsed = savedQuiz ? JSON.parse(savedQuiz) : defaultData.quiz;
        quizList = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
        quizList = defaultData.quiz;
    }
    // Nascondi vecchi campi singoli SOLO se esistono
    const qEditor = document.getElementById('quiz-question-editor');
    if (qEditor) qEditor.style.display = 'none';
    const a1 = document.getElementById('quiz-answer1');
    if (a1) a1.style.display = 'none';
    const a2 = document.getElementById('quiz-answer2');
    if (a2) a2.style.display = 'none';
    const a3 = document.getElementById('quiz-answer3');
    if (a3) a3.style.display = 'none';
    const c = document.getElementById('quiz-correct');
    if (c) c.style.display = 'none';
    // Mostra editor multiplo SOLO se esiste
    const quizEditor = document.getElementById('quiz-multi-editor');
    if (quizEditor) {
        quizEditor.style.display = 'block';
        quizEditor.style.maxHeight = '350px';
        quizEditor.style.overflowY = 'auto';
        quizEditor.innerHTML = quizList.map((q, idx) => `
            <div class="quiz-block bg-white/10 rounded-lg p-3 mb-2 relative group flex flex-col gap-2">
                <div class="absolute top-2 right-2 flex gap-2 opacity-70 group-hover:opacity-100 transition">
                    <button type="button" class="remove-quiz-btn text-red-500 hover:text-red-700 text-xl font-bold" data-idx="${idx}" title="Elimina domanda">&times;</button>
                </div>
                <label class="block text-xs text-white font-semibold mb-1">Domanda ${idx+1}</label>
                <input type="text" class="quiz-q-input w-full p-2 rounded-lg text-xs mb-1 border border-white/30 bg-white/20" value="${q.question.replace(/"/g,'&quot;')}">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-2 mb-1">
                    <input type="text" class="quiz-opt-input p-2 rounded-lg text-xs border border-white/30 bg-white/20" value="${q.options[0]||''}" placeholder="Risposta A">
                    <input type="text" class="quiz-opt-input p-2 rounded-lg text-xs border border-white/30 bg-white/20" value="${q.options[1]||''}" placeholder="Risposta B">
                    <input type="text" class="quiz-opt-input p-2 rounded-lg text-xs border border-white/30 bg-white/20" value="${q.options[2]||''}" placeholder="Risposta C">
                </div>
                <label class="block text-xs text-white mb-1">Risposta corretta:</label>
                <select class="quiz-correct-input p-2 rounded-lg text-xs border border-white/30 bg-white/20">
                    <option value="A" ${q.correct==='A'?'selected':''}>A</option>
                    <option value="B" ${q.correct==='B'?'selected':''}>B</option>
                    <option value="C" ${q.correct==='C'?'selected':''}>C</option>
                </select>
            </div>
        `).join('') + `
<!-- coming soon: aggiungi domanda -->
        `;
        // Eventi elimina
        const removeQuizBtns = quizEditor.querySelectorAll('.remove-quiz-btn');
        console.log('[DEBUG] Bottoni Elimina Quiz trovati:', removeQuizBtns.length);
        removeQuizBtns.forEach((btn, i) => {
            if (!btn) {
                console.warn(`[DEBUG] Bottone Elimina Quiz #${i} è null!`);
                return;
            }
            btn.onclick = (e) => {
                const idx = parseInt(e.target.dataset.idx);
                quizList.splice(idx,1);
                saveQuizMultiUI(quizList);
            };
        });
        // Evento aggiungi
        const addQuizBtn = quizEditor.querySelector('#add-quiz-btn');
        if (addQuizBtn) {
            console.log('[DEBUG] Bottone "Aggiungi domanda" quiz trovato:', addQuizBtn);
            addQuizBtn.onclick = () => {
                quizList.push({question:'',options:['','',''],correct:'A'});
                saveQuizMultiUI(quizList);
            };
        } else {
            console.warn('[DEBUG] Bottone "Aggiungi domanda" quiz NON trovato!');
        }
        // Salva lista in un campo nascosto temporaneo
        window._quizMultiEditCache = quizList;
        // Funzione per aggiornare la UI dopo modifica
        function saveQuizMultiUI(newList) {
            window._quizMultiEditCache = newList;
            loadAdminData();
        }
    }

    // Sezione Instagram rimossa
}

function saveSettings() {
    console.log('[DEBUG] saveSettings chiamato');
    console.log('[DEBUG] closeAdminPanel chiamato');
    const saveBtn = document.getElementById('save-settings');
    if (saveBtn) saveBtn.addEventListener('click', saveSettings);
    if (!appState.isAdminLoggedIn) return;


    // Usa sempre la password inserita dall’utente admin
    const adminPasswordInput = document.getElementById('admin-password');
    const passwordToUse = adminPasswordInput ? adminPasswordInput.value : CONFIG.adminPassword;
    // Salva il programma sia su remoto (Netlify Function) che in localStorage (fallback)
    if (Array.isArray(appState.tempProgram)) {
        const cleanProgram = appState.tempProgram.filter(line => line && line.trim());
        // Prova a salvare su remoto, fallback automatico su localStorage
        saveProgram(cleanProgram, passwordToUse).then(success => {
            if (success) {
                console.log('[DEBUG] Programma salvato su remoto:', cleanProgram);
            } else {
                console.log('[DEBUG] Programma salvato solo in localStorage:', cleanProgram);
            }
            // Dopo il salvataggio, aggiorna la vista pubblica
            loadProgram().then(programma => renderProgram(programma));
        });
    }
    // Reset tempProgram per evitare modifiche non salvate
    appState.tempProgram = null;

    // Salva quiz multiplo
    const quizEditor = document.getElementById('quiz-multi-editor');
    if (quizEditor && quizEditor.style.display !== 'none') {
        const blocks = quizEditor.querySelectorAll('.quiz-block');
        const quizList = [];
        blocks.forEach(block => {
            const q = block.querySelector('.quiz-q-input').value.trim();
            const opts = Array.from(block.querySelectorAll('.quiz-opt-input')).map(i=>i.value.trim());
            const correct = block.querySelector('.quiz-correct-input').value;
            // Cambiamento: ora salva sempre la risposta corretta selezionata, anche se domanda e opzioni sono invariate
            if(q && opts[0] && opts[1] && opts[2]) {
                quizList.push({question:q,options:opts,correct});
            }
        });
        localStorage.setItem('surfcamp-quiz', JSON.stringify(quizList));
    } else {
        // fallback: salva singola domanda (retrocompatibilità)
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
    }

    // Ricarica la pagina con i nuovi dati
    loadProgram();
    loadQuiz();
    showNotification('💾 Impostazioni salvate con successo!', 'success');
    setTimeout(() => {
        closeAdminPanel();
        console.log('[DEBUG] Pannello admin chiuso dopo salvataggio programma');
    }, 300);
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
