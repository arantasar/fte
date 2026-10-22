import type { FolderNode } from "./types";

export type ParseResult = { ok: true; tree: FolderNode } | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Sprawdza, czy wartość ma kształt drzewa. Zwraca opis pierwszego błędu albo null.
 * Ścieżki muszą jednoznacznie wskazywać węzeł, dlatego nazwy w folderze są unikalne
 * i nie mogą zawierać "/" ani być "." / ".." (przeglądarka normalizuje je w URL).
 * Przejście iteracyjne, żeby głębokie drzewo nie przepełniło stosu.
 */
function findError(root: unknown): string | null {
  if (!isRecord(root) || root.type !== "folder") return 'Korzeń drzewa musi być obiektem z polem "type": "folder".';

  const stack: unknown[] = [root];
  while (stack.length > 0) {
    const node = stack.pop();
    if (!isRecord(node)) return "Każdy węzeł musi być obiektem.";

    const name = node.name;
    if (typeof name !== "string" || name.trim() === "") return 'Każdy węzeł musi mieć niepuste pole "name".';
    if (name.includes("/") || name === "." || name === "..") return `Niedozwolona nazwa "${name}".`;

    if (node.type === "file") {
      const size = node.size;
      if (typeof size !== "number" || !Number.isInteger(size) || size < 0) {
        return `Plik "${name}": pole "size" musi być nieujemną liczbą całkowitą.`;
      }
    } else if (node.type === "folder") {
      if (!Array.isArray(node.children)) return `Folder "${name}" musi mieć tablicę "children".`;
      const names = new Set<unknown>();
      for (const child of node.children as unknown[]) {
        if (isRecord(child)) {
          if (names.has(child.name)) return `Folder "${name}" zawiera dwa elementy o nazwie "${String(child.name)}".`;
          names.add(child.name);
        }
        stack.push(child);
      }
    } else {
      return `Węzeł "${name}": pole "type" musi mieć wartość "file" albo "folder".`;
    }
  }
  return null;
}

/** Parsuje tekst JSON i sprawdza, czy ma strukturę drzewa katalogów. */
export function parseTreeJson(text: string): ParseResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: "To nie jest poprawny JSON." };
  }
  const error = findError(data);
  // Po walidacji rzutowanie jest bezpieczne: kształt danych został sprawdzony.
  return error ? { ok: false, error } : { ok: true, tree: data as FolderNode };
}
