/**
 * Events Schema Types
 * Database types for cybersecurity events.
 */

// ============================================
// ENUMS
// ============================================

export enum EventType {
  CONFERENCE = 'conference',
  WEBINAR = 'webinar',
  CTF = 'ctf',
  HACKATHON = 'hackathon',
  TRAINING = 'training',
  MEETUP = 'meetup',
  WORKSHOP = 'workshop',
}

export enum EventMode {
  ONLINE = 'online',
  OFFLINE = 'offline',
  HYBRID = 'hybrid',
}

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

// ============================================
// MODELS
// ============================================

export interface Event {
  id: string;
  name: string;
  slug: string;
  description: string;
  organizer: string;
  location: string;
  country: string;
  mode: EventMode;
  eventType: EventType;
  category: string;
  startDate: string;
  endDate: string | null;
  registrationUrl: string | null;
  websiteUrl: string | null;
  capacity: number | null;
  registeredCount: number;
  status: EventStatus;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// INPUT TYPES
// ============================================

export interface CreateEventInput {
  name: string;
  slug: string;
  description: string;
  organizer: string;
  location: string;
  country: string;
  mode: EventMode;
  eventType: EventType;
  category: string;
  startDate: string;
  endDate?: string | null;
  registrationUrl?: string | null;
  websiteUrl?: string | null;
  capacity?: number | null;
  status?: EventStatus;
  isFeatured?: boolean;
}

export interface UpdateEventInput {
  name?: string;
  slug?: string;
  description?: string;
  organizer?: string;
  location?: string;
  country?: string;
  mode?: EventMode;
  eventType?: EventType;
  category?: string;
  startDate?: string;
  endDate?: string | null;
  registrationUrl?: string | null;
  websiteUrl?: string | null;
  capacity?: number | null;
  status?: EventStatus;
  isFeatured?: boolean;
}

// ============================================
// FILTER TYPES
// ============================================

export interface EventFilters {
  eventType?: EventType;
  mode?: EventMode;
  country?: string;
  category?: string;
  search?: string;
  status?: EventStatus;
  startDateFrom?: string;
  startDateTo?: string;
}
