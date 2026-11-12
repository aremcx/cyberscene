/**
 * Academy Seed Data
 * Populates the database with learning paths, courses, lessons, labs, and badges.
 */

import { db } from './store';
import {
  Difficulty,
  LessonType,
  QuizQuestionType,
  LabType,
} from './academySchema';
import { DEMO_USERS } from './seed';

export function seedAcademy(): void {
  seedBadges();
  seedLearningPaths();
  seedCourses();
  seedModules();
  seedLessons();
  seedQuizzes();
  seedLabs();
}

function seedBadges(): void {
  const badges = [
    {
      name: 'First Steps',
      description: 'Complete your first lesson',
      icon: '🎯',
      category: 'milestone',
      pointsRequired: 10,
    },
    {
      name: 'Quick Learner',
      description: 'Complete 5 lessons',
      icon: '⚡',
      category: 'milestone',
      pointsRequired: 50,
    },
    {
      name: 'Knowledge Seeker',
      description: 'Complete 10 lessons',
      icon: '📚',
      category: 'milestone',
      pointsRequired: 100,
    },
    {
      name: 'Quiz Master',
      description: 'Pass 5 quizzes with 100% score',
      icon: '🏆',
      category: 'achievement',
      pointsRequired: 200,
    },
    {
      name: 'Lab Expert',
      description: 'Complete 3 hands-on labs',
      icon: '🔬',
      category: 'achievement',
      pointsRequired: 150,
    },
    {
      name: 'SOC Specialist',
      description: 'Complete the SOC Analyst learning path',
      icon: '🛡️',
      category: 'path',
      pointsRequired: 500,
    },
    {
      name: 'Penetration Tester',
      description: 'Complete the Penetration Testing learning path',
      icon: '🔓',
      category: 'path',
      pointsRequired: 500,
    },
    {
      name: 'Forensics Investigator',
      description: 'Complete the Digital Forensics learning path',
      icon: '🔍',
      category: 'path',
      pointsRequired: 500,
    },
    {
      name: 'Security Fundamentals',
      description: 'Complete the Cybersecurity Fundamentals learning path',
      icon: '🎓',
      category: 'path',
      pointsRequired: 300,
    },
    {
      name: 'Perfect Score',
      description: 'Get 100% on any quiz',
      icon: '💯',
      category: 'achievement',
      pointsRequired: 50,
    },
    {
      name: 'Speed Demon',
      description: 'Complete a quiz in under 2 minutes',
      icon: '⏱️',
      category: 'achievement',
      pointsRequired: 75,
    },
    {
      name: 'Consistency King',
      description: 'Complete lessons 7 days in a row',
      icon: '🔥',
      category: 'streak',
      pointsRequired: 100,
    },
  ];

  for (const badge of badges) {
    db.createBadge(badge);
  }
}

function seedLearningPaths(): void {
  const paths = [
    {
      name: 'Cybersecurity Fundamentals',
      slug: 'cybersecurity-fundamentals',
      description: 'Build a strong foundation in cybersecurity concepts, networking, operating systems, and security principles.',
      icon: '🎓',
      difficulty: Difficulty.BEGINNER,
      estimatedHours: 40,
      courseIds: [],
      isActive: true,
    },
    {
      name: 'SOC Analyst',
      slug: 'soc-analyst',
      description: 'Learn to monitor, detect, and respond to security incidents as a Security Operations Center analyst.',
      icon: '🛡️',
      difficulty: Difficulty.INTERMEDIATE,
      estimatedHours: 60,
      courseIds: [],
      isActive: true,
    },
    {
      name: 'Penetration Testing',
      slug: 'penetration-testing',
      description: 'Master ethical hacking techniques, vulnerability assessment, and security testing methodologies.',
      icon: '🔓',
      difficulty: Difficulty.ADVANCED,
      estimatedHours: 80,
      courseIds: [],
      isActive: true,
    },
    {
      name: 'Digital Forensics',
      slug: 'digital-forensics',
      description: 'Learn to investigate security incidents, analyze evidence, and perform digital forensics.',
      icon: '🔍',
      difficulty: Difficulty.ADVANCED,
      estimatedHours: 70,
      courseIds: [],
      isActive: true,
    },
  ];

  for (const path of paths) {
    db.createLearningPath(path);
  }
}

