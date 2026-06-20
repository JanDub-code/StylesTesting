# Anketa designu Evidence revizi

Jednoducha Node/Express appka pro anonymni hodnoceni sesti statickych designovych iteraci.

## Spusteni

```bash
npm install
npm start
```

Vychozi URL je `http://localhost:3000`.

## Konfigurace

Pro realne ukladani nastavte:

```bash
DATABASE_URL=postgres://user:password@host:5432/database
ADMIN_TOKEN=dlouhy-nahodny-token
PORT=3000
```

Server pri startu automaticky aplikuje `db/schema.sql`. Bez `DATABASE_URL` jde appku prohlizet, ale `POST /api/submissions` vrati `503`.

## Admin

Admin prehled je na `/admin`. Token se posila pres formular a pouziva endpointy:

- `GET /api/results`
- `GET /api/export.csv`

Verejna anketa globalni vysledky nezobrazuje, aby neovlivnovala dalsi hlasujici.
