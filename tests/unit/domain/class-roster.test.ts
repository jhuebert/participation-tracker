import { describe, expect, it } from 'vitest';
import {
  addStudent,
  createClass,
  normalizeClasses,
  parseStudentLines,
  renameClass,
  renameStudent,
} from '@/domain/class-roster';

describe('parseStudentLines', () => {
  it('trims, drops empties, and de-dupes', () => {
    expect(parseStudentLines(' Alice \n\nBob\nAlice\n Cara ')).toEqual([
      'Alice',
      'Bob',
      'Cara',
    ]);
  });
});

describe('createClass', () => {
  it('creates a class with empty stats', () => {
    const classes = createClass({}, 'Period 1', ['Alice', 'Bob']);
    expect(Object.keys(classes['Period 1'].students)).toEqual(['Alice', 'Bob']);
    expect(classes['Period 1'].students.Alice.picks).toBe(0);
  });

  it('rejects duplicates and empty rosters', () => {
    const classes = createClass({}, 'P1', ['A']);
    expect(() => createClass(classes, 'P1', ['B'])).toThrow(/exists/i);
    expect(() => createClass({}, 'P2', [])).toThrow(/student/i);
  });
});

describe('renameClass / renameStudent', () => {
  it('renames class and preserves stats', () => {
    let classes = createClass({}, 'Old', ['Alice']);
    classes = {
      ...classes,
      Old: {
        students: {
          Alice: { picks: 3, correct: 1, incorrect: 0, volunteers: 0, skips: 0 },
        },
      },
    };
    classes = renameClass(classes, 'Old', 'New');
    expect(classes.New.students.Alice.picks).toBe(3);
    expect(classes.Old).toBeUndefined();
  });

  it('renames student and preserves stats', () => {
    const data = {
      students: {
        Alice: { picks: 2, correct: 1, incorrect: 0, volunteers: 1, skips: 0 },
      },
    };
    const next = renameStudent(data, 'Alice', 'Alicia');
    expect(next.students.Alicia.picks).toBe(2);
    expect(next.students.Alice).toBeUndefined();
  });

  it('adds student', () => {
    const data = addStudent({ students: {} }, 'Bob');
    expect(data.students.Bob.correct).toBe(0);
  });
});

describe('normalizeClasses', () => {
  it('fills missing stat fields from legacy data', () => {
    const normalized = normalizeClasses({
      P1: { students: { Amy: { picks: 2, correct: 1 } } },
    });
    expect(normalized.P1.students.Amy).toEqual({
      picks: 2,
      correct: 1,
      incorrect: 0,
      volunteers: 0,
      skips: 0,
    });
  });
});
