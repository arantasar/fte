import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom";

export function ErrorPage() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : "Nieznany błąd";

  return (
    <main className="mx-auto flex max-w-xl flex-col items-start gap-3 px-4 py-16">
      <h1 className="text-2xl font-semibold">Coś poszło nie tak</h1>
      <p className="font-mono text-sm text-slate-600 dark:text-slate-400">{message}</p>
      <Link to="/" className="btn-primary">
        Strona główna
      </Link>
    </main>
  );
}
