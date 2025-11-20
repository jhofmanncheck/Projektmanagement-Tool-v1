import { Task, Milestone, GanttProject } from '../types/gantt.types';

export const createMockProject = (): GanttProject => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tasks: Task[] = [
    {
      id: '1',
      name: 'Project Kickoff & Planning',
      startDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
      status: 'done',
      team: 'product',
      assignee: 'Sarah Chen',
      entwickler: 'Thomas Müller',
      dependencies: [],
      progress: 100
    },
    {
      id: '2',
      name: 'User Research & Requirements',
      startDate: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000),
      endDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
      status: 'in-progress',
      team: 'design',
      assignee: 'Marcus Rodriguez',
      entwickler: 'Anna Schmidt',
      dependencies: ['1'],
      progress: 65
    },
    {
      id: '3',
      name: 'Technical Architecture Design',
      startDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000),
      status: 'in-review',
      team: 'engineering',
      assignee: 'Alex Kumar',
      entwickler: 'Lars Wagner',
      dependencies: ['1'],
      progress: 45
    },
    {
      id: '4',
      name: 'UI/UX Design Mockups',
      startDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000),
      status: 'open',
      team: 'design',
      assignee: 'Emma Thompson',
      dependencies: ['2'],
      progress: 0
    },
    {
      id: '5',
      name: 'Backend API Development',
      startDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(today.getTime() + 19 * 24 * 60 * 60 * 1000),
      status: 'open',
      team: 'engineering',
      assignee: 'David Park',
      entwickler: 'Stefan Fischer',
      dependencies: ['3'],
      progress: 0
    },
    {
      id: '6',
      name: 'Frontend Components Development',
      startDate: new Date(today.getTime() + 11 * 24 * 60 * 60 * 1000),
      endDate: new Date(today.getTime() + 25 * 24 * 60 * 60 * 1000),
      status: 'open',
      team: 'engineering',
      assignee: 'Lisa Wang',
      entwickler: 'Julia Becker',
      dependencies: ['4'],
      progress: 0
    },
    {
      id: '7',
      name: 'Integration Testing',
      startDate: new Date(today.getTime() + 20 * 24 * 60 * 60 * 1000),
      endDate: new Date(today.getTime() + 27 * 24 * 60 * 60 * 1000),
      status: 'open',
      team: 'engineering',
      assignee: 'James Mitchell',
      entwickler: 'Michael Schneider',
      dependencies: ['5', '6'],
      progress: 0
    },
    {
      id: '8',
      name: 'Marketing Campaign Preparation',
      startDate: new Date(today.getTime() + 12 * 24 * 60 * 60 * 1000),
      endDate: new Date(today.getTime() + 26 * 24 * 60 * 60 * 1000),
      status: 'open',
      team: 'marketing',
      assignee: 'Rachel Green',
      dependencies: ['4'],
      progress: 0
    },
    {
      id: '9',
      name: 'User Acceptance Testing',
      startDate: new Date(today.getTime() + 28 * 24 * 60 * 60 * 1000),
      endDate: new Date(today.getTime() + 34 * 24 * 60 * 60 * 1000),
      status: 'open',
      team: 'product',
      assignee: 'Michael Scott',
      entwickler: 'Felix Weber',
      dependencies: ['7'],
      progress: 0
    },
    {
      id: '10',
      name: 'Production Deployment',
      startDate: new Date(today.getTime() + 35 * 24 * 60 * 60 * 1000),
      endDate: new Date(today.getTime() + 36 * 24 * 60 * 60 * 1000),
      status: 'open',
      team: 'operations',
      assignee: 'Kevin Zhang',
      entwickler: 'Hans Hoffmann',
      dependencies: ['9'],
      progress: 0
    }
  ];

  const milestones: Milestone[] = [
    {
      id: 'm1',
      name: 'Project Kickoff',
      date: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
      type: 'kickoff',
      description: 'Initial project kickoff meeting with all stakeholders to align on goals and timeline.'
    },
    {
      id: 'm2',
      name: 'IT Infrastructure Setup',
      date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
      type: 'it-kickoff',
      description: 'Complete setup of development environment, CI/CD pipelines, and infrastructure.'
    },
    {
      id: 'm3',
      name: 'Design Review',
      date: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000),
      type: 'milestone',
      description: 'Comprehensive review of all design mockups and UX flows with the design team.'
    },
    {
      id: 'm4',
      name: 'Development Complete',
      date: new Date(today.getTime() + 27 * 24 * 60 * 60 * 1000),
      type: 'deadline',
      description: 'All development tasks must be completed and code frozen for testing phase.'
    },
    {
      id: 'm5',
      name: 'Production Go-Live',
      date: new Date(today.getTime() + 36 * 24 * 60 * 60 * 1000),
      type: 'go-live',
      description: 'Official product launch to production environment and public release.'
    }
  ];

  return {
    id: 'project-1',
    name: 'Q1 Product Launch',
    tasks,
    milestones,
    teams: ['engineering', 'design', 'product', 'marketing', 'operations'],
    createdAt: new Date(),
    updatedAt: new Date()
  };
};