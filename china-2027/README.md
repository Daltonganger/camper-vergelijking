# China 2027

Zelfstandige statische planner binnen de bestaande GitHub Pages-site. Open `china-2027/`; geen buildstap nodig. Lokaal: `python3 -m http.server 8277 --bind 127.0.0.1` in de repository.

- `data.js`: definitieve 31-daagse route, elf verblijfplaatsen / 28 nachten, budget- en comforthotels, negen treinritten, vluchtopgave €1.671,68 en video's.
- `app.js`: filters, hotelkeuzes, notities, boekingsstatus, budget, Leaflet-kaart, ICS-export, print en JSON-back-ups.
- `bookings.js`: boekingsoverzicht met bedragen, betalingen, referenties, annulerings- en betaaldeadlines.
- `sync.js` en `sync-config.js`: optionele gezamenlijke planning via Cloudflare Worker + D1.
- `style.css`: desktop-, mobiele en printweergave.
- `assets/`: lokale foto's; auteurs, bronnen en licenties staan onderaan de pagina.

De oorspronkelijke route `spoor27` in `routes-data.js` blijft behouden als vergelijkingsscenario. Hoofdnavigatie en die route verwijzen naar de nieuwe planner.

Prijsstatus: het vluchtbedrag komt van de reizigers. Hotel-, trein-, eet-, transfer- en activiteitenbedragen zijn expliciete planningsramingen; geen geverifieerde offertes voor maart/april 2027. Eigen stoel voor Amélie binnen het opgegeven vliegbedrag is nog onbevestigd. De oude €94–115 is per volwassene per dag, over 27 dagen met twee volwassenen. Nieuwe totalen gebruiken 31 dagen en 28 hotelnachten. Hotelkeuzes hebben afzonderlijke eigen prijsvelden, zodat wisselen een eerdere eigen offerte niet verwijdert.

Reserveringsvensters zijn gecontroleerd op 30 september 2026; treinvenster 15 dagen inclusief vertrekdag, Forbidden City zeven dagen vooruit om 20:00 Beijing. In 2027 opnieuw controleren. Exact treinschema en stationgebonden vrijgavetijden nog vastleggen. Visumvrijstelling voor 2027 is niet als bevestigd gepresenteerd.

Eigen gegevens blijven in lokale browseropslag (`china2027-planner-v1`) bewaard. Via **Samen plannen → Gedeelde reis starten** worden de bestaande gegevens ook in Cloudflare D1 opgeslagen; een persoonlijke uitnodigingslink geeft andere apparaten lees- en bewerktoegang. Bewaar die link privé. De uitnodiging staat in het URL-fragment (niet in de serveraanvraag) en wordt na openen uit de adresbalk verwijderd. De backend bewaart een hash van de toegangssleutel. Een JSON-back-up bevat de reisgegevens en boekingen, maar geen toegangssleutel. De synchronisatieverbinding en wachtende wijzigingen staan afzonderlijk in `china2027-shared-v1`. YouTube wordt pas na een afspeelklik geladen. Kaart en lettertypen gebruiken externe diensten. Er zijn geen boekingen of betalingen uitgevoerd.

Laatste routecheck: D10 één groot Beijing-bezoek plus optionele hutongs; lokale stads-/theehuiservaringen toegevoegd; D20 rust vóór eventuele vroege D21-trein; Ctrip D3967 uit 2026 slechts als referentie; verschillende overstapstations expliciet gemarkeerd. Dagteksten werken nu ook voor de budgethotels in Chengdu en Yangshuo. Lantau op D29 is een vervangende optie, geen extra verplicht programma. Hotelkeuzes, bedragen, vluchtbasis en nachtentelling blijven behouden.

Kanton hersteld op verzoek: één nacht 23–24 april (D27), daarna middagtrein naar Hongkong op D28 en twee nachten Hongkong. D29 heeft Star Ferry / Central / Peak; totaal blijft 28 nachten. Mercure Beijing Road en voco Shifu toegevoegd, met expliciete Canton Fair-prijsraming. Beide nieuwe treinritten gebruiken een route-ID, zodat de oude directe D27-boeking niet automatisch als geboekt verschijnt. Oude status blijft in back-ups behouden.

