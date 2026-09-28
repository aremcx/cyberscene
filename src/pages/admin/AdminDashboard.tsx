/**
 * Admin Dashboard
 * Protected admin panel showing system statistics and management tools.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../components/auth/AuthProvider';
import { db } from '../../db/store';
import { getSessionStats, getUserSessions } from '../../services/authService';
import { getRateLimitStats } from '../../lib/rateLimiter';
import { getLogBuffer } from '../../lib/logger';
import { Card, Badge, Button } from '../../components/ui';
import { hasPermission, PERMISSIONS } from '../../lib/authorization';

export function AdminDashboard() {
  const { user, authContext } = useAuth();
  const [stats, setStats] = useState(db.getStats());
  const [sessionStats, setSessionStats] = useState(getSessionStats());
  const [rateLimitStats, setRateLimitStats] = useState(getRateLimitStats());
  const [recentLogs, setRecentLogs] = useState(getLogBuffer().slice(-20));
  const [userSessions, setUserSessions] = useState<ReturnType<typeof getUserSessions>>([]);

  useEffect(() => {
    refresh();
  }, []);

  const refresh = () => {
    setStats(db.getStats());
    setSessionStats(getSessionStats());
    setRateLimitStats(getRateLimitStats());
    setRecentLogs(getLogBuffer().slice(-20));
    if (user) {
      setUserSessions(getUserSessions(user.id));
    }
  };

  const canManageUsers = hasPermission(authContext, PERMISSIONS.USERS_MANAGE);
  const canViewAudit = hasPermission(authContext, PERMISSIONS.SYSTEM_AUDIT);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">System overview and management</p>
        </div>
        <Button onClick={refresh} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Current User Info */}
      <Card className="mb-8">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Current Session</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-500">User</div>
              <div className="text-white font-medium">{user?.displayName}</div>
              <div className="text-xs text-gray-500">{user?.email}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Roles</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {authContext.roles.map(role => (
                  <Badge key={role} variant="info" size="sm">{role}</Badge>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Permissions</div>
              <div className="text-white font-medium">{authContext.permissions.length} granted</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Object.entries(stats).map(([key, value]) => (
          <Card key={key}>
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-400">{value}</div>
              <div className="text-xs text-gray-500 capitalize mt-1">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Session Management</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Sessions</span>
                <span className="text-white font-medium">{sessionStats.totalSessions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Active Sessions</span>
                <span className="text-emerald-400 font-medium">{sessionStats.activeSessions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Your Sessions</span>
                <span className="text-white font-medium">{userSessions.length}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Rate Limiting</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Tracked Keys</span>
                <span className="text-white font-medium">{rateLimitStats.totalEntries}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Currently Blocked</span>
                <span className={rateLimitStats.blockedEntries > 0 ? 'text-red-400 font-medium' : 'text-emerald-400 font-medium'}>
                  {rateLimitStats.blockedEntries}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Permissions List */}
      <Card className="mb-8">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Your Permissions</h2>
          <div className="flex flex-wrap gap-2">
            {authContext.permissions.map(perm => (
              <Badge key={perm} variant="outline" size="sm">{perm}</Badge>
            ))}
            {authContext.permissions.length === 0 && (
              <p className="text-gray-500 text-sm">No permissions assigned</p>
            )}
          </div>
        </div>
      </Card>

      {/* Audit Logs */}
      {canViewAudit && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Recent Audit Logs</h2>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {[...recentLogs].reverse().map((entry, i) => (
                <div key={i} className="flex items-start gap-3 py-1.5 border-b border-gray-800/50 last:border-0 text-sm">
                  <span className="text-xs text-gray-600 font-mono whitespace-nowrap">
                    {entry.timestamp.slice(11, 19)}
                  </span>
                  <Badge
                    variant={
                      entry.level === 'ERROR' ? 'danger' :
                      entry.level === 'WARN' ? 'warning' :
                      entry.level === 'INFO' ? 'info' : 'default'
                    }
                    size="sm"
                  >
                    {entry.level}
                  </Badge>
                  <span className="text-xs text-emerald-400/70 font-mono">[{entry.module}]</span>
                  <span className="text-gray-300 flex-1">{entry.message}</span>
                </div>
              ))}
              {recentLogs.length === 0 && (
                <p className="text-gray-500 text-sm">No audit logs yet</p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Quick Links */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Links</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickLink label="Articles" href="/admin/articles" icon="📝" accessible={true} />
          <QuickLink label="Review Queue" href="/admin/review" icon="👀" accessible={hasPermission(authContext, PERMISSIONS.CONTENT_PUBLISH)} />
          <QuickLink label="Categories" href="/admin/categories" icon="📁" accessible={true} />
          <QuickLink label="Tags" href="/admin/tags" icon="🏷️" accessible={true} />
          <QuickLink label="Authors" href="/admin/authors" icon="✍️" accessible={canManageUsers} />
          <QuickLink label="Manage Users" href="/admin/users" icon="👥" accessible={canManageUsers} />
          <QuickLink label="System Settings" href="/admin/settings" icon="⚙️" accessible={hasPermission(authContext, PERMISSIONS.SYSTEM_SETTINGS)} />
          <QuickLink label="Audit Logs" href="/admin/audit" icon="📋" accessible={canViewAudit} />
        </div>
      </div>
    </div>
  );
}

function QuickLink({ label, href, icon, accessible }: { label: string; href: string; icon: string; accessible: boolean }) {
  if (!accessible) return null;
  return (
    <Link
      to={href}
      className="p-4 rounded-lg border border-gray-800 bg-gray-900/30 hover:border-emerald-500/30 hover:bg-gray-800/50 transition-all duration-300 text-center group"
    >
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">{label}</div>
    </Link>
  );
}
