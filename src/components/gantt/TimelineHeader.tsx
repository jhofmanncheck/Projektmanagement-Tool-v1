import React from 'react';
import { useGantt } from '../../contexts/GanttContext';
import { generateDateRange, getColumnWidth, isSameDay } from '../../utils/dateUtils';
import { MilestoneMarker } from './MilestoneMarker';

interface TimelineHeaderProps {
  onEditMilestone: (milestoneId: string) => void;
}

export const TimelineHeader: React.FC<TimelineHeaderProps> = ({ onEditMilestone }) => {
  const { viewSettings, milestones } = useGantt();
  const { startDate, endDate, scale, zoom } = viewSettings;

  const dates = generateDateRange(startDate, endDate, scale);
  const columnWidth = getColumnWidth(scale, zoom);
  const totalWidth = dates.length * columnWidth;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
      {/* Date Header Row */}
      <div className="flex border-b" style={{ minWidth: `${totalWidth}px`, height: '56px' }}>
        {dates.map((date, index) => {
          const isToday = isSameDay(date, today);
          const dateParts = formatDateParts(date, scale);

          const bgClass = isToday ? 'bg-blue-50 border-blue-300' : '';

          return (
            <div
              key={index}
              className={`border-r flex-shrink-0 text-center text-xs flex flex-col items-center justify-center ${bgClass}`}
              style={{ width: `${columnWidth}px`, minWidth: `${columnWidth}px` }}
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

      {/* Milestone Row */}
      <div 
        className="relative bg-slate-50/50" 
        style={{ minWidth: `${totalWidth}px`, height: '32px' }}
      >
        {dates.map((date, index) => {
          const isToday = isSameDay(date, today);
          return (
            <div
              key={index}
              className={`absolute top-0 bottom-0 border-r ${isToday ? 'bg-blue-50/30' : ''}`}
              style={{ 
                left: `${index * columnWidth}px`,
                width: `${columnWidth}px` 
              }}
            />
          );
        })}
        
        {/* Milestone Markers */}
        {milestones.map((milestone) => (
          <MilestoneMarker
            key={milestone.id}
            milestone={milestone}
            onEdit={onEditMilestone}
          />
        ))}
      </div>
    </div>
  );
};
