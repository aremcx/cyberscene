import { Link } from 'react-router-dom';
import { Badge } from '../ui';
import { EventType, EventMode } from '../../db/eventsSchema';
import type { Event } from '../../db/eventsSchema';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const getEventTypeIcon = (type: EventType) => {
    switch (type) {
      case EventType.CONFERENCE:
        return '🎤';
      case EventType.WEBINAR:
        return '📹';
      case EventType.CTF:
        return '🚩';
      case EventType.HACKATHON:
        return '💻';
      case EventType.TRAINING:
        return '📚';
      case EventType.MEETUP:
        return '👥';
      case EventType.WORKSHOP:
        return '🔧';
      default:
        return '📅';
    }
  };

  const getEventTypeLabel = (type: EventType) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getModeLabel = (mode: EventMode) => {
    switch (mode) {
      case EventMode.ONLINE:
        return '🌐 Online';
      case EventMode.OFFLINE:
        return '📍 In-Person';
      case EventMode.HYBRID:
        return '🔄 Hybrid';
      default:
        return mode;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const isUpcoming = new Date(event.startDate) > new Date();

  return (
    <Link
      to={`/events/${event.slug}`}
      className="block p-6 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-emerald-500/50 transition-all duration-300"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="text-4xl">{getEventTypeIcon(event.eventType)}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {event.isFeatured && (
              <Badge variant="warning" size="sm">⭐ Featured</Badge>
            )}
            <Badge variant="outline" size="sm">
              {getEventTypeLabel(event.eventType)}
            </Badge>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1 hover:text-emerald-400 transition-colors">
            {event.name}
          </h3>
          <p className="text-sm text-emerald-400">{event.organizer}</p>
        </div>
      </div>

      <p className="text-sm text-gray-400 mb-4 line-clamp-2">
        {event.description}
      </p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <span>📅</span>
          <span>{formatDate(event.startDate)}</span>
          {event.endDate && event.endDate !== event.startDate && (
            <span className="text-gray-500">- {formatDate(event.endDate)}</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <span>{getModeLabel(event.mode)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <span>📍</span>
          <span>{event.location}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
        <div className="flex items-center gap-2">
          {event.capacity && (
            <span className="text-xs text-gray-500">
              {event.registeredCount}/{event.capacity} registered
            </span>
          )}
        </div>
        {isUpcoming ? (
          <Badge variant="success" size="sm">Upcoming</Badge>
        ) : (
          <Badge variant="outline" size="sm">Past Event</Badge>
        )}
      </div>
    </Link>
  );
}
