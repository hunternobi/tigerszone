# TigersZone – Projektspezifikation (v1.0)

Tippspiel-Plattform für Fans der Straubing Tigers (DEL, Saison 2026/27). Diese Spezifikation ist als Übergabe-Dokument für den Aufbau mit Claude Code gedacht.

## 1. Vision & Tagline

**Claim:** "Das TigersZone-Tippspiel für die Straubing Tigers"

**Beschreibung:** Die offizielle Community-Plattform für Straubing Tigers Fans. Tippspiel, Watch Party Finder und mehr – kostenlos, von Fans für Fans.

> Hinweis: "Confidence Index" und "Man of the Match Voting" aus dem ursprünglichen Entwurf sind bewusst **nicht** Teil von V1 (siehe Abschnitt 9, Backlog). Der Claim-Text sollte entsprechend angepasst werden, bevor er live geht.

## 2. Sportlicher Rahmen

- Liga/Verein: DEL, ausschließlich Spiele der Straubing Tigers
- Zeitraum: Saison 2026/27
- Erweiterbarkeit: Datenmodell so anlegen, dass später weitere Vereine/Ligen ergänzt werden könnten (nicht Ziel von V1, aber nicht durch Struktur blockieren)

## 3. Nutzerrollen

| Rolle | Rechte |
|---|---|
| Gast (nicht eingeloggt) | Startseite, öffentliche Rangliste, Spielplan ansehen |
| Nutzer | Registrierung per E-Mail + Passwort, Tipps abgeben, eigene Tippgruppen erstellen/beitreten, Meme einreichen & abstimmen |
| Admin | Alles wie Nutzer, zusätzlich: Ergebnisse pflegen, Spielplan pflegen, Sponsoren verwalten, Meme-Gewinner markieren |

**Auth:** E-Mail + Passwort (klassische Registrierung). Passwort-Hashing serverseitig (z. B. bcrypt), Passwort-Reset-Flow per E-Mail einplanen.

## 4. Kernfunktionen

### 4.1 Tippspiel & Punktesystem
- Spielplan-Ansicht: die nächsten 5 anstehenden Spiele, mit Team-Logos (kein reiner Abkürzungstext)
- Tipp-Abgabe pro Spiel bis Tippschluss (Anpfiff)
- Punktesystem:
  - 3 Punkte für richtig getippten Sieger
  - +2 Punkte zusätzlich für exakten Spielstand
  - +1 Punkt zusätzlich für richtige Tordifferenz bzw. richtig erkannte Verlängerung/Penalty-Entscheidung
- **Derby Double Points:** bei als "Derby" markierten Spielen werden alle erzielten Tipp-Punkte verdoppelt

### 4.2 Rangliste
- Gesamtrangliste (alle Nutzer)
- Gruppen-Rangliste (aktuell gewählte private Gruppe)

### 4.3 Private Tippgruppen
- Kleines interaktives Dashboard zum Erstellen eigener Gruppen
- Beitritt ausschließlich per Einladungslink (kein Gruppencode)
- Wechsel zwischen mehreren Gruppen im Dashboard möglich

### 4.4 Meme der Woche
- Nutzer reichen Tigers-Memes ein
- Community stimmt ab
- Gewinner wird wöchentlich gekürt und (manuell) auf Instagram bekanntgegeben – kein automatischer Instagram-API-Post in V1

### 4.5 Watch Party Finder (zusätzliches V1-Feature)
Da im ursprünglichen Entwurf nur erwähnt, nicht spezifiziert – vorgeschlagene Grunddefinition, bitte gegenprüfen:
- Nutzer oder Admin tragen Orte ein, an denen zu einem bestimmten Spiel gemeinsam geschaut wird (z. B. Kneipe, Fanclub-Treffen)
- Anzeige als einfache Liste je Spiel: Ort, Adresse, Uhrzeit, ggf. Veranstalter
- Kein Kartenmodul in V1 (kann später ergänzt werden)

### 4.6 Admin-Bereich
- Ergebnisse eintragen/korrigieren → schreibt direkt in MongoDB (siehe Abschnitt 6)
- Spielplan pflegen (Spiele anlegen, als Derby markieren, verschieben/absagen)
- Sponsoren verwalten (Name, Logo, Link)
- Meme-Gewinner markieren

## 5. Sponsoring & Preise

- Es wird reale Preise geben (Sponsoren-Preise)
- Sponsoren werden als kleine Werbe-Leiste eingeblendet, sichtbar beim Herunterscrollen (kein Pop-up, kein aufdringliches Banner)
- **Rechtlicher Hinweis (kein Rechtsrat):** Sobald echte Preise vergeben werden, sollten Teilnahmebedingungen, Impressum und Datenschutzerklärung vorhanden sein. Je nach Ausgestaltung (Wert der Preise, Zufalls- vs. Geschicklichkeitselement) kann das deutsche Recht zu Gewinnspielen/Glücksspiel relevant werden – das sollte vor dem Livegang mit einer Rechtsberatung geprüft werden.

## 6. Datenspeicherung

Entscheidung: **MongoDB Atlas** für alle Daten (Nutzer, Gruppen, Tipps, Spiele/Ergebnisse, Meme, Sponsoren, Watch Parties). Der Admin-Bereich schreibt direkt in die Datenbank – kein Git-Commit-Mechanismus, kein Redeploy bei Ergebnis-Updates nötig.

## 7. Design

