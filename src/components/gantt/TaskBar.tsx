import React, { useState, useRef, useEffect } from 'react';
import { Task } from '../../types/gantt.types';
import { useGantt } from '../../contexts/GanttContext';
import { getTeamColor, getStatusColor } from '../../utils/colorUtils';
import { dateToPosition, positionToDate, getColumnWidth, differenceInDays } from '../../utils/dateUtils';

interface TaskBarProps {
  task: Task;
}

export const TaskBar: React.FC<TaskBarProps> = ({ task }) => {
  const { viewSettings, updateTask, selectedTaskId, setSelectedTaskId } = useGantt();
  const { startDate: viewStart, scale, zoom } = viewSettings;
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<'left' | 'right' | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, initialLeft: 0, initialWidth: 0 });
  const barRef = useRef<HTMLDivElement>(null);

  const columnWidth = getColumnWidth(scale, zoom);
  const left = dateToPosition(task.startDate, viewStart, scale, zoom);
  const right = dateToPosition(task.endDate, viewStart, scale, zoom);
  const width = right - left + columnWidth;
  const duration = differenceInDays(task.endDate, task.startDate) + 1;

  const handleMouseDown = (e: React.MouseEvent, type: 'move' | 'resize-left' | 'resize-right') => {
    e.stopPropagation();
    
    if (type === 'move') {
      setIsDragging(true);
      setDragStart({
        x: e.clientX,
        initialLeft: left,
        initialWidth: width
      });
    } else {
      setIsResizing(type === 'resize-left' ? 'left' : 'right');
      setDragStart({
        x: e.clientX,
        initialLeft: left,
        initialWidth: width
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStart.x;
        const newLeft = dragStart.initialLeft + deltaX;
        const newStartDate = positionToDate(newLeft, viewStart, scale, zoom);
        const daysDiff = differenceInDays(task.endDate, task.startDate);
        const newEndDate = new Date(newStartDate);
        newEndDate.setDate(newEndDate.getDate() + daysDiff);
        
        updateTask(task.id, {
          startDate: newStartDate,
          endDate: newEndDate
        });
      } else if (isResizing) {
        const deltaX = e.clientX - dragStart.x;
        
        if (isResizing === 'left') {
          const newLeft = dragStart.initialLeft + deltaX;
          const newStartDate = positionToDate(newLeft, viewStart, scale, zoom);
          
          if (newStartDate < task.endDate) {
            updateTask(task.id, { startDate: newStartDate });
          }
        } else {
          const newWidth = dragStart.initialWidth + deltaX;
          const newRight = dragStart.initialLeft + newWidth;
          const newEndDate = positionToDate(newRight, viewStart, scale, zoom);
          
          if (newEndDate > task.startDate) {
            updateTask(task.id, { endDate: newEndDate });
          }
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(null);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, task, viewStart, scale, zoom, updateTask]);

  const isSelected = selectedTaskId === task.id;

  return (
    <div
      ref={barRef}
      className={`absolute h-8 rounded-md flex items-center justify-between px-2 cursor-move select-none group ${getTeamColor(
        task.team
      )} ${isSelected ? 'ring-2 ring-offset-1 ring-blue-600' : ''} hover:brightness-110 transition-all`}
      style={{
        left: `${left}px`,
        width: `${width}px`,
        top: '8px'
      }}
      onMouseDown={(e) => handleMouseDown(e, 'move')}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedTaskId(task.id);
      }}
      title={`${task.name} (${duration} days)\n${task.assignee}\nStatus: ${task.status}`}
    >
      {/* Left resize handle */}
      <div
        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/30 opacity-0 group-hover:opacity-100"
        onMouseDown={(e) => handleMouseDown(e, 'resize-left')}
      />

      {/* Task content */}
      <div className="flex-1 overflow-hidden">
        <div className="text-xs text-white truncate">{task.name}</div>
      </div>

      {/* Progress indicator */}
      {task.progress !== undefined && task.progress > 0 && (
        <div className="absolute bottom-0 left-0 h-1 bg-white/40" style={{ width: `${task.progress}%` }} />
      )}

      {/* Right resize handle */}
      <div
        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/30 opacity-0 group-hover:opacity-100"
        onMouseDown={(e) => handleMouseDown(e, 'resize-right')}
      />
    </div>
  );
};
