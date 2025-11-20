import React, { useState } from 'react';
import { useGantt } from '../../contexts/GanttContext';
import { Milestone, MilestoneType } from '../../types/gantt.types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface MilestoneFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MilestoneForm: React.FC<MilestoneFormProps> = ({ isOpen, onClose }) => {
  const { addMilestone } = useGantt();

  const [formData, setFormData] = useState<{
    name: string;
    date: string;
    type: MilestoneType;
  }>({
    name: '',
    date: new Date().toISOString().split('T')[0],
    type: 'deadline'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newMilestone: Milestone = {
      id: `milestone-${Date.now()}`,
      name: formData.name,
      date: new Date(formData.date),
      type: formData.type
    };

    addMilestone(newMilestone);
    onClose();

    // Reset form
    setFormData({
      name: '',
      date: new Date().toISOString().split('T')[0],
      type: 'deadline'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Create New Milestone</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="milestone-name">Milestone Name *</Label>
            <Input
              id="milestone-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
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
                <SelectItem value="deadline">Deadline</SelectItem>
                <SelectItem value="go-live">Go-Live</SelectItem>
                <SelectItem value="review">Review</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Milestone</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};