/**
 * Bezpieczne opakowania na Web Storage. Dostęp może rzucić wyjątek
 * (tryb prywatny, zablokowane dane strony, przekroczony limit), więc każdy odczyt i zapis jest w try/catch.
 */

const TREE_KEY = "fte:tree-json";
const EXPANDED_KEY = "fte:expanded";

function read(storage: () => Storage, key: string): string | null {
  try {
    return storage().getItem(key);
  } catch {
    return null;
  }
}

function write(storage: () => Storage, key: string, value: string): void {
  try {
    storage().setItem(key, value);
  } catch {
    // Przekroczony limit albo brak dostępu - aplikacja działa dalej, tylko bez zapisu.
  }
}

function remove(storage: () => Storage, key: string): void {
  try {
    storage().removeItem(key);
  } catch {
    // brak dostępu do storage - nie ma czego czyścić
  }
}

const local = () => window.localStorage;
const session = () => window.sessionStorage;

/**
 * Zapisywany jest oryginalny tekst JSON, a nie wynik JSON.stringify:
 * stringify jest rekurencyjny i mógłby przepełnić stos przy bardzo głębokim drzewie.
 */
export const treeStorage = {
  read: () => read(local, TREE_KEY),
  write: (json: string) => write(local, TREE_KEY, json),
  clear: () => remove(local, TREE_KEY),
};

/** Stan rozwinięcia folderów - per karta przeglądarki (sessionStorage). */
export const expandedStorage = {
  read: (): string[] => {
    const raw = read(session, EXPANDED_KEY);
    if (!raw) return [];
    try {
      const value: unknown = JSON.parse(raw);
      return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
    } catch {
      return [];
    }
  },
  write: (paths: Iterable<string>) => {
    write(session, EXPANDED_KEY, JSON.stringify([...paths]));
  },
  clear: () => remove(session, EXPANDED_KEY),
};
