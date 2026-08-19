import React, { useState, useEffect } from 'react';
import { AdminLayout, type AdminRouteKey } from '../admin/layout/AdminLayout';
import { AdminDashboardPage } from '../admin/pages/AdminDashboardPage';
import { AdminProjectsPage } from '../admin/projects/pages/AdminProjectsPage';
import { AdminMediaPage } from '../admin/media/pages/AdminMediaPage';
import { AdminContentPage } from '../admin/content/pages/AdminContentPage';
import { AdminActivityPage } from '../admin/activity/pages/AdminActivityPage';
import { AdminPlaceholderPage } from '../admin/pages/AdminPlaceholderPage';

interface AdminShellProps {
  onNavigateHome?: () => void;
  onLogout?: () => void;
}

const getRouteKeyFromPath = (path: string): AdminRouteKey => {
  const lower = path.toLowerCase();
  if (lower.includes('/admin/projects')) return 'projects';
  if (lower.includes('/admin/content')) return 'content';
  if (lower.includes('/admin/media')) return 'media';
  if (lower.includes('/admin/activity')) return 'activity';
  if (lower.includes('/admin/settings')) return 'settings';
  return 'overview';
};

const getPathFromRouteKey = (key: AdminRouteKey): string => {
  switch (key) {
    case 'projects':
      return '/admin/projects';
    case 'content':
      return '/admin/content';
    case 'media':
      return '/admin/media';
    case 'activity':
      return '/admin/activity';
    case 'settings':
      return '/admin/settings';
    default:
      return '/admin';
  }
};

export const AdminShell: React.FC<AdminShellProps> = ({ onNavigateHome, onLogout }) => {
  const [currentRoute, setCurrentRoute] = useState<AdminRouteKey>(() =>
    getRouteKeyFromPath(window.location.pathname)
  );

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(getRouteKeyFromPath(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (route: AdminRouteKey) => {
    setCurrentRoute(route);
    const newPath = getPathFromRouteKey(route);
    window.history.pushState({}, '', newPath);
  };

  const handleNavigateByTabPath = (path: string) => {
    const key = getRouteKeyFromPath(path);
    handleNavigate(key);
  };

  return (
    <AdminLayout
      currentRoute={currentRoute}
      onNavigate={handleNavigate}
      onNavigateHome={onNavigateHome}
      onLogout={onLogout}
    >
      {currentRoute === 'overview' && (
        <AdminDashboardPage onNavigateTab={handleNavigateByTabPath} />
      )}
      {currentRoute === 'projects' && <AdminProjectsPage />}
      {currentRoute === 'media' && <AdminMediaPage />}
      {currentRoute === 'content' && <AdminContentPage />}
      {currentRoute === 'activity' && <AdminActivityPage />}
      {currentRoute !== 'overview' &&
        currentRoute !== 'projects' &&
        currentRoute !== 'media' &&
        currentRoute !== 'content' &&
        currentRoute !== 'activity' && (
          <AdminPlaceholderPage
            moduleKey={currentRoute as 'settings'}
            onNavigateOverview={() => handleNavigate('overview')}
          />
        )}
    </AdminLayout>
  );
};
