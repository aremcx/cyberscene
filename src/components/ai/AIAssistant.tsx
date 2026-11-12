import { useState, useRef, useEffect } from 'react';
import { Button, Input, Card, Badge } from '../ui';
import * as aiService from '../../services/aiAssistant';
import type { AIMessage, AIConversation } from '../../db/aiSchema';
import { MessageRole } from '../../db/aiSchema';
import { useAuth } from '../auth/AuthProvider';
import { AppError } from '../../lib/errors';

interface AIAssistantProps {
  className?: string;
}

export function AIAssistant({ className }: AIAssistantProps) {
  const { user } = useAuth();
  const [conversation, setConversation] = useState<AIConversation | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && !conversation) {
      const newConversation = aiService.startConversation(user.id);
      setConversation(newConversation);
    }
  }, [user]);

  useEffect(() => {
    if (conversation) {
      const history = aiService.getConversationHistory(conversation.id);
      setMessages(history);
    }
  }, [conversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !conversation || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setError('');
    setIsLoading(true);

    try {
      const response = await aiService.sendMessage(
        user!.id,
        conversation.id,
        userMessage
      );

      // Refresh messages
      const history = aiService.getConversationHistory(conversation.id);
      setMessages(history);
    } catch (err) {
      if (err instanceof AppError) {
        setError(err.message);
      } else {
        setError('Failed to get response. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = () => {
    if (!user) return;
    const newConversation = aiService.startConversation(user.id);
    setConversation(newConversation);
    setMessages([]);
    setError('');
  };

  if (!user) {
    return (
      <Card className={className}>
        <div className="p-6 text-center">
          <p className="text-gray-400">Please sign in to use the AI assistant.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="flex flex-col h-[600px]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">CyberVault AI</h3>
              <p className="text-xs text-gray-400">Cybersecurity Assistant</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={handleNewConversation}>
            New Chat
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🤖</div>
              <h4 className="text-lg font-semibold text-white mb-2">
                Welcome to CyberVault AI
              </h4>
              <p className="text-sm text-gray-400 mb-4">
                Ask me anything about cybersecurity!
              </p>
              <div className="text-left max-w-md mx-auto space-y-2">
                <p className="text-xs text-gray-500 font-semibold mb-2">Try asking:</p>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• "Explain SQL injection"</li>
                  <li>• "Find articles about Active Directory"</li>
                  <li>• "Give me a Windows hardening checklist"</li>
                </ul>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === MessageRole.USER ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === MessageRole.USER
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-800 text-gray-100'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                {message.citations.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-700">
                    <p className="text-xs text-gray-400 mb-1">Related articles:</p>
                    <div className="flex flex-wrap gap-1">
                      {message.citations.map((articleId, idx) => (
                        <Badge key={idx} variant="outline" size="sm">
                          Article #{idx + 1}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-gray-400">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about cybersecurity..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              Send
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            AI can make mistakes. Verify important information.
          </p>
        </form>
      </div>
    </Card>
  );
}
