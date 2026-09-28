import { Link } from 'react-router-dom';
import { Badge } from '../ui';
import { Difficulty } from '../../db/academySchema';
import type { LearningPath } from '../../db/academySchema';

interface LearningPathCardProps {
  path: LearningPath;
}

export function LearningPathCard({ path }: LearningPathCardProps) {
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
      to={`/academy/paths/${path.slug}`}
      className="block p-6 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-emerald-500/50 transition-all duration-300 group"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="text-4xl">{path.icon}</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors mb-2">
            {path.name}
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant={getDifficultyColor(path.difficulty)} size="sm">
              {path.difficulty}
            </Badge>
            <span className="text-sm text-gray-500">{path.estimatedHours} hours</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-400 mb-4 line-clamp-3">
        {path.description}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
        <span className="text-sm text-gray-500">
          {path.courseIds.length} course{path.courseIds.length !== 1 ? 's' : ''}
        </span>
        <span className="text-sm text-emerald-400 group-hover:text-emerald-300 transition-colors">
          Start Learning →
        </span>
      </div>
    </Link>
  );
}
