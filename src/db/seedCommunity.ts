/**
 * Community Seed Data
 * Populates the database with discussions, comments, follows, and reports.
 */

import { db } from './store';
import {
  DiscussionType,
  ReportReason,
  CommentStatus,
} from './communitySchema';
import { DEMO_USERS } from './seed';

export function seedCommunity(): void {
  seedDiscussions();
  seedComments();
  seedFollows();
  seedReports();
}

function seedDiscussions(): void {
  const discussions = [
    {
      title: 'Best practices for incident response in 2024',
      slug: 'best-practices-incident-response-2024',
      content: 'I\'ve been working on improving our incident response procedures. What are some best practices you\'ve found effective in 2024? Especially interested in automation and AI-assisted response.',
      type: DiscussionType.DISCUSSION,
      authorId: DEMO_USERS.AUTHOR_1,
      categoryId: null,
      tags: ['incident-response', 'automation', 'best-practices'],
      isPinned: true,
      isLocked: false,
    },
    {
      title: 'How to get started in penetration testing?',
      slug: 'how-to-get-started-penetration-testing',
      content: 'I\'m a software developer looking to transition into penetration testing. What certifications, tools, and learning paths would you recommend? I have a strong programming background but limited security experience.',
      type: DiscussionType.QUESTION,
      authorId: DEMO_USERS.REGULAR_USER,
      categoryId: null,
      tags: ['penetration-testing', 'career', 'certifications'],
      isPinned: false,
      isLocked: false,
    },
    {
      title: 'Showcase: My open-source security tool',
      slug: 'showcase-open-source-security-tool',
      content: 'I\'ve been working on an open-source tool for automated vulnerability scanning. It\'s built in Python and integrates with several popular security frameworks. Would love to get feedback from the community!',
      type: DiscussionType.SHOWCASE,
      authorId: DEMO_USERS.CONTRIBUTOR,
      categoryId: null,
      tags: ['open-source', 'tools', 'vulnerability-scanning'],
      isPinned: false,
      isLocked: false,
    },
    {
      title: 'Help needed: Analyzing suspicious network traffic',
      slug: 'help-analyzing-suspicious-network-traffic',
      content: 'I\'ve captured some network traffic that looks suspicious. I\'m seeing unusual DNS queries and some encrypted traffic to unknown IPs. Can anyone help me analyze this? I can share the PCAP file if needed.',
      type: DiscussionType.HELP,
      authorId: DEMO_USERS.MODERATOR,
      categoryId: null,
      tags: ['network-security', 'analysis', 'help-needed'],
      isPinned: false,
      isLocked: false,
    },
    {
      title: 'Discussion: The future of AI in cybersecurity',
      slug: 'discussion-future-ai-cybersecurity',
      content: 'With the rapid advancement of AI, how do you see it changing the cybersecurity landscape? Are we heading towards fully automated security operations, or will human analysts always be essential?',
      type: DiscussionType.DISCUSSION,
      authorId: DEMO_USERS.AUTHOR_2,
      categoryId: null,
      tags: ['ai', 'future', 'discussion'],
      isPinned: false,
      isLocked: false,
    },
  ];

  for (const discussion of discussions) {
    db.createDiscussion(discussion);
  }
}

