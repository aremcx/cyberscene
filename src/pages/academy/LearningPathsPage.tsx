import { useEffect, useState } from 'react';
import { db } from '../../db/store';
import { LearningPathCard } from '../../components/academy/LearningPathCard';
import { EmptyState } from '../../components/ui';
import type { LearningPath } from '../../db/academySchema';

export function LearningPathsPage() {
  const [paths, setPaths] = useState<LearningPath[]>([]);

  useEffect(() => {
    setPaths(db.listLearningPaths());
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Learning Paths</h1>
        <p className="text-gray-400">
          Structured learning paths to guide your cybersecurity education journey.
        </p>
      </div>

      {paths.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paths.map((path) => (
            <LearningPathCard key={path.id} path={path} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🎓"
          title="No learning paths available"
          description="Learning paths will be added soon"
        />
      )}
    </div>
  );
}
