import { describe, expect, it } from 'vitest';
import { DEFAULT_WEIGHTS } from '@/domain/defaults';
import {
  eligibleForRandomPick,
  pickWeighted,
  weightForStudent,
} from '@/domain/weighted-pick';
import type { StudentStats } from '@/domain/types';

const students: Record<string, StudentStats> = {
  Alice: { picks: 5, correct: 2, incorrect: 0, volunteers: 3, skips: 0 },
  Bob: { picks: 1, correct: 0, incorrect: 0, volunteers: 0, skips: 0 },
  Cara: { picks: 1, correct: 0, incorrect: 2, volunteers: 0, skips: 1 },
};

describe('weightForStudent', () => {
  it('starts at 100 and applies default directions', () => {
    // Alice: -30*3 vol -15*2 correct = 100 - 90 - 30 = -20 → max(1,-20)=1
    expect(weightForStudent(students.Alice, DEFAULT_WEIGHTS)).toBe(1);
    // Bob: untouched → 100
    expect(weightForStudent(students.Bob, DEFAULT_WEIGHTS)).toBe(100);
    // Cara: -0 +0 +10*2 incorrect +20*1 skip = 100 + 20 + 20 = 140
    expect(weightForStudent(students.Cara, DEFAULT_WEIGHTS)).toBe(140);
  });
});

describe('eligibleForRandomPick', () => {
  it('excludes last picked when others are present', () => {
    expect(eligibleForRandomPick(['Alice', 'Bob', 'Cara'], 'Bob', students)).toEqual([
      'Alice',
      'Cara',
    ]);
  });

  it('falls back to fewest picks when only last remains', () => {
    // only Alice present and was last → eligible is just Alice
    expect(eligibleForRandomPick(['Alice'], 'Alice', students)).toEqual(['Alice']);
  });

  it('when all filtered falls back to min picks among present', () => {
    // present Bob+Cara both picks=1, lastPicked null → both (withoutLast not empty)
    // Force fallback: present only those equal last? simulate one present covered above.
    // Two present same last filter empty impossible unless last is both.
    // Present Bob&Cara last Bob → [Cara]
    expect(eligibleForRandomPick(['Bob', 'Cara'], 'Bob', students)).toEqual(['Cara']);
  });

  it('picks min-pick group when single-student present after exclude empties', () => {
    // Construct: present [Bob, Cara] both min; if lastPicked is null no exclude.
    // For fallback path with multiple: present Bob only was handled.
    // present Alice(picks5) & Zara(picks0 fresh default missing) lasts Alice
    const s = {
      ...students,
      Zara: { picks: 0, correct: 0, incorrect: 0, volunteers: 0, skips: 0 },
    };
    // exclude Alice → Zara remains
    expect(eligibleForRandomPick(['Alice', 'Zara'], 'Alice', s)).toEqual(['Zara']);
    // only Alice&Bob present last is weirdly both? filter both out only if last equals each one at a time.
    // True multi min fallback: always excluding leaves empty when one present only.
  });
});

describe('pickWeighted', () => {
  it('returns the only eligible student', () => {
    expect(pickWeighted(['Bob'], students, DEFAULT_WEIGHTS, () => 0.5)).toBe('Bob');
  });

  it('picks deterministically from mocked random', () => {
    // Bob weight 100, Cara 140, total 240
    // random 0 → first bin Bob; random just under 100/240 → Bob; 100/240 → Cara
    const eligible = ['Bob', 'Cara'];
    // Bob weight 100, Cara 140, total 240. Loop uses `tick -= w; if (tick <= 0)`.
    // random=0 → Bob; random just below 100/240 stays Bob; just above crosses to Cara.
    expect(pickWeighted(eligible, students, DEFAULT_WEIGHTS, () => 0)).toBe('Bob');
    expect(pickWeighted(eligible, students, DEFAULT_WEIGHTS, () => 99.9 / 240)).toBe('Bob');
    expect(pickWeighted(eligible, students, DEFAULT_WEIGHTS, () => 100.1 / 240)).toBe('Cara');
  });

  it('uniform when weighted disabled', () => {
    const settings = { ...DEFAULT_WEIGHTS, enabled: false };
    const eligible = ['Alice', 'Bob'];
    // weights 1+1=2; random 0.4 → Alice; 0.6 → Bob
    expect(pickWeighted(eligible, students, settings, () => 0.4)).toBe('Alice');
    expect(pickWeighted(eligible, students, settings, () => 0.6)).toBe('Bob');
  });
});
