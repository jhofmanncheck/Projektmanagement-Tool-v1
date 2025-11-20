import React from 'react';
import { useGantt } from '../../contexts/GanttContext';
import { generateDateRange, formatDate, getColumnWidth, isSameDay } from '../../utils/dateUtils';
import { getMilestoneBackgroundColor } from '../../utils/colorUtils';

export const TimelineHeader: React.FC = () => {
  const { viewSettings, milestones } = useGantt();
  const { startDate, endDate, scale, zoom } = viewSettings;

  const dates = generateDateRange(startDate, endDate, scale);
  const columnWidth = getColumnWidth(scale, zoom);
  const totalWidth = dates.length * columnWidth;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Helper function to find milestone for a date
  const getMilestoneForDate = (date: Date) => {
    return milestones.find(m => isSameDay(m.date, date));
  };

  const formatDateParts = (date: Date, scale: string) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    switch (scale) {
      case 'day':
        return { top: days[date.getDay()], bottom: date.getDate().toString() };
      case 'week':
        return { top: `Week ${Math.ceil(date.getDate() / 7)}`, bottom: months[date.getMonth()] };
      case 'month':
        return { top: months[date.getMonth()], bottom: date.getFullYear().toString() };
      default:
        return { top: '', bottom: '' };
    }
  };

  return (
    <div className="sticky top-0 z-20 bg-white border-b">
      <div className="flex" style={{ minWidth: `${totalWidth}px`, height: '56px' }}>
        {dates.map((date, index) => {
          const isToday = isSameDay(date, today);
          const milestone = getMilestoneForDate(date);
          const dateParts = formatDateParts(date, scale);

          // Determine background color priority: milestone > today > default
          let bgClass = '';
          if (milestone) {
            bgClass = getMilestoneBackgroundColor(milestone.type);
          } else if (isToday) {
            bgClass = 'bg-blue-50 border-blue-300';
          }

          return (
            <div
              key={index}
              className={`border-r flex-shrink-0 text-center text-xs flex flex-col items-center justify-center ${bgClass}`}
              style={{ width: `${columnWidth}px`, minWidth: `${columnWidth}px` }}
              title={milestone ? `${milestone.name} (${milestone.type})` : ''}
            >
              <div className={`truncate leading-tight ${isToday ? 'text-blue-600' : 'text-slate-700'}`}>
                {dateParts.top}
              </div>
              <div className={`truncate font-semibold leading-tight ${isToday ? 'text-blue-600' : 'text-slate-900'}`}>
                {dateParts.bottom}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
