import { useEffect, useState } from 'react';
import { ArticleCard } from '../components/content/ArticleCard';
import { Tabs, Pagination, EmptyState, ArticleCardSkeleton } from '../components/ui';
import * as articleService from '../services/articles';
import { ArticleStatus, ContentType, type ArticleFilters } from '../db/schema';
import type { ArticleWithRelations } from '../services/articles';
import type { PaginatedResult } from '../lib/pagination';

interface ContentListPageProps {
  title: string;
  description: string;
  contentType?: ContentType;
  additionalFilters?: ArticleFilters;
  icon?: string;
}

export function ContentListPage({ title, description, contentType, additionalFilters, icon }: ContentListPageProps) {
  const [articles, setArticles] = useState<PaginatedResult<ArticleWithRelations> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadArticles();
  }, [currentPage, activeTab, contentType]);

  const loadArticles = () => {
    setIsLoading(true);

    const filters: ArticleFilters = {
      status: ArticleStatus.PUBLISHED,
      ...additionalFilters,
    };

    if (contentType) {
      filters.contentType = contentType;
    }

    if (activeTab === 'featured') {
      filters.isFeatured = true;
    }

    const result = articleService.listArticles(
      { page: currentPage, pageSize: 12 },
      { sortBy: 'publishedAt', sortOrder: 'desc' },
      filters
    );

    setArticles(result);
    setIsLoading(false);
  };

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'featured', label: 'Featured' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          {icon && <span className="text-3xl">{icon}</span>}
          <h1 className="text-3xl font-bold text-white">{title}</h1>
        </div>
        <p className="text-gray-400">{description}</p>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-8" />

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      ) : articles && articles.data.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {articles.data.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={articles.meta.page}
            totalPages={articles.meta.totalPages}
            onPageChange={setCurrentPage}
          />

          {/* Results info */}
          <div className="mt-4 text-center text-sm text-gray-500">
            Showing {articles.data.length} of {articles.meta.total} articles
          </div>
        </>
      ) : (
        <EmptyState
          icon="📝"
          title={`No ${title.toLowerCase()} found`}
          description="Check back soon for new content."
        />
      )}
    </div>
  );
}
