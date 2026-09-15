import { Moon, Sun, LogOut, User as UserIcon } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GlobalSearch } from '@/components/layout/GlobalSearch';
import { useUiStore } from '@/store/uiStore';
import { useAuth } from '@/hooks/useAuth';

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function Topbar({ title }: { title: string }) {
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const { user, signOut } = useAuth();

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-6">
      <h1 className="font-heading text-lg font-semibold">{title}</h1>

      <div className="ml-auto flex items-center gap-3">
        <GlobalSearch />

        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full outline-none ring-ring focus-visible:ring-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                  {user ? initials(user.name) : <UserIcon className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="truncate text-sm font-medium">{user?.name}</div>
              <div className="truncate text-xs text-muted-foreground">{user?.email}</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                {user?.role.replace('_', ' ')}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()} className="text-destructive">
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
