/**
 * Notification Service
 * Manages in-app notifications for various platform events.
 */

import { db } from '../db/store';
import type { Notification } from '../db/schema';
import { NotificationType } from '../db/schema';
import { createLogger } from '../lib/logger';

const logger = createLogger('notifications');

export type { NotificationType } from '../db/schema';

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Create a new notification
 */
export function createNotification(input: CreateNotificationInput): Notification {
  const notification = db.createNotification(
    input.userId,
    input.type,
    input.title,
    input.message,
    input.link
  );

  logger.info('Notification created', {
    userId: input.userId,
    type: input.type,
    notificationId: notification.id,
  });

  return notification;
}

/**
 * Get notifications for a user
 */
export function getUserNotifications(
  userId: string,
  options: { unreadOnly?: boolean; limit?: number } = {}
): Notification[] {
  return db.getUserNotifications(userId, options.unreadOnly);
}

/**
 * Get unread notification count
 */
export function getUnreadCount(userId: string): number {
  return db.getUnreadNotificationCount(userId);
}

/**
 * Mark a notification as read
 */
export function markAsRead(notificationId: string): void {
  db.markNotificationRead(notificationId);
}

/**
 * Mark all notifications as read for a user
 */
export function markAllAsRead(userId: string): void {
  db.markAllNotificationsRead(userId);
}

// ============================================
// NOTIFICATION TEMPLATES
// ============================================

/**
 * Notify about article approval
 */
export function notifyArticleApproved(userId: string, articleTitle: string, articleSlug: string): void {
  createNotification({
    userId,
    type: NotificationType.ARTICLE_PUBLISHED,
    title: 'Article Approved',
    message: `Your article "${articleTitle}" has been approved and published.`,
    link: `/articles/${articleSlug}`,
  });
}

/**
 * Notify about article rejection
 */
export function notifyArticleRejected(userId: string, articleTitle: string, reason?: string): void {
  createNotification({
    userId,
    type: NotificationType.SYSTEM,
    title: 'Article Rejected',
    message: `Your article "${articleTitle}" was not approved.${reason ? ` Reason: ${reason}` : ''}`,
    link: '/dashboard/articles',
  });
}

/**
 * Notify about new comment
 */
export function notifyNewComment(
  userId: string,
  commenterName: string,
  articleTitle: string,
  articleSlug: string
): void {
  createNotification({
    userId,
    type: NotificationType.COMMENT_REPLY,
    title: 'New Comment',
    message: `${commenterName} commented on your article "${articleTitle}".`,
    link: `/articles/${articleSlug}#comments`,
  });
}

/**
 * Notify about reply to comment
 */
export function notifyCommentReply(
  userId: string,
  replierName: string,
  articleTitle: string,
  articleSlug: string
): void {
  createNotification({
    userId,
    type: NotificationType.COMMENT_REPLY,
    title: 'New Reply',
    message: `${replierName} replied to your comment on "${articleTitle}".`,
    link: `/articles/${articleSlug}#comments`,
  });
}

/**
 * Notify about course completion
 */
export function notifyCourseCompleted(userId: string, courseTitle: string): void {
  createNotification({
    userId,
    type: NotificationType.SYSTEM,
    title: 'Course Completed! 🎉',
    message: `Congratulations! You've completed "${courseTitle}".`,
    link: '/academy/dashboard',
  });
}

/**
 * Notify about lab completion
 */
export function notifyLabCompleted(userId: string, labTitle: string, points: number): void {
  createNotification({
    userId,
    type: NotificationType.SYSTEM,
    title: 'Lab Completed! 🔬',
    message: `You've completed the "${labTitle}" lab and earned ${points} points!`,
    link: '/academy/dashboard',
  });
}

/**
 * Notify about new job matching user's skills
 */
export function notifyNewJob(userId: string, jobTitle: string, company: string, jobId: string): void {
  createNotification({
    userId,
    type: NotificationType.SYSTEM,
    title: 'New Job Opportunity',
    message: `A new job matching your skills is available: ${jobTitle} at ${company}.`,
    link: `/jobs/${jobId}`,
  });
}

/**
 * Notify about upcoming event
 */
export function notifyUpcomingEvent(userId: string, eventName: string, eventId: string, daysUntil: number): void {
  createNotification({
    userId,
    type: NotificationType.SYSTEM,
    title: 'Upcoming Event',
    message: `"${eventName}" starts in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}.`,
    link: `/events/${eventId}`,
  });
}

/**
 * Send platform announcement to all users
 */
export function sendPlatformAnnouncement(title: string, message: string, link?: string): void {
  const users = db.listUsers({ page: 1, pageSize: 1000 });
  
  users.data.forEach(user => {
    createNotification({
      userId: user.id,
      type: NotificationType.SYSTEM,
      title,
      message,
      link,
    });
  });

  logger.info('Platform announcement sent', {
    title,
    recipientCount: users.data.length,
  });
}

/**
 * Notify about badge earned
 */
export function notifyBadgeEarned(userId: string, badgeName: string, badgeIcon: string): void {
  createNotification({
    userId,
    type: NotificationType.SYSTEM,
    title: 'Badge Earned! 🏆',
    message: `You've earned the "${badgeName}" badge ${badgeIcon}!`,
    link: '/academy/dashboard',
  });
}

/**
 * Notify about new follower
 */
export function notifyNewFollower(userId: string, followerName: string): void {
  createNotification({
    userId,
    type: NotificationType.SYSTEM,
    title: 'New Follower',
    message: `${followerName} is now following you.`,
    link: '/community',
  });
}
