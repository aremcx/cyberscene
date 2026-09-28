import { useState, useEffect } from 'react';
import { db } from '../db/store';
import { VulnerabilityCard } from '../components/threat/VulnerabilityCard';
import { Input, Select, EmptyState, Badge } from '../components/ui';
import { VulnerabilitySeverity } from '../db/vulnerabilitySchema';
import type { Vulnerability } from '../db/vulnerabilitySchema';

export function VulnerabilitiesPage() {
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [vendorFilter, setVendorFilter] = useState<string>('all');
  const [exploitedFilter, setExploitedFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const result = db.listVulnerabilities({ page: 1, pageSize: 100 });
    setVulnerabilities(result.data);
  };

  const filteredVulnerabilities = vulnerabilities.filter(vuln => {
    const matchesSearch = searchQuery === '' || 
      vuln.cveId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vuln.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vuln.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vuln.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vuln.product.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeverity = severityFilter === 'all' || 
      vuln.severity === severityFilter;

    const matchesVendor = vendorFilter === 'all' || 
      vuln.vendor.toLowerCase().includes(vendorFilter.toLowerCase());

    const matchesExploited = exploitedFilter === 'all' || 
      (exploitedFilter === 'yes' && vuln.isExploited) ||
      (exploitedFilter === 'no' && !vuln.isExploited);

    return matchesSearch && matchesSeverity && matchesVendor && matchesExploited;
  });

  // Get unique vendors
  const vendors = Array.from(new Set(vulnerabilities.map(v => v.vendor))).sort();

  // Calculate severity distribution
  const severityCounts = {
    critical: vulnerabilities.filter(v => v.severity === VulnerabilitySeverity.CRITICAL).length,
    high: vulnerabilities.filter(v => v.severity === VulnerabilitySeverity.HIGH).length,
    medium: vulnerabilities.filter(v => v.severity === VulnerabilitySeverity.MEDIUM).length,
    low: vulnerabilities.filter(v => v.severity === VulnerabilitySeverity.LOW).length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Vulnerability Intelligence</h1>
        <p className="text-gray-400">
          Comprehensive CVE database with severity ratings, CVSS scores, and remediation guidance.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/30">
          <div className="text-2xl font-bold text-white">{vulnerabilities.length}</div>
          <div className="text-sm text-gray-500">Total CVEs</div>
        </div>
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
          <div className="text-2xl font-bold text-red-400">{severityCounts.critical}</div>
          <div className="text-sm text-gray-500">Critical</div>
        </div>
        <div className="p-4 rounded-xl border border-orange-500/20 bg-orange-500/5">
          <div className="text-2xl font-bold text-orange-400">{severityCounts.high}</div>
          <div className="text-sm text-gray-500">High</div>
        </div>
        <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
          <div className="text-2xl font-bold text-yellow-400">{severityCounts.medium}</div>
          <div className="text-sm text-gray-500">Medium</div>
        </div>
        <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/5">
          <div className="text-2xl font-bold text-green-400">{severityCounts.low}</div>
          <div className="text-sm text-gray-500">Low</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Input
          placeholder="Search CVE, title, vendor, product..."
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
            { value: VulnerabilitySeverity.CRITICAL, label: 'Critical' },
            { value: VulnerabilitySeverity.HIGH, label: 'High' },
            { value: VulnerabilitySeverity.MEDIUM, label: 'Medium' },
            { value: VulnerabilitySeverity.LOW, label: 'Low' },
          ]}
        />
        <Select
          value={vendorFilter}
          onChange={(e) => setVendorFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Vendors' },
            ...vendors.map(v => ({ value: v, label: v })),
          ]}
        />
        <Select
          value={exploitedFilter}
          onChange={(e) => setExploitedFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Vulnerabilities' },
            { value: 'yes', label: 'Exploited in Wild' },
            { value: 'no', label: 'Not Exploited' },
          ]}
        />
      </div>

      {/* Results count */}
      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm text-gray-400">
          Showing <span className="font-medium text-white">{filteredVulnerabilities.length}</span> of{' '}
          <span className="font-medium text-white">{vulnerabilities.length}</span> vulnerabilities
        </div>
        {vulnerabilities.filter(v => v.isExploited).length > 0 && (
          <Badge variant="danger" size="md">
            🔥 {vulnerabilities.filter(v => v.isExploited).length} actively exploited
          </Badge>
        )}
      </div>

      {/* Vulnerabilities Grid */}
      {filteredVulnerabilities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredVulnerabilities.map((vuln) => (
            <VulnerabilityCard key={vuln.id} vulnerability={vuln} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🛡️"
          title="No vulnerabilities found"
          description="Try adjusting your search or filters"
        />
      )}
    </div>
  );
}
