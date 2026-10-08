export const timeLabel = (value) => value.slice(11, 16);

export async function api(path, options) {
  const response = await fetch(`/api${path}`, options);
  const body = await response.json();
  if (!response.ok) {
    const error = new Error(body.error ?? 'Unable to complete the request.');
    error.status = response.status;
    error.body = body;
    throw error;
  }
  return body;
}

export function renderConflictMessage(conflictingStart, conflictingEnd) {
  return `This room is already booked from ${timeLabel(conflictingStart)} to ${timeLabel(conflictingEnd)}. Choose another time.`;
}
