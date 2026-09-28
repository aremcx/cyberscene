import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArticleCard } from '../content/ArticleCard';
import { ThreatCard } from '../content/ThreatCard';
import { VulnerabilityCard } from '../content/VulnerabilityCard';
import { ToolCard } from '../content/ToolCard';
import { Badge, EmptyState } from '../ui';
import * as articleService from '../../services/articles';
import { ArticleStatus } from '../../db/schema';
import type { ArticleWithRelations } from '../../services/articles';

export function FeaturedContentSection() {
  const [featuredArticle, setFeaturedArticle] = useState<ArticleWithRelations | null>(null);
  const [latestArticles, setLatestArticles] = useState<ArticleWithRelations[]>([]);
  const [trendingArticles, setTrendingArticles] = useState<ArticleWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = () => {
    setIsLoading(true);

    // Featured article
    const featured = articleService.listArticles(
      { page: 1, pageSize: 1 },
      { sortBy: 'publishedAt', sortOrder: 'desc' },
      { isFeatured: true, status: ArticleStatus.PUBLISHED }
    );
    setFeaturedArticle(featured.data[0] || null);

    // Latest articles
    const latest = articleService.listArticles(
      { page: 1, pageSize: 6 },
      { sortBy: 'publishedAt', sortOrder: 'desc' },
      { status: ArticleStatus.PUBLISHED }
    );
    setLatestArticles(latest.data);

    // Trending (by view count)
    const trending = articleService.listArticles(
      { page: 1, pageSize: 4 },
      { sortBy: 'viewCount', sortOrder: 'desc' },
      { status: ArticleStatus.PUBLISHED }
    );
    setTrendingArticles(trending.data);

    setIsLoading(false);
  };

  // Demo threat data (would come from threat intel service in production)
  const demoThreats = [
    {
      title: 'LockBit 3.0 Ransomware Campaign Targets Healthcare',
      severity: 'critical' as const,
      description: 'New wave of attacks targeting healthcare organizations in North America and Europe.',
      source: 'CISA',
      date: '2 hours ago',
      affectedSystems: ['Windows', 'VMware'],
    },
    {
      title: 'APT29 Exploiting Zero-Day in Exchange Server',
      severity: 'high' as const,
      description: 'State-sponsored threat actor leveraging previously unknown vulnerability.',
      source: 'Microsoft',
      date: '5 hours ago',
      affectedSystems: ['Exchange Server'],
    },
    {
      title: 'Phishing Campaign Targeting Financial Institutions',
      severity: 'medium' as const,
      description: 'Sophisticated phishing emails impersonating major banks.',
      source: 'FS-ISAC',
      date: '1 day ago',
      affectedSystems: ['Email', 'Web Browsers'],
    },
  ];

  // Demo vulnerability data
  const demoVulnerabilities = [
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
  ];

  // Demo tools data
  const demoTools = [
    {
      name: 'Burp Suite',
      description: 'Web application security testing toolkit',
      category: 'Web Security',
      pricing: 'freemium' as const,
      rating: 4.8,
    },
    {
      name: 'Nmap',
      description: 'Network exploration and security auditing',
      category: 'Network',
      pricing: 'open_source' as const,
      rating: 4.9,
    },
    {
      name: 'Metasploit',
      description: 'Penetration testing framework',
      category: 'Pen Testing',
      pricing: 'open_source' as const,
      rating: 4.7,
    },
    {
      name: 'Wireshark',
      description: 'Network protocol analyzer',
      category: 'Network',
      pricing: 'open_source' as const,
      rating: 4.8,
    },
  ];

  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-800 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-800 rounded-xl"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Featured Article */}
      {featuredArticle && (
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Featured Article</h2>
            <Link to="/articles" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
              View all →
            </Link>
          </div>
          <ArticleCard article={featuredArticle} variant="featured" />
        </div>
      )}

      {/* Latest Articles */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Latest Articles</h2>
          <Link to="/articles" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
            View all →
          </Link>
        </div>
        {latestArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="📝"
            title="No articles yet"
            description="Check back soon for the latest cybersecurity content."
          />
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        {/* Threat Intelligence */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Latest Threats</h2>
            <Link to="/threat-intelligence" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {demoThreats.map((threat, idx) => (
              <ThreatCard key={idx} {...threat} />
            ))}
          </div>
        </div>

        {/* Vulnerabilities */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Recent Vulnerabilities</h2>
            <Link to="/vulnerabilities" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {demoVulnerabilities.map((vuln) => (
              <VulnerabilityCard key={vuln.cveId} {...vuln} />
            ))}
          </div>
        </div>
      </div>

      {/* Trending Articles */}
      {trendingArticles.length > 0 && (
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Trending Now</h2>
            <Badge variant="warning" size="md">🔥 Hot</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trendingArticles.map((article) => (
              <ArticleCard key={article.id} article={article} variant="compact" />
            ))}
          </div>
        </div>
      )}

      {/* Featured Tools */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Featured Tools</h2>
          <Link to="/tools" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {demoTools.map((tool) => (
            <ToolCard key={tool.name} {...tool} />
          ))}
        </div>
      </div>
    </section>
  );
}
