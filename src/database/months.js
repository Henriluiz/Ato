import { getDatabase } from './database';

export async function buscarMesesDoEvento(eventId) {

    const db = await getDatabase();

    const meses = await db.getAllAsync(
        `
        SELECT *
        FROM event_months
        WHERE event_id = ?
        ORDER BY year ASC, month ASC
        `,
        eventId
    );

    return meses;
}
export async function criarMesDoEvento(
    eventId,
    year,
    month
) {

    const db = await getDatabase();

    const result = await db.runAsync(
        `
        INSERT INTO event_months (
            event_id,
            year,
            month
        )
        VALUES (?, ?, ?)
        `,
        eventId,
        year,
        month
    );

    return result.lastInsertRowId;
}