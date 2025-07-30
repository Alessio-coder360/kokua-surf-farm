const { GoogleSpreadsheet } = require('googleapis');

exports.handler = async (event, context) => {
    try {
        console.log('[DEBUG] get-quiz chiamato');
        
        // Configura Google Sheets client
        const { google } = require('googleapis');
        const sheets = google.sheets('v4');
        
        // Autenticazione con service account
        const auth = new google.auth.GoogleAuth({
            credentials: {
                type: 'service_account',
                project_id: process.env.GOOGLE_PROJECT_ID,
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        
        const authClient = await auth.getClient();
        google.options({ auth: authClient });
        
        // ID del foglio Google Sheets Quiz
        const SPREADSHEET_ID = '1zEtEXkGwcMXkNzLD8vWpkr8EVnkBbG2bc_j-2vApU3A';
        
        // Leggi i dati dal foglio "Surfcamp Quiz" (A:E = question, option1, option2, option3, correct)
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Surfcamp Quiz!A:E', // Foglio "Surfcamp Quiz" colonne A-E
        });
        
        const rows = response.data.values || [];
        console.log('[DEBUG] Righe lette dal foglio Quiz:', rows.length);
        
        if (rows.length <= 1) {
            console.log('[DEBUG] Nessun quiz trovato nel foglio, restituisco array vuoto');
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify([])
            };
        }
        
        // Salta la prima riga (header) e processa i quiz
        const quizList = [];
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (row.length >= 5 && row[0] && row[1] && row[2] && row[3] && row[4]) {
                quizList.push({
                    question: row[0],
                    options: [row[1], row[2], row[3]],
                    correct: row[4] // A, B, o C
                });
            }
        }
        
        console.log('[DEBUG] Quiz processati:', quizList.length);
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify(quizList)
        };
        
    } catch (error) {
        console.error('[ERROR] Errore in get-quiz:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ 
                error: 'Errore interno server', 
                details: error.message 
            })
        };
    }
};
