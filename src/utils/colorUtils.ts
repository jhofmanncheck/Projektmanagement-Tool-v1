import { TaskStatus, Team } from '../types/gantt.types';

export const getStatusColor = (status: TaskStatus): string => {
  const colors = {
    'not-started': 'bg-slate-400',
    'in-progress': 'bg-blue-500',
    'completed': 'bg-green-500',
    'blocked': 'bg-red-500'
  };
  return colors[status];
};

export const getTeamColor = (team: Team): string => {
  const colors = {
    'engineering': 'bg-blue-500',
    'design': 'bg-purple-500',
    'product': 'bg-green-500',
    'marketing': 'bg-orange-500',
    'operations': 'bg-cyan-500'
  };
  return colors[team];
};

export const getStatusTextColor = (status: TaskStatus): string => {
  return 'text-white';
};

export const getMilestoneColor = (type: string): string => {
  const colors: Record<string, string> = {
    'kickoff': 'text-green-600',
    'deadline': 'text-red-600',
    'go-live': 'text-purple-600',
    'review': 'text-blue-600'
  };
  return colors[type] || 'text-gray-600';
};

export const getMilestoneBackgroundColor = (type: string): string => {
  const colors: Record<string, string> = {
    'kickoff': 'bg-slate-100',
    'deadline': 'bg-red-100',
    'go-live': 'bg-blue-100',
    'review': 'bg-slate-100'
  };
  return colors[type] || 'bg-slate-100';
};
