import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Task, Milestone, ViewSettings, GanttProject } from '../types/gantt.types';
import { createMockProject } from '../utils/mockData';
import { addMonths } from '../utils/dateUtils';

interface GanttContextType {
  project: GanttProject;
  tasks: Task[];
  milestones: Milestone[];
  viewSettings: ViewSettings;
  selectedTaskId: string | null;
  setProject: (project: GanttProject) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  addMilestone: (milestone: Milestone) => void;
  updateMilestone: (milestoneId: string, updates: Partial<Milestone>) => void;
  deleteMilestone: (milestoneId: string) => void;
  setViewSettings: (settings: Partial<ViewSettings>) => void;
  setSelectedTaskId: (taskId: string | null) => void;
  saveProject: () => void;
  loadProject: (projectData: string) => void;
}

const GanttContext = createContext<GanttContextType | undefined>(undefined);

export const useGantt = () => {
  const context = useContext(GanttContext);
  if (!context) {
    throw new Error('useGantt must be used within GanttProvider');
  }
  return context;
};

interface GanttProviderProps {
  children: ReactNode;
}

export const GanttProvider: React.FC<GanttProviderProps> = ({ children }) => {
  const [project, setProject] = useState<GanttProject>(createMockProject());
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [viewSettings, setViewSettingsState] = useState<ViewSettings>({
    scale: 'day',
    zoom: 1,
    startDate: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000),
    endDate: addMonths(today, 2)
  });

  const addTask = useCallback((task: Task) => {
    setProject(prev => ({
      ...prev,
      tasks: [...prev.tasks, task],
      updatedAt: new Date()
    }));
  }, []);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setProject(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      ),
      updatedAt: new Date()
    }));
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setProject(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== taskId).map(task => ({
        ...task,
        dependencies: task.dependencies.filter(depId => depId !== taskId)
      })),
      updatedAt: new Date()
    }));
  }, []);

  const addMilestone = useCallback((milestone: Milestone) => {
    setProject(prev => ({
      ...prev,
      milestones: [...prev.milestones, milestone],
      updatedAt: new Date()
    }));
  }, []);

  const updateMilestone = useCallback((milestoneId: string, updates: Partial<Milestone>) => {
    setProject(prev => ({
      ...prev,
      milestones: prev.milestones.map(milestone => 
        milestone.id === milestoneId ? { ...milestone, ...updates } : milestone
      ),
      updatedAt: new Date()
    }));
  }, []);

  const deleteMilestone = useCallback((milestoneId: string) => {
    setProject(prev => ({
      ...prev,
      milestones: prev.milestones.filter(milestone => milestone.id !== milestoneId),
      updatedAt: new Date()
    }));
  }, []);

  const setViewSettings = useCallback((settings: Partial<ViewSettings>) => {
    setViewSettingsState(prev => ({ ...prev, ...settings }));
  }, []);

  const saveProject = useCallback(() => {
    const projectData = JSON.stringify(project, null, 2);
    const blob = new Blob([projectData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [project]);

  const loadProject = useCallback((projectData: string) => {
    try {
      const parsed = JSON.parse(projectData);
      const loadedProject: GanttProject = {
        ...parsed,
        tasks: parsed.tasks.map((task: any) => ({
          ...task,
          startDate: new Date(task.startDate),
          endDate: new Date(task.endDate)
        })),
        milestones: parsed.milestones.map((milestone: any) => ({
          ...milestone,
          date: new Date(milestone.date)
        })),
        createdAt: new Date(parsed.createdAt),
        updatedAt: new Date(parsed.updatedAt)
      };
      setProject(loadedProject);
    } catch (error) {
      console.error('Failed to load project:', error);
      alert('Failed to load project file. Please check the file format.');
    }
  }, []);

  const value: GanttContextType = {
    project,
    tasks: project.tasks,
    milestones: project.milestones,
    viewSettings,
    selectedTaskId,
    setProject,
    addTask,
    updateTask,
    deleteTask,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    setViewSettings,
    setSelectedTaskId,
    saveProject,
    loadProject
  };

  return (
    <GanttContext.Provider value={value}>
      {children}
    </GanttContext.Provider>
  );
};
