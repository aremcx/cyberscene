import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../components/auth/AuthProvider';
import { RichTextEditor } from '../../components/editor/RichTextEditor';
import { Button, Input, Select, Badge, Alert } from '../../components/ui';
import * as articleService from '../../services/articles';
import { db } from '../../db/store';
import { ArticleStatus, ContentType, Difficulty, type Article, type CreateArticleInput } from '../../db/schema';
import { generateSlug, extractExcerpt, calculateReadingTimeFromMarkdown } from '../../lib/markdown';
import { hasPermission, PERMISSIONS, buildAuthContext } from '../../lib/authorization';
import { ROUTES } from '../../config/routes';
import { validators } from '../../lib/validation';
import { AppError } from '../../lib/errors';

export function ArticleEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, authContext } = useAuth();
  const isEditing = !!id;

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState<ContentType>(ContentType.ARTICLE);
  const [status, setStatus] = useState<ArticleStatus>(ArticleStatus.DRAFT);
  const [difficulty, setDifficulty] = useState<Difficulty | ''>('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [featuredImage, setFeaturedImage] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeSection, setActiveSection] = useState<'content' | 'seo' | 'settings'>('content');

  const categories = db.listCategories();
  const tags = db.listTags();

  // Load article if editing
  useEffect(() => {
    if (id) {
      const article = db.getArticleById(id);
      if (article) {
        setTitle(article.title);
        setSlug(article.slug);
        setExcerpt(article.excerpt);
        setContent(article.content);
        setContentType(article.contentType);
        setStatus(article.status);
        setDifficulty(article.difficulty || '');
        setCategoryId(article.categoryId || '');
        setFeaturedImage(article.featuredImage || '');
        setSeoTitle(article.seoTitle || '');
        setSeoDescription(article.seoDescription || '');
        setIsFeatured(article.isFeatured);
        setScheduledAt(article.scheduledAt || '');

        // Load tags
        const articleTags = db.getArticleTags(id);
        setSelectedTags(articleTags.map(t => t.id));
      }
    }
  }, [id]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEditing && title) {
      setSlug(generateSlug(title));
    }
  }, [title, isEditing]);

  // Auto-generate excerpt from content
  useEffect(() => {
    if (!excerpt && content) {
      setExcerpt(extractExcerpt(content));
    }
  }, [content]);

  // Check permissions
  if (!user) {
    return <div className="p-8 text-center text-gray-400">Please log in to access the editor.</div>;
  }

  const canCreate = hasPermission(authContext, PERMISSIONS.CONTENT_CREATE);
  const canEditAny = hasPermission(authContext, PERMISSIONS.CONTENT_EDIT_ANY);

  if (isEditing && !canEditAny) {
    const article = db.getArticleById(id!);
    if (article && article.authorId !== user.id) {
      return <div className="p-8 text-center text-gray-400">You don't have permission to edit this article.</div>;
    }
  }

  if (!isEditing && !canCreate) {
    return <div className="p-8 text-center text-gray-400">You don't have permission to create articles.</div>;
  }

  const handleSave = async (newStatus?: ArticleStatus) => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const readingTime = calculateReadingTimeFromMarkdown(content);
      const finalExcerpt = excerpt || extractExcerpt(content);
      const finalSlug = slug || generateSlug(title);

      const articleData = {
        slug: finalSlug,
        title,
        excerpt: finalExcerpt,
        content,
        contentType,
        status: newStatus || status,
        difficulty: difficulty || null,
        featuredImage: featuredImage || null,
        authorId: isEditing ? db.getArticleById(id!)?.authorId || user.id : user.id,
        categoryId: categoryId || null,
        readingTimeMinutes: readingTime,
        publishedAt: (newStatus || status) === ArticleStatus.PUBLISHED ? new Date().toISOString() : null,
        scheduledAt: scheduledAt || null,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        isFeatured,
        createdById: user.id,
        updatedById: user.id,
      };

      // Validate
      validators.createArticle.validateOrThrow({
        title: articleData.title,
        slug: articleData.slug,
        excerpt: articleData.excerpt,
        content: articleData.content,
        authorId: articleData.authorId,
      } as Parameters<typeof validators.createArticle.validate>[0]);

      let savedArticle: Article;

      if (isEditing) {
        savedArticle = articleService.updateArticle(id!, {
          ...articleData,
          updatedById: user.id,
        }, authContext);
      } else {
        savedArticle = articleService.createArticle(articleData, authContext);
      }

      // Update tags
      articleService.setArticleTags(savedArticle.id, selectedTags, authContext);

      setSuccess(`Article ${isEditing ? 'updated' : 'created'} successfully!`);
      
      if (!isEditing) {
        navigate(`/admin/articles/${savedArticle.id}/edit`);
      }
    } catch (err) {
      if (err instanceof AppError) {
        setError(err.message);
      } else {
        setError('Failed to save article. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitForReview = () => handleSave(ArticleStatus.PENDING_REVIEW);
  const handlePublish = () => handleSave(ArticleStatus.PUBLISHED);
  const handleSaveDraft = () => handleSave(ArticleStatus.DRAFT);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = calculateReadingTimeFromMarkdown(content);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isEditing ? 'Edit Article' : 'Create Article'}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {isEditing ? 'Update your article content and settings' : 'Write and publish a new article'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate(ROUTES.ADMIN_ARTICLES)}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleSaveDraft} isLoading={isSaving}>
            Save Draft
          </Button>
          <Button variant="outline" onClick={handleSubmitForReview} isLoading={isSaving}>
            Submit for Review
          </Button>
          {hasPermission(authContext, PERMISSIONS.CONTENT_PUBLISH) && (
            <Button onClick={handlePublish} isLoading={isSaving}>
              Publish
            </Button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="error" title="Error" className="mb-6">
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" title="Success" className="mb-6">
          {success}
        </Alert>
      )}

      {/* Section Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-800">
        {(['content', 'seo', 'settings'] as const).map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeSection === section
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            {section.charAt(0).toUpperCase() + section.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {activeSection === 'content' && (
            <>
              {/* Title */}
              <Input
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter article title..."
              />

              {/* Slug */}
              <Input
                label="Slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="article-url-slug"
              />

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Excerpt
                </label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief description of the article..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900/50 text-gray-100 placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors px-4 py-2.5 text-sm resize-none"
                />
              </div>

              {/* Content Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Content (Markdown)
                </label>
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Write your article content in Markdown..."
                />
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>{wordCount} words</span>
                  <span>{readingTime} min read</span>
                </div>
              </div>
            </>
          )}

          {activeSection === 'seo' && (
            <>
              <Input
                label="SEO Title"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="SEO-optimized title (leave blank to use article title)"
              />
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  SEO Description
                </label>
                <textarea
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Meta description for search engines (max 160 characters)"
                  rows={3}
                  maxLength={160}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900/50 text-gray-100 placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors px-4 py-2.5 text-sm resize-none"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {seoDescription.length}/160 characters
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 rounded-lg border border-gray-800 bg-gray-900/30">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Search Preview</h3>
                <div className="text-blue-400 text-lg truncate">
                  {seoTitle || title || 'Article Title'}
                </div>
                <div className="text-green-400 text-sm truncate">
                  cybervault.dev/articles/{slug || 'article-slug'}
                </div>
                <div className="text-gray-400 text-sm mt-1 line-clamp-2">
                  {seoDescription || excerpt || 'Article description will appear here...'}
                </div>
              </div>
            </>
          )}

          {activeSection === 'settings' && (
            <>
              <Select
                label="Content Type"
                value={contentType}
                onChange={(e) => setContentType(e.target.value as ContentType)}
                options={[
                  { value: ContentType.ARTICLE, label: 'Article' },
                  { value: ContentType.TUTORIAL, label: 'Tutorial' },
                  { value: ContentType.NEWS, label: 'News' },
                  { value: ContentType.RESEARCH, label: 'Research' },
                  { value: ContentType.THREAT_INTEL, label: 'Threat Report' },
                  { value: ContentType.CASE_STUDY, label: 'Case Study' },
                  { value: ContentType.TOOL_REVIEW, label: 'Tool Review' },
                  { value: ContentType.INTERVIEW, label: 'Interview' },
                  { value: ContentType.CAREER, label: 'Career' },
                  { value: ContentType.SECURITY_AWARENESS, label: 'Security Awareness' },
                  { value: ContentType.OPINION, label: 'Opinion' },
                ]}
              />

              <Select
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ArticleStatus)}
                options={[
                  { value: ArticleStatus.DRAFT, label: 'Draft' },
                  { value: ArticleStatus.PENDING_REVIEW, label: 'Pending Review' },
                  { value: ArticleStatus.APPROVED, label: 'Approved' },
                  { value: ArticleStatus.PUBLISHED, label: 'Published' },
                  { value: ArticleStatus.REJECTED, label: 'Rejected' },
                  { value: ArticleStatus.ARCHIVED, label: 'Archived' },
                ]}
              />

              <Select
                label="Difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty | '')}
                options={[
                  { value: '', label: 'Not specified' },
                  { value: Difficulty.BEGINNER, label: 'Beginner' },
                  { value: Difficulty.INTERMEDIATE, label: 'Intermediate' },
                  { value: Difficulty.ADVANCED, label: 'Advanced' },
                  { value: Difficulty.EXPERT, label: 'Expert' },
                ]}
              />

              <Input
                label="Featured Image URL"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />

              <Input
                label="Schedule Publication"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-800 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-300">Featured Article</span>
              </label>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="p-4 rounded-lg border border-gray-800 bg-gray-900/30">
            <h3 className="text-sm font-semibold text-white mb-3">Status</h3>
            <Badge
              variant={
                status === ArticleStatus.PUBLISHED ? 'success' :
                status === ArticleStatus.DRAFT ? 'outline' :
                status === ArticleStatus.PENDING_REVIEW ? 'warning' :
                status === ArticleStatus.REJECTED ? 'danger' : 'info'
              }
              size="md"
            >
              {status.replace('_', ' ')}
            </Badge>
          </div>

          {/* Category */}
          <div className="p-4 rounded-lg border border-gray-800 bg-gray-900/30">
            <h3 className="text-sm font-semibold text-white mb-3">Category</h3>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-900/50 text-gray-100 px-3 py-2 text-sm"
            >
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="p-4 rounded-lg border border-gray-800 bg-gray-900/30">
            <h3 className="text-sm font-semibold text-white mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => {
                    setSelectedTags(prev =>
                      prev.includes(tag.id)
                        ? prev.filter(id => id !== tag.id)
                        : [...prev, tag.id]
                    );
                  }}
                  className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                    selectedTags.includes(tag.id)
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* Author */}
          <div className="p-4 rounded-lg border border-gray-800 bg-gray-900/30">
            <h3 className="text-sm font-semibold text-white mb-3">Author</h3>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-sm text-emerald-400">
                {user.displayName.charAt(0)}
              </div>
              <div>
                <div className="text-sm text-white">{user.displayName}</div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="p-4 rounded-lg border border-gray-800 bg-gray-900/30">
            <h3 className="text-sm font-semibold text-white mb-3">Article Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Words</span>
                <span className="text-white">{wordCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Reading Time</span>
                <span className="text-white">{readingTime} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tags</span>
                <span className="text-white">{selectedTags.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
