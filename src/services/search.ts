/**
 * Search Service
 * Platform-wide search across all content types.
 * Uses PostgreSQL full-text search patterns (in-memory implementation).
 * Designed to be extensible for OpenSearch/Elasticsearch integration.
 */

import { db } from '../db/store';
import type { Article, Category, Tag, User } from '../db/schema';
import { ArticleStatus } from '../db/schema';

export type SearchableType =
  | 'article'
  | 'author'
  | 'category'
  | 'tag';

export interface SearchFilters {
  query?: string;
  types?: SearchableType[];
  categoryId?: string;
  contentType?: string;
  difficulty?: string;
  tagIds?: string[];
  authorId?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: ArticleStatus;
}

export interface SearchResult {
  id: string;
  type: SearchableType;
  title: string;
  excerpt: string;
  url: string;
  score: number;
  metadata: Record<string, unknown>;
  highlightedTitle?: string;
  highlightedExcerpt?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  facets: {
    types: Record<SearchableType, number>;
    categories: Record<string, number>;
    tags: Record<string, number>;
    authors: Record<string, number>;
  };
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function calculateScore(text: string, query: string): number {
  const normalizedText = normalizeText(text);
  const normalizedQuery = normalizeText(query);
  const queryTerms = normalizedQuery.split(' ').filter(Boolean);

  let score = 0;

  if (normalizedText.includes(normalizedQuery)) {
    score += 100;
  }

  for (const term of queryTerms) {
    if (term.length < 2) continue;
    if (normalizedText.includes(term)) {
      score += 10;
      if (normalizedText.startsWith(term)) {
        score += 5;
      }
    }
  }

  return score;
}

function highlightText(text: string, query: string): string {
  if (!query) return text;

  const terms = normalizeText(query).split(' ').filter((t) => t.length >= 2);
  let highlighted = text;

  for (const term of terms) {
    const regex = new RegExp(`(${term})`, 'gi');
    highlighted = highlighted.replace(regex, '<mark class="bg-emerald-500/20 text-emerald-300 px-0.5 rounded">$1</mark>');
  }

  return highlighted;
}

function buildArticleMetadataCache() {
  const allArticles = db.listArticles({ page: 1, pageSize: 1000 }).data;
  const categories = new Map(db.listCategories().map((category) => [category.id, category]));
  const authors = new Map(db.listUsers({ page: 1, pageSize: 1000 }).data.map((user) => [user.id, user]));
  const tagsByArticleId = new Map<string, Tag[]>();

  for (const article of allArticles) {
    tagsByArticleId.set(article.id, db.getArticleTags(article.id));
  }

  return { allArticles, categories, authors, tagsByArticleId };
}

function searchArticles(
  query: string,
  filters: SearchFilters,
  page: number,
  pageSize: number
): { results: SearchResult[]; total: number } {
  const { allArticles, categories, authors, tagsByArticleId } = buildArticleMetadataCache();

  let articles = allArticles;

  if (filters.status) {
    articles = articles.filter((a) => a.status === filters.status);
  } else {
    articles = articles.filter((a) => a.status === ArticleStatus.PUBLISHED);
  }

  if (filters.categoryId) {
    articles = articles.filter((a) => a.categoryId === filters.categoryId);
  }

  if (filters.contentType) {
    articles = articles.filter((a) => a.contentType === filters.contentType);
  }

  if (filters.difficulty) {
    articles = articles.filter((a) => a.difficulty === filters.difficulty);
  }

  if (filters.authorId) {
    articles = articles.filter((a) => a.authorId === filters.authorId);
  }

  if (filters.tagIds && filters.tagIds.length > 0) {
    const allowedTagIds = new Set(filters.tagIds);
    articles = articles.filter((article) => {
      const articleTags = tagsByArticleId.get(article.id) ?? [];
      return articleTags.some((tag) => allowedTagIds.has(tag.id));
    });
  }

  if (filters.dateFrom) {
    const fromDate = new Date(filters.dateFrom);
    articles = articles.filter((a) => new Date(a.publishedAt || a.createdAt) >= fromDate);
  }

  if (filters.dateTo) {
    const toDate = new Date(filters.dateTo);
    articles = articles.filter((a) => new Date(a.publishedAt || a.createdAt) <= toDate);
  }

  if (query) {
    articles = articles
      .map((article) => {
        const titleScore = calculateScore(article.title, query) * 2;
        const excerptScore = calculateScore(article.excerpt, query);
        const contentScore = calculateScore(article.content, query) * 0.5;

        return {
          article,
          score: titleScore + excerptScore + contentScore,
        };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.article);
  }

  const total = articles.length;
  const start = (page - 1) * pageSize;
  const paginatedArticles = articles.slice(start, start + pageSize);

  const results: SearchResult[] = paginatedArticles.map((article) => {
    const author = authors.get(article.authorId) ?? null;
    const category = article.categoryId ? categories.get(article.categoryId) ?? null : null;
    const tags = tagsByArticleId.get(article.id) ?? [];

    return {
      id: article.id,
      type: 'article',
      title: article.title,
      excerpt: article.excerpt,
      url: `/articles/${article.slug}`,
      score: query ? calculateScore(article.title + ' ' + article.excerpt, query) : 0,
      highlightedTitle: query ? highlightText(article.title, query) : undefined,
      highlightedExcerpt: query ? highlightText(article.excerpt, query) : undefined,
      metadata: {
        contentType: article.contentType,
        difficulty: article.difficulty,
        readingTime: article.readingTimeMinutes,
        publishedAt: article.publishedAt,
        author: author ? {
          id: author.id,
          name: author.displayName,
          avatar: author.avatarUrl,
        } : null,
        category: category ? {
          id: category.id,
          name: category.name,
          slug: category.slug,
        } : null,
        tags: tags.map((tag) => ({ id: tag.id, name: tag.name, slug: tag.slug })),
        viewCount: article.viewCount,
        isFeatured: article.isFeatured,
      },
    };
  });

  return { results, total };
}

function searchAuthors(
  query: string,
  page: number,
  pageSize: number
): { results: SearchResult[]; total: number } {
  const authors = db.listUsers({ page: 1, pageSize: 1000 }).data;
  const articleCountsByAuthor = new Map<string, number>();
  const allArticles = db.listArticles({ page: 1, pageSize: 1000 }).data;

  for (const article of allArticles) {
    articleCountsByAuthor.set(article.authorId, (articleCountsByAuthor.get(article.authorId) ?? 0) + 1);
  }

  let filteredAuthors = authors;

  if (query) {
    filteredAuthors = authors
      .map((author) => ({
        author,
        score: calculateScore(author.displayName + ' ' + (author.bio || ''), query),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.author);
  }

  const total = filteredAuthors.length;
  const start = (page - 1) * pageSize;
  const paginatedAuthors = filteredAuthors.slice(start, start + pageSize);

  const results: SearchResult[] = paginatedAuthors.map((author) => ({
    id: author.id,
    type: 'author',
    title: author.displayName,
    excerpt: author.bio || 'Cybersecurity professional',
    url: `/authors/${author.id}`,
    score: query ? calculateScore(author.displayName + ' ' + (author.bio || ''), query) : 0,
    highlightedTitle: query ? highlightText(author.displayName, query) : undefined,
    highlightedExcerpt: query && author.bio ? highlightText(author.bio, query) : undefined,
    metadata: {
      email: author.email,
      avatar: author.avatarUrl,
      articleCount: articleCountsByAuthor.get(author.id) ?? 0,
      joinedAt: author.createdAt,
    },
  }));

  return { results, total };
}

function searchCategories(
  query: string,
  page: number,
  pageSize: number
): { results: SearchResult[]; total: number } {
  let categories = db.listCategories();

  if (query) {
    categories = categories
      .map((category) => ({
        category,
        score: calculateScore(category.name + ' ' + (category.description || ''), query),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.category);
  }

  const total = categories.length;
  const start = (page - 1) * pageSize;
  const paginatedCategories = categories.slice(start, start + pageSize);

  const results: SearchResult[] = paginatedCategories.map((category) => {
    const articleCount = db.getCategoryArticleCount(category.id);

    return {
      id: category.id,
      type: 'category',
      title: category.name,
      excerpt: category.description || '',
      url: `/categories/${category.slug}`,
      score: query ? calculateScore(category.name + ' ' + (category.description || ''), query) : 0,
      highlightedTitle: query ? highlightText(category.name, query) : undefined,
      highlightedExcerpt: query && category.description ? highlightText(category.description, query) : undefined,
      metadata: {
        slug: category.slug,
        parentId: category.parentId,
        articleCount,
      },
    };
  });

  return { results, total };
}

function searchTags(
  query: string,
  page: number,
  pageSize: number
): { results: SearchResult[]; total: number } {
  let tags = db.listTags();

  if (query) {
    tags = tags
      .map((tag) => ({
        tag,
        score: calculateScore(tag.name, query),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.tag);
  }

  const total = tags.length;
  const start = (page - 1) * pageSize;
  const paginatedTags = tags.slice(start, start + pageSize);

  const results: SearchResult[] = paginatedTags.map((tag) => {
    const articleCount = db.getTagArticleCount(tag.id);

    return {
      id: tag.id,
      type: 'tag',
      title: tag.name,
      excerpt: `${articleCount} articles`,
      url: `/tags/${tag.slug}`,
      score: query ? calculateScore(tag.name, query) : 0,
      highlightedTitle: query ? highlightText(tag.name, query) : undefined,
      metadata: {
        slug: tag.slug,
        articleCount,
      },
    };
  });

  return { results, total };
}

export function search(
  filters: SearchFilters,
  page = 1,
  pageSize = 20
): SearchResponse {
  const query = filters.query || '';
  const types = filters.types || ['article', 'author', 'category', 'tag'];

  let allResults: SearchResult[] = [];
  const facets = {
    types: {} as Record<SearchableType, number>,
    categories: {} as Record<string, number>,
    tags: {} as Record<string, number>,
    authors: {} as Record<string, number>,
  };

  if (types.includes('article')) {
    const { results, total } = searchArticles(query, filters, 1, 1000);
    allResults = allResults.concat(results);
    facets.types.article = total;

    for (const result of results) {
      const category = result.metadata.category as { id: string; name: string } | null;
      if (category) {
        facets.categories[category.id] = (facets.categories[category.id] || 0) + 1;
      }

      const tags = result.metadata.tags as Array<{ id: string; name: string }>;
      for (const tag of tags) {
        facets.tags[tag.id] = (facets.tags[tag.id] || 0) + 1;
      }

      const author = result.metadata.author as { id: string; name: string } | null;
      if (author) {
        facets.authors[author.id] = (facets.authors[author.id] || 0) + 1;
      }
    }
  }

  if (types.includes('author')) {
    const { results, total } = searchAuthors(query, 1, 1000);
    allResults = allResults.concat(results);
    facets.types.author = total;
  }

  if (types.includes('category')) {
    const { results, total } = searchCategories(query, 1, 1000);
    allResults = allResults.concat(results);
    facets.types.category = total;
  }

  if (types.includes('tag')) {
    const { results, total } = searchTags(query, 1, 1000);
    allResults = allResults.concat(results);
    facets.types.tag = total;
  }

  if (query) {
    allResults.sort((a, b) => b.score - a.score);
  } else {
    const typePriority: Record<SearchableType, number> = {
      article: 1,
      author: 2,
      category: 3,
      tag: 4,
    };
    allResults.sort((a, b) => typePriority[a.type] - typePriority[b.type]);
  }

  const total = allResults.length;
  const start = (page - 1) * pageSize;
  const paginatedResults = allResults.slice(start, start + pageSize);

  return {
    results: paginatedResults,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    facets,
  };
}

export function getSearchSuggestions(query: string, limit = 5): string[] {
  if (!query || query.length < 2) return [];

  const suggestions = new Set<string>();
  const normalized = query.toLowerCase();

  const articles = db.listArticles({ page: 1, pageSize: 100 }).data;
  for (const article of articles) {
    if (article.title.toLowerCase().includes(normalized)) {
      suggestions.add(article.title);
    }
  }

  const categories = db.listCategories();
  for (const category of categories) {
    if (category.name.toLowerCase().includes(normalized)) {
      suggestions.add(category.name);
    }
  }

  const tags = db.listTags();
  for (const tag of tags) {
    if (tag.name.toLowerCase().includes(normalized)) {
      suggestions.add(tag.name);
    }
  }

  return Array.from(suggestions).slice(0, limit);
}

