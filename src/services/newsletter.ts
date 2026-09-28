/**
 * Newsletter Service
 * Manages newsletter subscriptions, preferences, and campaigns.
 */

import { db } from '../db/store';
import {
  NewsletterCategory,
  SubscriptionStatus,
  CampaignStatus,
} from '../db/newsletterSchema';
import type {
  NewsletterSubscriber,
  NewsletterCampaign,
  NewsletterPreference,
} from '../db/newsletterSchema';
import { createLogger } from '../lib/logger';
import { AppError, ErrorCode, ErrorSeverity } from '../lib/errors';

const logger = createLogger('newsletter');

export { NewsletterCategory, SubscriptionStatus, CampaignStatus };

/**
 * Subscribe to newsletter
 */
export function subscribe(
  email: string,
  name?: string,
  categories?: NewsletterCategory[],
  userId?: string
): NewsletterSubscriber {
  try {
    const subscriber = db.subscribeNewsletter({
      email,
      name,
      categories: categories ?? [NewsletterCategory.NEWS],
      userId,
    });

    logger.info('Newsletter subscription created', {
      email,
      subscriberId: subscriber.id,
    });

    return subscriber;
  } catch (error) {
    if (error instanceof Error && error.message.includes('already subscribed')) {
      throw new AppError(
        'This email is already subscribed',
        ErrorCode.CONFLICT,
        409,
        ErrorSeverity.INFO
      );
    }
    throw error;
  }
}

/**
 * Unsubscribe from newsletter
 */
export function unsubscribe(email: string): NewsletterSubscriber {
  const subscriber = db.unsubscribeNewsletter(email);

  logger.info('Newsletter unsubscription', {
    email,
    subscriberId: subscriber.id,
  });

  return subscriber;
}

/**
 * Get subscriber by email
 */
export function getSubscriberByEmail(email: string): NewsletterSubscriber | null {
  return db.getSubscriberByEmail(email);
}

/**
 * List all subscribers
 */
export function listSubscribers(filters?: {
  status?: SubscriptionStatus;
  category?: NewsletterCategory;
  search?: string;
}): NewsletterSubscriber[] {
  return db.listSubscribers(filters);
}

/**
 * Update subscriber preferences
 */
export function updatePreferences(
  email: string,
  categories: NewsletterCategory[]
): NewsletterSubscriber {
  const subscriber = db.updateSubscriberPreferences(email, categories);

  logger.info('Newsletter preferences updated', {
    email,
    categories,
  });

  return subscriber;
}

/**
 * Get user newsletter preferences
 */
export function getUserPreferences(userId: string): NewsletterPreference | null {
  return db.getNewsletterPreferences(userId);
}

/**
 * Update user newsletter preferences
 */
export function updateUserPreferences(
  userId: string,
  preferences: Partial<NewsletterPreference>
): NewsletterPreference {
  const pref = db.updateNewsletterPreferences(userId, preferences);

  logger.info('User newsletter preferences updated', {
    userId,
    preferences,
  });

  return pref;
}

// ============================================
// CAMPAIGN MANAGEMENT
// ============================================

/**
 * Create a newsletter campaign
 */
export function createCampaign(input: {
  title: string;
  subject: string;
  content: string;
  categories: NewsletterCategory[];
  scheduledAt?: string;
  createdBy: string;
}): NewsletterCampaign {
  const campaign = db.createCampaign(input);

  logger.info('Newsletter campaign created', {
    campaignId: campaign.id,
    title: campaign.title,
    createdBy: input.createdBy,
  });

  return campaign;
}

/**
 * Get campaign by ID
 */
export function getCampaignById(id: string): NewsletterCampaign | null {
  return db.getCampaignById(id);
}

/**
 * List all campaigns
 */
export function listCampaigns(filters?: {
  status?: CampaignStatus;
  search?: string;
}): NewsletterCampaign[] {
  return db.listCampaigns(filters);
}

/**
 * Update campaign
 */
export function updateCampaign(
  id: string,
  updates: Partial<NewsletterCampaign>
): NewsletterCampaign {
  const campaign = db.updateCampaign(id, updates);

  logger.info('Newsletter campaign updated', {
    campaignId: id,
    updates,
  });

  return campaign;
}

/**
 * Delete campaign
 */
export function deleteCampaign(id: string): void {
  db.deleteCampaign(id);

  logger.info('Newsletter campaign deleted', {
    campaignId: id,
  });
}

/**
 * Send campaign immediately
 */
export function sendCampaign(id: string): NewsletterCampaign {
  const campaign = db.sendCampaign(id);

  logger.info('Newsletter campaign sent', {
    campaignId: id,
    recipientCount: campaign.recipientCount,
  });

  // In production, this would trigger actual email sending
  // For now, we just update the status

  return campaign;
}

/**
 * Get campaign statistics
 */
export function getCampaignStats(id: string): {
  recipientCount: number;
  sentCount: number;
  openedCount: number;
  clickedCount: number;
  openRate: number;
  clickRate: number;
} {
  const campaign = db.getCampaignById(id);
  if (!campaign) {
    throw new AppError('Campaign not found', ErrorCode.NOT_FOUND, 404, ErrorSeverity.INFO);
  }

  const openRate = campaign.sentCount > 0
    ? (campaign.openedCount / campaign.sentCount) * 100
    : 0;

  const clickRate = campaign.sentCount > 0
    ? (campaign.clickedCount / campaign.sentCount) * 100
    : 0;

  return {
    recipientCount: campaign.recipientCount,
    sentCount: campaign.sentCount,
    openedCount: campaign.openedCount,
    clickedCount: campaign.clickedCount,
    openRate,
    clickRate,
  };
}

/**
 * Get subscriber statistics
 */
export function getSubscriberStats(): {
  total: number;
  active: number;
  unsubscribed: number;
  byCategory: Record<NewsletterCategory, number>;
} {
  const subscribers = db.listSubscribers();

  const active = subscribers.filter(s => s.status === SubscriptionStatus.ACTIVE).length;
  const unsubscribed = subscribers.filter(s => s.status === SubscriptionStatus.UNSUBSCRIBED).length;

  const byCategory = Object.values(NewsletterCategory).reduce((acc, category) => {
    acc[category] = subscribers.filter(s =>
      s.status === SubscriptionStatus.ACTIVE && s.categories.includes(category)
    ).length;
    return acc;
  }, {} as Record<NewsletterCategory, number>);

  return {
    total: subscribers.length,
    active,
    unsubscribed,
    byCategory,
  };
}
