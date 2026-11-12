# Database Migration Guide: In-Memory Store to PostgreSQL

This guide walks you through migrating CyberVault from the in-memory store to PostgreSQL using Prisma.

## 📋 Prerequisites

- PostgreSQL 14+ installed and running
- Node.js 18+ installed
- npm or yarn package manager

## 🚀 Step-by-Step Migration

### Step 1: Install Dependencies

```bash
# Install Prisma packages
npm install @prisma/client
npm install --save-dev prisma

# Verify installation
npx prisma --version
```

### Step 2: Configure Database URL

Create or update `.env` file:

```bash
# PostgreSQL connection string
DATABASE_URL="postgresql://username:password@localhost:5432/cybervault?schema=public"

# Example with default PostgreSQL setup
# DATABASE_URL="postgresql://postgres:password@localhost:5432/cybervault?schema=public"
```

**Important**: Replace `username`, `password`, and `cybervault` with your actual PostgreSQL credentials.

### Step 3: Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE cybervault;

# Exit
\q
```

Or using createdb:
```bash
createdb -U postgres cybervault
```

### Step 4: Generate Prisma Client

```bash
# Generate Prisma client from schema
npx prisma generate
```

This creates the Prisma client in `node_modules/.prisma/client`.

### Step 5: Run Database Migration

```bash
# Create initial migration
npx prisma migrate dev --name init

# This will:
# 1. Create migration file in prisma/migrations/
# 2. Apply migration to database
# 3. Generate Prisma client
```

### Step 6: Seed Database (Optional)

```bash
# Run seed script to populate demo data
npm run seed

# Or manually
npx prisma db seed
```

### Step 7: Verify Migration

```bash
# Open Prisma Studio to view data
npx prisma studio

# Or check database directly
psql -U postgres -d cybervault -c "SELECT COUNT(*) FROM users;"
```

### Step 8: Update Application Code

The application is already configured to use the new database service layer. No code changes needed!

The migration is handled by:
- `src/services/database.ts` - Prisma-based database service
- `src/lib/prisma.ts` - Prisma client singleton

### Step 9: Test Application

```bash
# Start development server
npm run dev

# Visit http://localhost:3000
# Test all features:
# - User registration/login
# - Article creation
# - Search functionality
# - Admin features
```

## 🔄 Migration from In-Memory Data

If you have existing data in the in-memory store that you want to migrate:

### Option 1: Manual Export/Import

1. Export data from in-memory store:
```typescript
// Add this temporarily to your app
import { db } from './db/store';
import fs from 'fs';

const data = {
  users: Array.from(db.getState().users.values()),
  articles: Array.from(db.getState().articles.values()),
  // ... other collections
};

fs.writeFileSync('data-export.json', JSON.stringify(data, null, 2));
```

2. Import to PostgreSQL:
```typescript
import { dbService } from './services/database';
import exportedData from './data-export.json';

await dbService.initialize();

for (const user of exportedData.users) {
  await dbService.createUser(user);
}
// ... repeat for other collections
```

### Option 2: Fresh Start

Simply use the seed scripts to populate demo data:
```bash
npm run seed
```

## 📊 Database Schema Overview

The Prisma schema includes:

- **Users & Auth**: Users, roles, permissions, sessions
- **Content**: Articles, categories, tags, comments
- **Threat Intelligence**: Threat actors, malware, reports, indicators
- **Vulnerabilities**: CVE database with CVSS scores
- **Tools**: Security tools directory
- **Academy**: Learning paths, courses, lessons, labs, quizzes
- **Community**: Discussions, follows, reports
- **Jobs & Events**: Job listings, events
- **Newsletter**: Subscribers, campaigns
- **AI Assistant**: Conversations, messages, usage metrics

## 🔧 Troubleshooting

### Issue: Connection refused

**Solution**: Ensure PostgreSQL is running
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows
net start postgresql
```

### Issue: Database "cybervault" does not exist

**Solution**: Create the database
```bash
createdb -U postgres cybervault
```

### Issue: Permission denied

**Solution**: Grant permissions
```sql
GRANT ALL PRIVILEGES ON DATABASE cybervault TO your_username;
```

### Issue: Migration fails

**Solution**: Reset and retry
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Then run migration again
npx prisma migrate dev
```

## 📈 Performance Optimization

After migration, add indexes for better performance:

```sql
-- Add to prisma/schema.prisma if not already present
@@index([status, publishedAt(sort: Desc)])
@@index([authorId])
@@index([categoryId])
```

Then run:
```bash
npx prisma migrate dev --name add_indexes
```

## 🔒 Security Checklist

- [ ] Use strong database password
- [ ] Enable SSL for database connections
- [ ] Restrict database access to application server IP
- [ ] Regular database backups
- [ ] Monitor slow queries
- [ ] Set up connection pooling (optional)

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)

## ✅ Verification Checklist

After migration, verify:

- [ ] All tables created successfully
- [ ] Foreign key constraints working
- [ ] Indexes created
- [ ] Seed data loaded (if applicable)
- [ ] Application can connect to database
- [ ] All CRUD operations working
- [ ] Authentication working
- [ ] Search functionality working
- [ ] Admin features working

## 🎯 Next Steps

After successful migration:

1. **Set up backups**: Configure automated PostgreSQL backups
2. **Monitor performance**: Set up query monitoring
3. **Optimize queries**: Review and optimize slow queries
4. **Scale**: Consider read replicas for high traffic
5. **Security audit**: Review database security settings

---

**Need Help?** Check the troubleshooting section or refer to the Prisma documentation.
