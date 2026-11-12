import { Link } from 'react-router-dom';
import { Badge } from '../ui';
import { ThreatActorClassification } from '../../db/threatIntelSchema';
import type { ThreatActor } from '../../db/threatIntelSchema';

interface ThreatActorCardProps {
  actor: ThreatActor;
}

export function ThreatActorCard({ actor }: ThreatActorCardProps) {
  const getClassificationColor = (classification: ThreatActorClassification) => {
    switch (classification) {
      case ThreatActorClassification.STATE_SPONSORED:
        return 'danger';
      case ThreatActorClassification.CRIMINAL:
        return 'warning';
      case ThreatActorClassification.HACKTIVIST:
        return 'info';
      case ThreatActorClassification.INSIDER:
        return 'default';
      default:
        return 'outline';
    }
  };

  const getClassificationLabel = (classification: ThreatActorClassification) => {
    return classification.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Link
      to={`/threat-intelligence/actors/${actor.id}`}
      className="block p-6 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-emerald-500/50 transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors mb-1">
            {actor.name}
          </h3>
          {actor.aliases.length > 0 && (
            <p className="text-sm text-gray-500">
              Also known as: {actor.aliases.slice(0, 3).join(', ')}
              {actor.aliases.length > 3 && ` +${actor.aliases.length - 3} more`}
            </p>
          )}
        </div>
        <Badge variant={getClassificationColor(actor.classification)} size="sm">
          {getClassificationLabel(actor.classification)}
        </Badge>
      </div>

      <p className="text-sm text-gray-400 mb-4 line-clamp-2">
        {actor.description}
      </p>

      <div className="space-y-2">
        {actor.knownTargets.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Targets:</p>
            <div className="flex flex-wrap gap-1">
              {actor.knownTargets.slice(0, 4).map((target, idx) => (
                <span key={idx} className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded">
                  {target}
                </span>
              ))}
              {actor.knownTargets.length > 4 && (
                <span className="text-xs text-gray-500">+{actor.knownTargets.length - 4}</span>
              )}
            </div>
          </div>
        )}

        {actor.geography.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Geography:</p>
            <div className="flex flex-wrap gap-1">
              {actor.geography.slice(0, 3).map((geo, idx) => (
                <span key={idx} className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded">
                  {geo}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${actor.isActive ? 'bg-red-500' : 'bg-gray-600'}`} />
          <span className="text-xs text-gray-500">
            {actor.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        {actor.lastSeen && (
          <span className="text-xs text-gray-500">
            Last seen: {new Date(actor.lastSeen).toLocaleDateString()}
          </span>
        )}
      </div>
    </Link>
  );
}
