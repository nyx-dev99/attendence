import { describe, expect, it } from 'vitest'
import { calcAttendanceMarks, calcAttendancePercent, classesNeededForTarget } from './attendanceMarks'

describe('calcAttendancePercent', () => {
  it('computes percent correctly', () => {
    expect(calcAttendancePercent(15, 20)).toBe(75)
    expect(calcAttendancePercent(0, 0)).toBe(0)
  })
})

describe('calcAttendanceMarks', () => {
  it('gives 0 below 67%', () => {
    expect(calcAttendanceMarks(66.9, 6)).toBe(0)
  })
  it('maps bands correctly for max 6', () => {
    expect(calcAttendanceMarks(82, 6)).toBe(4.8)
    expect(calcAttendanceMarks(85, 6)).toBe(6.0)
    expect(calcAttendanceMarks(67, 6)).toBe(1.2)
  })
  it('maps bands correctly for max 5 and 2', () => {
    expect(calcAttendanceMarks(90, 5)).toBe(5)
    expect(calcAttendanceMarks(72, 2)).toBe(0.8)
  })
})

describe('classesNeededForTarget', () => {
  it('returns 0 when already at target', () => {
    expect(classesNeededForTarget(75, 100)).toBe(0)
  })
  it('computes classes needed to reach 75%', () => {
    expect(classesNeededForTarget(10, 20)).toBe(20)
  })
})
