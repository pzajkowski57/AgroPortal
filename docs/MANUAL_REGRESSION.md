# Testy Regresji Manualnej — AgroPortal

## Cel dokumentu

Ten dokument zawiera listę testów, które **wymagają weryfikacji przez człowieka**, ponieważ nie mogą być w pełni pokryte testami automatycznymi. Obejmuje aspekty wizualne, interaktywność w przeglądarce, zachowanie responsywne, zewnętrzne usługi (OAuth, email, S3) oraz odczucia użytkownika (UX).

## Kiedy uruchamiać

- Po zakończeniu każdego sprintu
- Przed wdrożeniem na produkcję (release)
- Po istotnych zmianach w UI lub infrastrukturze

## Szacowany czas

**~90–120 minut** (pełny przebieg wszystkich kategorii)

Ostatnia aktualizacja: **2026-04-05**

> **Uwaga:** Aktualizuj ten plik po każdym sprincie o nowe funkcjonalności. Dodawaj nowe checkboxy do odpowiednich sekcji lub twórz nowe kategorie w miarę rozwoju projektu.

---

## Wymagania wstępne

Przed rozpoczęciem testów upewnij się, że:

- [ ] Aplikacja działa lokalnie: `npm run dev` → `http://localhost:3000`
- [ ] Docker uruchomiony: `docker compose up -d` (PostgreSQL + Redis)
- [ ] Baza danych zasiana: `npm run db:seed`
- [ ] Przeglądarka w trybie incognito (brak cache i zalogowanej sesji)

---

## 1. Wygląd i Responsywność

> Sprawdź każdy widok w narzędziach deweloperskich przeglądarki (DevTools → Toggle device toolbar).

### Strona główna (`/`)

- [ ] Strona główna wygląda poprawnie na Desktop (1920×1080)
- [ ] Strona główna wygląda poprawnie na Tablet (768px)
- [ ] Strona główna wygląda poprawnie na Mobile (375px)
- [ ] HeroSection: gradientowe tło, biały tekst, pasek wyszukiwania widoczny i wyśrodkowany
- [ ] Chipsy kategorii w HeroSection (Ciągniki, Kombajny, Przyczepy…) widoczne i zawijają się poprawnie na mobile
- [ ] CategoriesSection: karty kategorii w siatce, poprawne ikony
- [ ] FeaturedListings: wyróżnione ogłoszenia w siatce
- [ ] StatsSection: statystyki wyrównane i czytelne
- [ ] CTASection: wezwanie do działania widoczne i klikalne

### Lista ogłoszeń (`/ogloszenia`)

- [ ] Sidebar filtrów widoczny na Desktop (szerokość ~240px po lewej)
- [ ] Sidebar filtrów ukryty na Mobile — zamiast niego przycisk "Filtry"
- [ ] Siatka ogłoszeń: 3 kolumny na Desktop, 2 na Tablet, 1 na Mobile
- [ ] Karty ogłoszeń: obrazek w proporcji 4:3, tytuł, cena, lokalizacja, badge stanu

### Szczegóły ogłoszenia (`/ogloszenia/[id]`)

- [ ] Layout 2-kolumnowy na Desktop (galeria 3/5 + sidebar 2/5)
- [ ] Layout jednokolumnowy (stack) na Mobile — galeria nad detalami
- [ ] Opis ogłoszenia widoczny poniżej galerii na Desktop
- [ ] Sekcja "Podobne ogłoszenia" poniżej layoutu (pełna szerokość)

### Design system

- [ ] Kolory zgodne z design system: primary `agro-500` (zielony), akcenty pomarańczowe (`orange-500`)
- [ ] Fonty ładują się poprawnie (brak fallbacków systemowych)
- [ ] Obrazki mają poprawne aspect ratio (4:3 na kartach ogłoszeń)
- [ ] Ikony (Lucide React) renderują się poprawnie

---

## 2. Nawigacja

