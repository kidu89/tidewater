# Fishing Free — plan de produs, creștere și monetizare

Acesta este roadmap-ul de lucru pentru Fishing Free. Prioritatea executabilă este **Android → stabilitate pe dispozitive → prima sesiune reușită → share → progres și revenire → monetizare → extindere**. Pe iOS păstrăm versiunea web/PWA ca rută fără taxă de distribuție; IPA-ul instalabil și publicarea în App Store rămân opționale până când există acces la Apple Developer Program și materialele de semnare. Nu adăugăm sisteme online sau monetizare înainte ca jocul de bază să ruleze bine pe telefoanele țintă.

## Verificare Fishing Free 1.0.37 — 4 octombrie 2026

- Am ajustat poziția de respirație a balenei și plafonul saltului după integrare; buildul web și APK-ul 1.0.37 au fost construite.
- APK-ul s-a instalat și a pornit în Scenic Fishing pe emulator Android 16. Animația 3D a balenei nu a fost reprodusă manual, iar Samsung A52/MuMu rămân neverificate.
- Android #34, Windows #35, Pages #123 și iOS Simulator #30 au trecut în Actions. IPA-ul pentru iPhone și instalarea fizică rămân deschise; monetizarea nu se schimbă până avem date reale de retenție.
- Candidatul local Windows x64 1.0.37 și arhiva Steam de transfer au fost construite; Actions #35 a trecut smoke testul de pornire. AppID/depot ID, pagina Steam, semnarea și uploadul SteamPipe rămân necesare.

## Verificare Fishing Free 1.0.36 — 4 octombrie 2026

- Am reparat cazul în care salvarea în port dispărea cât timp firul era activ: promptul de salvare rămâne accesibil și pe touch; acțiunea anulează firul și readuce jucătorul/barca la debarcader. Ridicarea automată a bărcii după răsturnare rămâne activă.
- APK-ul 1.0.36 (cod 36, min API 24) s-a instalat peste buildul local 1.0.35 și a pornit în Scenic Fishing pe emulator Android 16. Samsung A52, MuMu și instalarea fizică rămân de verificat; buildul nu confirmă încă reproducerea unei răsturnări reale.
- Pachetul Windows x64 1.0.36 s-a generat local, dar nu a fost lansat. Android #33, Windows #34, Pages #121 și iOS Simulator #28 au trecut în Actions. Artefactul simulator iOS nu este IPA instalabil; A52/MuMu și SteamPipe rămân neverificate. Nicio schimbare la monetizare: jocul rămâne gratuit până avem rezultate de playtest/retention.

## Verificare pachet Fishing Free 1.0.35 — 4 octombrie 2026

- Versiunea 1.0.35 aliniază metadatele Android, Windows și iOS și setează autorul Electron la Fishing Free; codul de joc nu s-a schimbat. APK-ul direct de 57.738.940 bytes a trecut verificarea manifestului, semnăturii v2 și alinierii, apoi s-a instalat ca actualizare și a deschis Scenic Fishing pe emulator Android 16 x86_64. Telefonul fizic și MuMu Player rămân neverificate.
- GitHub Actions au trecut: Android #32, Windows #33, Pages #119 și iOS Simulator #26. Acestea confirmă compilarea/deploy-ul, nu instalarea fizică, 3D WebGPU pe A52, SteamPipe sau IPA semnat. Artefactele Android/Windows/iOS sunt păstrate până la 18 octombrie 2026.
- Jocul nu are încă date reale de retenție sau conversie. Păstrăm planul de joc gratuit de bază și monetizare doar după playtest; buildul 1.0.35 nu adaugă sisteme noi de gameplay sau monetizare.

## Gameplay baseline 1.0.34 — 4 octombrie 2026

