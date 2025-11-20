import React from 'react';
import { Task } from '../../types/gantt.types';
import { TaskBar } from './TaskBar';
import { useGantt } from '../../contexts/GanttContext';
import { generateDateRange, getColumnWidth, isSameDay } from '../../utils/dateUtils';
import { getMilestoneBackgroundColor } from '../../utils/colorUtils';

interface TaskRowProps {
  task: Task;
}

export const TaskRow: React.FC<TaskRowProps> = ({ task }) => {
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

  return (
    <div 
      className="flex border-b h-12 relative hover:bg-slate-50/50" 
      style={{ minWidth: `${totalWidth}px` }}
    >
      {/* Grid cells */}
      {dates.map((date, index) => {
        const isToday = isSameDay(date, today);
        const milestone = getMilestoneForDate(date);

        // Determine background color priority: milestone > today > default
        let bgClass = '';
        if (milestone) {
          bgClass = getMilestoneBackgroundColor(milestone.type);
        } else if (isToday) {
          bgClass = 'bg-blue-50/30';
        }

        return (
          <div
            key={index}
            className={`border-r flex-shrink-0 ${bgClass}`}
            style={{ width: `${columnWidth}px`, minWidth: `${columnWidth}px` }}
          />
        );
      })}

      {/* Task bar */}
      <TaskBar task={task} />
    </div>
  );
};
