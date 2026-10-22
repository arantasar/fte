import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <main className="mx-auto flex max-w-xl flex-col items-start gap-3 px-4 py-16">
      <h1 className="text-2xl font-semibold">404 — nie ma takiej strony</h1>
      <Link to="/" className="btn-primary">
        Strona główna
      </Link>
    </main>
  );
}

