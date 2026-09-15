import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Branch } from '@kanan-baroda/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { createBranch, updateBranch, type BranchInput } from '@/services/branchService';
import { apiErrorMessage } from '@/lib/apiClient';

interface BranchFormDialogProps {
  trigger: React.ReactNode;
  branch?: Branch; // present = edit mode, absent = create mode
  onSaved?: (branch: Branch) => void;
}

const EMPTY: BranchInput = { code: '', name: '', location: '', address: '' };

export function BranchFormDialog({ trigger, branch, onSaved }: BranchFormDialogProps) {
  const isEdit = !!branch;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<BranchInput>(
    branch ? { code: branch.code, name: branch.name, location: branch.location, address: branch.address } : EMPTY,
  );
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => (isEdit ? updateBranch(branch!._id, form) : createBranch(form)),
    onSuccess: (saved) => {
      toast.success(isEdit ? 'Branch updated' : `${saved.name} created`);
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      if (isEdit) queryClient.invalidateQueries({ queryKey: ['branch', branch!._id] });
      setOpen(false);
      if (!isEdit) setForm(EMPTY);
      onSaved?.(saved);
    },
    onError: (err) => toast.error(apiErrorMessage(err, isEdit ? 'Could not update branch' : 'Could not create branch')),
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next && branch) {
          setForm({ code: branch.code, name: branch.name, location: branch.location, address: branch.address });
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit branch' : 'Create branch'}</DialogTitle>
          <DialogDescription>
            {isEdit ? `Update ${branch!.name}'s details.` : 'Add a new Kanan Baroda branch to the portfolio.'}
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="b-code">Branch code</Label>
              <Input
                id="b-code"
                required
                minLength={2}
                maxLength={12}
                placeholder="VAD06"
                value={form.code}
                disabled={isEdit}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="b-location">Location</Label>
              <Input
                id="b-location"
                required
                minLength={2}
                placeholder="Karelibaug"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="b-name">Branch name</Label>
            <Input
              id="b-name"
              required
              minLength={2}
              placeholder="Karelibaug Office"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="b-address">Address</Label>
            <Input
              id="b-address"
              required
              minLength={2}
              placeholder="Karelibaug Office, Karelibaug, Vadodara, Gujarat"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {isEdit ? 'Save changes' : 'Create branch'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
