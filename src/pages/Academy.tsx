export function AcademyPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Academy</h1>
        <p className="text-gray-400">
          Structured learning paths, hands-on labs, and certification preparation.
        </p>
      </div>

      {/* Learning Paths */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {[
          { title: 'Security Fundamentals', level: 'Beginner', lessons: 24, icon: '🔰' },
          { title: 'Network Security', level: 'Intermediate', lessons: 18, icon: '🌐' },
          { title: 'Web App Security', level: 'Intermediate', lessons: 20, icon: '🕸️' },
          { title: 'Penetration Testing', level: 'Advanced', lessons: 32, icon: '⚔️' },
          { title: 'Incident Response', level: 'Advanced', lessons: 16, icon: '🚨' },
          { title: 'Cloud Security', level: 'Intermediate', lessons: 22, icon: '☁️' },
        ].map((path) => (
          <div
            key={path.title}
            className="p-6 rounded-xl border border-gray-800 bg-gray-900/30 hover:border-emerald-500/30 transition-all duration-300 group cursor-pointer"
          >
            <div className="text-3xl mb-3">{path.icon}</div>
            <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-emerald-400 transition-colors">
              {path.title}
            </h3>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span>{path.level}</span>
              <span>•</span>
              <span>{path.lessons} lessons</span>
            </div>
          </div>
        ))}
      </div>

      {/* Labs Section */}
      <div className="text-center py-16 rounded-xl border border-gray-800 bg-gray-900/30">
        <div className="text-5xl mb-4">🧪</div>
        <h3 className="text-lg font-semibold text-white mb-2">Hands-on Labs</h3>
        <p className="text-gray-400 max-w-md mx-auto">
          Interactive cybersecurity labs coming in Phase 8. Practice real-world scenarios in safe environments.
        </p>
      </div>
    </div>
  );
}
