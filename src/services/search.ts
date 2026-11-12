/**
 * Search Service
 * Platform-wide search across all content types.
 * Uses PostgreSQL full-text search patterns (in-memory implementation).
 * Designed to be extensible for OpenSearch/Elasticsearch integration.
 */

import { db } from '../db/store';
import type { Article, Category, Tag, User } from '../db/schema';
import { ArticleStatus } from '../db/schema';

// ============================================
// SEARCH TYPES
// ============================================

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

// ============================================
// SEARCH IMPLEMENTATION
// ============================================

/**
 * Normalize text for search (lowercase, remove special chars)
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculate relevance score based on query matches
 */
function calculateScore(text: string, query: string): number {
  const normalizedText = normalizeText(text);
  const normalizedQuery = normalizeText(query);
  const queryTerms = normalizedQuery.split(' ');
  
  let score = 0;
  
  // Exact match gets highest score
  if (normalizedText.includes(normalizedQuery)) {
    score += 100;
  }
  
  // Term matches
  for (const term of queryTerms) {
    if (term.length < 2) continue;
    
    if (normalizedText.includes(term)) {
      score += 10;
      
      // Bonus for term at start
      if (normalizedText.startsWith(term)) {
        score += 5;
      }
    }
  }
  
  return score;
}

/**
 * Highlight search terms in text
 */
function highlightText(text: string, query: string): string {
  if (!query) return text;
  
  const terms = normalizeText(query).split(' ').filter(t => t.length >= 2);
  let highlighted = text;
  
  for (const term of terms) {
    const regex = new RegExp(`(${term})`, 'gi');
    highlighted = highlighted.replace(regex, '<mark class="bg-emerald-500/20 text-emerald-300 px-0.5 rounded">$1</mark>');
  }
  
  return highlighted;
}

/**
 * Search articles
 */
function searchArticles(
  query: string,
  filters: SearchFilters,
  page: number,
  pageSize: number
): { results: SearchResult[]; total: number } {
  let articles = db.listArticles({ page: 1, pageSize: 1000 }).data;
  
  // Filter by status (default to published only)
  if (filters.status) {
    articles = articles.filter(a => a.status === filters.status);
  } else {
    articles = articles.filter(a => a.status === ArticleStatus.PUBLISHED);
  }
  
  // Filter by category
  if (filters.categoryId) {
    articles = articles.filter(a => a.categoryId === filters.categoryId);
  }
  
  // Filter by content type
  if (filters.contentType) {
    articles = articles.filter(a => a.contentType === filters.contentType);
  }
  
  // Filter by difficulty
  if (filters.difficulty) {
    articles = articles.filter(a => a.difficulty === filters.difficulty);
  }
  
  // Filter by author
  if (filters.authorId) {
    articles = articles.filter(a => a.authorId === filters.authorId);
  }
  
  // Filter by tags
  if (filters.tagIds && filters.tagIds.length > 0) {
    articles = articles.filter(article => {
      const articleTags = db.getArticleTags(article.id);
      return filters.tagIds!.some(tagId => articleTags.some(t => t.id === tagId));
    });
  }
  
  // Filter by date range
  if (filters.dateFrom) {
    const fromDate = new Date(filters.dateFrom);
    articles = articles.filter(a => new Date(a.publishedAt || a.createdAt) >= fromDate);
  }
  if (filters.dateTo) {
    const toDate = new Date(filters.dateTo);
    articles = articles.filter(a => new Date(a.publishedAt || a.createdAt) <= toDate);
  }
  
  // Search by query
  if (query) {
    articles = articles
      .map(article => {
        const titleScore = calculateScore(article.title, query) * 2; // Title matches weighted higher
        const excerptScore = calculateScore(article.excerpt, query);
        const contentScore = calculateScore(article.content, query) * 0.5; // Content matches weighted lower
        
        return {
          article,
          score: titleScore + excerptScore + contentScore,
        };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.article);
  }
  
  const total = articles.length;
  const start = (page - 1) * pageSize;
  const paginatedArticles = articles.slice(start, start + pageSize);
  
  const results: SearchResult[] = paginatedArticles.map(article => {
    const author = db.getUserById(article.authorId);
    const category = article.categoryId ? db.getCategoryById(article.categoryId) : null;
    const tags = db.getArticleTags(article.id);
    
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
        tags: tags.map(t => ({ id: t.id, name: t.name, slug: t.slug })),
        viewCount: article.viewCount,
        isFeatured: article.isFeatured,
      },
    };
  });
  
  return { results, total };
}

