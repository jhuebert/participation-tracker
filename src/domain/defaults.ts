import type { ScoringSettings, StudentStats, WeightSettings } from '@/domain/types';

export const DEFAULT_SCORING: ScoringSettings = {
  correctPoints: 2,
  correctEffect: 'add',
  incorrectPoints: 1,
  incorrectEffect: 'subtract',
  volunteerPoints: 1,
  volunteerEffect: 'add',
  skipPoints: 1,
  skipEffect: 'subtract',
};

export const DEFAULT_WEIGHTS: WeightSettings = {
  enabled: true,
  volunteerAmt: 30,
  volunteerDir: 'decrease',
  correctAmt: 15,
  correctDir: 'decrease',
  incorrectAmt: 10,
  incorrectDir: 'increase',
  skipAmt: 20,
  skipDir: 'increase',
};

export const DEFAULT_SKIP_LIMIT = 3;

export function emptyStudentStats(): StudentStats {
  return {
    picks: 0,
    correct: 0,
    incorrect: 0,
    volunteers: 0,
    skips: 0,
  };
}
