/**
 * Database Demo Page
 * Demonstrates all backend functionality: CRUD, pagination,
 * authorization, validation, and audit logging.
 */

import { useState, useEffect } from 'react';
import { initializeDatabase, getDatabaseStatus, resetDatabase, reseedDatabase, DEMO_CREDENTIALS } from '../db';
import { db } from '../db/store';
import * as articleService from '../services/articles';
import * as userService from '../services/users';
import { buildAuthContext, PERMISSIONS } from '../lib/authorization';
import { getLogBuffer, clearLogBuffer } from '../lib/logger';
import { validators, validatePasswordStrength } from '../lib/validation';
import { ArticleStatus, ContentType } from '../db/schema';
import { Button, Badge, Card } from '../components/ui';

type Tab = 'overview' | 'crud' | 'auth' | 'validation' | 'logs';

export function DatabaseDemoPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [dbStatus, setDbStatus] = useState(getDatabaseStatus());
  const [logs, setLogs] = useState(getLogBuffer());

  useEffect(() => {
    const init = async () => {
      await initializeDatabase();
      setDbStatus(getDatabaseStatus());
      setLogs(getLogBuffer());
    };
    init();
  }, []);

  const refresh = () => {
    setDbStatus(getDatabaseStatus());
    setLogs(getLogBuffer());
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'crud', label: 'CRUD Operations' },
    { id: 'auth', label: 'Authorization' },
    { id: 'validation', label: 'Validation' },
    { id: 'logs', label: 'Audit Logs' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Database & Backend Demo</h1>
        <p className="text-gray-400">
          Interactive demonstration of the database layer, service patterns, and backend functionality.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-800 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab status={dbStatus} onReset={refresh} onReseed={refresh} />}
      {activeTab === 'crud' && <CrudTab onRefresh={refresh} />}
      {activeTab === 'auth' && <AuthTab />}
      {activeTab === 'validation' && <ValidationTab />}
      {activeTab === 'logs' && <LogsTab logs={logs} onClear={() => { clearLogBuffer(); setLogs([]); }} onRefresh={refresh} />}
    </div>
  );
}

// ============================================
// OVERVIEW TAB
// ============================================