- [ ] Logo "AgroPortal" prowadzi do strony głównej (`/`)
- [ ] Menu nawigacyjne (Desktop): wszystkie linki działają i są aktywne (`aria-current="page"`)
- [ ] Hamburger menu (Mobile): otwiera się po kliknięciu, zamyka krzyżykiem lub kliknięciem poza
- [ ] Przycisk "Dodaj ogłoszenie" w nagłówku (pomarańczowy) widoczny na Desktop i Tablet
- [ ] Link "Zaloguj się" w nagłówku widoczny dla niezalogowanych użytkowników
- [ ] Sticky header: nagłówek pozostaje przyklejony podczas scrollowania
- [ ] Skip-link "Przejdź do treści" pojawia się przy nawigacji klawiaturą (Tab)
- [ ] Breadcrumbs na stronie szczegółów ogłoszenia (`/ogloszenia/[id]`): Ogłoszenia → Kategoria → Tytuł
- [ ] Linki w breadcrumbs działają (klik w "Ogłoszenia" → `/ogloszenia`, klik w kategorię → filtr)
- [ ] Back button w przeglądarce działa poprawnie (nie powoduje błędów stanu)
- [ ] Strona 404 (`/nieistniejaca-strona`) wyświetla się dla nieistniejących URL-i
- [ ] Strona not-found dla nieistniejącego ogłoszenia (`/ogloszenia/nieistniejace-id`)
- [ ] Link "Zobacz inne ogłoszenia sprzedającego" na karcie sprzedawcy działa

---

## 3. Autoryzacja

### Logowanie (`/logowanie`)

- [ ] Formularz logowania: pola email + hasło widoczne
- [ ] Przycisk "Kontynuuj z Google" widoczny
- [ ] Divider "lub" między Google a formularzem wyświetla się poprawnie
- [ ] Link do rejestracji ("Zarejestruj się") działa
- [ ] Błędne dane (złe hasło): wyświetla czytelny komunikat błędu (nie ujawnia, co jest złe)
- [ ] Ikona oka w polu hasła: kliknięcie przełącza widoczność hasła
- [ ] Po pomyślnym logowaniu: redirect na stronę główną, nagłówek pokazuje menu użytkownika
- [ ] Sesja utrzymuje się po odświeżeniu strony (F5)

### Rejestracja (`/rejestracja`)

- [ ] Formularz rejestracji: pola Imię, E-mail, Hasło, Powtórz hasło
- [ ] Wskaźnik siły hasła (PasswordStrength) reaguje na wpisywanie w czasie rzeczywistym
- [ ] Checkbox "Akceptuję regulamin": przycisk "Zarejestruj się" nieaktywny bez zaznaczenia
- [ ] Link do regulaminu (`/regulamin`) widoczny i klikalny
- [ ] Link do logowania ("Zaloguj się") działa
- [ ] Błąd przy niezgodnych hasłach: komunikat walidacyjny
- [ ] Błąd przy istniejącym emailu: komunikat walidacyjny

### Google OAuth

- [ ] Kliknięcie "Kontynuuj z Google" → redirect do ekranu logowania Google
- [ ] Po wyborze konta Google → powrót do aplikacji jako zalogowany użytkownik
- [ ] Nowy użytkownik przez Google: konto tworzone automatycznie

### Sesja i wylogowanie

- [ ] Menu użytkownika w nagłówku: kliknięcie otwiera dropdown (Mój profil, Wyloguj)
- [ ] Wylogowanie: kliknięcie "Wyloguj" → redirect na stronę główną, sesja usunięta
  > **UWAGA: zgłoszony bug** — zweryfikować, czy wylogowanie działa poprawnie i sesja jest faktycznie usuwana (sprawdź cookies w DevTools → Application → Cookies)
- [ ] Chronione strony (`/profil`, `/panel/*`): przekierowują niezalogowanych na stronę logowania
- [ ] Admin panel (`/admin/*`): dostępny tylko dla roli admin

---

## 4. Ogłoszenia — Lista (`/ogloszenia`)

### Ładowanie i dane

- [ ] Strona ładuje się z danymi z bazy (ogłoszenia widoczne)
- [ ] Skeleton loading (9 kart) widoczny podczas ładowania danych
- [ ] Licznik wyników: "Znaleziono X ogłoszeń" wyświetla się i aktualizuje

