export type Effect = 'add' | 'subtract';
export type WeightDir = 'increase' | 'decrease';
export type AppMode = 'teacher' | 'student' | 'split';
export type AppRoute = 'picker' | 'leaderboard' | 'manage';

export interface StudentStats {
  picks: number;
  correct: number;
  incorrect: number;
  volunteers: number;
  skips: number;
}

export interface ClassData {
  students: Record<string, StudentStats>;
}

export type ClassesMap = Record<string, ClassData>;

export interface ScoringSettings {
  correctPoints: number;
  correctEffect: Effect;
  incorrectPoints: number;
  incorrectEffect: Effect;
  volunteerPoints: number;
  volunteerEffect: Effect;
  skipPoints: number;
  skipEffect: Effect;
}

export interface WeightSettings {
  enabled: boolean;
  volunteerAmt: number;
  volunteerDir: WeightDir;
  correctAmt: number;
  correctDir: WeightDir;
  incorrectAmt: number;
  incorrectDir: WeightDir;
  skipAmt: number;
  skipDir: WeightDir;
}

export interface ClassSessionState {
  present: string[];
  sessionSkips: Record<string, number>;
  lastPicked?: string;
}

export type SessionMap = Record<string, ClassSessionState>;

export interface ExportFile {
  app: 'Participation Tracker';
  date: string;
  data: ClassesMap;
}

export type BroadcastMessage =
  | {
      type: 'studentSelected';
      name: string;
      isVolunteer: boolean;
      isTeacherPick?: boolean;
    }
  | { type: 'studentCleared' };

export interface StudentDisplay {
  name: string | null;
  isVolunteer: boolean;
}