### 7.1 Startseite / Hero
1. Ganz oben: TigersZone-Logo + Claim "Das TigersZone-Tippspiel für die Straubing Tigers"
2. Darunter: Hero-Bild – Stimmungsfoto aus dem Eisstadion am Pulverturm (Fans mit Fahnen/Banner "Eisstadion am Pulverturm", Spieler im Vordergrund, siehe bereitgestelltes Referenzfoto). Kein illustrierter Spieler im Torschuss-Moment mehr nötig, echtes Fan-/Stadionfoto als Hero-Visual.
3. Beim Herunterscrollen: 3D-Animation – ein Puck fliegt ins Tor, **bevor** die weiteren Textinhalte der Seite erscheinen (Scroll-getriggerte Sequenz, danach normaler Seiteninhalt). Die Animation ist unabhängig vom Hero-Foto und wird als eigenes Element darüber/danach eingeblendet.
4. Ganz unten: Sponsoren-Leiste

### 7.2 Farbwelt (logo-treu)
Abgeleitet aus dem TigersZone-Logo (Navy-Hintergrund, Tigerkopf in Blautönen, weißer Schriftzug, dunkelrote/bordeauxfarbene Augen). Richtwerte, vor Umsetzung mit der Originaldatei (Vektor/Farbwerte) abgleichen:

| Rolle | Farbe | Richt-Hex |
|---|---|---|
| Primary / Hintergrund | Dunkles Navy | `#0A0F3D` |
| Secondary | Stahlblau (Tigerkopf) | `#5B7FC7` |
| Tertiary | Dunkleres Blau (Konturen) | `#2A3A7A` |
| Akzent | Bordeaux/Dunkelrot (Augen) | `#5A1F2E` |
| Text/Kontrast | Weiß | `#FFFFFF` |

Kein Lila im Farbsystem (Abweichung vom ursprünglichen Entwurf, bewusst zugunsten Logo-Konsistenz).

### 7.3 Komponenten
- Buttons: Primary, Secondary, Outline
- Cards: abgerundet, mit Schatten
- Forms: einheitliche Eingabefelder mit Focus-States
- Navigation: responsiver Header mit Mobile-Menü (kein App, aber vollständig mobil nutzbar)

## 8. Tech Stack

- Frontend: Next.js 14+ (App Router), React, TypeScript
- Styling: Tailwind CSS mit TigersZone-Farbpalette (siehe 7.2)
- Icons: Lucide React
- Datenbank: MongoDB Atlas mit Mongoose
- Auth: E-Mail + Passwort (z. B. NextAuth Credentials Provider oder eigene Lösung mit bcrypt + JWT/Session)
- 3D-Scroll-Animation: z. B. Three.js oder React Three Fiber, gesteuert über Scroll-Trigger (z. B. mit Framer Motion / GSAP ScrollTrigger für die Sequenzsteuerung)

## 9. Vorgeschlagenes Datenmodell (Entwurf)

```
User          { _id, email, passwordHash, name, createdAt, role: "user"|"admin" }
Group         { _id, name, inviteCode, ownerUserId, createdAt }
GroupMember   { groupId, userId, joinedAt }
Team          { _id, name, shortName, logoUrl }
Game          { _id, homeTeamId, awayTeamId, kickoff, isDerby: bool, status, homeScore, awayScore, overtime: "REG"|"OT"|"SO" }
Prediction    { _id, userId, gameId, predictedHome, predictedAway, predictedOvertime, pointsAwarded }
MemeSubmission{ _id, userId, imageUrl, weekOf, votes, isWinner }
Sponsor       { _id, name, logoUrl, linkUrl, order }
WatchParty    { _id, gameId, location, address, time, hostName }
```

## 10. Projektstruktur

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx            # Homepage inkl. Hero + Scroll-Animation
│   ├── tippspiel/
│   ├── gruppen/             # Tippgruppen-Dashboard
│   ├── community/           # Meme der Woche, Watch Party Finder
│   ├── admin/                # Admin-Bereich (Ergebnisse, Spielplan, Sponsoren)
│   └── profile/
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── GameList.tsx
│   ├── PredictionForm.tsx
│   ├── Leaderboard.tsx
│   ├── GroupDashboard.tsx
│   ├── WatchPartyFinder.tsx
│   ├── MemeOfTheWeek.tsx
│   ├── SponsorBar.tsx
│   └── HeroScrollAnimation.tsx
├── types/
├── lib/
└── utils/
```

## 11. Backlog (bewusst nicht in V1)

- Badges & Profil-Statistiken (Gamification)
- Newsletter-Anmeldung
- Confidence Index
- Man of the Match Voting
- Weitere Vereine/Ligen über die Straubing Tigers hinaus
- Automatischer Instagram-Post für Meme-Gewinner

## 12. Offene Punkte vor Build-Start

- Exakte Logo-Farbwerte (Vektordatei/Hex-Codes) für pixelgenaue Umsetzung
- Sponsorennamen/-logos für die Werbe-Leiste
- Hosting-Ziel (z. B. Vercel für Next.js) und Domain
- Rechtstexte: Teilnahmebedingungen, Impressum, Datenschutzerklärung (juristisch prüfen lassen wegen echter Preise)
- E-Mail-Versand-Dienst für Passwort-Reset (z. B. Resend, Postmark)

**Bereits geklärt:**
- Gruppenbeitritt: ausschließlich per Einladungslink
- Hero-Visual: Stadionfoto (Eisstadion am Pulverturm, Fans/Banner) statt illustriertem Spieler im Torschuss
