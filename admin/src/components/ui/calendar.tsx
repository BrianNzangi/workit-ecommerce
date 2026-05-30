"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/shared/utils/cn"
import { buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        button_previous: "absolute left-1",
        button_next: "absolute right-1",
        month_grid: "w-full border-collapse space-x-1",
        weekdays: "flex",
        weekday:
          "text-muted-foreground rounded-sm w-8 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        day: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-muted rounded-sm",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-sm [&:has(>.day-range-start)]:rounded-l-sm first:[&:has([aria-selected])]:rounded-l-sm last:[&:has([aria-selected])]:rounded-r-sm"
            : "[&:has([aria-selected])]:rounded-sm"
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 font-normal aria-selected:opacity-100"
        ),
        range_start: "day-range-start",
        range_end: "day-range-end",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today: "bg-muted text-foreground",
        outside:
          "text-muted-foreground aria-selected:bg-muted/50 aria-selected:text-muted-foreground",
        disabled: "text-muted-foreground opacity-50",
        range_middle:
          "aria-selected:bg-muted aria-selected:text-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ className, orientation, ...props }) =>
          orientation === "left" ? (
            <ChevronLeft className={cn("size-4", className)} {...props} />
          ) : (
            <ChevronRight className={cn("size-4", className)} {...props} />
          ),
      }}
      {...props}
    />
  )
}

export { Calendar }
