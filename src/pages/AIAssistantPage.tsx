import { AIAssistant } from '../components/ai/AIAssistant';

export function AIAssistantPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">AI Cybersecurity Assistant</h1>
        <p className="text-gray-400">
          Get instant answers to your cybersecurity questions powered by our knowledge base.
        </p>
      </div>

      <AIAssistant />

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-gray-800 bg-gray-900/30">
          <div className="text-2xl mb-2">🎓</div>
          <h3 className="text-sm font-semibold text-white mb-1">Learn Concepts</h3>
          <p className="text-xs text-gray-400">
            Understand security concepts with clear explanations
          </p>
        </div>
        <div className="p-4 rounded-lg border border-gray-800 bg-gray-900/30">
          <div className="text-2xl mb-2">🔍</div>
          <h3 className="text-sm font-semibold text-white mb-1">Find Articles</h3>
          <p className="text-xs text-gray-400">
            Discover relevant articles from our knowledge base
          </p>
        </div>
        <div className="p-4 rounded-lg border border-gray-800 bg-gray-900/30">
          <div className="text-2xl mb-2">📋</div>
          <h3 className="text-sm font-semibold text-white mb-1">Get Checklists</h3>
          <p className="text-xs text-gray-400">
            Access security checklists and best practices
          </p>
        </div>
      </div>
    </div>
  );
}
