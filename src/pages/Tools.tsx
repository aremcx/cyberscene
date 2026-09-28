import { useState, useEffect } from 'react';
import { db } from '../db/store';
import { ToolCard } from '../components/tools/ToolCard';
import { Input, Select, EmptyState, Badge } from '../components/ui';
import { ToolCategory, ToolPlatform, ToolLicense, SkillLevel } from '../db/toolsSchema';
import type { Tool } from '../db/toolsSchema';

export function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [licenseFilter, setLicenseFilter] = useState<string>('all');
  const [skillFilter, setSkillFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const result = db.listTools({ page: 1, pageSize: 100 });
    setTools(result.data);
  };

  const filteredTools = tools.filter(tool => {
    const matchesSearch = searchQuery === '' || 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.longDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.useCases.some(uc => uc.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || tool.category === categoryFilter;
    const matchesPlatform = platformFilter === 'all' || tool.platforms.includes(platformFilter as ToolPlatform);
    const matchesLicense = licenseFilter === 'all' || tool.license === licenseFilter;
    const matchesSkill = skillFilter === 'all' || tool.skillLevel === skillFilter;

    return matchesSearch && matchesCategory && matchesPlatform && matchesLicense && matchesSkill;
  });

  const getCategoryLabel = (category: ToolCategory) => {
    return category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Calculate category counts
  const categoryCounts = tools.reduce((acc, tool) => {
    acc[tool.category] = (acc[tool.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Tools Directory</h1>
        <p className="text-gray-400">
          Curated cybersecurity tools with detailed information, use cases, and skill level guidance.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/30">
          <div className="text-2xl font-bold text-white">{tools.length}</div>
          <div className="text-sm text-gray-500">Total Tools</div>
        </div>
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/30">
          <div className="text-2xl font-bold text-emerald-400">
            {tools.filter(t => t.license === ToolLicense.OPEN_SOURCE).length}
          </div>
          <div className="text-sm text-gray-500">Open Source</div>
        </div>
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/30">
          <div className="text-2xl font-bold text-amber-400">
            {tools.filter(t => t.license === ToolLicense.COMMERCIAL).length}
          </div>
          <div className="text-sm text-gray-500">Commercial</div>
        </div>
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/30">
          <div className="text-2xl font-bold text-blue-400">
            {Object.keys(categoryCounts).length}
          </div>
          <div className="text-sm text-gray-500">Categories</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Input
          placeholder="Search tools..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />
        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Categories' },
            ...Object.values(ToolCategory).map(cat => ({
              value: cat,
              label: `${getCategoryLabel(cat)} (${categoryCounts[cat] || 0})`,
            })),
          ]}
        />
        <Select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Platforms' },
            { value: ToolPlatform.WINDOWS, label: 'Windows' },
            { value: ToolPlatform.LINUX, label: 'Linux' },
            { value: ToolPlatform.MACOS, label: 'macOS' },
            { value: ToolPlatform.CROSS_PLATFORM, label: 'Cross-Platform' },
            { value: ToolPlatform.WEB, label: 'Web' },
            { value: ToolPlatform.CLOUD, label: 'Cloud' },
          ]}
        />
        <Select
          value={licenseFilter}
          onChange={(e) => setLicenseFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Licenses' },
            { value: ToolLicense.OPEN_SOURCE, label: 'Open Source' },
            { value: ToolLicense.COMMERCIAL, label: 'Commercial' },
            { value: ToolLicense.FREEMIUM, label: 'Freemium' },
            { value: ToolLicense.FREE, label: 'Free' },
          ]}
        />
        <Select
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Skill Levels' },
            { value: SkillLevel.BEGINNER, label: 'Beginner' },
            { value: SkillLevel.INTERMEDIATE, label: 'Intermediate' },
            { value: SkillLevel.ADVANCED, label: 'Advanced' },
            { value: SkillLevel.EXPERT, label: 'Expert' },
          ]}
        />
      </div>

      {/* Results count */}
      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm text-gray-400">
          Showing <span className="font-medium text-white">{filteredTools.length}</span> of{' '}
          <span className="font-medium text-white">{tools.length}</span> tools
        </div>
      </div>

      {/* Tools Grid */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🔧"
          title="No tools found"
          description="Try adjusting your search or filters"
        />
      )}
    </div>
  );
}
