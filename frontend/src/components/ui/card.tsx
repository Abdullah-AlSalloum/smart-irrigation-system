"use client";

import { type ReactNode } from "react";

interface CardProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

function joinClasses(...parts: Array<string | undefined | false>): string {
  return parts.filter(Boolean).join(" ");
}

export function Card({ title, subtitle, action, children, className }: CardProps) {
  return (
    <section
      className={joinClasses(
        "group rounded-2xl border border-white/10 bg-slate-900/70 p-5 md:p-6",
        "shadow-[0_14px_40px_rgba(2,6,23,0.42)] backdrop-blur-md",
        "transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-400/35 hover:shadow-[0_22px_48px_rgba(14,165,233,0.16)]",
        className,
      )}
    >
      <header className="mb-5 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-slate-100 md:text-2xl">{title}</h2>
          {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}
