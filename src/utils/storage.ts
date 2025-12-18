import { storage } from '#imports';
import type { LimitsState, GameStats } from '@/types/limits';
import { DEFAULT_LIMITS, DEFAULT_STATS } from '@/types/limits';

const LIMITS_KEY = 'local:limits';
const STATS_KEY = 'local:stats';

export class LimitsStorage {
  static async getLimits(): Promise<LimitsState> {
    const limits = await storage.getItem<LimitsState>(LIMITS_KEY);
    return limits ?? DEFAULT_LIMITS;
  }

  static async setLimits(limits: LimitsState): Promise<void> {
    await storage.setItem(LIMITS_KEY, limits);
  }

  static async updateLimit(
    limitKey: keyof LimitsState,
    updates: Partial<LimitsState[keyof LimitsState]>
  ): Promise<void> {
    const limits = await this.getLimits();
    limits[limitKey] = { ...limits[limitKey], ...updates };
    await this.setLimits(limits);
  }

  static async getStats(): Promise<GameStats> {
    const stats = await storage.getItem<GameStats>(STATS_KEY);
    return stats ?? DEFAULT_STATS;
  }

  static async setStats(stats: GameStats): Promise<void> {
    await storage.setItem(STATS_KEY, stats);
  }

  static async updateStats(updates: Partial<GameStats>): Promise<void> {
    const stats = await this.getStats();
    await this.setStats({ ...stats, ...updates });
  }

  static async resetStats(): Promise<void> {
    await this.setStats(DEFAULT_STATS);
  }

  static async checkAndResetIfExpired(): Promise<boolean> {
    const stats = await this.getStats();

    // Check if 12 hours have passed since limits were exceeded or last game played
    const resetTime = stats.limitExceededAt || stats.lastGamePlayedAt;
    const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

    if (resetTime && Date.now() - resetTime >= TWELVE_HOURS_MS) {
      // Auto-reset stats after 12 hours
      await this.resetStats();
      return true; // Stats were reset
    }

    return false; // No reset needed
  }

  static async checkLimitsExceeded(): Promise<{
    exceeded: boolean;
    reasons: string[];
  }> {
    const limits = await this.getLimits();
    const stats = await this.getStats();
    const reasons: string[] = [];

    if (limits.gamesWonInARow.enabled && stats.currentWinStreak >= limits.gamesWonInARow.value) {
      reasons.push(`You've won ${stats.currentWinStreak} games in a row. Time for a break!`);
    }

    if (limits.gamesLostInARow.enabled && stats.currentLoseStreak >= limits.gamesLostInARow.value) {
      reasons.push(`You've lost ${stats.currentLoseStreak} games in a row. Time to rest!`);
    }

    if (limits.gamesPlayedInARow.enabled && stats.currentPlayStreak >= limits.gamesPlayedInARow.value) {
      reasons.push(`You've played ${stats.currentPlayStreak} games in a row. Take a break!`);
    }

    if (limits.minutesSpentPlaying.enabled && stats.sessionStartTime) {
      const minutesPlayed = (Date.now() - stats.sessionStartTime) / 1000 / 60;
      if (minutesPlayed >= limits.minutesSpentPlaying.value) {
        reasons.push(`You've been playing for ${Math.round(minutesPlayed)} minutes. Time to stop!`);
      }
    }

    return {
      exceeded: reasons.length > 0,
      reasons,
    };
  }

  static watchLimits(callback: (limits: LimitsState) => void): () => void {
    return storage.watch<LimitsState>(LIMITS_KEY, (newValue) => {
      if (newValue) {
        callback(newValue);
      }
    });
  }

  static watchStats(callback: (stats: GameStats) => void): () => void {
    return storage.watch<GameStats>(STATS_KEY, (newValue) => {
      if (newValue) {
        callback(newValue);
      }
    });
  }
}
