import { Badge } from '../ui';

interface ThreatCardProps {
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  source?: string;
  date: string;
  affectedSystems?: string[];
}

const severityStyles = {
  critical: 'bg-red-500/10 border-red-500/20 text-red-400',
  high: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
  medium: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  low: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
};

export function ThreatCard({ title, severity, description, source, date, affectedSystems }: ThreatCardProps) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-sm font-semibold text-white line-clamp-2">{title}</h3>
        <Badge variant={severity === 'critical' ? 'danger' : severity === 'high' ? 'warning' : 'info'} size="sm">
          {severity}
        </Badge>
      </div>
      <p className="text-xs text-gray-400 mb-3 line-clamp-2">{description}</p>
      {affectedSystems && affectedSystems.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {affectedSystems.slice(0, 3).map((system) => (
            <span key={system} className="text-[10px] text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">
              {system}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between text-[10px] text-gray-500">
        {source && <span>Source: {source}</span>}
        <span>{date}</span>
      </div>
    </div>
  );
}
