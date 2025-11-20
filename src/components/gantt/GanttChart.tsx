import React from 'react';
import { useGantt } from '../../contexts/GanttContext';
import { TimelineHeader } from './TimelineHeader';
import { TaskRow } from './TaskRow';
import { DependencyLines } from './DependencyLines';
import { ChevronDown, ChevronRight } from 'lucide-react';

export const GanttChart: React.FC = () => {
  const { tasks, teams, expandedTeams, toggleTeamExpanded, setSelectedTaskId } = useGantt();

  // Group tasks by team
  const tasksByTeam = React.useMemo(() => {
    const grouped: Record<string, typeof tasks> = {};
    
    tasks.forEach((task) => {
      if (!grouped[task.team]) {
        grouped[task.team] = [];
      }
      grouped[task.team].push(task);
    });
    
    return grouped;
  }, [tasks]);

  // Sort teams: prioritize teams array order, then alphabetically for any others
  const sortedTeams = React.useMemo(() => {
    const allTeams = Object.keys(tasksByTeam);
    return allTeams.sort((a, b) => {
      const aIndex = teams.indexOf(a);
      const bIndex = teams.indexOf(b);
      
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [tasksByTeam, teams]);

  return (
    <div className="flex-1 overflow-auto" onClick={() => setSelectedTaskId(null)}>
      <div className="relative">
        {/* Timeline header */}
        <TimelineHeader />

        {/* Task rows with grid, grouped by team */}
        <div className="relative">
          {sortedTeams.map((team) => {
            const isExpanded = expandedTeams.has(team);
            const teamTasks = tasksByTeam[team];
            
            return (
              <React.Fragment key={team}>
                {/* Team header row */}
                <div className="h-8 border-b bg-slate-200 border-slate-300 flex items-center px-4 sticky z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTeamExpanded(team);
                    }}
                    className="hover:bg-slate-300 rounded p-0.5 transition-colors mr-2"
                    title={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? (
                      <ChevronDown className="size-4 text-slate-700" />
                    ) : (
                      <ChevronRight className="size-4 text-slate-700" />
                    )}
                  </button>
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    {team} ({teamTasks.length})
                  </span>
                </div>

                {/* Tasks for this team (only shown when expanded) */}
                {isExpanded && teamTasks.map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
              </React.Fragment>
            );
          })}

          {/* Dependency lines overlay */}
          <DependencyLines />
        </div>
      </div>
    </div>
  );
};