- **PC/Steam:** 1.0.32 rămâne ultima versiune Windows pornită și verificată vizual. Folderul x64 1.0.34 și ZIP-ul de transfer de 213,624,558 bytes sunt construite local, fără inspecție vizuală. Windows Actions #32 a trecut verificările de pachet și pornire. Capturile Steam 1.0.32 rămân locale și neaprobate; AppID/depot ID, PC retail curat, Steam client/overlay/controller, art final și SteamPipe rămân deschise. Folderul vechi release/win-unpacked nu a putut fi înlocuit din cauza unui DLL blocat de Windows; candidatul separat 1.0.34 este intact.
- **Android:** APK-ul 1.0.34 s-a instalat pe emulator Android 16 x86_64; fallback-ul Scenic și noul buton TRY FULL 3D IN CHROME au fost verificate. WebView-ul emulatorului nu a returnat adaptor WebGPU; butonul a deschis pagina publică în Chrome, dar Chrome 3D pe A52 nu a fost verificat fizic. Scenic rămâne offline, iar Chrome cere internet și păstrează salvare separată. Samsung A52 și MuMu Player încă așteaptă test real. Captura GPU primită arată Android 10/HUAWEI ELE-L29; utilizatorul a menționat separat Samsung A52.
- **iOS:** workflow-ul simulatorului 1.0.34/build 34 trece în Actions #23, însă utilizatorul are un Apple ID personal fără membership Apple Developer și semnare de distribuție; nu există IPA instalabil pe iPhone. Safari/PWA rămâne opțiunea disponibilă până la un cont și materialele de distribuție.
- **Nume/licențe:** interfața și metadatele publice folosesc Fishing Free, iar remote-ul este kidu89/tidewater. Numele tidewater rămâne doar în slug și cheile de salvare vechi. Se păstrează MIT/LICENSE/CREDITS și notificările terților; eliminarea lor ar încălca atribuirea licențelor.
- **Creștere și bani:** retention, conversie, wishlists și venituri nu sunt măsurate. Se menține ipoteza de joc de bază gratuit, fără reclame sau cash shop; DLC de regiune rămâne test după date, nu o prognoză. Întâi trebuie verificată instalarea și prima captură pe dispozitive reale.

## 1. Evaluarea produsului actual

### Ce oferă jocul azi

Fishing Free este o experiență 3D de pescuit și explorare tropicală. Codul curent are deja trei bucle de joc conectate:

1. **Bucla scurtă — pescuitul:** alegi locul, lansezi, aștepți mușcătura, înțepi, gestionezi tensiunea și aduci peștele la mal. Cartela capturii dă imediat nume, specie nouă sau record, lungime și greutate.
2. **Bucla de sesiune — progresul:** vinzi peștele, cumperi echipament, îmbunătățești cala și barca, apoi ajungi la alte adâncimi și habitate.
3. **Bucla de colecție — explorarea:** cauți 24 de specii cu habitate și ore active diferite, completezi jurnalul și bați propriile recorduri.

Pe lângă pescuit, insula are plajă, sat, recif, barcă, fauna mării, zi/noapte, sunet ambiental și Photo Mode. Inventarul, jurnalul, banii, upgrade-urile și combustibilul se salvează local în localStorage.

### Avantaje pe care trebuie să le păstrăm

- Identitate vizuală distinctă: apă, cer, insulă și pești randate de un motor WebGPU propriu.
- Momente ușor de înțeles și de povestit: specie nouă, pește mare, record, prima ieșire în larg.
- Un amestec bun de relaxare și pricepere: așteptarea este calmă, lupta cere atenție.
- Un produs care poate funcționa offline după instalare; nu depinde de server pentru bucla de bază.
- Progres existent, pe care îl putem extinde fără să înlocuim jocul cu un alt gen.

### Problemele care limitează lansarea și creșterea

