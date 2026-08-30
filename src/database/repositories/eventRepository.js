import { getDatabase } from '../database';

export async function listEvents(userId, { activeOnly = false } = {}) {
  const db = await getDatabase();

  return db.getAllAsync(
    `
      SELECT *
      FROM events
      WHERE user_id = ?
        ${activeOnly ? 'AND active = 1' : ''}
      ORDER BY start_date DESC, name ASC
    `,
    userId
  );
}

export async function getEventById(eventId, userId) {
  const db = await getDatabase();

  return db.getFirstAsync(
    `
      SELECT *
      FROM events
      WHERE id = ?
        AND user_id = ?
    `,
    eventId,
    userId
  );
}

export async function createEvent(userId, data) {
  const db = await getDatabase();

  const result = await db.runAsync(
    `
      INSERT INTO events (
        user_id,
        name,
        description,
        event_type,
        start_date,
        end_date,
        start_time,
        default_duration_minutes,
        timezone,
        active
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    userId,
    data.name,
    data.description ?? null,
    data.eventType,
    data.startDate,
    data.endDate ?? null,
    data.startTime ?? null,
    data.defaultDurationMinutes ?? null,
    data.timezone ?? 'America/Sao_Paulo',
    data.active === false ? 0 : 1
  );

  return result.lastInsertRowId;
}

export async function updateEvent(eventId, userId, data) {
  const db = await getDatabase();

  await db.runAsync(
    `
      UPDATE events
      SET
        name = ?,
        description = ?,
        event_type = ?,
        start_date = ?,
        end_date = ?,
        start_time = ?,
        default_duration_minutes = ?,
        timezone = ?,
        active = ?
      WHERE id = ?
        AND user_id = ?
    `,
    data.name,
    data.description ?? null,
    data.eventType,
    data.startDate,
    data.endDate ?? null,
    data.startTime ?? null,
    data.defaultDurationMinutes ?? null,
    data.timezone ?? 'America/Sao_Paulo',
    data.active === false ? 0 : 1,
    eventId,
    userId
  );
}

export async function deleteEvent(eventId, userId) {
  const db = await getDatabase();

  await db.runAsync(
    `
      DELETE FROM events
      WHERE id = ?
        AND user_id = ?
    `,
    eventId,
    userId
  );
}

export async function saveRecurrence(eventId, recurrence) {
  const db = await getDatabase();

  await db.runAsync(
    `
      INSERT INTO event_recurrence (
        event_id,
        frequency,
        monday,
        tuesday,
        wednesday,
        thursday,
        friday,
        saturday,
        sunday,
        week_of_month
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(event_id) DO UPDATE SET
        frequency = excluded.frequency,
        monday = excluded.monday,
        tuesday = excluded.tuesday,
        wednesday = excluded.wednesday,
        thursday = excluded.thursday,
        friday = excluded.friday,
        saturday = excluded.saturday,
        sunday = excluded.sunday,
        week_of_month = excluded.week_of_month
    `,
    eventId,
    recurrence.frequency,
    recurrence.monday ? 1 : 0,
    recurrence.tuesday ? 1 : 0,
    recurrence.wednesday ? 1 : 0,
    recurrence.thursday ? 1 : 0,
    recurrence.friday ? 1 : 0,
    recurrence.saturday ? 1 : 0,
    recurrence.sunday ? 1 : 0,
    recurrence.weekOfMonth ?? null
  );
}

export async function getRecurrence(eventId) {
  const db = await getDatabase();

  return db.getFirstAsync(
    `SELECT * FROM event_recurrence WHERE event_id = ?`,
    eventId
  );
}

export async function listOccurrences(eventId, { startDate, endDate } = {}) {
  const db = await getDatabase();

  let sql = `
    SELECT eo.*, em.year, em.month, em.status AS month_status
    FROM event_occurrences eo
    LEFT JOIN event_months em ON em.id = eo.month_id
    WHERE eo.event_id = ?
  `;

  const params = [eventId];

  if (startDate) {
    sql += ` AND eo.occurrence_date >= ?`;
    params.push(startDate);
  }

  if (endDate) {
    sql += ` AND eo.occurrence_date <= ?`;
    params.push(endDate);
  }

  sql += ` ORDER BY eo.occurrence_date ASC, eo.start_time ASC`;

  return db.getAllAsync(sql, ...params);
}

export async function getOccurrence(eventId, occurrenceId) {
  const db = await getDatabase();

  return db.getFirstAsync(
    `
      SELECT *
      FROM event_occurrences
      WHERE id = ?
        AND event_id = ?
    `,
    occurrenceId,
    eventId
  );
}

export async function createOccurrence(eventId, data) {
  const db = await getDatabase();

  const result = await db.runAsync(
    `
      INSERT INTO event_occurrences (
        event_id,
        month_id,
        occurrence_date,
        start_time,
        end_time,
        status,
        notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    eventId,
    data.monthId ?? null,
    data.occurrenceDate,
    data.startTime,
    data.endTime ?? null,
    data.status ?? 'planned',
    data.notes ?? null
  );

  return result.lastInsertRowId;
}

export async function listMonths(eventId) {
  const db = await getDatabase();

  return db.getAllAsync(
    `
      SELECT *
      FROM event_months
      WHERE event_id = ?
      ORDER BY year ASC, month ASC
    `,
    eventId
  );
}
