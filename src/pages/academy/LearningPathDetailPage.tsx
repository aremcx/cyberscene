import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db } from '../../db/store';
import { CourseCard } from '../../components/academy/CourseCard';
import { Badge, Button, EmptyState } from '../../components/ui';
import { Difficulty } from '../../db/academySchema';
import type { LearningPath, Course } from '../../db/academySchema';

export function LearningPathDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [path, setPath] = useState<LearningPath | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (slug) {
      const foundPath = db.getLearningPathBySlug(slug);
      if (foundPath) {
        setPath(foundPath);
        // Load courses for this path
        const pathCourses = foundPath.courseIds
          .map(id => db.getCourseById(id))
          .filter((c): c is Course => c !== null);
        setCourses(pathCourses);
      }
    }
  }, [slug]);

  if (!path) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EmptyState
          icon="🎓"
          title="Learning path not found"
          description="The learning path you're looking for doesn't exist"
          action={
            <Link to="/academy/paths">
              <Button>Browse Learning Paths</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case Difficulty.BEGINNER:
        return 'success';
      case Difficulty.INTERMEDIATE:
        return 'info';
      case Difficulty.ADVANCED:
        return 'warning';
      case Difficulty.EXPERT:
        return 'danger';
      default:
        return 'outline';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-400">
        <Link to="/academy" className="hover:text-emerald-400 transition-colors">
          Academy
        </Link>
        <span>/</span>
        <Link to="/academy/paths" className="hover:text-emerald-400 transition-colors">
          Learning Paths
        </Link>
        <span>/</span>
        <span className="text-white">{path.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-12">
        <div className="flex items-start gap-6 mb-6">
          <div className="text-6xl">{path.icon}</div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-3">{path.name}</h1>
            <div className="flex items-center gap-3 mb-4">
              <Badge variant={getDifficultyColor(path.difficulty)} size="md">
                {path.difficulty}
              </Badge>
              <span className="text-gray-400">{path.estimatedHours} hours</span>
              <span className="text-gray-400">{path.courseIds.length} courses</span>
            </div>
            <p className="text-lg text-gray-300">{path.description}</p>
          </div>
        </div>
      </div>

      {/* Courses */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Courses in this Path</h2>
        {courses.length > 0 ? (
          <div className="space-y-6">
            {courses.map((course, idx) => (
              <div key={course.id} className="relative">
                {idx > 0 && (
                  <div className="absolute -top-3 left-8 w-0.5 h-3 bg-gray-800" />
                )}
                <CourseCard course={course} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="📚"
            title="No courses in this path yet"
            description="Courses will be added to this learning path soon"
          />
        )}
      </div>
    </div>
  );
}
