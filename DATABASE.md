# CyberVault Database Schema Plan

## Overview

This document outlines the PostgreSQL database schema for CyberVault.
The database is hosted on Supabase with Row Level Security (RLS) enabled.

**Current Implementation**: The database layer is implemented as an in-memory store (`src/db/store.ts`) that mirrors the Prisma schema. This provides a fully functional CRUD layer for development and demo purposes. The Prisma schema (`prisma/schema.prisma`) serves as the source of truth for production deployment.

## Core Tables

### users / profiles
Extended user profile data linked to Supabase Auth.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN (
    'super_admin', 'admin', 'editor', 'author', 'contributor', 'moderator', 'user'
  )),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### articles
Main content table for articles, tutorials, news, research.

```sql
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN (
    'article', 'tutorial', 'news', 'research', 'threat_intel', 'tool_review'
  )),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'pending_review', 'published', 'archived'
  )),
  featured_image TEXT,
  author_id UUID NOT NULL REFERENCES profiles(id),
  category_id UUID REFERENCES categories(id),
  reading_time_minutes INTEGER NOT NULL DEFAULT 1,
  view_count INTEGER NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  seo_title TEXT,
  seo_description TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id)
);

-- Full-text search index
CREATE INDEX idx_articles_search ON articles 
  USING gin(to_tsvector('english', title || ' ' || excerpt || ' ' || content));

-- Status + published index
CREATE INDEX idx_articles_status_published ON articles(status, published_at DESC);
```

### categories
Hierarchical content categories.

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES categories(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### tags
Flat taxonomy for content tagging.

```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### article_tags
Many-to-many relationship between articles and tags.

```sql
CREATE TABLE article_tags (
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);
```

### threat_intel
Threat intelligence entries.

```sql
CREATE TABLE threat_intel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  threat_type TEXT NOT NULL,
  affected_systems TEXT[],
  mitigation_steps TEXT,
  source TEXT,
  source_url TEXT,
  published_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### cves
CVE vulnerability database entries.

```sql
CREATE TABLE cves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cve_id TEXT NOT NULL UNIQUE, -- e.g., CVE-2024-1234
  description TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('critical', 'high', 'medium', 'low', 'none')),
  cvss_score DECIMAL(3,1),
  affected_products TEXT[],
  references TEXT[],
  published_date DATE,
  last_modified_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### tools
Security tools directory.

```sql
CREATE TABLE tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  long_description TEXT,
  url TEXT,
  logo_url TEXT,
  category TEXT NOT NULL,
  pricing TEXT CHECK (pricing IN ('free', 'freemium', 'paid', 'open_source')),
  platforms TEXT[],
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### courses
Academy courses.

```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  icon TEXT,
  total_lessons INTEGER NOT NULL DEFAULT 0,
  estimated_hours INTEGER,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### jobs
Job listings.

```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  is_remote BOOLEAN DEFAULT false,
  job_type TEXT CHECK (job_type IN ('full_time', 'part_time', 'contract', 'internship')),
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency TEXT DEFAULT 'USD',
  application_url TEXT,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  posted_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### events
Community events.

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  event_type TEXT CHECK (event_type IN ('conference', 'meetup', 'webinar', 'workshop', 'ctf')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT,
  is_virtual BOOLEAN DEFAULT false,
  virtual_url TEXT,
  max_attendees INTEGER,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### audit_logs
Security audit trail.

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action, created_at DESC);
```

## Row Level Security (RLS) Policies

### Example: Articles RLS
```sql
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Anyone can read published articles
CREATE POLICY "Published articles are public"
  ON articles FOR SELECT
  USING (status = 'published');

-- Authors can read their own drafts
CREATE POLICY "Authors can read own drafts"
  ON articles FOR SELECT
  USING (author_id = auth.uid());

-- Authors can create articles
CREATE POLICY "Authenticated users can create"
  ON articles FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Authors can update own articles
CREATE POLICY "Authors can update own"
  ON articles FOR UPDATE
  USING (author_id = auth.uid());

-- Editors+ can delete
CREATE POLICY "Editors can delete"
  ON articles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('editor', 'admin', 'super_admin')
    )
  );
```

## Indexes Strategy

1. **Full-text search**: GIN indexes on searchable text columns
2. **Foreign keys**: Automatic indexes from REFERENCES
3. **Common queries**: Composite indexes for frequent filter combinations
4. **Sorting**: DESC indexes on date columns for timeline views
5. **Unique constraints**: Unique indexes on slugs and identifiers

## Migration Strategy

- Use Supabase migrations for schema changes
- Each migration is versioned and reversible
- Test migrations in development before production
- Never modify existing column types in production without a plan
