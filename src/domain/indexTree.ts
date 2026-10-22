import { joinPath, ROOT_PATH } from "./paths";
import type { FolderNode, IndexedNode, TreeIndex, TreeNode } from "./types";

/**
 * Spłaszcza drzewo do listy pre-order i mapy ścieżka → węzeł oraz wylicza
 * rozmiary podrzew. Złożoność O(n), bez rekurencji.
 */
export function indexTree(root: FolderNode): TreeIndex {
  const nodes: IndexedNode[] = [];
  const byPath = new Map<string, IndexedNode>();

  const stack: { node: TreeNode; path: string; parentPath: string | null; depth: number }[] = [
    { node: root, path: ROOT_PATH, parentPath: null, depth: 0 },
  ];

  while (stack.length > 0) {
    const { node, path, parentPath, depth } = stack.pop()!;
    const isFolder = node.type === "folder";
    const indexed: IndexedNode = {
      name: node.name,
      nameLower: node.name.toLocaleLowerCase(),
      type: node.type,
      path,
      parentPath,
      depth,
      size: isFolder ? 0 : node.size,
      childPaths: isFolder ? node.children.map((child) => joinPath(path, child.name)) : [],
    };
    nodes.push(indexed);
    byPath.set(path, indexed);

    if (isFolder) {
      for (let i = node.children.length - 1; i >= 0; i--) {
        stack.push({ node: node.children[i], path: indexed.childPaths[i], parentPath: path, depth: depth + 1 });
      }
    }
  }

  // W pre-order dzieci występują po rodzicu, więc przejście od końca
  // dolicza każde podrzewo do rodzica, zanim rodzic zostanie odwiedzony.
  for (let i = nodes.length - 1; i > 0; i--) {
    const node = nodes[i];
    const parent = byPath.get(node.parentPath!)!;
    parent.size += node.size;
  }

  return { rootName: root.name, nodes, byPath };
}
