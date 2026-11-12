import { useEffect, useState } from 'react';
import { db } from '../db/store';
import { EventCard } from '../components/events/EventCard';
import { Input, Select, EmptyState } from '../components/ui';
import { EventType, EventMode } from '../db/eventsSchema';
import type { Event } from '../db/eventsSchema';

export function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [modeFilter, setModeFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');

  useEffect(() => {
    setEvents(db.listEvents());
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesSearch = searchQuery === '' || 
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.organizer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || event.eventType === typeFilter;
    const matchesMode = modeFilter === 'all' || event.mode === modeFilter;
    const matchesCountry = countryFilter === 'all' || event.country === countryFilter;

    return matchesSearch && matchesType && matchesMode && matchesCountry;
  });

  // Get unique countries
  const countries = Array.from(new Set(events.map(e => e.country))).sort();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Cybersecurity Events</h1>
        <p className="text-gray-400">
          Discover conferences, webinars, CTFs, and training opportunities.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/30">
          <div className="text-2xl font-bold text-white">{events.length}</div>
          <div className="text-sm text-gray-500">Total Events</div>
        </div>
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/30">
          <div className="text-2xl font-bold text-emerald-400">
            {events.filter(e => new Date(e.startDate) > new Date()).length}
          </div>
          <div className="text-sm text-gray-500">Upcoming</div>
        </div>
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/30">
          <div className="text-2xl font-bold text-cyan-400">
            {events.filter(e => e.mode === EventMode.ONLINE).length}
          </div>
          <div className="text-sm text-gray-500">Online</div>
        </div>
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/30">
          <div className="text-2xl font-bold text-purple-400">
            {events.filter(e => e.isFeatured).length}
          </div>
          <div className="text-sm text-gray-500">Featured</div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Input
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Types' },
            { value: EventType.CONFERENCE, label: 'Conference' },
            { value: EventType.WEBINAR, label: 'Webinar' },
            { value: EventType.CTF, label: 'CTF' },
            { value: EventType.HACKATHON, label: 'Hackathon' },
            { value: EventType.TRAINING, label: 'Training' },
            { value: EventType.MEETUP, label: 'Meetup' },
            { value: EventType.WORKSHOP, label: 'Workshop' },
          ]}
        />
        <Select
          value={modeFilter}
          onChange={(e) => setModeFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Modes' },
            { value: EventMode.ONLINE, label: 'Online' },
            { value: EventMode.OFFLINE, label: 'In-Person' },
            { value: EventMode.HYBRID, label: 'Hybrid' },
          ]}
        />
        <Select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Countries' },
            ...countries.map(c => ({ value: c, label: c })),
          ]}
        />
      </div>

      {/* Events List */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="📅"
          title="No events found"
          description="Try adjusting your search or filters"
        />
      )}
    </div>
  );
}