### Filtry — Desktop sidebar

- [ ] Filtr kategorii (CategoryAccordion): accordion otwiera/zamyka się, kliknięcie kategorii filtruje ogłoszenia
- [ ] Filtr województwa (VoivodeshipSelect): dropdown działa, wybór filtruje wyniki
- [ ] Filtr ceny (PriceRangeInput): pola min/max z walidacją, filtruje po utracie focusu (blur)
- [ ] Filtr stanu (ConditionCheckboxes): checkboxy Nowy/Używany/Na części działają niezależnie
- [ ] Wyszukiwarka (Search Input): debounce ~400ms, wyniki aktualizują się po wpisaniu
- [ ] Przycisk "Wyczyść filtry (X)" pojawia się gdy aktywny jest co najmniej 1 filtr
- [ ] "Wyczyść filtry" resetuje wszystkie filtry naraz

### Filtry — Mobile bottom sheet

- [ ] Przycisk "Filtry" (z ikoną slidersów) widoczny na Mobile
- [ ] Licznik aktywnych filtrów na przycisku (zielona odznaka)
- [ ] Bottom sheet otwiera się animacją od dołu ekranu
- [ ] Scrollowanie treści w bottom sheet (gdy filtry nie mieszczą się)
- [ ] Tło (backdrop) zaciemnia się gdy sheet otwarty; kliknięcie w tło zamyka sheet
- [ ] Przycisk "X" w nagłówku sheetu zamyka go
- [ ] Przycisk "Pokaż wyniki" zamyka sheet i stosuje filtry
- [ ] Body scroll zablokowany gdy sheet otwarty

### URL i stan

- [ ] Filtry zapisują się w URL (np. `?category=ciagniki&voivodeship=mazowieckie`)
- [ ] Można skopiować URL z filtrami i otworzyć w nowej karcie — filtry się odtworzą
- [ ] Sortowanie zapisuje się w URL (parametr `sort`)

### Sortowanie

- [ ] Select sortowania: 4 opcje — Najnowsze, Cena: rosnąco, Cena: malejąco, Popularne
- [ ] Zmiana sortowania aktualizuje listę ogłoszeń

### Paginacja

- [ ] Paginacja widoczna gdy jest więcej niż 1 strona wyników (powyżej 20 ogłoszeń)
- [ ] Przyciski Następna/Poprzednia strona działają
- [ ] Aktywna strona wyróżniona wizualnie

### Stany brzegowe

- [ ] Stan pusty: "Brak ogłoszeń pasujących do filtrów" z przyciskiem "Wyczyść filtry"
- [ ] Stan błędu: czerwony alert z komunikatem błędu
- [ ] Kliknięcie karty ogłoszenia → przejście do `/ogloszenia/[id]`

---

## 5. Ogłoszenia — Szczegóły (`/ogloszenia/[id]`)

### Galeria zdjęć (ImageGallery)

- [ ] Główne zdjęcie wyświetla się w proporcji 4:3
- [ ] Miniatury (thumbnails) pod głównym zdjęciem widoczne i scrollowalne (overflow-x)
- [ ] Kliknięcie miniatury zmienia główne zdjęcie
- [ ] Aktywna miniatura: obramowanie w kolorze `agro-500`
- [ ] Kursor `zoom-in` na głównym zdjęciu

### Lightbox

- [ ] Kliknięcie głównego zdjęcia otwiera lightbox
- [ ] Lightbox: ciemne tło (90% opacity), zdjęcie wyśrodkowane
- [ ] Licznik zdjęć w lightboxie (np. "2 / 5")
- [ ] Przycisk "X" zamyka lightbox
- [ ] Kliknięcie w tło (poza zdjęciem) zamyka lightbox
- [ ] Strzałki Prev/Next w lightboxie działają (tylko gdy > 1 zdjęcie)
- [ ] Nawigacja klawiaturą w lightboxie: `ArrowLeft`, `ArrowRight`, `Escape`
- [ ] Brak zdjęć: komponent EmptyGallery ("Brak zdjęć") wyświetla się zamiast galerii

### Detale ogłoszenia (ListingDetails)

