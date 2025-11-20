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
const CONNECTOR_SPACING = 12; // Consistent spacing from task bars

// Calculate Y position accounting for team headers and expanded/collapsed state
function getTaskYPosition(
  task: Task, 
  allTasks: Task[], 
  teams: string[], 
  expandedTeams: Set<string>
): number {
  // Group tasks by team, maintaining team order
  const tasksByTeam: Record<string, Task[]> = {};
  allTasks.forEach((t) => {
    if (!tasksByTeam[t.team]) {
      tasksByTeam[t.team] = [];
    }
    tasksByTeam[t.team].push(t);
  });

  // Sort teams based on the provided teams array
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
    
    // Add team header height
    yOffset += TEAM_HEADER_HEIGHT;
    
    if (isExpanded) {
      // Check if the task is in this team
      const taskIndexInTeam = teamTasks.findIndex(t => t.id === task.id);
      
      if (taskIndexInTeam !== -1) {
        // Found the task - calculate Y position
        yOffset += (taskIndexInTeam * ROW_HEIGHT) + TASK_BAR_TOP_OFFSET;
        return yOffset;
      }
      
      // Add the height of all tasks in this expanded team
      yOffset += teamTasks.length * ROW_HEIGHT;
    }
    // If collapsed, we don't add any task heights, just the header was added above
  }
  
  return yOffset;
}

// Calculate task bar bounds for collision detection (matches TaskBar.tsx positioning)
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

// Smart orthogonal routing algorithm with collision avoidance
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
  // Get exact task bar bounds
  const sourceBounds = getTaskBarBounds(sourceTask, allTasks, teams, expandedTeams, viewStart, scale, zoom, columnWidth);
  const targetBounds = getTaskBarBounds(targetTask, allTasks, teams, expandedTeams, viewStart, scale, zoom, columnWidth);
  
  const sourceIndex = Math.floor(sourceBounds.centerY / ROW_HEIGHT);
  const targetIndex = Math.floor(targetBounds.centerY / ROW_HEIGHT);
  
  // Start point: right edge of source task bar, vertically centered on the task bar
  const sourceX = sourceBounds.right;
  const sourceY = sourceBounds.centerY;
  
  // End point: left edge of target task bar, vertically centered on the task bar
  const targetX = targetBounds.left;
  const targetY = targetBounds.centerY;
  
  const points: ConnectionPoint[] = [];
  const horizontalOffset = CONNECTOR_SPACING;
  
  // Special case: same row (source and target on same row)
  if (sourceIndex === targetIndex) {
    // Simple horizontal line with spacing
    points.push({ x: sourceX, y: sourceY });
    points.push({ x: sourceX + horizontalOffset, y: sourceY });
    points.push({ x: targetX - horizontalOffset, y: sourceY });
    points.push({ x: targetX, y: targetY });
    return { points };
  }
  
  // Strategy: horizontal-vertical-horizontal routing
  // Always go right first, then in the direction of the target
  
  // Step 1: Move horizontally from source (right)
  const firstX = sourceX + horizontalOffset;
  points.push({ x: sourceX, y: sourceY });
  points.push({ x: firstX, y: sourceY });
  
  // Step 2: Determine direction toward target (up or down)
  const targetIsAbove = targetY < sourceY;
  const targetIsBelow = targetY > sourceY;
  
  // Step 3: Find safe vertical position in the direction of the target
  // Calculate available space above and below
  const minY = Math.min(sourceBounds.top, targetBounds.top);
  const maxY = Math.max(sourceBounds.bottom, targetBounds.bottom);
  
  const aboveY = minY - CONNECTOR_SPACING;
  const belowY = maxY + CONNECTOR_SPACING;
  
  // Prefer direction toward target, but check for collisions
  let preferredY: number;
  let alternativeY: number;
  
  if (targetIsAbove) {
    preferredY = aboveY;
    alternativeY = belowY;
  } else if (targetIsBelow) {
    preferredY = belowY;
    alternativeY = aboveY;
  } else {
    // Same row (shouldn't happen here, but handle it)
    preferredY = aboveY;
    alternativeY = belowY;
  }
  
  // Check collisions along the horizontal segment
  const lastX = targetX - horizontalOffset;
  const minX = Math.min(firstX, lastX);
  const maxX = Math.max(firstX, lastX);
  
  let preferredCollisions = 0;
  let alternativeCollisions = 0;
  
  for (let i = 0; i < allTasks.length; i++) {
    const task = allTasks[i];
    if (task.id === sourceTask.id || task.id === targetTask.id) continue;
    const bounds = getTaskBarBounds(task, allTasks, teams, expandedTeams, viewStart, scale, zoom, columnWidth);
    
    // Check if horizontal segment intersects with task bar
    const horizontalOverlap = !(maxX < bounds.left || minX > bounds.right);
    
    if (horizontalOverlap) {
      if (preferredY >= bounds.top && preferredY <= bounds.bottom) preferredCollisions++;
      if (alternativeY >= bounds.top && alternativeY <= bounds.bottom) alternativeCollisions++;
    }
  }
  
  // Use preferred direction if no collisions, otherwise use alternative if it has fewer collisions
  let verticalY = preferredY;
  if (preferredCollisions > 0 && alternativeCollisions < preferredCollisions) {
    verticalY = alternativeY;
  }
  
  // Ensure minimum spacing from source and target rows
  const minSpacing = CONNECTOR_SPACING + 4;
  if (Math.abs(verticalY - sourceY) < minSpacing || Math.abs(verticalY - targetY) < minSpacing) {
    // If preferred direction doesn't have enough space, use alternative
    if (Math.abs(preferredY - sourceY) < minSpacing || Math.abs(preferredY - targetY) < minSpacing) {
      verticalY = alternativeY;
    }
  }
  
  // Step 4: Move vertically in the chosen direction
  points.push({ x: firstX, y: verticalY });
  
  // Step 5: Move horizontally to target column
  points.push({ x: lastX, y: verticalY });
  
  // Step 6: Move vertically to target
  points.push({ x: lastX, y: targetY });
  
  // Step 7: Move to target point
  points.push({ x: targetX, y: targetY });
  
  return { points };
}

// Generate SVG path from route points
function generatePath(points: ConnectionPoint[]): string {
  if (points.length === 0) return '';
  
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`;
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
      // Only show dependency lines if both source and target tasks are in expanded teams
      const taskTeamExpanded = expandedTeams.has(task.team);
      
      if (!taskTeamExpanded) return;
      
      task.dependencies.forEach((depId) => {
        const dependentTask = tasks.find((t) => t.id === depId);
        if (dependentTask) {
          const depTeamExpanded = expandedTeams.has(dependentTask.team);
          
          // Only draw if both tasks are visible (their teams are expanded)
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
        {/* Arrow marker definition for precise alignment */}
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="8"
          refY="3"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path
            d="M 0,0 L 0,6 L 8,3 z"
            fill="#64748b"
            stroke="none"
          />
        </marker>
      </defs>
      
      {routes.map(({ route, taskId, depId }, index) => {
        const path = generatePath(route.points);

        return (
          <g key={`${taskId}-${depId}-${index}`}>
            {/* Main connection path with arrowhead marker */}
            <path
              d={path}
              stroke="#64748b"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              markerEnd="url(#arrowhead)"
            />
          </g>
        );
      })}
    </svg>
  );
};
