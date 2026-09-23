export type WorkoutSplitType = "ppl" | "upper_lower" | "full_body" | "arnold" | "bro_split";
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type FitnessGoal = "hypertrophy" | "strength" | "fat_loss" | "endurance";
export type EquipmentType = "full_gym" | "barbell_dumbbells" | "bodyweight";

export interface Exercise {
  id: string;
  name: string;
  targetMuscle: string;
  secondaryMuscles: string[];
  equipment: EquipmentType;
  mechanics: "compound" | "isolation";
  cues: string[];
  defaultSets: number;
  defaultReps: string;
  restSeconds: number;
}

export interface WorkoutDay {
  dayNumber: number;
  dayName: string;
  focus: string;
  exercises: Exercise[];
}

export interface WorkoutProgram {
  id: string;
  name: string;
  description: string;
  daysPerWeek: number;
  splitType: WorkoutSplitType;
  goal: FitnessGoal;
  experience: ExperienceLevel;
  days: WorkoutDay[];
}

// ---------------------------------------------------------------------------
// 1RM Calculation Logic
// ---------------------------------------------------------------------------

export interface RepMaxPercentage {
  reps: number;
  percent: number;
  weight: number;
}

export interface OneRepMaxResult {
  brzycki: number;
  epley: number;
  lander: number;
  lombardi: number;
  average: number;
  percentages: RepMaxPercentage[];
}

export function calculateOneRepMax(weight: number, reps: number): OneRepMaxResult {
  if (weight <= 0 || reps <= 0) {
    return {
      brzycki: 0,
      epley: 0,
      lander: 0,
      lombardi: 0,
      average: 0,
      percentages: [],
    };
  }

  if (reps === 1) {
    const percentages: RepMaxPercentage[] = [
      { reps: 1, percent: 100, weight },
      { reps: 2, percent: 95, weight: Math.round(weight * 0.95 * 10) / 10 },
      { reps: 3, percent: 93, weight: Math.round(weight * 0.93 * 10) / 10 },
      { reps: 4, percent: 90, weight: Math.round(weight * 0.90 * 10) / 10 },
      { reps: 5, percent: 87, weight: Math.round(weight * 0.87 * 10) / 10 },
      { reps: 6, percent: 85, weight: Math.round(weight * 0.85 * 10) / 10 },
      { reps: 8, percent: 80, weight: Math.round(weight * 0.80 * 10) / 10 },
      { reps: 10, percent: 75, weight: Math.round(weight * 0.75 * 10) / 10 },
      { reps: 12, percent: 70, weight: Math.round(weight * 0.70 * 10) / 10 },
      { reps: 15, percent: 65, weight: Math.round(weight * 0.65 * 10) / 10 },
    ];
    return {
      brzycki: weight,
      epley: weight,
      lander: weight,
      lombardi: weight,
      average: weight,
      percentages,
    };
  }

  const brzycki = reps < 37 ? weight * (36 / (37 - reps)) : weight * 1.5;
  const epley = weight * (1 + 0.0333 * reps);
  const lander = (100 * weight) / (101.3 - 2.67123 * reps);
  const lombardi = weight * Math.pow(reps, 0.10);

  const avg = (brzycki + epley + lander + lombardi) / 4;
  const roundedAvg = Math.round(avg * 10) / 10;

  const repPercentages: [number, number][] = [
    [1, 1.0],
    [2, 0.95],
    [3, 0.93],
    [4, 0.90],
    [5, 0.87],
    [6, 0.85],
    [8, 0.80],
    [10, 0.75],
    [12, 0.70],
    [15, 0.65],
  ];

  const percentages: RepMaxPercentage[] = repPercentages.map(([r, pct]) => ({
    reps: r,
    percent: Math.round(pct * 100),
    weight: Math.round(roundedAvg * pct * 10) / 10,
  }));

  return {
    brzycki: Math.round(brzycki * 10) / 10,
    epley: Math.round(epley * 10) / 10,
    lander: Math.round(lander * 10) / 10,
    lombardi: Math.round(lombardi * 10) / 10,
    average: roundedAvg,
    percentages,
  };
}

// ---------------------------------------------------------------------------
// TDEE & Macronutrient Logic (Mifflin-St Jeor)
// ---------------------------------------------------------------------------