- [ ] Tytuł ogłoszenia wyświetla się jako `<h1>`
- [ ] Cena: poprawne formatowanie PLN (np. "12 500 PLN"), lub "Cena do uzgodnienia" gdy 0
- [ ] Badge stanu z kolorami: zielony (Nowy), niebieski (Używany), pomarańczowy (Na części)
- [ ] Lokalizacja: województwo + miasto (ikona MapPin)
- [ ] Data dodania (ikona Calendar)
- [ ] Przycisk "Kontakt" (zielony, pełna szerokość) — weryfikuj wyświetlanie (akcja telefon jeszcze nie zaimplementowana)
- [ ] Przycisk "Zapisz" (outline z serduszkiem) — weryfikuj wyświetlanie

### Karta sprzedawcy (SellerCard)

- [ ] Karta sprzedawcy widoczna po prawej stronie (Desktop)
- [ ] Avatar sprzedawcy: zdjęcie lub ikona User jako fallback
- [ ] Nazwa sprzedawcy i data rejestracji ("Członek od [miesiąc rok]")
- [ ] Link "Zobacz inne ogłoszenia sprzedającego →" prowadzi do `/ogloszenia?userId=[id]`
- [ ] Anonimowy sprzedający: wyświetla "Anonimowy sprzedający"

### Opis ogłoszenia

- [ ] Sekcja "Opis" widoczna poniżej galerii
- [ ] Długi opis: zachowuje podziały linii (`whitespace-pre-wrap`)

### Podobne ogłoszenia (RelatedListings)

- [ ] Sekcja "Podobne ogłoszenia" widoczna poniżej głównego contentu
- [ ] Karty ogłoszeń w poziomym scrollu (overflow-x-auto)
- [ ] Snap scrolling działa (karty przyciągają)
- [ ] Kliknięcie karty → przejście do tego ogłoszenia
- [ ] Gdy brak podobnych ogłoszeń: sekcja ukryta (nie renderuje się)

### SEO

- [ ] Tytuł strony w przeglądarce: tytuł ogłoszenia (sprawdź DevTools → Elements → `<title>`)
- [ ] Meta description ustawiona (sprawdź DevTools → Elements → `<meta name="description">`)
- [ ] OpenGraph tags: title, description, image (sprawdź DevTools lub narzędzie og:debugger)
- [ ] URL kanoniczny: `/ogloszenia/[id]`

---

## 6. Strona główna — Sekcje

### HeroSection

- [ ] Wyszukiwarka w Hero: wpisanie frazy i kliknięcie "Szukaj" → redirect do `/ogloszenia?q=...`
- [ ] Wyszukiwarka: Enter w polu też uruchamia wyszukiwanie
- [ ] Chipsy kategorii (Ciągniki, Kombajny, etc.) przekierowują do `/ogloszenia?kategoria=[slug]`

### Pozostałe sekcje

- [ ] CategoriesSection: kliknięcie kategorii przekierowuje do listy z filtrem
- [ ] FeaturedListings: wyróżnione ogłoszenia wyświetlają się (dane z bazy)
- [ ] StatsSection: liczby statystyk widoczne
- [ ] CTASection: przyciski działają (Dodaj ogłoszenie, Przeglądaj)

---

## 7. Docker i Infrastruktura

> Testy środowiskowe — wykonaj przed wdrożeniem.

- [ ] `docker compose up -d` — kontenery PostgreSQL i Redis startują bez błędów
- [ ] `docker compose ps` — oba serwisy w stanie "healthy"
- [ ] `curl http://localhost:3000` — aplikacja Next.js odpowiada (HTTP 200)
- [ ] `npx prisma db push` — schema synchronizuje się z bazą bez błędów
- [ ] `npm run db:seed` — dane testowe ładują się, ogłoszenia widoczne na stronie
- [ ] `npm run worker:dev` — worker BullMQ startuje bez błędów (logi w terminalu)
- [ ] Redis: `docker exec -it agroportal-redis-1 redis-cli ping` → odpowiedź `PONG`
- [ ] PostgreSQL: `docker exec -it agroportal-postgres-1 pg_isready -U agroportal` → `accepting connections`
- [ ] Rate limiting (jeśli skonfigurowany): `> 60 req/min` na `/api/v1/*` zwraca HTTP 429

