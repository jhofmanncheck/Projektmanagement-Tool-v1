import React, { useRef } from 'react';
import { useGantt } from '../../contexts/GanttContext';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ZoomIn, ZoomOut, Save, Upload, Plus } from 'lucide-react';

interface ToolbarProps {
  onAddTask: () => void;
  onAddMilestone: () => void;
  onAddTeam: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onAddTask, onAddMilestone, onAddTeam }) => {
  const { viewSettings, setViewSettings, saveProject, loadProject, project } = useGantt();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleZoomIn = () => {
    setViewSettings({ zoom: Math.min(viewSettings.zoom + 0.25, 2) });
  };

  const handleZoomOut = () => {
    setViewSettings({ zoom: Math.max(viewSettings.zoom - 0.25, 0.5) });
  };

  const handleScaleChange = (scale: 'day' | 'week' | 'month') => {
    setViewSettings({ scale });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        loadProject(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
      <div className="flex items-center gap-4">
        <h1 className="mr-4">{project.name}</h1>
        
        <Button onClick={onAddTask} size="sm">
          <Plus className="size-4 mr-2" />
          Add Task
        </Button>
        
        <Button onClick={onAddTeam} size="sm" variant="outline">
          <Plus className="size-4 mr-2" />
          Add Team
        </Button>
        
        <Button onClick={onAddMilestone} size="sm" variant="outline">
          <Plus className="size-4 mr-2" />
          Add Milestone
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">View:</span>
          <Select value={viewSettings.scale} onValueChange={handleScaleChange}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-1">
          <Button onClick={handleZoomOut} size="sm" variant="ghost" disabled={viewSettings.zoom <= 0.5}>
            <ZoomOut className="size-4" />
          </Button>
          <span className="text-sm text-muted-foreground min-w-12 text-center">
            {Math.round(viewSettings.zoom * 100)}%
          </span>
          <Button onClick={handleZoomIn} size="sm" variant="ghost" disabled={viewSettings.zoom >= 2}>
            <ZoomIn className="size-4" />
          </Button>
        </div>

        <div className="h-6 w-px bg-border" />

        <Button onClick={saveProject} size="sm" variant="outline">
          <Save className="size-4 mr-2" />
          Save
        </Button>

        <Button
          onClick={() => fileInputRef.current?.click()}
          size="sm"
          variant="outline"
        >
          <Upload className="size-4 mr-2" />
          Load
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};
