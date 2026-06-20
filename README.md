# Anketa designu Evidence revizi

Jednoducha Node/Express appka pro pseudonymni hodnoceni sesti statickych designovych iteraci.

## Spusteni lokalne

```bash
npm install
npm start
```

Vychozi URL je `http://localhost:3000`.

## Konfigurace

Pro realne ukladani nastavte:

```bash
DATABASE_URL=postgres://user:password@host:5432/database
ADMIN_TOKEN=$(openssl rand -hex 32)
SURVEY_COOKIE_SECRET=$(openssl rand -hex 32)
PORT=3000
HOST=127.0.0.1
```

Server pri startu automaticky aplikuje `db/schema.sql`. Bez `DATABASE_URL` jde appku prohlizet, ale `POST /api/submissions` vrati `503`.

Dalsi produkcni volby jsou v `.env.example`:

- `HOST=127.0.0.1` pro produkcni beh jen za lokalnim nginx proxy.
- `TRUST_PROXY=loopback` pro nginx na stejnem serveru.
- `ENFORCE_HTTPS=true` volitelne pro HTTPS redirect na aplikacni vrstve po zprovozneni proxy.
- `ALLOWED_HOSTS=example.com,www.example.com` pro kontrolu Host headeru.
- `SUBMISSION_RATE_LIMIT` a `ADMIN_RATE_LIMIT` pro jednoduche IP rate limiting.
- `ADMIN_LOGIN_RATE_LIMIT` pro omezeni pokusu o prihlaseni.
- `ADMIN_SESSION_TTL_SECONDS` pro dobu platnosti admin relace.
- `PGSSLMODE=require`, `PGSSLREJECTUNAUTHORIZED=true` a volitelne `PGSSLCAFILE`/`PGSSLROOTCERT` pro TLS k Postgresu.

## Security baseline

Aplikace nastavuje zakladni bezpecnostni hlavicky vcetne CSP, `nosniff`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy` a HSTS pri HTTPS. Admin formular vymeni token za casove omezenou `HttpOnly`, `Secure` a `SameSite=Strict` cookie; token se neuklada do weboveho uloziste. Pro skripty a CLI zustava podporovany `x-admin-token` header. Pseudonymni identita hlasu je podepsana serverem a klient ji nemuze libovolne prepsat. IP adresa se v aplikaci pouziva pro rate limiting a reverzni proxy ji muze uchovavat v provoznich logach. Public odesilani i admin endpointy maji jednoduchy in-memory rate limit.

## Admin

Admin prehled je na `/admin`. Token se posila pres formular a pouziva endpointy:

- `GET /api/results`
- `GET /api/export.csv`

Verejna anketa globalni vysledky nezobrazuje, aby neovlivnovala dalsi hlasujici.

## Deploy na server

1. Na serveru nainstalujte Node.js, npm, rsync, nginx a Postgres klient/knihovny podle distribuce.
2. Nahrajte repozitar na server a spustte:

   ```bash
   sudo bash scripts/deploy.sh
   ```

   Pri prvnim spusteni skript vytvori `/etc/styles-testing-survey.env` z `.env.example` a skonci. Doplnte realne hodnoty (`DATABASE_URL`, rozdilny silny `ADMIN_TOKEN` a `SURVEY_COOKIE_SECRET`, `ALLOWED_HOSTS`) a spustte skript znovu. Produkcni start placeholdery a slabe hodnoty odmitne.

3. Nginx konfiguraci nainstalujete:

   ```bash
   sudo bash scripts/install-nginx.sh example.com
   ```

   Pokud jeste neexistuje Let's Encrypt certifikat, skript nasadi docasnou HTTP konfiguraci. Potom vydejte certifikat napr. `sudo certbot --nginx -d example.com` a skript `install-nginx.sh` spustte znovu; nasadi HTTPS redirect a HSTS.

Uzitecne npm prikazy:

```bash
npm run check
npm test
npm run deploy
DOMAIN=example.com npm run deploy:nginx
```
