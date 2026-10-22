import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useTree } from "../state/useTree";

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-2.5 py-1.5 ${isActive ? "bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100" : "hover:text-slate-900 dark:hover:text-slate-100"}`;

export function AppShell() {
  const { index, clear } = useTree();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link to="/" className="font-semibold tracking-tight">
            FileTree Explorer
          </Link>
          <nav aria-label="Główna" className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
            <NavLink to="/" end className={navClass}>
              Wczytaj JSON
            </NavLink>
            {index && (
              <NavLink to="/tree" className={navClass}>
                Drzewo
              </NavLink>
            )}
          </nav>
          {index && (
            <button
              type="button"
              className="btn-ghost ml-auto text-sm"
              onClick={() => {
                clear();
                navigate("/");
              }}
            >
              Wyczyść dane
            </button>
          )}
        </div>
      </header>
      <Outlet />
    </div>
  );
}
