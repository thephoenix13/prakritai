export function formatDate(date: string | Date, style: 'short' | 'medium' | 'long' = 'medium'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const opts: Intl.DateTimeFormatOptions =
    style === 'short'  ? { day: 'numeric', month: 'short' } :
    style === 'medium' ? { day: 'numeric', month: 'short', year: 'numeric' } :
                         { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  return d.toLocaleDateString('en-IN', opts);
}

export function getAgeFromDob(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
