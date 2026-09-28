import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../components/auth/AuthProvider';
import { Button, Badge, Input, Select, Pagination, EmptyState, Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui';
import { db } from '../../db/store';
import { ArticleStatus, ContentType } from '../../db/schema';
import { formatRelativeTime } from '../../lib/utils';
import { hasPermission, PERMISSIONS } from '../../lib/authorization';
import { ROUTES } from '../../config/routes';
import type { ArticleWithRelations } from '../../services/articles';
import * as articleService from '../../services/articles';

export function AdminArticles() {
  const { authContext } = useAuth();
  const [articles, setArticles] = useState<ArticleWithRelations[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [contentTypeFilter, setContentTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const pageSize = 20;

  useEffect(() => {
    loadArticles();
  }, [currentPage, searchQuery, statusFilter, contentTypeFilter, sortBy, sortOrder]);

  const loadArticles = () => {
    const filters: any = {};
    
    if (statusFilter !== 'all') {
      filters.status = statusFilter;
    }
    if (contentTypeFilter !== 'all') {
      filters.contentType = contentTypeFilter;
    }
    if (searchQuery) {
      filters.search = searchQuery;
    }

    const result = articleService.listArticles(
      { page: currentPage, pageSize },
      { sortBy, sortOrder },
      filters
    );

    setArticles(result.data);
    setTotal(result.meta.total);
  };

  const canCreate = hasPermission(authContext, PERMISSIONS.CONTENT_CREATE);
  const canDelete = hasPermission(authContext, PERMISSIONS.CONTENT_DELETE_ANY);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this article?')) {
      try {
        articleService.deleteArticle(id, authContext);
        loadArticles();
      } catch (error) {
        alert('Failed to delete article');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'outline'> = {
      [ArticleStatus.PUBLISHED]: 'success',
      [ArticleStatus.DRAFT]: 'outline',
      [ArticleStatus.PENDING_REVIEW]: 'warning',
      [ArticleStatus.APPROVED]: 'info',
      [ArticleStatus.REJECTED]: 'danger',
      [ArticleStatus.ARCHIVED]: 'outline',
    };
    return (
      <Badge variant={variants[status] || 'outline'} size="sm">
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Articles</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage all articles across the platform
          </p>
        </div>
        {canCreate && (
          <Link to="/admin/articles/new">
            <Button>Create Article</Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Input
          placeholder="Search articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: ArticleStatus.DRAFT, label: 'Draft' },
            { value: ArticleStatus.PENDING_REVIEW, label: 'Pending Review' },
            { value: ArticleStatus.APPROVED, label: 'Approved' },
            { value: ArticleStatus.PUBLISHED, label: 'Published' },
            { value: ArticleStatus.REJECTED, label: 'Rejected' },
            { value: ArticleStatus.ARCHIVED, label: 'Archived' },
          ]}
        />
        <Select
          value={contentTypeFilter}
          onChange={(e) => setContentTypeFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Types' },
            { value: ContentType.ARTICLE, label: 'Article' },
            { value: ContentType.TUTORIAL, label: 'Tutorial' },
            { value: ContentType.NEWS, label: 'News' },
            { value: ContentType.RESEARCH, label: 'Research' },
            { value: ContentType.THREAT_INTEL, label: 'Threat Report' },
            { value: ContentType.CASE_STUDY, label: 'Case Study' },
            { value: ContentType.TOOL_REVIEW, label: 'Tool Review' },
          ]}
        />
        <Select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split('-');
            setSortBy(field);
            setSortOrder(order as 'asc' | 'desc');
          }}
          options={[
            { value: 'updatedAt-desc', label: 'Recently Updated' },
            { value: 'createdAt-desc', label: 'Recently Created' },
            { value: 'publishedAt-desc', label: 'Recently Published' },
            { value: 'title-asc', label: 'Title (A-Z)' },
            { value: 'viewCount-desc', label: 'Most Viewed' },
          ]}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-lg border border-gray-800 bg-gray-900/30">
          <div className="text-2xl font-bold text-white">{total}</div>
          <div className="text-sm text-gray-400">Total Articles</div>
        </div>
        <div className="p-4 rounded-lg border border-gray-800 bg-gray-900/30">
          <div className="text-2xl font-bold text-emerald-400">
            {articles.filter(a => a.status === ArticleStatus.PUBLISHED).length}
          </div>
          <div className="text-sm text-gray-400">Published</div>
        </div>
        <div className="p-4 rounded-lg border border-gray-800 bg-gray-900/30">
          <div className="text-2xl font-bold text-amber-400">
            {articles.filter(a => a.status === ArticleStatus.PENDING_REVIEW).length}
          </div>
          <div className="text-sm text-gray-400">Pending Review</div>
        </div>
        <div className="p-4 rounded-lg border border-gray-800 bg-gray-900/30">
          <div className="text-2xl font-bold text-gray-400">
            {articles.filter(a => a.status === ArticleStatus.DRAFT).length}
          </div>
          <div className="text-sm text-gray-400">Drafts</div>
        </div>
      </div>

      {/* Articles Table */}
      {articles.length > 0 ? (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Title</TableHeader>
                <TableHeader>Author</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Type</TableHeader>
                <TableHeader>Views</TableHeader>
                <TableHeader>Updated</TableHeader>
                <TableHeader>Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-white">{article.title}</div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">
                        {article.excerpt}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-300">{article.author?.displayName}</div>
                  </TableCell>
                  <TableCell>{getStatusBadge(article.status)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" size="sm">
                      {article.contentType.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-300">{article.viewCount}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-400">
                      {formatRelativeTime(article.updatedAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link to={`/admin/articles/${article.id}/edit`}>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </Link>
                      {canDelete && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(article.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon="📝"
          title="No articles found"
          description={searchQuery || statusFilter !== 'all' || contentTypeFilter !== 'all'
            ? 'Try adjusting your filters'
            : 'Create your first article to get started'
          }
          action={
            canCreate && !searchQuery && statusFilter === 'all' && contentTypeFilter === 'all' ? (
              <Link to="/admin/articles/new">
                <Button>Create Article</Button>
              </Link>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
