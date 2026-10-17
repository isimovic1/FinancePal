# FinancePal

Mobilna aplikacija za praćenje osobnih financija (Expo / React Native, Android i iOS).

## Mogućnosti

- **Stanje računa** — početno stanje + svi prihodi − svi troškovi, uvijek ažurno.
- **Prihodi** — plaća, dodatni prihodi… unos u par dodira kad sjedne uplata.
- **Troškovi po kategorijama** — Kuća i režije, Hrana, Prijevoz, Zabava, Kafići i restorani, Zdravlje,
  Odjeća, Pretplate, Štednja, Ostalo; vlastite kategorije s ikonom i bojom.
- **Budžeti** — mjesečni limit po kategoriji s prikazom koliko je ostalo / prekoračeno.
- **Štednja** — uplate u štednju vode se odvojeno od potrošnje.
- **Mjesečni izvještaj** — prihodi, troškovi, ušteđeno, razlika, stanje na početku i kraju mjeseca,
  graf troškova po kategorijama, usporedba s prošlim mjesecom, potrošnja po danima, najveći troškovi.
- **Transakcije** — popis po mjesecima i danima, filtri po vrsti i kategoriji, uređivanje i brisanje.

Podaci se spremaju lokalno na uređaju.

## Pokretanje

```bash
npm install
npx expo start      # skeniraj QR kod aplikacijom Expo Go
npm run typecheck
npm test
```

Svaki push na `develop` pokreće GitHub Actions workflow koji builda Android APK i objavljuje ga
pod **Releases**, odakle se može skinuti i instalirati direktno na mobitel.
