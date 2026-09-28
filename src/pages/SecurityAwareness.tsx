import { Badge } from '../components/ui';

export function SecurityAwarenessPage() {
  const awarenessTopics = [
    {
      icon: '🎣',
      title: 'Phishing Awareness',
      description: 'Learn to identify and avoid phishing attempts in email, SMS, and social media.',
      articles: 12,
      level: 'Beginner',
    },
    {
      icon: '🔐',
      title: 'Password Security',
      description: 'Best practices for creating and managing strong, unique passwords.',
      articles: 8,
      level: 'Beginner',
    },
    {
      icon: '📱',
      title: 'Mobile Security',
      description: 'Protect your smartphones and tablets from mobile threats.',
      articles: 10,
      level: 'Beginner',
    },
    {
      icon: '🏠',
      title: 'Home Network Security',
      description: 'Secure your home Wi-Fi and IoT devices from cyber threats.',
      articles: 6,
      level: 'Beginner',
    },
    {
      icon: '💼',
      title: 'Remote Work Security',
      description: 'Stay secure while working from home or public locations.',
      articles: 9,
      level: 'Intermediate',
    },
    {
      icon: '🔒',
      title: 'Data Privacy',
      description: 'Understand your digital footprint and how to protect your personal data.',
      articles: 7,
      level: 'Beginner',
    },
    {
      icon: '🛡️',
      title: 'Social Engineering',
      description: 'Recognize and defend against manipulation tactics used by attackers.',
      articles: 5,
      level: 'Intermediate',
    },
    {
      icon: '☁️',
      title: 'Cloud Security Basics',
      description: 'Essential security practices for cloud storage and services.',
      articles: 8,
      level: 'Intermediate',
    },
  ];

  const tips = [
    'Use a password manager to generate and store unique passwords for each account.',
    'Enable two-factor authentication (2FA) on all important accounts.',
    'Be suspicious of unsolicited emails asking for personal information.',
    'Keep your software and operating systems up to date.',
    'Backup your important data regularly and store backups offline.',
    'Use HTTPS websites when entering sensitive information.',
    'Be cautious of public Wi-Fi networks for sensitive transactions.',
    'Review app permissions and revoke unnecessary access.',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🎓</span>
          <h1 className="text-3xl font-bold text-white">Security Awareness</h1>
        </div>
        <p className="text-gray-400 max-w-2xl">
          Essential cybersecurity knowledge for everyone. Learn how to protect yourself, 
          your family, and your organization from cyber threats.
        </p>
      </div>

      {/* Quick Tips */}
      <div className="mb-12 p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span>💡</span>
          Quick Security Tips
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tips.map((tip, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm text-gray-300">
              <span className="text-emerald-400 flex-shrink-0">✓</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Topics Grid */}
      <h2 className="text-2xl font-bold text-white mb-6">Awareness Topics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {awarenessTopics.map((topic, idx) => (
          <div
            key={idx}
            className="group p-5 rounded-xl border border-gray-800 bg-gray-900/30 hover:border-emerald-500/30 transition-all duration-300 cursor-pointer"
          >
            <div className="text-3xl mb-3">{topic.icon}</div>
            <h3 className="text-base font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors">
              {topic.title}
            </h3>
            <p className="text-sm text-gray-400 mb-3 line-clamp-2">
              {topic.description}
            </p>
            <div className="flex items-center justify-between text-xs">
              <Badge variant="outline" size="sm">{topic.level}</Badge>
              <span className="text-gray-500">{topic.articles} articles</span>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="mt-12 p-8 rounded-xl border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-950 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">
          Want to improve your organization's security posture?
        </h2>
        <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
          Our security awareness training programs help organizations build a human firewall 
          against cyber threats. Customizable content, tracking, and reporting.
        </p>
        <button className="px-6 py-3 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors">
          Learn About Training Programs
        </button>
      </div>
    </div>
  );
}
