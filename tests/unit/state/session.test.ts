import { describe, expect, it } from 'vitest';
import {
  ensureSession,
  freshSessionForClass,
  resetSessionSkips,
  setAllPresent,
  togglePresent,
} from '@/state/session';

describe('session helpers', () => {
  it('fresh session marks everyone present', () => {
    const s = freshSessionForClass(['Bob', 'Alice']);
    expect(s.present).toEqual(['Alice', 'Bob']);
    expect(s.sessionSkips).toEqual({});
    expect(s.lastPicked).toBeUndefined();
  });

  it('ensureSession drops removed students', () => {
    const s = ensureSession(
      {
        P1: {
          present: ['Alice', 'Gone'],
          sessionSkips: { Alice: 1, Gone: 2 },
          lastPicked: 'Gone',
        },
      },
      'P1',
      ['Alice', 'Bob'],
    );
    expect(s.present).toEqual(['Alice']);
    expect(s.sessionSkips).toEqual({ Alice: 1 });
    expect(s.lastPicked).toBeUndefined();
  });

  it('toggles and bulk present', () => {
    let s = freshSessionForClass(['A', 'B']);
    s = togglePresent(s, 'A', false);
    expect(s.present).toEqual(['B']);
    s = setAllPresent(s, ['A', 'B'], true);
    expect(s.present).toEqual(['A', 'B']);
    s = resetSessionSkips({ ...s, sessionSkips: { A: 2 } });
    expect(s.sessionSkips).toEqual({});
  });
});
