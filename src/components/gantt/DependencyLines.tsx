import React from 'react';
import { useGantt } from '../../contexts/GanttContext';
import { dateToPosition, getColumnWidth } from '../../utils/dateUtils';

export const DependencyLines: React.FC = () => {
  const { tasks, viewSettings } = useGantt();
  const { startDate: viewStart, scale, zoom } = viewSettings;
  const rowHeight = 48;
  const columnWidth = getColumnWidth(scale, zoom);

  const lines: Array<{ x1: number; y1: number; x2: number; y2: number; taskId: string }> = [];

  tasks.forEach((task, taskIndex) => {
    task.dependencies.forEach((depId) => {
      const dependentTask = tasks.find((t) => t.id === depId);
      if (dependentTask) {
        const depIndex = tasks.indexOf(dependentTask);

        // End point of dependent task (right side)
        const x1 = dateToPosition(dependentTask.endDate, viewStart, scale, zoom) + columnWidth;
        const y1 = depIndex * rowHeight + rowHeight / 2;

        // Start point of current task (left side)
        const x2 = dateToPosition(task.startDate, viewStart, scale, zoom);
        const y2 = taskIndex * rowHeight + rowHeight / 2;

        lines.push({ x1, y1, x2, y2, taskId: task.id });
      }
    });
  });

  if (lines.length === 0) return null;

  const maxX = Math.max(...lines.flatMap((l) => [l.x1, l.x2]));
  const maxY = Math.max(...lines.map((l) => Math.max(l.y1, l.y2)));

  return (
    <svg
      className="absolute top-0 left-0 pointer-events-none z-5"
      style={{ width: `${maxX + 100}px`, height: `${maxY + 100}px` }}
    >
      {lines.map((line, index) => {
        // Create a path with right angle turns
        const midX = (line.x1 + line.x2) / 2;
        const path = `M ${line.x1} ${line.y1} L ${midX} ${line.y1} L ${midX} ${line.y2} L ${line.x2} ${line.y2}`;

        return (
          <g key={`${line.taskId}-${index}`}>
            <path
              d={path}
              stroke="#94a3b8"
              strokeWidth="2"
              fill="none"
              strokeDasharray="4 4"
            />
            {/* Arrow head */}
            <polygon
              points={`${line.x2},${line.y2} ${line.x2 - 6},${line.y2 - 4} ${line.x2 - 6},${line.y2 + 4}`}
              fill="#94a3b8"
            />
          </g>
        );
      })}
    </svg>
  );
};
