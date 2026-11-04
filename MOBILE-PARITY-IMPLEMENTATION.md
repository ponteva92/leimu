# LEIMU — mobiilin desktop-vastaavuuden toteutus

Päivitetty 2.11.2026. Alkuperäinen vaatimus- ja havaintolista: [MOBILE-PARITY-AUDIT.md](MOBILE-PARITY-AUDIT.md).

## Toteutus

Mobiili käyttää samoja tarinavaiheita ja visuaalisia kerroksia kuin desktop. Näytön koko valitsee sommittelun; käyttäjän reduced-motion-asetus valitsee rauhallisemman esityksen. Kosketus tai pieni näyttö ei enää yksin poista WebGL:ää tai sticky-kerrontaa.

| Auditoinnin kohdat | Toteutettu muutos |
| --- | --- |
| A01, A28, A35 | Yhteiset motion- ja compact-ehdot erotettu. Track/cover käyttää vakaata svh-geometriaa, näkyvä stage dvh-korkeutta. Scroll- ja fokusnavigaatio käyttävät samaa matkaa. Piilotetut Stage/Flow-haarat irrotetaan hydration jälkeen. |
| A02–A06, A34 | Sama kynttilä ja liikkuva herotausta kaikille WebGL:ää tukeville laitteille. Ambient-keinunta ja lämpöväreilyn kosketusversio, mobiiliin sopiva keskitys ja loppulause. Placeholder jakaa kameran ja kynttilätason rajauksen. Reduced motion pysäyttää shader-ajan. |
| A07–A10 | CraftFilm ja etusivun GiftCeremony säilyttävät sticky-vaiheet, pyyhkäisyt, laskurin, valon, kallistuksen, tekstivaiheet sekä paperiarkkien peitto- ja vetäytymissiirtymät. |
| A11–A13 | Korttikohtaiset mobiilipyyhkäisyt, lukukohdassa aktivoituva zoom/syvyys ja painallusvaste. Kaikki tuoksunuotit näkyvät; kapeiden korttien nimilaatta on kuvan alapuolella. Lainaukset säilyttävät scroll-liikkeen. |
| A14–A18 | Tarinan muotokuva, vaakasuuntainen prosessi ja materiaalihuone säilyttävät vaiheittaisen kerronnan. LivingPortrait ja LiquidDark toimivat kosketuksella. Muotokuvan nimi ei peitä kasvoja. Arvo-osion otsikko pysyy sticky-tilassa myös kompaktissa asettelussa. |
| A19–A21 | Tuotteiden asetelma säilyttää vahaliikkeen, hämärtymisen ja tekstivaihdot. Käsityövideo ja faktat säilyvät samassa kohtauksessa; video ja sen 44 px ohjaus on sovitettu pieniin näyttöihin. Lahjakuvien liike säilyy. |
| A22–A27 | Kosketuksella avautuva lukunavigaatio, valikon aukiolon huomioiva header ja viewportissa pysyvä ostoskorin yhteenveto. Tilausvaiheen nimi näkyy mobiilissa. Painallus-, hehku- ja alleviivausvasteet täydentävät hiiren hoveria. |
| A29–A33 | Jäljellä oleva 404-vh-mitta korjattu. Modaalin lasi säilyy yhdellä puhelimen blur-kerroksella. Alle 768 px näkymien kenttäfontti on vähintään 16 px. Height/text-shadow-animaatiot korvattu, valikko käyttää muunnoksia ja pienet ambient-silmukat pysähtyvät näkymän ulkopuolella. |

Normaalin desktop-asettelun palstakoot, tarinajärjestys, kuvat ja animaatioikkunat säilyvät. Jaetun scroll-laskennan desktop-arvo on sama kuin ennen: `p = (scrollY − trackTop) / (trackHeight − viewportHeight)`. Mobiilissa vakaa track-yksikkö estää selainpalkin korkeuden muuttumista siirtämästä tarinaa itsestään.

## Fontit

