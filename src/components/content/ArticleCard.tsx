import { Link } from 'react-router-dom';
import { Badge } from '../ui';
import { formatRelativeTime, calculateReadingTime } from '../../lib/utils';
import type { ArticleWithRelations } from '../../services/articles';

interface ArticleCardProps {
  article: ArticleWithRelations;
  variant?: 'default' | 'featured' | 'compact';
}

export function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  const articleUrl = `/articles/${article.slug}`;

  if (variant === 'featured') {
    return (
      <Link
        to={articleUrl}
        className="group block rounded-xl border border-gray-800 bg-gray-900/30 overflow-hidden hover:border-emerald-500/30 transition-all duration-300"
      >
        {article.featuredImage && (
          <div className="aspect-video bg-gray-800 overflow-hidden">
            <img
              src={article.featuredImage}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            {article.category && (
              <Badge variant="info" size="sm">{article.category.name}</Badge>
            )}
            {article.isFeatured && (
              <Badge variant="warning" size="sm">Featured</Badge>
            )}
          </div>
          <h2 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors line-clamp-2">
            {article.title}
          </h2>
          <p className="text-gray-400 text-sm mb-4 line-clamp-3">
            {article.excerpt}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-[10px] text-gray-400">
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
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link
        to={articleUrl}
        className="group flex gap-4 p-3 rounded-lg hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors line-clamp-2 mb-1">
            {article.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{article.author?.displayName}</span>
            {article.publishedAt && (
              <>
                <span>•</span>
                <span>{formatRelativeTime(article.publishedAt)}</span>
              </>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={articleUrl}
      className="group block rounded-xl border border-gray-800 bg-gray-900/30 overflow-hidden hover:border-emerald-500/30 hover:-translate-y-0.5 transition-all duration-300"
    >
      {article.featuredImage && (
        <div className="aspect-video bg-gray-800 overflow-hidden">
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          {article.category && (
            <Badge variant="info" size="sm">{article.category.name}</Badge>
          )}
          {article.isFeatured && (
            <Badge variant="warning" size="sm">Featured</Badge>
          )}
        </div>
        <h3 className="text-base font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p className="text-sm text-gray-400 mb-3 line-clamp-2">
          {article.excerpt}
        </p>
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {article.tags.slice(0, 3).map((tag) => (
              <span key={tag.id} className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                {tag.name}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-[10px] text-gray-400">
              {article.author?.displayName.charAt(0)}
            </div>
            <span>{article.author?.displayName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>{article.readingTimeMinutes} min</span>
            {article.publishedAt && (
              <span>{formatRelativeTime(article.publishedAt)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
