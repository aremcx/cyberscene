export function ThreatIntelPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Threat Intelligence</h1>
        <p className="text-gray-400">
          Real-time threat feeds, vulnerability tracking, and security advisories.
        </p>
      </div>

      {/* Threat Feed Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Threats */}
        <div className="lg:col-span-2 rounded-xl border border-gray-800 bg-gray-900/30 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Threats</h2>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-700/50 rounded w-3/4 animate-pulse" />
                </div>
                <div className="h-4 bg-gray-700/50 rounded w-16 animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Stats sidebar */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Threat Overview</h2>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="text-2xl font-bold text-red-400">Critical</div>
              <div className="text-sm text-gray-400">Active Threats</div>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="text-2xl font-bold text-amber-400">High</div>
              <div className="text-sm text-gray-400">Vulnerabilities</div>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="text-2xl font-bold text-blue-400">Advisories</div>
              <div className="text-sm text-gray-400">This Week</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center py-12 rounded-xl border border-gray-800 bg-gray-900/30">
        <div className="text-5xl mb-4">🛡️</div>
        <h3 className="text-lg font-semibold text-white mb-2">Threat Intelligence Feed</h3>
        <p className="text-gray-400 max-w-md mx-auto">
          Full threat intelligence integration coming in Phase 6. CVE database and real-time feeds will be available soon.
        </p>
      </div>
    </div>
  );
}
