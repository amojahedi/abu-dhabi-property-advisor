export const DISCLAIMER =
  "Synthetic data. Unaffiliated portfolio project — not affiliated with or endorsed by Aldar Properties. Figures are illustrative and not investment advice.";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-bg-elev">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <p className="text-xs leading-relaxed text-fg-muted">
          <span className="font-semibold text-fg">Disclaimer:</span>{" "}
          {DISCLAIMER}
        </p>
        <p className="mt-2 text-xs text-fg-muted">
          A personal portfolio project · Abu Dhabi destinations used purely as
          inspiration · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
