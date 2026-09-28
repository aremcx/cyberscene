/**
 * Database Seed
 * Populates the in-memory database with realistic demo data.
 * All demo accounts are clearly marked.
 */

import { db } from './store';
import {
  Role, ArticleStatus, ContentType, CommentStatus,
  AuditAction, NotificationType,
} from './schema';
import type {
  CreateArticleInput, CreateUserInput, CreateCategoryInput, CreateTagInput, CreateCommentInput,
} from './schema';
import { hashPassword } from '../lib/crypto';
import { seedThreatIntelligence } from './seedThreatIntel';
import { seedVulnerabilities } from './seedVulnerabilities';

// Re-export for convenience
export { seedThreatIntelligence, seedVulnerabilities };

// ============================================
// SEED DATA
// ============================================

/** Demo user IDs for reference */
export const DEMO_USERS = {
  SUPER_ADMIN: 'seed-user-super-admin',
  ADMIN: 'seed-user-admin',
  EDITOR: 'seed-user-editor',
  AUTHOR_1: 'seed-user-author-1',
  AUTHOR_2: 'seed-user-author-2',
  CONTRIBUTOR: 'seed-user-contributor',
  MODERATOR: 'seed-user-moderator',
  REGULAR_USER: 'seed-user-regular',
} as const;

/** Demo credentials */
export const DEMO_CREDENTIALS = [
  { email: 'superadmin@cybervault.dev', password: 'Demo@1234', role: 'Super Admin' },
  { email: 'admin@cybervault.dev', password: 'Demo@1234', role: 'Admin' },
  { email: 'editor@cybervault.dev', password: 'Demo@1234', role: 'Editor' },
  { email: 'author@cybervault.dev', password: 'Demo@1234', role: 'Author' },
  { email: 'writer@cybervault.dev', password: 'Demo@1234', role: 'Author' },
  { email: 'contributor@cybervault.dev', password: 'Demo@1234', role: 'Contributor' },
  { email: 'moderator@cybervault.dev', password: 'Demo@1234', role: 'Moderator' },
  { email: 'user@cybervault.dev', password: 'Demo@1234', role: 'User' },
];

// ============================================
// SEED FUNCTIONS
// ============================================

export async function seedDatabase(): Promise<void> {
  // Reset first
  db.reset();

  seedRoles();
  seedPermissions();
  await seedUsers();
  seedCategories();
  seedTags();
  seedArticles();
  seedComments();
  seedBookmarks();
  seedNotifications();
  seedAuditLogs();
  
  // Seed threat intelligence and vulnerabilities
  seedThreatIntelligence();
  seedVulnerabilities();
}

function seedRoles(): void {
  const roles = [
    { name: Role.SUPER_ADMIN, description: 'Full system access with all permissions' },
    { name: Role.ADMIN, description: 'Administrative access to manage content and users' },
    { name: Role.EDITOR, description: 'Can edit and publish any content' },
    { name: Role.AUTHOR, description: 'Can create and manage own content' },
    { name: Role.CONTRIBUTOR, description: 'Can submit content for review' },
    { name: Role.MODERATOR, description: 'Can moderate community content' },
    { name: Role.USER, description: 'Standard registered user' },
  ];

  for (const r of roles) {
    db.createRole(r.name, r.description);
  }
}

function seedPermissions(): void {
  const permissions = [
    { name: 'content:read', module: 'content', description: 'View content' },
    { name: 'content:create', module: 'content', description: 'Create new content' },
    { name: 'content:edit:own', module: 'content', description: 'Edit own content' },
    { name: 'content:edit:any', module: 'content', description: 'Edit any content' },
    { name: 'content:delete:own', module: 'content', description: 'Delete own content' },
    { name: 'content:delete:any', module: 'content', description: 'Delete any content' },
    { name: 'content:publish', module: 'content', description: 'Publish content' },
    { name: 'content:feature', module: 'content', description: 'Feature content' },
    { name: 'users:read', module: 'users', description: 'View user profiles' },
    { name: 'users:manage', module: 'users', description: 'Manage user accounts' },
    { name: 'users:assign_role', module: 'users', description: 'Assign roles to users' },
    { name: 'users:ban', module: 'users', description: 'Ban users' },
    { name: 'system:settings', module: 'system', description: 'Manage system settings' },
    { name: 'system:audit', module: 'system', description: 'View audit logs' },
    { name: 'system:admin', module: 'system', description: 'Full admin access' },
    { name: 'community:read', module: 'community', description: 'View community content' },
    { name: 'community:post', module: 'community', description: 'Create community posts' },
    { name: 'community:moderate', module: 'community', description: 'Moderate community content' },
    { name: 'intelligence:read', module: 'intelligence', description: 'View threat intelligence' },
    { name: 'intelligence:create', module: 'intelligence', description: 'Submit threat reports' },
    { name: 'intelligence:manage', module: 'intelligence', description: 'Manage intelligence entries' },
    { name: 'academy:read', module: 'academy', description: 'View courses and labs' },
    { name: 'academy:create', module: 'academy', description: 'Create courses' },
    { name: 'academy:manage', module: 'academy', description: 'Manage academy content' },
  ];

  for (const p of permissions) {
    db.createPermission(p.name, p.module, p.description);
  }

  // Assign all permissions to super_admin role
  const superAdminRole = db.getRoleByName(Role.SUPER_ADMIN);
  const allPerms = db.listPermissions();
  if (superAdminRole) {
    for (const perm of allPerms) {
      db.assignPermission(superAdminRole.id, perm.id);
    }
  }
}

