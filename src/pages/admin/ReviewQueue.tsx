import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../components/auth/AuthProvider';
import { Button, Badge, EmptyState, Table, TableHead, TableBody, TableRow, TableHeader, TableCell, Alert } from '../../components/ui';
import { db } from '../../db/store';
import { ArticleStatus } from '../../db/schema';
import { formatRelativeTime } from '../../lib/utils';
import { hasPermission, PERMISSIONS } from '../../lib/authorization';
import * as articleService from '../../services/articles';
import type { ArticleWithRelations } from '../../services/articles';

export function ReviewQueue() {
  const { authContext } = useAuth();
  const [articles, setArticles] = useState<ArticleWithRelations[]>([]);
  const [actionMessage, setActionMessage] = useState('');

  const canPublish = hasPermission(authContext, PERMISSIONS.CONTENT_PUBLISH);
  const canEditAny = hasPermission(authContext, PERMISSIONS.CONTENT_EDIT_ANY);

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = () => {
    const result = articleService.listArticles(
      { page: 1, pageSize: 50 },
      { sortBy: 'updatedAt', sortOrder: 'desc' },
      { status: ArticleStatus.PENDING_REVIEW }
    );
    setArticles(result.data);
  };

  const handleApprove = (articleId: string) => {
    try {
      articleService.updateArticle(articleId, {
        status: ArticleStatus.APPROVED,
        updatedById: authContext.userId!,
      }, authContext);
      setActionMessage('Article approved successfully');
      loadQueue();
      setTimeout(() => setActionMessage(''), 3000);
    } catch (error) {
      setActionMessage('Failed to approve article');
    }
  };

  const handleReject = (articleId: string) => {
    try {
      articleService.updateArticle(articleId, {
        status: ArticleStatus.REJECTED,
        updatedById: authContext.userId!,
      }, authContext);
      setActionMessage('Article rejected');
      loadQueue();
      setTimeout(() => setActionMessage(''), 3000);
    } catch (error) {
      setActionMessage('Failed to reject article');
    }
  };

  const handlePublish = (articleId: string) => {
    try {
      articleService.publishArticle(articleId, authContext);
      setActionMessage('Article published successfully');
      loadQueue();
      setTimeout(() => setActionMessage(''), 3000);
    } catch (error) {
      setActionMessage('Failed to publish article');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Review Queue</h1>
        <p className="text-sm text-gray-400 mt-1">
          Review and approve submitted articles
        </p>
      </div>

      {actionMessage && (
        <Alert variant={actionMessage.includes('Failed') ? 'error' : 'success'} className="mb-6">
          {actionMessage}
        </Alert>
      )}

      {articles.length > 0 ? (
        <div className="space-y-4">
          {articles.map((article) => (
            <div
              key={article.id}
              className="p-5 rounded-xl border border-gray-800 bg-gray-900/30 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="warning" size="sm">Pending Review</Badge>
                    <Badge variant="outline" size="sm">{article.contentType.replace('_', ' ')}</Badge>
                    {article.difficulty && (
                      <Badge variant="info" size="sm">{article.difficulty}</Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">{article.title}</h3>
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">{article.excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>By {article.author?.displayName}</span>
                    <span>•</span>
                    <span>{article.readingTimeMinutes} min read</span>
                    <span>•</span>
                    <span>Updated {formatRelativeTime(article.updatedAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link to={`/admin/articles/${article.id}/edit`}>
                    <Button size="sm" variant="outline">Review</Button>
                  </Link>
                  {canPublish && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(article.id)}
                        className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApprove(article.id)}
                        className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                      >
                        Approve
                      </Button>
                      <Button size="sm" onClick={() => handlePublish(article.id)}>
                        Publish
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="✓"
          title="Review queue is empty"
          description="All articles have been reviewed. Great job!"
        />
      )}
    </div>
  );
}
