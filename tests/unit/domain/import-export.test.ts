import { describe, expect, it } from 'vitest';
import {
  buildCsv,
  buildExportPayload,
  buildLeaderboardRows,
  parseImportPayload,
  serializeExport,
} from '@/domain/import-export';
import { DEFAULT_SCORING } from '@/domain/defaults';
import type { ClassesMap } from '@/domain/types';

const sample: ClassesMap = {
  'Period 1': {
    students: {
      Alice: { picks: 4, correct: 2, incorrect: 1, volunteers: 1, skips: 0 },
      Bob: { picks: 0, correct: 0, incorrect: 0, volunteers: 0, skips: 0 },
    },
  },
};

describe('export/import', () => {
  it('round-trips classes via export JSON', () => {
    const json = serializeExport(sample, new Date('2024-01-01T00:00:00'));
    const payload = buildExportPayload(sample);
    expect(payload.app).toBe('Participation Tracker');
    expect(parseImportPayload(json)).toEqual(sample);
  });

  it('rejects invalid export files', () => {
    expect(() => parseImportPayload('{')).toThrow(/json/i);
    expect(() => parseImportPayload(JSON.stringify({ app: 'Other', data: {} }))).toThrow(
      /invalid/i,
    );
  });

  it('accepts bare classes map', () => {
    expect(parseImportPayload(JSON.stringify(sample))['Period 1'].students.Alice.picks).toBe(4);
  });
});

describe('CSV / leaderboard rows', () => {
  it('sorts by score and formats CSV', () => {
    const rows = buildLeaderboardRows(sample['Period 1'].students, DEFAULT_SCORING);
    expect(rows[0].name).toBe('Alice');
    expect(rows[0].leaderboardScore).toBeCloseTo(1);
    expect(rows[1].name).toBe('Bob');
    expect(rows[1].leaderboardScore).toBeNull();

    const csv = buildCsv(rows);
    expect(csv).toContain('Rank,Name,Picks');
    expect(csv).toContain('"Alice"');
    expect(csv).toContain(',1.00\n');
  });
});