async function seedUsers(): Promise<void> {
  // All demo users use the same password: Demo@1234
  const demoPassword = 'Demo@1234';
  const passwordHash = await hashPassword(demoPassword);

  const users: (Omit<CreateUserInput, 'passwordHash'> & { id: string; role: Role })[] = [
    {
      id: DEMO_USERS.SUPER_ADMIN,
      email: 'superadmin@cybervault.dev',
      displayName: 'Sarah Chen',
      bio: 'Platform administrator and cybersecurity veteran with 15+ years of experience.',
      role: Role.SUPER_ADMIN,
      emailVerified: true,
    },
    {
      id: DEMO_USERS.ADMIN,
      email: 'admin@cybervault.dev',
      displayName: 'Marcus Johnson',
      bio: 'Senior security engineer and platform admin.',
      role: Role.ADMIN,
      emailVerified: true,
    },
    {
      id: DEMO_USERS.EDITOR,
      email: 'editor@cybervault.dev',
      displayName: 'Elena Rodriguez',
      bio: 'Content editor specializing in threat analysis articles.',
      role: Role.EDITOR,
      emailVerified: true,
    },
    {
      id: DEMO_USERS.AUTHOR_1,
      email: 'author@cybervault.dev',
      displayName: 'Alex Kim',
      bio: 'Penetration tester and security researcher. OSCP, OSCE certified.',
      role: Role.AUTHOR,
      emailVerified: true,
    },
    {
      id: DEMO_USERS.AUTHOR_2,
      email: 'writer@cybervault.dev',
      displayName: 'Fatima Al-Hassan',
      bio: 'Cloud security architect and technical writer.',
      role: Role.AUTHOR,
      emailVerified: true,
    },
    {
      id: DEMO_USERS.CONTRIBUTOR,
      email: 'contributor@cybervault.dev',
      displayName: 'David Okafor',
      bio: 'Security enthusiast and open-source contributor from Lagos.',
      role: Role.CONTRIBUTOR,
      emailVerified: true,
    },
    {
      id: DEMO_USERS.MODERATOR,
      email: 'moderator@cybervault.dev',
      displayName: 'Priya Sharma',
      bio: 'Community moderator and SOC analyst.',
      role: Role.MODERATOR,
      emailVerified: true,
    },
    {
      id: DEMO_USERS.REGULAR_USER,
      email: 'user@cybervault.dev',
      displayName: 'James Wilson',
      bio: 'IT professional learning cybersecurity.',
      role: Role.USER,
      emailVerified: true,
    },
  ];

  for (const u of users) {
    const user = db.createUser({
      email: u.email,
      passwordHash,
      displayName: u.displayName,
      bio: u.bio,
      emailVerified: u.emailVerified,
    });

    // Assign role
    const role = db.getRoleByName(u.role);
    if (role) {
      db.assignRole(user.id, role.id, DEMO_USERS.SUPER_ADMIN);
    }
  }
}

