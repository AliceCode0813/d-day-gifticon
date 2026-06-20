export type CalendarDateData = {
  dateString: string;
  day: number;
  month: number;
  year: number;
  timestamp: number;
};

export type MarkedDateEntry = {
  marked?: boolean;
  dotColor?: string;
  selected?: boolean;
  selectedColor?: string;
};

export type MarkedDates = Record<string, MarkedDateEntry>;

export type CalendarDayProps = {
  date?: string | CalendarDateData;
  state?: string;
  marking?: MarkedDateEntry;
  onPress?: (date: CalendarDateData) => void;
};
