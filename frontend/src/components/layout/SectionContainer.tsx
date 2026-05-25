import type { ReactNode } from "react";
import { cn } from "@/lib/utils/utils";

interface SectionContainerProps {
  children: ReactNode;
  className?: string;
  fluid?: boolean;
}

export default function SectionContainer({
  children,
  className,
  fluid = false,
}: SectionContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto",
        fluid ? "w-full max-w-none" : "container",
        className,
      )}
    >
      {children}
    </div>
  );
}
