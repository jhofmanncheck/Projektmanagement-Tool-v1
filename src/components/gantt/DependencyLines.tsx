import React, { useMemo } from 'react';
import { useGantt } from '../../contexts/GanttContext';
import { dateToPosition, getColumnWidth } from '../../utils/dateUtils';
import { Task } from '../../types/gantt.types';

interface ConnectionPoint {
  x: number;
  y: number;
}

interface Route {
  points: ConnectionPoint[];
}

const ROW_HEIGHT = 48;
const TASK_BAR_HEIGHT = 32;
const TASK_BAR_TOP_OFFSET = 8;
const TEAM_HEADER_HEIGHT = 32;
const ARROW_OFFSET = 6; // Distance from task bar edges
const MIN_VERTICAL_SPACING = 16; // Minimum vertical spacing between dependency lines

// Calculate Y position accounting for team headers and expanded/collapsed state
function getTaskYPosition(
  task: Task, 
  allTasks: Task[], 
  teams: string[], 
  expandedTeams: Set<string>
): number {
  const tasksByTeam: Record<string, Task[]> = {};
  allTasks.forEach((t) => {
    if (!tasksByTeam[t.team]) {
      tasksByTeam[t.team] = [];
    }
    tasksByTeam[t.team].push(t);
  });

  const sortedTeams = Object.keys(tasksByTeam).sort((a, b) => {
    const aIndex = teams.indexOf(a);
    const bIndex = teams.indexOf(b);
    
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.localeCompare(b);
  });
  
  let yOffset = 0;
  
  for (const team of sortedTeams) {
    const teamTasks = tasksByTeam[team];
    const isExpanded = expandedTeams.has(team);
    
    yOffset += TEAM_HEADER_HEIGHT;
    
    if (isExpanded) {
      const taskIndexInTeam = teamTasks.findIndex(t => t.id === task.id);
      
      if (taskIndexInTeam !== -1) {
        yOffset += (taskIndexInTeam * ROW_HEIGHT) + TASK_BAR_TOP_OFFSET;
        return yOffset;
      }
      
      yOffset += teamTasks.length * ROW_HEIGHT;
    }
  }
  
  return yOffset;
}

// Calculate task bar bounds
function getTaskBarBounds(
  task: Task, 
  allTasks: Task[], 
  teams: string[], 
  expandedTeams: Set<string>,
  viewStart: Date, 
  scale: string, 
  zoom: number, 
  columnWidth: number
) {
  const top = getTaskYPosition(task, allTasks, teams, expandedTeams);
  
  const left = dateToPosition(task.startDate, viewStart, scale, zoom);
  const right = dateToPosition(task.endDate, viewStart, scale, zoom);
  const width = right - left + columnWidth;
  const bottom = top + TASK_BAR_HEIGHT;
  const centerY = top + TASK_BAR_HEIGHT / 2;
  
  return { left, right: left + width, top, bottom, centerY, width };
}

