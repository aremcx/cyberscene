import { useState, useEffect } from 'react';
import { useAuth } from '../../components/auth/AuthProvider';
import { Button, Badge, EmptyState, Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui';
import { db } from '../../db/store';
import { formatRelativeTime } from '../../lib/utils';
import { hasPermission, PERMISSIONS } from '../../lib/authorization';
import type { User } from '../../db/schema';

export function AdminAuthors() {
  const { authContext } = useAuth();
  const [authors, setAuthors] = useState<(User & { articleCount: number })[]>([]);

  const canManage = hasPermission(authContext, PERMISSIONS.USERS_MANAGE);

  useEffect(() => {
    loadAuthors();
  }, []);

  const loadAuthors = () => {
    const { data: users } = db.listUsers({ page: 1, pageSize: 100 });
    
    const authorsWithCounts = users.map(user => {
      const { data: articles } = db.listArticles({ page: 1, pageSize: 1000 }, undefined, { authorId: user.id });
      return {
        ...user,
        articleCount: articles.length,
      };
    }).filter(user => user.articleCount > 0);

    setAuthors(authorsWithCounts);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Authors</h1>
        <p className="text-sm text-gray-400 mt-1">
          View all content authors and their contributions
        </p>
      </div>

      {authors.length > 0 ? (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Author</TableHeader>
              <TableHeader>Email</TableHeader>
              <TableHeader>Articles</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Joined</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {authors.map((author) => (
              <TableRow key={author.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-sm text-emerald-400 font-medium">
                      {author.displayName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-white">{author.displayName}</div>
                      {author.bio && (
                        <div className="text-xs text-gray-500 truncate max-w-xs">{author.bio}</div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-300">{author.email}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="info" size="sm">{author.articleCount} articles</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={author.isActive ? 'success' : 'outline'} size="sm">
                    {author.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-400">
                    {formatRelativeTime(author.createdAt)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState
          icon="✍️"
          title="No authors yet"
          description="Authors will appear here once they create content"
        />
      )}
    </div>
  );
}