export type ActivityLevel = "sedentary" | "light" | "moderate" | "very_active" | "extra_active";
export type CalorieGoal = "aggressive_cut" | "cut" | "maintain" | "clean_bulk" | "aggressive_bulk";

export interface TdeeResult {
  bmr: number;
  tdee: number;
  targetCalories: number;
  deficitOrSurplus: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  waterLiters: number;
  macrosRatio: { proteinPct: number; carbPct: number; fatPct: number };
}

export function calculateTDEE(params: {
  gender: "male" | "female";
  age: number;
  weightKg: number;
  heightCm: number;
  activity: ActivityLevel;
  goal: CalorieGoal;
}): TdeeResult {
  const { gender, age, weightKg, heightCm, activity, goal } = params;

  // Mifflin - St Jeor formula
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  bmr = gender === "male" ? bmr + 5 : bmr - 161;

  const activityMultipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };

  const tdee = bmr * (activityMultipliers[activity] ?? 1.2);

  const goalModifiers: Record<CalorieGoal, number> = {
    aggressive_cut: -500,
    cut: -300,
    maintain: 0,
    clean_bulk: 250,
    aggressive_bulk: 500,
  };

  const deficitOrSurplus = goalModifiers[goal];
  const targetCalories = Math.max(1200, Math.round(tdee + deficitOrSurplus));

  // Macronutrient calculation
  // Protein: 2.0g/kg for cutting/hypertrophy
  const proteinGrams = Math.round(weightKg * (goal.includes("cut") ? 2.2 : 2.0));
  const proteinCals = proteinGrams * 4;

  // Fat: 0.9g/kg bodyweight
  const fatGrams = Math.round(weightKg * 0.9);
  const fatCals = fatGrams * 9;

  // Carbs: Remaining calories
  const remainingCals = Math.max(0, targetCalories - (proteinCals + fatCals));
  const carbGrams = Math.round(remainingCals / 4);

  const totalCalculatedCals = proteinCals + fatCals + carbGrams * 4;
  const proteinPct = Math.round((proteinCals / totalCalculatedCals) * 100);
  const fatPct = Math.round((fatCals / totalCalculatedCals) * 100);
  const carbPct = 100 - proteinPct - fatPct;

  // Recommended daily water intake (liters)
  const waterLiters = Math.round((weightKg * 0.035 + (activity === "very_active" || activity === "extra_active" ? 0.8 : 0.4)) * 10) / 10;

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories,
    deficitOrSurplus,
    proteinGrams,
    carbGrams,
    fatGrams,
    waterLiters,
    macrosRatio: { proteinPct, carbPct, fatPct },
  };
}

// ---------------------------------------------------------------------------
// Exercise Bank & Program Generator
// ---------------------------------------------------------------------------

