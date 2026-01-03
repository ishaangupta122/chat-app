"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  children: ReactNode;
  className?: string;
}

export function Sidebar({ children, className }: SidebarProps) {
  return (
    <aside
      className={cn("flex h-full w-full flex-col bg-card md:w-95", className)}>
      {children}
    </aside>
  );
}
