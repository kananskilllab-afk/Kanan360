import { cn } from '@/lib/utils';

interface BrandLogoProps {
  /** "full" shows the whole lockup (icon + wordmark + tagline). "mark" crops
   * to just the icon via object-position, for slots too narrow for the full
   * wide logo (collapsed sidebar) — there's no separate icon-only asset. */
  variant?: 'full' | 'mark';
  className?: string;
}

// The logo is a wide lockup on a white background (client/public/logo.jpeg)
// — wrapped in a white card everywhere so it reads as a placed object
// rather than a stray rectangle when sitting on the dark sidebar/login
// panel.
export function BrandLogo({ variant = 'full', className }: BrandLogoProps) {
  if (variant === 'mark') {
    return (
      <div className={cn('overflow-hidden rounded-md bg-white', className)}>
        <img
          src="/logo.jpeg"
          alt="Kanan.co"
          className="h-full w-full object-cover"
          style={{ objectPosition: '9% center' }}
        />
      </div>
    );
  }

  return (
    <div className={cn('flex items-center rounded-md bg-white px-2 py-1', className)}>
      <img src="/logo.jpeg" alt="Kanan.co" className="h-full w-auto object-contain" />
    </div>
  );
}
