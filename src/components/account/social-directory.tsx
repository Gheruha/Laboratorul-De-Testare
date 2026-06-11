'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  Award,
  Loader2,
  Search,
  Star,
  UserCheck,
  UserPlus,
  UsersRound,
} from 'lucide-react';
import { RadialBar, RadialBarChart } from 'recharts';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type {
  PublicSocialProfile,
  SocialDirectoryData,
  SocialUser,
} from '@/lib/types/social.type';

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();

function ProfileAvatar({
  name,
  avatarUrl,
  className = 'size-10',
}: {
  name: string;
  avatarUrl: string | null;
  className?: string;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full border bg-muted bg-cover bg-center font-semibold text-muted-foreground ${className}`}
      style={avatarUrl ? { backgroundImage: `url("${avatarUrl}")` } : undefined}
      aria-label={`${name} profile picture`}
    >
      {!avatarUrl && initials(name)}
    </div>
  );
}

function ProfileChart({
  label,
  value,
  detail,
  color,
}: {
  label: string;
  value: number;
  detail: string;
  color: string;
}) {
  const config = {
    value: { label, color },
  } satisfies ChartConfig;

  return (
    <div className="flex min-w-0 flex-col items-center">
      <ChartContainer config={config} className="aspect-square h-36 w-full">
        <RadialBarChart
          data={[{ value, fill: 'var(--color-value)' }]}
          startAngle={90}
          endAngle={90 - value * 3.6}
          innerRadius={43}
          outerRadius={64}
        >
          <RadialBar dataKey="value" background cornerRadius={5} />
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-foreground text-xl font-bold"
          >
            {value}%
          </text>
        </RadialBarChart>
      </ChartContainer>
      <p className="-mt-2 text-sm font-semibold">{label}</p>
      <p className="mt-1 text-center text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

export function SocialDirectory() {
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [activeList, setActiveList] = useState<'followers' | 'following'>(
    'following',
  );
  const [data, setData] = useState<SocialDirectoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] =
    useState<PublicSocialProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const loadUsers = useCallback(
    async (
      searchQuery: string,
      list: 'followers' | 'following' = 'following',
    ) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.set('q', searchQuery);
        else params.set('list', list);
        const response = await fetch(`/api/social?${params}`, {
          cache: 'no-store',
        });
        const body = (await response.json()) as SocialDirectoryData & {
          message?: string;
        };
        if (!response.ok)
          throw new Error(body.message || 'Failed to load users');
        setData(body);
      } catch (error: unknown) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to load users',
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadUsers('', 'following');
  }, [loadUsers]);

  const searchUsers = (event: FormEvent) => {
    event.preventDefault();
    const nextQuery = query.trim();
    if (nextQuery.length === 1) {
      toast.error('Enter at least 2 characters to search.');
      return;
    }
    setActiveQuery(nextQuery);
    void loadUsers(nextQuery, activeList);
  };

  const showList = (list: 'followers' | 'following') => {
    setActiveList(list);
    setActiveQuery('');
    setQuery('');
    void loadUsers('', list);
  };

  const loadProfile = useCallback(async (userId: string) => {
    setProfileLoading(true);
    try {
      const response = await fetch(`/api/social/${userId}`, {
        cache: 'no-store',
      });
      const body = (await response.json()) as PublicSocialProfile & {
        message?: string;
      };
      if (!response.ok)
        throw new Error(body.message || 'Failed to load profile');
      setSelectedProfile(body);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to load profile',
      );
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const toggleFollow = async (user: SocialUser) => {
    setPendingUserId(user.id);
    try {
      const response = await fetch('/api/social', {
        method: user.isFollowing ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const body = (await response.json()) as { message?: string };
      if (!response.ok)
        throw new Error(body.message || 'Failed to update following');
      await loadUsers(activeQuery, activeList);
      if (selectedProfile?.id === user.id) await loadProfile(user.id);
      toast.success(user.isFollowing ? 'User unfollowed' : 'User followed');
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update following',
      );
    } finally {
      setPendingUserId(null);
    }
  };

  const selectedSocialUser = selectedProfile
    ? {
        id: selectedProfile.id,
        displayName: selectedProfile.displayName,
        avatarUrl: selectedProfile.avatarUrl,
        isFollowing: selectedProfile.isFollowing,
      }
    : null;

  return (
    <Dialog
      onOpenChange={open => {
        if (!open) setSelectedProfile(null);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-6 rounded-full px-2.5">
          <UsersRound />
          {data?.followersCount ?? 0} followers
          <span className="text-muted-foreground">·</span>
          {data?.followingCount ?? 0} following
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[min(42rem,90vh)] overflow-hidden sm:max-w-2xl">
        {selectedProfile || profileLoading ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Back to learning network"
                  onClick={() => setSelectedProfile(null)}
                >
                  <ArrowLeft />
                </Button>
                <div>
                  <DialogTitle>Public profile</DialogTitle>
                  <DialogDescription>
                    Aggregate learning progress without private history.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            {profileLoading || !selectedProfile ? (
              <div className="flex min-h-72 items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 size-4 animate-spin" />
                Loading profile
              </div>
            ) : (
              <div className="min-h-0 space-y-5 overflow-y-auto pr-1">
                <div className="flex flex-col items-center gap-4 rounded-md border p-5 text-center sm:flex-row sm:text-left">
                  <ProfileAvatar
                    name={selectedProfile.displayName}
                    avatarUrl={selectedProfile.avatarUrl}
                    className="size-20 text-xl"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-xl font-bold">
                      {selectedProfile.displayName}
                    </h3>
                    <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                      <Badge variant="secondary">
                        <Award />
                        {selectedProfile.gamification.levelName} · Level{' '}
                        {selectedProfile.gamification.level}
                      </Badge>
                      <Badge variant="outline">
                        <Star />
                        {selectedProfile.gamification.totalPoints} points
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {selectedProfile.followersCount} followers ·{' '}
                      {selectedProfile.followingCount} following
                    </p>
                  </div>
                  {selectedSocialUser && (
                    <Button
                      type="button"
                      variant={
                        selectedProfile.isFollowing ? 'outline' : 'default'
                      }
                      disabled={pendingUserId === selectedProfile.id}
                      onClick={() => void toggleFollow(selectedSocialUser)}
                    >
                      {pendingUserId === selectedProfile.id ? (
                        <Loader2 className="animate-spin" />
                      ) : selectedProfile.isFollowing ? (
                        <UserCheck />
                      ) : (
                        <UserPlus />
                      )}
                      {selectedProfile.isFollowing ? 'Following' : 'Follow'}
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <ProfileChart
                    label="Quiz success"
                    value={selectedProfile.quizStats.successRate}
                    detail={`${selectedProfile.quizStats.completed} of ${selectedProfile.quizStats.total} completed`}
                    color="var(--chart-1)"
                  />
                  <ProfileChart
                    label="Simulator success"
                    value={selectedProfile.simulatorStats.successRate}
                    detail={`${selectedProfile.simulatorStats.completed} of ${selectedProfile.simulatorStats.total} completed`}
                    color="var(--chart-2)"
                  />
                  <ProfileChart
                    label="Quiz completion"
                    value={selectedProfile.quizStats.completionRate}
                    detail="Perfectly completed quizzes"
                    color="var(--chart-3)"
                  />
                  <ProfileChart
                    label="Simulator completion"
                    value={selectedProfile.simulatorStats.completionRate}
                    detail="Fully completed simulators"
                    color="var(--chart-4)"
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UsersRound className="size-5" />
                Learning network
              </DialogTitle>
              <DialogDescription>
                People you follow. Search by name to find more QA learners.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={
                  !activeQuery && activeList === 'followers'
                    ? 'secondary'
                    : 'outline'
                }
                size="sm"
                onClick={() => showList('followers')}
              >
                {data?.followersCount ?? 0} followers
              </Button>
              <Button
                type="button"
                variant={
                  !activeQuery && activeList === 'following'
                    ? 'secondary'
                    : 'outline'
                }
                size="sm"
                onClick={() => showList('following')}
              >
                {data?.followingCount ?? 0} following
              </Button>
            </div>

            <form onSubmit={searchUsers} className="flex w-full gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  className="pl-9"
                  placeholder="Search by name..."
                  aria-label="Search users by name"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>

            <div className="min-h-0 overflow-hidden">
              {loading ? (
                <div className="flex min-h-28 items-center justify-center text-sm text-muted-foreground">
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Loading users
                </div>
              ) : data?.users.length ? (
                <div className="max-h-80 divide-y overflow-y-auto overscroll-contain rounded-md border">
                  {data.users.map(user => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-3 sm:p-4"
                    >
                      <button
                        type="button"
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                        onClick={() => void loadProfile(user.id)}
                      >
                        <ProfileAvatar
                          name={user.displayName}
                          avatarUrl={user.avatarUrl}
                        />
                        <span className="min-w-0">
                          <span className="block truncate font-medium hover:underline">
                            {user.displayName}
                          </span>
                          <span className="block text-sm text-muted-foreground">
                            View profile
                          </span>
                        </span>
                      </button>
                      <Button
                        type="button"
                        variant={user.isFollowing ? 'outline' : 'default'}
                        size="sm"
                        disabled={pendingUserId === user.id}
                        onClick={() => void toggleFollow(user)}
                      >
                        {pendingUserId === user.id ? (
                          <Loader2 className="animate-spin" />
                        ) : user.isFollowing ? (
                          <UserCheck />
                        ) : (
                          <UserPlus />
                        )}
                        <span className="hidden sm:inline">
                          {user.isFollowing ? 'Following' : 'Follow'}
                        </span>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-28 items-center justify-center rounded-md border border-dashed px-4 text-center text-sm text-muted-foreground">
                  {activeQuery
                    ? 'No users matched that search.'
                    : activeList === 'followers'
                      ? 'No one follows you yet.'
                      : 'You are not following anyone yet. Search for another learner to get started.'}
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
