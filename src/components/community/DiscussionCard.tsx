import { Link } from 'react-router-dom';
import { Badge } from '../ui';
import { DiscussionType } from '../../db/communitySchema';
import type { Discussion } from '../../db/communitySchema';
import { formatRelativeTime } from '../../lib/utils';

interface DiscussionCardProps {
  discussion: Discussion;
  commentCount?: number;
}

export function DiscussionCard({ discussion, commentCount = 0 }: DiscussionCardProps) {
  const getTypeColor = (type: DiscussionType) => {
    switch (type) {
      case DiscussionType.QUESTION:
        return 'info';
      case DiscussionType.DISCUSSION:
        return 'default';
      case DiscussionType.HELP:
        return 'warning';
      case DiscussionType.SHOWCASE:
        return 'success';
      default:
        return 'outline';
    }
  };

  const getTypeLabel = (type: DiscussionType) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <Link
      to={`/community/discussions/${discussion.slug}`}
      className="block p-6 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-emerald-500/50 transition-all duration-300"
    >
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {discussion.isPinned && (
              <Badge variant="warning" size="sm">📌 Pinned</Badge>
            )}
            <Badge variant={getTypeColor(discussion.type)} size="sm">
              {getTypeLabel(discussion.type)}
            </Badge>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2 hover:text-emerald-400 transition-colors">
            {discussion.title}
          </h3>
          <p className="text-sm text-gray-400 mb-4 line-clamp-2">
            {discussion.content}
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>{commentCount} replies</span>
            <span>{discussion.viewCount} views</span>
            <span>{formatRelativeTime(discussion.createdAt)}</span>
          </div>
          {discussion.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {discussion.tags.slice(0, 3).map((tag, idx) => (
                <span key={idx} className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded">
                  #{tag}
                </span>
              ))}
              {discussion.tags.length > 3 && (
                <span className="text-xs text-gray-500">+{discussion.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
