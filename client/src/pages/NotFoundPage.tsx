import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3 bg-background text-center">
      <div className="font-mono text-sm text-muted-foreground">404</div>
      <h1 className="font-heading text-2xl font-semibold">Page not found</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        The page you're looking for doesn't exist, or you don't have access to it.
      </p>
      <Button asChild>
        <Link to="/">Back to dashboard</Link>
      </Button>
    </div>
  );
}
