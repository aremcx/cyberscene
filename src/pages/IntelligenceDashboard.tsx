import { useState, useEffect } from 'react';
import { db } from '../db/store';
import { ThreatActorCard } from '../components/threat/ThreatActorCard';
import { MalwareCard } from '../components/threat/MalwareCard';
import { VulnerabilityCard } from '../components/threat/VulnerabilityCard';
import { Card, Badge, Alert } from '../components/ui';
import { ThreatSeverity } from '../db/threatIntelSchema';
import type { ThreatActor, Malware, ThreatReport, Indicator } from '../db/threatIntelSchema';
import { VulnerabilitySeverity } from '../db/vulnerabilitySchema';
import type { Vulnerability } from '../db/vulnerabilitySchema';

export function IntelligenceDashboardPage() {
  const [stats, setStats] = useState({
    threatActors: 0,
    activeThreats: 0,
    malware: 0,
    vulnerabilities: 0,
    criticalVulns: 0,
    exploitedVulns: 0,
    threatReports: 0,
    indicators: 0,
  });

  const [recentActors, setRecentActors] = useState<ThreatActor[]>([]);
  const [recentMalware, setRecentMalware] = useState<Malware[]>([]);
  const [recentVulns, setRecentVulns] = useState<Vulnerability[]>([]);
  const [criticalVulns, setCriticalVulns] = useState<Vulnerability[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load stats
    const actorsResult = db.listThreatActors({ page: 1, pageSize: 1000 });
    const malwareResult = db.listMalware({ page: 1, pageSize: 1000 });
    const vulnsResult = db.listVulnerabilities({ page: 1, pageSize: 1000 });
    const reportsResult = db.listThreatReports({ page: 1, pageSize: 1000 });
    const indicatorsResult = db.listIndicators({ page: 1, pageSize: 1000 });

    setStats({
      threatActors: actorsResult.total,
      activeThreats: actorsResult.data.filter(a => a.isActive).length,
      malware: malwareResult.total,
      vulnerabilities: vulnsResult.total,
      criticalVulns: vulnsResult.data.filter(v => v.severity === VulnerabilitySeverity.CRITICAL).length,
      exploitedVulns: vulnsResult.data.filter(v => v.isExploited).length,
      threatReports: reportsResult.total,
      indicators: indicatorsResult.total,
    });

    // Load recent items
    setRecentActors(actorsResult.data.slice(0, 6));
    setRecentMalware(malwareResult.data.slice(0, 6));
    setRecentVulns(vulnsResult.data.slice(0, 6));
    setCriticalVulns(vulnsResult.data.filter(v => v.severity === VulnerabilitySeverity.CRITICAL).slice(0, 6));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Intelligence Dashboard</h1>
        <p className="text-gray-400">
          Overview of threat intelligence, vulnerabilities, and security indicators.
        </p>
      </div>

      {/* Critical Alert */}
      {stats.exploitedVulns > 0 && (
        <Alert variant="error" className="mb-8">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold">Active Threats Detected</p>
              <p className="text-sm">{stats.exploitedVulns} vulnerabilities are currently being exploited in the wild</p>
            </div>
          </div>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Threat Actors</span>
              <span className="text-2xl">🎭</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.threatActors}</div>
            <div className="text-sm text-red-400 mt-1">{stats.activeThreats} active</div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Malware</span>
              <span className="text-2xl">🦠</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.malware}</div>
            <div className="text-sm text-gray-500 mt-1">families tracked</div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Vulnerabilities</span>
              <span className="text-2xl">🛡️</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.vulnerabilities}</div>
            <div className="text-sm text-red-400 mt-1">{stats.criticalVulns} critical</div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Indicators</span>
              <span className="text-2xl">🔍</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.indicators}</div>
            <div className="text-sm text-gray-500 mt-1">IOCs tracked</div>
          </div>
        </Card>
      </div>

      {/* Severity Distribution */}
      <Card className="mb-12">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Vulnerability Severity Distribution</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="text-3xl font-bold text-red-400">{stats.criticalVulns}</div>
              <div className="text-sm text-gray-400 mt-1">Critical</div>
              <div className="mt-2 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500"
                  style={{ width: `${(stats.criticalVulns / stats.vulnerabilities) * 100}%` }}
                />
              </div>
            </div>
            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <div className="text-3xl font-bold text-orange-400">
                {db.listVulnerabilities({ page: 1, pageSize: 1000 }).data.filter(v => v.severity === VulnerabilitySeverity.HIGH).length}
              </div>
              <div className="text-sm text-gray-400 mt-1">High</div>
              <div className="mt-2 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500"
                  style={{ width: `${(db.listVulnerabilities({ page: 1, pageSize: 1000 }).data.filter(v => v.severity === VulnerabilitySeverity.HIGH).length / stats.vulnerabilities) * 100}%` }}
                />
              </div>
            </div>
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="text-3xl font-bold text-yellow-400">
                {db.listVulnerabilities({ page: 1, pageSize: 1000 }).data.filter(v => v.severity === VulnerabilitySeverity.MEDIUM).length}
              </div>
              <div className="text-sm text-gray-400 mt-1">Medium</div>
              <div className="mt-2 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-500"
                  style={{ width: `${(db.listVulnerabilities({ page: 1, pageSize: 1000 }).data.filter(v => v.severity === VulnerabilitySeverity.MEDIUM).length / stats.vulnerabilities) * 100}%` }}
                />
              </div>
            </div>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="text-3xl font-bold text-green-400">
                {db.listVulnerabilities({ page: 1, pageSize: 1000 }).data.filter(v => v.severity === VulnerabilitySeverity.LOW).length}
              </div>
              <div className="text-sm text-gray-400 mt-1">Low</div>
              <div className="mt-2 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500"
                  style={{ width: `${(db.listVulnerabilities({ page: 1, pageSize: 1000 }).data.filter(v => v.severity === VulnerabilitySeverity.LOW).length / stats.vulnerabilities) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Threat Actors */}
      {recentActors.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Recent Threat Actors</h2>
            <a href="/threat-intelligence" className="text-sm text-emerald-400 hover:text-emerald-300">
              View all →
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentActors.map((actor) => (
              <ThreatActorCard key={actor.id} actor={actor} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Malware */}
      {recentMalware.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Recent Malware</h2>
            <a href="/threat-intelligence" className="text-sm text-emerald-400 hover:text-emerald-300">
              View all →
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentMalware.map((malware) => (
              <MalwareCard key={malware.id} malware={malware} />
            ))}
          </div>
        </div>
      )}

      {/* Critical Vulnerabilities */}
      {criticalVulns.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Critical Vulnerabilities</h2>
            <a href="/vulnerabilities" className="text-sm text-emerald-400 hover:text-emerald-300">
              View all →
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {criticalVulns.map((vuln) => (
              <VulnerabilityCard key={vuln.id} vulnerability={vuln} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Vulnerabilities */}
      {recentVulns.length > 0 && criticalVulns.length < 6 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Recent Vulnerabilities</h2>
            <a href="/vulnerabilities" className="text-sm text-emerald-400 hover:text-emerald-300">
              View all →
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentVulns.map((vuln) => (
              <VulnerabilityCard key={vuln.id} vulnerability={vuln} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
