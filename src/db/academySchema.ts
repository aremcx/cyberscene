/**
 * Academy Schema Types
 * Database types for courses, lessons, labs, and user progress tracking.
 */

// ============================================
// ENUMS
// ============================================

export enum Difficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export enum LessonType {
  VIDEO = 'video',
  TEXT = 'text',
  INTERACTIVE = 'interactive',
  QUIZ = 'quiz',
}

export enum QuizQuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
}

export enum LabType {
  HANDS_ON = 'hands_on',
  CTF = 'ctf',
  SCENARIO = 'scenario',
}

// ============================================
// LEARNING PATHS
// ============================================

export interface LearningPath {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  difficulty: Difficulty;
  estimatedHours: number;
  courseIds: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// COURSES
// ============================================

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  learningObjectives: string[];
  difficulty: Difficulty;
  estimatedHours: number;
  moduleIds: string[];
  instructorId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// MODULES
// ============================================

export interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  courseId: string;
  lessonIds: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================================
// LESSONS
// ============================================

export interface Lesson {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  type: LessonType;
  duration: number; // minutes
  order: number;
  moduleId: string;
  videoUrl?: string;
  quizId?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// QUIZZES
// ============================================

export interface Quiz {
  id: string;
  title: string;
  description: string;
  passingScore: number; // percentage
  timeLimit: number | null; // minutes, null = no limit
  questionIds: string[];
  lessonId: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  question: string;
  type: QuizQuestionType;
  options: string[]; // for multiple choice
  correctAnswer: string;
  explanation: string;
  points: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// LABS
// ============================================

export interface Lab {
  id: string;
  title: string;
  slug: string;
  description: string;
  objectives: string[];
  instructions: string;
  type: LabType;
  difficulty: Difficulty;
  estimatedTime: number; // minutes
  points: number;
  badgeId: string | null;
  questionIds: string[];
  courseId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LabQuestion {
  id: string;
  labId: string;
  question: string;
  type: QuizQuestionType;
  options: string[];
  correctAnswer: string;
  hint: string;
  points: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// BADGES
// ============================================

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  pointsRequired: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// USER PROGRESS
// ============================================

export interface UserEnrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  completedAt: string | null;
  progress: number; // percentage
  lastLessonId: string | null;
}

export interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  completedAt: string;
  timeSpent: number; // minutes
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  answers: Record<string, string>; // questionId -> answer
  score: number; // percentage
  passed: boolean;
  completedAt: string;
  timeSpent: number; // minutes
}

export interface LabAttempt {
  id: string;
  userId: string;
  labId: string;
  answers: Record<string, string>;
  score: number;
  completed: boolean;
  completedAt: string | null;
  timeSpent: number;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: string;
}

export interface UserPoints {
  id: string;
  userId: string;
  totalPoints: number;
  level: number;
  updatedAt: string;
}

// ============================================
// INPUT TYPES
// ============================================

export interface CreateCourseInput {
  title: string;
  slug: string;
  description: string;
  learningObjectives: string[];
  difficulty: Difficulty;
  estimatedHours: number;
  moduleIds?: string[];
  instructorId: string;
  isActive?: boolean;
}

export interface CreateModuleInput {
  title: string;
  description: string;
  order: number;
  courseId: string;
  lessonIds?: string[];
}

export interface CreateLessonInput {
  title: string;
  slug: string;
  description: string;
  content: string;
  type: LessonType;
  duration: number;
  order: number;
  moduleId: string;
  videoUrl?: string;
  quizId?: string;
}

export interface CreateQuizInput {
  title: string;
  description: string;
  passingScore: number;
  timeLimit: number | null;
  questionIds?: string[];
  lessonId: string;
}

export interface CreateLabInput {
  title: string;
  slug: string;
  description: string;
  objectives: string[];
  instructions: string;
  type: LabType;
  difficulty: Difficulty;
  estimatedTime: number;
  points: number;
  badgeId?: string | null;
  questionIds?: string[];
  courseId?: string | null;
  isActive?: boolean;
}

// ============================================
// FILTER TYPES
// ============================================

export interface CourseFilters {
  difficulty?: Difficulty;
  search?: string;
  isActive?: boolean;
}

export interface LabFilters {
  type?: LabType;
  difficulty?: Difficulty;
  search?: string;
  isActive?: boolean;
}
