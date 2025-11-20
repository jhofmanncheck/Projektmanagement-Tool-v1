import React, { useState } from 'react';
import { Milestone } from '../../types/gantt.types';
import { useGantt } from '../../contexts/GanttContext';
import { dateToPosition } from '../../utils/dateUtils';
import { getMilestoneColor } from '../../utils/colorUtils';
import { Flag, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';

interface MilestoneMarkerProps {
  milestone: Milestone;
  onEdit: (milestoneId: string) => void;
}

export const MilestoneMarker: React.FC<MilestoneMarkerProps> = ({ milestone, onEdit }) => {
  const { viewSettings, deleteMilestone } = useGantt();
  const { startDate: viewStart, scale, zoom } = viewSettings;
  const [isHovered, setIsHovered] = useState(false);

  const position = dateToPosition(milestone.date, viewStart, scale, zoom);
  const color = getMilestoneColor(milestone.type);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete milestone "${milestone.name}"?`)) {
      deleteMilestone(milestone.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(milestone.id);
  };

  const formatType = (type: string) => {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div
      className="absolute top-0 bottom-0 flex items-center justify-center pointer-events-auto"
      style={{ left: `${position}px` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Flag Icon */}
      <div
        className={`${color} cursor-pointer transition-all hover:scale-110 z-20 relative`}
        title={milestone.name}
      >
        <Flag className="size-5 fill-current drop-shadow-sm" />
      </div>

      {/* Hover Popup */}
      {isHovered && (
        <div
          className="absolute top-8 left-1/2 -translate-x-1/2 bg-white border border-slate-200 rounded-lg shadow-lg p-3 min-w-[200px] max-w-[300px] z-50"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Arrow */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-slate-200 rotate-45" />
          
          <div className="relative z-10 bg-white">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-slate-900">{milestone.name}</h4>
                <p className={`text-xs font-medium ${color}`}>
                  {formatType(milestone.type)}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={handleEdit}
                  className="p-1 hover:bg-slate-100 rounded transition-colors"
                  title="Edit milestone"
                >
                  <Edit2 className="size-3 text-slate-600" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-1 hover:bg-red-50 rounded transition-colors"
                  title="Delete milestone"
                >
                  <Trash2 className="size-3 text-red-600" />
                </button>
              </div>
            </div>

            {/* Date */}
            <div className="text-xs text-slate-600 mb-2">
              📅 {milestone.date.toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>

            {/* Description */}
            {milestone.description && (
              <div className="text-xs text-slate-700 pt-2 border-t border-slate-100">
                {milestone.description}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

