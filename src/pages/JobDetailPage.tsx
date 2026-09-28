import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db } from '../db/store';
import type { Job } from '../db/jobsSchema';
import { Badge, Button, Card, EmptyState } from '../components/ui';
import { formatDate } from '../lib/utils';

export function JobDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      const found = db.getJobBySlug(slug);
      if (found) {
        setJob(found);
        db.incrementJobViewCount(found.id);
      }
      setLoading(false);
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-800 rounded w-3/4"></div>
          <div className="h-4 bg-gray-800 rounded w-1/2"></div>
          <div className="h-64 bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <EmptyState
        icon="💼"
        title="Job Not Found"
        description="The job listing you're looking for doesn't exist or has been removed."
        action={
          <Link to="/jobs">
            <Button>Browse Jobs</Button>
          </Link>
        }
      />
    );
  }

  const getWorkModeLabel = (mode: string) => {
    switch (mode) {
      case 'remote': return '🌍 Remote';
      case 'hybrid': return '🔄 Hybrid';
      case 'onsite': return '🏢 On-site';
      default: return mode;
    }
  };

  const getJobTypeLabel = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getExperienceLabel = (level: string) => {
    switch (level) {
      case 'entry': return 'Entry Level';
      case 'junior': return 'Junior';
      case 'mid_level': return 'Mid-Level';
      case 'senior': return 'Senior';
      case 'lead': return 'Lead';
      case 'executive': return 'Executive';
      default: return level;
    }
  };

  const formatSalary = (min: number | null, max: number | null, currency: string) => {
    if (min && max) {
      return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    } else if (min) {
      return `From ${currency} ${min.toLocaleString()}`;
    } else if (max) {
      return `Up to ${currency} ${max.toLocaleString()}`;
    }
    return 'Competitive';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-400">
        <Link to="/" className="hover:text-emerald-400 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link to="/jobs" className="hover:text-emerald-400 transition-colors">
          Jobs
        </Link>
        <span>/</span>
        <span className="text-white truncate">{job.title}</span>
      </nav>

      {/* Job Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {job.title}
            </h1>
            <p className="text-xl text-emerald-400">
              {job.company}
            </p>
          </div>
          <Badge variant={job.status === 'active' ? 'success' : 'outline'} size="md">
            {job.status === 'active' ? 'Active' : 'Closed'}
          </Badge>
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-4 flex-wrap text-sm text-gray-400 mb-6">
          <span>{getWorkModeLabel(job.workMode)}</span>
          <span>•</span>
          <span>📍 {job.location}, {job.country}</span>
          <span>•</span>
          <span>💼 {getJobTypeLabel(job.jobType)}</span>
          <span>•</span>
          <span>🎯 {getExperienceLabel(job.experienceLevel)}</span>
        </div>

        {/* Salary */}
        <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800 mb-6">
          <div className="text-sm text-gray-400 mb-1">Salary Range</div>
          <div className="text-2xl font-bold text-white">
            {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
          </div>
        </div>

        {/* Apply Button */}
        <div className="flex gap-3 mb-8">
          <a
            href={job.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="lg">
              Apply Now
            </Button>
          </a>
          <Button variant="outline" size="lg">
            Save Job
          </Button>
        </div>
      </div>

      {/* Job Description */}
      <Card className="mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Job Description
          </h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 whitespace-pre-wrap">
              {job.description}
            </p>
          </div>
        </div>
      </Card>

      {/* Skills */}
      {job.skills.length > 0 && (
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Required Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill, idx) => (
                <Badge key={idx} variant="outline" size="md">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Job Details */}
      <Card className="mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Job Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">Posted Date</div>
              <div className="text-white">{formatDate(job.postedDate)}</div>
            </div>
            {job.closingDate && (
              <div>
                <div className="text-sm text-gray-400 mb-1">Application Deadline</div>
                <div className="text-white">{formatDate(job.closingDate)}</div>
              </div>
            )}
            <div>
              <div className="text-sm text-gray-400 mb-1">Job Type</div>
              <div className="text-white">{getJobTypeLabel(job.jobType)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Experience Level</div>
              <div className="text-white">{getExperienceLabel(job.experienceLevel)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Work Mode</div>
              <div className="text-white">{getWorkModeLabel(job.workMode)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Location</div>
              <div className="text-white">{job.location}, {job.country}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Back to Jobs */}
      <div className="text-center">
        <Link to="/jobs">
          <Button variant="outline">
            ← Back to Jobs
          </Button>
        </Link>
      </div>
    </div>
  );
}