function seedCourses(): void {
  const courses = [
    // Cybersecurity Fundamentals
    {
      title: 'Networking Fundamentals',
      slug: 'networking-fundamentals',
      description: 'Learn the basics of computer networking, protocols, and network architecture.',
      learningObjectives: [
        'Understand TCP/IP protocol suite',
        'Configure basic network devices',
        'Analyze network traffic',
        'Troubleshoot common network issues',
      ],
      difficulty: Difficulty.BEGINNER,
      estimatedHours: 10,
      moduleIds: [],
      instructorId: DEMO_USERS.AUTHOR_1,
      isActive: true,
    },
    {
      title: 'Linux Essentials',
      slug: 'linux-essentials',
      description: 'Master Linux command line, file systems, and system administration basics.',
      learningObjectives: [
        'Navigate Linux file system',
        'Execute command line operations',
        'Manage users and permissions',
        'Configure basic services',
      ],
      difficulty: Difficulty.BEGINNER,
      estimatedHours: 12,
      moduleIds: [],
      instructorId: DEMO_USERS.AUTHOR_1,
      isActive: true,
    },
    {
      title: 'Security Fundamentals',
      slug: 'security-fundamentals',
      description: 'Understand core security concepts, threats, vulnerabilities, and countermeasures.',
      learningObjectives: [
        'Identify common security threats',
        'Understand security principles',
        'Implement basic security controls',
        'Assess security risks',
      ],
      difficulty: Difficulty.BEGINNER,
      estimatedHours: 8,
      moduleIds: [],
      instructorId: DEMO_USERS.AUTHOR_2,
      isActive: true,
    },
    // SOC Analyst
    {
      title: 'SIEM Fundamentals',
      slug: 'siem-fundamentals',
      description: 'Learn to use Security Information and Event Management systems for threat detection.',
      learningObjectives: [
        'Configure SIEM data sources',
        'Create correlation rules',
        'Analyze security events',
        'Generate security reports',
      ],
      difficulty: Difficulty.INTERMEDIATE,
      estimatedHours: 15,
      moduleIds: [],
      instructorId: DEMO_USERS.AUTHOR_1,
      isActive: true,
    },
    {
      title: 'Incident Response',
      slug: 'incident-response',
      description: 'Master incident detection, analysis, containment, and recovery procedures.',
      learningObjectives: [
        'Follow incident response lifecycle',
        'Contain security incidents',
        'Collect and preserve evidence',
        'Document incident response activities',
      ],
      difficulty: Difficulty.INTERMEDIATE,
      estimatedHours: 20,
      moduleIds: [],
      instructorId: DEMO_USERS.AUTHOR_2,
      isActive: true,
    },
    // Penetration Testing
    {
      title: 'Reconnaissance Techniques',
      slug: 'reconnaissance-techniques',
      description: 'Learn passive and active reconnaissance methods for security assessments.',
      learningObjectives: [
        'Perform OSINT gathering',
        'Scan networks and services',
        'Enumerate users and systems',
        'Map attack surface',
      ],
      difficulty: Difficulty.INTERMEDIATE,
      estimatedHours: 15,
      moduleIds: [],
      instructorId: DEMO_USERS.AUTHOR_1,
      isActive: true,
    },
    {
      title: 'Web Application Security',
      slug: 'web-application-security',
      description: 'Identify and exploit common web application vulnerabilities.',
      learningObjectives: [
        'Test for OWASP Top 10 vulnerabilities',
        'Perform SQL injection attacks',
        'Exploit XSS vulnerabilities',
        'Assess authentication mechanisms',
      ],
      difficulty: Difficulty.ADVANCED,
      estimatedHours: 25,
      moduleIds: [],
      instructorId: DEMO_USERS.AUTHOR_1,
      isActive: true,
    },
    // Digital Forensics
    {
      title: 'Evidence Collection',
      slug: 'evidence-collection',
      description: 'Learn proper procedures for collecting and preserving digital evidence.',
      learningObjectives: [
        'Follow chain of custody',
        'Create forensic images',
        'Preserve evidence integrity',
        'Document collection procedures',
      ],
      difficulty: Difficulty.INTERMEDIATE,
      estimatedHours: 12,
      moduleIds: [],
      instructorId: DEMO_USERS.AUTHOR_2,
      isActive: true,
    },
    {
      title: 'Windows Forensics',
      slug: 'windows-forensics',
      description: 'Analyze Windows systems to extract forensic artifacts and evidence.',
      learningObjectives: [
        'Analyze Windows registry',
        'Examine event logs',
        'Recover deleted files',
        'Track user activity',
      ],
      difficulty: Difficulty.ADVANCED,
      estimatedHours: 20,
      moduleIds: [],
      instructorId: DEMO_USERS.AUTHOR_2,
      isActive: true,
    },
  ];

  for (const course of courses) {
    db.createCourse(course);
  }
}

