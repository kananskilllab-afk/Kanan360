import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Building2, DoorOpen, Search, User } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { globalSearch } from '@/services/searchService';

// Fans out across employees, areas, and branches — see ARCH-SPEC UI·05.
// A hit navigates as far as the app currently supports; once the floor
// plan viewer (Phase 3/4) exists, an employee/area hit will additionally
// focus the camera on that Area ID.
export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 250);
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const { data, isFetching } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => globalSearch(debouncedQuery),
    enabled: open && debouncedQuery.trim().length >= 2,
  });

  const go = (path: string) => {
    setOpen(false);
    setQuery('');
    navigate(path);
  };

  return (
    <>
      <Button
        variant="outline"
        className="h-9 w-full max-w-sm justify-start gap-2 text-muted-foreground sm:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Search people, areas, branches…</span>
        <kbd className="hidden rounded border bg-muted px-1.5 font-mono text-[10px] sm:inline">⌘K</kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen} title="Global search" description="Search Kanan Baroda">
        <CommandInput placeholder="Search by name, employee ID, area, or branch…" value={query} onValueChange={setQuery} />
        <CommandList>
          {debouncedQuery.trim().length < 2 && (
            <CommandEmpty>Type at least 2 characters to search.</CommandEmpty>
          )}
          {debouncedQuery.trim().length >= 2 && !isFetching && !data?.employees.length && !data?.areas.length && !data?.branches.length && (
            <CommandEmpty>No matches for "{debouncedQuery}".</CommandEmpty>
          )}

          {!!data?.employees.length && (
            <CommandGroup heading="Employees">
              {data.employees.map((e) => (
                <CommandItem key={e._id} onSelect={() => go(`/admin/employees?highlight=${e._id}`)}>
                  <User className="text-muted-foreground" />
                  <span>{e.name}</span>
                  <span className="ml-2 font-mono text-xs text-muted-foreground">{e.employeeId}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{e.designation}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {!!data?.areas.length && (
            <CommandGroup heading="Areas">
              {data.areas.map((a) => (
                <CommandItem key={a._id} onSelect={() => go(`/admin/branches/${a.branchId}?floor=${a.floorId}&area=${a.areaCode}`)}>
                  <DoorOpen className="text-muted-foreground" />
                  <span>{a.name}</span>
                  <span className="ml-2 font-mono text-xs text-muted-foreground">{a.areaCode}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {!!data?.branches.length && (
            <CommandGroup heading="Branches">
              {data.branches.map((b) => (
                <CommandItem key={b._id} onSelect={() => go(`/admin/branches/${b._id}`)}>
                  <Building2 className="text-muted-foreground" />
                  <span>{b.name}</span>
                  <span className="ml-auto font-mono text-xs text-muted-foreground">{b.code}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
