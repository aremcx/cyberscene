# CyberVault Architecture Documentation

## Overview

CyberVault is a production-ready cybersecurity intelligence platform built with a modular, scalable architecture. It combines content management, threat intelligence, education, community, and career resources into a unified platform.

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend Framework | React 18 + TypeScript | UI rendering, type safety |
| Build Tool | Vite 6 | Fast development, optimized builds |
| Styling | Tailwind CSS 4 | Utility-first CSS, design system |
| Routing | React Router 6 | Client-side navigation |
| Backend/Database | Supabase (PostgreSQL) | Auth, database, storage, realtime |
| Icons | Lucide React | Consistent icon set |
| Animations | Framer Motion | Smooth UI transitions |

## Project Structure

```
src/
├── App.tsx                    # Root component with routing
├── main.tsx                   # Application entry point
├── index.css                  # Global styles + Tailwind
├── vite-env.d.ts              # Vite type declarations
│
├── config/                    # Configuration layer
│   ├── env.ts                 # Environment variables (typed)
│   ├── constants.ts           # App constants, roles, statuses
│   └── routes.ts              # Route path definitions
│
├── lib/                       # Core libraries
│   ├── supabase.ts            # Supabase client instance
│   ├── utils.ts               # Utility functions
│   └── clsx-shim.ts           # Class name composition
│
├── types/                     # TypeScript type definitions
│   ├── index.ts               # Re-exports
│   ├── common.ts              # Pagination, API, base entities
│   ├── auth.ts                # User, session, permissions
│   └── content.ts             # Articles, categories, tags
│
├── hooks/                     # Custom React hooks
│   ├── useTheme.ts            # Theme management
│   └── useToast.ts            # Toast notification system
│
├── components/                # Reusable components
│   ├── ui/                    # UI primitives (Button, Card, Badge, etc.)
│   └── layout/                # Layout components (Header, Footer, Layout)
│
└── pages/                     # Page components (route-level)
    ├── Home.tsx
    ├── Articles.tsx
    ├── ThreatIntel.tsx
    ├── Tools.tsx
    ├── Academy.tsx
    ├── Community.tsx
    ├── Jobs.tsx
    ├── Login.tsx
    └── NotFound.tsx
```

## Architecture Principles

### 1. Modular Design
- Each feature domain is isolated in its own module
- Clear boundaries between UI, business logic, and data access
- Service interfaces for future backend integrations

### 2. Type Safety
- Strict TypeScript configuration
- Centralized type definitions
- No `any` types in production code

### 3. Security First
- Server-side authorization (via Supabase RLS)
- Input validation at all boundaries
- No hardcoded secrets
- XSS prevention through proper escaping

### 4. Performance
- Code splitting via route-based lazy loading
- Optimistic UI updates where appropriate
- Efficient re-render prevention
- Image optimization ready

### 5. Accessibility
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Focus management
- Color contrast compliance

## Module Boundaries

### Phase 1: Foundation (Current)
- Project structure
- Design system
- Routing
- Theme system
- Layout components

### Phase 2: Authentication + RBAC
- Supabase Auth integration
- Role-based access control
- Protected routes
- User profiles

### Phase 3: Public Website
- Complete design system
- Responsive layouts
- SEO optimization
- Performance optimization

### Phase 4: CMS + Article Workflow
- Article CRUD
- Rich text editor
- Media management
- Publishing workflow

### Phase 5: Search + Taxonomy
- Full-text search
- Categories and tags
- Filtering and sorting

### Phase 6: Threat Intelligence + CVE
- Threat feed integration
- CVE database
- Vulnerability tracking

### Phase 7: Tools Directory
- Tool listings
- Reviews and ratings
- Comparisons

### Phase 8: Academy + Labs
- Course management
- Interactive labs
- Progress tracking

### Phase 9: Community + Jobs + Events
- Forums/discussions
- Job board
- Event management

### Phase 10: AI + Newsletter + Notifications
- AI assistant integration
- Email newsletter
- Push notifications

### Phase 11: Security Hardening + Production
- Security audit
- Performance testing
- Monitoring setup
- CI/CD pipeline

## Database Strategy

### Supabase (PostgreSQL)
- Primary database with full PostgreSQL capabilities
- Row Level Security (RLS) for data protection
- Realtime subscriptions for live updates
- Built-in authentication with JWT
- Storage for file uploads
- Edge Functions for serverless compute

### Key Tables (Planned)
- `users` - User profiles and metadata
- `articles` - Content with full-text search
- `categories` - Hierarchical taxonomy
- `tags` - Flat taxonomy
- `article_tags` - Many-to-many relationship
- `threat_intel` - Threat intelligence entries
- `cves` - CVE database entries
- `tools` - Security tools directory
- `courses` - Academy courses
- `jobs` - Job listings
- `events` - Community events
- `audit_logs` - Security audit trail

## Authentication Strategy

### Supabase Auth
- Email/password authentication
- OAuth providers (GitHub, Google)
- JWT-based session management
- Automatic token refresh
- Email verification
- Password reset flow

### RBAC Implementation
- Role hierarchy: Super Admin > Admin > Editor > Author > Contributor > Moderator > User
- Permission-based access control
- Database-level enforcement via RLS
- Middleware for route protection
- UI-level permission checks

## API Conventions

### REST API Pattern (Supabase)
```
GET    /api/{resource}          # List
GET    /api/{resource}/:id      # Get one
POST   /api/{resource}          # Create
PATCH  /api/{resource}/:id      # Update
DELETE /api/{resource}/:id      # Delete
```

### Response Format
```typescript
{
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

### Pagination
```typescript
{
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

## Design System

### Color Palette
- Primary: Emerald (500) - #10b981
- Secondary: Cyan (500) - #06b6d4
- Background: Gray 950 - #030712
- Surface: Gray 900 - #111827
- Border: Gray 800 - #1f2937
- Text Primary: Gray 100 - #f3f4f6
- Text Secondary: Gray 400 - #9ca3af
- Danger: Red (500) - #ef4444
- Warning: Amber (500) - #f59e0b
- Info: Blue (500) - #3b82f6

### Typography
- Font: System font stack
- Headings: Bold, tight tracking
- Body: Regular weight, relaxed leading
- Code: Monospace

### Components
- Buttons: Primary, Secondary, Outline, Ghost, Danger
- Cards: Default, Elevated, Bordered
- Badges: Default, Success, Warning, Danger, Info
- Inputs: Text, Email, Password, Search
- Skeletons: Text, Circular, Rectangular

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `VITE_APP_URL` | No | Application URL (default: localhost:3000) |
| `VITE_APP_ENV` | No | Environment (development/production) |
| `VITE_ENABLE_AI` | No | Enable AI features |
| `VITE_ENABLE_NEWSLETTER` | No | Enable newsletter features |

## Testing Strategy

### Unit Tests
- Utility functions
- Custom hooks
- Component rendering

### Integration Tests
- API integration
- Auth flows
- Form submissions

### E2E Tests
- Critical user journeys
- Cross-browser testing

## Security Checklist

- [x] No hardcoded secrets
- [x] Environment-based configuration
- [x] Input validation
- [x] XSS prevention (React default + sanitization)
- [x] CSRF protection (Supabase handles)
- [x] Rate limiting awareness
- [ ] RLS policies (Phase 2)
- [ ] Audit logging (Phase 2)
- [ ] Security headers (Phase 11)
- [ ] Penetration testing (Phase 11)
