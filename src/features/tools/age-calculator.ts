export interface ComprehensiveAge {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalMonths: number;
  totalHours: number;
  totalMinutes: number;
  dayOfWeekBorn: string;
  nextBirthday: {
    daysUntil: number;
    dayOfWeek: string;
    turningAge: number;
    dateFormatted: string;
  };
  zodiac: {
    sign: string;
    symbol: string;
    element: string;
  };
}

const ZODIAC_SIGNS = [
  { sign: "Capricorn", symbol: "♑", element: "Earth", month: 1, day: 19 },
  { sign: "Aquarius", symbol: "♒", element: "Air", month: 2, day: 18 },
  { sign: "Pisces", symbol: "♓", element: "Water", month: 3, day: 20 },
  { sign: "Aries", symbol: "♈", element: "Fire", month: 4, day: 19 },
  { sign: "Taurus", symbol: "♉", element: "Earth", month: 5, day: 20 },
  { sign: "Gemini", symbol: "♊", element: "Air", month: 6, day: 20 },
  { sign: "Cancer", symbol: "♋", element: "Water", month: 7, day: 22 },
  { sign: "Leo", symbol: "♌", element: "Fire", month: 8, day: 22 },
  { sign: "Virgo", symbol: "♍", element: "Earth", month: 9, day: 22 },
  { sign: "Libra", symbol: "♎", element: "Air", month: 10, day: 22 },
  { sign: "Scorpio", symbol: "♏", element: "Water", month: 11, day: 21 },
  { sign: "Sagittarius", symbol: "♐", element: "Fire", month: 12, day: 21 },
  { sign: "Capricorn", symbol: "♑", element: "Earth", month: 12, day: 31 },
];

function getZodiac(month: number, day: number) {
  for (const z of ZODIAC_SIGNS) {
    if (month < z.month || (month === z.month && day <= z.day)) {
      return z;
    }
  }
  return ZODIAC_SIGNS[0];
}

export function calculateAge(birthDate: Date, targetDate: Date = new Date()): {
  years: number;
  months: number;
  days: number;
} {
  let years = targetDate.getFullYear() - birthDate.getFullYear();
  let months = targetDate.getMonth() - birthDate.getMonth();
  let days = targetDate.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return { years: Math.max(0, years), months: Math.max(0, months), days: Math.max(0, days) };
}

export function calculateComprehensiveAge(
  birthDate: Date,
  asOfDate: Date = new Date()
): ComprehensiveAge {
  const basic = calculateAge(birthDate, asOfDate);

  const diffMs = Math.max(0, asOfDate.getTime() - birthDate.getTime());
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const totalMonths = basic.years * 12 + basic.months;
  const totalHours = totalDays * 24;
  const totalMinutes = totalHours * 60;

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayOfWeekBorn = daysOfWeek[birthDate.getDay()];

  // Next birthday calculation
  let nextBdayYear = asOfDate.getFullYear();
  let nextBdayDate = new Date(nextBdayYear, birthDate.getMonth(), birthDate.getDate());

  if (nextBdayDate < asOfDate) {
    nextBdayYear++;
    nextBdayDate = new Date(nextBdayYear, birthDate.getMonth(), birthDate.getDate());
  }

  const msToNext = nextBdayDate.getTime() - asOfDate.getTime();
  const daysUntil = Math.ceil(msToNext / (1000 * 60 * 60 * 24));
  const dayOfWeek = daysOfWeek[nextBdayDate.getDay()];
  const turningAge = nextBdayYear - birthDate.getFullYear();

  const zodiac = getZodiac(birthDate.getMonth() + 1, birthDate.getDate());

  return {
    ...basic,
    totalDays,
    totalWeeks,
    totalMonths,
    totalHours,
    totalMinutes,
    dayOfWeekBorn,
    nextBirthday: {
      daysUntil,
      dayOfWeek,
      turningAge,
      dateFormatted: nextBdayDate.toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    },
    zodiac,
  };
}

export function dateDifference(
  d1: Date,
  d2: Date
): { years: number; months: number; days: number; totalDays: number } {
  const earlier = d1 < d2 ? d1 : d2;
  const later = d1 < d2 ? d2 : d1;
  const basic = calculateAge(earlier, later);
  const totalDays = Math.floor((later.getTime() - earlier.getTime()) / (1000 * 60 * 60 * 24));
  return { ...basic, totalDays };
}