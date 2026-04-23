"use client";

import { type ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface ChartCardProps {
  title: string;
  subtitle: string;
  action: ReactNode;
  children: ReactNode;
}

export function ChartCard({ title, subtitle, action, children }: ChartCardProps) {
  return (
    <Card title={title} subtitle={subtitle} action={action}>
      <div className="h-[340px] w-full md:h-[380px]">{children}</div>
    </Card>
  );
}
