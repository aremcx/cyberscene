import { useEffect, useState } from 'react';
import { db } from '../../db/store';
import { LabCard } from '../../components/academy/LabCard';
import { Input, Select, EmptyState } from '../../components/ui';
import { Difficulty, LabType } from '../../db/academySchema';
import type { Lab } from '../../db/academySchema';

export function LabsPage() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  useEffect(() => {
    setLabs(db.listLabs());
  }, []);

  const filteredLabs = labs.filter(lab => {
    const matchesSearch = searchQuery === '' || 
      lab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lab.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || lab.type === typeFilter;
    const matchesDifficulty = difficultyFilter === 'all' || lab.difficulty === difficultyFilter;

    return matchesSearch && matchesType && matchesDifficulty;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Hands-on Labs</h1>
        <p className="text-gray-400">
          Practice your skills in safe, isolated lab environments.
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Input
          placeholder="Search labs..."
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
            { value: LabType.HANDS_ON, label: 'Hands-on' },
            { value: LabType.CTF, label: 'CTF' },
            { value: LabType.SCENARIO, label: 'Scenario' },
          ]}
        />
        <Select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Difficulties' },
            { value: Difficulty.BEGINNER, label: 'Beginner' },
            { value: Difficulty.INTERMEDIATE, label: 'Intermediate' },
            { value: Difficulty.ADVANCED, label: 'Advanced' },
            { value: Difficulty.EXPERT, label: 'Expert' },
          ]}
        />
      </div>

      {/* Labs Grid */}
      {filteredLabs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLabs.map((lab) => (
            <LabCard key={lab.id} lab={lab} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🔬"
          title="No labs found"
          description="Try adjusting your search or filters"
        />
      )}
    </div>
  );
}
