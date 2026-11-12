import { Link } from 'react-router-dom';
import { Badge } from '../ui';
import { Difficulty } from '../../db/academySchema';
import type { Course } from '../../db/academySchema';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
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
    <Link
      to={`/academy/courses/${course.slug}`}
      className="block p-6 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-emerald-500/50 transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
          {course.title}
        </h3>
        <Badge variant={getDifficultyColor(course.difficulty)} size="sm">
          {course.difficulty}
        </Badge>
      </div>

      <p className="text-sm text-gray-400 mb-4 line-clamp-2">
        {course.description}
      </p>

      {course.learningObjectives.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">What you'll learn:</p>
          <ul className="space-y-1">
            {course.learningObjectives.slice(0, 3).map((obj, idx) => (
              <li key={idx} className="text-xs text-gray-400 flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <span className="line-clamp-1">{obj}</span>
              </li>
            ))}
            {course.learningObjectives.length > 3 && (
              <li className="text-xs text-gray-500">
                +{course.learningObjectives.length - 3} more
              </li>
            )}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{course.moduleIds.length} modules</span>
          <span>{course.estimatedHours} hours</span>
        </div>
        <span className="text-sm text-emerald-400 group-hover:text-emerald-300 transition-colors">
          View Course →
        </span>
      </div>
    </Link>
  );
}
