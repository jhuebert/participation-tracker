import { describe, expect, it } from 'vitest';
import {
  applyEffect,
  calcLeaderboardScore,
  calcParticipationPoints,
  formatLeaderboardScore,
} from '@/domain/scoring';
import { DEFAULT_SCORING } from '@/domain/defaults';
import type { StudentStats } from '@/domain/types';

const base: StudentStats = {
  picks: 4,
  correct: 2,
  incorrect: 1,
  volunteers: 1,
  skips: 0,
};

describe('applyEffect', () => {
  it('adds or subtracts points × count', () => {
    expect(applyEffect('add', 2, 3)).toBe(6);
    expect(applyEffect('subtract', 2, 3)).toBe(-6);
  });
});

describe('calcParticipationPoints', () => {
  it('matches default settings for a known student', () => {
    // +2*correct +1*vol -1*incorrect -1*skips = 4 + 1 - 1 - 0 = 4
    expect(calcParticipationPoints(base, DEFAULT_SCORING)).toBe(4);
  });

  it('respects inverted effects', () => {
    const settings = {
      ...DEFAULT_SCORING,
      correctEffect: 'subtract' as const,
      incorrectEffect: 'add' as const,
    };
    // -2*2 +1*1 +1*1 -1*0 = -4 + 1 + 1 = -2
    expect(calcParticipationPoints(base, settings)).toBe(-2);
  });
});

describe('calcLeaderboardScore', () => {
  it('returns null when picks is 0', () => {
    expect(calcLeaderboardScore({ ...base, picks: 0 }, DEFAULT_SCORING)).toBeNull();
    expect(formatLeaderboardScore(null)).toBe('—');
  });

  it('divides participation points by picks', () => {
    const score = calcLeaderboardScore(base, DEFAULT_SCORING);
    expect(score).toBeCloseTo(1);
    expect(formatLeaderboardScore(score)).toBe('1.00');
  });
});
