"use client";

interface StatCardProps {
  label: string;
  value: string;
  tone: "green" | "blue" | "amber";
  helper: string;
}

const toneMap = {
  green: {
    value: "text-emerald-300",
    dot: "bg-emerald-400",
    panel: "from-emerald-500/10 to-transparent",
  },
  blue: {
    value: "text-sky-300",
    dot: "bg-sky-400",
    panel: "from-sky-500/10 to-transparent",
  },
  amber: {
    value: "text-amber-300",
    dot: "bg-amber-400",
    panel: "from-amber-500/10 to-transparent",
  },
};

export function StatCard({ label, value, tone, helper }: StatCardProps) {
  const style = toneMap[tone];

  return (
    <article
      className={[
        "relative overflow-hidden rounded-xl border border-white/10 bg-slate-950/70 p-4",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
        "transition-all duration-200 hover:border-sky-300/40 hover:-translate-y-0.5",
      ].join(" ")}
    >
      <div className={[
        "pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b",
        style.panel,
      ].join(" ")} />

      <div className="relative">
        <p className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className={["text-3xl font-extrabold tracking-tight md:text-4xl", style.value].join(" ")}>{value}</p>
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-300">
          <span className={["h-2 w-2 rounded-full", style.dot].join(" ")} />
          {helper}
        </div>
      </div>
    </article>
  );
}
