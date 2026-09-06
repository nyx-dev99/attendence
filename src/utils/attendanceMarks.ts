import type { CourseCategory } from '../types'

export const MAX_MARKS_BY_CATEGORY: Record<CourseCategory, 6 | 5 | 2> = {
  DSC_MAIN_6: 6,
  DSC_MAIN_5: 5,
  SEC_2: 2,
  GE_5: 5,
}

// percentage -> marks table, keyed by max marks
const MARKS_TABLE: Record<number, { min: number; marks: number }[]> = {
  6: [
    { min: 85, marks: 6.0 },
    { min: 80, marks: 4.8 },
    { min: 75, marks: 3.6 },
    { min: 70, marks: 2.4 },
    { min: 67, marks: 1.2 },
  ],
  5: [
    { min: 85, marks: 5 },
    { min: 80, marks: 4 },
    { min: 75, marks: 3 },
    { min: 70, marks: 2 },
    { min: 67, marks: 1 },
  ],
  2: [
    { min: 85, marks: 2 },
    { min: 80, marks: 1.6 },
    { min: 75, marks: 1.2 },
    { min: 70, marks: 0.8 },
    { min: 67, marks: 0.4 },
  ],
}

/** Calculate attendance percentage from present/total classes. */
export function calcAttendancePercent(present: number, total: number): number {
  if (total <= 0) return 0
  return (present / total) * 100
}

/** Calculate attendance marks awarded for a given percentage + max marks bucket. */
export function calcAttendanceMarks(percent: number, maxMarks: 6 | 5 | 2): number {
  if (percent < 67) return 0
  const table = MARKS_TABLE[maxMarks]
  for (const row of table) {
    if (percent >= row.min) return row.marks
  }
  return 0
}

/** Classes needed to reach a target percentage (default 75%). Returns 0 if already there. */
export function classesNeededForTarget(
  present: number,
  total: number,
  target = 0.75
): number {
  const needed = Math.ceil((target * total - present) / (1 - target))
  return Math.max(0, needed)
}

export function isShortage(percent: number): boolean {
  return percent < 67
}

export function formatMarksLabel(percent: number, marks: number, maxMarks: number): string {
  return `${percent.toFixed(0)}% → ${marks} / ${maxMarks} attendance marks`
}
