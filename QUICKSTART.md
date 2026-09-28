# CyberVault - Quick Start Guide

Welcome to CyberVault! This guide will help you get the platform up and running quickly.

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL 14+ (for production)

### Development Setup (In-Memory Store)

For quick development and testing, the app works with an in-memory store:

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open browser
# Visit http://localhost:3000
```

That's it! The app will work with demo data.

### Demo Credentials

All demo accounts use password: `Demo@1234`

| Email | Role |
|-------|------|
| superadmin@cybervault.dev | Super Admin |
| admin@cybervault.dev | Admin |
| editor@cybervault.dev | Editor |
| author@cybervault.dev | Author |
| user@cybervault.dev | User |

---

## 🗄️ Production Setup (PostgreSQL)

For production deployment, migrate to PostgreSQL:

### Option 1: Automated Migration (Recommended)

```bash
# Run the migration script
chmod +x scripts/migrate-database.sh
./scripts/migrate-database.sh
```

The script will:
1. Install Prisma dependencies
2. Generate Prisma client
3. Run database migrations
4. Seed demo data (optional)
5. Open Prisma Studio for verification

### Option 2: Manual Migration

```bash
# 1. Install Prisma
npm install @prisma/client
npm install --save-dev prisma

# 2. Configure database URL
# Edit .env file:
DATABASE_URL="postgresql://user:password@localhost:5432/cybervault"

# 3. Generate Prisma client
npx prisma generate

# 4. Run migration
npx prisma migrate dev --name init

# 5. Seed database (optional)
npm run seed

# 6. Start app
npm run dev
```

See [DATABASE_MIGRATION_GUIDE.md](./DATABASE_MIGRATION_GUIDE.md) for detailed instructions.

---

## 📚 Available Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Testing
```bash
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:auth    # Run authentication tests
npm run test:rbac    # Run RBAC tests
npm run test:security # Run security tests
```

### Database
```bash
npx prisma studio    # Open database GUI
npx prisma migrate   # Run migrations
npm run seed         # Seed database with demo data
```

### Code Quality
```bash
npm run typecheck    # Type check
npm run lint         # Lint code
```

---

## 🏗️ Project Structure

```
cybervault/
├── src/
│   ├── components/      # React components
│   │   ├── ui/         # UI primitives
│   │   ├── auth/       # Auth components
│   │   ├── layout/     # Layout components
│   │   └── ...         # Feature components
│   ├── pages/          # Page components
│   │   ├── admin/      # Admin pages
│   │   ├── academy/    # Academy pages
│   │   └── auth/       # Auth pages
│   ├── db/             # Database layer
│   │   ├── store.ts    # In-memory store
│   │   ├── schema.ts   # Type definitions
│   │   └── seed.ts     # Seed data
│   ├── services/       # Business logic
│   │   ├── authService.ts
│   │   ├── articles.ts
│   │   ├── database.ts # Prisma service
│   │   └── ...
│   ├── lib/            # Utilities
│   │   ├── crypto.ts
│   │   ├── validation.ts
│   │   ├── authorization.ts
│   │   └── ...
│   └── tests/          # Test files
├── prisma/
│   ├── schema.prisma   # Database schema
│   ├── seed.ts         # Prisma seed script
│   └── migrations/     # Migration files
├── scripts/            # Utility scripts
└── public/             # Static assets
```

---

## 🔐 Security Features

- ✅ PBKDF2 password hashing
- ✅ Role-based access control (RBAC)
- ✅ Rate limiting
- ✅ Session management
- ✅ Audit logging
- ✅ Input validation
- ✅ XSS protection
- ✅ CSRF protection

---

## 📖 Documentation

- [README.md](./README.md) - Project overview
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture details
- [DATABASE.md](./DATABASE.md) - Database schema
- [DATABASE_MIGRATION_GUIDE.md](./DATABASE_MIGRATION_GUIDE.md) - Migration guide
- [FINAL_REVIEW_REPORT.md](./FINAL_REVIEW_REPORT.md) - Production readiness report
- [COMPREHENSIVE_REVIEW_SUMMARY.md](./COMPREHENSIVE_REVIEW_SUMMARY.md) - Review summary

---

## 🎯 Key Features

### Content Management
- Articles with rich markdown editor
- Categories and tags
- Revision history
- Workflow (draft → review → publish)

### Threat Intelligence
- Threat actors database
- Malware information
- Threat reports
- Indicators of compromise

### Vulnerability Management
- CVE database
- CVSS scoring
- Exploitation tracking
- Remediation guidance

### Tools Directory
- 22+ security tools
- 13 categories
- Search and filter
- Detailed profiles

### Cyber Academy
- 4 learning paths
- 9 courses
- Hands-on labs
- Gamification (badges, points)

### Community
- Discussions
- Job board
- Events
- User following

### AI Assistant
- Knowledge base Q&A
- Conversation history
- Rate limiting
- Safety guardrails

### Newsletter & Notifications
- Email subscriptions
- Campaign management
- In-app notifications
- User preferences

---

## 🐛 Troubleshooting

### Port already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Database connection failed
```bash
# Check PostgreSQL is running
pg_isready

# Start PostgreSQL
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

### Prisma client not generated
```bash
# Regenerate Prisma client
npx prisma generate
```

### Migration failed
```bash
# Reset and retry
npx prisma migrate reset
npx prisma migrate dev
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

---

## 📞 Support

- **Documentation**: See docs folder
- **Issues**: GitHub Issues
- **Security**: security@cybervault.dev

---

## 🎉 You're Ready!

Start the development server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and explore CyberVault!

Happy coding! 🚀
