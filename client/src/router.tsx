import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AdminGate } from '@/components/auth/AdminGate';
import { PublicHome } from '@/pages/public/PublicHome';
import { PublicBranch } from '@/pages/public/PublicBranch';
import { DashboardPage } from '@/pages/DashboardPage';
import { BranchesPage } from '@/pages/BranchesPage';
import { BranchDetailPage } from '@/pages/BranchDetailPage';
import { EmployeesPage } from '@/pages/EmployeesPage';
import { FloorPlansPage } from '@/pages/FloorPlansPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { AuditLogPage } from '@/pages/AuditLogPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
  // Public 3D site — no account, no auth check, ever.
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <PublicHome /> },
      { path: '/branch/:code', element: <PublicBranch /> },
    ],
  },
  // Admin console — the only authenticated surface in the app.
  {
    path: '/admin',
    element: <AdminGate />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage />, handle: { title: 'Dashboard' } },
          { path: 'branches', element: <BranchesPage />, handle: { title: 'Branches' } },
          { path: 'branches/:branchId', element: <BranchDetailPage />, handle: { title: 'Branch' } },
          { path: 'employees', element: <EmployeesPage />, handle: { title: 'Employees' } },
          { path: 'floor-plans', element: <FloorPlansPage />, handle: { title: 'Floor Plans' } },
          { path: 'analytics', element: <AnalyticsPage />, handle: { title: 'Analytics' } },
          { path: 'audit-log', element: <AuditLogPage />, handle: { title: 'Audit Log' } },
          { path: 'settings', element: <SettingsPage />, handle: { title: 'Settings' } },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
