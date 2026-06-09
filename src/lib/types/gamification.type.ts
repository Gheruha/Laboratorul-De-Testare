export interface GamificationStatus {
  totalPoints: number;
  level: number;
  levelName: string;
}

export interface QuizAttempt {
  id: string;
  score: number;
  totalQuestions: number;
  scorePercent: number;
  pointsAwarded: number;
  createdAt: string;
}

export interface QuizProgress {
  bestScorePercent: number;
  pointsEarned: number;
  completed100: boolean;
  attemptCount: number;
}

export interface QuizAttemptResult extends GamificationStatus {
  attemptId: string;
  score: number;
  totalQuestions: number;
  scorePercent: number;
  pointsAwarded: number;
  completed100: boolean;
  correctOptionIdsByQuestion: Record<string, string[]>;
}
