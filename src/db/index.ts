/**
 * Database Module
 * Initializes the database, runs migrations, and seeds data.
 */

import { db } from './store';
import { seedDatabase, DEMO_CREDENTIALS, DEMO_USERS } from './seed';
import { logger } from '../lib/logger';

/**
 * Database status
 */
export interface DatabaseStatus {
  initialized: boolean;
  seeded: boolean;
  stats: Record<string, number>;
}

let isInitialized = false;
let isSeeded = false;

/**
 * Initialize the database
 * In production, this would run Prisma migrations.
 * In development/demo, this seeds the in-memory store.
 */
export function initializeDatabase(options?: { seed?: boolean }): DatabaseStatus {
  logger.db.info('Initializing database...');

  // Reset state
  db.reset();
  isInitialized = true;

  // Seed if requested (default: true for demo)
  if (options?.seed !== false) {
    logger.db.info('Seeding database with demo data...');
    seedDatabase();
    isSeeded = true;
    logger.db.info('Database seeded successfully');
  }

  const stats = db.getStats();
  logger.db.info('Database initialized', { stats });

  return {
    initialized: isInitialized,
    seeded: isSeeded,
    stats,
  };
}

/**
 * Reset the database (clear all data)
 */
export function resetDatabase(): void {
  logger.db.warn('Resetting database...');
  db.reset();
  isSeeded = false;
  logger.db.info('Database reset complete');
}

/**
 * Re-seed the database
 */
export function reseedDatabase(): DatabaseStatus {
  logger.db.info('Re-seeding database...');
  seedDatabase();
  isSeeded = true;
  return {
    initialized: isInitialized,
    seeded: isSeeded,
    stats: db.getStats(),
  };
}

/**
 * Get database status
 */
export function getDatabaseStatus(): DatabaseStatus {
  return {
    initialized: isInitialized,
    seeded: isSeeded,
    stats: db.getStats(),
  };
}

// Re-export useful items
export { DEMO_CREDENTIALS, DEMO_USERS } from './seed';
export { db } from './store';
