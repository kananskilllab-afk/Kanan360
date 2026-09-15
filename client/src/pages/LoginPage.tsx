import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BrandLogo } from '@/components/common/BrandLogo';
import { useAuth } from '@/hooks/useAuth';
import { apiErrorMessage } from '@/lib/apiClient';

// Rendered in place at /admin by AdminGate — there is exactly one Super
// Admin account (see the seed script), so this is a fixed credential
// prompt, never a role picker.
const SUPER_ADMIN_EMAIL = 'superadmin@kananbaroda.co';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // AdminGate re-renders into the console the moment the auth store
      // flips to 'authenticated' — no navigation needed here.
      await signIn(email, password);
    } catch (err) {
      setError(apiErrorMessage(err, 'Invalid email or password'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <BlueprintBackdrop />
        <div className="relative z-10">
          <BrandLogo className="h-10" />
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="font-heading text-3xl font-semibold text-balance">
            The console behind the digital twin.
          </h2>
          <p className="mt-3 text-sm text-sidebar-foreground/60">
            Branches, floors, areas, seats, and employee assignment — everything the public 3D site renders reads
            from what's managed here.
          </p>
        </div>

        <div className="relative z-10 text-xs text-sidebar-foreground/40">
          © {new Date().getFullYear()} Kanan Baroda. Super Admin access only.
        </div>
      </div>

      <div className="flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 lg:hidden">
            <BrandLogo className="h-9" />
          </div>

          <h1 className="font-heading text-2xl font-semibold">Super Admin sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage branches, floors, areas, and floor-plan assets.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@kananbaroda.co"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign in
            </Button>
          </form>

          <div className="mt-8 rounded-md border bg-muted/40 p-3">
            <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
              Seed credential — change before real deployment
            </p>
            <button
              type="button"
              onClick={() => {
                setEmail(SUPER_ADMIN_EMAIL);
                // Fill the password too — "Demo@12345" is easy to mistype by
                // hand, and mistyping it produces the exact same "Invalid
                // email or password" text as a real wrong password, with
                // nothing to tell them apart.
                setPassword('Demo@12345');
                setError(null);
              }}
              className="flex w-full items-center justify-between rounded px-1.5 py-1 text-left text-xs hover:bg-accent"
            >
              <span className="text-muted-foreground">Super Admin</span>
              <span className="font-mono">{SUPER_ADMIN_EMAIL}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// A quiet nod to the product's subject — a hand-drawn floor-plan grid,
// never distracting from the sign-in form beside it.
function BlueprintBackdrop() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]"
      viewBox="0 0 400 400"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="400" height="400" fill="url(#grid)" />
      <rect x="60" y="60" width="120" height="90" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="220" y="60" width="120" height="150" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="60" y="190" width="120" height="150" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