- **Compatibilitate Android:** APK-ul 1.0.34 s-a instalat și a pornit pe emulator Android 16 x86_64. WebView-ul acelui emulator nu a returnat adaptor WebGPU; Scenic Fishing a pornit, iar butonul TRY FULL 3D IN CHROME a deschis pagina publică în Chrome. Acest test nu a confirmat randarea 3D în Chrome pe emulator sau pe Samsung A52. Scenic funcționează offline și are salvare separată; ruta Chrome cere internet. A52, MuMu Player și performanța pe telefoane fizice rămân de testat.
- **Versiuni APK și joc web:** 1.0.34 este candidatul Android/Windows/Web actual. APK-ul direct are semnătura v2 și alinierea verificate și s-a instalat ca actualizare pe emulator; SHA-256-ul este consemnat în PRODUCT_AUDIT.md. Windows Actions #32 a trecut verificările de pachet/pornire, iar Pages #116 a publicat sursa 1.0.34. Artifactele CI nu înseamnă instalare Steam sau Google Play.
- **Distribuire iOS:** proiectul este la 1.0.34/build 34; simulatorul a trecut în Actions #23. Artifactul este doar pentru simulator. Nu există IPA instalabil fără Apple Developer membership, certificat și provisioning profile; Safari/PWA rămâne ruta disponibilă pe iPhone.
- **Pornire rece:** compilarea multor shader-e poate dura un minut sau mai mult la prima pornire. Asta amenință instalarea, tutorialul și recenziile.
- **Costul randării:** marea și lumea sunt ambițioase pentru baterie, memorie și temperatura unui telefon. Profilul mobil actual este doar punctul de pornire, nu o validare pe dispozitive reale.
- **Retenție:** jocul are 24 de realizări, 14 contracte, 24 de specii și cinci destinații (portul de acasă plus Pelican Cay, Turtle Key, Mangrove Reach și Sunspire Atoll). Briefingul săptămânal introdus în 1.0.29 apare și în Scenic 1.0.34, filtrat după habitatele și locațiile disponibile; progresul și recompensa sunt locale, fără streak. Captura din emulator confirmă afișarea, dar ciclul complet captură/revendicare/restart și efectul asupra revenirii așteaptă playtest.
- **Distribuire:** există un card PNG pentru capturi și un prototip de duel asincron; link-ul public/de magazin și serviciul de duel nu sunt încă găzduite și verificate cap-coadă.
- **Continuitate și competiție:** salvările sunt locale; duelurile sunt amicale și auto-declarate, fără autentificare sau anti-trișare. Nu există cloud save, clasament global ori multiplayer live.
- **Lansarea nativă:** Android, Windows, Pages și iOS Simulator au builduri Actions 1.0.34 reușite; APK-ul a fost instalat pe emulator, iar Windows a trecut verificările automate de pachet și pornire. Folderul și ZIP-ul Windows 1.0.34 sunt construite local, fără inspecție vizuală; ultima sesiune Windows verificată vizual rămâne 1.0.32. Telefoanele fizice, Steam client, semnarea Google Play și IPA-ul semnat rămân neverificate.

### Poziționarea recomandată

**Fishing Free este un joc de pescuit tropical 3D în care o partidă scurtă te poate duce de la o lansare liniștită la o captură de care vrei să le arăți prietenilor.**

Publicul inițial: jucători de cozy/exploration, oameni atrași de natură și sunet ambiental, fani ai jocurilor de pescuit și jucători mobili care vor sesiuni scurte fără presiune zilnică. Promisiunea de magazin trebuie să arate experiența reală pe telefon, nu doar capturi spectaculoase de pe PC.

## 2. Direcția de design

### Prima sesiune

Obiectivul primei sesiuni este ca jucătorul să prindă un pește, să înțeleagă lupta și să vadă progresul următor, fără să fie obligat să citească un manual.

- Arată rapid mișcarea, privitul și lansarea pe touch; păstrează ghidul existent pentru explicații contextuale.
- Ghidează până la prima mușcătură, apoi explică tensiunea doar în luptă.
- După prima captură, evidențiază jurnalul și vânzarea/upgradarea drept alegeri, nu ca pași obligatorii care opresc jocul.
- Țintă de produs: prima captură în aproximativ 5–10 minute pe o sesiune normală. Vom măsura baza înainte să tratăm intervalul drept criteriu final.
- Oferă o acțiune vizibilă de continuare pe ecranele mobile, hit-area minimă de 44 px și pașii de revenire din întreruperi/aplicație în background.

### Progres pe termen lung

- **Colecție:** jurnal cu siluete/specii lipsă, habitate și intervale de activitate; progresul nu trebuie să fie doar „prinde încă 100”.
- **Recorduri personale:** pagină de trofee cu cele mai bune capturi, data, habitatul și fotografie.
- **Explorare:** obiective clare pentru recif, golf și larg; recompensa principală este descoperirea și accesul la conținut, nu creșterea artificială a prețurilor.
- **Stil personal:** în timp, livree de barcă, lansete, rame și ștampile pentru fotografii. Cosmeticele nu schimbă șansa de mușcătură sau puterea echipamentului.
- **Provocare săptămânală:** o specie, un habitat sau o condiție de pescuit comună tuturor. Fereastra de o săptămână permite participarea fără notificări urgente sau penalizare pentru absență.

Nu adăugăm streak-uri cu pierdere de progres, energie care blochează pescuitul, recompense plătite aleatoriu ori notificări care induc vinovăție. Revenirea trebuie să promită un motiv nou de explorare, nu să pedepsească absența.

## 3. Viralitate și distribuire

### Bucla propusă

**Captură memorabilă → card vizual cu statistici → Share nativ → prietenul vede recordul și deschide pagina jocului → prietenul încearcă aceeași provocare → distribuie propriul rezultat.**

Semnalele firești de share sunt: specie nouă, record personal, pește foarte mare și captură obținută într-un habitat rar. Share-ul trebuie să rămână opțional și să nu blocheze închiderea ecranului.