---

## 8. Wydajność (Performance)

> Sprawdź w Chrome DevTools → Lighthouse lub zakładka Performance.

- [ ] Strona główna: LCP (Largest Contentful Paint) < 2.5s
- [ ] `/ogloszenia`: ładowanie z danymi < 3s
- [ ] `/ogloszenia/[id]`: ładowanie < 2s
- [ ] Skeleton loading widoczny — brak "skoku" layoutu (CLS bliski 0)
- [ ] Obrazki: Next.js Image optimization działa (format WebP, lazy loading)
- [ ] Brak memory leaks (DevTools → Performance Monitor: heap nie rośnie nieskończenie)
- [ ] Brak błędów w konsoli (DevTools → Console: 0 errors)
- [ ] Brak ostrzeżeń React w konsoli (DevTools → Console: 0 warnings)

---

## 9. Dostępność (Accessibility)

> Sprawdź klawiaturą (bez myszy) oraz z rozszerzeniem axe DevTools lub Lighthouse Accessibility.

- [ ] Nawigacja klawiaturą (Tab) przez wszystkie interaktywne elementy strony głównej
- [ ] Nawigacja klawiaturą na stronie `/ogloszenia` (filtry, karty, paginacja)
- [ ] Nawigacja klawiaturą na stronie `/ogloszenia/[id]` (galeria, lightbox, przyciski)
- [ ] Focus ring widoczny na wszystkich interaktywnych elementach (`:focus-visible`)
- [ ] Skip-link "Przejdź do treści" pojawia się przy pierwszym Tab (na każdej stronie)
- [ ] Alt text na wszystkich obrazkach ogłoszeń (sprawdź DevTools → Elements)
- [ ] Kontrast tekstu spełnia WCAG AA (4.5:1 dla normalnego tekstu)
- [ ] Nagłówki w poprawnej hierarchii: `h1` → `h2` → `h3` (DevTools lub Accessibility tree)
- [ ] Lightbox: fokus przechodzi do okna lightbox przy otwarciu, wraca przy zamknięciu
- [ ] ARIA labels na ikonach i przyciskach bez widocznego tekstu
- [ ] Komunikaty dynamiczne (`aria-live="polite"`) — licznik wyników aktualizuje się dla screen readera

---

## 10. Cross-Browser

> Przetestuj podstawowy scenariusz: Strona główna → Lista ogłoszeń → Szczegóły ogłoszenia → Logowanie.

- [ ] Chrome (latest) — pełny przebieg
- [ ] Firefox (latest) — pełny przebieg
- [ ] Safari (latest) — jeśli dostępny Mac
- [ ] Edge (latest) — pełny przebieg
- [ ] Mobile Safari (iOS) — wygląd i responsywność
- [ ] Mobile Chrome (Android) — wygląd i responsywność

---

## Znane bugi

| ID | Opis | Priorytet | Status |
|----|------|-----------|--------|
| KAN-? | Wylogowanie może nie usuwać sesji poprawnie — sprawdzić cookies po signOut | HIGH | Otwarty |

> Aktualizuj tę tabelę gdy znajdziesz nowe błędy podczas testów. Zgłaszaj przez Jira (projekt KAN na pzajkowski.atlassian.net).

---

## Zgłaszanie błędów

1. Utwórz nowy Issue w Jira: projekt **KAN** → `pzajkowski.atlassian.net`
2. Typ: **Bug**
3. Tytuł: krótki opis (np. "Wylogowanie nie usuwa cookie sesji")
4. Opis: kroki do reprodukcji, oczekiwane zachowanie, rzeczywiste zachowanie
5. Zrzut ekranu lub nagranie — jeśli dotyczy problemu wizualnego
6. Environment: przeglądarka + wersja, rozdzielczość, OS

---

## Kontakt

W razie pytań dotyczących testów lub procedur QA — zgłoś w projekcie Jira KAN lub skontaktuj się z zespołem deweloperskim.
