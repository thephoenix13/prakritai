import { Grade, gradeConfig } from '../tokens';

export function scoreToGrade(score: number): Grade {
  if (score >= 80) return 'A';
  if (score >= 60) return 'B';
  if (score >= 40) return 'C';
  return 'D';
}

export function getGradeStyle(grade: Grade) {
  return gradeConfig[grade];
}
