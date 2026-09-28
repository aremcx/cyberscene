import { useEffect, useState } from 'react';
import { db } from '../db/store';
import { JobCard } from '../components/jobs/JobCard';
import { Input, Select, EmptyState } from '../components/ui';
import { JobType, WorkMode, ExperienceLevel } from '../db/jobsSchema';
import type { Job } from '../db/jobsSchema';

export function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [modeFilter, setModeFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');

  useEffect(() => {
    setJobs(db.listJobs());
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchQuery === '' || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || job.jobType === typeFilter;
    const matchesMode = modeFilter === 'all' || job.workMode === modeFilter;
    const matchesLevel = levelFilter === 'all' || job.experienceLevel === levelFilter;
    const matchesCountry = countryFilter === 'all' || job.country === countryFilter;

    return matchesSearch && matchesType && matchesMode && matchesLevel && matchesCountry;
  });

  // Get unique countries
  const countries = Array.from(new Set(jobs.map(j => j.country))).sort();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Cybersecurity Jobs</h1>
        <p className="text-gray-400">
          Find your next role in cybersecurity. Browse opportunities from top organizations.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/30">
          <div className="text-2xl font-bold text-white">{jobs.length}</div>
          <div className="text-sm text-gray-500">Total Jobs</div>
        </div>
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/30">
          <div className="text-2xl font-bold text-emerald-400">
            {jobs.filter(j => j.workMode === WorkMode.REMOTE).length}
          </div>
          <div className="text-sm text-gray-500">Remote</div>
        </div>
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/30">
          <div className="text-2xl font-bold text-cyan-400">
            {jobs.filter(j => j.country === 'Nigeria').length}
          </div>
          <div className="text-sm text-gray-500">Nigeria</div>
        </div>
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/30">
          <div className="text-2xl font-bold text-purple-400">
            {jobs.filter(j => j.jobType === JobType.INTERNSHIP).length}
          </div>
          <div className="text-sm text-gray-500">Internships</div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Input
          placeholder="Search jobs..."
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
            { value: JobType.FULL_TIME, label: 'Full-time' },
            { value: JobType.PART_TIME, label: 'Part-time' },
            { value: JobType.CONTRACT, label: 'Contract' },
            { value: JobType.INTERNSHIP, label: 'Internship' },
          ]}
        />
        <Select
          value={modeFilter}
          onChange={(e) => setModeFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Locations' },
            { value: WorkMode.REMOTE, label: 'Remote' },
            { value: WorkMode.HYBRID, label: 'Hybrid' },
            { value: WorkMode.ONSITE, label: 'On-site' },
          ]}
        />
        <Select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Levels' },
            { value: ExperienceLevel.ENTRY, label: 'Entry Level' },
            { value: ExperienceLevel.JUNIOR, label: 'Junior' },
            { value: ExperienceLevel.MID_LEVEL, label: 'Mid-Level' },
            { value: ExperienceLevel.SENIOR, label: 'Senior' },
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

      {/* Jobs List */}
      {filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="💼"
          title="No jobs found"
          description="Try adjusting your search or filters"
        />
      )}
    </div>
  );
}
