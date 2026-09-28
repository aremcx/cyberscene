import { Link } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import { Button } from '../components/ui';

export function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-6xl font-bold text-emerald-500 mb-4">404</div>
        <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
        <p className="text-gray-400 mb-8 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to={ROUTES.HOME}>
          <Button>
            ← Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
