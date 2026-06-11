import type { GamificationStatus, QuizAttempt } from './gamification.type';
import type { SimulatorVerdict } from './simulator.type';

export interface StreakStatus {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  activeDates: string[];
}

export interface AccountQuizAttempt extends QuizAttempt {
  quizId: string;
  quizTitle: string;
  passed: boolean;
}

export interface AccountSimulatorSubmission {
  id: string;
  scenarioId: string;
  scenarioTitle: string;
  report: string;
  verdict: SimulatorVerdict;
  createdAt: string;
}

export interface AccountDashboardData {
  profile: {
    email: string;
    displayName: string;
    avatarUrl: string | null;
  };
  gamification: GamificationStatus;
  streak: StreakStatus;
  quizStats: {
    attempts: number;
    passed: number;
    successRate: number;
    perfectQuizzes: number;
    totalQuizzes: number;
    completionRate: number;
  };
  simulatorStats: {
    submissions: number;
    correct: number;
    successRate: number;
    solvedDefects: number;
    completedSimulators: number;
    totalSimulators: number;
    completionRate: number;
  };
  quizHistory: AccountQuizAttempt[];
  simulatorHistory: AccountSimulatorSubmission[];
}
