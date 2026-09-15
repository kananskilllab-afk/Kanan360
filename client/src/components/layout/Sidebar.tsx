import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  Map,
  BarChart3,
  ScrollText,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store/uiStore';
import { BrandLogo } from '@/components/common/BrandLogo';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/branches', label: 'Branches', icon: Building2 },
  { to: '/admin/employees', label: 'Employees', icon: Users },
  { to: '/admin/floor-plans', label: 'Floor Plans', icon: Map },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/audit-log', label: 'Audit Log', icon: ScrollText },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
  );

export function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  return (
    <aside
      className={cn(
        'flex h-screen shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground border-sidebar-border transition-[width] duration-200',
        collapsed ? 'w-[68px]' : 'w-60',
      )}
    >
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-4">
        {collapsed ? (
          <BrandLogo variant="mark" className="h-9 w-9 shrink-0" />
        ) : (
          <div className="min-w-0 leading-tight">
            <BrandLogo className="h-8" />
            <div className="mt-1 truncate text-[11px] text-sidebar-foreground/60">Super Admin Console</div>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2.5">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={navLinkClass} title={collapsed ? item.label : undefined}>
            <item.icon className="h-4.5 w-4.5 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-2.5">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
          title={collapsed ? 'View public site' : undefined}
        >
          <Globe className="h-4.5 w-4.5 shrink-0" />
          {!collapsed && <span className="truncate">View public site</span>}
        </a>
        <NavLink to="/admin/settings" className={navLinkClass} title={collapsed ? 'Settings' : undefined}>
          <Settings className="h-4.5 w-4.5 shrink-0" />
          {!collapsed && <span className="truncate">Settings</span>}
        </NavLink>
        <button
          onClick={toggleSidebar}
          className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
        >
          {collapsed ? <ChevronsRight className="h-4.5 w-4.5" /> : <ChevronsLeft className="h-4.5 w-4.5" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
