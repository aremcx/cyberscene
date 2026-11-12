import { useState, useEffect } from 'react';
import { Button, Card, Badge, Input, Select, EmptyState, Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui';
import * as newsletterService from '../../services/newsletter';
import { NewsletterCategory, SubscriptionStatus, CampaignStatus } from '../../db/newsletterSchema';
import type { NewsletterSubscriber, NewsletterCampaign } from '../../db/newsletterSchema';
import { useAuth } from '../../components/auth/AuthProvider';
import { formatRelativeTime } from '../../lib/utils';

export function NewsletterManagementPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'subscribers' | 'campaigns'>('subscribers');
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    unsubscribed: 0,
    byCategory: {} as Record<NewsletterCategory, number>,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setSubscribers(newsletterService.listSubscribers());
    setCampaigns(newsletterService.listCampaigns());
    setStats(newsletterService.getSubscriberStats());
  };

  const getStatusBadge = (status: SubscriptionStatus) => {
    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return <Badge variant="success" size="sm">Active</Badge>;
      case SubscriptionStatus.UNSUBSCRIBED:
        return <Badge variant="outline" size="sm">Unsubscribed</Badge>;
      case SubscriptionStatus.PENDING:
        return <Badge variant="warning" size="sm">Pending</Badge>;
      case SubscriptionStatus.BOUNCED:
        return <Badge variant="danger" size="sm">Bounced</Badge>;
      default:
        return <Badge variant="outline" size="sm">{status}</Badge>;
    }
  };

  const getCampaignStatusBadge = (status: CampaignStatus) => {
    switch (status) {
      case CampaignStatus.DRAFT:
        return <Badge variant="outline" size="sm">Draft</Badge>;
      case CampaignStatus.SCHEDULED:
        return <Badge variant="info" size="sm">Scheduled</Badge>;
      case CampaignStatus.SENT:
        return <Badge variant="success" size="sm">Sent</Badge>;
      case CampaignStatus.SENDING:
        return <Badge variant="warning" size="sm">Sending</Badge>;
      case CampaignStatus.CANCELLED:
        return <Badge variant="danger" size="sm">Cancelled</Badge>;
      default:
        return <Badge variant="outline" size="sm">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Newsletter Management</h1>
        <p className="text-gray-400">
          Manage newsletter subscribers and campaigns.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="p-4">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-gray-400">Total Subscribers</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-2xl font-bold text-emerald-400">{stats.active}</div>
            <div className="text-sm text-gray-400">Active</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-2xl font-bold text-gray-400">{stats.unsubscribed}</div>
            <div className="text-sm text-gray-400">Unsubscribed</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-2xl font-bold text-cyan-400">{campaigns.length}</div>
            <div className="text-sm text-gray-400">Campaigns</div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-800">
        <button
          onClick={() => setActiveTab('subscribers')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'subscribers'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Subscribers
        </button>
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'campaigns'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Campaigns
        </button>
      </div>

      {/* Subscribers Tab */}
      {activeTab === 'subscribers' && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Subscribers by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(stats.byCategory).map(([category, count]) => (
                <div key={category} className="p-4 rounded-lg border border-gray-800 bg-gray-900/30">
                  <div className="text-lg font-bold text-white">{count}</div>
                  <div className="text-sm text-gray-400 capitalize">
                    {category.replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {subscribers.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Email</TableHeader>
                  <TableHeader>Name</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Categories</TableHeader>
                  <TableHeader>Subscribed</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {subscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell>
                      <div className="text-sm text-white">{subscriber.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-300">{subscriber.name || '-'}</div>
                    </TableCell>
                    <TableCell>{getStatusBadge(subscriber.status)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {subscriber.categories.map((cat, idx) => (
                          <Badge key={idx} variant="outline" size="sm">
                            {cat.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-400">
                        {formatRelativeTime(subscriber.subscribedAt)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              icon="📧"
              title="No subscribers yet"
              description="Subscribers will appear here once they sign up"
            />
          )}
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Campaigns</h2>
            <Button onClick={() => alert('Campaign creation coming soon')}>
              Create Campaign
            </Button>
          </div>

          {campaigns.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Title</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Recipients</TableHeader>
                  <TableHeader>Sent</TableHeader>
                  <TableHeader>Created</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <div>
                        <div className="text-sm font-medium text-white">{campaign.title}</div>
                        <div className="text-xs text-gray-500">{campaign.subject}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getCampaignStatusBadge(campaign.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-300">{campaign.recipientCount}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-300">
                        {campaign.sentCount > 0 ? (
                          <div>
                            <div>{campaign.sentCount} sent</div>
                            <div className="text-xs text-gray-500">
                              {campaign.openedCount} opened
                            </div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-400">
                        {formatRelativeTime(campaign.createdAt)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              icon="📢"
              title="No campaigns yet"
              description="Create your first newsletter campaign"
              action={
                <Button onClick={() => alert('Campaign creation coming soon')}>
                  Create Campaign
                </Button>
              }
            />
          )}
        </div>
      )}
    </div>
  );
}
