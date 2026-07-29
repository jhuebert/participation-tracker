import { emptyStudentStats } from '@/domain/defaults';
import type { ClassData, ClassesMap, StudentStats } from '@/domain/types';

export function parseStudentLines(text: string): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const line of text.split('\n')) {
    const name = line.trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    names.push(name);
  }
  return names;
}

export function createClass(
  classes: ClassesMap,
  name: string,
  studentNames: string[],
): ClassesMap {
  const trimmed = name.trim();
  if (!trimmed) throw new Error('Class name is required');
  if (classes[trimmed]) throw new Error('Class exists');
  if (studentNames.length === 0) throw new Error('Add at least one student');

  const students: Record<string, StudentStats> = {};
  for (const s of studentNames) {
    students[s] = emptyStudentStats();
  }

  return {
    ...classes,
    [trimmed]: { students },
  };
}

export function deleteClass(classes: ClassesMap, name: string): ClassesMap {
  if (!classes[name]) return classes;
  const next = { ...classes };
  delete next[name];
  return next;
}

export function renameClass(classes: ClassesMap, from: string, to: string): ClassesMap {
  const nextName = to.trim();
  if (!classes[from]) throw new Error('Class not found');
  if (!nextName) throw new Error('Class name is required');
  if (nextName !== from && classes[nextName]) throw new Error('Class exists');

  if (nextName === from) return classes;

  const next: ClassesMap = {};
  for (const [key, value] of Object.entries(classes)) {
    next[key === from ? nextName : key] = value;
  }
  return next;
}

export function addStudent(classData: ClassData, studentName: string): ClassData {
  const name = studentName.trim();
  if (!name) throw new Error('Student name is required');
  if (classData.students[name]) throw new Error('Student exists');
  return {
    students: {
      ...classData.students,
      [name]: emptyStudentStats(),
    },
  };
}

export function removeStudent(classData: ClassData, studentName: string): ClassData {
  if (!classData.students[studentName]) return classData;
  const students = { ...classData.students };
  delete students[studentName];
  return { students };
}

export function renameStudent(
  classData: ClassData,
  from: string,
  to: string,
): ClassData {
  const nextName = to.trim();
  if (!classData.students[from]) throw new Error('Student not found');
  if (!nextName) throw new Error('Student name is required');
  if (nextName !== from && classData.students[nextName]) throw new Error('Student exists');
  if (nextName === from) return classData;

  const students: Record<string, StudentStats> = {};
  for (const [key, value] of Object.entries(classData.students)) {
    students[key === from ? nextName : key] = value;
  }
  return { students };
}

export function resetClassStats(classData: ClassData): ClassData {
  const students: Record<string, StudentStats> = {};
  for (const name of Object.keys(classData.students)) {
    students[name] = emptyStudentStats();
  }
  return { students };
}

export function normalizeStudentStats(raw: Partial<StudentStats> | undefined): StudentStats {
  return {
    picks: Number(raw?.picks) || 0,
    correct: Number(raw?.correct) || 0,
    incorrect: Number(raw?.incorrect) || 0,
    volunteers: Number(raw?.volunteers) || 0,
    skips: Number(raw?.skips) || 0,
  };
}

export function normalizeClasses(raw: unknown): ClassesMap {
  if (!raw || typeof raw !== 'object') return {};
  const result: ClassesMap = {};
  for (const [className, classVal] of Object.entries(raw as Record<string, unknown>)) {
    if (!classVal || typeof classVal !== 'object') continue;
    const studentsRaw = (classVal as { students?: unknown }).students;
    if (!studentsRaw || typeof studentsRaw !== 'object') {
      result[className] = { students: {} };
      continue;
    }
    const students: Record<string, StudentStats> = {};
    for (const [studentName, stats] of Object.entries(studentsRaw as Record<string, unknown>)) {
      students[studentName] = normalizeStudentStats(stats as Partial<StudentStats>);
    }
    result[className] = { students };
  }
  return result;
}
