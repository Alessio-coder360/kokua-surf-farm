const { google } = require('googleapis');

exports.handler = async (event, context) => {
    try {
        console.log('[DEBUG] update-quiz chiamato');
        
        // Verifica metodo HTTP
        if (event.httpMethod !== 'POST') {
            return {
                statusCode: 405,
                body: JSON.stringify({ error: 'Metodo non consentito' })
            };
        }
        
        // Parse del body
        const { quiz, password } = JSON.parse(event.body);
        
        // Verifica password admin
        const adminPassword = process.env.VITE_ADMIN_PASSWORD || 'Kokua#Surf2025!Admin';
        if (password !== adminPassword) {
            console.log('[DEBUG] Password admin non valida');
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Password non valida' })
            };
        }
        
        console.log('[DEBUG] Quiz ricevuti per aggiornamento:', quiz?.length || 0);
        
        // Configura Google Sheets client
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
        
        // Prepara i dati per Google Sheets (header + quiz)
        const values = [
            ['Question', 'Option A', 'Option B', 'Option C', 'Correct'] // Header
        ];
        
        if (Array.isArray(quiz)) {
            quiz.forEach(q => {
                if (q.question && Array.isArray(q.options) && q.options.length >= 3 && q.correct) {
                    values.push([
                        q.question,
                        q.options[0] || '',
                        q.options[1] || '',
                        q.options[2] || '',
                        q.correct
                    ]);
                }
            });
        }
        
        console.log('[DEBUG] Righe da scrivere nel foglio Quiz:', values.length);
        
        // Pulisci e riscrivi tutto il foglio Quiz
        await sheets.spreadsheets.values.clear({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Quiz!A:E',
        });
        
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Quiz!A1',
            valueInputOption: 'RAW',
            requestBody: {
                values: values
            }
        });
        
        console.log('[DEBUG] Quiz aggiornati con successo nel foglio');
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ 
                success: true, 
                message: 'Quiz aggiornati con successo',
                count: values.length - 1 // Escludi header
            })
        };
        
    } catch (error) {
        console.error('[ERROR] Errore in update-quiz:', error);
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
