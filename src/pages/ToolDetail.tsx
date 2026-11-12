import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db } from '../db/store';
import { Badge, Button, EmptyState } from '../components/ui';
import { ToolCategory, ToolLicense, SkillLevel, ToolPlatform } from '../db/toolsSchema';
import type { Tool } from '../db/toolsSchema';
import type { Article } from '../db/schema';

export function ToolDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [tool, setTool] = useState<Tool | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);

  useEffect(() => {
    if (slug) {
      const foundTool = db.getToolBySlug(slug);
      if (foundTool) {
        setTool(foundTool);
        // Load related articles
        if (foundTool.relatedArticleIds.length > 0) {
          const articles = foundTool.relatedArticleIds
            .map(id => db.getArticleById(id))
            .filter((a): a is Article => a !== null);
          setRelatedArticles(articles);
        }
      }
    }
  }, [slug]);

  if (!tool) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EmptyState
          icon="🔧"
          title="Tool not found"
          description="The tool you're looking for doesn't exist or has been removed."
          action={
            <Link to="/tools">
              <Button>Browse Tools</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const getCategoryLabel = (category: ToolCategory) => {
    return category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getLicenseColor = (license: ToolLicense) => {
    switch (license) {
      case ToolLicense.OPEN_SOURCE:
        return 'success';
      case ToolLicense.COMMERCIAL:
        return 'warning';
      case ToolLicense.FREEMIUM:
        return 'info';
      case ToolLicense.FREE:
        return 'default';
      default:
        return 'outline';
    }
  };

  const getLicenseLabel = (license: ToolLicense) => {
    switch (license) {
      case ToolLicense.OPEN_SOURCE:
        return 'Open Source';
      case ToolLicense.COMMERCIAL:
        return 'Commercial';
      case ToolLicense.FREEMIUM:
        return 'Freemium';
      case ToolLicense.FREE:
        return 'Free';
      default:
        return license;
    }
  };

  const getSkillColor = (skill: SkillLevel) => {
    switch (skill) {
      case SkillLevel.BEGINNER:
        return 'success';
      case SkillLevel.INTERMEDIATE:
        return 'info';
      case SkillLevel.ADVANCED:
        return 'warning';
      case SkillLevel.EXPERT:
        return 'danger';
      default:
        return 'outline';
    }
  };

  const getPlatformIcon = (platform: ToolPlatform) => {
    switch (platform) {
      case ToolPlatform.WINDOWS:
        return '🪟 Windows';
      case ToolPlatform.LINUX:
        return '🐧 Linux';
      case ToolPlatform.MACOS:
        return '🍎 macOS';
      case ToolPlatform.CROSS_PLATFORM:
        return '🌐 Cross-Platform';
      case ToolPlatform.WEB:
        return '🌍 Web';
      case ToolPlatform.CLOUD:
        return '☁️ Cloud';
      case ToolPlatform.MOBILE:
        return '📱 Mobile';
      default:
        return platform;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-400">
        <Link to="/tools" className="hover:text-emerald-400 transition-colors">
          Tools
        </Link>
        <span>/</span>
        <span className="text-white">{tool.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start gap-6 mb-6">
          {tool.logoUrl ? (
            <img src={tool.logoUrl} alt={tool.name} className="w-24 h-24 rounded-xl object-cover" />
          ) : (
            <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
              <span className="text-5xl">🔧</span>
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-3">{tool.name}</h1>
            <div className="flex items-center gap-3 flex-wrap mb-4">
              <Badge variant="outline" size="md">
                {getCategoryLabel(tool.category)}
              </Badge>
              <Badge variant={getLicenseColor(tool.license)} size="md">
                {getLicenseLabel(tool.license)}
              </Badge>
              <Badge variant={getSkillColor(tool.skillLevel)} size="md">
                {tool.skillLevel}
              </Badge>
            </div>
            <p className="text-lg text-gray-300">{tool.description}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <a href={tool.website} target="_blank" rel="noopener noreferrer">
            <Button>
              Visit Website
            </Button>
          </a>
          {tool.documentationUrl && (
            <a href={tool.documentationUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">
                Documentation
              </Button>
            </a>
          )}
          {tool.githubUrl && (
            <a href={tool.githubUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">
                GitHub
              </Button>
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* About */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">About</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {tool.longDescription}
              </p>
            </div>
          </div>

          {/* Use Cases */}
          {tool.useCases.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Use Cases</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tool.useCases.map((useCase, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 rounded-lg bg-gray-900/50 border border-gray-800">
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    <span className="text-gray-300">{useCase}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          {tool.features.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Key Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tool.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 rounded-lg bg-gray-900/50 border border-gray-800">
                    <span className="text-emerald-400 mt-0.5">★</span>
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Related Articles</h2>
              <div className="space-y-3">
                {relatedArticles.map((article) => (
                  <Link
                    key={article.id}
                    to={`/articles/${article.slug}`}
                    className="block p-4 rounded-lg bg-gray-900/50 border border-gray-800 hover:border-emerald-500/50 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-white mb-2 hover:text-emerald-400 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{article.excerpt}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Platforms */}
          <div className="p-6 rounded-xl border border-gray-800 bg-gray-900/30">
            <h3 className="text-lg font-semibold text-white mb-4">Platforms</h3>
            <div className="space-y-2">
              {tool.platforms.map((platform, idx) => (
                <div key={idx} className="flex items-center gap-2 text-gray-300">
                  <span>{getPlatformIcon(platform)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          {tool.pricing && (
            <div className="p-6 rounded-xl border border-gray-800 bg-gray-900/30">
              <h3 className="text-lg font-semibold text-white mb-4">Pricing</h3>
              <p className="text-gray-300">{tool.pricing}</p>
            </div>
          )}

          {/* Links */}
          <div className="p-6 rounded-xl border border-gray-800 bg-gray-900/30">
            <h3 className="text-lg font-semibold text-white mb-4">Links</h3>
            <div className="space-y-3">
              <a
                href={tool.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Official Website
              </a>
              {tool.documentationUrl && (
                <a
                  href={tool.documentationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Documentation
                </a>
              )}
              {tool.githubUrl && (
                <a
                  href={tool.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub Repository
                </a>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="p-6 rounded-xl border border-gray-800 bg-gray-900/30">
            <h3 className="text-lg font-semibold text-white mb-4">Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Category</span>
                <span className="text-gray-300">{getCategoryLabel(tool.category)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">License</span>
                <span className="text-gray-300">{getLicenseLabel(tool.license)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Skill Level</span>
                <span className="text-gray-300">{tool.skillLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Platforms</span>
                <span className="text-gray-300">{tool.platforms.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
