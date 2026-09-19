export function calculateAge(birthDate: Date): { years: number; months: number; days: number } {
  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days };
}

export function dateDifference(d1: Date, d2: Date): { years: number; months: number; days: number } {
  const earlier = d1 < d2 ? d1 : d2;
  const later = d1 < d2 ? d2 : d1;
  return calculateAge(earlier);
}