### Ce livrăm pe parcurs

1. Cardul generat pentru captură, cu imaginea peștelui, specie, lungime, greutate, marcaj de record și CTA. Butonul folosește share sheet-ul sistemului pe iOS/Android și Web Share API unde este disponibil; altfel copiază textul.
2. URL public configurabil pentru distribuire. Pentru build-ul de magazin va fi legat de pagina proprie a jocului / universal link; URL-ul intern https://localhost nu trebuie să ajungă într-o postare.
3. **Provocare asincronă, etapa următoare:** link cu specie/condiții și cod determinist. Prietenul încearcă să depășească greutatea, iar jocul compară două capturi. Înainte de clasamente publice, validăm scorurile pe server sau limităm rezultatul la provocări între prieteni.
4. Pachet pentru creatori: capturi verticale, trailer scurt, gif/video de pescuit și ghid de capturi pentru social media. Nu cerem review pozitiv în schimbul recompenselor.

Metrica inițială este rata de **deschidere a share sheet-ului** după o captură eligibilă; aplicația nu va pretinde că știe dacă utilizatorul a publicat efectiv sau cine a instalat jocul. După conectarea unui link public, putem măsura deschiderile și instalările atribuite la nivel permis de platformă.

Viralitatea nu poate fi garantată de un buton. Ca distribuirea să aducă oameni, cardul trebuie să arate bine în feed, să ajungă la o pagină publică funcțională, iar noul jucător să poată prinde repede primul pește. Canalele prioritare după fazele 0–1 sunt ASO pentru „fishing game / cozy fishing / tropical fishing”, clipuri scurte cu momentele vizuale ale jocului și colaborări de test cu creatori mici din pescuit/cozy games. Nu cumpărăm campanii până când pagina și prima sesiune convertesc.

Pachetul de magazin va avea icon lizibil la dimensiune mică, 5–8 capturi reale de pe telefon, un clip de 15–30 secunde, descriere localizată și mențiuni explicite despre WebGPU/dispozitive compatibile. Mesajul și capturile trebuie să arate atât pescuitul, cât și explorarea; folosim numai funcții deja livrate.

## 4. Monetizare recomandată

### Model de lansare

Recomand **să păstrăm gratuit tot conținutul existent** pe web și în prima versiune de magazin. Titlul Fishing Free și versiunea web completă au setat deja această așteptare. Venitul vine abia după ce avem dovezi de retenție și producem conținut nou, substanțial: un pachet opțional cu insule, specii și contracte noi. Pe Steam îl vindem ca DLC; pe Android/iOS ca achiziție unică non-consumabilă prin billing-ul fiecărui magazin. Web PWA-ul rămâne gratuit până definim o cale de plată și suport echitabilă.

Nu punem paywall retroactiv pe insulele, progresul sau speciile deja publicate gratuit. Pachetul plătit trebuie să fie o aventură nouă și autonomă, iar jocul gratuit să păstreze o buclă completă de pescuit, vânzare, colecție și upgrade. Fără reclame, energie, pay-to-win sau abonament la lansare.

Motivul modelului: instalarea fără cost reduce fricțiunea, susține distribuirea capturilor și corespunde numelui ales. DLC-ul sau achiziția non-consumabilă sunt potrivite buclei offline și nu promit servicii recurente. Prețul se stabilește după ce expansiunea are scope și cost estimate; auditul Steam propune doar intervale de test, nu un preț aprobat sau o prognoză de venit.

### Extinderea veniturilor, după validarea jocului

- Pachete de expansiune vândute individual: zone/insule, specii și obiective noi. Fiecare trebuie să fie conținut substanțial, nu o taxă pentru progresul deja câștigat.
- Cosmetice opționale: livree, echipament vizual, rame foto și decoruri. Fără statistici plătite.
- Abonament numai dacă există actualizări consecvente, cloud/community sau alte beneficii recurente demonstrate. Nu îl introducem doar ca să avem plată lunară.
- Fără loot boxes. Sunt nepotrivite pentru tonul jocului și cresc obligațiile de dezvăluire a probabilităților.

Pe iOS, expansiunea digitală se implementează prin StoreKit/In-App Purchase; pe Google Play se folosește Play Billing, conform regulilor și excepțiilor curente ale fiecărui magazin. Achizițiile trebuie să aibă restore, verificare de entitlement, preț clar și flux de anulare/eroare. Achizițiile nu se sincronizează între Steam, iOS și Android fără un sistem de conturi și entitlement-uri cross-platform; nu promitem transfer. Regulile pot diferi în funcție de regiune și se reverifică înainte de lansare.

