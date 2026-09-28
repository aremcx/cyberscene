/**
 * Threat Intelligence Schema Types
 * Database types for threat actors, malware, threat reports, and indicators.
 */

// ============================================
// ENUMS
// ============================================

export enum ThreatActorClassification {
  CRIMINAL = 'criminal',
  STATE_SPONSORED = 'state_sponsored',
  HACKTIVIST = 'hacktivist',
  INSIDER = 'insider',
  UNKNOWN = 'unknown',
}

export enum MalwareType {
  RANSOMWARE = 'ransomware',
  TROJAN = 'trojan',
  WORM = 'worm',
  VIRUS = 'virus',
  SPYWARE = 'spyware',
  ROOTKIT = 'rootkit',
  BOTNET = 'botnet',
  KEYLOGGER = 'keylogger',
  FILELESS = 'fileless',
  OTHER = 'other',
}

export enum IndicatorType {
  DOMAIN = 'domain',
  IP = 'ip',
  URL = 'url',
  FILE_HASH = 'file_hash',
  EMAIL = 'email',
}

export enum ThreatSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info',
}

// ============================================
// MODELS
// ============================================

export interface ThreatActor {
  id: string;
  name: string;
  aliases: string[];
  description: string;
  classification: ThreatActorClassification;
  knownTargets: string[];
  geography: string[];
  techniques: string[];
  references: string[];
  isActive: boolean;
  firstSeen: string | null;
  lastSeen: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Malware {
  id: string;
  name: string;
  type: MalwareType;
  description: string;
  targets: string[];
  associatedActors: string[]; // Threat actor IDs
  detectionInfo: string;
  mitigation: string;
  references: string[];
  firstSeen: string | null;
  lastSeen: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ThreatReport {
  id: string;
  title: string;
  summary: string;
  threatActorId: string | null;
  malwareIds: string[];
  targetSector: string[];
  geography: string[];
  techniques: string[];
  indicators: string[]; // Indicator IDs
  detectionGuidance: string;
  mitigation: string;
  references: string[];
  publicationDate: string;
  severity: ThreatSeverity;
  createdAt: string;
  updatedAt: string;
}

export interface Indicator {
  id: string;
  type: IndicatorType;
  value: string;
  description: string;
  severity: ThreatSeverity;
  firstSeen: string | null;
  lastSeen: string | null;
  context: string;
  references: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================================
// INPUT TYPES
// ============================================

export interface CreateThreatActorInput {
  name: string;
  aliases?: string[];
  description: string;
  classification: ThreatActorClassification;
  knownTargets?: string[];
  geography?: string[];
  techniques?: string[];
  references?: string[];
  isActive?: boolean;
  firstSeen?: string | null;
  lastSeen?: string | null;
}

export interface CreateMalwareInput {
  name: string;
  type: MalwareType;
  description: string;
  targets?: string[];
  associatedActors?: string[];
  detectionInfo: string;
  mitigation: string;
  references?: string[];
  firstSeen?: string | null;
  lastSeen?: string | null;
}

export interface CreateThreatReportInput {
  title: string;
  summary: string;
  threatActorId?: string | null;
  malwareIds?: string[];
  targetSector?: string[];
  geography?: string[];
  techniques?: string[];
  indicators?: string[];
  detectionGuidance: string;
  mitigation: string;
  references?: string[];
  publicationDate: string;
  severity: ThreatSeverity;
}

export interface CreateIndicatorInput {
  type: IndicatorType;
  value: string;
  description: string;
  severity: ThreatSeverity;
  firstSeen?: string | null;
  lastSeen?: string | null;
  context: string;
  references?: string[];
}

// ============================================
// FILTER TYPES
// ============================================

export interface ThreatActorFilters {
  classification?: ThreatActorClassification;
  isActive?: boolean;
  search?: string;
}

export interface MalwareFilters {
  type?: MalwareType;
  search?: string;
}

export interface ThreatReportFilters {
  severity?: ThreatSeverity;
  threatActorId?: string;
  targetSector?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface IndicatorFilters {
  type?: IndicatorType;
  severity?: ThreatSeverity;
  search?: string;
}
