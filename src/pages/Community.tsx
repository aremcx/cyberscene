export function CommunityPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Community</h1>
        <p className="text-gray-400">
          Connect with cybersecurity professionals, share knowledge, and grow together.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 rounded-xl border border-gray-800 bg-gray-900/30">
          <div className="text-3xl mb-3">💬</div>
          <h3 className="text-lg font-semibold text-white mb-2">Discussions</h3>
          <p className="text-sm text-gray-400">Engage in security discussions and share your expertise.</p>
        </div>
        <div className="p-6 rounded-xl border border-gray-800 bg-gray-900/30">
          <div className="text-3xl mb-3">📅</div>
          <h3 className="text-lg font-semibold text-white mb-2">Events</h3>
          <p className="text-sm text-gray-400">Discover cybersecurity conferences, meetups, and webinars.</p>
        </div>
        <div className="p-6 rounded-xl border border-gray-800 bg-gray-900/30">
          <div className="text-3xl mb-3">🏆</div>
          <h3 className="text-lg font-semibold text-white mb-2">Challenges</h3>
          <p className="text-sm text-gray-400">Test your skills with CTF challenges and competitions.</p>
        </div>
      </div>

      <div className="text-center py-16 rounded-xl border border-gray-800 bg-gray-900/30">
        <div className="text-5xl mb-4">👥</div>
        <h3 className="text-lg font-semibold text-white mb-2">Community Platform</h3>
        <p className="text-gray-400 max-w-md mx-auto">
          Full community features including forums, events, and challenges coming in Phase 9.
        </p>
      </div>
    </div>
  );
}
