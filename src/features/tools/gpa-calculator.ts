// GPA & CGPA Calculator Core Engine
// Supports 4.0, 4.3, 5.0, Percentage scales, Weighted Honors/AP, Cumulative CGPA & Target GPA Forecaster

export type GPAScaleType = "4.0" | "4.3" | "5.0" | "100" | "uk";
export type CourseWeight = "regular" | "honors" | "ap_ib" | "college";

export interface CourseEntry {
  id: string;
  name: string;
  grade: string;
  credits: number;
  weight?: CourseWeight;
}

export interface SemesterEntry {
  id: string;
  name: string;
  courses: CourseEntry[];
}

export interface GPAResult {
  gpa: number;
  unweightedGpa: number;
  totalCredits: number;
  totalQualityPoints: number;
  scale: GPAScaleType;
  academicStanding: string;
  latinHonors?: string;
}

export interface TargetGPARequirement {
  targetGpa: number;
  currentGpa: number;
  completedCredits: number;
  remainingCredits: number;
  requiredGpa: number;
  isAttainable: boolean;
  message: string;
}

export const GRADE_SCALES_DATA: Record<string, Record<string, number>> = {
  "4.0": {
    "A+": 4.0, "A": 4.0, "A-": 3.7,
    "B+": 3.3, "B": 3.0, "B-": 2.7,
    "C+": 2.3, "C": 2.0, "C-": 1.7,
    "D+": 1.3, "D": 1.0, "D-": 0.7,
    "F": 0.0,
  },
  "4.3": {
    "A+": 4.3, "A": 4.0, "A-": 3.7,
    "B+": 3.3, "B": 3.0, "B-": 2.7,
    "C+": 2.3, "C": 2.0, "C-": 1.7,
    "D+": 1.3, "D": 1.0, "D-": 0.7,
    "F": 0.0,
  },
  "5.0": {
    "A+": 5.0, "A": 4.5, "A-": 4.0,
    "B+": 3.5, "B": 3.0, "B-": 2.5,
    "C+": 2.0, "C": 1.5, "C-": 1.0,
    "D+": 0.5, "D": 0.0, "D-": 0.0,
    "F": 0.0,
  },
  "100": {
    "A+": 98, "A": 94, "A-": 91,
    "B+": 88, "B": 84, "B-": 81,
    "C+": 78, "C": 74, "C-": 71,
    "D+": 68, "D": 64, "D-": 61,
    "F": 50,
  },
  "uk": {
    "First Class (1st)": 4.0,
    "Upper Second (2:1)": 3.3,
    "Lower Second (2:2)": 2.7,
    "Third Class (3rd)": 2.0,
    "Fail": 0.0,
  },
};

export const WEIGHT_BONUS: Record<CourseWeight, number> = {
  regular: 0.0,
  honors: 0.5,
  ap_ib: 1.0,
  college: 1.0,
};

/**
 * Calculates GPA for a set of courses
 */
export function calculateCoursesGPA(courses: CourseEntry[], scale: GPAScaleType = "4.0"): GPAResult {
  const scaleTable = GRADE_SCALES_DATA[scale] || GRADE_SCALES_DATA["4.0"];
  let totalCredits = 0;
  let totalPoints = 0;
  let unweightedPoints = 0;

  for (const course of courses) {
    const cred = Number(course.credits);
    if (isNaN(cred) || cred <= 0) continue;

    const basePoint = scaleTable[course.grade];
    if (basePoint === undefined) continue;

    const bonus = scale === "100" || scale === "uk" ? 0 : WEIGHT_BONUS[course.weight || "regular"];
    const weightedPoint = basePoint + (basePoint > 0 ? bonus : 0);

    totalCredits += cred;
    totalPoints += weightedPoint * cred;
    unweightedPoints += basePoint * cred;
  }

  if (totalCredits === 0) {
    return {
      gpa: 0,
      unweightedGpa: 0,
      totalCredits: 0,
      totalQualityPoints: 0,
      scale,
      academicStanding: "No Courses Recorded",
    };
  }

  const gpa = Math.round((totalPoints / totalCredits) * 100) / 100;
  const unweightedGpa = Math.round((unweightedPoints / totalCredits) * 100) / 100;

  return {
    gpa,
    unweightedGpa,
    totalCredits,
    totalQualityPoints: Math.round(totalPoints * 100) / 100,
    scale,
    academicStanding: getAcademicStanding(gpa, scale),
    latinHonors: getLatinHonors(gpa, scale),
  };
}

