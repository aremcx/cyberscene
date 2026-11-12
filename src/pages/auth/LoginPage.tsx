/**
 * Login Page
 * Secure login form with validation and error handling.
 */

import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../components/auth/AuthProvider';
import { ROUTES } from '../../config/routes';
import { Button, Input } from '../../components/ui';
import { AppError } from '../../lib/errors';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || ROUTES.HOME;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to your CyberVault account</p>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-400">
                <input type="checkbox" className="rounded border-gray-600 bg-gray-800 text-emerald-500 focus:ring-emerald-500" />
                Remember me
              </label>
              <Link to={ROUTES.FORGOT_PASSWORD} className="text-emerald-400 hover:text-emerald-300 transition-colors">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full">
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to={ROUTES.REGISTER} className="text-emerald-400 hover:text-emerald-300 transition-colors">
            Create one
          </Link>
        </p>

        {/* Demo credentials hint */}
        <div className="mt-6 p-4 rounded-lg border border-gray-800 bg-gray-900/30">
          <p className="text-xs text-gray-500 mb-2 font-medium">Demo Credentials:</p>
          <div className="space-y-1 text-xs text-gray-600 font-mono">
            <div>superadmin@cybervault.dev / Demo@1234</div>
            <div>editor@cybervault.dev / Demo@1234</div>
            <div>user@cybervault.dev / Demo@1234</div>
          </div>
        </div>
      </div>
    </div>
  );
}
