import React, { useState, useEffect } from 'react';
import { useGantt } from '../../contexts/GanttContext';
import { Milestone, MilestoneType } from '../../types/gantt.types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface MilestoneFormProps {
  isOpen: boolean;
  onClose: () => void;
  milestoneId?: string | null;
}

export const MilestoneForm: React.FC<MilestoneFormProps> = ({ isOpen, onClose, milestoneId }) => {
  const { milestones, addMilestone, updateMilestone } = useGantt();
  const existingMilestone = milestoneId ? milestones.find((m) => m.id === milestoneId) : null;

  const [formData, setFormData] = useState<{
    name: string;
    date: string;
    type: MilestoneType;
    description: string;
  }>({
    name: '',
    date: new Date().toISOString().split('T')[0],
    type: 'milestone',
    description: ''
  });

  useEffect(() => {
    if (existingMilestone) {
      setFormData({
        name: existingMilestone.name,
        date: existingMilestone.date.toISOString().split('T')[0],
        type: existingMilestone.type,
        description: existingMilestone.description || ''
      });
    } else {
      setFormData({
        name: '',
        date: new Date().toISOString().split('T')[0],
        type: 'milestone',
        description: ''
      });
    }
  }, [existingMilestone, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const milestoneData = {
      name: formData.name,
      date: new Date(formData.date),
      type: formData.type,
      description: formData.description || undefined
    };

    if (existingMilestone) {
      updateMilestone(existingMilestone.id, milestoneData);
    } else {
      const newMilestone: Milestone = {
        id: `milestone-${Date.now()}`,
        ...milestoneData
      };
      addMilestone(newMilestone);
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{existingMilestone ? 'Edit Milestone' : 'Create New Milestone'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="milestone-name">Milestone Name *</Label>
            <Input
              id="milestone-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Project Launch"
              required
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="milestone-type">Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: MilestoneType) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kickoff">Kickoff</SelectItem>
                <SelectItem value="it-kickoff">IT Kickoff</SelectItem>
                <SelectItem value="deadline">Deadline</SelectItem>
                <SelectItem value="go-live">Go-Live</SelectItem>
                <SelectItem value="milestone">Milestone</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="milestone-date">Date *</Label>
            <Input
              id="milestone-date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="milestone-description">Description (optional)</Label>
            <Textarea
              id="milestone-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add details about this milestone..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{existingMilestone ? 'Update Milestone' : 'Create Milestone'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
