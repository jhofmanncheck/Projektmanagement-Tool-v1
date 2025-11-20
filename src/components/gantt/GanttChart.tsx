import React from 'react';
import { useGantt } from '../../contexts/GanttContext';
import { TimelineHeader } from './TimelineHeader';
import { TaskRow } from './TaskRow';
import { DependencyLines } from './DependencyLines';
import { Milestone } from './Milestone';

export const GanttChart: React.FC = () => {
  const { tasks, milestones, setSelectedTaskId } = useGantt();

  return (
    <div className="flex-1 overflow-auto" onClick={() => setSelectedTaskId(null)}>
      <div className="relative">
        {/* Timeline header */}
        <TimelineHeader />

        {/* Task rows with grid */}
        <div className="relative">
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}

          {/* Dependency lines overlay */}
          <DependencyLines />

          {/* Milestones overlay */}
          {milestones.map((milestone) => (
            <Milestone key={milestone.id} milestone={milestone} />
          ))}
        </div>
      </div>
    </div>
  );
};
