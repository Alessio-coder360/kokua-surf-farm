
// Libreria Google APIs
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

/**
 * Netlify Function: update-programma.js
 *
 * Scopo: Permette di aggiornare e leggere il programma su Google Sheets tramite API.
 * - POST: aggiorna il programma
 * - GET: legge il programma
 *
 * Come funziona:
 * - Riceve una richiesta POST con un body JSON: { password, programma }
 * - Riceve una richiesta GET senza body
 * - Controlla che la password sia corretta (usando la variabile ambiente Netlify)
 * - Se la password è giusta, aggiorna il Google Sheet
 * - Restituisce 200 OK se tutto va bene, 401 se la password è sbagliata, 500 se c'è un errore interno
 *
 * Debug: usa console.log per vedere i dati in Netlify Functions logs
 *
 * ID Google Sheet: lo trovi nell'URL del foglio tra /d/ e /edit (es: https://docs.google.com/spreadsheets/d/ID/edit)
 */

exports.handler = async (event) => {
  // ID del Google Sheet (inserito dall'utente)
  const sheetId = '1IdVINEPuLVArGEiK_IW2R182RX75TO3VlO13vXlHkAU'; // <-- ID CORRETTO

  // Percorso file credenziali
  const credsPath = path.join(__dirname, 'creds.json');
  // Carica credenziali Google
  const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));

  // Autenticazione Google
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });

  // --- Gestione richiesta POST (aggiorna programma) ---
  if (event.httpMethod === 'POST') {
    try {
      // Estrai password e programma dal body JSON
      const { password, programma } = JSON.parse(event.body);
      console.log('[DEBUG] Password ricevuta:', password);
      console.log('[DEBUG] Programma ricevuto:', programma);

      // Controlla la password admin (impostata come variabile ambiente su Netlify)
      if (password !== process.env.VITE_ADMIN_PASSWORD) {
        console.log('[DEBUG] Password errata!');
        return { statusCode: 401, body: 'Unauthorized' };
      }

      // Prepara i dati da scrivere (array di righe)
      // Esempio: programma = [{time: '08:00', activity: 'Yoga'}, ...]
      const values = programma.map(row => [row.time, row.activity]);
      console.log('[DEBUG] Valori da scrivere su Sheets:', values);

      // Scrivi su Google Sheets (sul foglio 'Programma', righe da A2 in poi)
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: 'Programma!A2:B', // Assicurati che il foglio si chiami 'Programma'
        valueInputOption: 'RAW',
        requestBody: { values }
      });
      console.log('[DEBUG] Scrittura su Google Sheets completata');

      return { statusCode: 200, body: 'OK' };
    } catch (err) {
      console.log('[DEBUG] Errore interno:', err.message);
      return { statusCode: 500, body: 'Errore: ' + err.message };
    }
  }

  // --- Gestione richiesta GET (leggi programma) ---
  if (event.httpMethod === 'GET') {
    try {
      // Leggi i dati dal Google Sheet
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'Programma!A2:B', // Assicurati che il foglio si chiami 'Programma'
      });
      console.log('[DEBUG] Dati letti da Sheets:', res.data.values);

      // Trasforma i dati in array di oggetti
      const programma = (res.data.values || []).map(row => ({ time: row[0], activity: row[1] }));
      return {
        statusCode: 200,
        body: JSON.stringify(programma),
        headers: { 'Content-Type': 'application/json' }
      };
    } catch (err) {
      console.log('[DEBUG] Errore lettura Sheets:', err.message);
      return { statusCode: 500, body: 'Errore: ' + err.message };
    }
  }

  // --- Altri metodi non permessi ---
  return { statusCode: 405, body: 'Method Not Allowed' };
};

/**
 * Netlify Function: update-programma.js
 *
 * Scopo: Permette di aggiornare in modo sicuro il file programma.json lato server tramite una richiesta POST protetta da password admin.
 *
 * Come funziona:
 * - Riceve una richiesta POST con un body JSON: { password, programma }
 * - Controlla che la password sia corretta (usando la variabile ambiente Netlify)
 * - Se la password è giusta, sovrascrive il file programma.json con il nuovo programma
 * - Restituisce 200 OK se tutto va bene, 401 se la password è sbagliata, 500 se c'è un errore interno
 *
 * Ogni riga spiegata:
 * - if (event.httpMethod !== 'POST') ... : accetta solo richieste POST per sicurezza (evita modifiche accidentali via GET)
 * - JSON.parse(event.body): estrae i dati inviati dal client (browser)
 * - if (password !== process.env.VITE_ADMIN_PASSWORD): controlla che la password inviata sia uguale a quella segreta su Netlify
 * - path.join(__dirname, ...): costruisce il percorso assoluto al file da aggiornare
 * - fs.writeFileSync(...): sovrascrive il file con il nuovo contenuto
 * - catch: intercetta e gestisce eventuali errori, restituendo un messaggio chiaro
 *
 * Debug avanzato:
 * - Puoi temporaneamente restituire nel body la password ricevuta e quella di ambiente per capire se c'è un mismatch (come abbiamo fatto con il return JSON di debug)
 * - Puoi usare console.log, ma su Netlify i log sono visibili solo nella dashboard delle funzioni (non sempre in produzione)
 *
 * Come usare gli strumenti browser (Inspector):
 * - Apri F12 → Network → Filtra per richieste POST → Seleziona la chiamata a /.netlify/functions/update-programma
 * - Nella tab Response vedi la risposta della funzione (utile per debug password, errori, ecc.)
 * - Nella tab Request Payload vedi i dati inviati dal browser
 *
 * Quando usare questo tipo di debug:
 * - Quando hai errori 401/500 e vuoi capire se il problema è lato client (password sbagliata) o server (variabile ambiente, path, ecc.)
 * - Quando vuoi vedere esattamente cosa riceve e cosa restituisce la funzione serverless
 *
 * Best practice:
 * - Rimuovi sempre i return di debug e i log sensibili prima di andare in produzione
 * - Commenta il codice per ricordare a te stesso (o ad altri) lo scopo di ogni blocco
 */

exports.handler = async (event) => {
  // Accetta solo richieste POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Estrai password e programma dal body JSON
    const { password, programma } = JSON.parse(event.body);

    // Controlla la password admin (impostata come variabile ambiente su Netlify)
    if (password !== process.env.VITE_ADMIN_PASSWORD) {
      return { statusCode: 401, body: 'Unauthorized' };
    }

    // Percorso assoluto al file programma.json
    const filePath = path.join(__dirname, '../../data/programma.json');
    // Sovrascrivi il file con il nuovo programma
    fs.writeFileSync(filePath, JSON.stringify(programma, null, 2), 'utf8');

    // Tutto ok
    return { statusCode: 200, body: 'OK' };
  } catch (err) {
    // Errore interno
    return { statusCode: 500, body: 'Errore: ' + err.message };
  }
};
