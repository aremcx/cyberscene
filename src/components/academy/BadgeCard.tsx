import { Badge } from '../ui';
import type { Badge as BadgeType } from '../../db/academySchema';

interface BadgeCardProps {
  badge: BadgeType;
  earned?: boolean;
  earnedAt?: string;
}

export function BadgeCard({ badge, earned = false, earnedAt }: BadgeCardProps) {
  return (
    <div
      className={`p-4 rounded-xl border transition-all duration-300 ${
        earned
          ? 'bg-emerald-500/10 border-emerald-500/30'
          : 'bg-gray-900/50 border-gray-800 opacity-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="text-4xl">{badge.icon}</div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white mb-1">{badge.name}</h3>
          <p className="text-xs text-gray-400 mb-2">{badge.description}</p>
          <div className="flex items-center gap-2">
            <Badge variant="outline" size="sm">
              {badge.category}
            </Badge>
            <span className="text-xs text-gray-500">{badge.pointsRequired} pts</span>
          </div>
          {earned && earnedAt && (
            <p className="text-xs text-emerald-400 mt-2">
              ✓ Earned {new Date(earnedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
