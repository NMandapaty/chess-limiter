export interface LimitConfig {
  enabled: boolean;
  value: number;
}

export interface LimitsState {
  gamesWonInARow: LimitConfig;
  gamesLostInARow: LimitConfig;
  gamesPlayedInARow: LimitConfig;
  minutesSpentPlaying: LimitConfig;
}

export interface GameStats {
  currentWinStreak: number;
  currentLoseStreak: number;
  currentPlayStreak: number;
  sessionStartTime: number | null;
  lastGameResult: "win" | "loss" | "draw" | null;
  limitExceededAt: number | null; // timestamp when limits were first exceeded
  lastGamePlayedAt: number | null; // timestamp of the last game played
}

export const DEFAULT_LIMITS: LimitsState = {
  gamesWonInARow: {
    enabled: false,
    value: 5,
  },
  gamesLostInARow: {
    enabled: false,
    value: 3,
  },
  gamesPlayedInARow: {
    enabled: false,
    value: 10,
  },
  minutesSpentPlaying: {
    enabled: false,
    value: 30,
  },
};

export const DEFAULT_STATS: GameStats = {
  currentWinStreak: 0,
  currentLoseStreak: 0,
  currentPlayStreak: 0,
  sessionStartTime: null,
  lastGameResult: null,
  limitExceededAt: null,
  lastGamePlayedAt: null,
};
