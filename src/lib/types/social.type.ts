export interface SocialUser {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  isFollowing: boolean;
}

export interface SocialDirectoryData {
  followersCount: number;
  followingCount: number;
  users: SocialUser[];
}

export interface PublicSocialProfile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
  gamification: {
    totalPoints: number;
    level: number;
    levelName: string;
  };
  quizStats: {
    successRate: number;
    completed: number;
    total: number;
    completionRate: number;
  };
  simulatorStats: {
    successRate: number;
    completed: number;
    total: number;
    completionRate: number;
  };
}
