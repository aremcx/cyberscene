import { useState } from 'react';
import { useAuth } from '../../components/auth/AuthProvider';
import { Button, Input, Badge, EmptyState, Alert, Modal } from '../../components/ui';
import { db } from '../../db/store';
import { hasPermission, PERMISSIONS } from '../../lib/authorization';
import { generateSlug } from '../../lib/markdown';
import type { Tag } from '../../db/schema';

export function AdminTags() {
  const { authContext } = useAuth();
  const [tags, setTags] = useState<Tag[]>(db.listTags());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const canManage = hasPermission(authContext, PERMISSIONS.SYSTEM_SETTINGS);

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tag.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingTag(null);
    setName('');
    setSlug('');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (tag: Tag) => {
    setEditingTag(tag);
    setName(tag.name);
    setSlug(tag.slug);
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!name.trim() || !slug.trim()) {
      setError('Name and slug are required');
      return;
    }

    try {
      if (!editingTag) {
        db.createTag({ name, slug });
      }
      setTags(db.listTags());
      setIsModalOpen(false);
      setSuccess(`Tag ${editingTag ? 'updated' : 'created'} successfully`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Tags</h1>
          <p className="text-sm text-gray-400 mt-1">Manage article tags</p>
        </div>
        {canManage && (
          <Button onClick={openCreateModal}>Create Tag</Button>
        )}
      </div>

      {success && (
        <Alert variant="success" className="mb-6">{success}</Alert>
      )}

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Search tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />
      </div>

      {filteredTags.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {filteredTags.map((tag) => {
            const articleCount = db.getTagArticleCount(tag.id);
            return (
              <div
                key={tag.id}
                className="group flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-800 bg-gray-900/30 hover:border-gray-700 transition-colors"
              >
                <div>
                  <div className="text-sm font-medium text-white">{tag.name}</div>
                  <div className="text-xs text-gray-500">
                    {articleCount} {articleCount === 1 ? 'article' : 'articles'}
                  </div>
                </div>
                {canManage && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(tag)}
                      className="text-xs text-gray-400 hover:text-white"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon="🏷️"
          title={searchQuery ? 'No tags match your search' : 'No tags yet'}
          description={searchQuery ? 'Try a different search term' : 'Create your first tag'}
          action={!searchQuery && canManage ? <Button onClick={openCreateModal}>Create Tag</Button> : undefined}
        />
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTag ? 'Edit Tag' : 'Create Tag'}
      >
        <div className="space-y-4">
          {error && <Alert variant="error">{error}</Alert>}
          <Input
            label="Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!editingTag) setSlug(generateSlug(e.target.value));
            }}
            placeholder="Tag name"
          />
          <Input
            label="Slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="tag-slug"
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>
              {editingTag ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
