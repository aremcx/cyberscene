import { useState, useEffect } from 'react';
import { db } from '../../db/store';
import { Badge, Button, EmptyState, Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui';
import { ToolCategory, ToolLicense, SkillLevel } from '../../db/toolsSchema';
import type { Tool } from '../../db/toolsSchema';
import { useAuth } from '../../components/auth/AuthProvider';
import { hasPermission, PERMISSIONS } from '../../lib/authorization';

export function AdminTools() {
  const { authContext } = useAuth();
  const [tools, setTools] = useState<Tool[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const canManage = hasPermission(authContext, PERMISSIONS.SYSTEM_SETTINGS);

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = () => {
    const result = db.listTools({ page: 1, pageSize: 100 });
    setTools(result.data);
  };

  const filteredTools = tools.filter(tool => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      tool.name.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      tool.category.toLowerCase().includes(q)
    );
  });

  const getCategoryLabel = (category: ToolCategory) => {
    return category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getLicenseColor = (license: ToolLicense) => {
    switch (license) {
      case ToolLicense.OPEN_SOURCE:
        return 'success';
      case ToolLicense.COMMERCIAL:
        return 'warning';
      case ToolLicense.FREEMIUM:
        return 'info';
      case ToolLicense.FREE:
        return 'default';
      default:
        return 'outline';
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this tool?')) {
      db.deleteTool(id);
      loadTools();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Tools Management</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage cybersecurity tools in the directory
          </p>
        </div>
        {canManage && (
          <Button onClick={() => alert('Tool creation form coming soon')}>
            Add Tool
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search tools..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
        />
      </div>

      {/* Tools Table */}
      {filteredTools.length > 0 ? (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Name</TableHeader>
              <TableHeader>Category</TableHeader>
              <TableHeader>License</TableHeader>
              <TableHeader>Skill Level</TableHeader>
              <TableHeader>Platforms</TableHeader>
              <TableHeader>Status</TableHeader>
              {canManage && <TableHeader>Actions</TableHeader>}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTools.map((tool) => (
              <TableRow key={tool.id}>
                <TableCell>
                  <div>
                    <div className="font-medium text-white">{tool.name}</div>
                    <div className="text-xs text-gray-500 truncate max-w-xs">
                      {tool.description}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" size="sm">
                    {getCategoryLabel(tool.category)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getLicenseColor(tool.license)} size="sm">
                    {tool.license}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" size="sm">
                    {tool.skillLevel}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-400">
                    {tool.platforms.length} platform{tool.platforms.length !== 1 ? 's' : ''}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={tool.isActive ? 'success' : 'outline'} size="sm">
                    {tool.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                {canManage && (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => alert(`Edit tool: ${tool.name}`)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(tool.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState
          icon="🔧"
          title="No tools found"
          description={searchQuery ? 'Try adjusting your search' : 'Add your first tool to get started'}
          action={
            canManage && !searchQuery ? (
              <Button onClick={() => alert('Tool creation form coming soon')}>
                Add Tool
              </Button>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