### Economie în joc

Banii existenți rămân recompensa gameplay-ului: captură → vânzare → upgrade. Moneda jocului nu se vinde pe bani reali. Upgrade-urile curente trebuie echilibrate ca scurtături către noi stiluri de pescuit, nu ca bariere grinduite. Înainte de o expansiune, verificăm costul/venitul pe sesiune și dacă un jucător poate avansa fără repetare obositoare.

## 5. Măsurare și experimente

Instrumentăm evenimente fără nume, contacte sau locație reală a jucătorului. Începem cu analytics minimal și consimțământ/notice conform cerințelor magazinelor înainte de orice SDK terț.

| Etapă | Evenimente de produs | Întrebare |
|---|---|---|
| Instalare/pornire | app_launch, webgpu_ready, first_scene_ready, startup_failed | Câți ajung efectiv în joc și cât durează? |
| Activare | first_cast, first_bite, first_catch, first_sale, first_upgrade | Unde renunță jucătorul înainte să înțeleagă loop-ul? |
| Retenție | sesiune, habitat explorat, specie nouă, jurnal deschis | Ce motiv îi face să revină? |
| Distribuire | captură eligibilă, share deschis, share fallback copiere | Care momente merită arătate? |
| Venit | expansion offer viewed, purchase started/completed/restored/refunded | Este oferta noului conținut clară și corectă? |

Dashboard-ul urmărește D1/D7/D30, timpul până la prima captură, completarea primei sesiuni, progresul la vânzare/primul upgrade, crash-uri, cold-start și performanța termică, plus rata de share și interesul pentru pachetul nou. Primele obiective sunt baseline-uri; după un cohort inițial stabilim ținte numerice pe datele reale. Nu optimizăm durata sesiunii cu forța: optimizăm satisfacția și șansa ca utilizatorul să aleagă să revină.

Experimentele se schimbă câte unul: de exemplu, onboarding scurt vs. ghid curent sau card share în toate capturile vs. doar specii noi/recorduri. Măsurăm și efectele negative precum skip-uri, dezinstalări, erori și plângeri.

### Ipoteze de pornire pentru primul cohort

Valorile de mai jos sunt **porți interne de lucru**, nu benchmark-uri garantate. Le reevaluăm după un cohort suficient și le segmentăm pe platformă și dispozitiv:

- 95% dintre pornirile pe dispozitivele declarate compatibile ajung la prima scenă fără eroare GPU fatală; p95 până la prima scenă interactivă sub 45 secunde pe un telefon mid-range suportat.
- Cel puțin 60% dintre jucătorii noi încep pescuitul și ajung la prima captură în prima sesiune; timpul median până la captură sub 10 minute.
- Ca țintă inițială de retenție: D1 25%, D7 10%, D30 5%. Dacă nu atingem valorile, investigăm întâi compatibilitatea, loading-ul, tutorialul și varietatea obiectivelor.
- Cel puțin 5% dintre capturile eligibile deschid share sheet-ul. Rata de deschidere singură nu dovedește instalări virale; legăm rezultatele de URL-uri publice când acestea există.
- Conversia plătită nu devine țintă de optimizare până când jucătorii termină demo-ul fără probleme și oferta, prețul, achiziția și restore-ul sunt clare.

## 6. Roadmap de livrare și criterii de finalizare

Estimările sunt intervale de planificare pentru un singur flux de implementare; se ajustează după hardware, conturi de magazin și rezultatele cohortului.

