import { Link } from 'react-router-dom';
import { Badge } from '../ui';
import { ToolCategory, ToolLicense, SkillLevel } from '../../db/toolsSchema';
import type { Tool } from '../../db/toolsSchema';

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const getCategoryLabel = (category: ToolCategory) => {
    return category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getLicenseColor = (license: ToolLicense) => {
    switch (license) {
      case ToolLicense.OPEN_SOURCE:
        return 'success';
      case ToolLicense.COMMERCIAL:
        return 'warning';
      case ToolLicense.FREEMIUM:
        return 'info';
      case ToolLicense.FREE:
        return 'default';
      default:
        return 'outline';
    }
  };

  const getLicenseLabel = (license: ToolLicense) => {
    switch (license) {
      case ToolLicense.OPEN_SOURCE:
        return 'Open Source';
      case ToolLicense.COMMERCIAL:
        return 'Commercial';
      case ToolLicense.FREEMIUM:
        return 'Freemium';
      case ToolLicense.FREE:
        return 'Free';
      default:
        return license;
    }
  };

  const getSkillColor = (skill: SkillLevel) => {
    switch (skill) {
      case SkillLevel.BEGINNER:
        return 'success';
      case SkillLevel.INTERMEDIATE:
        return 'info';
      case SkillLevel.ADVANCED:
        return 'warning';
      case SkillLevel.EXPERT:
        return 'danger';
      default:
        return 'outline';
    }
  };

  return (
    <Link
      to={`/tools/${tool.slug}`}
      className="block p-6 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-emerald-500/50 transition-all duration-300 group"
    >
      <div className="flex items-start gap-4 mb-4">
        {tool.logoUrl ? (
          <img src={tool.logoUrl} alt={tool.name} className="w-12 h-12 rounded-lg object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
            <span className="text-2xl">🔧</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors mb-1">
            {tool.name}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" size="sm">
              {getCategoryLabel(tool.category)}
            </Badge>
            <Badge variant={getLicenseColor(tool.license)} size="sm">
              {getLicenseLabel(tool.license)}
            </Badge>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-400 mb-4 line-clamp-3">
        {tool.description}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <Badge variant={getSkillColor(tool.skillLevel)} size="sm">
            {tool.skillLevel}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {tool.platforms.slice(0, 3).map((platform, idx) => (
            <span key={idx} className="text-xs text-gray-500">
              {platform === 'windows' && '🪟'}
              {platform === 'linux' && '🐧'}
              {platform === 'macos' && '🍎'}
              {platform === 'cross_platform' && '🌐'}
              {platform === 'web' && '🌍'}
              {platform === 'cloud' && '☁️'}
              {platform === 'mobile' && '📱'}
            </span>
          ))}
          {tool.platforms.length > 3 && (
            <span className="text-xs text-gray-500">+{tool.platforms.length - 3}</span>
          )}
        </div>
      </div>

      {tool.pricing && (
        <div className="mt-3 pt-3 border-t border-gray-800">
          <p className="text-xs text-gray-500">{tool.pricing}</p>
        </div>
      )}
    </Link>
  );
}
