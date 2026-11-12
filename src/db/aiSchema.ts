/**
 * AI Assistant Schema Types
 * Database types for AI assistant conversations and usage tracking.
 */

// ============================================
// ENUMS
// ============================================

export enum ConversationStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

// ============================================
// MODELS
// ============================================

export interface AIConversation {
  id: string;
  userId: string;
  title: string;
  status: ConversationStatus;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AIMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  citations: string[]; // Article IDs referenced
  metadata: {
    model?: string;
    tokens?: number;
    latency?: number;
  };
  createdAt: string;
}

export interface AIUsageMetrics {
  id: string;
  userId: string;
  conversationId: string;
  messageCount: number;
  totalTokens: number;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

// ============================================
// INPUT TYPES
// ============================================

export interface CreateConversationInput {
  userId: string;
  title?: string;
}

export interface CreateMessageInput {
  conversationId: string;
  role: MessageRole;
  content: string;
  citations?: string[];
  metadata?: {
    model?: string;
    tokens?: number;
    latency?: number;
  };
}

// ============================================
// AI PROVIDER INTERFACE
// ============================================

export interface AIProvider {
  name: string;
  generateResponse(
    messages: Array<{ role: MessageRole; content: string }>,
    context?: string
  ): Promise<{
    content: string;
    tokens: number;
    latency: number;
  }>;
}

export interface AIAssistantConfig {
  provider: AIProvider;
  rateLimit: {
    maxRequests: number;
    windowMs: number;
  };
  maxContextLength: number;
  systemPrompt: string;
}