Cormorant Garamond, Instrument Sans ja Space Mono toimitetaan nyt paikallisina WOFF2-fontteina `next/font/local`-latauksella. Samat brändiperheet, painot, aidot kursiivit, CSS-muuttujat ja `display: swap` säilyvät. Käännös ei tarvitse Google Fonts -verkkohakua. Yhteensä 12 fonttitiedostoa vie 416 176 tavua; suomen ja englannin merkit, käytetyt symbolit sekä OpenType-muotoilu on säilytetty. OFL-lisenssit, alkuperät, tarkisteet ja toistettava subset-skripti ovat `src/app/fonts`-hakemistossa.

## Varmennus

**Toteutus ja paikallinen tuotantovarmennus ovat valmiit.** TypeScript, `npm run lint` ja `npm run build` läpäisivät tarkistukset. Kolme pääreittiä rakennettiin onnistuneesti.

Tuotantokäännöstä testattiin Chromiumilla 33 näkymätapauksessa: kaikki kolme reittiä seuraavilla profiileilla.

| Profiili | Näkymä | Syöte / erikoisasetus |
| --- | --- | --- |
| Puhelin | 390×844 | kosketus, DPR 2 |
| Kapea puhelin | 320×568 | kosketus, DPR 2 |
| Pieni vaakanäkymä | 568×320 | kosketus, DPR 2 |
| Vaakanäkymä | 844×390 | kosketus, DPR 2 |
| Tabletti | 768×1024 | kosketus, DPR 2 |
| Matala tabletti | 1024×600 | kosketus |
| Leveä, matala ikkuna | 1280×500 | hiiri |
| Desktop | 1440×900 | hiiri |
| Reduced motion | 390×844 | kosketus, liikkeen vähennys |
| Englanti | 390×844 | kosketus, kielenvaihto |
| Suurempi teksti | 390×844 | kosketus, juurifontti 125 % |

Ajossa tallennettiin 656 vaihehavaintoa ja kuvakaappauksia. Tarkistukset kattavat sticky-kohtausten säilymisen, näkyvän tekstin mahtumisen, vaakaylivuodon, Canvasit, videon valmiuden ja oikeiden brändifonttien latauksen. Kuvista korjattiin muun muassa heron kynttilän rajaus ja tekstien sijoittelu, muotokuvan nimilaatta, kapeiden tuoksukorttien tiedot, käsityövideon koko ja näkymätön teksti sekä arvo-otsikon peittokerros.

Kosketusprofiileilla tarkistettiin tuoksudialogin avaus ja sulkeminen. Alle 768 px profiileilla testattiin lisäksi valikon näkyminen scrollatessa, lukunavigaatio, etusivun lahja-CTA:n kohdistus, yhteydenottodialogi, kenttäfontti, ostoskoriin lisääminen, yhteenvedon avaus, kassalle siirtyminen ja videon ohjaus. Videopainike oli kehyksen sisällä ja vähintään 44×44 px. Kuusi tilaustestin variaatiota pääsi kiitosnäkymään selaimen paikallisen `/api/submit`-stubin kautta. Oikeaa tilausta, sähköpostia tai yhteydenottoviestiä ei lähetetty.

Laajan ajon neljä nimilaatan rajausvaroitusta johtuivat mittauskohdasta: ruudukkokohtainen scroll-pyyhkäisy oli vielä kesken kortin keskipisteessä. `WipeStill` siirtää maskia ja sisäkerrosta tarkoituksella eri matkan. Testi erottaa nyt tämän välivaiheen ja valmiin asettelun. Kohdennettu neljän tapauksen uusinta-ajo tarkisti kaikkien 20 nimilaatan lepomuunnokset ja mahtumisen kehykseen; kaikki läpäisivät. Myös uuden mittauksen alle 768 px haara varmennettiin erillisellä 320×568 etusivun uusinta-ajolla. Sovelluskoodia ei muutettu ajojen välissä. Ratkaisemattomia testihylkäyksiä tai sovelluksen selainvirheitä ei jäänyt.

