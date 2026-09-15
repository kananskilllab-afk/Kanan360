import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, MapPin, Boxes, Pencil, Ban } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AreaCard } from '@/components/floorplan/AreaCard';
import { AreaInfoPanel } from '@/components/floorplan/AreaInfoPanel';
import { BranchFormDialog } from '@/components/branches/BranchFormDialog';
import { getBranch, deactivateBranch } from '@/services/branchService';
import { listFloors } from '@/services/floorService';
import { listAreas } from '@/services/areaService';
import { apiErrorMessage } from '@/lib/apiClient';

export function BranchDetailPage() {
  const { branchId } = useParams<{ branchId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

  const deactivateMutation = useMutation({
    mutationFn: () => deactivateBranch(branchId as string),
    onSuccess: () => {
      toast.success('Branch deactivated');
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      navigate('/admin/branches');
    },
    onError: (err) => toast.error(apiErrorMessage(err, 'Could not deactivate branch')),
  });

  const branch = useQuery({
    queryKey: ['branch', branchId],
    queryFn: () => getBranch(branchId as string),
    enabled: !!branchId,
  });
  const floors = useQuery({
    queryKey: ['floors', branchId],
    queryFn: () => listFloors(branchId as string),
    enabled: !!branchId,
  });

  useEffect(() => {
    if (!floors.data?.length) return;
    const requested = searchParams.get('floor');
    setSelectedFloorId(requested && floors.data.some((f) => f._id === requested) ? requested : floors.data[0]._id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [floors.data]);

  const areas = useQuery({
    queryKey: ['areas', selectedFloorId],
    queryFn: () => listAreas({ floorId: selectedFloorId as string }),
    enabled: !!selectedFloorId,
  });

  const selectedFloor = floors.data?.find((f) => f._id === selectedFloorId);

  return (
    <div className="space-y-6">
      <Link to="/admin/branches" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" />
        All branches
      </Link>

      {branch.isLoading || !branch.data ? (
        <Skeleton className="h-16 w-2/3" />
      ) : (
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-xl font-semibold">{branch.data.name}</h2>
              <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                {branch.data.code}
              </span>
            </div>
            <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {branch.data.address}
            </p>
          </div>

          <div className="flex shrink-0 gap-2">
            <BranchFormDialog
              branch={branch.data}
              trigger={
                <Button variant="outline" size="sm">
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
              }
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                  <Ban className="h-3.5 w-3.5" />
                  Deactivate
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Deactivate {branch.data.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This removes the branch from dashboards and branch listings. Its floors, areas, seats, and
                    employee records are kept in the database, not deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-white hover:bg-destructive/90"
                    onClick={() => deactivateMutation.mutate()}
                  >
                    Deactivate branch
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

      {branch.data && (
        <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
          <div>
            <div className="flex items-center gap-2 font-medium text-foreground">
              <Boxes className="h-4 w-4" />
              Interactive 3D floor plan
            </div>
            <p className="mt-1">
              This is the same live data the public 3D site renders, keyed by <code className="font-mono">areaCode</code>.
              Changes here appear there immediately.
            </p>
          </div>
          <Button variant="outline" size="sm" className="shrink-0" asChild>
            <a href={`/branch/${branch.data.code}`} target="_blank" rel="noreferrer">
              Preview in 3D
            </a>
          </Button>
        </div>
      )}

      {floors.isLoading ? (
        <Skeleton className="h-9 w-64" />
      ) : !floors.data?.length ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          This branch has no floors yet. Floor and area creation ships alongside the floor-plan management
          tools in an upcoming phase.
        </div>
      ) : (
        <>
          <Tabs value={selectedFloorId ?? undefined} onValueChange={setSelectedFloorId}>
            <TabsList>
              {floors.data.map((floor) => (
                <TabsTrigger key={floor._id} value={floor._id}>
                  {floor.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {areas.isLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {areas.data?.map((area) => (
                <AreaCard key={area._id} area={area} onClick={() => setSelectedAreaId(area._id)} />
              ))}
            </div>
          )}
        </>
      )}

      <AreaInfoPanel
        areaId={selectedAreaId}
        branchName={branch.data?.name}
        floorName={selectedFloor?.name}
        open={!!selectedAreaId}
        onOpenChange={(open) => !open && setSelectedAreaId(null)}
      />
    </div>
  );
}
