import React from 'react';
import { useGantt } from '../../contexts/GanttContext';
import { Button } from '../ui/button';
import { Edit2, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { getStatusColor } from '../../utils/colorUtils';

interface TaskListProps {
  onEditTask: (taskId: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ onEditTask }) => {
  const { tasks, teams, deleteTask, selectedTaskId, setSelectedTaskId, expandedTeams, toggleTeamExpanded } = useGantt();

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
    <div className="w-80 border-r bg-white flex-shrink-0 overflow-auto">
      <div className="sticky top-0 z-20 bg-slate-100 border-b px-4 flex items-center" style={{ height: '56px' }}>
        <h3 className="text-sm font-medium text-slate-600">Tasks by Team</h3>
      </div>

      <div>
        {sortedTeams.map((team) => {
          const isExpanded = expandedTeams.has(team);
          const teamTasks = tasksByTeam[team];
          
          return (
            <div key={team} className="mb-2">
              {/* Team Header */}
              <div className="sticky top-14 z-10 bg-slate-200 border-y border-slate-300 px-4 py-2 flex items-center justify-between group">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleTeamExpanded(team)}
                    className="hover:bg-slate-300 rounded p-0.5 transition-colors"
                    title={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? (
                      <ChevronDown className="size-4 text-slate-700" />
                    ) : (
                      <ChevronRight className="size-4 text-slate-700" />
                    )}
                  </button>
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    {team} ({teamTasks.length})
                  </h4>
                </div>
                <span className="text-xs text-slate-500">
                  {isExpanded ? 'Collapse' : 'Expand'}
                </span>
              </div>

              {/* Tasks for this team (only shown when expanded) */}
              {isExpanded && (
                <div className="bg-slate-50/50">
                  {teamTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`h-12 border-b px-4 pl-6 flex items-center justify-between group hover:bg-slate-100 cursor-pointer transition-colors ${
                        selectedTaskId === task.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => setSelectedTaskId(task.id)}
                    >
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusColor(task.status)}`} />
                        <span className="text-sm truncate">{task.name}</span>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditTask(task.id);
                          }}
                        >
                          <Edit2 className="size-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete task "${task.name}"?`)) {
                              deleteTask(task.id);
                            }
                          }}
                        >
                          <Trash2 className="size-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