function seedComments(): void {
  const discussions = db.listDiscussions();
  
  if (discussions.length === 0) return;

  const comments = [
    {
      content: 'Great question! I recommend starting with the OSCP certification. It\'s hands-on and highly respected in the industry. Also, practice on platforms like HackTheBox and TryHackMe.',
      authorId: DEMO_USERS.AUTHOR_1,
      discussionId: discussions[1].id,
      articleId: null,
      parentId: null,
      status: CommentStatus.APPROVED,
    },
    {
      content: 'I second the OSCP recommendation. Also, learn networking fundamentals thoroughly - TCP/IP, DNS, HTTP, etc. Understanding protocols is crucial for pentesting.',
      authorId: DEMO_USERS.AUTHOR_2,
      discussionId: discussions[1].id,
      articleId: null,
      parentId: null,
      status: CommentStatus.APPROVED,
    },
    {
      content: 'Thanks for the recommendations! I\'ll check out HackTheBox. Should I also learn web application security separately?',
      authorId: DEMO_USERS.REGULAR_USER,
      discussionId: discussions[1].id,
      articleId: null,
      parentId: null,
      status: CommentStatus.APPROVED,
    },
    {
      content: 'Definitely! Web app security is a huge field. Start with OWASP Top 10 and practice on DVWA (Damn Vulnerable Web Application).',
      authorId: DEMO_USERS.AUTHOR_1,
      discussionId: discussions[1].id,
      articleId: null,
      parentId: null, // This would be a reply to the previous comment
      status: CommentStatus.APPROVED,
    },
    {
      content: 'This looks really interesting! What kind of vulnerabilities does your tool scan for?',
      authorId: DEMO_USERS.MODERATOR,
      discussionId: discussions[2].id,
      articleId: null,
      parentId: null,
      status: CommentStatus.APPROVED,
    },
    {
      content: 'It currently focuses on OWASP Top 10 vulnerabilities for web applications. I\'m planning to add network vulnerability scanning next.',
      authorId: DEMO_USERS.CONTRIBUTOR,
      discussionId: discussions[2].id,
      articleId: null,
      parentId: null, // Reply to the previous comment
      status: CommentStatus.APPROVED,
    },
    {
      content: 'For incident response automation, I\'ve had great success with TheHive and Cortex. They integrate well with SIEM solutions and allow for automated playbooks.',
      authorId: DEMO_USERS.AUTHOR_2,
      discussionId: discussions[0].id,
      articleId: null,
      parentId: null,
      status: CommentStatus.APPROVED,
    },
    {
      content: 'AI is definitely changing the game, but I believe human analysts will always be essential. AI can handle routine tasks and pattern recognition, but complex investigations and decision-making still require human judgment.',
      authorId: DEMO_USERS.AUTHOR_1,
      discussionId: discussions[4].id,
      articleId: null,
      parentId: null,
      status: CommentStatus.APPROVED,
    },
  ];

  for (const comment of comments) {
    db.createCommunityComment(comment);
  }
}

function seedFollows(): void {
  const follows = [
    { followerId: DEMO_USERS.REGULAR_USER, followingId: DEMO_USERS.AUTHOR_1 },
    { followerId: DEMO_USERS.REGULAR_USER, followingId: DEMO_USERS.AUTHOR_2 },
    { followerId: DEMO_USERS.CONTRIBUTOR, followingId: DEMO_USERS.AUTHOR_1 },
    { followerId: DEMO_USERS.MODERATOR, followingId: DEMO_USERS.AUTHOR_1 },
    { followerId: DEMO_USERS.MODERATOR, followingId: DEMO_USERS.AUTHOR_2 },
    { followerId: DEMO_USERS.AUTHOR_2, followingId: DEMO_USERS.AUTHOR_1 },
  ];

  for (const follow of follows) {
    db.followUser(follow.followerId, follow.followingId);
  }
}

function seedReports(): void {
  const discussions = db.listDiscussions();
  
  if (discussions.length === 0) return;

  const reports = [
    {
      reporterId: DEMO_USERS.REGULAR_USER,
      reportedUserId: null,
      reportedCommentId: null,
      reportedDiscussionId: discussions[3].id,
      reason: ReportReason.SPAM,
      description: 'This discussion seems to be posting the same content multiple times.',
    },
    {
      reporterId: DEMO_USERS.MODERATOR,
      reportedUserId: null,
      reportedCommentId: null,
      reportedDiscussionId: null,
      reason: ReportReason.INAPPROPRIATE,
      description: 'Test report for moderation workflow demonstration.',
    },
  ];

  for (const report of reports) {
    db.createReport(report);
  }
}
