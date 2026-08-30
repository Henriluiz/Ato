import { getDatabase } from '../database';

export async function listPeople(userId, { activeOnly = false, search = '' } = {}) {
  const db = await getDatabase();

  const params = [userId];
  let sql = `
    SELECT *
    FROM people
    WHERE user_id = ?
  `;

  if (activeOnly) {
    sql += ` AND active = 1`;
  }

  if (search.trim()) {
    sql += ` AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)`;
    const term = `%${search.trim()}%`;
    params.push(term, term, term);
  }

  sql += ` ORDER BY name COLLATE NOCASE ASC`;

  return db.getAllAsync(sql, ...params);
}

export async function getPersonById(personId, userId) {
  const db = await getDatabase();

  return db.getFirstAsync(
    `
      SELECT *
      FROM people
      WHERE id = ?
        AND user_id = ?
    `,
    personId,
    userId
  );
}

export async function createPerson(userId, data) {
  const db = await getDatabase();

  const result = await db.runAsync(
    `
      INSERT INTO people (
        user_id,
        name,
        email,
        phone,
        active,
        notes
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    userId,
    data.name,
    data.email ?? null,
    data.phone ?? null,
    data.active === false ? 0 : 1,
    data.notes ?? null
  );

  return result.lastInsertRowId;
}

export async function updatePerson(personId, userId, data) {
  const db = await getDatabase();

  await db.runAsync(
    `
      UPDATE people
      SET
        name = ?,
        email = ?,
        phone = ?,
        active = ?,
        notes = ?
      WHERE id = ?
        AND user_id = ?
    `,
    data.name,
    data.email ?? null,
    data.phone ?? null,
    data.active === false ? 0 : 1,
    data.notes ?? null,
    personId,
    userId
  );
}

export async function deletePerson(personId, userId) {
  const db = await getDatabase();

  await db.runAsync(
    `
      DELETE FROM people
      WHERE id = ?
        AND user_id = ?
    `,
    personId,
    userId
  );
}

export async function listRoles(userId) {
  const db = await getDatabase();

  return db.getAllAsync(
    `
      SELECT *
      FROM roles
      WHERE user_id = ?
      ORDER BY name COLLATE NOCASE ASC
    `,
    userId
  );
}

export async function createRole(userId, data) {
  const db = await getDatabase();

  const result = await db.runAsync(
    `
      INSERT INTO roles (user_id, name, description)
      VALUES (?, ?, ?)
    `,
    userId,
    data.name,
    data.description ?? null
  );

  return result.lastInsertRowId;
}

export async function setPersonRoles(personId, roleIds) {
  const db = await getDatabase();

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `DELETE FROM person_roles WHERE person_id = ?`,
      personId
    );

    for (const roleId of roleIds) {
      await db.runAsync(
        `
          INSERT OR IGNORE INTO person_roles (person_id, role_id)
          VALUES (?, ?)
        `,
        personId,
        roleId
      );
    }
  });
}

export async function getPersonRoles(personId) {
  const db = await getDatabase();

  return db.getAllAsync(
    `
      SELECT r.*
      FROM roles r
      INNER JOIN person_roles pr ON pr.role_id = r.id
      WHERE pr.person_id = ?
      ORDER BY r.name COLLATE NOCASE ASC
    `,
    personId
  );
}

export async function listTags(userId) {
  const db = await getDatabase();

  return db.getAllAsync(
    `
      SELECT *
      FROM tags
      WHERE user_id = ?
      ORDER BY name COLLATE NOCASE ASC
    `,
    userId
  );
}

export async function createTag(userId, data) {
  const db = await getDatabase();

  const result = await db.runAsync(
    `
      INSERT INTO tags (user_id, name, description)
      VALUES (?, ?, ?)
    `,
    userId,
    data.name,
    data.description ?? null
  );

  return result.lastInsertRowId;
}

export async function setPersonTags(personId, tagIds) {
  const db = await getDatabase();

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `DELETE FROM person_tags WHERE person_id = ?`,
      personId
    );

    for (const tagId of tagIds) {
      await db.runAsync(
        `
          INSERT OR IGNORE INTO person_tags (person_id, tag_id)
          VALUES (?, ?)
        `,
        personId,
        tagId
      );
    }
  });
}

export async function getPersonTags(personId) {
  const db = await getDatabase();

  return db.getAllAsync(
    `
      SELECT t.*
      FROM tags t
      INNER JOIN person_tags pt ON pt.tag_id = t.id
      WHERE pt.person_id = ?
      ORDER BY t.name COLLATE NOCASE ASC
    `,
    personId
  );
}

export async function addAbsence(personId, data) {
  const db = await getDatabase();

  const result = await db.runAsync(
    `
      INSERT INTO absences (
        person_id,
        start_date,
        end_date,
        reason
      )
      VALUES (?, ?, ?, ?)
    `,
    personId,
    data.startDate,
    data.endDate,
    data.reason ?? null
  );

  return result.lastInsertRowId;
}

export async function listAbsences(personId) {
  const db = await getDatabase();

  return db.getAllAsync(
    `
      SELECT *
      FROM absences
      WHERE person_id = ?
      ORDER BY start_date DESC
    `,
    personId
  );
}

export async function removeAbsence(absenceId, personId) {
  const db = await getDatabase();

  await db.runAsync(
    `
      DELETE FROM absences
      WHERE id = ?
        AND person_id = ?
    `,
    absenceId,
    personId
  );
}
