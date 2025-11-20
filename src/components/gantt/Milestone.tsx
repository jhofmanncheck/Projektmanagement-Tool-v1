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
  const { viewSettings, tasks, teams, expandedTeams } = useGantt();
  const { startDate: viewStart, scale, zoom } = viewSettings;

  const position = dateToPosition(milestone.date, viewStart, scale, zoom);
  const rowHeight = 48; // Height of each task row
  const teamHeaderHeight = 32; // Height of each team header
  
  // Calculate total height including team headers and considering expanded/collapsed state
  const totalHeight = React.useMemo(() => {
    // Group tasks by team
    const tasksByTeam: Record<string, typeof tasks> = {};
    tasks.forEach((task) => {
      if (!tasksByTeam[task.team]) {
        tasksByTeam[task.team] = [];
      }
      tasksByTeam[task.team].push(task);
    });

    // Sort teams
    const sortedTeams = Object.keys(tasksByTeam).sort((a, b) => {
      const aIndex = teams.indexOf(a);
      const bIndex = teams.indexOf(b);
      
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.localeCompare(b);
    });

    let height = 0;
    sortedTeams.forEach((team) => {
      // Add team header height
      height += teamHeaderHeight;
      
      // Add task rows height only if team is expanded
      if (expandedTeams.has(team)) {
        height += tasksByTeam[team].length * rowHeight;
      }
    });

    return height;
  }, [tasks, teams, expandedTeams]);

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
