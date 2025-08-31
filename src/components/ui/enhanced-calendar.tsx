"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { DayPicker, CaptionProps } from "react-day-picker"
import { getYear, setYear, getMonth, setMonth } from "date-fns"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Custom caption component with year and month selection
function CustomCaption({ displayMonth, onMonthChange }: CaptionProps) {
  const currentYear = getYear(displayMonth)
  const currentMonth = getMonth(displayMonth)

  // Generate a range of years (current year - 80 to current year)
  const currentDate = new Date()
  const maxYear = getYear(currentDate)
  const minYear = maxYear - 80
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i)

  // Month names
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  // Handle year change
  const handleYearChange = (year: string) => {
    const newDate = setYear(displayMonth, parseInt(year))
    onMonthChange(newDate)
  }

  // Handle month change
  const handleMonthChange = (month: string) => {
    const newDate = setMonth(displayMonth, parseInt(month))
    onMonthChange(newDate)
  }

  // Jump to previous year
  const handlePrevYear = () => {
    const newDate = setYear(displayMonth, currentYear - 1)
    onMonthChange(newDate)
  }

  // Jump to next year
  const handleNextYear = () => {
    const newDate = setYear(displayMonth, currentYear + 1)
    onMonthChange(newDate)
  }

  return (
    <div className="flex justify-center pt-1 relative items-center w-full">
      <div className="flex items-center gap-1">
        <button
          onClick={handlePrevYear}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          )}
          title="Previous Year"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => onMonthChange(setMonth(displayMonth, currentMonth - 1))}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          )}
          title="Previous Month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 flex justify-center gap-1">
        <Select value={currentMonth.toString()} onValueChange={handleMonthChange}>
          <SelectTrigger className="h-8 w-[110px]">
            <SelectValue>{months[currentMonth]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {months.map((month, index) => (
              <SelectItem key={month} value={index.toString()}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentYear.toString()} onValueChange={handleYearChange}>
          <SelectTrigger className="h-8 w-[90px]">
            <SelectValue>{currentYear}</SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onMonthChange(setMonth(displayMonth, currentMonth + 1))}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          )}
          title="Next Month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          onClick={handleNextYear}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          )}
          title="Next Year"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function EnhancedCalendar({
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
        caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-medium hidden", // Hide the default caption label
        nav: "flex items-center gap-1 hidden", // Hide the default nav
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-x-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_start:
          "day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_range_end:
          "day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Caption: CustomCaption
      }}
      {...props}
    />
  )
}

export { EnhancedCalendar }
