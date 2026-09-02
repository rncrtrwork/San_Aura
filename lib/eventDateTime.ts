export type EventDateTimeRange = {
  startsAt: string;
  endsAt: string;
};

function nextDateValue(dateValue: string): string {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(date.getDate() + 1);
  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

export function buildEventDateTimeRange(
  dateValue: string,
  startTimeValue: string,
  endTimeValue: string,
): EventDateTimeRange {
  const endDateValue = endTimeValue <= startTimeValue ? nextDateValue(dateValue) : dateValue;

  return {
    startsAt: `${dateValue}T${startTimeValue}:00`,
    endsAt: `${endDateValue}T${endTimeValue}:00`,
  };
}