Per verblijfplaats is een derde eigen hotel beschikbaar via naam, kamerprijs per nacht, http(s)-link, buurt/adres, kamertype en notities. Opslaan kiest dit hotel voor planning, budget, print en reisagenda. Budget en Comfort blijven beschikbaar. Eigen hotels, keuzes en afzonderlijke prijsvelden blijven behouden bij herladen en JSON-back-up/import; oude back-ups blijven compatibel. Eigen prijzen zijn invoer van reizigers, geen geverifieerde offertes.

Gezamenlijk bewerken: wijzigingen worden per veld samengevoegd. Verschillende velden blijven behouden bij gelijktijdig opslaan; bij hetzelfde veld geldt de laatste serverwijziging. Invoer die nog niet is opgeslagen blijft op het apparaat zichtbaar. Offline wijzigingen blijven lokaal in de wachtrij en worden bij verbinding alsnog verstuurd. Tijdens aansluiten wordt de vorige lokale reis bewaard als herstelkopie (`china2027-before-sharing`). Synchronisatie pollt alleen bij een zichtbare pagina, met vertraging na fouten.

Het boekingsoverzicht toont hotels (huidige keuze plus eerder vastgelegde keuzes), treinen, attracties en vluchten. Bedragen zijn gezins-/boekingstotalen in euro, gescheiden van de budgetraming. Annuleringsmomenten worden als Chinatijd ingevoerd; de ticketsagenda exporteert ze als UTC, naast betaaldata. Annuleringen blijven zichtbaar maar tellen niet mee in de totalen. Referenties en deadlines gaan mee in print en JSON-back-up.

Backend: zie `../china-2027-sync/README.md`. Gebouwd voor Cloudflare Workers Free en D1 Free; geen betaald abonnement geactiveerd. Limieten geven bij overschrijding fouten in plaats van een automatische upgrade. De pagina bewaart wijzigingen dan lokaal. Exacte actuele limieten: [Workers](https://developers.cloudflare.com/workers/platform/pricing/) en [D1](https://developers.cloudflare.com/d1/platform/pricing/).

Toevoegingen 5, 6 en 7: `plan-extras.js` biedt per locatie een tabel met budget-, comfort- en eventueel eigen hotel, kamerprijs en verblijfstotaal. Eigen offertevoorwaarden (ontbijt, babybed, ligging en annulering) zijn per hotel invulbaar in `hotelDetails`; onbekende voorwaarden worden niet als bevestigd voorgesteld. Prijswijzigingen gaan ook naar Budget. Voor eigen hotels is de sleutel gekoppeld aan de hotelidentiteit, zoals bij boekingen.

Onder Tickets & boeken staat een herinneringenoverzicht. Geboekte treinritten, geboekte Forbidden City en afgehandelde acties worden uit de export gehaald. Voor overige attracties staat een expliciete voorbereidingscontrole zes weken vóór vertrek; onbekende verkoopvensters worden niet verzonnen. Annulerings- en betaaldeadlines komen uit Boekingen. Agenda-export bevat DISPLAY-alarms volgens [RFC 5545](https://www.rfc-editor.org/rfc/rfc5545), naar keuze 1, 3 of 7 dagen vooraf; tijdstippen ook een uur vooraf. De agenda-app bepaalt/ondersteunt de daadwerkelijke meldingen. Deze website stuurt geen pushmeldingen. Na wijziging opnieuw exporteren en eerdere agenda-items bijwerken. Afhandelen is gekoppeld aan event én datum, zodat een gewijzigde deadline opnieuw verschijnt. Voorkeuren en afhandeling staan in `reminders`.

Alle 31 dagen hebben een concrete rustiger variant, afzonderlijk gekozen via `dayModes`. Treinen, vluchten, hotelnachten en noodzakelijke transfers blijven staan. De variant past planning, print en reisagenda aan; geboekte bezoeken worden niet automatisch geannuleerd en budgetramingen niet automatisch verlaagd. Alle nieuwe gegevens gaan mee in lokale opslag, JSON-back-up/import en samen bewerken. De backend accepteert de nieuwe groepen zonder schemawijziging; oudere gedeelde reizen worden bij het eerste nieuwe veld uitgebreid.
