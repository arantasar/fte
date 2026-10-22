/** Węzeł w formacie wejściowym (po walidacji). */
export interface FileNode {
  name: string;
  type: "file";
  /** Rozmiar w bajtach. */
  size: number;
}

export interface FolderNode {
  name: string;
  type: "folder";
  children: TreeNode[];
}

export type TreeNode = FileNode | FolderNode;

/**
 * Spłaszczony węzeł z wyliczonymi danymi pochodnymi.
 * `path` jest liczona względem roota (root ma ścieżkę ""), np. "src/components/Button.tsx".
 */
export interface IndexedNode {
  name: string;
  /** Nazwa zapisana małymi literami, używana w wyszukiwaniu. */
  nameLower: string;
  type: "file" | "folder";
  path: string;
  parentPath: string | null;
  depth: number;
  /** Plik: jego rozmiar. Folder: suma rozmiarów wszystkich plików w podrzewie. */
  size: number;
  /** Ścieżki bezpośrednich dzieci w kolejności z pliku wejściowego (dla pliku: pusta tablica). */
  childPaths: string[];
}

export interface TreeIndex {
  rootName: string;
  /** Wszystkie węzły w kolejności pre-order (root jest pierwszy). */
  nodes: IndexedNode[];
  byPath: ReadonlyMap<string, IndexedNode>;
}
