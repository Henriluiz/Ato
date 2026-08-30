import * as SQLite from 'expo-sqlite';
import { runMigrations } from './migrations';4
import { seedLocalTemplates } from './local/localSeed';

let dbPromise = null;

export async function getDatabase() {
  if (!dbPromise) {
    dbPromise = openDatabase();
  }

  return dbPromise;
}

async function openDatabase() {
  const db = await SQLite.openDatabaseAsync('desigparts.db');

  await db.execAsync('PRAGMA foreign_keys = ON;');
  await runMigrations(db);

  await seedLocalTemplates(db);

  return db;
}

/**
 * Apenas para desenvolvimento/testes.
 * Apaga o banco local e recria o schema.
 */
export async function resetDatabase() {
  const db = await getDatabase();

  const objects = await db.getAllAsync(`
    SELECT name, type
    FROM sqlite_master
    WHERE name NOT LIKE 'sqlite_%'
    ORDER BY
      CASE type
        WHEN 'trigger' THEN 1
        WHEN 'view' THEN 2
        WHEN 'table' THEN 3
        ELSE 4
      END
  `);

  await db.execAsync('PRAGMA foreign_keys = OFF;');

  try {
    for (const object of objects) {
      await db.execAsync(
        `DROP ${object.type.toUpperCase()} IF EXISTS "${object.name.replace(/"/g, '""')}";`
      );
    }
    await db.execAsync('PRAGMA user_version = 0;');
  } finally {
    await db.execAsync('PRAGMA foreign_keys = ON;');
  }

  await runMigrations(db);
  return db;
}
