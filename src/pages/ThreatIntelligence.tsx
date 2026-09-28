import { useState, useEffect } from 'react';
import { db } from '../db/store';
import { ThreatActorCard } from '../components/threat/ThreatActorCard';
import { MalwareCard } from '../components/threat/MalwareCard';
import { Tabs, Input, Select, EmptyState } from '../components/ui';
import { ThreatActorClassification, MalwareType } from '../db/threatIntelSchema';
import type { ThreatActor, Malware } from '../db/threatIntelSchema';

export function ThreatIntelligencePage() {
  const [activeTab, setActiveTab] = useState('actors');
  const [actors, setActors] = useState<ThreatActor[]>([]);
  const [malwareList, setMalwareList] = useState<Malware[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [classificationFilter, setClassificationFilter] = useState<string>('all');
  const [malwareTypeFilter, setMalwareTypeFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const actorsResult = db.listThreatActors({ page: 1, pageSize: 100 });
    setActors(actorsResult.data);

    const malwareResult = db.listMalware({ page: 1, pageSize: 100 });
    setMalwareList(malwareResult.data);
  };

  const filteredActors = actors.filter(actor => {
    const matchesSearch = searchQuery === '' || 
      actor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      actor.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      actor.aliases.some(alias => alias.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesClassification = classificationFilter === 'all' || 
      actor.classification === classificationFilter;

    return matchesSearch && matchesClassification;
  });

  const filteredMalware = malwareList.filter(malware => {
    const matchesSearch = searchQuery === '' || 
      malware.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      malware.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = malwareTypeFilter === 'all' || 
      malware.type === malwareTypeFilter;

    return matchesSearch && matchesType;
  });

  const tabs = [
    { id: 'actors', label: 'Threat Actors', count: actors.length },
    { id: 'malware', label: 'Malware', count: malwareList.length },
    { id: 'reports', label: 'Threat Reports', count: 0 },
    { id: 'indicators', label: 'Indicators', count: 0 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Threat Intelligence</h1>
        <p className="text-gray-400">
          Comprehensive threat intelligence database including threat actors, malware, and indicators of compromise.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/30">
          <div className="text-2xl font-bold text-red-400">{actors.length}</div>
          <div className="text-sm text-gray-500">Threat Actors</div>
        </div>
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/30">
          <div className="text-2xl font-bold text-orange-400">{malwareList.length}</div>
          <div className="text-sm text-gray-500">Malware Families</div>
        </div>
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/30">
          <div className="text-2xl font-bold text-amber-400">{actors.filter(a => a.isActive).length}</div>
          <div className="text-sm text-gray-500">Active Threats</div>
        </div>
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/30">
          <div className="text-2xl font-bold text-blue-400">
            {actors.filter(a => a.classification === ThreatActorClassification.STATE_SPONSORED).length}
          </div>
          <div className="text-sm text-gray-500">State-Sponsored</div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-8" />

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />
        {activeTab === 'actors' && (
          <Select
            value={classificationFilter}
            onChange={(e) => setClassificationFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Classifications' },
              { value: ThreatActorClassification.STATE_SPONSORED, label: 'State-Sponsored' },
              { value: ThreatActorClassification.CRIMINAL, label: 'Criminal' },
              { value: ThreatActorClassification.HACKTIVIST, label: 'Hacktivist' },
              { value: ThreatActorClassification.INSIDER, label: 'Insider' },
              { value: ThreatActorClassification.UNKNOWN, label: 'Unknown' },
            ]}
          />
        )}
        {activeTab === 'malware' && (
          <Select
            value={malwareTypeFilter}
            onChange={(e) => setMalwareTypeFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Types' },
              { value: MalwareType.RANSOMWARE, label: 'Ransomware' },
              { value: MalwareType.TROJAN, label: 'Trojan' },
              { value: MalwareType.WORM, label: 'Worm' },
              { value: MalwareType.SPYWARE, label: 'Spyware' },
              { value: MalwareType.BOTNET, label: 'Botnet' },
            ]}
          />
        )}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="font-medium text-white">
            {activeTab === 'actors' ? filteredActors.length : filteredMalware.length}
          </span>
          results found
        </div>
      </div>

      {/* Content */}
      {activeTab === 'actors' && (
        filteredActors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActors.map((actor) => (
              <ThreatActorCard key={actor.id} actor={actor} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="🎭"
            title="No threat actors found"
            description="Try adjusting your search or filters"
          />
        )
      )}

      {activeTab === 'malware' && (
        filteredMalware.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMalware.map((malware) => (
              <MalwareCard key={malware.id} malware={malware} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="🦠"
            title="No malware found"
            description="Try adjusting your search or filters"
          />
        )
      )}

      {activeTab === 'reports' && (
        <EmptyState
          icon="📋"
          title="Threat Reports"
          description="Threat reports coming soon"
        />
      )}

      {activeTab === 'indicators' && (
        <EmptyState
          icon="🔍"
          title="Indicators of Compromise"
          description="IOC database coming soon"
        />
      )}
    </div>
  );
}