function seedCategories(): void {
  // Create parent categories first
  const fundamentals = db.createCategory({
    name: 'Cybersecurity Fundamentals',
    slug: 'cybersecurity-fundamentals',
    description: 'Core cybersecurity concepts, principles, and foundational knowledge'
  });

  const defensive = db.createCategory({
    name: 'Blue Team',
    slug: 'blue-team',
    description: 'Defensive security operations, monitoring, and incident response'
  });

  const offensive = db.createCategory({
    name: 'Red Team',
    slug: 'red-team',
    description: 'Offensive security, penetration testing, and ethical hacking'
  });

  const threatIntel = db.createCategory({
    name: 'Threat Intelligence',
    slug: 'threat-intelligence',
    description: 'Threat analysis, intelligence gathering, and adversary tracking'
  });

  const domainSecurity = db.createCategory({
    name: 'Domain Security',
    slug: 'domain-security',
    description: 'Security across different technology domains'
  });

  const governance = db.createCategory({
    name: 'Governance & Compliance',
    slug: 'governance-compliance',
    description: 'Security governance, risk management, and regulatory compliance'
  });

  const awareness = db.createCategory({
    name: 'Security Awareness',
    slug: 'security-awareness',
    description: 'Security education, training, and awareness programs'
  });

  const careers = db.createCategory({
    name: 'Careers',
    slug: 'careers',
    description: 'Cybersecurity career development and professional growth'
  });

  const regional = db.createCategory({
    name: 'Regional Focus',
    slug: 'regional-focus',
    description: 'Cybersecurity developments in specific regions'
  });

  // Create subcategories
  db.createCategory({
    name: 'SOC',
    slug: 'soc',
    description: 'Security Operations Center operations and monitoring',
    parentId: defensive.id
  });

  db.createCategory({
    name: 'DFIR',
    slug: 'dfir',
    description: 'Digital Forensics and Incident Response',
    parentId: defensive.id
  });

  db.createCategory({
    name: 'Malware',
    slug: 'malware',
    description: 'Malware analysis, reverse engineering, and threat research',
    parentId: threatIntel.id
  });

  db.createCategory({
    name: 'Network Security',
    slug: 'network-security',
    description: 'Network security architectures, protocols, and defenses',
    parentId: domainSecurity.id
  });

  db.createCategory({
    name: 'Cloud Security',
    slug: 'cloud-security',
    description: 'Securing cloud infrastructure and services',
    parentId: domainSecurity.id
  });

  db.createCategory({
    name: 'Web Security',
    slug: 'web-security',
    description: 'Web application security and vulnerabilities',
    parentId: domainSecurity.id
  });

  db.createCategory({
    name: 'Application Security',
    slug: 'application-security',
    description: 'Secure software development and application security testing',
    parentId: domainSecurity.id
  });

  db.createCategory({
    name: 'Mobile Security',
    slug: 'mobile-security',
    description: 'Mobile device and application security',
    parentId: domainSecurity.id
  });

  db.createCategory({
    name: 'AI Security',
    slug: 'ai-security',
    description: 'Security of AI/ML systems and AI for security',
    parentId: domainSecurity.id
  });

  db.createCategory({
    name: 'GRC',
    slug: 'grc',
    description: 'Governance, Risk, and Compliance',
    parentId: governance.id
  });

  db.createCategory({
    name: 'Privacy',
    slug: 'privacy',
    description: 'Data privacy, protection, and compliance',
    parentId: governance.id
  });

  db.createCategory({
    name: 'Nigeria Cybersecurity',
    slug: 'nigeria-cybersecurity',
    description: 'Cybersecurity developments and initiatives in Nigeria',
    parentId: regional.id
  });

  db.createCategory({
    name: 'African Cybersecurity',
    slug: 'african-cybersecurity',
    description: 'Cybersecurity across the African continent',
    parentId: regional.id
  });
}