function seedModules(): void {
  const modules = [
    // Networking Fundamentals
    {
      title: 'Network Basics',
      description: 'Introduction to networking concepts and protocols',
      order: 1,
      courseId: '', // Will be set after course creation
      lessonIds: [],
    },
    {
      title: 'TCP/IP Protocol Suite',
      description: 'Deep dive into TCP/IP protocols and layers',
      order: 2,
      courseId: '',
      lessonIds: [],
    },
    // Linux Essentials
    {
      title: 'Command Line Basics',
      description: 'Essential Linux commands and navigation',
      order: 1,
      courseId: '',
      lessonIds: [],
    },
    {
      title: 'File System Management',
      description: 'Linux file system structure and management',
      order: 2,
      courseId: '',
      lessonIds: [],
    },
    // SIEM Fundamentals
    {
      title: 'SIEM Architecture',
      description: 'Understanding SIEM components and deployment',
      order: 1,
      courseId: '',
      lessonIds: [],
    },
    {
      title: 'Log Analysis',
      description: 'Analyzing security logs and events',
      order: 2,
      courseId: '',
      lessonIds: [],
    },
    // Reconnaissance Techniques
    {
      title: 'Passive Reconnaissance',
      description: 'OSINT and passive information gathering',
      order: 1,
      courseId: '',
      lessonIds: [],
    },
    {
      title: 'Active Scanning',
      description: 'Network scanning and service enumeration',
      order: 2,
      courseId: '',
      lessonIds: [],
    },
  ];

  for (const module of modules) {
    db.createModule(module);
  }
}

