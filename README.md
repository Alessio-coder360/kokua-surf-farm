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

- ✅ Chrome (Desktop/Mobile)
- ✅ Firefox (Desktop/Mobile)  
- ✅ Safari (iOS/macOS)
- ✅ Edge (Windows)

## 🔧 COMANDI TERMINALI AVANZATI

### 🚨 Diagnostica Problemi File Corrotti

#### 1. Controllo Stato Repository Git
```bash
git status
```
**Cosa mostra:** File modificati, aggiunti, cancellati  
**Quando usare:** Sempre prima di fare modifiche importanti  
**Come interpretare:**
- `modified:` = file cambiato
- `untracked:` = file nuovo
- `deleted:` = file cancellato
- `nothing to commit` = tutto pulito

#### 2. Vedere Prime Righe di un File
```bash
Get-Content nomefile.html | Select-Object -First 10
```
**Cosa mostra:** Prime 10 righe del file  
**Quando usare:** Quando sospetti che un file sia corrotto  
**Come interpretare:**
- Se vedi HTML normale = file OK
- Se vedi codice mescolato = file corrotto
- Se manca `<!DOCTYPE html>` = problema grave

#### 3. Controllo Dimensione File
```bash
Get-ChildItem *.html | Format-Table Name, Length
```
**Cosa mostra:** Nome e dimensione dei file HTML  
**Quando usare:** Per confrontare file prima/dopo modifiche  
**Come interpretare:**
- Dimensioni simili = probabilmente OK
- Dimensione 0 bytes = file vuoto (problema!)
- Dimensione molto diversa = possibile corruzione

#### 4. Backup Automatico Prima di Modifiche
```bash
Copy-Item index.html index_backup_$(Get-Date -Format "yyyyMMdd_HHmmss").html
```
**Cosa fa:** Crea copia di sicurezza con timestamp  
**Quando usare:** SEMPRE prima di modifiche importanti  
**Come interpretare:** Avrai sempre una versione funzionante

### 🔄 Ripristino da Problemi

#### 5. Tornare alla Versione Git Pulita
```bash
git checkout -- nomefile.html
```
**Cosa fa:** Ripristina file alla versione salvata in Git  
**Quando usare:** Quando un file è corrotto ma Git ha versione buona  
**ATTENZIONE:** Perdi TUTTE le modifiche non salvate!

#### 6. Reset Completo del Repository
```bash
git reset --hard HEAD
```
**Cosa fa:** Ripristina TUTTI i file alla versione Git  
**Quando usare:** Emergenza totale, tutto corrotto  
**ATTENZIONE:** Perdi TUTTE le modifiche non salvate!

#### 7. Mettere da Parte Modifiche Problematiche
```bash
git stash push -m "descrizione_problema"
```
**Cosa fa:** Salva modifiche senza committare  
**Quando usare:** Hai modifiche che non vuoi perdere ma causano problemi  
**Come recuperare:** `git stash pop`

### 📥 Download File da GitHub

#### 8. Scaricare File Specifico da GitHub
```bash
curl -o nomefile_nuovo.html "https://raw.githubusercontent.com/TUO_USERNAME/TUO_REPO/main/nomefile.html"
```
**Cosa fa:** Scarica versione pulita da GitHub  
**Quando usare:** Quando file locale è corrotto ma GitHub è OK  
**Sostituisci:** TUO_USERNAME, TUO_REPO, nomefile con i tuoi valori

#### 9. Sostituire File Corrotto
```bash
del nomefile.html
move nomefile_nuovo.html nomefile.html
```
**Cosa fa:** Elimina file corrotto e sostituisce con quello nuovo  
**Quando usare:** Dopo aver scaricato versione pulita  
**ATTENZIONE:** Controlla che il nuovo file sia corretto prima!

### 🆕 Creare File da Zero

#### 10. Creare Nuovo File Vuoto
```bash
New-Item -ItemType File -Name "nomefile.html"
```
**Cosa fa:** Crea file vuoto  
**Quando usare:** Quando devi ricreare un file completamente  

#### 11. Copiare Contenuto tra File
```bash
Get-Content file_sorgente.html | Set-Content file_destinazione.html
```
**Cosa fa:** Copia tutto il contenuto da un file all'altro  
**Quando usare:** Per duplicare file funzionanti  

### 🔍 Diagnosi Avanzata

#### 12. Cercare Testo Specifico nei File
```bash
Select-String -Path "*.html" -Pattern "testo_da_cercare"
```
**Cosa mostra:** Righe che contengono il testo cercato  
**Quando usare:** Per trovare codice specifico o problemi  

#### 13. Confrontare Due File
```bash
Compare-Object (Get-Content file1.html) (Get-Content file2.html)
```
**Cosa mostra:** Differenze tra due file  
**Quando usare:** Per capire cosa è cambiato tra versioni  

### 📋 Checklist Risoluzione Problemi

1. **SEMPRE fare backup prima di modifiche**
2. **Usare `git status` per capire la situazione**
3. **Controllare prime righe file con `Get-Content`**
4. **Se file corrotto: provare `git checkout --`**
5. **Se problema persiste: `git reset --hard HEAD`**
6. **Come ultima risorsa: scaricare da GitHub**
7. **Testare sempre il file riparato prima del commit**

### ⚠️ REGOLE D'ORO

- **Mai modificare file importanti senza backup**
- **Mai usare `git reset --hard` senza essere sicuri**
- **Sempre verificare che un file funzioni prima di sostituirlo**
- **Tenere sempre una copia funzionante da qualche parte**

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

## 🔄 Come forzare un nuovo deploy su Netlify

Se Netlify non aggiorna il sito o le funzioni, puoi forzare un nuovo deploy con questi comandi:

```bash
# 1. Aggiungi una riga di commento in fondo a index.html
# (Serve solo a "sporcare" il progetto, non cambia nulla nel sito)
echo "<!-- Force redeploy -->" >> index.html

# 2. Aggiungi tutte le modifiche all'area di staging di Git
# (Prepara i file per il commit)
git add .

# 3. Crea un nuovo commit con un messaggio chiaro
# (Salva le modifiche localmente)
git commit -m "Force redeploy to fix function issue"

# 4. Invia il commit su GitHub
# (Netlify vede la nuova versione e fa subito il deploy)
git push
```

### Cosa fanno questi comandi?
- **echo ... >> index.html**: aggiunge una riga di commento, così Netlify vede che c'è una modifica.
- **git add .**: aggiunge tutte le modifiche (anche solo il commento) all'area di staging.
- **git commit ...**: crea un nuovo commit, cioè una "foto" del progetto aggiornata.
- **git push**: invia il commit su GitHub, e Netlify fa subito il deploy automatico.

**In sintesi:**
Questi comandi servono solo a "toccare" un file e fare un nuovo commit, così Netlify si accorge che c'è una modifica e rifà il deploy del sito e delle funzioni!


// Spiegazione: opts.every(o=>o) controlla che ogni opzione sia "truthy" (non vuota, non null, non undefined),
// ma se una opzione è una stringa vuota (""), il risultato è false e il quiz non viene salvato.
// opts[0] && opts[1] && opts[2] è equivalente a un AND logico tra le tre opzioni, più chiaro e diretto.