/**
 * Search authors
 */
function searchAuthors(
  query: string,
  page: number,
  pageSize: number
): { results: SearchResult[]; total: number } {
  let authors = db.listUsers({ page: 1, pageSize: 1000 }).data;
  
  if (query) {
    authors = authors
      .map(author => ({
        author,
        score: calculateScore(author.displayName + ' ' + (author.bio || ''), query),
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.author);
  }
  
  const total = authors.length;
  const start = (page - 1) * pageSize;
  const paginatedAuthors = authors.slice(start, start + pageSize);
  
  const results: SearchResult[] = paginatedAuthors.map(author => {
    const { data: articles } = db.listArticles({ page: 1, pageSize: 1000 }, undefined, { authorId: author.id });
    
    return {
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
        articleCount: articles.length,
        joinedAt: author.createdAt,
      },
    };
  });
  
  return { results, total };
}

/**
 * Search categories
 */
function searchCategories(
  query: string,
  page: number,
  pageSize: number
): { results: SearchResult[]; total: number } {
  let categories = db.listCategories();
  
  if (query) {
    categories = categories
      .map(category => ({
        category,
        score: calculateScore(category.name + ' ' + (category.description || ''), query),
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.category);
  }
  
  const total = categories.length;
  const start = (page - 1) * pageSize;
  const paginatedCategories = categories.slice(start, start + pageSize);
  
  const results: SearchResult[] = paginatedCategories.map(category => {
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

/**
 * Search tags
 */
function searchTags(
  query: string,
  page: number,
  pageSize: number
): { results: SearchResult[]; total: number } {
  let tags = db.listTags();
  
  if (query) {
    tags = tags
      .map(tag => ({
        tag,
        score: calculateScore(tag.name, query),
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.tag);
  }
  
  const total = tags.length;
  const start = (page - 1) * pageSize;
  const paginatedTags = tags.slice(start, start + pageSize);
  
  const results: SearchResult[] = paginatedTags.map(tag => {
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

/**
 * Main search function
 */
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
  
  // Search each type
  if (types.includes('article')) {
    const { results, total } = searchArticles(query, filters, 1, 1000);
    allResults = allResults.concat(results);
    facets.types.article = total;
    
    // Build category facets
    for (const result of results) {
      const category = result.metadata.category as { id: string; name: string } | null;
      if (category) {
        facets.categories[category.id] = (facets.categories[category.id] || 0) + 1;
      }
    }
    
    // Build tag facets
    for (const result of results) {
      const tags = result.metadata.tags as Array<{ id: string; name: string }>;
      for (const tag of tags) {
        facets.tags[tag.id] = (facets.tags[tag.id] || 0) + 1;
      }
    }
    
    // Build author facets
    for (const result of results) {
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
  
  // Sort by score (if query) or by type priority
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
  
  // Paginate
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

/**
 * Get search suggestions (autocomplete)
 */
export function getSearchSuggestions(query: string, limit = 5): string[] {
  if (!query || query.length < 2) return [];
  
  const suggestions = new Set<string>();
  
  // Get article titles
  const articles = db.listArticles({ page: 1, pageSize: 100 }).data;
  for (const article of articles) {
    if (article.title.toLowerCase().includes(query.toLowerCase())) {
      suggestions.add(article.title);
    }
  }
  
  // Get category names
  const categories = db.listCategories();
  for (const category of categories) {
    if (category.name.toLowerCase().includes(query.toLowerCase())) {
      suggestions.add(category.name);
    }
  }
  
  // Get tag names
  const tags = db.listTags();
  for (const tag of tags) {
    if (tag.name.toLowerCase().includes(query.toLowerCase())) {
      suggestions.add(tag.name);
    }
  }
  
  return Array.from(suggestions).slice(0, limit);
}
