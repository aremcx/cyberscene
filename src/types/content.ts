/**
 * Content Types
 * Type definitions for articles, tutorials, and other content.
 */

import { ArticleStatus, CONTENT_TYPES } from '../config/constants';
import { AuditableEntity, SlugEntity } from './common';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  article_count: number;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  article_count: number;
  created_at: string;
}

export interface Article extends SlugEntity, AuditableEntity {
  title: string;
  excerpt: string;
  content: string;
  content_type: (typeof CONTENT_TYPES)[keyof typeof CONTENT_TYPES];
  status: ArticleStatus;
  featured_image?: string;
  author_id: string;
  author?: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
  category_id?: string;
  category?: Category;
  tags?: Tag[];
  reading_time_minutes: number;
  view_count: number;
  published_at?: string;
  seo_title?: string;
  seo_description?: string;
  is_featured: boolean;
}

export interface ArticleCreateInput {
  title: string;
  excerpt: string;
  content: string;
  content_type: (typeof CONTENT_TYPES)[keyof typeof CONTENT_TYPES];
  featured_image?: string;
  category_id?: string;
  tag_ids?: string[];
  seo_title?: string;
  seo_description?: string;
  is_featured?: boolean;
}

export interface ArticleUpdateInput extends Partial<ArticleCreateInput> {
  status?: ArticleStatus;
}
