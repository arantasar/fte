# FileTree Explorer

Aplikacja do wizualizacji struktury katalogów zapisanej w JSON. Wklejasz albo wgrywasz plik, a potem przeglądasz drzewo, otwierasz szczegóły plików i folderów oraz wyszukujesz węzły po nazwie.

```bash
npm install && npm run dev
```

| Skrypt              | Opis                                      |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | serwer deweloperski Vite                  |
| `npm test`          | testy (Vitest + Testing Library, jsdom)   |
| `npm run typecheck` | `tsc -b` w trybie strict                  |
| `npm run lint`      | oxlint                                    |
| `npm run build`     | typecheck + build produkcyjny             |

Stack: React 19, TypeScript (strict), React Router 6 (`createBrowserRouter`), Vite, Tailwind CSS 4.

## Format wejściowy

```json
{
  "name": "root",
  "type": "folder",
  "children": [
    { "name": "src", "type": "folder", "children": [{ "name": "index.ts", "type": "file", "size": 1024 }] },
    { "name": "package.json", "type": "file", "size": 300 }
  ]
}
```

Przycisk „Wstaw przykład” na stronie głównej wstawia gotowe drzewo ([src/domain/sample.json](src/domain/sample.json)).

## Widoki

| Ścieżka           | Opis                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------- |
| `/`               | wklejenie JSON, wgranie pliku, komunikat błędu walidacji                                                     |
| `/tree`           | drzewo z rozwijaniem i zwijaniem folderów oraz szczegóły folderu głównego                                     |
| `/tree/:nodePath` | szczegóły węzła; `nodePath` to ścieżka względem roota zakodowana jako jeden segment: `src%2Fcomponents%2FButton.tsx` |
| `?q=…`            | fraza wyszukiwania (działa na każdej ścieżce `/tree…`)                                                         |

Szczegóły pliku pokazują nazwę, rozmiar (B / KB / MB, podstawa 1024) i pełną ścieżkę od roota. Szczegóły folderu pokazują nazwę, ścieżkę, liczbę bezpośrednich dzieci, całkowity rozmiar podrzewa i listę dzieci z linkami.

## Decyzje architektoniczne

### Struktura

```
src/
  domain/      czysta logika bez Reacta: typy, walidacja, indeks, wyszukiwanie, formatowanie, ścieżki (+ testy)
  state/       TreeProvider (kontekst), useExpanded, bezpieczne opakowania na Web Storage
  components/  TreeView, SearchBox, SearchResults, Breadcrumbs, NodeLink…
  routes/      definicje tras i widoki
```

Logika domenowa jest oddzielona od UI. To czyste funkcje, łatwe do testowania i niezależne od frameworka.

### Walidacja wejścia zamiast rzutowania typów

`JSON.parse` sprawdza tylko składnię, a zwraca `any`. Rzutowanie `as FolderNode` oszukałoby kompilator, a błędne dane wywróciłyby aplikację dalej, np. `size: "1024"` skleiłby napisy przy sumowaniu rozmiarów, a folder bez `children` rzuciłby wyjątek przy każdym starcie. Dlatego wynik jest traktowany jako `unknown` i sprawdzany przez prosty walidator ([parse.ts](src/domain/parse.ts)), który zwraca pierwszy znaleziony błąd. Dopiero po walidacji dane są typowane jako `FolderNode`. Odrzucane są:

- korzeń, który nie jest folderem,
- zły `type`,
- `size`, który nie jest nieujemną liczbą całkowitą,
- folder bez tablicy `children`,
- puste nazwy, nazwy z `/` oraz nazwy `.` i `..`,
- **zduplikowane nazwy wśród rodzeństwa**, bo ścieżka musi jednoznacznie identyfikować węzeł.

Zrezygnowałem z biblioteki typu Zod. Schemat jest mały, a unikalność nazw i tak wymagałaby własnej reguły.

### Indeks budowany raz