function seedTags(): void {
  const tags: CreateTagInput[] = [
    // Operating Systems
    { name: 'Windows', slug: 'windows' },
    { name: 'Linux', slug: 'linux' },
    { name: 'macOS', slug: 'macos' },
    { name: 'Active Directory', slug: 'active-directory' },
    
    // Cloud Platforms
    { name: 'AWS', slug: 'aws' },
    { name: 'Azure', slug: 'azure' },
    { name: 'GCP', slug: 'gcp' },
    { name: 'Cloud Security', slug: 'cloud-security' },
    
    // Containerization & Orchestration
    { name: 'Docker', slug: 'docker' },
    { name: 'Kubernetes', slug: 'kubernetes' },
    { name: 'Container Security', slug: 'container-security' },
    
    // Programming Languages
    { name: 'Python', slug: 'python' },
    { name: 'JavaScript', slug: 'javascript' },
    { name: 'Go', slug: 'go' },
    { name: 'Rust', slug: 'rust' },
    { name: 'PowerShell', slug: 'powershell' },
    { name: 'Bash', slug: 'bash' },
    
    // Security Tools
    { name: 'Burp Suite', slug: 'burp-suite' },
    { name: 'Metasploit', slug: 'metasploit' },
    { name: 'Nmap', slug: 'nmap' },
    { name: 'Wireshark', slug: 'wireshark' },
    { name: 'Kali Linux', slug: 'kali-linux' },
    { name: 'Splunk', slug: 'splunk' },
    { name: 'ELK Stack', slug: 'elk-stack' },
    
    // Security Concepts
    { name: 'SIEM', slug: 'siem' },
    { name: 'SOC', slug: 'soc' },
    { name: 'EDR', slug: 'edr' },
    { name: 'IDS/IPS', slug: 'ids-ips' },
    { name: 'Zero Trust', slug: 'zero-trust' },
    { name: 'DevSecOps', slug: 'devsecops' },
    { name: 'Threat Hunting', slug: 'threat-hunting' },
    { name: 'Vulnerability Management', slug: 'vulnerability-management' },
    
    // Attack Types
    { name: 'Ransomware', slug: 'ransomware' },
    { name: 'Phishing', slug: 'phishing' },
    { name: 'Social Engineering', slug: 'social-engineering' },
    { name: 'DDoS', slug: 'ddos' },
    { name: 'SQL Injection', slug: 'sql-injection' },
    { name: 'XSS', slug: 'xss' },
    { name: 'CSRF', slug: 'csrf' },
    { name: 'Zero-Day', slug: 'zero-day' },
    { name: 'APT', slug: 'apt' },
    { name: 'Insider Threat', slug: 'insider-threat' },
    
    // Defensive Security
    { name: 'Incident Response', slug: 'incident-response' },
    { name: 'Digital Forensics', slug: 'digital-forensics' },
    { name: 'Malware Analysis', slug: 'malware-analysis' },
    { name: 'Reverse Engineering', slug: 'reverse-engineering' },
    { name: 'Threat Intelligence', slug: 'threat-intelligence' },
    { name: 'OSINT', slug: 'osint' },
    
    // Offensive Security
    { name: 'Penetration Testing', slug: 'penetration-testing' },
    { name: 'Red Team', slug: 'red-team' },
    { name: 'Blue Team', slug: 'blue-team' },
    { name: 'Purple Team', slug: 'purple-team' },
    { name: 'Bug Bounty', slug: 'bug-bounty' },
    { name: 'Vulnerability Research', slug: 'vulnerability-research' },
    
    // Compliance & Standards
    { name: 'ISO 27001', slug: 'iso-27001' },
    { name: 'NIST', slug: 'nist' },
    { name: 'GDPR', slug: 'gdpr' },
    { name: 'PCI DSS', slug: 'pci-dss' },
    { name: 'HIPAA', slug: 'hipaa' },
    { name: 'SOC 2', slug: 'soc-2' },
    
    // Web Technologies
    { name: 'OWASP', slug: 'owasp' },
    { name: 'REST API', slug: 'rest-api' },
    { name: 'GraphQL', slug: 'graphql' },
    { name: 'OAuth', slug: 'oauth' },
    { name: 'JWT', slug: 'jwt' },
    
    // Network Technologies
    { name: 'TCP/IP', slug: 'tcp-ip' },
    { name: 'DNS', slug: 'dns' },
    { name: 'VPN', slug: 'vpn' },
    { name: 'Firewall', slug: 'firewall' },
    { name: 'Proxy', slug: 'proxy' },
    
    // Cryptography
    { name: 'Encryption', slug: 'encryption' },
    { name: 'PKI', slug: 'pki' },
    { name: 'SSL/TLS', slug: 'ssl-tls' },
    { name: 'Hashing', slug: 'hashing' },
    
    // Content Types
    { name: 'Tutorial', slug: 'tutorial' },
    { name: 'Guide', slug: 'guide' },
    { name: 'Research', slug: 'research' },
    { name: 'Case Study', slug: 'case-study' },
    { name: 'News', slug: 'news' },
    { name: 'Opinion', slug: 'opinion' },
    
    // Difficulty Levels
    { name: 'Beginner', slug: 'beginner' },
    { name: 'Intermediate', slug: 'intermediate' },
    { name: 'Advanced', slug: 'advanced' },
    { name: 'Expert', slug: 'expert' },
    
    // Regional
    { name: 'Africa', slug: 'africa' },
    { name: 'Nigeria', slug: 'nigeria' },
    { name: 'Global', slug: 'global' },
  ];

  for (const t of tags) {
    db.createTag(t);
  }
}