export const EXERCISE_DATABASE: Exercise[] = [
  // Chest
  {
    id: "barbell-bench-press",
    name: "Barbell Bench Press",
    targetMuscle: "Chest",
    secondaryMuscles: ["Triceps", "Anterior Deltoids"],
    equipment: "full_gym",
    mechanics: "compound",
    cues: ["Retract scapula", "Leg drive through heels", "Bar touches mid-sternum", "Squeeze pecs at peak"],
    defaultSets: 4,
    defaultReps: "6-8",
    restSeconds: 120,
  },
  {
    id: "incline-dumbbell-press",
    name: "Incline Dumbbell Press",
    targetMuscle: "Upper Chest",
    secondaryMuscles: ["Anterior Deltoids", "Triceps"],
    equipment: "barbell_dumbbells",
    mechanics: "compound",
    cues: ["30-degree incline", "Flared elbows at 45 degrees", "Full stretch at bottom"],
    defaultSets: 3,
    defaultReps: "8-10",
    restSeconds: 90,
  },
  {
    id: "cable-chest-flye",
    name: "Cable Chest Flye",
    targetMuscle: "Chest",
    secondaryMuscles: ["Anterior Deltoids"],
    equipment: "full_gym",
    mechanics: "isolation",
    cues: ["Slight elbow bend", "Hug a large tree motion", "Hold contraction for 1s"],
    defaultSets: 3,
    defaultReps: "12-15",
    restSeconds: 60,
  },
  {
    id: "push-ups",
    name: "Standard Push-Ups",
    targetMuscle: "Chest",
    secondaryMuscles: ["Triceps", "Core"],
    equipment: "bodyweight",
    mechanics: "compound",
    cues: ["Rigid plank posture", "Hands slightly wider than shoulders", "Full lockout without shrugging"],
    defaultSets: 4,
    defaultReps: "15-20",
    restSeconds: 60,
  },
  // Back
  {
    id: "barbell-deadlift",
    name: "Conventional Barbell Deadlift",
    targetMuscle: "Back & Posterior Chain",
    secondaryMuscles: ["Glutes", "Hamstrings", "Lats", "Forearms"],
    equipment: "full_gym",
    mechanics: "compound",
    cues: ["Hips hinged, chest upright", "Lats engaged like breaking the bar", "Push floor away"],
    defaultSets: 4,
    defaultReps: "5",
    restSeconds: 180,
  },
  {
    id: "lat-pulldown",
    name: "Lat Pulldown",
    targetMuscle: "Lats",
    secondaryMuscles: ["Biceps", "Rear Deltoids"],
    equipment: "full_gym",
    mechanics: "compound",
    cues: ["Drive elbows straight down towards pockets", "Slight torso lean", "Slow eccentric return"],
    defaultSets: 4,
    defaultReps: "8-12",
    restSeconds: 90,
  },
  {
    id: "bent-over-barbell-row",
    name: "Bent-Over Barbell Row",
    targetMuscle: "Upper Back & Lats",
    secondaryMuscles: ["Biceps", "Forearms"],
    equipment: "barbell_dumbbells",
    mechanics: "compound",
    cues: ["45-degree hip hinge", "Pull bar to navel", "Avoid torso jerking"],
    defaultSets: 4,
    defaultReps: "8-10",
    restSeconds: 90,
  },
  {
    id: "pull-ups",
    name: "Pull-Ups",
    targetMuscle: "Lats",
    secondaryMuscles: ["Biceps", "Core"],
    equipment: "bodyweight",
    mechanics: "compound",
    cues: ["Overhand grip just outside shoulders", "Drive elbows to ribs", "Chin cleanly over bar"],
    defaultSets: 4,
    defaultReps: "6-10",
    restSeconds: 120,
  },
  // Legs
  {
    id: "barbell-back-squat",
    name: "Barbell Back Squat",
    targetMuscle: "Quadriceps & Glutes",
    secondaryMuscles: ["Hamstrings", "Core", "Spinal Erectors"],
    equipment: "full_gym",
    mechanics: "compound",
    cues: ["Brace core with Valsalva", "Knees track over toes", "Crease of hip below knee joint"],
    defaultSets: 4,
    defaultReps: "6-8",
    restSeconds: 150,
  },
  {
    id: "romanian-deadlift",
    name: "Romanian Deadlift (RDL)",
    targetMuscle: "Hamstrings & Glutes",
    secondaryMuscles: ["Lower Back"],
    equipment: "barbell_dumbbells",
    mechanics: "compound",
    cues: ["Push hips back until deep hamstring stretch", "Keep bar gliding against shins", "Neutral neck"],
    defaultSets: 3,
    defaultReps: "8-10",
    restSeconds: 90,
  },
  {
    id: "walking-lunges",
    name: "Dumbbell Walking Lunges",
    targetMuscle: "Quads & Glutes",
    secondaryMuscles: ["Calves", "Adductors"],
    equipment: "barbell_dumbbells",
    mechanics: "compound",
    cues: ["90-degree bend at both knees", "Chest upright", "Drive through front heel"],
    defaultSets: 3,
    defaultReps: "10 per leg",
    restSeconds: 75,
  },
  {
    id: "bodyweight-pistol-squat",
    name: "Pistol Squat / Assisted Single Leg",
    targetMuscle: "Quadriceps & Balance",
    secondaryMuscles: ["Glutes", "Ankle Stabilizers"],
    equipment: "bodyweight",
    mechanics: "compound",
    cues: ["Extend non-working leg forward", "Control decent", "Drive smoothly through midfoot"],
    defaultSets: 3,
    defaultReps: "6-8 per leg",
    restSeconds: 90,
  },
  // Shoulders
  {
    id: "standing-overhead-press",
    name: "Overhead Barbell Press (OHP)",
    targetMuscle: "Anterior & Lateral Deltoids",
    secondaryMuscles: ["Triceps", "Upper Traps"],
    equipment: "full_gym",
    mechanics: "compound",
    cues: ["Squeeze glutes and quads", "Tuck chin slightly to clear bar", "Shrug shoulders slightly at lock"],
    defaultSets: 4,
    defaultReps: "6-8",
    restSeconds: 120,
  },
  {
    id: "lateral-raises",
    name: "Dumbbell Lateral Raises",
    targetMuscle: "Lateral Deltoids",
    secondaryMuscles: ["Trapezius"],
    equipment: "barbell_dumbbells",
    mechanics: "isolation",
    cues: ["Lead with elbows", "Slight forward torso tilt", "Do not swing hips"],
    defaultSets: 4,
    defaultReps: "12-15",
    restSeconds: 60,
  },
  // Arms
  {
    id: "barbell-curl",
    name: "Barbell Bicep Curl",
    targetMuscle: "Biceps",
    secondaryMuscles: ["Brachialis", "Forearms"],
    equipment: "barbell_dumbbells",
    mechanics: "isolation",
    cues: ["Pin elbows to torso", "Do not rock shoulders", "Full range of motion"],
    defaultSets: 3,
    defaultReps: "10-12",
    restSeconds: 60,
  },
  {
    id: "tricep-rope-pushdown",
    name: "Cable Tricep Rope Pushdown",
    targetMuscle: "Triceps",
    secondaryMuscles: [],
    equipment: "full_gym",
    mechanics: "isolation",
    cues: ["Spread rope ends apart at bottom", "Keep upper arms stationary", "Full tricep squeeze"],
    defaultSets: 3,
    defaultReps: "12-15",
    restSeconds: 60,
  },
];

