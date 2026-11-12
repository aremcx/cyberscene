/**
 * Tools Directory Schema Types
 * Database types for cybersecurity tools tracking.
 */

// ============================================
// ENUMS
// ============================================

export enum ToolCategory {
  SIEM = 'siem',
  EDR = 'edr',
  VULNERABILITY_SCANNERS = 'vulnerability_scanners',
  NETWORK_SECURITY = 'network_security',
  OSINT = 'osint',
  DIGITAL_FORENSICS = 'digital_forensics',
  MALWARE_ANALYSIS = 'malware_analysis',
  PENETRATION_TESTING = 'penetration_testing',
  WEB_SECURITY = 'web_security',
  CLOUD_SECURITY = 'cloud_security',
  THREAT_INTELLIGENCE = 'threat_intelligence',
  PASSWORD_AUDITING = 'password_auditing',
  SECURITY_MONITORING = 'security_monitoring',
}

export enum ToolPlatform {
  WINDOWS = 'windows',
  LINUX = 'linux',
  MACOS = 'macos',
  CROSS_PLATFORM = 'cross_platform',
  WEB = 'web',
  CLOUD = 'cloud',
  MOBILE = 'mobile',
}

export enum ToolLicense {
  OPEN_SOURCE = 'open_source',
  COMMERCIAL = 'commercial',
  FREEMIUM = 'freemium',
  FREE = 'free',
}

export enum SkillLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

// ============================================
// MODELS
// ============================================

export interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  logoUrl: string | null;
  category: ToolCategory;
  platforms: ToolPlatform[];
  license: ToolLicense;
  website: string;
  documentationUrl: string | null;
  githubUrl: string | null;
  useCases: string[];
  skillLevel: SkillLevel;
  relatedTutorialIds: string[];
  relatedArticleIds: string[];
  pricing: string | null;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// INPUT TYPES
// ============================================

export interface CreateToolInput {
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  logoUrl?: string | null;
  category: ToolCategory;
  platforms: ToolPlatform[];
  license: ToolLicense;
  website: string;
  documentationUrl?: string | null;
  githubUrl?: string | null;
  useCases?: string[];
  skillLevel: SkillLevel;
  relatedTutorialIds?: string[];
  relatedArticleIds?: string[];
  pricing?: string | null;
  features?: string[];
  isActive?: boolean;
}

export interface UpdateToolInput {
  name?: string;
  slug?: string;
  description?: string;
  longDescription?: string;
  logoUrl?: string | null;
  category?: ToolCategory;
  platforms?: ToolPlatform[];
  license?: ToolLicense;
  website?: string;
  documentationUrl?: string | null;
  githubUrl?: string | null;
  useCases?: string[];
  skillLevel?: SkillLevel;
  relatedTutorialIds?: string[];
  relatedArticleIds?: string[];
  pricing?: string | null;
  features?: string[];
  isActive?: boolean;
}

// ============================================
// FILTER TYPES
// ============================================

export interface ToolFilters {
  category?: ToolCategory;
  platform?: ToolPlatform;
  license?: ToolLicense;
  skillLevel?: SkillLevel;
  search?: string;
  isActive?: boolean;
}
