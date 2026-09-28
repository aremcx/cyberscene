/**
 * Community Schema Types
 * Database types for discussions, comments, user interactions, and moderation.
 */

// ============================================
// ENUMS
// ============================================

export enum DiscussionType {
  GENERAL = 'general',
  QUESTION = 'question',
  DISCUSSION = 'discussion',
  HELP = 'help',
  SHOWCASE = 'showcase',
}

export enum ReportReason {
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  INAPPROPRIATE = 'inappropriate',
  MISINFORMATION = 'misinformation',
  OFF_TOPIC = 'off_topic',
  OTHER = 'other',
}

export enum ReportStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

export enum CommentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  HIDDEN = 'hidden',
}

// ============================================
// DISCUSSIONS
// ============================================

export interface Discussion {
  id: string;
  title: string;
  slug: string;
  content: string;
  type: DiscussionType;
  authorId: string;
  categoryId: string | null;
  tags: string[];
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// COMMENTS (Enhanced with replies)
// ============================================

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  discussionId: string | null;
  articleId: string | null;
  parentId: string | null; // For nested replies
  status: CommentStatus;
  isEdited: boolean;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// USER FOLLOWING
// ============================================

export interface UserFollow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

// ============================================
// USER REPORTS
// ============================================

export interface UserReport {
  id: string;
  reporterId: string;
  reportedUserId: string | null;
  reportedCommentId: string | null;
  reportedDiscussionId: string | null;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  moderatorNotes: string | null;
  resolvedBy: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// MODERATION LOG
// ============================================

export interface ModerationAction {
  id: string;
  moderatorId: string;
  action: string;
  targetType: string;
  targetId: string;
  reason: string;
  createdAt: string;
}

// ============================================
// INPUT TYPES
// ============================================

export interface CreateDiscussionInput {
  title: string;
  slug: string;
  content: string;
  type: DiscussionType;
  authorId: string;
  categoryId?: string | null;
  tags?: string[];
  isPinned?: boolean;
  isLocked?: boolean;
}

export interface CreateCommentInput {
  content: string;
  authorId: string;
  discussionId?: string | null;
  articleId?: string | null;
  parentId?: string | null;
  status?: CommentStatus;
}

export interface CreateReportInput {
  reporterId: string;
  reportedUserId?: string | null;
  reportedCommentId?: string | null;
  reportedDiscussionId?: string | null;
  reason: ReportReason;
  description: string;
}

// ============================================
// FILTER TYPES
// ============================================

export interface DiscussionFilters {
  type?: DiscussionType;
  authorId?: string;
  categoryId?: string;
  isPinned?: boolean;
  search?: string;
}

export interface ReportFilters {
  status?: ReportStatus;
  reason?: ReportReason;
  reporterId?: string;
}
