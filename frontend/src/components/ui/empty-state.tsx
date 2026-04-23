"use client";

interface EmptyStateProps {
  title: string;
  description: string;
  icon: "chart" | "sensor" | "leaf" | "alert";
  className?: string;
}

function joinClasses(...parts: Array<string | undefined | false>): string {
  return parts.filter(Boolean).join(" ");
}

function EmptyIcon({ icon }: { icon: EmptyStateProps["icon"] }) {
  if (icon === "sensor") {
    return (
      <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v6" />
        <path d="M8 7h8" />
        <path d="M6 14a6 6 0 1 0 12 0c0-2.8-2-5.2-4.8-5.8" />
        <circle cx="12" cy="14" r="1.5" />
      </svg>
    );
  }

  if (icon === "leaf") {
    return (
      <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 21c10.5 0 14-6 14-14C11 7 5 10.5 5 21z" />
        <path d="M5 14c3 0 6-1 9-4" />
      </svg>
    );
  }

  if (icon === "alert") {
    return (
      <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
        <path d="M10.3 3.7L2.7 18a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 15l4-4 3 3 5-6" />
    </svg>
  );
}

export function EmptyState({ title, description, icon, className }: EmptyStateProps) {
  return (
    <div
      className={joinClasses(
        "grid min-h-48 place-items-center rounded-xl border border-dashed border-slate-700/90",
        "bg-slate-950/50 px-5 py-8 text-center",
        className,
      )}
    >
      <div className="mx-auto flex max-w-xs flex-col items-center gap-3">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-sky-500/10 text-sky-300">
          <EmptyIcon icon={icon} />
        </div>
        <h3 className="text-base font-semibold text-slate-100">{title}</h3>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
    </div>
  );
}
