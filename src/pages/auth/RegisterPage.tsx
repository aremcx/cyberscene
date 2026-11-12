/**
 * Register Page
 * Secure registration form with password strength validation.
 */

import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../components/auth/AuthProvider';
import { ROUTES } from '../../config/routes';
import { Button, Input } from '../../components/ui';
import { validatePasswordStrength } from '../../lib/validation';
import { AppError } from '../../lib/errors';

export function RegisterPage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const passwordStrength = validatePasswordStrength(password);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!passwordStrength.isValid) {
      setError(`Password: ${passwordStrength.issues.join(', ')}`);
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password, displayName);
      navigate(ROUTES.HOME, { replace: true });
    } catch (err) {
      if (err instanceof AppError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400">Join the CyberVault community</p>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <Input
              label="Display Name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="John Doe"
              required
            />

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />

            <div>
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              {password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          passwordStrength.strength === 'weak' ? 'bg-red-500 w-1/3' :
                          passwordStrength.strength === 'medium' ? 'bg-amber-500 w-2/3' :
                          'bg-emerald-500 w-full'
                        }`}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength.strength === 'weak' ? 'text-red-400' :
                      passwordStrength.strength === 'medium' ? 'text-amber-400' :
                      'text-emerald-400'
                    }`}>
                      {passwordStrength.strength}
                    </span>
                  </div>
                  {passwordStrength.issues.length > 0 && (
                    <ul className="text-xs text-gray-500 space-y-0.5">
                      {passwordStrength.issues.map((issue, i) => (
                        <li key={i}>• {issue}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button type="submit" isLoading={isLoading} className="w-full">
              Create Account
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="text-emerald-400 hover:text-emerald-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
