const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {

  // TEST: return immediato per debug
  return { statusCode: 200, body: 'TEST OK - Funzione raggiunta' };

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { password, programma } = JSON.parse(event.body);

    // DEBUG: log temporaneo per capire differenza password
    console.log('[DEBUG] Password ricevuta:', password);
    console.log('[DEBUG] Password ambiente:', process.env.VITE_ADMIN_PASSWORD);
    if (password !== process.env.VITE_ADMIN_PASSWORD) {
      return { statusCode: 401, body: 'Unauthorized' };
    }

    // Percorso assoluto al file programma.json
    const filePath = path.join(__dirname, '../../data/programma.json');
    fs.writeFileSync(filePath, JSON.stringify(programma, null, 2), 'utf8');

    return { statusCode: 200, body: 'OK' };
  } catch (err) {
    return { statusCode: 500, body: 'Errore: ' + err.message };
  }
};
