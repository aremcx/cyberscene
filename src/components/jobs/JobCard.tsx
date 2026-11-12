import { Link } from 'react-router-dom';
import { Badge } from '../ui';
import { WorkMode, JobType, ExperienceLevel } from '../../db/jobsSchema';
import type { Job } from '../../db/jobsSchema';
import { formatRelativeTime } from '../../lib/utils';

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const getWorkModeIcon = (mode: WorkMode) => {
    switch (mode) {
      case WorkMode.REMOTE:
        return '🌍';
      case WorkMode.HYBRID:
        return '🔄';
      case WorkMode.ONSITE:
        return '🏢';
      default:
        return '📍';
    }
  };

  const getWorkModeLabel = (mode: WorkMode) => {
    switch (mode) {
      case WorkMode.REMOTE:
        return 'Remote';
      case WorkMode.HYBRID:
        return 'Hybrid';
      case WorkMode.ONSITE:
        return 'On-site';
      default:
        return mode;
    }
  };

  const getJobTypeLabel = (type: JobType) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getExperienceLabel = (level: ExperienceLevel) => {
    switch (level) {
      case ExperienceLevel.ENTRY:
        return 'Entry Level';
      case ExperienceLevel.JUNIOR:
        return 'Junior';
      case ExperienceLevel.MID_LEVEL:
        return 'Mid-Level';
      case ExperienceLevel.SENIOR:
        return 'Senior';
      case ExperienceLevel.LEAD:
        return 'Lead';
      case ExperienceLevel.EXECUTIVE:
        return 'Executive';
      default:
        return level;
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
    <Link
      to={`/jobs/${job.slug}`}
      className="block p-6 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-emerald-500/50 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1 hover:text-emerald-400 transition-colors">
            {job.title}
          </h3>
          <p className="text-sm text-emerald-400">{job.company}</p>
        </div>
        <Badge variant="info" size="sm">
          {getJobTypeLabel(job.jobType)}
        </Badge>
      </div>

      <p className="text-sm text-gray-400 mb-4 line-clamp-2">
        {job.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded flex items-center gap-1">
          {getWorkModeIcon(job.workMode)} {getWorkModeLabel(job.workMode)}
        </span>
        <span className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded">
          📍 {job.location}
        </span>
        <span className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded">
          💼 {getExperienceLabel(job.experienceLevel)}
        </span>
      </div>

      {job.skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {job.skills.slice(0, 5).map((skill, idx) => (
            <span key={idx} className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
              {skill}
            </span>
          ))}
          {job.skills.length > 5 && (
            <span className="text-xs text-gray-500">+{job.skills.length - 5}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
        <span className="text-sm font-semibold text-white">
          {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
        </span>
        <span className="text-xs text-gray-500">
          Posted {formatRelativeTime(job.postedDate)}
        </span>
      </div>
    </Link>
  );
}