// Create clean 90-degree stepped connector
function calculateRoute(
  sourceTask: Task,
  targetTask: Task,
  viewStart: Date,
  scale: string,
  zoom: number,
  columnWidth: number,
  allTasks: Task[],
  teams: string[],
  expandedTeams: Set<string>
): Route {
  const sourceBounds = getTaskBarBounds(sourceTask, allTasks, teams, expandedTeams, viewStart, scale, zoom, columnWidth);
  const targetBounds = getTaskBarBounds(targetTask, allTasks, teams, expandedTeams, viewStart, scale, zoom, columnWidth);
  
  // Start point: right edge of source task bar, center vertically
  const startX = sourceBounds.right;
  const startY = sourceBounds.centerY;
  
  // End point: left edge of target task bar, center vertically
  const endX = targetBounds.left;
  const endY = targetBounds.centerY;
  
  const points: ConnectionPoint[] = [];
  
  // Add starting point
  points.push({ x: startX, y: startY });
  
  // Horizontal offset from task bars
  const offsetX = ARROW_OFFSET;
  
  // Step 1: Move right from source
  const firstCornerX = startX + offsetX;
  points.push({ x: firstCornerX, y: startY });
  
  // Determine routing strategy based on relative positions
  const targetIsBelow = endY > startY;
  const targetIsAbove = endY < startY;
  const horizontalGap = endX - firstCornerX;
  
  if (horizontalGap > offsetX * 2) {
    // Sufficient horizontal space - simple 3-segment route
    // Step 2: Move vertically to target level
    points.push({ x: firstCornerX, y: endY });
    
    // Step 3: Move horizontally to target (leaving space for arrow)
    const lastCornerX = endX - offsetX;
    points.push({ x: lastCornerX, y: endY });
    
    // Step 4: Connect to target
    points.push({ x: endX, y: endY });
  } else {
    // Limited horizontal space - route around
    // Find safe vertical position above or below both tasks
    const minY = Math.min(sourceBounds.top, targetBounds.top);
    const maxY = Math.max(sourceBounds.bottom, targetBounds.bottom);
    
    let routeY: number;
    if (targetIsBelow) {
      // Route below both tasks
      routeY = maxY + MIN_VERTICAL_SPACING;
    } else {
      // Route above both tasks
      routeY = minY - MIN_VERTICAL_SPACING;
    }
    
    // Step 2: Move vertically to routing level
    points.push({ x: firstCornerX, y: routeY });
    
    // Step 3: Move horizontally past target
    const lastCornerX = endX - offsetX;
    points.push({ x: lastCornerX, y: routeY });
    
    // Step 4: Move vertically to target level
    points.push({ x: lastCornerX, y: endY });
    
    // Step 5: Connect to target
    points.push({ x: endX, y: endY });
  }
  
  return { points };
}

// Generate crisp SVG path with perfect 90-degree angles
function generatePath(points: ConnectionPoint[]): string {
  if (points.length === 0) return '';
  
  let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  
  for (let i = 1; i < points.length; i++) {
    // Use straight lines for crisp 90-degree angles
    path += ` L ${points[i].x.toFixed(2)} ${points[i].y.toFixed(2)}`;
  }
  
  return path;
}

export const DependencyLines: React.FC = () => {
  const { tasks, teams, expandedTeams, viewSettings } = useGantt();
  const { startDate: viewStart, scale, zoom } = viewSettings;
  const columnWidth = getColumnWidth(scale, zoom);

  const routes = useMemo(() => {
    const routeList: Array<{ route: Route; taskId: string; depId: string }> = [];

    tasks.forEach((task) => {
      const taskTeamExpanded = expandedTeams.has(task.team);
      
      if (!taskTeamExpanded) return;
      
      task.dependencies.forEach((depId) => {
        const dependentTask = tasks.find((t) => t.id === depId);
        if (dependentTask) {
          const depTeamExpanded = expandedTeams.has(dependentTask.team);
          
          if (depTeamExpanded) {
            const route = calculateRoute(
              dependentTask,
              task,
              viewStart,
              scale,
              zoom,
              columnWidth,
              tasks,
              teams,
              expandedTeams
            );
            routeList.push({ route, taskId: task.id, depId });
          }
        }
      });
    });

    return routeList;
  }, [tasks, teams, expandedTeams, viewStart, scale, zoom, columnWidth]);

  if (routes.length === 0) return null;

  // Calculate SVG bounds
  const allPoints = routes.flatMap(r => r.route.points);
  const maxX = Math.max(...allPoints.map(p => p.x), 0) + 100;
  const maxY = Math.max(...allPoints.map(p => p.y), 0) + 100;

  return (
    <svg
      className="absolute top-0 left-0 pointer-events-none z-10"
      style={{ width: `${maxX}px`, height: `${maxY}px` }}
    >
      <defs>
        {/* Sharp, minimalistic arrowhead */}
        <marker
          id="arrowhead"
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="4"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path
            d="M 0,0 L 0,8 L 8,4 z"
            fill="#475569"
            stroke="none"
          />
        </marker>
      </defs>
      
      {routes.map(({ route, taskId, depId }, index) => {
        const path = generatePath(route.points);

        return (
          <g key={`${taskId}-${depId}-${index}`}>
            {/* Main connection path with crisp edges */}
            <path
              d={path}
              stroke="#475569"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="square"
              strokeLinejoin="miter"
              markerEnd="url(#arrowhead)"
              shapeRendering="crispEdges"
            />
          </g>
        );
      })}
    </svg>
  );
};
