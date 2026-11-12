/**
 * Jobs Schema Types
 * Database types for cybersecurity job listings.
 */

// ============================================
// ENUMS
// ============================================

export enum JobType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  INTERNSHIP = 'internship',
  FREELANCE = 'freelance',
}

export enum WorkMode {
  REMOTE = 'remote',
  ONSITE = 'onsite',
  HYBRID = 'hybrid',
}

export enum ExperienceLevel {
  ENTRY = 'entry',
  JUNIOR = 'junior',
  MID_LEVEL = 'mid_level',
  SENIOR = 'senior',
  LEAD = 'lead',
  EXECUTIVE = 'executive',
}

export enum JobStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  CLOSED = 'closed',
  EXPIRED = 'expired',
}

// ============================================
// MODELS
// ============================================

export interface Job {
  id: string;
  title: string;
  slug: string;
  company: string;
  description: string;
  location: string;
  country: string;
  workMode: WorkMode;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  skills: string[];
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  applicationUrl: string;
  closingDate: string | null;
  postedDate: string;
  status: JobStatus;
  postedById: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// INPUT TYPES
// ============================================

export interface CreateJobInput {
  title: string;
  slug: string;
  company: string;
  description: string;
  location: string;
  country: string;
  workMode: WorkMode;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  skills: string[];
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string;
  applicationUrl: string;
  closingDate?: string | null;
  postedDate: string;
  status?: JobStatus;
  postedById: string;
}

export interface UpdateJobInput {
  title?: string;
  slug?: string;
  company?: string;
  description?: string;
  location?: string;
  country?: string;
  workMode?: WorkMode;
  jobType?: JobType;
  experienceLevel?: ExperienceLevel;
  skills?: string[];
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string;
  applicationUrl?: string;
  closingDate?: string | null;
  status?: JobStatus;
}

// ============================================
// FILTER TYPES
// ============================================

export interface JobFilters {
  jobType?: JobType;
  workMode?: WorkMode;
  experienceLevel?: ExperienceLevel;
  country?: string;
  skills?: string[];
  search?: string;
  status?: JobStatus;
  salaryMin?: number;
  salaryMax?: number;
}
