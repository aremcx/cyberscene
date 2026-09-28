import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../db/store';
import { DiscussionCard } from '../components/community/DiscussionCard';
import { Button, Input, Select, EmptyState } from '../components/ui';
import { DiscussionType } from '../db/communitySchema';
import type { Discussion } from '../db/communitySchema';

export function CommunityPage() {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    setDiscussions(db.listDiscussions());
  }, []);

  const filteredDiscussions = discussions.filter(discussion => {
    const matchesSearch = searchQuery === '' || 
      discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discussion.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || discussion.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const getCommentCount = (discussionId: string) => {
    return db.listCommentsByDiscussion(discussionId).length;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Community</h1>
          <p className="text-gray-400">
            Connect with cybersecurity professionals, ask questions, and share knowledge.
          </p>
        </div>
        <Link to="/community/new">
          <Button>Start Discussion</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/30">
          <div className="text-2xl font-bold text-white">{discussions.length}</div>
          <div className="text-sm text-gray-500">Discussions</div>
        </div>
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/30">
          <div className="text-2xl font-bold text-emerald-400">
            {discussions.filter(d => d.type === DiscussionType.QUESTION).length}
          </div>
          <div className="text-sm text-gray-500">Questions</div>
        </div>
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/30">
          <div className="text-2xl font-bold text-cyan-400">
            {db.getState().communityComments.size}
          </div>
          <div className="text-sm text-gray-500">Comments</div>
        </div>
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/30">
          <div className="text-2xl font-bold text-purple-400">
            {db.getState().userFollows.length}
          </div>
          <div className="text-sm text-gray-500">Connections</div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Input
          placeholder="Search discussions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Types' },
            { value: DiscussionType.GENERAL, label: 'General' },
            { value: DiscussionType.QUESTION, label: 'Questions' },
            { value: DiscussionType.DISCUSSION, label: 'Discussions' },
            { value: DiscussionType.HELP, label: 'Help Needed' },
            { value: DiscussionType.SHOWCASE, label: 'Showcase' },
          ]}
        />
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="font-medium text-white">{filteredDiscussions.length}</span>
          discussions found
        </div>
      </div>

      {/* Discussions List */}
      {filteredDiscussions.length > 0 ? (
        <div className="space-y-4">
          {filteredDiscussions.map((discussion) => (
            <DiscussionCard
              key={discussion.id}
              discussion={discussion}
              commentCount={getCommentCount(discussion.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="💬"
          title="No discussions found"
          description="Try adjusting your search or filters"
        />
      )}
    </div>
  );
}
