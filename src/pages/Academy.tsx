import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../db/store';
import { LearningPathCard } from '../components/academy/LearningPathCard';
import { CourseCard } from '../components/academy/CourseCard';
import { LabCard } from '../components/academy/LabCard';
import { Button, EmptyState } from '../components/ui';
import type { LearningPath, Course, Lab } from '../db/academySchema';

export function AcademyPage() {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);

  useEffect(() => {
    setLearningPaths(db.listLearningPaths());
    setCourses(db.listCourses());
    setLabs(db.listLabs());
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Cyber Academy</h1>
        <p className="text-lg text-gray-400 max-w-3xl">
          Master cybersecurity skills through structured learning paths, hands-on courses, and practical labs.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="p-6 rounded-xl border border-gray-800 bg-gray-900/30">
          <div className="text-3xl font-bold text-emerald-400 mb-1">{learningPaths.length}</div>
          <div className="text-sm text-gray-400">Learning Paths</div>
        </div>
        <div className="p-6 rounded-xl border border-gray-800 bg-gray-900/30">
          <div className="text-3xl font-bold text-cyan-400 mb-1">{courses.length}</div>
          <div className="text-sm text-gray-400">Courses</div>
        </div>
        <div className="p-6 rounded-xl border border-gray-800 bg-gray-900/30">
          <div className="text-3xl font-bold text-purple-400 mb-1">{labs.length}</div>
          <div className="text-sm text-gray-400">Labs</div>
        </div>
        <div className="p-6 rounded-xl border border-gray-800 bg-gray-900/30">
          <div className="text-3xl font-bold text-amber-400 mb-1">
            {courses.reduce((sum, c) => sum + c.estimatedHours, 0)}
          </div>
          <div className="text-sm text-gray-400">Hours of Content</div>
        </div>
      </div>

      {/* Learning Paths */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Learning Paths</h2>
          <Link to="/academy/paths" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
            View all paths →
          </Link>
        </div>
        {learningPaths.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {learningPaths.slice(0, 4).map((path) => (
              <LearningPathCard key={path.id} path={path} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="🎓"
            title="No learning paths yet"
            description="Learning paths will appear here once created"
          />
        )}
      </div>

      {/* Popular Courses */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Popular Courses</h2>
          <Link to="/academy/courses" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
            View all courses →
          </Link>
        </div>
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.slice(0, 6).map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="📚"
            title="No courses yet"
            description="Courses will appear here once created"
          />
        )}
      </div>

      {/* Labs */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Hands-on Labs</h2>
          <Link to="/academy/labs" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
            View all labs →
          </Link>
        </div>
        {labs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {labs.slice(0, 6).map((lab) => (
              <LabCard key={lab.id} lab={lab} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="🔬"
            title="No labs yet"
            description="Labs will appear here once created"
          />
        )}
      </div>

      {/* CTA */}
      <div className="rounded-2xl border border-gray-800 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Ready to Start Learning?</h2>
        <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
          Choose a learning path that matches your goals and start building your cybersecurity skills today.
        </p>
        <Link to="/academy/paths">
          <Button size="lg">Browse Learning Paths</Button>
        </Link>
      </div>
    </div>
  );
}
