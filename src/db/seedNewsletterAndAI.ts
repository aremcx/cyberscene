/**
 * Newsletter & AI Seed Data
 * Populates the database with newsletter subscribers, campaigns, and AI conversations.
 */

import { db } from './store';
import { NewsletterCategory, SubscriptionStatus } from './newsletterSchema';
import { DEMO_USERS } from './seed';

export function seedNewsletterAndAI(): void {
  seedNewsletterSubscribers();
  seedNewsletterCampaigns();
  seedAIConversations();
}

function seedNewsletterSubscribers(): void {
  const subscribers = [
    {
      email: 'subscriber1@example.com',
      name: 'John Doe',
      categories: [NewsletterCategory.NEWS, NewsletterCategory.THREAT_INTELLIGENCE],
      status: SubscriptionStatus.ACTIVE,
    },
    {
      email: 'subscriber2@example.com',
      name: 'Jane Smith',
      categories: [NewsletterCategory.TUTORIALS, NewsletterCategory.CAREERS],
      status: SubscriptionStatus.ACTIVE,
    },
    {
      email: 'subscriber3@example.com',
      name: 'Bob Johnson',
      categories: [NewsletterCategory.VULNERABILITIES, NewsletterCategory.EVENTS],
      status: SubscriptionStatus.ACTIVE,
    },
    {
      email: 'subscriber4@example.com',
      categories: [NewsletterCategory.NEWS],
      status: SubscriptionStatus.UNSUBSCRIBED,
    },
    {
      email: 'subscriber5@example.com',
      name: 'Alice Williams',
      categories: [
        NewsletterCategory.NEWS,
        NewsletterCategory.THREAT_INTELLIGENCE,
        NewsletterCategory.TUTORIALS,
      ],
      status: SubscriptionStatus.ACTIVE,
    },
  ];

  for (const sub of subscribers) {
    db.subscribeNewsletter({
      email: sub.email,
      name: sub.name,
      categories: sub.categories,
    });
  }
}

function seedNewsletterCampaigns(): void {
  const campaigns = [
    {
      title: 'Weekly Cybersecurity Digest - Week 1',
      subject: 'This Week in Cybersecurity',
      content: 'Welcome to this week\'s cybersecurity digest...',
      categories: [NewsletterCategory.NEWS, NewsletterCategory.THREAT_INTELLIGENCE],
      status: 'sent' as const,
      sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      recipientCount: 5,
      sentCount: 5,
      openedCount: 3,
      clickedCount: 1,
    },
    {
      title: 'Monthly Tutorial Roundup',
      subject: 'Top Tutorials This Month',
      content: 'Check out the best tutorials from this month...',
      categories: [NewsletterCategory.TUTORIALS],
      status: 'sent' as const,
      sentAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      recipientCount: 3,
      sentCount: 3,
      openedCount: 2,
      clickedCount: 2,
    },
    {
      title: 'Upcoming Events Newsletter',
      subject: 'Don\'t Miss These Events',
      content: 'Here are the upcoming cybersecurity events...',
      categories: [NewsletterCategory.EVENTS],
      status: 'draft' as const,
      recipientCount: 0,
      sentCount: 0,
      openedCount: 0,
      clickedCount: 0,
    },
  ];

  for (const campaign of campaigns) {
    db.createCampaign({
      title: campaign.title,
      subject: campaign.subject,
      content: campaign.content,
      categories: campaign.categories,
      createdBy: DEMO_USERS.ADMIN,
      scheduledAt: null,
    });
  }
}

function seedAIConversations(): void {
  // Create a sample conversation for the demo user
  const conversation = db.createAIConversation({
    userId: DEMO_USERS.REGULAR_USER,
    title: 'SQL Injection Help',
  });

  db.createAIMessage({
    conversationId: conversation.id,
    role: 'user' as any,
    content: 'Can you explain SQL injection?',
    citations: [],
  });

  db.createAIMessage({
    conversationId: conversation.id,
    role: 'assistant' as any,
    content: 'SQL injection is a code injection technique...',
    citations: [],
    metadata: {
      model: 'mock-provider',
      tokens: 150,
      latency: 800,
    },
  });
}
