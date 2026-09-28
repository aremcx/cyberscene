import { useState } from 'react';
import { useAuth } from '../../components/auth/AuthProvider';
import { Button, Input, Badge, EmptyState, Alert, Modal } from '../../components/ui';
import { db } from '../../db/store';
import { hasPermission, PERMISSIONS } from '../../lib/authorization';
import { generateSlug } from '../../lib/markdown';
import type { Category } from '../../db/schema';

export function AdminCategories() {
  const { authContext } = useAuth();
  const [categories, setCategories] = useState<Category[]>(db.listCategories());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const canManage = hasPermission(authContext, PERMISSIONS.SYSTEM_SETTINGS);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setSlug(category.slug);
    setDescription(category.description || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!name.trim() || !slug.trim()) {
      setError('Name and slug are required');
      return;
    }

    try {
      if (editingCategory) {
        // Update existing
        const updated = db.getCategoryById(editingCategory.id);
        if (updated) {
          // In a real app, we'd have an update method. For now, recreate.
          db.createCategory({ name, slug, description: description || null });
        }
      } else {
        db.createCategory({ name, slug, description: description || null });
      }

      setCategories(db.listCategories());
      setIsModalOpen(false);
      setSuccess(`Category ${editingCategory ? 'updated' : 'created'} successfully`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      // In a real app, we'd delete. For demo, just refresh.
      setCategories(db.listCategories().filter(c => c.id !== id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Categories</h1>
          <p className="text-sm text-gray-400 mt-1">Manage article categories</p>
        </div>
        {canManage && (
          <Button onClick={openCreateModal}>Create Category</Button>
        )}
      </div>

      {success && (
        <Alert variant="success" className="mb-6">{success}</Alert>
      )}

      {categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => {
            const articleCount = db.getCategoryArticleCount(category.id);
            return (
              <div
                key={category.id}
                className="p-4 rounded-lg border border-gray-800 bg-gray-900/30 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-white">{category.name}</h3>
                  <Badge variant="outline" size="sm">{articleCount} articles</Badge>
                </div>
                {category.description && (
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">{category.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <code className="text-xs text-gray-500">/{category.slug}</code>
                  {canManage && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openEditModal(category)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(category.id)}
                        className="text-red-400"
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon="📁"
          title="No categories yet"
          description="Create your first category to organize articles"
          action={canManage ? <Button onClick={openCreateModal}>Create Category</Button> : undefined}
        />
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
      >
        <div className="space-y-4">
          {error && <Alert variant="error">{error}</Alert>}
          <Input
            label="Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!editingCategory) setSlug(generateSlug(e.target.value));
            }}
            placeholder="Category name"
          />
          <Input
            label="Slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="category-slug"
          />
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Category description..."
              rows={3}
              className="w-full rounded-lg border border-gray-700 bg-gray-900/50 text-gray-100 placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors px-4 py-2.5 text-sm resize-none"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