export function generateWorkoutProgram(params: {
  splitType: WorkoutSplitType;
  daysPerWeek: number;
  experience: ExperienceLevel;
  goal: FitnessGoal;
  equipment: EquipmentType;
}): WorkoutProgram {
  const { splitType, daysPerWeek, experience, goal, equipment } = params;

  // Filter exercises matching equipment type
  const filterEquip = (ex: Exercise) => {
    if (equipment === "bodyweight") return ex.equipment === "bodyweight";
    if (equipment === "barbell_dumbbells") return ex.equipment === "barbell_dumbbells" || ex.equipment === "bodyweight";
    return true; // full_gym can do all
  };

  const available = EXERCISE_DATABASE.filter(filterEquip);
  const getExercise = (targetSubstring: string, fallbackId: string): Exercise => {
    const found = available.find((e) => e.targetMuscle.toLowerCase().includes(targetSubstring.toLowerCase()));
    if (found) return found;
    const fallback = EXERCISE_DATABASE.find((e) => e.id === fallbackId);
    return fallback || EXERCISE_DATABASE[0];
  };

  const days: WorkoutDay[] = [];

  if (splitType === "ppl") {
    days.push({
      dayNumber: 1,
      dayName: "Push A",
      focus: "Chest, Shoulders & Triceps (Heavy)",
      exercises: [
        getExercise("chest", "barbell-bench-press"),
        getExercise("upper chest", "incline-dumbbell-press"),
        getExercise("anterior", "standing-overhead-press"),
        getExercise("lateral", "lateral-raises"),
        getExercise("triceps", "tricep-rope-pushdown"),
      ],
    });
    days.push({
      dayNumber: 2,
      dayName: "Pull A",
      focus: "Back, Rear Delts & Biceps",
      exercises: [
        getExercise("posterior", "barbell-deadlift"),
        getExercise("lats", "lat-pulldown"),
        getExercise("upper back", "bent-over-barbell-row"),
        getExercise("biceps", "barbell-curl"),
      ],
    });
    days.push({
      dayNumber: 3,
      dayName: "Legs A",
      focus: "Quads, Hamstrings & Calves",
      exercises: [
        getExercise("quadriceps", "barbell-back-squat"),
        getExercise("hamstrings", "romanian-deadlift"),
        getExercise("lunges", "walking-lunges"),
      ],
    });
    if (daysPerWeek >= 4) {
      days.push({
        dayNumber: 4,
        dayName: "Push B",
        focus: "Chest & Shoulder Hypertrophy",
        exercises: [
          getExercise("upper chest", "incline-dumbbell-press"),
          getExercise("chest", "cable-chest-flye"),
          getExercise("lateral", "lateral-raises"),
          getExercise("triceps", "tricep-rope-pushdown"),
        ],
      });
    }
    if (daysPerWeek >= 5) {
      days.push({
        dayNumber: 5,
        dayName: "Pull B",
        focus: "Back Width & Bicep Peak",
        exercises: [
          getExercise("lats", "pull-ups"),
          getExercise("upper back", "bent-over-barbell-row"),
          getExercise("lats", "lat-pulldown"),
          getExercise("biceps", "barbell-curl"),
        ],
      });
    }
    if (daysPerWeek >= 6) {
      days.push({
        dayNumber: 6,
        dayName: "Legs B",
        focus: "Hamstrings, Glute Drive & Core",
        exercises: [
          getExercise("hamstrings", "romanian-deadlift"),
          getExercise("quadriceps", "barbell-back-squat"),
          getExercise("lunges", "walking-lunges"),
        ],
      });
    }
  } else if (splitType === "upper_lower") {
    days.push({
      dayNumber: 1,
      dayName: "Upper Power",
      focus: "Upper Body Strength & Compound Progression",
      exercises: [
        getExercise("chest", "barbell-bench-press"),
        getExercise("upper back", "bent-over-barbell-row"),
        getExercise("anterior", "standing-overhead-press"),
        getExercise("biceps", "barbell-curl"),
      ],
    });
    days.push({
      dayNumber: 2,
      dayName: "Lower Power",
      focus: "Lower Body Compound Load",
      exercises: [
        getExercise("quadriceps", "barbell-back-squat"),
        getExercise("hamstrings", "romanian-deadlift"),
        getExercise("lunges", "walking-lunges"),
      ],
    });
    days.push({
      dayNumber: 3,
      dayName: "Upper Hypertrophy",
      focus: "Upper Body Volume & Muscle Sculpting",
      exercises: [
        getExercise("upper chest", "incline-dumbbell-press"),
        getExercise("lats", "lat-pulldown"),
        getExercise("lateral", "lateral-raises"),
        getExercise("triceps", "tricep-rope-pushdown"),
      ],
    });
    if (daysPerWeek >= 4) {
      days.push({
        dayNumber: 4,
        dayName: "Lower Hypertrophy",
        focus: "Leg Volume & Glute Activation",
        exercises: [
          getExercise("hamstrings", "romanian-deadlift"),
          getExercise("quadriceps", "barbell-back-squat"),
          getExercise("lunges", "walking-lunges"),
        ],
      });
    }
  } else {
    // Full Body default (3 or 4 days)
    for (let i = 1; i <= Math.min(daysPerWeek, 4); i++) {
      days.push({
        dayNumber: i,
        dayName: `Full Body Session ${i}`,
        focus: i % 2 === 1 ? "Squat & Push Priority" : "Hinge & Pull Priority",
        exercises: [
          i % 2 === 1 ? getExercise("quadriceps", "barbell-back-squat") : getExercise("posterior", "barbell-deadlift"),
          getExercise("chest", "barbell-bench-press"),
          getExercise("lats", "lat-pulldown"),
          getExercise("anterior", "standing-overhead-press"),
          getExercise("biceps", "barbell-curl"),
        ],
      });
    }
  }

  // Adjust sets and reps based on goal
  days.forEach((day) => {
    day.exercises.forEach((ex) => {
      if (goal === "strength") {
        ex.defaultSets = 5;
        ex.defaultReps = ex.mechanics === "compound" ? "3-5" : "6-8";
        ex.restSeconds = ex.mechanics === "compound" ? 180 : 90;
      } else if (goal === "hypertrophy") {
        ex.defaultSets = 4;
        ex.defaultReps = ex.mechanics === "compound" ? "8-10" : "10-15";
        ex.restSeconds = 90;
      } else if (goal === "fat_loss") {
        ex.defaultSets = 3;
        ex.defaultReps = "12-15";
        ex.restSeconds = 45;
      } else {
        ex.defaultSets = 3;
        ex.defaultReps = "15-20";
        ex.restSeconds = 40;
      }
    });
  });

  return {
    id: `prog_${Date.now()}`,
    name: `${daysPerWeek}-Day ${splitType.toUpperCase()} Program`,
    description: `Scientific ${splitType} training split tailored for ${experience} lifters targeting ${goal}.`,
    daysPerWeek,
    splitType,
    goal,
    experience,
    days,
  };
}

