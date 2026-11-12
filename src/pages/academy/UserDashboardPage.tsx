import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../db/store';
import { useAuth } from '../../components/auth/AuthProvider';
import { BadgeCard } from '../../components/academy/BadgeCard';
import { ProgressBar } from '../../components/academy/ProgressBar';
import { Badge, Button, EmptyState } from '../../components/ui';
import type { UserEnrollment, UserBadge, UserPoints, Badge as BadgeType, Course } from '../../db/academySchema';

export function UserDashboardPage() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<UserEnrollment[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [allBadges, setAllBadges] = useState<BadgeType[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (user) {
      setEnrollments(db.getUserEnrollments(user.id));
      setUserBadges(db.getUserBadges(user.id));
      setUserPoints(db.getUserPoints(user.id));
      setAllBadges(db.listBadges());
      setCourses(db.listCourses());
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EmptyState
          icon="🔒"
          title="Sign in required"
          description="Please sign in to view your learning dashboard"
          action={
            <Link to="/login">
              <Button>Sign In</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const completedCourses = enrollments.filter(e => e.progress >= 100).length;
  const inProgressCourses = enrollments.filter(e => e.progress > 0 && e.progress < 100).length;
  const earnedBadgeIds = userBadges.map(ub => ub.badgeId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">My Learning Dashboard</h1>
        <p className="text-gray-400">
          Track your progress, view achievements, and continue learning.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="p-6 rounded-xl border border-gray-800 bg-gray-900/30">
          <div className="text-3xl font-bold text-emerald-400 mb-1">
            {userPoints?.totalPoints || 0}
          </div>
          <div className="text-sm text-gray-400">Total Points</div>
        </div>
        <div className="p-6 rounded-xl border border-gray-800 bg-gray-900/30">
          <div className="text-3xl font-bold text-cyan-400 mb-1">
            {userPoints?.level || 1}
          </div>
          <div className="text-sm text-gray-400">Level</div>
        </div>
        <div className="p-6 rounded-xl border border-gray-800 bg-gray-900/30">
          <div className="text-3xl font-bold text-purple-400 mb-1">
            {completedCourses}
          </div>
          <div className="text-sm text-gray-400">Courses Completed</div>
        </div>
        <div className="p-6 rounded-xl border border-gray-800 bg-gray-900/30">
          <div className="text-3xl font-bold text-amber-400 mb-1">
            {userBadges.length}
          </div>
          <div className="text-sm text-gray-400">Badges Earned</div>
        </div>
      </div>

      {/* Enrolled Courses */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">My Courses</h2>
        {enrollments.length > 0 ? (
          <div className="space-y-4">
            {enrollments.map((enrollment) => {
              const course = courses.find(c => c.id === enrollment.courseId);
              if (!course) return null;

              return (
                <Link
                  key={enrollment.id}
                  to={`/academy/courses/${course.slug}`}
                  className="block p-6 rounded-xl border border-gray-800 bg-gray-900/30 hover:border-emerald-500/50 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-400">{course.description}</p>
                    </div>
                    {enrollment.progress >= 100 && (
                      <Badge variant="success" size="md">✓ Completed</Badge>
                    )}
                  </div>
                  <ProgressBar
                    progress={enrollment.progress}
                    label="Progress"
                    showPercentage={true}
                  />
                </Link>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon="📚"
            title="No courses enrolled"
            description="Start learning by enrolling in a course"
            action={
              <Link to="/academy/courses">
                <Button>Browse Courses</Button>
              </Link>
            }
          />
        )}
      </div>

      {/* Badges */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">My Badges</h2>
          <span className="text-sm text-gray-400">
            {userBadges.length} of {allBadges.length} earned
          </span>
        </div>
        {allBadges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allBadges.map((badge) => {
              const userBadge = userBadges.find(ub => ub.badgeId === badge.id);
              return (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  earned={!!userBadge}
                  earnedAt={userBadge?.earnedAt}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon="🏆"
            title="No badges available"
            description="Badges will appear here once created"
          />
        )}
      </div>

      {/* CTA */}
      {enrollments.length === 0 && (
        <div className="rounded-2xl border border-gray-800 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Start Your Learning Journey</h2>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Enroll in courses, complete labs, and earn badges as you master cybersecurity skills.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/academy/paths">
              <Button>Browse Learning Paths</Button>
            </Link>
            <Link to="/academy/labs">
              <Button variant="outline">Try a Lab</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
