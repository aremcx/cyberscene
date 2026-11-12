import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getArticleBySlug, incrementViewCount } from '../services/articles';
import type { ArticleWithRelations } from '../services/articles';
import { Badge, Button, Card, EmptyState } from '../components/ui';
import { useAuth } from '../components/auth/AuthProvider';
import { db } from '../db/store';
import { markdownToHtml } from '../lib/markdown';
import { formatDate } from '../lib/utils';

export function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [article, setArticle] = useState<ArticleWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (slug) {
      const found = getArticleBySlug(slug);
      if (found) {
        setArticle(found);
        incrementViewCount(found.id);
        
        // Check if bookmarked
        if (user) {
          setIsBookmarked(db.isBookmarked(user.id, found.id));
        }
      }
      setLoading(false);
    }
  }, [slug, user]);

  const handleBookmark = () => {
    if (!user || !article) return;
    
    if (isBookmarked) {
      db.removeBookmark(user.id, article.id);
      setIsBookmarked(false);
    } else {
      db.addBookmark(user.id, article.id);
      setIsBookmarked(true);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-800 rounded w-3/4"></div>
          <div className="h-4 bg-gray-800 rounded w-1/2"></div>
          <div className="h-64 bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <EmptyState
        icon="📄"
        title="Article Not Found"
        description="The article you're looking for doesn't exist or has been removed."
        action={
          <Link to="/articles">
            <Button>Browse Articles</Button>
          </Link>
        }
      />
    );
  }

  const htmlContent = markdownToHtml(article.content);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-400">
        <Link to="/" className="hover:text-emerald-400 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link to="/articles" className="hover:text-emerald-400 transition-colors">
          Articles
        </Link>
        <span>/</span>
        <span className="text-white truncate">{article.title}</span>
      </nav>

      {/* Article Header */}
      <article>
        <header className="mb-8">
          {/* Category and Tags */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {article.category && (
              <Badge variant="info" size="md">
                {article.category.name}
              </Badge>
            )}
            {article.isFeatured && (
              <Badge variant="warning" size="md">
                Featured
              </Badge>
            )}
            {article.difficulty && (
              <Badge variant="outline" size="md">
                {article.difficulty}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-white mb-4">
            {article.title}
          </h1>

          {/* Excerpt */}
          <p className="text-xl text-gray-400 mb-6">
            {article.excerpt}
          </p>

          {/* Meta Info */}
          <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-gray-800">
            <div className="flex items-center gap-4">
              {/* Author */}
              {article.author && (
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-semibold">
                    {article.author.displayName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {article.author.displayName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {article.publishedAt ? formatDate(article.publishedAt) : 'Draft'}
                    </div>
                  </div>
                </div>
              )}

              {/* Reading Time */}
              <div className="text-sm text-gray-400">
                {article.readingTimeMinutes} min read
              </div>

              {/* View Count */}
              <div className="text-sm text-gray-400">
                {article.viewCount} views
              </div>
            </div>

            {/* Actions */}
            {user && (
              <div className="flex items-center gap-2">
                <Button
                  variant={isBookmarked ? 'primary' : 'outline'}
                  size="sm"
                  onClick={handleBookmark}
                >
                  {isBookmarked ? '✓ Bookmarked' : 'Bookmark'}
                </Button>
              </div>
            )}
          </div>
        </header>

        {/* Featured Image */}
        {article.featuredImage && (
          <div className="mb-8 rounded-xl overflow-hidden">
            <img
              src={article.featuredImage}
              alt={article.title}
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Article Content */}
        <div
          className="prose prose-invert max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="mb-8 pt-6 border-t border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Link
                  key={tag.id}
                  to={`/tags/${tag.slug}`}
                  className="px-3 py-1 text-sm bg-gray-800 text-gray-300 rounded-full hover:bg-gray-700 transition-colors"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="pt-6 border-t border-gray-800">
          <h3 className="text-xl font-semibold text-white mb-4">
            Comments ({article.commentCount})
          </h3>
          <p className="text-gray-400 text-sm">
            Comments feature coming soon.
          </p>
        </div>
      </article>
    </div>
  );
}
