import { Badge } from '../ui';

interface ToolCardProps {
  name: string;
  description: string;
  category: string;
  pricing: 'free' | 'freemium' | 'paid' | 'open_source';
  rating?: number;
  logoUrl?: string;
  url?: string;
}

const pricingStyles = {
  free: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  freemium: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  paid: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  open_source: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

export function ToolCard({ name, description, category, pricing, rating, logoUrl, url }: ToolCardProps) {
  const Component = url ? 'a' : 'div';
  const linkProps = url ? { href: url, target: '_blank', rel: 'noopener noreferrer' } : {};

  return (
    <Component
      {...linkProps}
      className="group block rounded-lg border border-gray-800 bg-gray-900/30 p-4 hover:border-emerald-500/30 transition-all duration-300"
    >
      <div className="flex items-start gap-3">
        {logoUrl ? (
          <img src={logoUrl} alt={name} className="w-10 h-10 rounded-lg object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-lg">
            🔧
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors truncate">
              {name}
            </h3>
            {rating && (
              <div className="flex items-center gap-0.5 text-xs text-amber-400">
                <span>★</span>
                <span>{rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400 line-clamp-2 mb-2">{description}</p>
          <div className="flex items-center gap-2">
            <Badge variant="outline" size="sm">{category}</Badge>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${pricingStyles[pricing]}`}>
              {pricing.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>
    </Component>
  );
}