| Fază | Ordine / estimare | Livrabile | Criteriu de ieșire |
|---|---:|---|---|
| **0. Stabilizare Android** | 1–3 săptămâni | APK-ul 1.0.34 s-a instalat și a pornit pe emulator Android 16 x86_64. Scenic fallback și butonul de deschidere a paginii publice în Chrome au fost verificate, însă WebView-ul emulatorului nu a returnat adaptor WebGPU, iar randarea 3D în Chrome pe A52/MuMu nu este verificată. Urmează testul pe Samsung A52 și MuMu; notăm versiunile Android/WebView/Chrome, GPU, WebGPU/fallback, pornire rece, memorie, background, safe areas, baterie și temperatură. Emulatorul nu înlocuiește telefoanele reale. IPA-ul nu este criteriu pentru faza Android. |
| **1. Activarea** | 1–2 săptămâni | Prima sesiune ghidată, explicații touch, indicator pentru următorul obiectiv, feedback clar la prima mușcătură și captură, revenire din întrerupere. | Jucător nou ajunge la prima captură și înțelege ce poate face apoi; datele arată că nu există abandon major într-un singur pas. |
| **2. Share și pagină de lansare** | 3–7 zile | Cardul de captură și share sheet-ul există în jocul 3D și în Scenic Fishing. Pagina publică a jocului este disponibilă; mai lipsesc o landing page clară pentru distribuție, icon/capturi/video aprobate, descriere și materiale de magazin care reflectă performanța reală pe mobil. | Test pe Android fizic; pe iOS verificare prin Safari/PWA dacă există iPhone. PNG-ul se trimite, linkul public se deschide, datele capturii sunt corecte și distribuirea nu pierde captura. |
| **3. Progres și revenire** | 2–4 săptămâni | Briefingul săptămânal introdus în 1.0.29 există în Scenic 1.0.34 pentru habitatele și destinațiile disponibile, cu progres local și recompensă revendicabilă. Urmează verificarea capturii eligibile, revendicării o singură dată, persistenței după restart și playtest pe telefon. | Jucătorii înțeleg următorul pas; progresul și briefingul funcționează offline și după restart în WebGPU și Scenic Fishing; playtestul arată motive distincte de revenire pentru colecționar și explorator. |
| **4. Pregătirea monetizării** | 1–3 săptămâni după fazele 0–3 și un cohort de validare | Măsurăm retenția și interesul pentru o expansiune nouă, estimăm costul ei, definim exact conținutul gratuit vs. noul conținut plătit și facem prețuri de test. Integrarea StoreKit/Play Billing și DLC se începe numai după aprobarea unui pachet real. | Baza gratuită rămâne completă; expansiunea adaugă valoare distinctă; produsul, entitlement-ul, restore-ul și refund-ul se verifică în sandbox/test tracks înainte de a încasa bani. |
| **5. Provocări între prieteni** | 3–6 săptămâni | Dueluri asincrone: ambii jucători primesc aceleași condiții de pescuit și o fereastră scurtă; câștigă captura validă cea mai grea. Link de provocare, cod de invitație și deep links către joc/pagini de instalare; backend mic pentru reguli și validarea scorului. | Provocarea se deschide din share card pe web și mobil; rezultatul se poate valida și nu expune date personale. |
| **6. Extindere de conținut** | ciclu continuu, după lansare | Portul și cele trei zone existente (Pelican Cay, Turtle Key și Mangrove Reach) trebuie validate înainte de a desena o hartă și mai mare. Apoi un pachet poate adăuga o regiune coerentă, specii, contracte și cosmetice tematice; cloud save se evaluează doar dacă jucătorii îl cer. | Fiecare extindere adaugă o activitate completă și nu destabilizează jocul existent; decizia de a produce regiunea următoare se bazează pe retenție, interes și cost de producție. |

### Primele 90 de zile

- **Zilele 1–30:** terminăm faza 0 pe Android și share; validăm A52, fallback-ul și prima sesiune. iOS rămâne PWA până când există decizie și buget pentru Developer Program. Nu cumpărăm trafic înainte să cunoaștem rata de pornire/activare.
- **Zilele 31–60:** îmbunătățim activarea și colecția; facem soft launch în test track / distribuție limitată, adunăm feedback și stabilim baseline-urile D1/D7.
- **Zilele 61–90:** testăm challenge-ul, măsurăm interesul pentru o expansiune și definim costul/conținutul înainte să construim billing. Lansarea publică se decide numai dacă există compatibilitate, stabilitate, pagină de magazin corectă și proces de suport.

## 7. Riscuri, dependențe și reguli de decizie

- **WebGPU reduce piața accesibilă:** păstrăm un tabel al dispozitivelor testate; dacă acoperirea este prea mică, investigăm renderer alternativ sau o ediție grafică simplificată înainte de a cumpăra promovare.
- **Timpul de încărcare poate omorî retenția:** măsurăm rece, nu doar cache cald; împărțim pregătirea, oferim progres vizibil și evităm blocarea fără explicație.
- **Folosirea unei prize sociale fără destinație publică nu crește instalările:** înainte de release, configurăm link-uri de magazin/universal links și teste pentru fiecare platformă.
- **Clasamentele client-only pot fi falsificate:** orice clasament public cere validare server-side sau o regulă de scor limitată, explicită.
- **Drepturi pentru distribuție comercială:** verificăm licențele fiecărui asset și păstrăm creditele cerute. Repo-ul de bază declară MIT, dar activele terțe au condiții separate.
- **Politicile magazinelor se schimbă:** reverificăm IAP, privacy disclosures, screenshots și rating înainte de fiecare depunere.