Po wczytaniu drzewo jest spłaszczane ([indexTree.ts](src/domain/indexTree.ts)) do listy węzłów w kolejności pre-order oraz mapy `ścieżka → węzeł`. Każdy węzeł ma od razu policzony rozmiar podrzewa, głębokość i ścieżki dzieci. Dzięki temu:

- widok szczegółów to odczyt z `Map` w O(1), bez przeszukiwania drzewa przy każdym renderze,
- rozmiary folderów są liczone raz, w jednym przejściu od końca listy pre-order (bez rekurencji),
- wyszukiwanie to `filter` po płaskiej liście z nazwami zapisanymi wcześniej małymi literami.

**Żaden algorytm nie jest rekurencyjny.** Walidator, indeks i lista widocznych wierszy używają jawnego stosu, więc „dowolnie głębokie” drzewo nie przepełni stosu wywołań. Testy sprawdzają zagnieżdżenie 50 000 poziomów.

### Ścieżki w URL

Ścieżka węzła jest liczona względem roota (`src/components/Button.tsx`), a w URL kodowana przez `encodeURIComponent` jako jeden segment, zgodnie z trasą `/tree/:nodePath`. React Router 6 (od 6.22.1) sam dekoduje parametry, więc aplikacja **nie dekoduje ich drugi raz**. Inaczej nazwa zawierająca `%` zostałaby uszkodzona.

Root nie ma własnej ścieżki: jego szczegóły są pod `/tree`. Jego nazwa jest pokazywana jako początek „pełnej ścieżki” (`root/src/index.ts`), ale nie jest częścią `nodePath`, tak jak w przykładzie z treści zadania.

### Odporność na odświeżenie

- **Fraza wyszukiwania jest w URL (`?q=`)**, a URL jest jedynym źródłem prawdy (`useSearchParams`, z `replace`, żeby nie zaśmiecać historii). Wyniki przetrwają odświeżenie i można je wysłać linkiem. `NodeLink` przenosi `?q=` przy nawigacji, więc otwarcie wyniku nie zamyka listy wyników.
- **Samo drzewo jest w `localStorage`.** Bez tego odświeżenie `/tree?q=…` nie miałoby czego przeszukać. Zapisywany jest oryginalny tekst JSON, a nie wynik `JSON.stringify`, bo `stringify` jest rekurencyjny. Przy starcie tekst jest walidowany ponownie, a uszkodzone dane są usuwane.
- **Stan rozwinięcia folderów jest w `sessionStorage`**, czyli per karta. Przy wczytaniu nowego drzewa jest resetowany.
- Każdy dostęp do Web Storage jest w `try/catch` (tryb prywatny, przekroczony limit). Gdy zapis się nie uda, aplikacja działa dalej, tylko drzewo nie przetrwa odświeżenia.

### Stan aplikacji

Wystarcza kontekst Reacta ([TreeProvider](src/state/TreeProvider.tsx)): jedno źródło danych, które zmienia się rzadko (wczytanie lub wyczyszczenie). Zewnętrzny store (Redux, Zustand) byłby tu nadmiarowy. Stan lokalny UI (rozwinięte foldery) jest w hooku `useExpanded` w layoucie `/tree`. Bez wczytanego drzewa trasy `/tree*` przekierowują na `/`.

### Widok drzewa

Drzewo jest renderowane jako **płaska lista widocznych wierszy** ([visibleRows.ts](src/domain/visibleRows.ts)), a nie rekurencyjne komponenty. Takie rozwiązanie:

- używa tego samego iteracyjnego przejścia co indeks, więc nie zależy od głębokości drzewa,
- pozwoli później łatwo dodać wirtualizację albo nawigację klawiaturą.

Każdy wiersz to przycisk ze strzałką (`aria-expanded`), który tylko przełącza folder, oraz link z nazwą, który otwiera szczegóły (`aria-current` dla wybranego węzła). Wybrany węzeł (także po odświeżeniu lub wejściu z linku) jest automatycznie odsłaniany i przewijany do widoku.

### Testy

Testy pokrywają dwie warstwy:

- **Domena** (jednostkowe): walidacja i przypadki brzegowe, indeks i rozmiary, wyszukiwanie, formatowanie, ścieżki.
- **Aplikacja** (integracyjne, `createMemoryRouter` z tymi samymi trasami co w produkcji):
  - przekierowania,
  - wczytanie JSON,
  - szczegóły pliku i folderu z zakodowanego URL,
  - rozwijanie i zwijanie folderów,
  - zachowanie `?q=` po „odświeżeniu” (ponownym zamontowaniu z danymi w storage).

## Co zrobiłbym, mając więcej czasu

- **Wirtualizacja listy** (np. `@tanstack/react-virtual`). Płaska lista wierszy jest na to gotowa. Obecnie renderowane są wszystkie widoczne wiersze, co przy bardzo dużych, rozwiniętych folderach będzie wolne.
- **Nawigacja klawiaturą w drzewie** według wzorca [ARIA Tree View](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/) (strzałki, Home/End) oraz „rozwiń/zwiń wszystko”.
- **Parsowanie i indeksowanie w Web Workerze**, żeby wczytanie wielomegabajtowego pliku nie blokowało UI. Plik 6,4 MB (~137 tys. węzłów) wczytuje się obecnie w około sekundę.
- **IndexedDB zamiast `localStorage`**, bez limitu około 5 MB. Opcjonalnie synchronizacja między kartami (zdarzenie `storage`).
- Testy E2E (Playwright) na prawdziwej przeglądarce, w tym odświeżanie i historia.
- Rozszerzone wyszukiwanie: fuzzy lub glob (`*.tsx`), filtrowanie po typie i rozmiarze, wyszukiwanie po całej ścieżce, podświetlanie dopasowania.
- Sortowanie dzieci (nazwa, rozmiar, najpierw foldery). Teraz zachowana jest kolejność z pliku.
- Dokładniejsza walidacja: wszystkie błędy naraz, ze ścieżką do miejsca problemu i numerem linii w tekście JSON.
- Wygoda: przeciąganie pliku na stronę, kopiowanie ścieżki, komunikat, gdy drzewo jest za duże, by je zapisać.
- Migracja na React Router 7 (patrz ograniczenia).

## Znane ograniczenia

- **Limit `localStorage` (~5 MB).** Większe pliki działają, ale nie przetrwają odświeżenia, a aplikacja o tym nie informuje.
- **Wczytywanie i wyszukiwanie działają w głównym wątku.** Przy bardzo dużych plikach UI na chwilę zamiera.
- **Wyszukiwanie pokazuje maksymalnie 200 wyników**, z komunikatem o łącznej liczbie. Dopasowanie to prosty podciąg nazwy bez rozróżniania wielkości liter. Nie przeszukuje ścieżek, a root jest pomijany.
- **Odrzucane są dane, których nie da się jednoznacznie zaadresować**: duplikaty nazw w folderze oraz nazwy z `/`, `.`, `..`. Korzeń musi być folderem.
- **Zapamiętywanie stanu jest ograniczone.** Stan rozwinięcia folderów jest per karta (`sessionStorage`), a jedna aplikacja trzyma jedno drzewo naraz. Wczytanie nowego zastępuje poprzednie we wszystkich kartach dopiero po ich odświeżeniu.
- **Ścieżka w URL musi być zakodowana** (`/tree/src%2Findex.ts`). Ręcznie wpisany adres z ukośnikami (`/tree/src/index.ts`) pokazuje stronę 404.
- **Hosting produkcyjny** wymaga przekierowania wszystkich ścieżek na `index.html` (SPA fallback). `npm run dev` i `vite preview` robią to same.
- **Podatności w React Router 6.** `npm audit` zgłasza je w `react-router` 6.x (GHSA-wrjc-x8rr-h8h6, GHSA-337j-9hxr-rhxg), a poprawki są dopiero w v7. Zadanie wymaga v6, a podatności nie dotyczą tej aplikacji w praktyce: nie ma SSR, a nazwy z danych trafiają do linków wyłącznie zakodowane przez `encodeURIComponent`, więc ukośnik ani backslash nie zmienią celu linku.
