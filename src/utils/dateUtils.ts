import { ViewScale } from '../types/gantt.types';

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addWeeks = (date: Date, weeks: number): Date => {
  return addDays(date, weeks * 7);
};

export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

export const differenceInDays = (date1: Date, date2: Date): number => {
  const msPerDay = 1000 * 60 * 60 * 24;
  const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return Math.floor((utc1 - utc2) / msPerDay);
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const startOfWeek = (date: Date): Date => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const startOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

export const formatDate = (date: Date, scale: ViewScale): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  switch (scale) {
    case 'day':
      return `${days[date.getDay()]} ${date.getDate()}`;
    case 'week':
      return `W${getWeekNumber(date)} ${months[date.getMonth()]}`;
    case 'month':
      return `${months[date.getMonth()]} ${date.getFullYear()}`;
  }
};

export const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

export const generateDateRange = (
  startDate: Date,
  endDate: Date,
  scale: ViewScale
): Date[] => {
  const dates: Date[] = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    
    switch (scale) {
      case 'day':
        currentDate = addDays(currentDate, 1);
        break;
      case 'week':
        currentDate = addWeeks(currentDate, 1);
        break;
      case 'month':
        currentDate = addMonths(currentDate, 1);
        break;
    }
  }

  return dates;
};

export const getColumnWidth = (scale: ViewScale, zoom: number): number => {
  const baseWidths = {
    day: 40,
    week: 80,
    month: 120
  };
  return baseWidths[scale] * zoom;
};

export const dateToPosition = (
  date: Date,
  startDate: Date,
  scale: ViewScale,
  zoom: number
): number => {
  const days = differenceInDays(date, startDate);
  const columnWidth = getColumnWidth(scale, zoom);
  
  switch (scale) {
    case 'day':
      return days * columnWidth;
    case 'week':
      return Math.floor(days / 7) * columnWidth;
    case 'month':
      const monthsDiff = (date.getFullYear() - startDate.getFullYear()) * 12 + 
                        (date.getMonth() - startDate.getMonth());
      return monthsDiff * columnWidth;
  }
};

export const positionToDate = (
  position: number,
  startDate: Date,
  scale: ViewScale,
  zoom: number
): Date => {
  const columnWidth = getColumnWidth(scale, zoom);
  const units = Math.round(position / columnWidth);
  
  switch (scale) {
    case 'day':
      return addDays(startDate, units);
    case 'week':
      return addWeeks(startDate, units);
    case 'month':
      return addMonths(startDate, units);
  }
};
