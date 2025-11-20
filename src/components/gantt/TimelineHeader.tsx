import React from 'react';
import { useGantt } from '../../contexts/GanttContext';
import { generateDateRange, formatDate, getColumnWidth, isSameDay } from '../../utils/dateUtils';

export const TimelineHeader: React.FC = () => {
  const { viewSettings } = useGantt();
  const { startDate, endDate, scale, zoom } = viewSettings;

  const dates = generateDateRange(startDate, endDate, scale);
  const columnWidth = getColumnWidth(scale, zoom);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="sticky top-0 z-20 bg-white border-b">
      <div className="flex">
        {dates.map((date, index) => {
          const isToday = isSameDay(date, today);
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;

          return (
            <div
              key={index}
              className={`border-r flex-shrink-0 px-2 py-3 text-center text-sm ${
                isToday ? 'bg-blue-50 border-blue-300' : ''
              } ${isWeekend ? 'bg-slate-50' : ''}`}
              style={{ width: `${columnWidth}px` }}
            >
              <div className={isToday ? 'text-blue-600' : 'text-slate-700'}>
                {formatDate(date, scale)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
