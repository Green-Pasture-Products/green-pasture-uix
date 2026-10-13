export interface DatePickerProps {
  value?: Date | string | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  includeTime?: boolean;
  required?: boolean;
  id?: string;
  "aria-label"?: string;
}

export interface TimePickerProps {
  selectedDate: Date | null;
  selectedHours: number;
  setSelectedHours: (h: number) => void;
  selectedMinutes: number;
  setSelectedMinutes: (m: number) => void;
  onChange?: (date: Date | null) => void;
}

export interface CalendarHeaderProps {
  year: number;
  month: number;
  prevMonth: () => void;
  nextMonth: () => void;
}

export interface CalendarGridProps {
  year: number;
  month: number;
  selectedDate: Date | null;
  /** Days before this local day are disabled. */
  minDate?: Date;
  handleSelectDay: (day: number, isCurrentMonth: boolean) => void;
}
