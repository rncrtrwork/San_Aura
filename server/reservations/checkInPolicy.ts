export type CheckInPolicyResult = {
  allowed: boolean;
  message: string;
};

function zonedDateTime(now: Date, timezone: string): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((entry) => entry.type === type)?.value ?? '';
  return {
    date: `${part('year')}-${part('month')}-${part('day')}`,
    time: `${part('hour')}:${part('minute')}`,
  };
}

export function evaluateCheckInPolicy(
  checkIn: Date,
  checkInTime: string,
  timezone: string,
  now = new Date(),
): CheckInPolicyResult {
  const current = zonedDateTime(now, timezone);
  const arrivalDate = checkIn.toISOString().slice(0, 10);
  if (current.date < arrivalDate || (current.date === arrivalDate && current.time < checkInTime)) {
    return {
      allowed: false,
      message: `Check-in opens at ${checkInTime} on ${arrivalDate} (${timezone}).`,
    };
  }
  return { allowed: true, message: 'Check-in is available.' };
}
