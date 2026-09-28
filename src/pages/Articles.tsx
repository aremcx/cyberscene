import { Badge } from '../components/ui';

export function ArticlesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Articles</h1>
        <p className="text-gray-400">
          In-depth cybersecurity articles, tutorials, and analysis from industry experts.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        <Badge variant="success" size="md">All</Badge>
        <Badge variant="outline" size="md">Articles</Badge>
        <Badge variant="outline" size="md">Tutorials</Badge>
        <Badge variant="outline" size="md">News</Badge>
        <Badge variant="outline" size="md">Research</Badge>
      </div>

      {/* Empty State */}
      <div className="text-center py-20 rounded-xl border border-gray-800 bg-gray-900/30">
        <div className="text-5xl mb-4">📝</div>
        <h3 className="text-lg font-semibold text-white mb-2">Articles Coming Soon</h3>
        <p className="text-gray-400 max-w-md mx-auto">
          Our content management system is being set up. Check back soon for high-quality cybersecurity articles and tutorials.
        </p>
      </div>
    </div>
  );
}
