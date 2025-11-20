export type TaskStatus = 'not-started' | 'in-progress' | 'completed' | 'blocked';

export type Team = 'engineering' | 'design' | 'product' | 'marketing' | 'operations';

export type ViewScale = 'day' | 'week' | 'month';

export type MilestoneType = 'kickoff' | 'deadline' | 'go-live' | 'review';

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
}

export interface GanttProject {
  id: string;
  name: string;
  tasks: Task[];
  milestones: Milestone[];
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