Tuotantokäännöksen tunniste on `_oS23Hip7inCWuJtT2ByK`. Molempien ajojen lähdekoodin SHA-256 alussa ja lopussa oli `8640bca2b6da1c6b6f37c5e9ac572769c431be0eab2cff20aa5b0be630bb5c68` (src-hakemiston TS/TSX/CSS/WOFF2-tiedostot).

Headless Chromiumin 2,4 sekunnin hero-scroll-näytteissä oli elävä WebGL mukana. Kymmenen profiilin frame-välin mediaani oli 16,7 ms, p95 16,8–17,1 ms ja pisin yksittäinen väli 18,1 ms. Pitkiä pääsäietehtäviä ei havaittu näissä näytteissä. Tämä on rajattu emulointimittaus, ei koko sivuston tai fyysisen puhelimen FPS-takuu.

## Todisteet ja rajaukset

- [33 tapauksen tuotantoajo ja kuvat](C:/Users/heikk/.codex/visualizations/2026/11/01/01a19818-6d60-78e3-b4a4-efb662d195fe/mobile-parity-production-final/results.json)
- [Neljän rajausvaroituksen uusintatesti, 0 hylkäystä](C:/Users/heikk/.codex/visualizations/2026/11/01/01a19818-6d60-78e3-b4a4-efb662d195fe/mobile-parity-caption-verification/results.json)
- [Kapean puhelimen nimilaattatesti, 0 hylkäystä](C:/Users/heikk/.codex/visualizations/2026/11/01/01a19818-6d60-78e3-b4a4-efb662d195fe/mobile-parity-compact-caption-verification/results.json)
- [Tiivistetty varmennustulos](C:/Users/heikk/.codex/visualizations/2026/11/01/01a19818-6d60-78e3-b4a4-efb662d195fe/mobile-parity-production-final/verification-summary.json)

Fyysistä iOS Safari- tai Android-laitetestausta ei ollut käytettävissä. Selainpalkkien liike, näyttönäppäimistön toiminta sekä 60/120 Hz sulavuus oikealla laitteella jäävät laitevarmennettaviksi. `svh`/`dvh`-geometria ja vähintään 16 px puhelinkentät on toteutettu näitä tilanteita varten; emulointi ei todista niiden kaikkia laitekohtaisia vaikutuksia.

Ulkoinen Instagram-widgetin skripti `https://w.behold.so/widget.js` ei latautunut testiympäristön DNS-rajoituksen vuoksi. Sen elävää sisältöä ei voitu varmentaa. Omien resurssien lataus ja sovelluksen toiminta läpäisivät tarkistukset; ulkoisen palvelun virheet on säilytetty tuloksissa erikseen.

## Testiajuri

`scripts/mobile-parity-check.cjs` käynnistää eristetyn Next-palvelimen yksityisellä named pipella Windowsissa tai paikallisella Unix-socketilla. Se testaa todellista hydration jälkeen toimivaa sivua Playwright/Chromiumilla; tilausta tai yhteydenottoviestiä ei lähetetä.

Ajuri tarvitsee Playwrightin projektin moduulipolusta tai `PARITY_PLAYWRIGHT_MODULE`-ympäristömuuttujan osoittamasta asennuksesta. Tuotantotesti ajetaan onnistuneen `npm run build` -komennon jälkeen asettamalla `PARITY_PRODUCTION=1`. `PARITY_PROFILES` ja `PARITY_ROUTES` rajaavat ajon tarvittaessa; oletuksena mukana ovat puhelimet, vaakanäkymät, tabletti, matala leveä ikkuna, normaali desktop, reduced motion, englanti ja suurennettu teksti.

Tulokset ja kuvat tallennetaan `PARITY_OUTPUT`-hakemistoon tai oletuksena `artifacts/mobile-parity`-hakemistoon. `PARITY_PERF=1` kerää lisäksi headless-selaimen frame-välejä. Se ei ole fyysisen iPhonen tai 120 Hz Android-laitteen mittaus.