/**
 * Calculates Cumulative GPA (CGPA) from prior history + current courses
 */
export function calculateCumulativeCGPA(
  priorCredits: number,
  priorGPA: number,
  currentCourses: CourseEntry[],
  scale: GPAScaleType = "4.0"
): GPAResult {
  const currentResult = calculateCoursesGPA(currentCourses, scale);
  const priorPoints = priorCredits * priorGPA;
  const combinedCredits = priorCredits + currentResult.totalCredits;

  if (combinedCredits === 0) {
    return currentResult;
  }

  const combinedPoints = priorPoints + currentResult.totalQualityPoints;
  const cgpa = Math.round((combinedPoints / combinedCredits) * 100) / 100;

  return {
    gpa: cgpa,
    unweightedGpa: currentResult.unweightedGpa,
    totalCredits: combinedCredits,
    totalQualityPoints: Math.round(combinedPoints * 100) / 100,
    scale,
    academicStanding: getAcademicStanding(cgpa, scale),
    latinHonors: getLatinHonors(cgpa, scale),
  };
}

/**
 * Calculates required GPA in remaining credits to achieve a target GPA
 */
export function forecastTargetGPA(
  currentGpa: number,
  completedCredits: number,
  targetGpa: number,
  remainingCredits: number,
  scale: GPAScaleType = "4.0"
): TargetGPARequirement {
  const maxPossible = scale === "5.0" ? 5.0 : scale === "4.3" ? 4.3 : scale === "100" ? 100 : 4.0;

  if (remainingCredits <= 0) {
    return {
      targetGpa,
      currentGpa,
      completedCredits,
      remainingCredits,
      requiredGpa: 0,
      isAttainable: currentGpa >= targetGpa,
      message: currentGpa >= targetGpa ? "Target already met!" : "Need remaining credits to raise GPA.",
    };
  }

  const currentPoints = currentGpa * completedCredits;
  const totalTargetCredits = completedCredits + remainingCredits;
  const targetTotalPoints = targetGpa * totalTargetCredits;
  const neededPoints = targetTotalPoints - currentPoints;
  const requiredGpa = Math.round((neededPoints / remainingCredits) * 100) / 100;

  const isAttainable = requiredGpa <= maxPossible && requiredGpa >= 0;

  let message = "";
  if (requiredGpa <= 0) {
    message = "Target already secured! Even with 0.0 in remaining credits, target is reached.";
  } else if (!isAttainable) {
    message = `Unattainable: Requires a ${requiredGpa} GPA, which exceeds the max scale (${maxPossible}).`;
  } else {
    message = `You need to average ${requiredGpa} across your remaining ${remainingCredits} credits.`;
  }

  return {
    targetGpa,
    currentGpa,
    completedCredits,
    remainingCredits,
    requiredGpa,
    isAttainable,
    message,
  };
}

export function getAcademicStanding(gpa: number, scale: GPAScaleType): string {
  const max = scale === "5.0" ? 5.0 : scale === "4.3" ? 4.3 : scale === "100" ? 100 : 4.0;
  const ratio = gpa / max;

  if (ratio >= 0.95) return "President's Honors / Dean's High Honor";
  if (ratio >= 0.875) return "Dean's List";
  if (ratio >= 0.75) return "Good Standing";
  if (ratio >= 0.5) return "Academic Warning";
  return "Academic Probation";
}

export function getLatinHonors(gpa: number, scale: GPAScaleType): string | undefined {
  if (scale === "100" || scale === "uk") return undefined;
  if (gpa >= 3.9) return "Summa Cum Laude (Highest Honors)";
  if (gpa >= 3.7) return "Magna Cum Laude (High Honors)";
  if (gpa >= 3.5) return "Cum Laude (Honors)";
  return undefined;
}
