import { useRef, useState } from 'preact/hooks';
import { parseStudentLines } from '@/domain/class-roster';
import {
  downloadTextFile,
  parseImportPayload,
  serializeExport,
} from '@/domain/import-export';
import {
  addStudentToClass,
  createClass,
  deleteClass,
  removeStudentFromClass,
  renameClass,
  renameStudentInClass,
  replaceAllClasses,
} from '@/state/actions';
import { classes } from '@/state/store';
import { confirm, toast } from '@/state/ui';
import { Button } from '@/ui/Button';
import { Modal } from '@/ui/Modal';
import styles from './ManageView.module.css';

export function ManageView() {
  const [className, setClassName] = useState('');
  const [studentsText, setStudentsText] = useState('');
  const [editTarget, setEditTarget] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [newStudent, setNewStudent] = useState('');
  const [studentRenames, setStudentRenames] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const classList = Object.keys(classes.value).sort((a, b) => a.localeCompare(b));

  const onCreate = () => {
    try {
      const names = parseStudentLines(studentsText);
      createClass(className, names);
      setClassName('');
      setStudentsText('');
      toast('Class created!', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not create class', 'error');
    }
  };

  const onDelete = async (name: string) => {
    const ok = await confirm({
      title: 'Delete class?',
      body: `Delete "${name}" and all of its stats?`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;
    deleteClass(name);
    if (editTarget === name) setEditTarget(null);
    toast('Class deleted', 'success');
  };

  const openEdit = (name: string) => {
    setEditTarget(name);
    setRenameValue(name);
    setNewStudent('');
    setStudentRenames({});
  };

  const onSaveRename = () => {
    if (!editTarget) return;
    try {
      if (renameValue.trim() !== editTarget) {
        renameClass(editTarget, renameValue);
        setEditTarget(renameValue.trim());
      }
      toast('Class updated', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Rename failed', 'error');
    }
  };

  const onAddStudent = () => {
    if (!editTarget) return;
    try {
      addStudentToClass(editTarget, newStudent);
      setNewStudent('');
      toast('Student added', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not add student', 'error');
    }
  };

  const onRenameStudent = (from: string) => {
    if (!editTarget) return;
    const to = (studentRenames[from] ?? from).trim();
    if (to === from) return;
    try {
      renameStudentInClass(editTarget, from, to);
      setStudentRenames((m) => {
        const next = { ...m };
        delete next[from];
        return next;
      });
      toast('Student renamed', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Rename failed', 'error');
    }
  };

  const onRemoveStudent = async (student: string) => {
    if (!editTarget) return;
    const ok = await confirm({
      title: 'Remove student?',
      body: `Remove "${student}" from ${editTarget}? Stats will be lost.`,
      confirmLabel: 'Remove',
      danger: true,
    });
    if (!ok) return;
    removeStudentFromClass(editTarget, student);
    toast('Student removed', 'success');
  };

  const onExport = () => {
    if (Object.keys(classes.value).length === 0) {
      toast('No data to export', 'error');
      return;
    }
    downloadTextFile(
      'ParticipationTracker_Backup.json',
      serializeExport(classes.value),
      'application/json',
    );
    toast('Data exported!', 'success');
  };

  const onImportFile = async (file: File) => {
    try {
      const text = await file.text();
      const data = parseImportPayload(text);
      const ok = await confirm({
        title: 'Import data?',
        body: 'Replace all current data with imported data?',
        confirmLabel: 'Replace',
        danger: true,
      });
      if (!ok) return;
      replaceAllClasses(data);
      toast('Data imported!', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Error reading file', 'error');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const editClass = editTarget ? classes.value[editTarget] : null;
  const editStudents = editClass
    ? Object.keys(editClass.students).sort((a, b) => a.localeCompare(b))
    : [];

  return (
    <div class={styles.view}>
      <section class={styles.card}>
        <h2 class={styles.h2}>Create class</h2>
        <label class={styles.field}>
          Class name
          <input
            value={className}
            onInput={(e) => setClassName((e.currentTarget as HTMLInputElement).value)}
            placeholder="e.g. Period 1"
          />
        </label>
        <label class={styles.field}>
          Student names (one per line)
          <textarea
            rows={6}
            value={studentsText}
            onInput={(e) => setStudentsText((e.currentTarget as HTMLTextAreaElement).value)}
            placeholder={'Alice\nBob\nCara'}
          />
        </label>
        <Button variant="primary" onClick={onCreate}>
          Create class
        </Button>
      </section>

      <section class={styles.card}>
        <h2 class={styles.h2}>Classes</h2>
        {classList.length === 0 && <p class={styles.muted}>No classes yet.</p>}
        <ul class={styles.list}>
          {classList.map((name) => {
            const count = Object.keys(classes.value[name].students).length;
            return (
              <li key={name} class={styles.row}>
                <div>
                  <strong>{name}</strong>
                  <span class={styles.muted}> · {count} students</span>
                </div>
                <div class={styles.rowActions}>
                  <Button variant="secondary" size="sm" onClick={() => openEdit(name)}>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => onDelete(name)}>
                    Delete
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section class={styles.card}>
        <h2 class={styles.h2}>Backup</h2>
        <p class={styles.muted}>Export or import a Participation Tracker JSON backup.</p>
        <div class={styles.rowActions}>
          <Button variant="primary" onClick={onExport}>
            📤 Export data
          </Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            📥 Import data
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,.txt,application/json"
            class={styles.hidden}
            onChange={(e) => {
              const f = (e.currentTarget as HTMLInputElement).files?.[0];
              if (f) void onImportFile(f);
            }}
          />
        </div>
      </section>

      <Modal
        open={!!editTarget && !!editClass}
        title={editTarget ? `Edit ${editTarget}` : 'Edit class'}
        onClose={() => setEditTarget(null)}
        wide
      >
        {editTarget && editClass && (
          <div class={styles.edit}>
            <label class={styles.field}>
              Class name
              <div class={styles.inline}>
                <input
                  value={renameValue}
                  onInput={(e) => setRenameValue((e.currentTarget as HTMLInputElement).value)}
                />
                <Button variant="secondary" size="sm" onClick={onSaveRename}>
                  Rename
                </Button>
              </div>
            </label>

            <h3 class={styles.h3}>Students</h3>
            <ul class={styles.studentList}>
              {editStudents.map((student) => (
                <li key={student} class={styles.studentRow}>
                  <input
                    value={studentRenames[student] ?? student}
                    onInput={(e) =>
                      setStudentRenames((m) => ({
                        ...m,
                        [student]: (e.currentTarget as HTMLInputElement).value,
                      }))
                    }
                  />
                  <Button variant="ghost" size="sm" onClick={() => onRenameStudent(student)}>
                    Save
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => onRemoveStudent(student)}>
                    Remove
                  </Button>
                </li>
              ))}
            </ul>

            <label class={styles.field}>
              Add student
              <div class={styles.inline}>
                <input
                  value={newStudent}
                  placeholder="Student name"
                  aria-label="New student name"
                  onInput={(e) => setNewStudent((e.currentTarget as HTMLInputElement).value)}
                />
                <Button variant="primary" size="sm" onClick={onAddStudent}>
                  Add
                </Button>
              </div>
            </label>
          </div>
        )}
      </Modal>
    </div>
  );
}
