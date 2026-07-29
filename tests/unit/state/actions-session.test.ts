import { beforeEach, describe, expect, it } from 'vitest';
import { startNewSession, selectClass, setPresent, markSkip, teacherPick } from '@/state/actions';
import {
  classes,
  currentStudent,
  currentIsVolunteer,
  sessions,
  skipLimit,
} from '@/state/store';

describe('startNewSession', () => {
  beforeEach(() => {
    classes.value = {
      P1: {
        students: {
          Alice: { picks: 5, correct: 2, incorrect: 1, volunteers: 1, skips: 3 },
          Bob: { picks: 2, correct: 1, incorrect: 0, volunteers: 0, skips: 0 },
        },
      },
    };
    sessions.value = {};
    currentStudent.value = null;
    currentIsVolunteer.value = false;
    skipLimit.value = 3;
    selectClass('P1');
  });

  it('marks everyone present, clears skips and lastPicked, keeps lifetime stats', () => {
    setPresent('Bob', false);
    teacherPick('Alice');
    // use a skip so session counter increments
    markSkip();
    expect(sessions.value.P1.present).not.toContain('Bob');
    expect(sessions.value.P1.lastPicked).toBe('Alice');
    expect(sessions.value.P1.sessionSkips.Alice).toBe(1);
    expect(classes.value.P1.students.Alice.picks).toBe(6);
    expect(classes.value.P1.students.Alice.skips).toBe(4);

    currentStudent.value = 'Alice';
    currentIsVolunteer.value = true;

    startNewSession();

    expect(sessions.value.P1.present.sort()).toEqual(['Alice', 'Bob']);
    expect(sessions.value.P1.sessionSkips).toEqual({});
    expect(sessions.value.P1.lastPicked).toBeUndefined();
    expect(currentStudent.value).toBeNull();
    expect(currentIsVolunteer.value).toBe(false);
    // lifetime unchanged by startNewSession itself (pick/skip already applied above)
    expect(classes.value.P1.students.Alice.picks).toBe(6);
    expect(classes.value.P1.students.Alice.correct).toBe(2);
    expect(classes.value.P1.students.Alice.skips).toBe(4);
  });
});
