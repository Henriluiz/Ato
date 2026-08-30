import { getDatabase } from '../database';

export async function listEligiblePeople({
  userId,
  presentationTypeId,
  occurrenceDate,
  presentationId = null,
} = {}) {
  const db = await getDatabase();

  const params = [userId, presentationTypeId, occurrenceDate, occurrenceDate];

  let sql = `
    SELECT DISTINCT
      p.id,
      p.name,
      p.email,
      p.phone
    FROM people p
    INNER JOIN person_roles pr
      ON pr.person_id = p.id
    INNER JOIN presentation_type_roles ptr
      ON ptr.role_id = pr.role_id
    INNER JOIN roles r
      ON r.id = pr.role_id
    WHERE p.user_id = ?
      AND p.active = 1
      AND ptr.presentation_type_id = ?
      AND NOT EXISTS (
        SELECT 1
        FROM absences a
        WHERE a.person_id = p.id
          AND a.start_date <= ?
          AND a.end_date >= ?
      )
  `;

  if (presentationId) {
    sql += `
      AND NOT EXISTS (
        SELECT 1
        FROM presentation_members existing_member
        WHERE existing_member.presentation_id = ?
          AND existing_member.person_id = p.id
      )
    `;
    params.push(presentationId);
  }

  sql += `
    ORDER BY p.name COLLATE NOCASE ASC
  `;

  return db.getAllAsync(sql, ...params);
}

export async function addPresentationMember({
  presentationId,
  personId,
  roleId = null,
  position = 0,
}) {
  const db = await getDatabase();

  const result = await db.runAsync(
    `
      INSERT INTO presentation_members (
        presentation_id,
        person_id,
        role_id,
        position
      )
      VALUES (?, ?, ?, ?)
    `,
    presentationId,
    personId,
    roleId,
    position
  );

  return result;
}

export async function removePresentationMember(presentationId, personId) {
  const db = await getDatabase();

  await db.runAsync(
    `
      DELETE FROM presentation_members
      WHERE presentation_id = ?
        AND person_id = ?
    `,
    presentationId,
    personId
  );
}

export async function countPresentationMembers(presentationId) {
  const db = await getDatabase();

  const row = await db.getFirstAsync(
    `
      SELECT COUNT(*) AS count
      FROM presentation_members
      WHERE presentation_id = ?
    `,
    presentationId
  );

  return Number(row?.count ?? 0);
}

export async function canPersonBeAssigned({
  personId,
  presentationId,
  roleId,
  occurrenceDate,
}) {
  const db = await getDatabase();

  const person = await db.getFirstAsync(
    `
      SELECT
        p.id,
        p.user_id,
        p.active
      FROM people p
      WHERE p.id = ?
    `,
    personId
  );

  if (!person || person.active !== 1) {
    return false;
  }

  const absent = await db.getFirstAsync(
    `
      SELECT id
      FROM absences
      WHERE person_id = ?
        AND start_date <= ?
        AND end_date >= ?
      LIMIT 1
    `,
    personId,
    occurrenceDate,
    occurrenceDate
  );

  if (absent) {
    return false;
  }

  if (roleId) {
    const hasRole = await db.getFirstAsync(
      `
        SELECT 1
        FROM person_roles
        WHERE person_id = ?
          AND role_id = ?
      `,
      personId,
      roleId
    );

    if (!hasRole) {
      return false;
    }
  }

  const alreadyAssigned = await db.getFirstAsync(
    `
      SELECT 1
      FROM presentation_members
      WHERE presentation_id = ?
        AND person_id = ?
    `,
    presentationId,
    personId
  );

  return !alreadyAssigned;
}

export async function recordAssignment({
  personId,
  presentationId,
  roleId = null,
}) {
  const db = await getDatabase();

  await db.runAsync(
    `
      INSERT INTO assignment_history (
        person_id,
        presentation_id,
        role_id,
        action
      )
      VALUES (?, ?, ?, 'assigned')
    `,
    personId,
    presentationId,
    roleId
  );
}

export async function recordRemoval({
  personId,
  presentationId,
  roleId = null,
}) {
  const db = await getDatabase();

  await db.runAsync(
    `
      INSERT INTO assignment_history (
        person_id,
        presentation_id,
        role_id,
        action
      )
      VALUES (?, ?, ?, 'removed')
    `,
    personId,
    presentationId,
    roleId
  );
}

export async function getPersonAssignmentHistory(personId, limit = 50) {
  const db = await getDatabase();

  return db.getAllAsync(
    `
      SELECT
        ah.*,
        p.title AS presentation_title,
        eo.occurrence_date,
        eo.start_time AS occurrence_start_time,
        r.name AS role_name
      FROM assignment_history ah
      LEFT JOIN presentations p
        ON p.id = ah.presentation_id
      LEFT JOIN event_occurrences eo
        ON eo.id = p.occurrence_id
      LEFT JOIN roles r
        ON r.id = ah.role_id
      WHERE ah.person_id = ?
      ORDER BY ah.created_at DESC
      LIMIT ?
    `,
    personId,
    limit
  );
}
