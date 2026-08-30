import { getDatabase } from '../database';

export async function listSegments(eventId) {
  const db = await getDatabase();

  return db.getAllAsync(
    `
      SELECT *
      FROM segments
      WHERE event_id = ?
      ORDER BY position ASC, name COLLATE NOCASE ASC
    `,
    eventId
  );
}

export async function createSegment(eventId, data) {
  const db = await getDatabase();

  const result = await db.runAsync(
    `
      INSERT INTO segments (event_id, name, description, position)
      VALUES (?, ?, ?, ?)
    `,
    eventId,
    data.name,
    data.description ?? null,
    data.position ?? 0
  );

  return result.lastInsertRowId;
}

export async function listSubcategories(segmentId) {
  const db = await getDatabase();

  return db.getAllAsync(
    `
      SELECT *
      FROM subcategories
      WHERE segment_id = ?
      ORDER BY position ASC, name COLLATE NOCASE ASC
    `,
    segmentId
  );
}

export async function createSubcategory(segmentId, data) {
  const db = await getDatabase();

  const result = await db.runAsync(
    `
      INSERT INTO subcategories (segment_id, name, position)
      VALUES (?, ?, ?)
    `,
    segmentId,
    data.name,
    data.position ?? 0
  );

  return result.lastInsertRowId;
}

export async function listPresentationTypes(eventId) {
  const db = await getDatabase();

  return db.getAllAsync(
    `
      SELECT *
      FROM presentation_types
      WHERE event_id = ?
      ORDER BY position ASC, name COLLATE NOCASE ASC
    `,
    eventId
  );
}

export async function createPresentationType(eventId, data) {
  const db = await getDatabase();

  const result = await db.runAsync(
    `
      INSERT INTO presentation_types (
        event_id,
        name,
        description,
        default_duration_minutes,
        max_members,
        position
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    eventId,
    data.name,
    data.description ?? null,
    data.defaultDurationMinutes ?? null,
    data.maxMembers ?? null,
    data.position ?? 0
  );

  return result.lastInsertRowId;
}

export async function setPresentationTypeRoles(presentationTypeId, roleIds) {
  const db = await getDatabase();

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `
        DELETE FROM presentation_type_roles
        WHERE presentation_type_id = ?
      `,
      presentationTypeId
    );

    for (const roleId of roleIds) {
      await db.runAsync(
        `
          INSERT INTO presentation_type_roles (
            presentation_type_id,
            role_id,
            required
          )
          VALUES (?, ?, 1)
        `,
        presentationTypeId,
        roleId
      );
    }
  });
}

export async function getPresentationTypeRoles(presentationTypeId) {
  const db = await getDatabase();

  return db.getAllAsync(
    `
      SELECT r.*
      FROM roles r
      INNER JOIN presentation_type_roles ptr
        ON ptr.role_id = r.id
      WHERE ptr.presentation_type_id = ?
      ORDER BY r.name COLLATE NOCASE ASC
    `,
    presentationTypeId
  );
}

export async function listPresentations(occurrenceId) {
  const db = await getDatabase();

  return db.getAllAsync(
    `
      SELECT
        p.*,
        pt.name AS presentation_type_name,
        s.name AS segment_name,
        sc.name AS subcategory_name
      FROM presentations p
      LEFT JOIN presentation_types pt
        ON pt.id = p.presentation_type_id
      LEFT JOIN segments s
        ON s.id = p.segment_id
      LEFT JOIN subcategories sc
        ON sc.id = p.subcategory_id
      WHERE p.occurrence_id = ?
      ORDER BY p.position ASC, p.start_time ASC
    `,
    occurrenceId
  );
}

export async function getPresentationById(presentationId) {
  const db = await getDatabase();

  return db.getFirstAsync(
    `
      SELECT *
      FROM presentations
      WHERE id = ?
    `,
    presentationId
  );
}

export async function createPresentation(data) {
  const db = await getDatabase();

  const result = await db.runAsync(
    `
      INSERT INTO presentations (
        occurrence_id,
        segment_id,
        subcategory_id,
        presentation_type_id,
        title,
        start_time,
        duration_minutes,
        position,
        notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    data.occurrenceId,
    data.segmentId ?? null,
    data.subcategoryId ?? null,
    data.presentationTypeId ?? null,
    data.title,
    data.startTime,
    data.durationMinutes,
    data.position ?? 0,
    data.notes ?? null
  );

  return result.lastInsertRowId;
}

export async function updatePresentation(presentationId, data) {
  const db = await getDatabase();

  await db.runAsync(
    `
      UPDATE presentations
      SET
        segment_id = ?,
        subcategory_id = ?,
        presentation_type_id = ?,
        title = ?,
        start_time = ?,
        duration_minutes = ?,
        position = ?,
        notes = ?
      WHERE id = ?
    `,
    data.segmentId ?? null,
    data.subcategoryId ?? null,
    data.presentationTypeId ?? null,
    data.title,
    data.startTime,
    data.durationMinutes,
    data.position ?? 0,
    data.notes ?? null,
    presentationId
  );
}

export async function deletePresentation(presentationId) {
  const db = await getDatabase();

  await db.runAsync(
    `DELETE FROM presentations WHERE id = ?`,
    presentationId
  );
}

export async function listPresentationMembers(presentationId) {
  const db = await getDatabase();

  return db.getAllAsync(
    `
      SELECT
        pm.*,
        p.name AS person_name,
        r.name AS role_name
      FROM presentation_members pm
      INNER JOIN people p ON p.id = pm.person_id
      LEFT JOIN roles r ON r.id = pm.role_id
      WHERE pm.presentation_id = ?
      ORDER BY pm.position ASC, p.name COLLATE NOCASE ASC
    `,
    presentationId
  );
}