function seedArticles(): void {
  const categories = db.listCategories();
  const tags = db.listTags();

  const getCategory = (slug: string) => categories.find(c => c.slug === slug);
  const getTag = (slug: string) => tags.find(t => t.slug === slug);

  const articles: CreateArticleInput[] = [
    {
      slug: 'understanding-ransomware-attack-chains-2024',
      title: 'Understanding Modern Ransomware Attack Chains in 2024',
      excerpt: 'A comprehensive analysis of how ransomware groups operate in 2024, from initial access to data exfiltration and encryption.',
      content: `Ransomware continues to evolve as one of the most devastating cyber threats facing organizations worldwide. In 2024, we've seen sophisticated attack chains that combine multiple techniques to maximize impact and profit.

## Initial Access Vectors

Modern ransomware groups employ diverse initial access strategies:

1. **Phishing Campaigns** - Spear-phishing emails with malicious attachments or links remain the primary entry point. Groups like LockBit and BlackCat use highly targeted campaigns.

2. **Exploiting Vulnerabilities** - Rapid weaponization of CVEs, particularly in edge devices and VPNs. The MOVEit Transfer vulnerability (CVE-2023-34362) demonstrated how a single flaw can compromise thousands of organizations.

3. **Compromised Credentials** - Purchased access from initial access brokers on dark web marketplaces.

## Lateral Movement

Once inside, attackers use:
- Pass-the-hash attacks
- Living off the land (LotL) techniques
- Legitimate admin tools (PsExec, WMI)
- BloodHound for Active Directory mapping

## Data Exfiltration

Before encryption, modern groups exfiltrate data to leverage in double-extortion schemes. Tools like Rclone and MEGA sync are commonly used.

## Prevention Strategies

- Implement EDR solutions across all endpoints
- Enable MFA everywhere, especially for remote access
- Regular backup testing with offline/immutable copies
- Network segmentation to limit lateral movement
- Threat intelligence integration for early warning`,
      contentType: ContentType.ARTICLE,
      status: ArticleStatus.PUBLISHED,
      authorId: DEMO_USERS.AUTHOR_1,
      categoryId: getCategory('threat-intelligence')?.id,
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      isFeatured: true,
      createdById: DEMO_USERS.AUTHOR_1,
      updatedById: DEMO_USERS.AUTHOR_1,
    },
    {
      slug: 'burp-suite-beginner-guide-web-app-testing',
      title: 'Burp Suite: A Beginner\'s Guide to Web Application Testing',
      excerpt: 'Learn how to set up and use Burp Suite for web application security testing, from basic proxy configuration to advanced exploitation.',
      content: `Burp Suite is the industry-standard tool for web application security testing. This guide will walk you through setting up and using its core features.

## Setting Up Burp Suite

### Installation
Download Burp Suite Community Edition from PortSwigger's website. For professional work, consider the Pro version which includes the scanner and additional tools.

### Browser Configuration
1. Configure your browser to use Burp as a proxy (127.0.0.1:8080)
2. Install Burp's CA certificate for HTTPS interception
3. Consider using Firefox with FoxyProxy for easy proxy switching

## Core Tools

### Proxy
The intercepting proxy is Burp's centerpiece. It sits between your browser and the target application, allowing you to inspect and modify all HTTP/S traffic.

### Repeater
Send individual requests and manually modify parameters. Essential for testing input validation and crafting exploits.

### Intruder
Automate customized attacks against web applications. Use for:
- Fuzzing parameters
- Brute-forcing credentials
- Testing for injection vulnerabilities

### Scanner (Pro only)
Automated vulnerability scanner that identifies common web vulnerabilities.

## Testing Methodology

1. Map the application - understand all endpoints and functionality
2. Test authentication and session management
3. Test for injection vulnerabilities (SQLi, XSS, command injection)
4. Test access controls (IDOR, privilege escalation)
5. Test business logic flaws
6. Report findings with clear reproduction steps`,
      contentType: ContentType.TUTORIAL,
      status: ArticleStatus.PUBLISHED,
      authorId: DEMO_USERS.AUTHOR_1,
      categoryId: getCategory('red-team')?.id,
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      isFeatured: true,
      createdById: DEMO_USERS.AUTHOR_1,
      updatedById: DEMO_USERS.AUTHOR_1,
    },
    {
      slug: 'securing-kubernetes-clusters-production',
      title: 'Securing Kubernetes Clusters in Production: A Practical Guide',
      excerpt: 'Essential security configurations and best practices for running Kubernetes in production environments.',
      content: `Kubernetes has become the de facto standard for container orchestration, but its complexity introduces significant security challenges. This guide covers essential security measures for production clusters.

## RBAC Configuration

Implement the principle of least privilege:

\`\`\`yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: production
  name: app-deployer
rules:
- apiGroups: ["", "apps"]
  resources: ["deployments", "services", "pods"]
  verbs: ["get", "list", "watch", "create", "update", "patch"]
\`\`\`

## Network Policies

Default-deny all traffic, then whitelist explicitly:

\`\`\`yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny
  namespace: production
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
\`\`\`

## Pod Security Standards

Enforce restricted pod security standards:
- Run as non-root
- Read-only root filesystem
- Drop all capabilities
- No privilege escalation

## Image Security
- Use private registries with vulnerability scanning
- Implement image signing (Cosign/Notary)
- Pin images by digest, not tag
- Scan images in CI/CD pipeline

## Secrets Management
- Never store secrets in manifests
- Use external secret managers (Vault, AWS Secrets Manager)
- Enable encryption at rest for etcd
- Rotate secrets regularly`,
      contentType: ContentType.ARTICLE,
      status: ArticleStatus.PUBLISHED,
      authorId: DEMO_USERS.AUTHOR_2,
      categoryId: getCategory('cloud-security')?.id,
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      isFeatured: false,
      createdById: DEMO_USERS.AUTHOR_2,
      updatedById: DEMO_USERS.EDITOR,
    },
    {
      slug: 'osint-techniques-cybersecurity-investigations',
      title: 'OSINT Techniques for Cybersecurity Investigations',
      excerpt: 'Master open-source intelligence gathering techniques used by security professionals for threat hunting and incident investigation.',
      content: `Open-Source Intelligence (OSINT) is a critical skill for cybersecurity professionals. This article covers practical techniques for gathering intelligence from publicly available sources.

## What is OSINT?

OSINT refers to collecting and analyzing information from publicly available sources to produce actionable intelligence. In cybersecurity, it's used for:
- Threat hunting
- Incident investigation
- Vulnerability research
- Competitor analysis
- Social engineering assessments

## Key OSINT Categories

### 1. Domain & IP Intelligence
- WHOIS records
- DNS enumeration
- Certificate transparency logs
- Reverse DNS lookups
- ASN information

### 2. Social Media Intelligence
- Profile analysis
- Connection mapping
- Historical post analysis
- Image metadata extraction

### 3. Technical Intelligence
- Shodan/Censys for exposed services
- VirusTotal for malware analysis
- URLscan for web content analysis
- Have I Been Pwned for breach data

### 4. Geolocation Intelligence
- EXIF data analysis
- Street view verification
- Sun position analysis
- Landmark identification

## Tools of the Trade

- **theHarvester** - Email and subdomain enumeration
- **Maltego** - Visual link analysis
- **Recon-ng** - OSINT framework
- **SpiderFoot** - Automated OSINT
- **Google Dorks** - Advanced search operators

## Ethical Considerations

Always operate within legal boundaries. OSINT gathering must respect:
- Privacy laws (GDPR, CCPA)
- Terms of service
- Rate limits
- Ethical boundaries`,
      contentType: ContentType.ARTICLE,
      status: ArticleStatus.PUBLISHED,
      authorId: DEMO_USERS.AUTHOR_1,
      categoryId: getCategory('dfir')?.id,
      publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      isFeatured: false,
      createdById: DEMO_USERS.AUTHOR_1,
      updatedById: DEMO_USERS.AUTHOR_1,
    },
    {
      slug: 'zero-trust-architecture-implementation-guide',
      title: 'Zero Trust Architecture: Implementation Guide for Enterprises',
      excerpt: 'A step-by-step guide to implementing Zero Trust security architecture in enterprise environments.',
      content: `Zero Trust is not a product—it's a security philosophy that assumes no implicit trust for any entity, whether inside or outside the network perimeter.

## Core Principles

1. **Never Trust, Always Verify** - Every access request is fully authenticated, authorized, and encrypted.
2. **Least Privilege Access** - Grant minimum necessary access with just-in-time provisioning.
3. **Assume Breach** - Design systems assuming the network is already compromised.

## Implementation Phases

### Phase 1: Identity Foundation
- Deploy comprehensive IAM
- Implement MFA for all users
- Establish identity governance
- Integrate with HR systems for lifecycle management

### Phase 2: Device Trust
- Implement device health attestation
- Deploy MDM/MAM solutions
- Establish device compliance policies
- Certificate-based device authentication

### Phase 3: Network Segmentation
- Micro-segmentation using software-defined perimeters
- Service mesh implementation
- East-west traffic inspection
- ZTNA gateway deployment

### Phase 4: Application Security
- API security gateway
- Application-level encryption
- Continuous access evaluation
- Session-based access controls

### Phase 5: Data Protection
- Data classification
- Encryption at rest and in transit
- DLP policies
- Data access governance

## Technology Stack

- Identity: Okta/Azure AD + conditional access
- Network: Zscaler/Cloudflare ZTA
- Endpoint: CrowdStrike/SentinelOne
- SIEM: Splunk/Sentinel
- PAM: CyberArk/BeyondTrust`,
      contentType: ContentType.ARTICLE,
      status: ArticleStatus.PUBLISHED,
      authorId: DEMO_USERS.AUTHOR_2,
      categoryId: getCategory('network-security')?.id,
      publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      isFeatured: true,
      createdById: DEMO_USERS.AUTHOR_2,
      updatedById: DEMO_USERS.AUTHOR_2,
    },
    {
      slug: 'python-scripting-security-automation',
      title: 'Python Scripting for Security Automation',
      excerpt: 'Learn how to build security automation tools using Python, from log analysis to vulnerability scanning.',
      content: `Python is the lingua franca of security automation. This tutorial covers practical scripts for common security tasks.

## Log Analysis

Parse and analyze security logs programmatically:

\`\`\`python
import re
from collections import Counter

def analyze_auth_logs(log_file):
    failed_ips = Counter()
    with open(log_file) as f:
        for line in f:
            if 'Failed password' in line:
                ip = re.search(r'from (\\d+\\.\\d+\\.\\d+\\.\\d+)', line)
                if ip:
                    failed_ips[ip.group(1)] += 1
    return failed_ips.most_common(10)
\`\`\`

## Port Scanner

Build a basic port scanner:

\`\`\`python
import socket
from concurrent.futures import ThreadPoolExecutor

def scan_port(host, port):
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex((host, port))
        sock.close()
        return port if result == 0 else None
    except:
        return None

def scan_host(host, ports=range(1, 1025)):
    with ThreadPoolExecutor(max_workers=100) as executor:
        results = executor.map(lambda p: scan_port(host, p), ports)
    return [p for p in results if p is not None]
\`\`\`

## Vulnerability Checker

Check for known vulnerabilities:

\`\`\`python
import requests

def check_cve(cve_id):
    url = f"https://services.nvd.nist.gov/rest/json/cves/2.0?cveId={cve_id}"
    response = requests.get(url)
    data = response.json()
    vuln = data['vulnerabilities'][0]['cve']
    return {
        'id': vuln['id'],
        'description': vuln['descriptions'][0]['value'],
        'severity': vuln.get('metrics', {}).get('cvssMetricV31', [{}])[0].get('cvssData', {}).get('baseSeverity', 'N/A')
    }
\`\`\`

## Best Practices

- Use virtual environments
- Handle exceptions gracefully
- Log all actions
- Never hardcode credentials
- Use type hints for clarity`,
      contentType: ContentType.TUTORIAL,
      status: ArticleStatus.PUBLISHED,
      authorId: DEMO_USERS.CONTRIBUTOR,
      categoryId: getCategory('red-team')?.id,
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      isFeatured: false,
      createdById: DEMO_USERS.CONTRIBUTOR,
      updatedById: DEMO_USERS.EDITOR,
    },
    {
      slug: 'incident-response-playbook-ransomware',
      title: 'Incident Response Playbook: Ransomware Attack',
      excerpt: 'A detailed incident response playbook for handling ransomware attacks, from detection to recovery.',
      content: `When ransomware strikes, every minute counts. This playbook provides a structured response framework.

## Phase 1: Detection & Triage (0-30 minutes)

### Indicators of Compromise
- Mass file encryption detected
- Ransom notes appearing
- EDR alerts for suspicious process execution
- Unusual outbound network traffic
- Shadow copy deletion attempts

### Immediate Actions
1. **Isolate** affected systems from the network
2. **Preserve** evidence - don't reboot or shut down
3. **Activate** the incident response team
4. **Document** timeline of events
5. **Assess** scope - how many systems affected?

## Phase 2: Containment (30 min - 4 hours)

### Short-term Containment
- Disconnect affected segments
- Block C2 communication at firewall
- Disable compromised accounts
- Preserve volatile memory (RAM dumps)

### Long-term Containment
- Re-image critical systems from known-good backups
- Reset all credentials in affected scope
- Deploy additional monitoring
- Engage external IR firm if needed

## Phase 3: Eradication (4-48 hours)

- Identify patient zero and attack vector
- Remove all malware artifacts
- Patch exploited vulnerabilities
- Review and harden configurations
- Scan all systems for persistence mechanisms

## Phase 4: Recovery (48+ hours)

- Restore from verified clean backups
- Monitor restored systems closely
- Gradually bring systems back online
- Validate data integrity
- Update security controls

## Phase 5: Post-Incident

- Conduct lessons-learned meeting
- Update IR playbook
- File required regulatory reports
- Consider law enforcement engagement
- Review and improve security posture

## Communication Templates

Have pre-drafted communications ready for:
- Internal stakeholders
- Customers/partners
- Regulatory bodies
- Law enforcement
- Media (if applicable)`,
      contentType: ContentType.ARTICLE,
      status: ArticleStatus.PUBLISHED,
      authorId: DEMO_USERS.AUTHOR_1,
      categoryId: getCategory('incident-response')?.id,
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      isFeatured: true,
      createdById: DEMO_USERS.AUTHOR_1,
      updatedById: DEMO_USERS.AUTHOR_1,
    },
    {
      slug: 'draft-ai-threat-detection-future',
      title: 'AI-Powered Threat Detection: The Future of SOC Operations',
      excerpt: 'Exploring how artificial intelligence is transforming Security Operations Centers and threat detection capabilities.',
      content: `This article is still being researched and written. Content will cover machine learning models for threat detection, AI-driven SOC automation, and the balance between AI and human analysis.`,
      contentType: ContentType.RESEARCH,
      status: ArticleStatus.DRAFT,
      authorId: DEMO_USERS.AUTHOR_2,
      categoryId: getCategory('threat-intelligence')?.id,
      createdById: DEMO_USERS.AUTHOR_2,
      updatedById: DEMO_USERS.AUTHOR_2,
    },
  ];

  for (const articleData of articles) {
    const article = db.createArticle(articleData);

    // Add tags
    const tagMappings: Record<string, string[]> = {
      'understanding-ransomware-attack-chains-2024': ['ransomware', 'apt', 'threat-intelligence', 'incident-response'],
      'burp-suite-beginner-guide-web-app-testing': ['burp-suite', 'tutorial', 'penetration-testing', 'web-security'],
      'securing-kubernetes-clusters-production': ['kubernetes', 'docker', 'aws', 'cloud-security', 'container-security'],
      'osint-techniques-cybersecurity-investigations': ['osint', 'digital-forensics', 'guide', 'threat-hunting'],
      'zero-trust-architecture-implementation-guide': ['guide', 'zero-trust', 'network-security'],
      'python-scripting-security-automation': ['python', 'tutorial', 'automation', 'bash'],
      'incident-response-playbook-ransomware': ['ransomware', 'blue-team', 'soc', 'incident-response'],
    };

    const articleTags = tagMappings[articleData.slug] || [];
    for (const tagSlug of articleTags) {
      const tag = getTag(tagSlug);
      if (tag) {
        db.addTagToArticle(article.id, tag.id);
      }
    }
  }
}

