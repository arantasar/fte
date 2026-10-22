/** Ścieżka roota (względem samego siebie). */
export const ROOT_PATH = "";

export function joinPath(parentPath: string, name: string): string {
  return parentPath === ROOT_PATH ? name : `${parentPath}/${name}`;
}

/** Ścieżki wszystkich przodków (od roota), bez samego węzła. */
export function ancestorPaths(path: string): string[] {
  if (path === ROOT_PATH) return [];
  const parts = path.split("/");
  const result: string[] = [ROOT_PATH];
  for (let i = 1; i < parts.length; i++) result.push(parts.slice(0, i).join("/"));
  return result;
}

/** Pełna ścieżka do wyświetlenia, łącznie z nazwą roota, np. "root/src/index.ts". */
export function displayPath(rootName: string, path: string): string {
  return path === ROOT_PATH ? rootName : `${rootName}/${path}`;
}

/**
 * URL widoku szczegółów. Cała ścieżka jest jednym, zakodowanym segmentem
 * (`/` → `%2F`), zgodnie z trasą `/tree/:nodePath`. React Router dekoduje parametr sam.
 */
export function nodeUrl(path: string): string {
  return path === ROOT_PATH ? "/tree" : `/tree/${encodeURIComponent(path)}`;
}
