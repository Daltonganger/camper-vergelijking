# China 2027

Zelfstandige statische planner binnen de bestaande GitHub Pages-site. Open `china-2027/`; geen buildstap nodig. Lokaal: `python3 -m http.server 8277 --bind 127.0.0.1` in de repository.

- `data.js`: definitieve 31-daagse route, tien verblijfplaatsen / 28 nachten, budget- en comforthotels, acht treinritten, vluchtopgave €1.671,68 en video's.
- `app.js`: filters, hotelkeuzes, notities, boekingsstatus, budget, Leaflet-kaart, ICS-export, print en JSON-back-ups.
- `style.css`: desktop-, mobiele en printweergave.
- `assets/`: lokale foto's; auteurs, bronnen en licenties staan onderaan de pagina.

De oorspronkelijke route `spoor27` in `routes-data.js` blijft behouden als vergelijkingsscenario. Hoofdnavigatie en die route verwijzen naar de nieuwe planner.

Prijsstatus: het vluchtbedrag komt van de reizigers. Hotel-, trein-, eet-, transfer- en activiteitenbedragen zijn expliciete planningsramingen; geen geverifieerde offertes voor maart/april 2027. Eigen stoel voor Amélie binnen het opgegeven vliegbedrag is nog onbevestigd. De oude €94–115 is per volwassene per dag, over 27 dagen met twee volwassenen. Nieuwe totalen gebruiken 31 dagen en 28 hotelnachten. Hotelkeuzes hebben afzonderlijke eigen prijsvelden, zodat wisselen een eerdere eigen offerte niet verwijdert.

Reserveringsvensters zijn gecontroleerd op 30 september 2026; treinvenster 15 dagen inclusief vertrekdag, Forbidden City zeven dagen vooruit om 20:00 Beijing. In 2027 opnieuw controleren. Exact treinschema en stationgebonden vrijgavetijden nog vastleggen. Visumvrijstelling voor 2027 is niet als bevestigd gepresenteerd.

Eigen gegevens worden alleen in lokale browseropslag (`china2027-planner-v1`) bewaard; een JSON-back-up kan ze meenemen naar een ander apparaat. Geen synchronisatie of serverdatabase. YouTube wordt pas na een afspeelklik geladen. Kaart en lettertypen gebruiken externe diensten. Er zijn geen boekingen of betalingen uitgevoerd.
