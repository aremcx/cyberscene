import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db } from '../db/store';
import type { Event } from '../db/eventsSchema';
import { Badge, Button, Card, EmptyState } from '../components/ui';
import { formatDate } from '../lib/utils';

export function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      const found = db.getEventBySlug(slug);
      if (found) {
        setEvent(found);
      }
      setLoading(false);
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-800 rounded w-3/4"></div>
          <div className="h-4 bg-gray-800 rounded w-1/2"></div>
          <div className="h-64 bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <EmptyState
        icon="📅"
        title="Event Not Found"
        description="The event you're looking for doesn't exist or has been removed."
        action={
          <Link to="/events">
            <Button>Browse Events</Button>
          </Link>
        }
      />
    );
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'conference': return '🎤';
      case 'webinar': return '📹';
      case 'ctf': return '🚩';
      case 'hackathon': return '💻';
      case 'training': return '📚';
      case 'meetup': return '👥';
      case 'workshop': return '🔧';
      default: return '📅';
    }
  };

  const getEventTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'online': return '🌐 Online';
      case 'offline': return '📍 In-Person';
      case 'hybrid': return '🔄 Hybrid';
      default: return mode;
    }
  };

  const isUpcoming = new Date(event.startDate) > new Date();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-400">
        <Link to="/" className="hover:text-emerald-400 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link to="/events" className="hover:text-emerald-400 transition-colors">
          Events
        </Link>
        <span>/</span>
        <span className="text-white truncate">{event.name}</span>
      </nav>

      {/* Event Header */}
      <div className="mb-8">
        <div className="flex items-start gap-4 mb-4">
          <div className="text-6xl">{getEventTypeIcon(event.eventType)}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {event.isFeatured && (
                <Badge variant="warning" size="md">
                  ⭐ Featured
                </Badge>
              )}
              <Badge variant="outline" size="md">
                {getEventTypeLabel(event.eventType)}
              </Badge>
              {isUpcoming ? (
                <Badge variant="success" size="md">
                  Upcoming
                </Badge>
              ) : (
                <Badge variant="outline" size="md">
                  Past Event
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {event.name}
            </h1>
            <p className="text-xl text-emerald-400">
              {event.organizer}
            </p>
          </div>
        </div>

        {/* Event Meta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <div className="p-4">
              <div className="text-sm text-gray-400 mb-1">📅 Date</div>
              <div className="text-white">
                {formatDate(event.startDate)}
                {event.endDate && event.endDate !== event.startDate && (
                  <span className="text-gray-400"> - {formatDate(event.endDate)}</span>
                )}
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <div className="text-sm text-gray-400 mb-1">📍 Location</div>
              <div className="text-white">
                {getModeLabel(event.mode)}
                <div className="text-sm text-gray-400 mt-1">
                  {event.location}, {event.country}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Registration */}
        {isUpcoming && event.registrationUrl && (
          <div className="flex gap-3 mb-8">
            <a
              href={event.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg">
                Register Now
              </Button>
            </a>
            {event.websiteUrl && (
              <a
                href={event.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="lg">
                  Visit Website
                </Button>
              </a>
            )}
          </div>
        )}

        {/* Capacity */}
        {event.capacity && (
          <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400 mb-1">Registration</div>
                <div className="text-white">
                  {event.registeredCount} / {event.capacity} registered
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400 mb-1">Spots Left</div>
                <div className="text-2xl font-bold text-emerald-400">
                  {event.capacity - event.registeredCount}
                </div>
              </div>
            </div>
            <div className="mt-3 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500"
                style={{ width: `${(event.registeredCount / event.capacity) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Event Description */}
      <Card className="mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            About This Event
          </h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 whitespace-pre-wrap">
              {event.description}
            </p>
          </div>
        </div>
      </Card>

      {/* Event Details */}
      <Card className="mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Event Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">Event Type</div>
              <div className="text-white">{getEventTypeLabel(event.eventType)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Category</div>
              <div className="text-white">{event.category}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Mode</div>
              <div className="text-white">{getModeLabel(event.mode)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Organizer</div>
              <div className="text-white">{event.organizer}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Back to Events */}
      <div className="text-center">
        <Link to="/events">
          <Button variant="outline">
            ← Back to Events
          </Button>
        </Link>
      </div>
    </div>
  );
}
