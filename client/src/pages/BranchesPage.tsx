import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { BranchCard } from '@/components/dashboard/BranchCard';
import { BranchFormDialog } from '@/components/branches/BranchFormDialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { listBranches } from '@/services/branchService';

export function BranchesPage() {
  const { data: branches, isLoading } = useQuery({ queryKey: ['branches'], queryFn: listBranches });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-semibold">Branches</h2>
          <p className="text-sm text-muted-foreground">
            Select a branch to open its floors, areas, and seating plan.
          </p>
        </div>
        <BranchFormDialog
          trigger={
            <Button size="sm">
              <Plus className="h-4 w-4" />
              New branch
            </Button>
          }
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {branches?.map((branch, i) => (
            <motion.div
              key={branch._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
            >
              <BranchCard branch={branch} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
