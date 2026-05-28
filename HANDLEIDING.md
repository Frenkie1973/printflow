# PrintFlow – Installatie- en Deployhandleiding

## Wat is PrintFlow?
PrintFlow is een web-app voor het beheren van 3D-printorders op de werkvloer.
Collega's kunnen orders aanmaken, starten, volgen en afronden via telefoon of computer.

---

## Stap 1 – Supabase instellen

### 1.1 Account aanmaken
1. Ga naar [supabase.com](https://supabase.com) en maak een gratis account.
2. Klik **New project** → kies een naam (bv. `printflow`) → kies een regio (Europe West) → stel een wachtwoord in.
3. Wacht tot het project klaar is (~2 minuten).

### 1.2 Database aanmaken
1. Ga in Supabase naar **SQL Editor** → **New query**.
2. Open het bestand `supabase_schema.sql` (zit in de projectmap).
3. Plak de hele inhoud in het SQL-venster.
4. Klik **Run** (groene knop).
5. Je ziet: *Success. No rows returned* – dat is correct.

### 1.3 API-gegevens kopiëren
1. Ga naar **Project Settings** → **API**.
2. Noteer:
   - **Project URL** → bv. `https://abcdefgh.supabase.co`
   - **anon / public key** → lange string die begint met `eyJ...`
   
   ⚠️ Bewaar deze twee gegevens, je hebt ze in stap 3 nodig.

### 1.4 Printers instellen
Na het uitvoeren van het schema staan er 4 voorbeeldprinters in de database.
Pas dit aan via **Supabase → Table Editor → printers**:
- Wijzig namen naar jouw printers (bv. `Prusa XL – Hal 2`)
- Verwijder niet-bestaande printers

---

## Stap 2 – GitHub repository aanmaken

### 2.1 GitHub account
- Ga naar [github.com](https://github.com) en log in (of maak een account).

### 2.2 Repository aanmaken
1. Klik de **+** knop rechtsboven → **New repository**
2. Instellingen:
   - **Repository name:** `printflow`
   - **Visibility:** Private (aanbevolen) of Public
   - ❌ *Initialize with README* – **niet aanvinken**
3. Klik **Create repository**
4. Noteer de URL: `https://github.com/JOUWnaam/printflow`

### 2.3 Code uploaden

#### Optie A – Via GitHub Desktop (eenvoudigst)
1. Download [GitHub Desktop](https://desktop.github.com)
2. Log in met je GitHub-account
3. Klik **File → Add Local Repository** → kies de map `printflow`
4. Als het niet herkend wordt: **File → Create New Repository** → kies dezelfde map
5. Klik **Publish repository** → kies je aangemaakte repository

#### Optie B – Via terminal
```bash
cd /pad/naar/printflow
git init
git add .
git commit -m "Eerste versie PrintFlow"
git branch -M main
git remote add origin https://github.com/JOUWnaam/printflow.git
git push -u origin main
```

### 2.4 Wijzigingen later doorvoeren (GitHub Desktop)
1. Maak je codewijzigingen in de map
2. Open GitHub Desktop → je ziet de gewijzigde bestanden
3. Vul een korte beschrijving in (bv. "Kleur toegevoegd aan filters")
4. Klik **Commit to main**
5. Klik **Push origin**
→ Vercel pakt de wijziging automatisch op en deploy opnieuw.

---

## Stap 3 – Vercel publiceren

### 3.1 Account aanmaken
- Ga naar [vercel.com](https://vercel.com) en log in **via GitHub** (klik "Continue with GitHub").

### 3.2 Project importeren
1. Klik **New Project**
2. Kies je `printflow` repository uit de lijst
3. Klik **Import**

### 3.3 Environment variables instellen
Vóór je op Deploy klikt, klik je op **Environment Variables** en voeg toe:

| Variable | Waarde |
|---|---|
| `VITE_SUPABASE_URL` | `https://abcdefgh.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...jouw_anon_key` |

### 3.4 Deployen
1. Klik **Deploy**
2. Vercel bouwt de app (~1-2 minuten)
3. Je krijgt een URL zoals: `https://printflow.vercel.app`

### 3.5 Eigen domeinnaam (optioneel)
- Vercel → je project → **Domains** → voeg een eigen domein toe
- Of gebruik de standaard `.vercel.app` URL

---

## Stap 4 – App delen met collega's

### De vaste URL
Je app is beschikbaar op de URL die Vercel geeft, bv.:
```
https://printflow.vercel.app
```

Deel deze URL via WhatsApp of mail met collega's.

### Collega's aanmelden
1. Collega opent de URL
2. Klikt op **"Nog geen account? Registreren"**
3. Vult e-mail + wachtwoord in
4. Checkt de inbox voor bevestigingsmail
5. Klikt de bevestigingslink → kan nu inloggen

---

## Stap 5 – App op het startscherm zetten

### iPhone / iPad
1. Open de app in **Safari** (niet Chrome!)
2. Tik het **Deel-icoon** (vierkantje met pijl omhoog)
3. Scroll omlaag → **"Zet op beginscherm"**
4. Klik **Voeg toe**

### Android
1. Open de app in **Chrome**
2. Tik de drie puntjes (⋮) rechts bovenin
3. Kies **"Aan startscherm toevoegen"** of **"App installeren"**
4. Klik **Toevoegen**

De app start dan als een volledige app zonder adresbalk.

---

## Gebruikershandleiding

### Dashboard
- Bovenaan zie je een **printer-overzicht**: welke printer bezig is en de resterende tijd
- Eronder alle actieve printorders, kleurgecodeerd op urgentie:
  - 🟢 Groen = op schema
  - 🟠 Oranje = deadline morgen of vandaag  
  - 🔴 Rood = deadline verstreken

### Nieuwe printorder aanmaken
1. Klik **Nieuwe order** (oranje knop)
2. Vul artikelnummer in → als het al eerder gebruikt is, verschijnen suggesties
3. Vul alle velden in
4. Klik **Aanmaken**

### Print starten
1. Zet de order op **Voorbereiden** (eerste knop)
2. Klik **Print starten**
3. De timer begint meteen af te tellen
4. De printer wordt als **bezet** gemarkeerd

### Print afronden
- Klik **Klaar melden** → status wordt *Klaar*
- Of klik **Mislukt** → status wordt *Mislukt*

### Filters gebruiken
- Zoek op naam of artikelnummer via het zoekveld
- Filter op status, printer of materiaal via de knoppen
- Klik **Filters wissen** om alles te zien

### Order dupliceren
Handig als je hetzelfde artikel meerdere keren print: klik het kopieer-icoon op een order.

---

## Problemen oplossen

| Probleem | Oplossing |
|---|---|
| "Supabase environment variables missing" | Controleer of je de env-variabelen correct hebt ingevoerd in Vercel |
| Bevestigingsmail komt niet aan | Controleer spam; of ga in Supabase naar Auth → Users en bevestig handmatig |
| Wijziging verschijnt niet op Vercel | Zorg dat je de commit hebt ge-**pushed** via GitHub Desktop |
| App werkt niet offline | PWA werkt alleen na de eerste keer laden met internet |
| Printer staat er niet bij | Voeg hem toe in Supabase → Table Editor → printers |

---

## Technische stack

- **React 18** + **Vite** – frontend framework
- **Tailwind CSS** – styling
- **Supabase** – database, authenticatie, realtime
- **Vercel** – hosting en deployment
- **vite-plugin-pwa** – Progressive Web App ondersteuning
