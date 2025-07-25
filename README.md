# 🏄‍♂️ Surfcamp App - Pagina Dinamica

Una pagina web dinamica per gestire il programma giornaliero del surfcamp, quiz interattivi e feedback dei clienti.

## ✨ Caratteristiche

- **📱 Responsive Design** - Ottimizzata per mobile e desktop
- **🔐 Pannello Admin** - Modifica programmi e quiz in tempo reale
- **🎯 Quiz Interattivi** - Coinvolgi i tuoi clienti con domande sul surf
- **💬 Sistema Feedback** - Raccolta feedback con reindirizzamento Instagram
- **📲 Condivisione WhatsApp** - Link facile da condividere
- **💾 Archiviazione Locale** - Dati salvati nel browser (nessun server richiesto)
- **🎨 Design Surf-Themed** - Colori e animazioni a tema mare

## 🚀 Come Usare

### 1. Apertura Rapida
- Apri `index.html` in un browser web
- Funziona offline, nessuna configurazione richiesta!

### 2. Accesso Admin
- Clicca l'icona ingranaggio in basso a destra
- Password predefinita: `surfadmin2025`
- Modifica programmi, quiz e link Instagram

### 3. Condivisione
- Usa il bottone WhatsApp per inviare il link ai clienti
- I clienti possono visualizzare programmi e fare quiz

## 🛠️ Configurazione

### Cambio Password Admin
Nel file `script.js`, linea 2:
```javascript
adminPassword: 'surfadmin2025', // Cambia questa password!
```

### Personalizzazione Instagram
1. Accedi al pannello admin
2. Modifica il campo "Link Instagram"
3. Salva le impostazioni

### Hosting Gratuito
Per rendere la pagina accessibile online:

1. **GitHub Pages** (Gratuito):
   - Carica i file su un repository GitHub
   - Attiva GitHub Pages nelle impostazioni
   - Ottieni un link pubblico

2. **Netlify** (Gratuito):
   - Trascina la cartella su netlify.com
   - Ottieni un link pubblico istantaneamente

3. **Vercel** (Gratuito):
   - Carica su vercel.com
   - Deploy automatico

## 📋 Struttura File

```
SurfcampApp/
├── index.html      # Pagina principale
├── script.js       # Logica dell'applicazione
├── style.css       # Stili aggiuntivi
└── README.md       # Questa documentazione
```

## 🎯 Funzionalità Dettagliate

### Programma Giornaliero
- Visualizzazione attività orarie
- Modifica facile tramite admin panel
- Salvataggio automatico locale

### Quiz Sistema
- Domande personalizzabili
- Risposte multiple
- Feedback immediato
- Statistiche visive

### Feedback & Instagram
- Rating con emoji
- Reindirizzamento automatico Instagram
- Condivisione esperienza social

### WhatsApp Integration
- Generazione link automatica
- Messaggio pre-compilato
- Apertura app mobile

## 🔧 Personalizzazione Avanzata

### Colori Theme
Modifica in `index.html` la sezione `<style>`:
```css
.wave-bg {
    background: linear-gradient(135deg, #TUO_COLORE1, #TUO_COLORE2);
}
```

### Icone e Emoji
Cambia le icone nella sezione programma:
- ☀️ → 🌅 (alba)
- 🏄‍♂️ → 🌊 (onda)
- 🍽️ → 🥗 (cibo)

### Google Sheets Integration (Avanzato)
Per sincronizzare con Google Sheets:
1. Crea un Google Sheet
2. Attiva Google Sheets API
3. Sostituisci `sheetId` e `apiKey` in `script.js`

## 📱 Compatibilità

- ✅ Chrome, Firefox, Safari, Edge
- ✅ iPhone, Android
- ✅ Tablet e Desktop
- ✅ Modalità offline

## 🆘 Risoluzione Problemi

### La pagina non si carica
- Controlla che tutti i file siano nella stessa cartella
- Apri con un browser moderno

### Admin non funziona
- Verifica la password in `script.js`
- Controlla la console del browser (F12)

### WhatsApp non si apre
- Su desktop si apre WhatsApp Web
- Su mobile deve essere installata l'app WhatsApp

## 🔒 Sicurezza

- Password admin modificabile
- Dati salvati solo localmente
- Nessuna informazione sensibile trasmessa
- HTTPS raccomandato per produzione

## 🎉 Prossimi Miglioramenti

- [ ] Notifiche push
- [ ] Calendario eventi
- [ ] Sistema prenotazioni
- [ ] Chat integrata
- [ ] Statistiche avanzate
- [ ] Multi-lingua

## 📞 Supporto

Per assistenza o personalizzazioni avanzate, crea un issue nel repository o contatta lo sviluppatore.

---

**🏄‍♂️ Buon surf e buon divertimento con la tua app!**



A) Personalizzazione Immediata:
Nome e logo del tuo surfcamp nel header
Colori brand personalizzati
Foto/video background del tuo spot

B) Funzionalità Avanzate (facili da aggiungere):
Meteo integrato per il tuo spot
Galleria foto delle sessioni
Sistema prenotazioni semplice
Mappa del surf spot

C) Business Features:
QR Code per condivisione rapida
Analytics visite (Google Analytics)
Newsletter signup
Recensioni clienti