function seedLessons(): void {
  const lessons = [
    // Network Basics Module
    {
      title: 'Introduction to Networking',
      slug: 'introduction-to-networking',
      description: 'Learn the fundamentals of computer networks',
      content: '# Introduction to Networking\n\nComputer networks are the backbone of modern communication...',
      type: LessonType.TEXT,
      duration: 15,
      order: 1,
      moduleId: '',
    },
    {
      title: 'Network Topologies',
      slug: 'network-topologies',
      description: 'Understanding different network architectures',
      content: '# Network Topologies\n\nNetwork topology refers to the physical or logical layout of a network...',
      type: LessonType.TEXT,
      duration: 20,
      order: 2,
      moduleId: '',
    },
    // Command Line Basics Module
    {
      title: 'Navigating the File System',
      slug: 'navigating-file-system',
      description: 'Learn to navigate Linux file system',
      content: '# Navigating the File System\n\nThe Linux file system is organized in a hierarchical structure...',
      type: LessonType.TEXT,
      duration: 25,
      order: 1,
      moduleId: '',
    },
    {
      title: 'Essential Commands',
      slug: 'essential-commands',
      description: 'Master essential Linux commands',
      content: '# Essential Commands\n\nLinux provides hundreds of commands for system administration...',
      type: LessonType.TEXT,
      duration: 30,
      order: 2,
      moduleId: '',
    },
    // SIEM Architecture Module
    {
      title: 'What is a SIEM?',
      slug: 'what-is-siem',
      description: 'Introduction to Security Information and Event Management',
      content: '# What is a SIEM?\n\nA Security Information and Event Management (SIEM) system...',
      type: LessonType.TEXT,
      duration: 20,
      order: 1,
      moduleId: '',
    },
    {
      title: 'SIEM Deployment Models',
      slug: 'siem-deployment-models',
      description: 'On-premises vs cloud SIEM solutions',
      content: '# SIEM Deployment Models\n\nOrganizations can deploy SIEM solutions in various ways...',
      type: LessonType.TEXT,
      duration: 25,
      order: 2,
      moduleId: '',
    },
    // Passive Reconnaissance Module
    {
      title: 'OSINT Fundamentals',
      slug: 'osint-fundamentals',
      description: 'Open Source Intelligence gathering techniques',
      content: '# OSINT Fundamentals\n\nOpen Source Intelligence (OSINT) involves collecting information...',
      type: LessonType.TEXT,
      duration: 30,
      order: 1,
      moduleId: '',
    },
    {
      title: 'Search Engine Techniques',
      slug: 'search-engine-techniques',
      description: 'Advanced search engine usage for reconnaissance',
      content: '# Search Engine Techniques\n\nSearch engines are powerful tools for gathering information...',
      type: LessonType.TEXT,
      duration: 25,
      order: 2,
      moduleId: '',
    },
  ];

  for (const lesson of lessons) {
    db.createLesson(lesson);
  }
}

function seedQuizzes(): void {
  // Create quizzes for some lessons
  const lessons = db.listLessonsByModule(''); // Get all lessons
  
  if (lessons.length > 0) {
    const quiz1 = db.createQuiz({
      title: 'Networking Basics Quiz',
      description: 'Test your knowledge of networking fundamentals',
      passingScore: 70,
      timeLimit: 15,
      questionIds: [],
      lessonId: lessons[0].id,
    });

    // Add questions to quiz
    db.createQuizQuestion({
      quizId: quiz1.id,
      question: 'What does TCP stand for?',
      type: QuizQuestionType.MULTIPLE_CHOICE,
      options: [
        'Transmission Control Protocol',
        'Transfer Control Protocol',
        'Transport Control Program',
        'Terminal Control Protocol',
      ],
      correctAnswer: 'Transmission Control Protocol',
      explanation: 'TCP stands for Transmission Control Protocol, which is a core protocol of the Internet Protocol Suite.',
      points: 10,
      order: 1,
    });

    db.createQuizQuestion({
      quizId: quiz1.id,
      question: 'Which layer of the OSI model does IP operate at?',
      type: QuizQuestionType.MULTIPLE_CHOICE,
      options: ['Data Link', 'Network', 'Transport', 'Session'],
      correctAnswer: 'Network',
      explanation: 'IP operates at the Network layer (Layer 3) of the OSI model.',
      points: 10,
      order: 2,
    });

    db.createQuizQuestion({
      quizId: quiz1.id,
      question: 'HTTP uses port 80 by default.',
      type: QuizQuestionType.TRUE_FALSE,
      options: ['True', 'False'],
      correctAnswer: 'True',
      explanation: 'HTTP (Hypertext Transfer Protocol) uses port 80 by default for unencrypted web traffic.',
      points: 10,
      order: 3,
    });
  }
}