// ---------------------------------------------------------------------------
// Offline Fallback AI Coach Responses
// ---------------------------------------------------------------------------

export function generateOfflineFitnessAdvice(prompt: string): string {
  const p = prompt.toLowerCase();

  if (p.includes("bench") || p.includes("chest") || p.includes("plateau")) {
    return `### 🏋️ Coach Breakdown: Overcoming Bench Press Plateaus\n\n1. **Technique Optimization:**\n- Ensure aggressive upper back retraction and depression (scapular pinch into the bench).\n- Maintain constant leg drive: push back toward your head without raising hips.\n- Dial in your bar path: rather than pressing straight up, press in a slight reverse J-curve over the shoulders.\n\n2. **Weak-Point Targeting:**\n- *Weak off the chest:* Add 2-second pause bench presses and Spoto presses.\n- *Weak at lockout:* Increase tricep accessory volume with close-grip bench and weighted dips.\n\n3. **Volume & Fatigue Management:**\n- Accumulate volume in the 70–80% 1RM range for 3-4 sets of 5 reps before testing 1RM.\n- Program a deload week every 4–6 weeks where training load is reduced by 40-50%.`;
  }

  if (p.includes("squat") || p.includes("depth") || p.includes("knee")) {
    return `### 🦵 Coach Breakdown: Squat Mechanics & Depth Mobility\n\n1. **Ankle Dorsiflexion Mobility:**\n- Restricted ankles force premature forward torso collapse. Perform wall ankle mobilizations and calf stretches before squatting.\n- Consider squat shoes with an elevated heel (0.75") or placing small 2.5lb plates under your heels.\n\n2. **Bracing & Core Pressure:**\n- Take a deep diaphragmatic breath into your oblique belt (Valsalva maneuver) before breaking at hips and knees simultaneously.\n- Keep your ribs down and avoid excessive lumbar hyperextension.\n\n3. **Knee Tracking:**\n- Actively push the floor apart with your feet and cue knees tracking in line with your second toe to create hip torque.`;
  }

  if (p.includes("deadlift") || p.includes("back") || p.includes("hinge")) {
    return `### ⚡ Coach Breakdown: Deadlift Power & Spine Protection\n\n1. **Bar Starting Position:**\n- Set the barbell directly over midfoot (approx. 1 inch from your shins when standing upright).\n- Pull the slack out of the barbell with a click sound before driving through the floor.\n\n2. **Lat Engagement:**\n- Imagine bending the bar across your shins or squeezing oranges in your armpits. This locks the thoracolumbar fascia.\n\n3. **Hips vs Knees:**\n- The deadlift is a hinge, not a squat. Keep hips higher than knees and push the ground away with your quads until the bar clears the patella.`;
  }

  return `### 🏆 Personalized Fitness Coaching Advice\n\nBased on your inquiry, here is the evidence-based protocol:\n\n1. **Progressive Overload Principle:**\n- To trigger continuous muscle protein synthesis and strength adaptations, progressively increase load (+2.5-5lbs), total volume (sets × reps), or execution quality week over week.\n\n2. **Recovery & Sleep Architecture:**\n- 7 to 9 hours of uninterrupted sleep is when growth hormone and IGF-1 secretion peak.\n- Target 1.6 to 2.2g of high biological value protein per kg of body weight daily.\n\n3. **Intra-Workout Hydration:**\n- Aim for 500-750ml of water with electrolytes (sodium and potassium) per hour of rigorous lifting to maintain muscular contractile force.`;
}
