# Gezamenlijke China-planner

Kleine Cloudflare Worker met D1-opslag voor de bestaande GitHub Pages-site. Node.js 22 of nieuwer.

## Inrichten

1. `npm ci` in deze map.
2. `npx wrangler login --scopes account:read user:read workers_scripts:write d1:write`.
3. Kopieer `wrangler.example.toml` naar `wrangler.toml` (wordt niet gecommit).
4. `npx wrangler d1 create china-2027 --location weur`; zet de database-ID in de configuratie, met binding `DB`.
5. `npx wrangler d1 execute china-2027 --remote --file schema.sql --yes`.
6. `npm run deploy`; vul de gepubliceerde HTTPS-URL in `../china-2027/sync-config.js` in.
7. Publiceer de GitHub Pages-bestanden. Maak de gedeelde reis vanuit de eigen browser, zodat bestaande hotels en notities worden meegenomen.

Gebruik Workers Free / D1 Free. Activeer geen betaald Workers-abonnement. Er zijn geen betaalde services, cronjobs of logging-opslag ingesteld. Cloudflare Free heeft dagelijkse gebruikslimieten; bij een fout blijft de frontend lokaal opslaan en probeert hij later opnieuw.

## Lokaal testen

`npm test` controleert met een echte SQLite-database gelijktijdige veldwijzigingen, toegangssleutels, CORS en invoercontrole.

`npx wrangler d1 execute china-2027 --local --file schema.sql` en `npm run dev` starten de lokale database en Worker. Zet de frontend-config tijdelijk op het lokale endpoint. Herstel de publieke HTTPS-URL vóór publiceren.

## Toegang en onderhoud

- Alleen de exacte origins uit `ALLOWED_ORIGINS` worden door browsers geaccepteerd. CORS vervangt geen authenticatie: iedere reisaanvraag heeft ook een willekeurige 256-bits toegangssleutel nodig.
- De database bewaart alleen de hash van die sleutel; de frontend bewaart hem apart van de exporteerbare reisgegevens. Iedereen met de persoonlijke link kan de reis lezen en bewerken.
- Geen openbare lijst van reizen. Anonieme creatie is begrensd tot vijf per IP-hash per dag en 200 reizen totaal.
- Updates zijn veldoperaties met revision-check en herhaling, zodat verschillende velden bij gelijktijdig opslaan behouden blijven. Op hetzelfde veld wint de laatste update.
- Stoppen op een apparaat verwijdert alleen de lokale verbinding, niet de gedeelde reis. Bewaar een privé-uitnodigingslink en JSON-back-up om opnieuw aan te sluiten.
- Verwijderen/intrekken van een reis kan door de eigenaar in D1, met een `DELETE FROM rooms WHERE id = ...` voor alleen die reis-ID. De oude link werkt daarna niet meer.
- Secrets, OAuth-configuratie, `wrangler.toml`, lokale database en `node_modules` horen niet in Git.