### Reguli pe care le păstrăm în toate fazele

1. O schimbare majoră intră numai cu criteriu de finalizare și semnal măsurabil.
2. Nu lansăm monetizare până când jocul de bază este stabil și oferta a fost văzută după valoarea demonstrată.
3. Nu introducem reclame într-o experiență construită pe atmosferă și explorare fără dovezi clare că publicul le acceptă.
4. Fără pay-to-win, energie, streak-uri punitive, loot boxes sau pop-up-uri agresive.
5. Mai întâi testăm pe telefoane reale; un build care doar compilează nu înseamnă că produsul este gata de magazin.

## 8. Arhitectura necesară pentru extindere

- **Save local, fără cont forțat:** păstrăm jocul de bază offline-first. Salvarea existentă are versiunea v1; orice câmp nou primește migrare explicită și un mod de recuperare dacă datele sunt invalide.
- **Cloud save opțional:** îl construim numai cu autentificare clară, conflict policy (cea mai recentă salvare/alegere utilizator) și export/recuperare. Nu cerem cont înainte de prima captură.
- **Challenge manifest versionat:** specia, habitatul, intervalul și regulile sunt date serializabile. Pentru competiție cross-platform, RNG-ul și validarea rezultatului trebuie să fie reproducibile/validate; scorul clientului singur nu este sursă de adevăr.
- **Links:** un singur domeniu HTTPS propriu rezolvă universal links iOS, Android App Links și fallback către pagina magazinului. Challenge-ul poate fi deschis în web înainte de instalare.
- **Billing:** strat comun în joc, implementări StoreKit și Play Billing, SKU-uri distincte pe platformă, restore și handling pentru pending/cancel/fail. Starea achiziției nu se deduce din localStorage.
- **Analytics:** schemă de evenimente minimă, anonimizată și cu sampling pentru evenimente tehnice; nu trimitem poziție GPS, contacte, mesaje sau nume implicit.
- **Platform achievements:** achievements/leaderboards native se pun în spatele unui adapter, ca jocul să rămână jucabil fără Game Center/Play Games. Pentru clasament comun folosim backend validat.

### Decizia pentru multiplayer

Competiția începe cu dueluri asincrone prin link, nu cu lupte live. Regula prototipului este „prinde o specie identică peste captura prietenului”; API-ul opțional salvează și compară o singură replică. Jucătorul declară captura, iar serverul verifică doar specia și intervalul plauzibil de greutate, deci rezultatul e potrivit pentru dueluri amicale, nu pentru clasamente, premii sau bani. Următoarea etapă online cere găzduirea serviciului pe HTTPS cu disc persistent și configurarea URL-ului în build. Lupta live și matchmaking-ul vin după validare autoritativă și o comunitate activă.

## 9. Implementarea începută în această etapă

Am adăugat primul element din faza 2: buton **Share catch** pe cardul capturii, generarea locală a unui card PNG cu portretul peștelui și valorile capturii, share sheet pentru iOS/Android și fallback-uri Web Share/copiere. Cardul afișează invitația „Can you beat this catch?”, iar timerul capturii se suspendă cât timp share sheet-ul este deschis. URL-ul este luat din VITE_PUBLIC_GAME_URL dacă e setat sau din originea publică Web; URL-ul intern localhost nu este distribuit.

Am adăugat și un prim duel asincron, cu link de invitație și trimitere înapoi a capturii. Prototipul funcționează fără server, cu scor auto-declarat. Am adăugat și un Node API opțional pentru salvarea centralizată și compararea unui rezultat; acesta trebuie găzduit cu HTTPS și disc persistent, iar URL-ul configurat la build în `VITE_DUEL_API_URL`. Scorul rămâne auto-declarat și doar pentru dueluri amicale; nu există autentificare, anti-trișare sau clasament public.

### Starea de execuție

