import { useState } from 'react';
import { VulnerabilityCard } from '../components/content/VulnerabilityCard';
import { Input, Select, Tabs, EmptyState } from '../components/ui';

export function VulnerabilitiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('recent');

  // Demo vulnerability data
  const vulnerabilities = [
    {
      cveId: 'CVE-2024-1234',
      title: 'Remote Code Execution in Apache HTTP Server',
      severity: 'critical' as const,
      cvssScore: 9.8,
      affectedProducts: ['Apache 2.4.x'],
      publishedDate: '2024-01-15',
    },
    {
      cveId: 'CVE-2024-5678',
      title: 'SQL Injection in WordPress Plugin',
      severity: 'high' as const,
      cvssScore: 8.1,
      affectedProducts: ['WordPress', 'Plugin X'],
      publishedDate: '2024-01-14',
    },
    {
      cveId: 'CVE-2024-9012',
      title: 'Privilege Escalation in Linux Kernel',
      severity: 'high' as const,
      cvssScore: 7.8,
      affectedProducts: ['Linux Kernel 5.x'],
      publishedDate: '2024-01-13',
    },
    {
      cveId: 'CVE-2024-3456',
      title: 'Cross-Site Scripting in React Library',
      severity: 'medium' as const,
      cvssScore: 6.1,
      affectedProducts: ['React 18.x'],
      publishedDate: '2024-01-12',
    },
    {
      cveId: 'CVE-2024-7890',
      title: 'Denial of Service in Nginx',
      severity: 'medium' as const,
      cvssScore: 5.3,
      affectedProducts: ['Nginx 1.x'],
      publishedDate: '2024-01-11',
    },
    {
      cveId: 'CVE-2024-2345',
      title: 'Information Disclosure in OpenSSL',
      severity: 'low' as const,
      cvssScore: 3.7,
      affectedProducts: ['OpenSSL 3.x'],
      publishedDate: '2024-01-10',
    },
  ];

  const filteredVulnerabilities = vulnerabilities.filter((vuln) => {
    const matchesSearch = searchQuery === '' || 
      vuln.cveId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vuln.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeverity = severityFilter === 'all' || vuln.severity === severityFilter;
    
    return matchesSearch && matchesSeverity;
  });

  const tabs = [
    { id: 'recent', label: 'Recent', count: vulnerabilities.length },
    { id: 'critical', label: 'Critical', count: vulnerabilities.filter(v => v.severity === 'critical').length },
    { id: 'high', label: 'High', count: vulnerabilities.filter(v => v.severity === 'high').length },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🛡️</span>
          <h1 className="text-3xl font-bold text-white">Vulnerabilities</h1>
        </div>
        <p className="text-gray-400">
          CVE database and vulnerability intelligence for security professionals.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Input
          placeholder="Search CVE ID or title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />
        <Select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Severities' },
            { value: 'critical', label: 'Critical' },
            { value: 'high', label: 'High' },
            { value: 'medium', label: 'Medium' },
            { value: 'low', label: 'Low' },
          ]}
        />
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="font-medium text-white">{filteredVulnerabilities.length}</span>
          vulnerabilities found
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-8" />

      {/* Vulnerabilities List */}
      {filteredVulnerabilities.length > 0 ? (
        <div className="space-y-3">
          {filteredVulnerabilities.map((vuln) => (
            <VulnerabilityCard key={vuln.cveId} {...vuln} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🔍"
          title="No vulnerabilities found"
          description="Try adjusting your search or filters."
        />
      )}

      {/* Info Box */}
      <div className="mt-12 p-6 rounded-xl border border-gray-800 bg-gray-900/30">
        <h3 className="text-lg font-semibold text-white mb-2">About CVE Database</h3>
        <p className="text-sm text-gray-400 mb-4">
          Our vulnerability database aggregates CVE entries from multiple sources including NVD, 
          vendor advisories, and security research communities. All entries are verified and 
          enriched with additional context.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-red-400">12</div>
            <div className="text-xs text-gray-500">Critical</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-400">28</div>
            <div className="text-xs text-gray-500">High</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-400">45</div>
            <div className="text-xs text-gray-500">Medium</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">23</div>
            <div className="text-xs text-gray-500">Low</div>
          </div>
        </div>
      </div>
    </div>
  );
}
