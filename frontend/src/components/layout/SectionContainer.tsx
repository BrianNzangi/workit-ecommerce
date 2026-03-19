import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionContainerProps {
  children: ReactNode;
  className?: string;
}

export default function SectionContainer({
  children,
  className,
}: SectionContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto max-w-7xl px-4 sm:px-0 md:px-8 lg:px-8 xl:px-10 2xl:px-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
