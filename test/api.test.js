import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { api, renderConflictMessage, timeLabel } from '../ui/api.js';

function stubFetch(status, body) {
  globalThis.fetch = async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

afterEach(() => {
  delete globalThis.fetch;
});

test('api() returns the parsed body on a successful response', async () => {
  stubFetch(201, { id: '1', title: 'Design review' });
  const result = await api('/bookings', { method: 'POST' });
  assert.deepEqual(result, { id: '1', title: 'Design review' });
});

test('api() throws an error carrying status and body on a conflict response', async () => {
  stubFetch(409, { conflictingStart: '2030-06-12T09:00:00.000Z', conflictingEnd: '2030-06-12T10:00:00.000Z' });
  await assert.rejects(
    () => api('/bookings', { method: 'POST' }),
    (error) =>
      error.status === 409 &&
      error.message === 'Unable to complete the request.' &&
      error.body.conflictingStart === '2030-06-12T09:00:00.000Z' &&
      error.body.conflictingEnd === '2030-06-12T10:00:00.000Z'
  );
});

test('api() uses the response error field as the message when present', async () => {
  stubFetch(400, { error: 'End time must be after start time.' });
  await assert.rejects(
    () => api('/bookings', { method: 'POST' }),
    (error) => error.status === 400 && error.message === 'End time must be after start time.'
  );
});

test('timeLabel extracts the HH:MM portion of a UTC timestamp', () => {
  assert.equal(timeLabel('2030-06-12T09:30:00.000Z'), '09:30');
});

test('renderConflictMessage states the conflicting interval using timeLabel formatting', () => {
  const message = renderConflictMessage('2030-06-12T09:00:00.000Z', '2030-06-12T10:00:00.000Z');
  assert.equal(message, 'This room is already booked from 09:00 to 10:00. Choose another time.');
});