function OverviewTab({ status, onReset, onReseed }: { status: ReturnType<typeof getDatabaseStatus>; onReset: () => void; onReseed: () => void }) {
  return (
    <div className="space-y-8">
      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(status.stats).map(([key, value]) => (
          <div key={key} className="p-4 rounded-xl border border-gray-800 bg-gray-900/30">
            <div className="text-2xl font-bold text-emerald-400">{value}</div>
            <div className="text-sm text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => { resetDatabase(); onReset(); }} variant="outline">
          Reset Database
        </Button>
        <Button onClick={async () => { await reseedDatabase(); onReseed(); }}>
          Re-seed Database
        </Button>
      </div>

      {/* Demo Credentials */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Demo Credentials</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Email</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Password</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Role</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_CREDENTIALS.map((cred) => (
                  <tr key={cred.email} className="border-b border-gray-800">
                    <td className="py-2 px-3 text-gray-300 font-mono text-xs">{cred.email}</td>
                    <td className="py-2 px-3 text-gray-400 font-mono text-xs">{cred.password}</td>
                    <td className="py-2 px-3"><Badge variant="info">{cred.role}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Schema Info */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Database Schema</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['users', 'roles', 'permissions', 'user_roles', 'role_permissions', 'articles', 'categories', 'tags', 'article_tags', 'comments', 'bookmarks', 'notifications', 'audit_logs'].map((table) => (
              <div key={table} className="px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-sm text-gray-300 font-mono">
                {table}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ============================================
// CRUD TAB
// ============================================

function CrudTab({ onRefresh }: { onRefresh: () => void }) {
  const [result, setResult] = useState<string>('');
  const [articles, setArticles] = useState<ReturnType<typeof articleService.listArticles> | null>(null);

  useEffect(() => {
    setArticles(articleService.listArticles({ page: 1, pageSize: 5 }));
  }, []);

  // Create article context (as editor)
  const editorUser = db.getUserByEmail('editor@cybervault.dev');
  const editorCtx = editorUser ? buildAuthContext(editorUser.id) : { userId: null, roles: [], permissions: [] };

  // Regular user context
  const regularUser = db.getUserByEmail('user@cybervault.dev');
  const regularCtx = regularUser ? buildAuthContext(regularUser.id) : { userId: null, roles: [], permissions: [] };

  const runCrudTest = () => {
    try {
      let output = '=== CRUD TEST RESULTS ===\n\n';

      // 1. LIST
      output += '1. LIST ARTICLES (page 1, pageSize 3):\n';
      const listed = articleService.listArticles({ page: 1, pageSize: 3 });
      output += `   Found ${listed.meta.total} articles, showing ${listed.data.length}\n`;
      output += `   Page ${listed.meta.page}/${listed.meta.totalPages}\n`;
      listed.data.forEach(a => output += `   - ${a.title} [${a.status}]\n`);
      output += '\n';

      // 2. GET BY SLUG
      output += '2. GET BY SLUG:\n';
      const bySlug = articleService.getArticleBySlug('understanding-ransomware-attack-chains-2024');
      output += `   Found: ${bySlug?.title}\n`;
      output += `   Author: ${bySlug?.author?.displayName}\n`;
      output += `   Tags: ${bySlug?.tags.map(t => t.name).join(', ')}\n`;
      output += `   Comments: ${bySlug?.commentCount}\n\n`;

      // 3. CREATE (as editor)
      output += '3. CREATE ARTICLE (as Editor):\n';
      const newArticle = articleService.createArticle({
        slug: 'test-crud-article-' + Date.now(),
        title: 'Test Article Created via CRUD Demo',
        excerpt: 'This article was created as part of the automated CRUD test to verify the create operation works correctly with validation.',
        content: 'This is the full content of the test article. It contains enough text to pass the minimum content length validation requirement of 100 characters. The article service validates all inputs before creating the record in the database, ensuring data integrity and consistency across the platform.',
        contentType: ContentType.ARTICLE,
        status: ArticleStatus.DRAFT,
        authorId: editorCtx.userId!,
        createdById: editorCtx.userId!,
        updatedById: editorCtx.userId!,
      }, editorCtx);
      output += `   Created: ${newArticle.title} (ID: ${newArticle.id.slice(0, 8)}...)\n\n`;

      // 4. UPDATE
      output += '4. UPDATE ARTICLE:\n';
      const updated = articleService.updateArticle(newArticle.id, {
        title: 'Test Article - UPDATED',
        status: ArticleStatus.PENDING_REVIEW,
        updatedById: editorCtx.userId!,
      }, editorCtx);
      output += `   Updated title: ${updated.title}\n`;
      output += `   New status: ${updated.status}\n\n`;

      // 5. PUBLISH
      output += '5. PUBLISH ARTICLE:\n';
      const published = articleService.publishArticle(newArticle.id, editorCtx);
      output += `   Status: ${published.status}\n`;
      output += `   Published at: ${published.publishedAt}\n\n`;

      // 6. DELETE
      output += '6. DELETE ARTICLE:\n';
      articleService.deleteArticle(newArticle.id, editorCtx);
      const deleted = articleService.getArticleById(newArticle.id);
      output += `   Deleted. Exists after delete: ${deleted !== null}\n\n`;

      // 7. AUTHORIZATION CHECK
      output += '7. AUTHORIZATION CHECK (regular user tries to create):\n';
      try {
        articleService.createArticle({
          slug: 'should-fail',
          title: 'This Should Fail',
          excerpt: 'Too short',
          content: 'Short',
          authorId: regularCtx.userId!,
          createdById: regularCtx.userId!,
          updatedById: regularCtx.userId!,
        }, regularCtx);
        output += '   ERROR: Should have been denied!\n';
      } catch (err: unknown) {
        const error = err as { message: string };
        output += `   Correctly denied: ${error.message}\n`;
      }

      setResult(output);
      onRefresh();
    } catch (err: unknown) {
      const error = err as { message: string };
      setResult(`ERROR: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button onClick={runCrudTest}>Run CRUD Test</Button>
        <Button onClick={() => { setArticles(articleService.listArticles({ page: 1, pageSize: 5 })); }} variant="outline">
          Refresh Articles
        </Button>
      </div>

      {/* Articles List */}
      {articles && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Articles ({articles.meta.total} total)
            </h3>
            <div className="space-y-3">
              {articles.data.map((article) => (
                <div key={article.id} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-white truncate">{article.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">by {article.author?.displayName}</span>
                        <Badge variant={article.status === 'published' ? 'success' : article.status === 'draft' ? 'outline' : 'warning'}>
                          {article.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">{article.viewCount} views</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-sm text-gray-500">
              Page {articles.meta.page} of {articles.meta.totalPages} • {articles.meta.total} total
            </div>
          </div>
        </Card>
      )}

      {/* Test Results */}
      {result && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Test Results</h3>
            <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap bg-gray-900/50 rounded-lg p-4 border border-gray-700/50 overflow-x-auto">
              {result}
            </pre>
          </div>
        </Card>
      )}
    </div>
  );
}

// ============================================
// AUTH TAB
// ============================================

function AuthTab() {
  const [authResult, setAuthResult] = useState('');

  const runAuthTest = () => {
    let output = '=== AUTHORIZATION TEST ===\n\n';

    // Test different user contexts
    const users = [
      { email: 'superadmin@cybervault.dev', label: 'Super Admin' },
      { email: 'admin@cybervault.dev', label: 'Admin' },
      { email: 'editor@cybervault.dev', label: 'Editor' },
      { email: 'author@cybervault.dev', label: 'Author' },
      { email: 'contributor@cybervault.dev', label: 'Contributor' },
      { email: 'moderator@cybervault.dev', label: 'Moderator' },
      { email: 'user@cybervault.dev', label: 'Regular User' },
    ];

    for (const u of users) {
      const user = db.getUserByEmail(u.email);
      if (!user) continue;
      const ctx = buildAuthContext(user.id);
      output += `${u.label} (${u.email}):\n`;
      output += `  Roles: ${ctx.roles.join(', ') || 'none'}\n`;
      output += `  Permissions: ${ctx.permissions.length} granted\n`;
      output += `  Can publish: ${ctx.permissions.includes(PERMISSIONS.CONTENT_PUBLISH) ? '✓' : '✗'}\n`;
      output += `  Can manage users: ${ctx.permissions.includes(PERMISSIONS.USERS_MANAGE) ? '✓' : '✗'}\n`;
      output += `  Can moderate: ${ctx.permissions.includes(PERMISSIONS.COMMUNITY_MODERATE) ? '✓' : '✗'}\n`;
      output += `  System admin: ${ctx.permissions.includes(PERMISSIONS.SYSTEM_ADMIN) ? '✓' : '✗'}\n\n`;
    }

    // Test ownership checks
    output += '--- OWNERSHIP CHECKS ---\n';
    const authorUser = db.getUserByEmail('author@cybervault.dev');
    const regularUser = db.getUserByEmail('user@cybervault.dev');
    if (authorUser && regularUser) {
      const authorCtx = buildAuthContext(authorUser.id);
      const regularCtx = buildAuthContext(regularUser.id);

      // Get first article
      const articles = db.listArticles({ page: 1, pageSize: 1 });
      if (articles.data.length > 0) {
        const article = articles.data[0];
        output += `Article author: ${article.authorId}\n`;
        output += `Author can edit own: ${authorCtx.userId === article.authorId ? '✓' : '✗'}\n`;
        output += `Regular user can edit: ${regularCtx.userId === article.authorId ? '✓' : '✗'}\n`;
      }
    }

    setAuthResult(output);
  };

  return (
    <div className="space-y-6">
      <Button onClick={runAuthTest}>Run Authorization Test</Button>

      {authResult && (
        <Card>
          <div className="p-6">
            <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap bg-gray-900/50 rounded-lg p-4 border border-gray-700/50 overflow-x-auto">
              {authResult}
            </pre>
          </div>
        </Card>
      )}
    </div>
  );
}

// ============================================
// VALIDATION TAB
// ============================================

function ValidationTab() {
  const [results, setResults] = useState('');

  const runValidationTest = () => {
    let output = '=== VALIDATION TEST ===\n\n';

    // Test article validation
    output += '1. ARTICLE VALIDATION:\n';

    const validArticle = {
      title: 'Valid Article Title That Is Long Enough',
      slug: 'valid-article-title',
      excerpt: 'This is a valid excerpt that is long enough to pass the minimum length check.',
      content: 'This is valid content that meets the minimum length requirement of one hundred characters. It needs to be substantial enough to demonstrate the validation system working correctly.',
      authorId: '550e8400-e29b-41d4-a716-446655440000',
    };

    const validResult = validators.createArticle.validate(validArticle as Parameters<typeof validators.createArticle.validate>[0]);
    output += `   Valid article: ${validResult.isValid ? '✓ PASS' : '✗ FAIL'}\n`;

    const invalidArticle = {
      title: 'Short',
      slug: 'INVALID SLUG!',
      excerpt: 'Too short',
      content: 'X',
      authorId: 'not-a-uuid',
    };

    const invalidResult = validators.createArticle.validate(invalidArticle as Parameters<typeof validators.createArticle.validate>[0]);
    output += `   Invalid article: ${!invalidResult.isValid ? '✓ CORRECTLY REJECTED' : '✗ SHOULD HAVE FAILED'}\n`;
    if (!invalidResult.isValid) {
      Object.entries(invalidResult.errors).forEach(([field, msgs]) => {
        output += `     ${field}: ${(msgs as string[]).join(', ')}\n`;
      });
    }

    // Test user validation
    output += '\n2. USER VALIDATION:\n';
    const validUser = { email: 'test@example.com', displayName: 'Test User', password: 'Strong@123' };
    const userValid = validators.createUser.validate(validUser as Parameters<typeof validators.createUser.validate>[0]);
    output += `   Valid user: ${userValid.isValid ? '✓ PASS' : '✗ FAIL'}\n`;

    const invalidUser = { email: 'not-an-email', displayName: 'A', password: 'weak' };
    const userInvalid = validators.createUser.validate(invalidUser as Parameters<typeof validators.createUser.validate>[0]);
    output += `   Invalid user: ${!userInvalid.isValid ? '✓ CORRECTLY REJECTED' : '✗ SHOULD HAVE FAILED'}\n`;
    if (!userInvalid.isValid) {
      Object.entries(userInvalid.errors).forEach(([field, msgs]) => {
        output += `     ${field}: ${(msgs as string[]).join(', ')}\n`;
      });
    }

    // Test password strength
    output += '\n3. PASSWORD STRENGTH:\n';
    const passwords = ['weak', 'Medium123', 'Strong@1234', 'V3ryStr0ng!Pass#2024'];
    for (const pw of passwords) {
      const strength = validatePasswordStrength(pw);
      output += `   "${pw}" → ${strength.strength} ${strength.isValid ? '✓' : `(${strength.issues.join(', ')})`}\n`;
    }

    setResults(output);
  };

  return (
    <div className="space-y-6">
      <Button onClick={runValidationTest}>Run Validation Test</Button>

      {results && (
        <Card>
          <div className="p-6">
            <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap bg-gray-900/50 rounded-lg p-4 border border-gray-700/50 overflow-x-auto">
              {results}
            </pre>
          </div>
        </Card>
      )}
    </div>
  );
}

// ============================================
// LOGS TAB
// ============================================

function LogsTab({ logs, onClear, onRefresh }: { logs: ReturnType<typeof getLogBuffer>; onClear: () => void; onRefresh: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button onClick={onRefresh} variant="outline">Refresh Logs</Button>
        <Button onClick={onClear} variant="ghost">Clear Logs</Button>
        <span className="text-sm text-gray-500">{logs.length} entries</span>
      </div>

      <Card>
        <div className="p-6">
          <div className="space-y-1 max-h-[600px] overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-sm">No log entries. Run some operations to generate logs.</p>
            ) : (
              [...logs].reverse().map((entry, i) => (
                <div key={i} className="flex items-start gap-3 py-1.5 border-b border-gray-800/50 last:border-0">
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
                  <span className="text-sm text-gray-300 flex-1">{entry.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
