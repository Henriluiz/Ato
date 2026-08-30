import { DATABASE_SCHEMA } from './schema';

const DATABASE_VERSION = 1; // ! Sempre atualizar por próximo núm, em qualquer alteração no banco

export async function runMigrations(db) {
  const result = await db.getFirstAsync('PRAGMA user_version;');
  const currentVersion = Number(result?.user_version ?? 0);

  if (currentVersion < 1) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(DATABASE_SCHEMA);
      await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION};`);
    });
  }

  if (currentVersion > DATABASE_VERSION) {
    throw new Error(
      `Banco de dados (${currentVersion}) é mais novo que o aplicativo (${DATABASE_VERSION}).`
    );
  }
}

export { DATABASE_VERSION };
