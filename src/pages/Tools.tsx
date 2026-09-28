export function ToolsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Tools Directory</h1>
        <p className="text-gray-400">
          Curated cybersecurity tools with reviews, comparisons, and usage guides.
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-xl">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search tools..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-700 bg-gray-900/50 text-gray-100 placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-8">
        {['All Tools', 'Network', 'Web App', 'Cryptography', 'Forensics', 'SIEM', 'Pen Testing', 'OSINT'].map((cat) => (
          <button
            key={cat}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 border border-gray-700 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors"
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Empty State */}
      <div className="text-center py-20 rounded-xl border border-gray-800 bg-gray-900/30">
        <div className="text-5xl mb-4">🔧</div>
        <h3 className="text-lg font-semibold text-white mb-2">Tools Directory Coming Soon</h3>
        <p className="text-gray-400 max-w-md mx-auto">
          Our tools directory is being built. Soon you'll be able to discover, compare, and review cybersecurity tools.
        </p>
      </div>
    </div>
  );
}