function seedLabs(): void {
  const labs = [
    {
      title: 'Linux Command Line Basics',
      slug: 'linux-command-line-basics',
      description: 'Practice essential Linux commands in a safe environment',
      objectives: [
        'Navigate the file system',
        'Create and delete files',
        'Manage permissions',
        'Use common commands',
      ],
      instructions: 'In this lab, you will practice basic Linux commands...',
      type: LabType.HANDS_ON,
      difficulty: Difficulty.BEGINNER,
      estimatedTime: 30,
      points: 50,
      badgeId: null,
      questionIds: [],
      courseId: null,
      isActive: true,
    },
    {
      title: 'Network Scanning with Nmap',
      slug: 'network-scanning-nmap',
      description: 'Learn to use Nmap for network discovery and security auditing',
      objectives: [
        'Perform host discovery',
        'Scan open ports',
        'Identify services',
        'Detect operating systems',
      ],
      instructions: 'In this lab, you will use Nmap to scan a target network...',
      type: LabType.HANDS_ON,
      difficulty: Difficulty.INTERMEDIATE,
      estimatedTime: 45,
      points: 75,
      badgeId: null,
      questionIds: [],
      courseId: null,
      isActive: true,
    },
    {
      title: 'Web Application Vulnerability Assessment',
      slug: 'web-app-vulnerability-assessment',
      description: 'Identify common web vulnerabilities in a practice application',
      objectives: [
        'Test for SQL injection',
        'Identify XSS vulnerabilities',
        'Assess authentication flaws',
        'Document findings',
      ],
      instructions: 'In this lab, you will test a vulnerable web application...',
      type: LabType.HANDS_ON,
      difficulty: Difficulty.ADVANCED,
      estimatedTime: 60,
      points: 100,
      badgeId: null,
      questionIds: [],
      courseId: null,
      isActive: true,
    },
    {
      title: 'Log Analysis Challenge',
      slug: 'log-analysis-challenge',
      description: 'Analyze security logs to identify suspicious activities',
      objectives: [
        'Identify failed login attempts',
        'Detect port scanning',
        'Find malware indicators',
        'Correlate events',
      ],
      instructions: 'In this CTF-style challenge, you will analyze log files...',
      type: LabType.CTF,
      difficulty: Difficulty.INTERMEDIATE,
      estimatedTime: 40,
      points: 80,
      badgeId: null,
      questionIds: [],
      courseId: null,
      isActive: true,
    },
  ];

  for (const lab of labs) {
    const createdLab = db.createLab(lab);

    // Add questions to labs
    if (lab.slug === 'linux-command-line-basics') {
      db.createLabQuestion({
        labId: createdLab.id,
        question: 'Which command lists files in the current directory?',
        type: QuizQuestionType.MULTIPLE_CHOICE,
        options: ['ls', 'dir', 'list', 'show'],
        correctAnswer: 'ls',
        hint: 'This is the most common command for listing files',
        points: 10,
        order: 1,
      });

      db.createLabQuestion({
        labId: createdLab.id,
        question: 'What command changes the current directory?',
        type: QuizQuestionType.MULTIPLE_CHOICE,
        options: ['cd', 'chdir', 'move', 'goto'],
        correctAnswer: 'cd',
        hint: 'Think "change directory"',
        points: 10,
        order: 2,
      });
    }

    if (lab.slug === 'network-scanning-nmap') {
      db.createLabQuestion({
        labId: createdLab.id,
        question: 'What Nmap flag performs a SYN scan?',
        type: QuizQuestionType.MULTIPLE_CHOICE,
        options: ['-sS', '-sT', '-sU', '-sn'],
        correctAnswer: '-sS',
        hint: 'SYN scan is also known as half-open scan',
        points: 15,
        order: 1,
      });

      db.createLabQuestion({
        labId: createdLab.id,
        question: 'Which flag enables OS detection?',
        type: QuizQuestionType.MULTIPLE_CHOICE,
        options: ['-O', '-sV', '-A', '-T'],
        correctAnswer: '-O',
        hint: 'This single letter flag detects operating systems',
        points: 15,
        order: 2,
      });
    }
  }
}
