import { useState } from 'react';
import { cn } from '../../lib/utils';
import { Button } from './Button';
import { Input } from './Input';

interface NewsletterProps {
  className?: string;
  variant?: 'default' | 'compact' | 'hero';
}

export function Newsletter({ className, variant = 'default' }: NewsletterProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 3000);
    }, 1000);
  };

  if (variant === 'hero') {
    return (
      <div className={cn('rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-950 p-8 md:p-12', className)}>
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Newsletter
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Stay Ahead of Cyber Threats
          </h2>
          <p className="text-gray-400 mb-6">
            Get weekly cybersecurity insights, threat intelligence, and exclusive content delivered to your inbox.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" isLoading={status === 'loading'}>
              Subscribe
            </Button>
          </form>
          {status === 'success' && (
            <p className="text-emerald-400 text-sm mt-3">✓ Successfully subscribed!</p>
          )}
          <p className="text-xs text-gray-500 mt-4">
            No spam. Unsubscribe at any time.
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('rounded-lg border border-gray-800 bg-gray-900/50 p-4', className)}>
        <h3 className="text-sm font-semibold text-white mb-2">Subscribe to Newsletter</h3>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1"
          />
          <Button type="submit" size="sm" isLoading={status === 'loading'}>
            Join
          </Button>
        </form>
        {status === 'success' && (
          <p className="text-emerald-400 text-xs mt-2">✓ Subscribed!</p>
        )}
      </div>
    );
  }

  return (
    <div className={cn('rounded-xl border border-gray-800 bg-gray-900/30 p-6', className)}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">CyberVault Newsletter</h3>
          <p className="text-sm text-gray-400 mb-4">
            Weekly cybersecurity insights and threat intelligence.
          </p>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" isLoading={status === 'loading'}>
              Subscribe
            </Button>
          </form>
          {status === 'success' && (
            <p className="text-emerald-400 text-sm mt-2">✓ Successfully subscribed!</p>
          )}
        </div>
      </div>
    </div>
  );
}
