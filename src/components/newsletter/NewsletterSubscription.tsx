import { useState } from 'react';
import { Button, Input, Card, Badge, Alert } from '../ui';
import * as newsletterService from '../../services/newsletter';
import { NewsletterCategory } from '../../db/newsletterSchema';
import { AppError } from '../../lib/errors';

interface NewsletterSubscriptionProps {
  className?: string;
  variant?: 'default' | 'compact' | 'footer';
}

export function NewsletterSubscription({ className, variant = 'default' }: NewsletterSubscriptionProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<NewsletterCategory[]>([
    NewsletterCategory.NEWS,
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { value: NewsletterCategory.NEWS, label: 'News', icon: '📰' },
    { value: NewsletterCategory.THREAT_INTELLIGENCE, label: 'Threat Intel', icon: '🛡️' },
    { value: NewsletterCategory.VULNERABILITIES, label: 'Vulnerabilities', icon: '🔒' },
    { value: NewsletterCategory.TUTORIALS, label: 'Tutorials', icon: '📚' },
    { value: NewsletterCategory.CAREERS, label: 'Careers', icon: '💼' },
    { value: NewsletterCategory.EVENTS, label: 'Events', icon: '📅' },
  ];

  const handleCategoryToggle = (category: NewsletterCategory) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      newsletterService.subscribe(email, name || undefined, selectedCategories);
      setSuccess(true);
      setEmail('');
      setName('');
    } catch (err) {
      if (err instanceof AppError) {
        setError(err.message);
      } else {
        setError('Failed to subscribe. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Card className={className}>
        <div className="p-6 text-center">
          <div className="text-4xl mb-3">✅</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Successfully Subscribed!
          </h3>
          <p className="text-sm text-gray-400">
            Check your email to confirm your subscription.
          </p>
        </div>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className={className}>
        <div className="p-4">
          <h3 className="text-sm font-semibold text-white mb-2">
            Subscribe to Newsletter
          </h3>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" size="sm" disabled={isSubmitting}>
              Join
            </Button>
          </form>
          {error && (
            <p className="text-xs text-red-400 mt-2">{error}</p>
          )}
        </div>
      </Card>
    );
  }

  if (variant === 'footer') {
    return (
      <div className={className}>
        <h3 className="text-sm font-semibold text-white mb-2">
          Stay Updated
        </h3>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1"
          />
          <Button type="submit" size="sm" disabled={isSubmitting}>
            Subscribe
          </Button>
        </form>
        {error && (
          <p className="text-xs text-red-400 mt-2">{error}</p>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <div className="p-6">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">📧</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Stay Ahead of Cyber Threats
          </h2>
          <p className="text-gray-400">
            Get weekly cybersecurity insights delivered to your inbox.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="error" title="Error">
              {error}
            </Alert>
          )}

          <Input
            type="email"
            label="Email Address"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            type="text"
            label="Name (optional)"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Topics of Interest
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => handleCategoryToggle(category.value)}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                    selectedCategories.includes(category.value)
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-gray-900/50 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span className="text-sm">{category.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Subscribing...' : 'Subscribe'}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            No spam. Unsubscribe at any time.
          </p>
        </form>
      </div>
    </Card>
  );
}