- [x] Roadmap și faze cu criterii de ieșire scrise în acest fișier.
- [x] Share catch implementat și proiectele Capacitor sincronizate cu build-ul web.
- [x] 22 realizări offline, progres de carieră salvat și migrare din salvările v1.
- [x] Jurnal cu tab pentru realizări, progres vizibil și notificări de deblocare.
- [x] Pelican Cay: teren nou, marker pe minimap, habitat de flats, bonefish și descoperire salvată.
- [x] Panou de contracte offline: 11 obiective permanente, progres persistent și recompense revendicabile o singură dată.
- [x] Ghid de specii offline: colecție completă, indicii de habitat/oră și record personal, filtrabile pe ape.
- [x] Turtle Key: insulă procedurală explorabilă, marker pe minimap, habitat propriu, trei specii catchable și contracte de expediție.
- [x] Mangrove Reach: arhipelag procedural cu vegetație densă, canale de pescuit, marker pe minimap, snook și tarpon, contracte și realizări.
- [x] Obiectiv single-player persistent în HUD: contractul următor, progres, revendicare directă și trecere la colecția de specii după terminarea contractelor.
- [x] Prototip de duel asincron prin share link; țintă pe specie și greutate, trimitere înapoi a rezultatului.
- [x] API Node opțional pentru păstrarea și compararea duelurilor; necesită deploy și configurarea URL-ului public.
- [x] Briefingul săptămânal există în WebGPU și Scenic Fishing; progresul și recompensa sunt locale. Buildul 1.0.29 a verificat afișarea pe emulator; captura eligibilă, revendicarea și persistența după restart încă trebuie parcurse integral.
- [x] APK debug Fishing Free 1.0.34/build 34 compilat, verificat ca semnat/aliniat și instalat ca actualizare pe emulator Android 16 x86_64; WebView-ul emulatorului nu a furnizat adaptor WebGPU, iar Scenic fallback și deschiderea paginii publice în Chrome au fost verificate.
- [ ] Verificare iOS prin Safari/PWA pe un iPhone disponibil.
- [ ] IPA/TestFlight/App Store: amânat până există cont Apple Developer și certificate/provisioning profile; artifactul de simulator nu se instalează pe iPhone.
- [ ] Măsurători de cold-start, fps/temperatură, prima sesiune și compatibilitate înainte de beta publică.

## Referințe oficiale

- Apple cere IAP pentru deblocări și conținut digital în aplicațiile iOS, iar subscripțiile trebuie să livreze valoare continuă: [App Review Guidelines, secțiunea 3](https://developer.apple.com/app-store/review/guidelines/uk/).
- Google Play cere Play Billing pentru bunuri și funcții digitale, cu excepții/programări regionale, și dezvăluirea odds-urilor pentru obiecte aleatorii plătite: [Payments policy](https://support.google.com/googleplay/android-developer/answer/9858738?hl=en).
- Pluginul oficial Capacitor Share folosește share sheet pe iOS/Android și Web Share API pe web; fișierele pot fi trimise din cache nativ: [Capacitor Share API](https://capacitorjs.com/docs/apis/share).
- Achievements și leaderboard-urile native pot fi adăugate după validarea progresului; [Google Play Games Services overview](https://developer.android.com/games/pgs/overview) și [leaderboards](https://developer.android.com/games/pgs/leaderboards?hl=en) descriu capabilitățile și integrarea.

## Istoric verificat — 3 octombrie 2026 / Fishing Free 1.0.20

- **Publicat:** Pages și Android/Windows Actions rămân la 1.0.16. Buildurile de mai jos nu au fost încă împinse în repository.
- **Android local:** APK-ul 1.0.20/build 21 este semnat debug și aliniat. În emulatorul Android 16 x86_64 s-a instalat peste buildul local anterior, a pornit automat Scenic Fishing după eșecul WebGPU al WebView-ului și a ajuns prin atingere la lupta cu peștele. Samsung A52, MuMu Player și Huawei încă așteaptă verificare fizică.
- **Windows:** folderul și ZIP-ul 1.0.20 sunt construite. Lansarea din folder a dat HTTP 200 pentru joc, WebGPU disponibil, scenă 3D/tutorial randate și zero service workers în shell-ul desktop. Steam client, overlay, controller și PC curat nu au fost validate.
- **Gameplay:** buildul conține Sunspire Atoll, 24 specii, 11 contracte, 22 achievements și brief-ul săptămânal. Brief-ul nou trebuie încă jucat cap-coadă; nu avem măsurători de retenție sau venit.
- **iOS:** fără Mac/Xcode de test și fără membership de distribuție Apple Developer, nu există IPA instalabil. PWA prin Safari rămâne disponibilă.

Următoarea prioritate este testul fizic pe A52 și apoi o verificare Steam-client. Păstrăm jocul de bază gratuit; DLC-ul rămâne ipoteză până avem date de playtest și retenție.
