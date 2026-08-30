import { getDatabase } from '../database';

/**
 * Converte Date local para YYYY-MM-DD sem depender do UTC.
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDate(value) {
  if (value instanceof Date) return new Date(value.getTime());

  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function isSameOrBefore(a, b) {
  return a.getTime() <= b.getTime();
}

function cloneDate(date) {
  return new Date(date.getTime());
}

const DAY_KEYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

function enabledDays(recurrence) {
  return new Set(
    DAY_KEYS
      .map((day, index) => (recurrence[day] ? index : null))
      .filter((value) => value !== null)
  );
}

function isNthWeekOfMonth(date, n) {
  if (!n) return true;

  const occurrence = Math.floor((date.getDate() - 1) / 7) + 1;
  return occurrence === n;
}

function addMinutesToTime(time, minutes) {
  const [hour, minute] = time.split(':').map(Number);
  const total = hour * 60 + minute + minutes;
  const normalized = ((total % 1440) + 1440) % 1440;

  const h = Math.floor(normalized / 60);
  const m = normalized % 60;

  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Gera os meses e ocorrências de um evento dentro do intervalo.
 *
 * weekly:
 *   usa os dias selecionados em event_recurrence.
 *
 * monthly:
 *   usa os dias selecionados e, se week_of_month existir,
 *   filtra pela semana do mês (ex.: 1º sábado).
 *
 * one_time:
 *   gera apenas start_date.
 */
export async function generateEventOccurrences(eventId) {
  const db = await getDatabase();

  const event = await db.getFirstAsync(
    `SELECT * FROM events WHERE id = ?`,
    eventId
  );

  if (!event) {
    throw new Error('Evento não encontrado.');
  }

  const recurrence = await db.getFirstAsync(
    `SELECT * FROM event_recurrence WHERE event_id = ?`,
    eventId
  );

  const start = parseDate(event.start_date);
  const end = event.end_date ? parseDate(event.end_date) : cloneDate(start);

  await db.withTransactionAsync(async () => {
    let current = cloneDate(start);

    while (isSameOrBefore(current, end)) {
      const shouldCreate =
        event.event_type === 'one_time'
          ? formatDate(current) === event.start_date
          : shouldGenerateDate(current, event.event_type, recurrence);

      if (shouldCreate) {
        await createOccurrenceIfNeeded(db, event, current);
      }

      if (event.event_type === 'one_time') {
        break;
      }

      current.setDate(current.getDate() + 1);
    }
  });

  return listGeneratedOccurrences(db, eventId);
}

function shouldGenerateDate(date, eventType, recurrence) {
  if (!recurrence) return false;

  const day = date.getDay();
  const days = enabledDays(recurrence);

  if (!days.has(day)) {
    return false;
  }

  if (eventType === 'monthly' && recurrence.week_of_month) {
    return isNthWeekOfMonth(date, recurrence.week_of_month);
  }

  return true;
}

async function createOccurrenceIfNeeded(db, event, date) {
  const occurrenceDate = formatDate(date);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  await db.runAsync(
    `
      INSERT INTO event_months (
        event_id,
        year,
        month,
        status,
        generated_at
      )
      VALUES (?, ?, ?, 'planning', CURRENT_TIMESTAMP)
      ON CONFLICT(event_id, year, month)
      DO UPDATE SET generated_at = CURRENT_TIMESTAMP
    `,
    event.id,
    year,
    month
  );

  const monthRow = await db.getFirstAsync(
    `
      SELECT id
      FROM event_months
      WHERE event_id = ?
        AND year = ?
        AND month = ?
    `,
    event.id,
    year,
    month
  );

  const startTime = event.start_time ?? '00:00';
  const endTime = event.default_duration_minutes
    ? addMinutesToTime(startTime, event.default_duration_minutes)
    : null;

  await db.runAsync(
    `
      INSERT INTO event_occurrences (
        event_id,
        month_id,
        occurrence_date,
        start_time,
        end_time,
        status
      )
      VALUES (?, ?, ?, ?, ?, 'planned')
      ON CONFLICT(event_id, occurrence_date)
      DO UPDATE SET
        month_id = excluded.month_id
    `,
    event.id,
    monthRow.id,
    occurrenceDate,
    startTime,
    endTime
  );
}

async function listGeneratedOccurrences(db, eventId) {
  return db.getAllAsync(
    `
      SELECT *
      FROM event_occurrences
      WHERE event_id = ?
      ORDER BY occurrence_date ASC, start_time ASC
    `,
    eventId
  );
}

/**
 * Regenera somente o intervalo necessário.
 * Não apaga apresentações já existentes.
 */
export async function regenerateEventOccurrences(eventId) {
  return generateEventOccurrences(eventId);
}

export { formatDate };
