import { Moon, Sun, LogOut } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useUiStore } from '@/store/uiStore';

export function SettingsPage() {
  const { user, signOut } = useAuth();
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h2 className="font-heading text-xl font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">Your account and display preferences.</p>
      </div>

      <Card className="p-5">
        <h3 className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Profile
        </h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Name</dt>
            <dd className="font-medium">{user?.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-medium">{user?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Role</dt>
            <dd className="font-mono text-xs">{user?.role.replace('_', ' ')}</dd>
          </div>
        </dl>
      </Card>

      <Card className="p-5">
        <h3 className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Appearance
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-sm">Theme</span>
          <Button variant="outline" size="sm" onClick={toggleTheme}>
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            {theme === 'light' ? 'Switch to dark' : 'Switch to light'}
          </Button>
        </div>
      </Card>

      <Button variant="outline" className="text-destructive" onClick={() => signOut()}>
        <LogOut className="h-4 w-4" />
        Sign out
      </Button>
    </div>
  );
}
