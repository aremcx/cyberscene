import { Link } from 'react-router-dom';
import { Badge } from '../ui';

export function RegionalSection() {
  const regionalContent = [
    {
      title: 'Nigeria\'s New Cybersecurity Law: What You Need to Know',
      excerpt: 'Analysis of the recently enacted cybersecurity legislation and its impact on businesses.',
      category: 'Policy',
      readTime: '8 min',
    },
    {
      title: 'African Fintech Security: Challenges and Solutions',
      excerpt: 'How African financial technology companies are tackling unique security challenges.',
      category: 'Industry',
      readTime: '12 min',
    },
    {
      title: 'Building a SOC in Lagos: Lessons Learned',
      excerpt: 'A practical guide to establishing a Security Operations Center in West Africa.',
      category: 'Case Study',
      readTime: '15 min',
    },
    {
      title: 'Cybersecurity Talent Gap in Africa',
      excerpt: 'Addressing the growing demand for cybersecurity professionals across the continent.',
      category: 'Career',
      readTime: '6 min',
    },
  ];

  return (
    <section className="border-y border-gray-800 bg-gradient-to-br from-gray-900/50 to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">🌍</span>
          <h2 className="text-2xl font-bold text-white">Nigeria & Africa Cybersecurity</h2>
        </div>
        <p className="text-gray-400 mb-8 max-w-2xl">
          Highlighting cybersecurity developments, challenges, and opportunities across the African continent.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {regionalContent.map((item, idx) => (
            <Link
              key={idx}
              to="/articles"
              className="group p-5 rounded-xl border border-gray-800 bg-gray-900/30 hover:border-emerald-500/30 transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="info" size="sm">{item.category}</Badge>
                <span className="text-xs text-gray-500">{item.readTime} read</span>
              </div>
              <h3 className="text-base font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors line-clamp-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray-400 line-clamp-2">
                {item.excerpt}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/articles"
            className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Explore more African cybersecurity content
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
