import React from 'react';
import { useGantt } from '../../contexts/GanttContext';
import { Button } from '../ui/button';
import { Edit2, Trash2 } from 'lucide-react';
import { getStatusColor } from '../../utils/colorUtils';

interface TaskListProps {
  onEditTask: (taskId: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ onEditTask }) => {
  const { tasks, deleteTask, selectedTaskId, setSelectedTaskId } = useGantt();

  return (
    <div className="w-80 border-r bg-white flex-shrink-0">
      <div className="sticky top-0 z-20 bg-slate-100 border-b px-4 py-3">
        <h3 className="text-sm text-slate-600">Task Name</h3>
      </div>

      <div>
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`h-12 border-b px-4 flex items-center justify-between group hover:bg-slate-50 cursor-pointer ${
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
    </div>
  );
};
