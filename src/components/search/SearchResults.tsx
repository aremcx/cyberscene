import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { search, type SearchResult, type SearchFilters, type SearchableType } from '../../services/search';
import { db } from '../../db/store';
import { cn } from '../../lib/utils';
import { Badge } from '../ui';

export function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Get search params
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const type = searchParams.get('type') as SearchableType | null;
  const category = searchParams.get('category') || '';
  const tag = searchParams.get('tag') || '';

  // Get all categories and tags for filters
  const categories = db.listCategories();
  const tags = db.listTags();

  useEffect(() => {
    performSearch();
  }, [query, page, type, category, tag]);

  const performSearch = () => {
    setIsLoading(true);

    const filters: SearchFilters = {
      query: query || undefined,
      types: type ? [type] : undefined,
      categoryId: category || undefined,
      tagIds: tag ? [tag] : undefined,
    };

    const response = search(filters, page, 20);
    setResults(response.results);
    setTotal(response.total);
    setIsLoading(false);
  };

  const updateFilter = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to first page on filter change
    setSearchParams(newParams);
  };

  const getTypeIcon = (type: SearchableType) => {
    switch (type) {
      case 'article': return '📄';
      case 'author': return '👤';
      case 'category': return '📁';
      case 'tag': return '🏷️';
      default: return '📄';
    }
  };

  const getTypeLabel = (type: SearchableType) => {
    switch (type) {
      case 'article': return 'Article';
      case 'author': return 'Author';
      case 'category': return 'Category';
      case 'tag': return 'Tag';
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {query ? `Search results for "${query}"` : 'Search'}
          </h1>
          <p className="text-gray-400">
            {total} result{total !== 1 ? 's' : ''} found
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Content Type Filter */}
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Content Type</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => updateFilter('type', null)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                      !type ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-400 hover:bg-gray-800'
                    )}
                  >
                    All Types
                  </button>
                  {(['article', 'author', 'category', 'tag'] as SearchableType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => updateFilter('type', t)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2',
                        type === t ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-400 hover:bg-gray-800'
                      )}
                    >
                      <span>{getTypeIcon(t)}</span>
                      <span>{getTypeLabel(t)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Categories</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <button
                    onClick={() => updateFilter('category', null)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                      !category ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-400 hover:bg-gray-800'
                    )}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => updateFilter('category', cat.id)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                        category === cat.id ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-400 hover:bg-gray-800'
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags Filter */}
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                  {tags.slice(0, 20).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => updateFilter('tag', tag === t.id ? null : t.id)}
                      className={cn(
                        'px-3 py-1 rounded-full text-xs transition-colors',
                        tag === t.id
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      )}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-gray-900 rounded-lg p-6 animate-pulse">
                    <div className="h-6 bg-gray-800 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-800 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-800 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-xl font-semibold text-white mb-2">No results found</h2>
                <p className="text-gray-400">
                  Try adjusting your search terms or filters
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result) => (
                  <SearchResultCard key={`${result.type}-${result.id}`} result={result} />
                ))}

                {/* Pagination */}
                {total > 20 && (
                  <div className="flex justify-center gap-2 mt-8">
                    {page > 1 && (
                      <button
                        onClick={() => updateFilter('page', String(page - 1))}
                        className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Previous
                      </button>
                    )}
                    <span className="px-4 py-2 text-gray-400">
                      Page {page} of {Math.ceil(total / 20)}
                    </span>
                    {page < Math.ceil(total / 20) && (
                      <button
                        onClick={() => updateFilter('page', String(page + 1))}
                        className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Next
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchResultCard({ result }: { result: SearchResult }) {
  const getTypeColor = (type: SearchableType) => {
    switch (type) {
      case 'article': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'author': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'category': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'tag': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  // Extract metadata with proper typing
  const metadata = result.metadata as {
    contentType?: string;
    difficulty?: string;
    author?: { name: string };
    readingTime?: number;
    publishedAt?: string;
    articleCount?: number;
    tags?: Array<{ id: string; name: string }>;
  };

  return (
    <Link
      to={result.url}
      className="block bg-gray-900 rounded-lg p-6 hover:bg-gray-800/50 transition-colors border border-gray-800 hover:border-gray-700"
    >
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={getTypeColor(result.type)}>
              {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
            </Badge>
            {metadata.contentType && (
              <Badge variant="outline" size="sm">
                {metadata.contentType.replace('_', ' ')}
              </Badge>
            )}
            {metadata.difficulty && (
              <Badge variant="outline" size="sm">
                {metadata.difficulty}
              </Badge>
            )}
          </div>

          <h3
            className="text-xl font-semibold text-white mb-2 hover:text-emerald-400 transition-colors"
            dangerouslySetInnerHTML={{ __html: result.highlightedTitle || result.title }}
          />

          <p
            className="text-gray-400 mb-3 line-clamp-2"
            dangerouslySetInnerHTML={{ __html: result.highlightedExcerpt || result.excerpt }}
          />

          <div className="flex items-center gap-4 text-sm text-gray-500">
            {metadata.author && (
              <span>By {metadata.author.name}</span>
            )}
            {metadata.readingTime && (
              <span>{metadata.readingTime} min read</span>
            )}
            {metadata.publishedAt && (
              <span>{new Date(metadata.publishedAt).toLocaleDateString()}</span>
            )}
            {metadata.articleCount !== undefined && (
              <span>{metadata.articleCount} articles</span>
            )}
          </div>

          {metadata.tags && metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {metadata.tags.slice(0, 5).map((tag) => (
                <span
                  key={tag.id}
                  className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
