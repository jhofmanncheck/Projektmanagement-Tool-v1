import React from 'react';
import { Task } from '../../types/gantt.types';
import { TaskBar } from './TaskBar';
import { useGantt } from '../../contexts/GanttContext';
import { generateDateRange, getColumnWidth, isSameDay } from '../../utils/dateUtils';

interface TaskRowProps {
  task: Task;
}

export const TaskRow: React.FC<TaskRowProps> = ({ task }) => {
  const { viewSettings } = useGantt();
  const { startDate, endDate, scale, zoom } = viewSettings;

  const dates = generateDateRange(startDate, endDate, scale);
  const columnWidth = getColumnWidth(scale, zoom);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="flex border-b h-12 relative hover:bg-slate-50/50">
      {/* Grid cells */}
      {dates.map((date, index) => {
        const isToday = isSameDay(date, today);
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

        return (
          <div
            key={index}
            className={`border-r flex-shrink-0 ${isWeekend ? 'bg-slate-50' : ''} ${
              isToday ? 'bg-blue-50/30' : ''
            }`}
            style={{ width: `${columnWidth}px` }}
          />
        );
      })}

      {/* Task bar */}
      <TaskBar task={task} />
    </div>
  );
};
