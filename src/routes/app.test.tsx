import { fireEvent, render, screen, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { describe, expect, it } from "vitest";
import sampleJson from "../domain/sample.json?raw";
import { TreeProvider } from "../state/TreeProvider";
import { routes } from "./routes";

/** Renderuje aplikację pod danym URL. Ponowne wywołanie symuluje odświeżenie strony. */
function renderApp(url: string, { withTree = true } = {}) {
  if (withTree) localStorage.setItem("fte:tree-json", sampleJson);
  const router = createMemoryRouter(routes, { initialEntries: [url] });
  const view = render(
    <TreeProvider>
      <RouterProvider router={router} />
    </TreeProvider>,
  );
  return { router, ...view };
}

const details = () => screen.getByRole("article");

describe("routing", () => {
  it("redirects /tree to the home page when no tree is loaded", async () => {
    const { router } = renderApp("/tree", { withTree: false });
    expect(await screen.findByText(/Najpierw wczytaj plik JSON/)).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/");
  });

  it("loads pasted JSON and opens the tree", () => {
    const { router } = renderApp("/", { withTree: false });
    fireEvent.click(screen.getByRole("button", { name: "Wstaw przykład" }));
    fireEvent.click(screen.getByRole("button", { name: "Wczytaj" }));
    expect(router.state.location.pathname).toBe("/tree");
    expect(within(details()).getByRole("heading", { name: "root" })).toBeInTheDocument();
    expect(localStorage.getItem("fte:tree-json")).toBe(sampleJson);
  });

  it("shows validation errors for invalid input", () => {
    renderApp("/", { withTree: false });
    // Poprawny JSON, ale nie drzewo.
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "[1]" } });
    fireEvent.click(screen.getByRole("button", { name: "Wczytaj" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Korzeń drzewa musi być obiektem");
  });

  it("shows file details for an encoded node path", () => {
    renderApp("/tree/src%2Fcomponents%2FButton.tsx");
    const article = details();
    expect(within(article).getByRole("heading", { name: "Button.tsx" })).toBeInTheDocument();
    expect(article).toHaveTextContent("root/src/components/Button.tsx");
    expect(article).toHaveTextContent("512 B");
  });

  it("shows folder details with direct children count, subtree size and child links", () => {
    const { router } = renderApp("/tree/src");
    const article = details();
    expect(article).toHaveTextContent(/Bezpośrednie dzieci\s*3/);
    // 1024 + 512 + 2048 + 4380 + 870 = 8834 B
    expect(article).toHaveTextContent(/Całkowity rozmiar\s*8.6 KB/);
    fireEvent.click(within(article).getByRole("link", { name: /components/ }));
    expect(router.state.location.pathname).toBe("/tree/src%2Fcomponents");
    expect(within(details()).getByRole("heading", { name: "components" })).toBeInTheDocument();
  });


  it("reports unknown node paths", () => {
    renderApp("/tree/nope.txt");
    expect(screen.getByRole("heading", { name: "Nie znaleziono węzła" })).toBeInTheDocument();
  });
});

describe("tree view", () => {
  const tree = () => screen.getByRole("list", { name: /Drzewo plików/ });

  it("expands and collapses folders without navigating", () => {
    const { router } = renderApp("/tree");
    const toggle = within(tree()).getByRole("button", { name: "Rozwiń src" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(within(tree()).queryByRole("link", { name: /index\.ts/ })).not.toBeInTheDocument();

    fireEvent.click(toggle);
    expect(within(tree()).getByRole("button", { name: "Zwiń src" })).toHaveAttribute("aria-expanded", "true");
    expect(within(tree()).getByRole("link", { name: /index\.ts/ })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/tree");
    expect(JSON.parse(sessionStorage.getItem("fte:expanded")!)).toEqual(["src"]);

    fireEvent.click(within(tree()).getByRole("button", { name: "Zwiń src" }));
    expect(within(tree()).queryByRole("link", { name: /index\.ts/ })).not.toBeInTheDocument();
  });

  it("reveals the selected node after a reload", () => {
    renderApp("/tree/src%2Fcomponents%2FButton.tsx");
    expect(within(tree()).getByRole("link", { name: /Button\.tsx/ })).toHaveAttribute("aria-current", "page");
  });
});

describe("search", () => {
  it("stores the query in the URL and shows full paths of results", () => {
    const { router } = renderApp("/tree");
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "button" } });
    expect(router.state.location.search).toBe("?q=button");
    const results = screen.getByRole("region", { name: "Wyniki wyszukiwania" });
    expect(within(results).getAllByRole("link").map((a) => a.textContent)).toEqual([
      "Button.tsxroot/src/components/Button.tsx",
      "Button.test.tsxroot/src/components/Button.test.tsx",
    ]);
  });

  it("restores results after a reload and keeps the query when opening a result", () => {
    const { router } = renderApp("/tree?q=TSX");
    expect(screen.getByRole("searchbox")).toHaveValue("TSX");
    const results = screen.getByRole("region", { name: "Wyniki wyszukiwania" });
    expect(within(results).getByRole("status")).toHaveTextContent("Wyniki: 3");

    fireEvent.click(within(results).getByRole("link", { name: /Modal\.tsx/ }));
    expect(router.state.location.pathname).toBe("/tree/src%2Fcomponents%2FModal.tsx");
    expect(router.state.location.search).toBe("?q=TSX");
    expect(within(details()).getByRole("heading", { name: "Modal.tsx" })).toBeInTheDocument();
  });

  it("clears the query with Escape", () => {
    const { router } = renderApp("/tree?q=src");
    fireEvent.keyDown(screen.getByRole("searchbox"), { key: "Escape" });
    expect(router.state.location.search).toBe("");
    expect(screen.getByRole("list", { name: /Drzewo plików/ })).toBeInTheDocument();
  });
});
