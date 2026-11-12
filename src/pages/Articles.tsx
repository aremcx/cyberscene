import { useState, useEffect } from 'react';
import { Badge, Card } from '../components/ui';
import * as articleService from '../services/articles';
import type { PaginatedResult } from '../lib/pagination';
import type { ArticleWithRelations } from '../services/articles';
import { formatRelativeTime } from '../lib/utils';
import { ArticleStatus, type ArticleFilters } from '../db/schema';

export function ArticlesPage() {
  const [articles, setArticles] = useState<PaginatedResult<ArticleWithRelations> | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  useEffect(() => {
    loadArticles();
  }, [activeFilter]);

  const loadArticles = () => {
    let filters: ArticleFilters | undefined;
    if (activeFilter === 'published') {
      filters = { status: ArticleStatus.PUBLISHED };
    } else if (activeFilter === 'draft') {
      filters = { status: ArticleStatus.DRAFT };
    } else if (activeFilter === 'featured') {
      filters = { isFeatured: true };
    }
    const result = articleService.listArticles({ page: 1, pageSize: 12 }, { sortBy: 'publishedAt', sortOrder: 'desc' }, filters);
    setArticles(result);
  };

  const filters = [
    { label: 'All', value: 'all' },
    { label: 'Published', value: 'published' },
    { label: 'Drafts', value: 'draft' },
    { label: 'Featured', value: 'featured' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Articles</h1>
        <p className="text-gray-400">
          In-depth cybersecurity articles, tutorials, and analysis from industry experts.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === f.value
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-gray-400 border border-gray-700 hover:border-gray-600 hover:text-gray-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      {articles && articles.data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.data.map((article) => (
            <Card key={article.id} hover>
              <div className="p-6">
                {/* Category & Type */}
                <div className="flex items-center gap-2 mb-3">
                  {article.category && (
                    <Badge variant="info" size="sm">{article.category.name}</Badge>
                  )}
                  {article.isFeatured && (
                    <Badge variant="warning" size="sm">Featured</Badge>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-emerald-400 transition-colors">
                  {article.title}
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-gray-400 mb-4 line-clamp-3">
                  {article.excerpt}
                </p>

                {/* Tags */}
                {article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {article.tags.slice(0, 3).map((tag) => (
                      <span key={tag.id} className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                        {tag.name}
                      </span>
                    ))}
                    {article.tags.length > 3 && (
                      <span className="text-xs text-gray-600">+{article.tags.length - 3}</span>
                    )}
                  </div>
                )}

                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-700/50">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-[10px] text-gray-400">
                      {article.author?.displayName.charAt(0)}
                    </div>
                    <span>{article.author?.displayName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>{article.readingTimeMinutes} min read</span>
                    {article.publishedAt && (
                      <span>{formatRelativeTime(article.publishedAt)}</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 rounded-xl border border-gray-800 bg-gray-900/30">
          <div className="text-5xl mb-4">📝</div>
          <h3 className="text-lg font-semibold text-white mb-2">No Articles Found</h3>
          <p className="text-gray-400">
            {activeFilter === 'all'
              ? 'No articles available yet.'
              : `No articles with status "${activeFilter}".`}
          </p>
        </div>
      )}

      {/* Pagination info */}
      {articles && articles.meta.total > 0 && (
        <div className="mt-8 text-center text-sm text-gray-500">
          Showing {articles.data.length} of {articles.meta.total} articles
        </div>
      )}
    </div>
  );
}
