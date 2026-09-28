/**
 * AI Assistant Service
 * Provides AI-powered cybersecurity assistance using the platform's knowledge base.
 */

import { db } from '../db/store';
import { createAIProvider } from './aiProvider';
import { MessageRole } from '../db/aiSchema';
import type { AIMessage, AIConversation } from '../db/aiSchema';
import { RateLimitError, AppError, ErrorCode, ErrorSeverity } from '../lib/errors';
import { createLogger } from '../lib/logger';

const logger = createLogger('ai-assistant');

// Rate limiting
const userRequestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX_REQUESTS = 20;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// Safety keywords that should trigger content filtering
const BLOCKED_KEYWORDS = [
  'how to hack',
  'how to steal',
  'malware deployment',
  'credential theft',
  'unauthorized access',
  'exploit for attack',
  'attack tutorial',
];

export interface AIResponse {
  content: string;
  citations: string[];
  conversationId: string;
  messageId: string;
}

/**
 * Check if user has exceeded rate limit
 */
function checkRateLimit(userId: string): void {
  const now = Date.now();
  const userData = userRequestCounts.get(userId);

  if (!userData || now > userData.resetTime) {
    userRequestCounts.set(userId, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return;
  }

  if (userData.count >= RATE_LIMIT_MAX_REQUESTS) {
    throw new RateLimitError(
      `Rate limit exceeded. Maximum ${RATE_LIMIT_MAX_REQUESTS} requests per hour.`
    );
  }

  userData.count++;
  userRequestCounts.set(userId, userData);
}

/**
 * Check if query contains blocked keywords
 */
function isQuerySafe(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  return !BLOCKED_KEYWORDS.some(keyword => lowerQuery.includes(keyword));
}

/**
 * Search knowledge base for relevant content
 */
function searchKnowledgeBase(query: string): { articles: string[]; context: string } {
  const articles = db.listArticles({ page: 1, pageSize: 5 }, undefined, {
    status: 'published' as any,
    search: query,
  });

  if (articles.data.length === 0) {
    return { articles: [], context: '' };
  }

  const articleIds = articles.data.map(a => a.id);
  const context = articles.data
    .map((article, idx) => `${idx + 1}. **${article.title}**\n   ${article.excerpt}`)
    .join('\n\n');

  return { articles: articleIds, context };
}

/**
 * Start a new conversation
 */
export function startConversation(userId: string, title?: string): AIConversation {
  return db.createAIConversation({ userId, title });
}

/**
 * Get conversation history
 */
export function getConversationHistory(conversationId: string): AIMessage[] {
  return db.listAIMessages(conversationId);
}

/**
 * List user conversations
 */
export function listUserConversations(userId: string): AIConversation[] {
  return db.listAIConversations(userId);
}

/**
 * Send a message and get AI response
 */
export async function sendMessage(
  userId: string,
  conversationId: string,
  userMessage: string
): Promise<AIResponse> {
  // Check rate limit
  checkRateLimit(userId);

  // Safety check
  if (!isQuerySafe(userMessage)) {
    const response = `I cannot provide information that could facilitate unauthorized attacks, credential theft, malware deployment, or other harmful activities. 

If you're interested in cybersecurity for defensive purposes, I'd be happy to help you understand:
- How to protect systems against attacks
- Security best practices
- Vulnerability mitigation
- Incident response procedures

Please rephrase your question with a defensive or educational focus.`;

    const message = db.createAIMessage({
      conversationId,
      role: MessageRole.ASSISTANT,
      content: response,
      citations: [],
      metadata: { model: 'safety-filter' },
    });

    return {
      content: response,
      citations: [],
      conversationId,
      messageId: message.id,
    };
  }

  // Search knowledge base
  const { articles, context } = searchKnowledgeBase(userMessage);

  // Get conversation history
  const history = getConversationHistory(conversationId);

  // Build message array for AI provider
  const messages = [
    {
      role: MessageRole.SYSTEM,
      content: `You are CyberVault AI, a cybersecurity assistant for the CyberVault platform. You help users understand cybersecurity concepts, find relevant articles, and learn about security best practices.

Important guidelines:
- Only provide educational and defensive security information
- Never provide instructions for unauthorized attacks or harmful activities
- Cite relevant articles from the platform when available
- Be clear and concise in your explanations
- Distinguish between generated explanations and source material

${context ? `\nRelevant articles from the knowledge base:\n${context}` : ''}`,
    },
    ...history.map(m => ({
      role: m.role,
      content: m.content,
    })),
    {
      role: MessageRole.USER,
      content: userMessage,
    },
  ];

  // Generate AI response
  const provider = createAIProvider();
  const startTime = Date.now();
  
  try {
    const response = await provider.generateResponse(messages, context);
    const latency = Date.now() - startTime;

    // Save user message
    db.createAIMessage({
      conversationId,
      role: MessageRole.USER,
      content: userMessage,
      citations: [],
    });

    // Save AI response
    const aiMessage = db.createAIMessage({
      conversationId,
      role: MessageRole.ASSISTANT,
      content: response.content,
      citations: articles,
      metadata: {
        model: provider.name,
        tokens: response.tokens,
        latency,
      },
    });

    // Track usage metrics
    db.trackAIUsage(userId, conversationId, 2, response.tokens); // 2 messages (user + assistant)

    logger.info('AI message generated', {
      userId,
      conversationId,
      tokens: response.tokens,
      latency,
    });

    return {
      content: response.content,
      citations: articles,
      conversationId,
      messageId: aiMessage.id,
    };
  } catch (error) {
    logger.error('AI provider error', { error: (error as Error).message });
    throw new AppError(
      'Failed to generate AI response. Please try again.',
      ErrorCode.INTERNAL_ERROR,
      500,
      ErrorSeverity.ERROR
    );
  }
}

/**
 * Delete a conversation
 */
export function deleteConversation(conversationId: string, userId: string): void {
  const conversation = db.getAIConversationById(conversationId);
  if (!conversation) {
    throw new AppError('Conversation not found', ErrorCode.NOT_FOUND, 404, ErrorSeverity.INFO);
  }
  if (conversation.userId !== userId) {
    throw new AppError('Unauthorized', ErrorCode.FORBIDDEN, 403, ErrorSeverity.WARNING);
  }
  db.deleteAIConversation(conversationId);
}

/**
 * Get usage metrics for a user
 */
export function getUsageMetrics(userId: string, days: number = 30) {
  return db.getAIUsageMetrics(userId, days);
}
