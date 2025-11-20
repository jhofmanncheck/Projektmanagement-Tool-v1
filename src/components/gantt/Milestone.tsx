import React from 'react';
import { Milestone as MilestoneType } from '../../types/gantt.types';
import { useGantt } from '../../contexts/GanttContext';
import { dateToPosition } from '../../utils/dateUtils';
import { getMilestoneColor } from '../../utils/colorUtils';
import { Flag } from 'lucide-react';

interface MilestoneProps {
  milestone: MilestoneType;
}

export const Milestone: React.FC<MilestoneProps> = ({ milestone }) => {
  const { viewSettings, tasks } = useGantt();
  const { startDate: viewStart, scale, zoom } = viewSettings;

  const position = dateToPosition(milestone.date, viewStart, scale, zoom);
  const rowHeight = 48; // Height of each task row
  const totalHeight = tasks.length * rowHeight;

  return (
    <div
      className="absolute top-0 z-10 flex flex-col items-center pointer-events-none"
      style={{ left: `${position}px` }}
    >
      {/* Vertical line */}
      <div
        className={`w-0.5 ${getMilestoneColor(milestone.type).replace('text-', 'bg-')} opacity-30`}
        style={{ height: `${totalHeight}px` }}
      />
      
      {/* Milestone marker */}
      <div
        className={`absolute -top-2 pointer-events-auto ${getMilestoneColor(milestone.type)}`}
        title={`${milestone.name}\n${milestone.date.toLocaleDateString()}`}
      >
        <Flag className="size-5 fill-current" />
      </div>

      {/* Label */}
      <div
        className={`absolute -top-8 text-xs whitespace-nowrap px-2 py-1 rounded bg-white border shadow-sm ${getMilestoneColor(
          milestone.type
        )}`}
      >
        {milestone.name}
      </div>
    </div>
  );
};
