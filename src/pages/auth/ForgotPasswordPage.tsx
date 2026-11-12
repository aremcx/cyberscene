/**
 * Forgot Password Page
 * Request password reset email.
 */

import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../config/routes';
import { Button, Input } from '../../components/ui';
import * as authService from '../../services/authService';
import { AppError } from '../../lib/errors';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authService.requestPasswordReset(email);
      setSuccess(true);
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Forgot Password</h1>
          <p className="text-gray-400">We'll send you a link to reset your password</p>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-8">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Check Your Email</h3>
              <p className="text-gray-400 text-sm mb-6">
                If an account exists with that email, we've sent password reset instructions.
              </p>
              <Link to={ROUTES.LOGIN}>
                <Button variant="outline">Back to Login</Button>
              </Link>
            </div>
          ) : (
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

              <Button type="submit" isLoading={isLoading} className="w-full">
                Send Reset Link
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Remember your password?{' '}
          <Link to={ROUTES.LOGIN} className="text-emerald-400 hover:text-emerald-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
