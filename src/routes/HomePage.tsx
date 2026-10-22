import { useId, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import sampleJson from "../domain/sample.json?raw";
import { useTree } from "../state/useTree";

export function HomePage() {
  const { index, load } = useTree();
  const navigate = useNavigate();
  const location = useLocation();
  const notice = (location.state as { notice?: string } | null)?.notice;
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const textareaId = useId();
  const errorId = useId();

  const submit = (json: string) => {
    const result = load(json);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    navigate("/tree");
  };

  const readFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const content = await file.text();
      setText(content);
      submit(content);
    } catch {
      setError(`Nie udało się odczytać pliku „${file.name}”.`);
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    void readFile(e.target.files?.[0]);
    // Pozwala wgrać ten sam plik ponownie po poprawce.
    e.target.value = "";
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit(text);
  };

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Wczytaj strukturę katalogów</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Wklej JSON albo wgraj plik <code className="code">.json</code> z drzewem folderów i plików.
        </p>
      </div>

      {notice && (
        <p role="status" className="callout">
          {notice}
        </p>
      )}

      {index && (
        <div className="callout flex flex-wrap items-center justify-between gap-3">
          <span>
            Wczytane drzewo: <strong>{index.rootName}</strong> ({index.nodes.length.toLocaleString("pl-PL")} węzłów).
          </span>
          <Link to="/tree" className="btn-primary">
            Przejdź do drzewa
          </Link>
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <div>
          <label htmlFor={textareaId} className="mb-1.5 block text-sm font-medium">
            JSON
          </label>
          <textarea
            id={textareaId}
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-invalid={error !== null}
            aria-describedby={error !== null ? errorId : undefined}
            rows={16}
            spellCheck={false}
            placeholder={'{\n  "name": "root",\n  "type": "folder",\n  "children": [ … ]\n}'}
            className="input w-full resize-y font-mono text-sm"
          />
        </div>

        {error !== null && (
          <p id={errorId} role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
            Nie udało się wczytać drzewa: {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <button type="submit" className="btn-primary">
            Wczytaj
          </button>
          <label className="btn-secondary cursor-pointer focus-within:ring-2 focus-within:ring-sky-500">
            Wgraj plik…
            <input type="file" accept=".json,application/json" onChange={onFileChange} className="sr-only" />
          </label>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              setText(sampleJson);
              setError(null);
            }}
          >
            Wstaw przykład
          </button>
        </div>
      </form>
    </main>
  );
}