function seedComments(): void {
  const articles = db.listArticles().data;
  if (articles.length === 0) return;

  const firstArticle = articles[0];
  const secondArticle = articles[1];

  const comments: CreateCommentInput[] = [
    {
      content: 'Excellent analysis! The section on lateral movement techniques was particularly insightful. We\'ve seen similar patterns in our environment.',
      articleId: firstArticle.id,
      authorId: DEMO_USERS.REGULAR_USER,
      status: CommentStatus.APPROVED,
    },
    {
      content: 'Great article. Would love to see a follow-up covering specific detection rules for these attack chains using Sigma or YARA.',
      articleId: firstArticle.id,
      authorId: DEMO_USERS.MODERATOR,
      status: CommentStatus.APPROVED,
    },
    {
      content: 'Thanks for the detailed walkthrough! I\'ve been using Burp for years but learned several new techniques from this guide.',
      articleId: secondArticle.id,
      authorId: DEMO_USERS.CONTRIBUTOR,
      status: CommentStatus.APPROVED,
    },
    {
      content: 'Could you elaborate on the Intruder configurations for testing IDOR vulnerabilities? That section felt a bit brief.',
      articleId: secondArticle.id,
      authorId: DEMO_USERS.REGULAR_USER,
      status: CommentStatus.APPROVED,
    },
    {
      content: 'This spam comment should be removed.',
      articleId: firstArticle.id,
      authorId: DEMO_USERS.REGULAR_USER,
      status: CommentStatus.PENDING,
    },
  ];

  for (const c of comments) {
    db.createComment(c);
  }
}

