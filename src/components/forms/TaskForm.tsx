import React, { useState, useEffect } from 'react';
import { useGantt } from '../../contexts/GanttContext';
import { Task, TaskStatus, Team } from '../../types/gantt.types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  taskId?: string | null;
}

export const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onClose, taskId }) => {
  const { tasks, teams, addTask, updateTask } = useGantt();
  const existingTask = taskId ? tasks.find((t) => t.id === taskId) : null;

  const [formData, setFormData] = useState<{
    name: string;
    startDate: string;
    endDate: string;
    status: TaskStatus;
    team: Team;
    assignee: string;
    entwickler: string;
    link: string;
    dependencies: string[];
  }>({
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: 'not-started',
    team: teams[0] || '',
    assignee: '',
    entwickler: '',
    link: '',
    dependencies: []
  });

  useEffect(() => {
    if (existingTask) {
      setFormData({
        name: existingTask.name,
        startDate: existingTask.startDate.toISOString().split('T')[0],
        endDate: existingTask.endDate.toISOString().split('T')[0],
        status: existingTask.status,
        team: existingTask.team,
        assignee: existingTask.assignee,
        entwickler: existingTask.entwickler || '',
        link: existingTask.link || '',
        dependencies: existingTask.dependencies
      });
    } else {
      setFormData({
        name: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        status: 'not-started',
        team: teams[0] || '',
        assignee: '',
        entwickler: '',
        link: '',
        dependencies: []
      });
    }
  }, [existingTask, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const taskData = {
      name: formData.name,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      status: formData.status,
      team: formData.team,
      assignee: formData.assignee,
      entwickler: formData.entwickler || undefined,
      link: formData.link || undefined,
      dependencies: formData.dependencies,
      progress: existingTask?.progress || 0
    };

    if (existingTask) {
      updateTask(existingTask.id, taskData);
    } else {
      const newTask: Task = {
        id: `task-${Date.now()}`,
        ...taskData
      };
      addTask(newTask);
    }

    onClose();
  };

  const availableDependencies = tasks.filter((t) => t.id !== taskId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{existingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Task Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value: TaskStatus) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-started">Not Started</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="team">Team *</Label>
              <Select value={formData.team} onValueChange={(value: Team) => setFormData({ ...formData, team: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team} value={team}>
                      {team.charAt(0).toUpperCase() + team.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="assignee">Assignee *</Label>
              <Input
                id="assignee"
                value={formData.assignee}
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="entwickler">Entwickler (optional)</Label>
              <Input
                id="entwickler"
                value={formData.entwickler}
                onChange={(e) => setFormData({ ...formData, entwickler: e.target.value })}
                placeholder="Entwickler Name"
              />
            </div>

            <div>
              <Label htmlFor="link">Link (optional)</Label>
              <Input
                id="link"
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="dependencies">Dependencies (optional)</Label>
              <Select
                value={formData.dependencies[0] || ''}
                onValueChange={(value) => {
                  if (value && !formData.dependencies.includes(value)) {
                    setFormData({ ...formData, dependencies: [...formData.dependencies, value] });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tasks this depends on" />
                </SelectTrigger>
                <SelectContent>
                  {availableDependencies.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {formData.dependencies.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.dependencies.map((depId) => {
                    const depTask = tasks.find((t) => t.id === depId);
                    return (
                      <div key={depId} className="flex items-center gap-1 bg-slate-100 rounded px-2 py-1 text-sm">
                        <span>{depTask?.name}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              dependencies: formData.dependencies.filter((id) => id !== depId)
                            })
                          }
                          className="text-slate-500 hover:text-slate-700"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{existingTask ? 'Update Task' : 'Create Task'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};