export type TaskStatus = 'open' | 'in-progress' | 'in-review' | 'done';

export type Team = string; // Dynamic team names

export type ViewScale = 'day' | 'week' | 'month';

export type MilestoneType = 'kickoff' | 'it-kickoff' | 'deadline' | 'go-live' | 'milestone';

export interface Task {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: TaskStatus;
  team: Team;
  assignee: string;
  entwickler?: string; // Developer assigned to the task
  link?: string;
  dependencies: string[]; // IDs of tasks this depends on
  progress?: number; // 0-100
}

export interface Milestone {
  id: string;
  name: string;
  date: Date;
  type: MilestoneType;
  description?: string;
}

export interface GanttProject {
  id: string;
  name: string;
  tasks: Task[];
  milestones: Milestone[];
  teams: string[]; // Available team names
  createdAt: Date;
  updatedAt: Date;
}

export interface ViewSettings {
  scale: ViewScale;
  zoom: number; // 0.5 to 2
  startDate: Date;
  endDate: Date;
}

export interface DragState {
  taskId: string | null;
  type: 'move' | 'resize-left' | 'resize-right' | null;
  initialX: number;
  initialStartDate: Date | null;
  initialEndDate: Date | null;
}