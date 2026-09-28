import { Link } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import { Button } from '../components/ui';

const FEATURES = [
  {
    icon: '📰',
    title: 'Articles & Research',
    description: 'In-depth cybersecurity articles, tutorials, and original research from industry experts.',
    path: ROUTES.ARTICLES,
  },
  {
    icon: '🛡️',
    title: 'Threat Intelligence',
    description: 'Real-time threat intelligence feeds, CVE database, and vulnerability tracking.',
    path: ROUTES.THREAT_INTEL,
  },
  {
    icon: '🔧',
    title: 'Tools Directory',
    description: 'Curated directory of cybersecurity tools with reviews, comparisons, and guides.',
    path: ROUTES.TOOLS,
  },
  {
    icon: '🎓',
    title: 'Academy & Labs',
    description: 'Structured learning paths, hands-on labs, and certification preparation.',
    path: ROUTES.ACADEMY,
  },
  {
    icon: '👥',
    title: 'Community',
    description: 'Connect with cybersecurity professionals, share knowledge, and grow together.',
    path: ROUTES.COMMUNITY,
  },
  {
    icon: '💼',
    title: 'Careers & Jobs',
    description: 'Cybersecurity job board, career resources, and industry events.',
    path: ROUTES.JOBS,
  },
];

const STATS = [
  { value: '10K+', label: 'Articles' },
  { value: '50K+', label: 'Community Members' },
  { value: '2K+', label: 'Tools Listed' },
  { value: '500+', label: 'CVEs Tracked' },
];

export function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl opacity-30" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Cybersecurity Intelligence Platform
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Your Command Center for{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Cybersecurity
              </span>{' '}
              Knowledge
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Articles, threat intelligence, tools, education, and community — 
              everything you need to stay ahead of cyber threats, all in one platform.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={ROUTES.ARTICLES}>
                <Button size="lg">
                  Explore Articles
                  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
              <Link to={ROUTES.ACADEMY}>
                <Button variant="outline" size="lg">
                  Start Learning
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-gray-800 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Everything You Need</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            A comprehensive cybersecurity ecosystem designed for professionals, students, and organizations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <Link
              key={feature.path}
              to={feature.path}
              className="group p-6 rounded-xl border border-gray-800 bg-gray-900/30 hover:border-emerald-500/30 hover:bg-gray-800/50 transition-all duration-300"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative rounded-2xl overflow-hidden border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-950 p-12 text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5" />
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Ready to Level Up Your Security Skills?
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-8">
              Join thousands of cybersecurity professionals who trust CyberVault for their daily intelligence, learning, and career growth.
            </p>
            <Link to={ROUTES.REGISTER}>
              <Button size="lg">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
