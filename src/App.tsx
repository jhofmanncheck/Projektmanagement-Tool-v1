import React, { useState } from 'react';
import { GanttProvider } from './contexts/GanttContext';
import { Toolbar } from './components/controls/Toolbar';
import { TaskList } from './components/sidebar/TaskList';
import { GanttChart } from './components/gantt/GanttChart';
import { TaskForm } from './components/forms/TaskForm';
import { MilestoneForm } from './components/forms/MilestoneForm';
import { TeamForm } from './components/forms/TeamForm';
import { TaskDetails } from './components/TaskDetails';

function App() {
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isMilestoneFormOpen, setIsMilestoneFormOpen] = useState(false);
  const [isTeamFormOpen, setIsTeamFormOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);

  const handleAddTask = () => {
    setEditingTaskId(null);
    setIsTaskFormOpen(true);
  };

  const handleEditTask = (taskId: string) => {
    setEditingTaskId(taskId);
    setIsTaskFormOpen(true);
  };

  const handleCloseTaskForm = () => {
    setIsTaskFormOpen(false);
    setEditingTaskId(null);
  };

  const handleAddMilestone = () => {
    setEditingMilestoneId(null);
    setIsMilestoneFormOpen(true);
  };

  const handleEditMilestone = (milestoneId: string) => {
    setEditingMilestoneId(milestoneId);
    setIsMilestoneFormOpen(true);
  };

  const handleCloseMilestoneForm = () => {
    setIsMilestoneFormOpen(false);
    setEditingMilestoneId(null);
  };

  return (
    <GanttProvider>
      <div className="h-screen flex flex-col bg-slate-50">
        {/* Toolbar */}
        <Toolbar 
          onAddTask={handleAddTask} 
          onAddMilestone={handleAddMilestone}
          onAddTeam={() => setIsTeamFormOpen(true)}
        />

        {/* Main content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar - Task list */}
          <TaskList onEditTask={handleEditTask} />

          {/* Center - Gantt chart */}
          <GanttChart onEditMilestone={handleEditMilestone} />

          {/* Right sidebar - Task details */}
          <div className="w-80 border-l bg-white overflow-auto flex-shrink-0">
            <TaskDetails onEditTask={handleEditTask} />
          </div>
        </div>

        {/* Modals */}
        <TaskForm isOpen={isTaskFormOpen} onClose={handleCloseTaskForm} taskId={editingTaskId} />
        <MilestoneForm isOpen={isMilestoneFormOpen} onClose={handleCloseMilestoneForm} milestoneId={editingMilestoneId} />
        <TeamForm isOpen={isTeamFormOpen} onClose={() => setIsTeamFormOpen(false)} />
      </div>
    </GanttProvider>
  );
}

export default App;
