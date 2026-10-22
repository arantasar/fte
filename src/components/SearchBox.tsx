interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBox({ value, onChange }: SearchBoxProps) {
  return (
    <div className="relative">
      <label htmlFor="tree-search" className="sr-only">
        Szukaj po nazwie
      </label>
      <input
        id="tree-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && value) {
            e.preventDefault();
            onChange("");
          }
        }}
        placeholder="Szukaj po nazwie…"
        autoComplete="off"
        spellCheck={false}
        className="input w-full"
      />
    </div>
  );
}
