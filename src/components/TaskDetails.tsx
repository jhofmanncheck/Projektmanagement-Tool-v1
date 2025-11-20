import React from 'react';
import { useGantt } from '../contexts/GanttContext';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ExternalLink, Calendar, User, Users, Code } from 'lucide-react';
import { differenceInDays } from '../utils/dateUtils';

interface TaskDetailsProps {
  onEditTask: (taskId: string) => void;
}

export const TaskDetails: React.FC<TaskDetailsProps> = ({ onEditTask }) => {
  const { selectedTaskId, tasks } = useGantt();

  if (!selectedTaskId) {
    return (
      <Card className="p-6 m-4">
        <p className="text-sm text-muted-foreground text-center">
          Select a task to view details
        </p>
      </Card>
    );
  }

  const task = tasks.find((t) => t.id === selectedTaskId);

  if (!task) return null;

  const duration = differenceInDays(task.endDate, task.startDate) + 1;
  const dependencies = tasks.filter((t) => task.dependencies.includes(t.id));

  return (
    <Card className="p-6 m-4 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="mb-1">{task.name}</h3>
          <Badge variant="outline">{task.status.replace('-', ' ')}</Badge>
        </div>
        <Button size="sm" onClick={() => onEditTask(task.id)}>
          Edit
        </Button>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="size-4" />
          <span>
            {task.startDate.toLocaleDateString()} - {task.endDate.toLocaleDateString()}
          </span>
          <span className="text-xs">({duration} days)</span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <User className="size-4" />
          <span>{task.assignee}</span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="size-4" />
          <span className="capitalize">{task.team}</span>
        </div>

        {task.entwickler && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Code className="size-4" />
            <span>{task.entwickler}</span>
          </div>
        )}

        {task.link && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <ExternalLink className="size-4" />
            <a
              href={task.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View Link
            </a>
          </div>
        )}

        {task.progress !== undefined && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Progress</span>
              <span>{task.progress}%</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${task.progress}%` }}
              />
            </div>
          </div>
        )}

        {dependencies.length > 0 && (
          <div>
            <div className="text-xs mb-2">Dependencies:</div>
            <div className="space-y-1">
              {dependencies.map((dep) => (
                <div key={dep.id} className="text-xs bg-slate-100 rounded px-2 py-1">
                  {dep.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};