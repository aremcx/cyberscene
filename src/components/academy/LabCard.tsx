import { Link } from 'react-router-dom';
import { Badge } from '../ui';
import { Difficulty, LabType } from '../../db/academySchema';
import type { Lab } from '../../db/academySchema';

interface LabCardProps {
  lab: Lab;
}

export function LabCard({ lab }: LabCardProps) {
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

  const getTypeLabel = (type: LabType) => {
    switch (type) {
      case LabType.HANDS_ON:
        return 'Hands-on';
      case LabType.CTF:
        return 'CTF';
      case LabType.SCENARIO:
        return 'Scenario';
      default:
        return type;
    }
  };

  return (
    <Link
      to={`/academy/labs/${lab.slug}`}
      className="block p-6 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-emerald-500/50 transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors mb-2">
            {lab.title}
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant={getDifficultyColor(lab.difficulty)} size="sm">
              {lab.difficulty}
            </Badge>
            <Badge variant="outline" size="sm">
              {getTypeLabel(lab.type)}
            </Badge>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-emerald-400">{lab.points}</div>
          <div className="text-xs text-gray-500">points</div>
        </div>
      </div>

      <p className="text-sm text-gray-400 mb-4 line-clamp-2">
        {lab.description}
      </p>

      {lab.objectives.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">Objectives:</p>
          <ul className="space-y-1">
            {lab.objectives.slice(0, 3).map((obj, idx) => (
              <li key={idx} className="text-xs text-gray-400 flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span className="line-clamp-1">{obj}</span>
              </li>
            ))}
            {lab.objectives.length > 3 && (
              <li className="text-xs text-gray-500">
                +{lab.objectives.length - 3} more
              </li>
            )}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
        <span className="text-sm text-gray-500">
          ⏱️ {lab.estimatedTime} minutes
        </span>
        <span className="text-sm text-emerald-400 group-hover:text-emerald-300 transition-colors">
          Start Lab →
        </span>
      </div>
    </Link>
  );
}
