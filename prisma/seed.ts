/**
 * Prisma Database Seed Script
 * Populates the PostgreSQL database with demo data
 */

import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // ============================================
  // ROLES & PERMISSIONS
  // ============================================
  console.log('📝 Creating roles and permissions...');

  const roles = await Promise.all([
    prisma.roleModel.upsert({
      where: { name: 'super_admin' },
      update: {},
      create: { name: 'super_admin', description: 'Full system access' },
    }),
    prisma.roleModel.upsert({
      where: { name: 'admin' },
      update: {},
      create: { name: 'admin', description: 'Administrative access' },
    }),
    prisma.roleModel.upsert({
      where: { name: 'editor' },
      update: {},
      create: { name: 'editor', description: 'Content editor' },
    }),
    prisma.roleModel.upsert({
      where: { name: 'author' },
      update: {},
      create: { name: 'author', description: 'Content author' },
    }),
    prisma.roleModel.upsert({
      where: { name: 'contributor' },
      update: {},
      create: { name: 'contributor', description: 'Content contributor' },
    }),
    prisma.roleModel.upsert({
      where: { name: 'moderator' },
      update: {},
      create: { name: 'moderator', description: 'Community moderator' },
    }),
    prisma.roleModel.upsert({
      where: { name: 'user' },
      update: {},
      create: { name: 'user', description: 'Regular user' },
    }),
  ]);

  console.log(`✅ Created ${roles.length} roles`);

  // Create permissions
  const permissions = await Promise.all([
    prisma.permission.upsert({
      where: { name: 'content:read' },
      update: {},
      create: { name: 'content:read', module: 'content', description: 'Read content' },
    }),
    prisma.permission.upsert({
      where: { name: 'content:create' },
      update: {},
      create: { name: 'content:create', module: 'content', description: 'Create content' },
    }),
    prisma.permission.upsert({
      where: { name: 'content:edit:own' },
      update: {},
      create: { name: 'content:edit:own', module: 'content', description: 'Edit own content' },
    }),
    prisma.permission.upsert({
      where: { name: 'content:edit:any' },
      update: {},
      create: { name: 'content:edit:any', module: 'content', description: 'Edit any content' },
    }),
    prisma.permission.upsert({
      where: { name: 'content:publish' },
      update: {},
      create: { name: 'content:publish', module: 'content', description: 'Publish content' },
    }),
    prisma.permission.upsert({
      where: { name: 'users:manage' },
      update: {},
      create: { name: 'users:manage', module: 'users', description: 'Manage users' },
    }),
    prisma.permission.upsert({
      where: { name: 'system:admin' },
      update: {},
      create: { name: 'system:admin', module: 'system', description: 'System admin' },
    }),
  ]);

  console.log(`✅ Created ${permissions.length} permissions\n`);

  // ============================================
  // USERS
  // ============================================
  console.log('👥 Creating demo users...');

  const passwordHash = await hashPassword('Demo@1234');

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'superadmin@cybervault.dev' },
      update: {},
      create: {
        email: 'superadmin@cybervault.dev',
        passwordHash,
        displayName: 'Super Admin',
        bio: 'Platform administrator',
        emailVerified: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'admin@cybervault.dev' },
      update: {},
      create: {
        email: 'admin@cybervault.dev',
        passwordHash,
        displayName: 'Admin User',
        bio: 'System administrator',
        emailVerified: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'editor@cybervault.dev' },
      update: {},
      create: {
        email: 'editor@cybervault.dev',
        passwordHash,
        displayName: 'Editor User',
        bio: 'Content editor',
        emailVerified: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'author@cybervault.dev' },
      update: {},
      create: {
        email: 'author@cybervault.dev',
        passwordHash,
        displayName: 'Author User',
        bio: 'Content author',
        emailVerified: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'user@cybervault.dev' },
      update: {},
      create: {
        email: 'user@cybervault.dev',
        passwordHash,
        displayName: 'Regular User',
        bio: 'Platform user',
        emailVerified: true,
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Assign roles
  const superAdminRole = roles.find(r => r.name === 'super_admin');
  const adminRole = roles.find(r => r.name === 'admin');
  const editorRole = roles.find(r => r.name === 'editor');
  const authorRole = roles.find(r => r.name === 'author');
  const userRole = roles.find(r => r.name === 'user');

  if (superAdminRole && users[0]) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: users[0].id, roleId: superAdminRole.id } },
      update: {},
      create: { userId: users[0].id, roleId: superAdminRole.id },
    });
  }

  if (adminRole && users[1]) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: users[1].id, roleId: adminRole.id } },
      update: {},
      create: { userId: users[1].id, roleId: adminRole.id },
    });
  }

  if (editorRole && users[2]) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: users[2].id, roleId: editorRole.id } },
      update: {},
      create: { userId: users[2].id, roleId: editorRole.id },
    });
  }

  if (authorRole && users[3]) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: users[3].id, roleId: authorRole.id } },
      update: {},
      create: { userId: users[3].id, roleId: authorRole.id },
    });
  }

  if (userRole && users[4]) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: users[4].id, roleId: userRole.id } },
      update: {},
      create: { userId: users[4].id, roleId: userRole.id },
    });
  }

  console.log('✅ Assigned roles to users\n');

  // ============================================
  // CATEGORIES
  // ============================================
  console.log('📁 Creating categories...');

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'threat-analysis' },
      update: {},
      create: {
        name: 'Threat Analysis',
        slug: 'threat-analysis',
        description: 'Analysis of current and emerging cyber threats',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'penetration-testing' },
      update: {},
      create: {
        name: 'Penetration Testing',
        slug: 'penetration-testing',
        description: 'Guides and tutorials on penetration testing',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'cloud-security' },
      update: {},
      create: {
        name: 'Cloud Security',
        slug: 'cloud-security',
        description: 'Securing cloud infrastructure and services',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'incident-response' },
      update: {},
      create: {
        name: 'Incident Response',
        slug: 'incident-response',
        description: 'IR procedures and post-incident analysis',
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories\n`);

  // ============================================
  // TAGS
  // ============================================
  console.log('🏷️  Creating tags...');

  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: 'ransomware' },
      update: {},
      create: { name: 'Ransomware', slug: 'ransomware' },
    }),
    prisma.tag.upsert({
      where: { slug: 'apt' },
      update: {},
      create: { name: 'APT', slug: 'apt' },
    }),
    prisma.tag.upsert({
      where: { slug: 'burp-suite' },
      update: {},
      create: { name: 'Burp Suite', slug: 'burp-suite' },
    }),
    prisma.tag.upsert({
      where: { slug: 'kubernetes' },
      update: {},
      create: { name: 'Kubernetes', slug: 'kubernetes' },
    }),
    prisma.tag.upsert({
      where: { slug: 'python' },
      update: {},
      create: { name: 'Python', slug: 'python' },
    }),
  ]);

  console.log(`✅ Created ${tags.length} tags\n`);

  // ============================================
  // ARTICLES
  // ============================================
  console.log('📝 Creating articles...');

  const articles = await Promise.all([
    prisma.article.upsert({
      where: { slug: 'understanding-ransomware-attack-chains-2024' },
      update: {},
      create: {
        slug: 'understanding-ransomware-attack-chains-2024',
        title: 'Understanding Modern Ransomware Attack Chains in 2024',
        excerpt: 'A comprehensive analysis of how ransomware groups operate in 2024.',
        content: 'Ransomware continues to evolve as one of the most devastating cyber threats...',
        contentType: 'article',
        status: 'published',
        authorId: users[3].id,
        categoryId: categories[0].id,
        readingTimeMinutes: 10,
        publishedAt: new Date(),
        createdById: users[3].id,
        updatedById: users[3].id,
      },
    }),
    prisma.article.upsert({
      where: { slug: 'burp-suite-beginner-guide' },
      update: {},
      create: {
        slug: 'burp-suite-beginner-guide',
        title: 'Burp Suite: A Beginner\'s Guide',
        excerpt: 'Learn how to set up and use Burp Suite for web application security testing.',
        content: 'Burp Suite is the industry-standard tool for web application security testing...',
        contentType: 'tutorial',
        status: 'published',
        authorId: users[3].id,
        categoryId: categories[1].id,
        readingTimeMinutes: 15,
        publishedAt: new Date(),
        createdById: users[3].id,
        updatedById: users[3].id,
      },
    }),
  ]);

  console.log(`✅ Created ${articles.length} articles\n`);

  // ============================================
  // STATISTICS
  // ============================================
  const stats = {
    users: await prisma.user.count(),
    roles: await prisma.roleModel.count(),
    permissions: await prisma.permission.count(),
    categories: await prisma.category.count(),
    tags: await prisma.tag.count(),
    articles: await prisma.article.count(),
  };

  console.log('📊 Database Statistics:');
  console.log(`   Users: ${stats.users}`);
  console.log(`   Roles: ${stats.roles}`);
  console.log(`   Permissions: ${stats.permissions}`);
  console.log(`   Categories: ${stats.categories}`);
  console.log(`   Tags: ${stats.tags}`);
  console.log(`   Articles: ${stats.articles}`);

  console.log('\n🎉 Database seed completed successfully!');
  console.log('\n📝 Demo Credentials:');
  console.log('   Email: superadmin@cybervault.dev | Password: Demo@1234');
  console.log('   Email: admin@cybervault.dev | Password: Demo@1234');
  console.log('   Email: editor@cybervault.dev | Password: Demo@1234');
  console.log('   Email: author@cybervault.dev | Password: Demo@1234');
  console.log('   Email: user@cybervault.dev | Password: Demo@1234');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