function seedBookmarks(): void {
  const articles = db.listArticles().data;
  if (articles.length < 3) return;

  db.addBookmark(DEMO_USERS.REGULAR_USER, articles[0].id);
  db.addBookmark(DEMO_USERS.REGULAR_USER, articles[1].id);
  db.addBookmark(DEMO_USERS.MODERATOR, articles[0].id);
  db.addBookmark(DEMO_USERS.CONTRIBUTOR, articles[2].id);
}

function seedNotifications(): void {
  db.createNotification(
    DEMO_USERS.AUTHOR_1,
    NotificationType.COMMENT_REPLY,
    'New comment on your article',
    'Marcus Johnson commented on "Understanding Modern Ransomware Attack Chains in 2024"',
    '/articles/understanding-ransomware-attack-chains-2024'
  );

  db.createNotification(
    DEMO_USERS.AUTHOR_1,
    NotificationType.COMMENT_REPLY,
    'New comment on your article',
    'Priya Sharma commented on "Understanding Modern Ransomware Attack Chains in 2024"',
    '/articles/understanding-ransomware-attack-chains-2024'
  );

  db.createNotification(
    DEMO_USERS.REGULAR_USER,
    NotificationType.SYSTEM,
    'Welcome to CyberVault!',
    'Your account has been created. Explore articles, join the community, and start learning.',
    '/academy'
  );

  db.createNotification(
    DEMO_USERS.EDITOR,
    NotificationType.ARTICLE_PUBLISHED,
    'New article submitted for review',
    'David Okafor submitted "Python Scripting for Security Automation" for review.',
    '/admin/articles'
  );
}

function seedAuditLogs(): void {
  db.createAuditLog(
    AuditAction.CREATE,
    'article',
    null,
    DEMO_USERS.AUTHOR_1,
    { title: 'Understanding Modern Ransomware Attack Chains in 2024' },
    '192.168.1.100',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  );

  db.createAuditLog(
    AuditAction.UPDATE,
    'article',
    null,
    DEMO_USERS.EDITOR,
    { action: 'published', title: 'Python Scripting for Security Automation' },
    '192.168.1.101',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
  );

  db.createAuditLog(
    AuditAction.LOGIN,
    'user',
    DEMO_USERS.SUPER_ADMIN,
    DEMO_USERS.SUPER_ADMIN,
    { method: 'password' },
    '192.168.1.1',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  );

  db.createAuditLog(
    AuditAction.ROLE_CHANGE,
    'user',
    DEMO_USERS.CONTRIBUTOR,
    DEMO_USERS.ADMIN,
    { from: 'user', to: 'contributor' },
    '192.168.1.101'
  );
}
