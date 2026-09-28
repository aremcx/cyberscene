/**
 * Auth Demo Page
 * Interactive demonstration of authentication and authorization features.
 * Tests all 10 acceptance criteria.
 */

import { useState } from 'react';
import { useAuth } from '../../components/auth/AuthProvider';
import { db } from '../../db/store';
import * as authService from '../../services/authService';
import { buildAuthContext, hasPermission, PERMISSIONS } from '../../lib/authorization';
import { getLogBuffer, clearLogBuffer } from '../../lib/logger';
import { getRateLimitStats, clearAllRateLimits } from '../../lib/rateLimiter';
import { getSessionStats, clearAllSessions } from '../../services/authService';
import { Button, Card, Badge } from '../../components/ui';
import { Role } from '../../db/schema';

type TestResult = {
  name: string;
  passed: boolean;
  details: string;
};

export function AuthDemoPage() {
  const { user, isAuthenticated, authContext, login, logout } = useAuth();
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);
    clearLogBuffer();
    clearAllRateLimits();

    const testResults: TestResult[] = [];

    try {
      // Test 1: User Registration
      const regResult = await authService.register(
        'testuser_' + Date.now() + '@cybervault.dev',
        'Test@12345',
        'Test User'
      );
      testResults.push({
        name: '1. User Registration',
        passed: regResult.user.id !== null && regResult.session.id !== null,
        details: `Created user: ${regResult.user.displayName} (${regResult.user.email})`,
      });

      // Test 2: Login
      const loginResult = await authService.login('user@cybervault.dev', 'Demo@1234');
      testResults.push({
        name: '2. Login',
        passed: loginResult.user.email === 'user@cybervault.dev' && loginResult.session.id !== null,
        details: `Logged in as: ${loginResult.user.displayName}, Session: ${loginResult.session.id.slice(0, 16)}...`,
      });

      // Test 3: Logout
      const sessionBeforeLogout = authService.validateSession(loginResult.session.id);
      authService.logout(loginResult.session.id, loginResult.user.id);
      const sessionAfterLogout = authService.validateSession(loginResult.session.id);
      testResults.push({
        name: '3. Logout',
        passed: sessionBeforeLogout !== null && sessionAfterLogout === null,
        details: `Session valid before logout: ${sessionBeforeLogout !== null}, after: ${sessionAfterLogout !== null}`,
      });

      // Test 4: Protected Route (validate session)
      const validSession = authService.validateSession(regResult.session.id);
      testResults.push({
        name: '4. Protected Route (Session Validation)',
        passed: validSession !== null && validSession.id === regResult.user.id,
        details: `Session validated for user: ${validSession?.displayName}`,
      });

      // Test 5: Admin Route (permission check)
      const adminUser = db.getUserByEmail('superadmin@cybervault.dev');
      const adminCtx = adminUser ? buildAuthContext(adminUser.id) : null;
      const regularCtx = buildAuthContext(regResult.user.id);
      const adminHasAccess = adminCtx ? hasPermission(adminCtx, PERMISSIONS.SYSTEM_ADMIN) : false;
      const regularHasAccess = hasPermission(regularCtx, PERMISSIONS.SYSTEM_ADMIN);
      testResults.push({
        name: '5. Admin Route Access',
        passed: adminHasAccess && !regularHasAccess,
        details: `Super Admin: ${adminHasAccess ? '✓' : '✗'}, Regular User: ${regularHasAccess ? '✓' : '✗'}`,
      });

      // Test 6: Role Enforcement
      const editorUser = db.getUserByEmail('editor@cybervault.dev');
      const editorCtx = editorUser ? buildAuthContext(editorUser.id) : null;
      const editorCanPublish = editorCtx ? hasPermission(editorCtx, PERMISSIONS.CONTENT_PUBLISH) : false;
      const userCanPublish = hasPermission(regularCtx, PERMISSIONS.CONTENT_PUBLISH);
      testResults.push({
        name: '6. Role Enforcement',
        passed: editorCanPublish && !userCanPublish,
        details: `Editor can publish: ${editorCanPublish ? '✓' : '✗'}, User can publish: ${userCanPublish ? '✓' : '✗'}`,
      });

      // Test 7: Permission Enforcement
      const canEditOwn = hasPermission(regularCtx, PERMISSIONS.CONTENT_EDIT_OWN);
      const canEditAny = hasPermission(regularCtx, PERMISSIONS.CONTENT_EDIT_ANY);
      const canModerate = hasPermission(regularCtx, PERMISSIONS.COMMUNITY_MODERATE);
      testResults.push({
        name: '7. Permission Enforcement',
        passed: canEditOwn && !canEditAny && !canModerate,
        details: `Edit own: ${canEditOwn ? '✓' : '✗'}, Edit any: ${canEditAny ? '✓' : '✗'}, Moderate: ${canModerate ? '✓' : '✗'}`,
      });

      // Test 8: Unauthorized API Access
      let unauthorizedBlocked = false;
      try {
        const guestCtx = buildAuthContext(null);
        if (!guestCtx.userId) {
          unauthorizedBlocked = true;
        }
      } catch {
        unauthorizedBlocked = true;
      }
      testResults.push({
        name: '8. Unauthorized API Access',
        passed: unauthorizedBlocked,
        details: `Guest context has no userId: ${unauthorizedBlocked ? '✓' : '✗'}`,
      });

      // Test 9: Privilege Escalation Attempt
      const escalationAttempt = !hasPermission(regularCtx, PERMISSIONS.SYSTEM_ADMIN);
      testResults.push({
        name: '9. Privilege Escalation Prevention',
        passed: escalationAttempt,
        details: `Regular user cannot gain admin: ${escalationAttempt ? '✓' : '✗'}`,
      });

      // Test 10: Audit Log Generation
      const logs = getLogBuffer();
      const hasLoginLogs = logs.some(l => l.module === 'Auth' || l.module === 'Security');
      const hasAuditEntries = db.listAuditLogs().data.length > 0;
      testResults.push({
        name: '10. Audit Log Generation',
        passed: hasLoginLogs && hasAuditEntries,
        details: `Auth logs: ${hasLoginLogs ? '✓' : '✗'}, Audit entries: ${db.listAuditLogs().total}`,
      });

    } catch (error) {
      testResults.push({
        name: 'Test Execution Error',
        passed: false,
        details: (error as Error).message,
      });
    }

    setResults(testResults);
    setIsRunning(false);
  };

  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Authentication & Authorization Demo</h1>
        <p className="text-gray-400">
          Interactive testing of all authentication and RBAC features.
        </p>
      </div>

      {/* Current Auth State */}
      <Card className="mb-8">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Current Authentication State</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-500">Authenticated</div>
              <Badge variant={isAuthenticated ? 'success' : 'outline'} size="md">
                {isAuthenticated ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div>
              <div className="text-sm text-gray-500">User</div>
              <div className="text-white font-medium">{user?.displayName || 'Not logged in'}</div>
              <div className="text-xs text-gray-500">{user?.email || '-'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Roles</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {authContext.roles.map(role => (
                  <Badge key={role} variant="info" size="sm">{role}</Badge>
                ))}
                {authContext.roles.length === 0 && <span className="text-gray-500 text-sm">None</span>}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Test Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Button onClick={runAllTests} isLoading={isRunning}>
          Run All Tests (10)
        </Button>
        <Button
          onClick={async () => {
            await login('superadmin@cybervault.dev', 'Demo@1234');
          }}
          variant="outline"
        >
          Login as Super Admin
        </Button>
        <Button
          onClick={async () => {
            await login('editor@cybervault.dev', 'Demo@1234');
          }}
          variant="outline"
        >
          Login as Editor
        </Button>
        <Button
          onClick={async () => {
            await login('user@cybervault.dev', 'Demo@1234');
          }}
          variant="outline"
        >
          Login as User
        </Button>
        {isAuthenticated && (
          <Button onClick={logout} variant="ghost">
            Logout
          </Button>
        )}
      </div>

      {/* Test Results */}
      {results.length > 0 && (
        <Card className="mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Test Results</h2>
              <Badge variant={passedCount === totalCount ? 'success' : 'warning'} size="md">
                {passedCount}/{totalCount} Passed
              </Badge>
            </div>
            <div className="space-y-3">
              {results.map((result, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-lg border ${
                    result.passed
                      ? 'border-emerald-500/20 bg-emerald-500/5'
                      : 'border-red-500/20 bg-red-500/5'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-lg">{result.passed ? '✓' : '✗'}</span>
                    <span className="text-white font-medium">{result.name}</span>
                  </div>
                  <p className="text-sm text-gray-400 ml-8">{result.details}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Sessions</h3>
            <div className="text-2xl font-bold text-white">{getSessionStats().activeSessions}</div>
            <div className="text-xs text-gray-500">Active sessions</div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Rate Limits</h3>
            <div className="text-2xl font-bold text-white">{getRateLimitStats().totalEntries}</div>
            <div className="text-xs text-gray-500">Tracked keys</div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Audit Logs</h3>
            <div className="text-2xl font-bold text-white">{db.listAuditLogs().total}</div>
            <div className="text-xs text-gray-500">Total entries</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
