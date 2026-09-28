export function JobsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Cybersecurity Jobs</h1>
        <p className="text-gray-400">
          Find your next role in cybersecurity. Browse opportunities from top organizations.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search jobs..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-700 bg-gray-900/50 text-gray-100 placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
          />
        </div>
        <select className="px-4 py-3 rounded-lg border border-gray-700 bg-gray-900/50 text-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors">
          <option>All Locations</option>
          <option>Remote</option>
          <option>Africa</option>
          <option>Europe</option>
          <option>Americas</option>
        </select>
      </div>

      {/* Job Type Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {['All Types', 'Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'].map((type) => (
          <button
            key={type}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 border border-gray-700 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors"
          >
            {type}
          </button>
        ))}
      </div>

      <div className="text-center py-20 rounded-xl border border-gray-800 bg-gray-900/30">
        <div className="text-5xl mb-4">💼</div>
        <h3 className="text-lg font-semibold text-white mb-2">Job Board Coming Soon</h3>
        <p className="text-gray-400 max-w-md mx-auto">
          Our cybersecurity job board is being built. Soon you'll find curated opportunities from top organizations.
        </p>
      </div>
    </div>
  );
}
