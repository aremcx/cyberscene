import { Badge, EmptyState } from '../components/ui';

export function EventsPage() {
  // Demo events data
  const events = [
    {
      title: 'CyberSec Africa 2024',
      date: 'March 15-17, 2024',
      location: 'Lagos, Nigeria',
      type: 'Conference',
      description: 'The premier cybersecurity conference for the African continent.',
      isVirtual: false,
    },
    {
      title: 'Red Team Operations Workshop',
      date: 'February 28, 2024',
      location: 'Virtual',
      type: 'Workshop',
      description: 'Hands-on workshop covering advanced red team techniques.',
      isVirtual: true,
    },
    {
      title: 'Cloud Security Summit',
      date: 'April 5-6, 2024',
      location: 'London, UK',
      type: 'Conference',
      description: 'Deep dive into cloud security architectures and best practices.',
      isVirtual: false,
    },
    {
      title: 'Bug Bounty Hunting Meetup',
      date: 'March 1, 2024',
      location: 'Virtual',
      type: 'Meetup',
      description: 'Monthly meetup for bug bounty hunters to share techniques.',
      isVirtual: true,
    },
  ];

  const typeColors = {
    Conference: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Workshop: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Meetup: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Webinar: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">📅</span>
          <h1 className="text-3xl font-bold text-white">Events</h1>
        </div>
        <p className="text-gray-400">
          Cybersecurity conferences, workshops, meetups, and webinars.
        </p>
      </div>

      {/* Events Grid */}
      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-gray-800 bg-gray-900/30 p-6 hover:border-emerald-500/30 transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{event.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>{event.date}</span>
                    <span>•</span>
                    <span>{event.location}</span>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full border ${typeColors[event.type as keyof typeof typeColors]}`}>
                  {event.type}
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-4">{event.description}</p>
              <div className="flex items-center gap-2">
                {event.isVirtual && (
                  <Badge variant="info" size="sm">Virtual</Badge>
                )}
                <button className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                  Learn more →
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="📅"
          title="No upcoming events"
          description="Check back soon for cybersecurity events."
        />
      )}

      {/* Submit Event CTA */}
      <div className="mt-12 p-6 rounded-xl border border-gray-800 bg-gray-900/30 text-center">
        <h3 className="text-lg font-semibold text-white mb-2">Host a Cybersecurity Event?</h3>
        <p className="text-sm text-gray-400 mb-4">
          Submit your event to be featured on our platform and reach thousands of security professionals.
        </p>
        <button className="px-4 py-2 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors">
          Submit Event
        </button>
      </div>
    </div>
  );
}
