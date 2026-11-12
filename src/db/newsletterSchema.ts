/**
 * Newsletter Schema Types
 * Database types for newsletter subscriptions, preferences, and campaigns.
 */

// ============================================
// ENUMS
// ============================================

export enum NewsletterCategory {
  NEWS = 'news',
  THREAT_INTELLIGENCE = 'threat_intelligence',
  VULNERABILITIES = 'vulnerabilities',
  TUTORIALS = 'tutorials',
  CAREERS = 'careers',
  EVENTS = 'events',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  UNSUBSCRIBED = 'unsubscribed',
  PENDING = 'pending',
  BOUNCED = 'bounced',
}

export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  SENDING = 'sending',
  SENT = 'sent',
  CANCELLED = 'cancelled',
}

// ============================================
// MODELS
// ============================================

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name: string | null;
  status: SubscriptionStatus;
  categories: NewsletterCategory[];
  verificationToken: string | null;
  verifiedAt: string | null;
  unsubscribedAt: string | null;
  subscribedAt: string;
  userId: string | null; // Link to user account if registered
  createdAt: string;
  updatedAt: string;
}

export interface NewsletterCampaign {
  id: string;
  title: string;
  subject: string;
  content: string;
  categories: NewsletterCategory[];
  status: CampaignStatus;
  scheduledAt: string | null;
  sentAt: string | null;
  createdBy: string;
  recipientCount: number;
  sentCount: number;
  openedCount: number;
  clickedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface NewsletterPreference {
  id: string;
  userId: string;
  emailNotifications: boolean;
  categories: NewsletterCategory[];
  frequency: 'daily' | 'weekly' | 'monthly';
  createdAt: string;
  updatedAt: string;
}

// ============================================
// INPUT TYPES
// ============================================

export interface SubscribeInput {
  email: string;
  name?: string;
  categories?: NewsletterCategory[];
  userId?: string;
}

export interface CreateCampaignInput {
  title: string;
  subject: string;
  content: string;
  categories: NewsletterCategory[];
  scheduledAt?: string | null;
  createdBy: string;
}

// ============================================
// FILTER TYPES
// ============================================

export interface SubscriberFilters {
  status?: SubscriptionStatus;
  category?: NewsletterCategory;
  search?: string;
}

export interface CampaignFilters {
  status?: CampaignStatus;
  search?: string;
}
